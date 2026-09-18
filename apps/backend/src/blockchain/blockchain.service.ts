import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { LandTitle } from './entities/land-title.entity';
import { AuditService } from '../audit/audit.service';
import { MqttService } from '../mqtt/mqtt.service';

// ABI fragments — only what the backend needs to call
const LAND_REGISTRY_ABI = [
  'function registerTitle(address owner, string parcelId, bytes32 spatialHash, string tokenURI) external returns (uint256)',
  'function transferTitle(uint256 tokenId, address from, address to) external',
  'event RegistrationRecorded(uint256 indexed tokenId, string parcelId, address indexed owner, uint256 timestamp)',
];

const LAND_TITLE_NFT_ABI = [
  'function revoke(uint256 tokenId, uint8 ground) external',
  'function isRevoked(uint256 tokenId) external view returns (bool)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function totalSupply() external view returns (uint256)',
  'event TitleRevoked(uint256 indexed tokenId, uint8 ground, address indexed revokedBy, uint256 timestamp)',
];

/**
 * Component 2 — Blockchain NFT Tokenisation and Statutory Revocation
 *
 * Parts A, B, C from PROJECT.md:
 *  A: Smart contract execution (issuing/updating records)
 *  B: NFT title issuance
 *  C: Statutory revocation (Governor-role only, LUA 1978 s.28)
 */
@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider!: ethers.JsonRpcProvider;
  private registrarWallet!: ethers.Wallet;
  private governorWallet!: ethers.Wallet;
  private landRegistry!: ethers.Contract;
  private landTitleNFT!: ethers.Contract;

  constructor(
    @InjectRepository(LandTitle)
    private readonly titleRepo: Repository<LandTitle>,
    private readonly config: ConfigService,
    private readonly auditService: AuditService,
    private readonly mqttService: MqttService,
  ) {
    this.initialiseContracts();
  }

  private initialiseContracts() {
    const rpcUrl = this.config.get<string>('BESU_RPC_URL', 'http://localhost:8545');
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    const deployerKey = this.config.get<string>('DEPLOYER_PRIVATE_KEY')!;
    this.registrarWallet = new ethers.Wallet(deployerKey, this.provider);

    const registryAddress = this.config.get<string>('LAND_REGISTRY_ADDRESS')!;
    const nftAddress      = this.config.get<string>('LAND_TITLE_NFT_ADDRESS')!;

    this.landRegistry = new ethers.Contract(registryAddress, LAND_REGISTRY_ABI, this.registrarWallet);
    this.landTitleNFT = new ethers.Contract(nftAddress, LAND_TITLE_NFT_ABI, this.registrarWallet);
    this.logger.log(`Blockchain service initialised. Registry=${registryAddress}`);
  }

  // ── Part A + B: Register title and issue NFT ──────────────────────────
  /**
   * Executes registerTitle() on LandRegistry.sol.
   * Records the result on-chain and updates the off-chain DB.
   */
  async issueTitle(params: {
    ownerAddress:   string;
    parcelId:       string;
    spatialHash:    string;   // hex string, e.g. "0xabc..."
    tokenUri:       string;
    applicationId:  string;
    ownerUserId?:   string;
  }): Promise<{ tokenId: string; txHash: string; blockNumber: string }> {
    this.logger.log(`Issuing title for parcel ${params.parcelId}`);

    // Part A — validate against business rules
    const existing = await this.titleRepo.findOne({
      where: { parcelId: params.parcelId, isRevoked: false },
    });
    if (existing) {
      throw new BadRequestException(`Parcel ${params.parcelId} already has an active title`);
    }

    // Part B — execute smart contract
    const spatialHashBytes = params.spatialHash.startsWith('0x')
      ? params.spatialHash
      : '0x' + params.spatialHash;

    const tx = await this.landRegistry.registerTitle(
      params.ownerAddress,
      params.parcelId,
      spatialHashBytes,
      params.tokenUri,
    );
    const receipt = await tx.wait();

    // Parse tokenId from RegistrationRecorded event
    const event = receipt.logs
      .map((log: any) => {
        try { return this.landRegistry.interface.parseLog(log); } catch { return null; }
      })
      .find((e: any) => e?.name === 'RegistrationRecorded');

    const tokenId = event?.args?.tokenId?.toString() ?? '0';

    // Part A — update off-chain database
    const title = this.titleRepo.create({
      tokenId,
      parcelId:      params.parcelId,
      applicationId: params.applicationId,
      ownerAddress:  params.ownerAddress,
      ownerUserId:   params.ownerUserId ?? null,
      txHash:        receipt.hash,
      blockNumber:   receipt.blockNumber?.toString() ?? null,
      tokenUri:      params.tokenUri,
    });
    await this.titleRepo.save(title);

    // Part B — audit trail
    await this.auditService.log({
      entityType:  'title',
      entityId:    title.id,
      eventType:   'NFT_ISSUED',
      fromStatus:  null,
      toStatus:    'NFT_ISSUED',
      actorRole:   'REGISTRAR',
      actorId:     this.registrarWallet.address,
      actorAddress: this.registrarWallet.address,
      metadata:    { tokenId, txHash: receipt.hash },
    });

    // MQTT notification
    await this.mqttService.publishTitleIssued(
      params.applicationId, tokenId,
      params.parcelId, params.ownerAddress, receipt.hash,
    );

    this.logger.log(`Title issued: tokenId=${tokenId}, tx=${receipt.hash}`);
    return { tokenId, txHash: receipt.hash, blockNumber: receipt.blockNumber?.toString() };
  }

  // ── Part C: Statutory revocation (LUA 1978 s.28) ─────────────────────
  /**
   * Invokes revoke() on LandTitleNFT.sol.
   * Only the GOVERNOR_ROLE wallet may call this.
   *
   * Grounds:
   *   0 = OverridingPublicInterest
   *   1 = BreachOfStatutoryCondition
   */
  async revokeTitle(params: {
    tokenId:          string;
    ground:           0 | 1;
    governorPrivKey:  string;  // Must hold GOVERNOR_ROLE on the contract
    requestedBy:      string;  // off-chain user ID for audit
  }): Promise<{ txHash: string; blockNumber: string; gasUsed: string; confirmationMs: number }> {
    this.logger.log(`Revoking title tokenId=${params.tokenId}, ground=${params.ground}`);

    const title = await this.titleRepo.findOne({
      where: { tokenId: params.tokenId },
    });
    if (!title) throw new NotFoundException(`Title tokenId=${params.tokenId} not found`);
    if (title.isRevoked) throw new BadRequestException('Title already revoked');

    // Connect governor wallet
    const governorWallet = new ethers.Wallet(params.governorPrivKey, this.provider);
    const nftAsGovernor  = this.landTitleNFT.connect(governorWallet);

    const start = Date.now();
    const tx = await (nftAsGovernor as any).revoke(BigInt(params.tokenId), params.ground);
    const receipt = await tx.wait();
    const confirmationMs = Date.now() - start;

    // Update off-chain DB
    await this.titleRepo.update(title.id, {
      isRevoked:       true,
      revocationTx:    receipt.hash,
      revocationGround: params.ground === 0
        ? 'OVERRIDING_PUBLIC_INTEREST'
        : 'BREACH_OF_STATUTORY_CONDITION',
      revokedByAddress: governorWallet.address,
      revokedAt:        new Date(),
    });

    // Audit (immutable — revocation is a distinct event, not an overwrite)
    await this.auditService.log({
      entityType:   'title',
      entityId:     title.id,
      eventType:    'TITLE_REVOKED',
      fromStatus:   'NFT_ISSUED',
      toStatus:     'REVOKED',
      actorRole:    'GOVERNOR',
      actorId:      params.requestedBy,
      actorAddress: governorWallet.address,
      metadata:     {
        tokenId: params.tokenId,
        ground:  params.ground,
        txHash:  receipt.hash,
        gasUsed: receipt.gasUsed?.toString(),
        confirmationMs,
      },
    });

    // MQTT notification
    await this.mqttService.publishTitleRevoked(
      params.tokenId, params.ground,
      governorWallet.address, title.parcelId,
    );

    this.logger.log(
      `Title revoked: tokenId=${params.tokenId}, tx=${receipt.hash}, ` +
      `gas=${receipt.gasUsed}, time=${confirmationMs}ms`
    );

    return {
      txHash:        receipt.hash,
      blockNumber:   receipt.blockNumber?.toString(),
      gasUsed:       receipt.gasUsed?.toString(),
      confirmationMs,
    };
  }

  // ── Queries ───────────────────────────────────────────────────────────
  async getTitleByTokenId(tokenId: string): Promise<LandTitle | null> {
    return this.titleRepo.findOne({ where: { tokenId } });
  }

  async getTitleByParcelId(parcelId: string): Promise<LandTitle | null> {
    return this.titleRepo.findOne({ where: { parcelId } });
  }

  async isRevoked(tokenId: string): Promise<boolean> {
    return this.landTitleNFT.isRevoked(BigInt(tokenId));
  }
}
