import { expect } from "chai";
import { ethers } from "hardhat";
import { LandTitleNFT, LandRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("LandRegistry", () => {
  let landTitleNFT: LandTitleNFT;
  let landRegistry: LandRegistry;
  let admin: HardhatEthersSigner;
  let registrar: HardhatEthersSigner;
  let governor: HardhatEthersSigner;
  let owner: HardhatEthersSigner;
  let buyer: HardhatEthersSigner;
  let randomUser: HardhatEthersSigner;

  const PARCEL_ID     = "parcel-registry-test-001";
  const SPATIAL_HASH  = ethers.keccak256(ethers.toUtf8Bytes("POLYGON((3.396 6.454,...))"));
  const TOKEN_URI     = "ipfs://QmRegistryTestHash";

  beforeEach(async () => {
    [admin, registrar, governor, owner, buyer, randomUser] = await ethers.getSigners();

    // Deploy NFT contract
    const NFTFactory = await ethers.getContractFactory("LandTitleNFT");
    landTitleNFT = (await NFTFactory.deploy(admin.address)) as LandTitleNFT;
    await landTitleNFT.waitForDeployment();

    // Deploy Registry
    const RegistryFactory = await ethers.getContractFactory("LandRegistry");
    landRegistry = (await RegistryFactory.deploy(
      await landTitleNFT.getAddress(),
      admin.address
    )) as LandRegistry;
    await landRegistry.waitForDeployment();

    // Grant roles
    const REGISTRAR_ROLE = await landTitleNFT.REGISTRAR_ROLE();
    const GOVERNOR_ROLE  = await landTitleNFT.GOVERNOR_ROLE();

    // Registry contract needs REGISTRAR_ROLE on the NFT contract
    await landTitleNFT.connect(admin).grantRole(REGISTRAR_ROLE, await landRegistry.getAddress());
    // Grant external registrar role on the registry
    await landRegistry.connect(admin).grantRole(
      await landRegistry.REGISTRAR_ROLE(), registrar.address
    );
    // Also grant on NFT for direct tests
    await landTitleNFT.connect(admin).grantRole(REGISTRAR_ROLE, registrar.address);
    // Governor
    await landTitleNFT.connect(admin).grantRole(GOVERNOR_ROLE, governor.address);
  });

  describe("registerTitle", () => {
    it("REGISTRAR_ROLE can register a new title", async () => {
      const tx = await landRegistry.connect(registrar).registerTitle(
        owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI
      );
      const receipt = await tx.wait();
      expect(receipt!.status).to.equal(1);
    });

    it("emits RegistrationRecorded event", async () => {
      await expect(
        landRegistry.connect(registrar).registerTitle(
          owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI
        )
      ).to.emit(landRegistry, "RegistrationRecorded");
    });

    it("records parcel as registered", async () => {
      await landRegistry.connect(registrar).registerTitle(
        owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI
      );
      expect(await landRegistry.isParcelRegistered(PARCEL_ID)).to.equal(true);
    });

    it("reverts on duplicate parcel registration", async () => {
      await landRegistry.connect(registrar).registerTitle(
        owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI
      );
      await expect(
        landRegistry.connect(registrar).registerTitle(
          owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI
        )
      ).to.be.revertedWith("LandRegistry: parcel already registered");
    });

    it("non-registrar cannot register", async () => {
      await expect(
        landRegistry.connect(randomUser).registerTitle(
          owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI
        )
      ).to.be.reverted;
    });

    it("returns the correct tokenId in the registry record", async () => {
      await landRegistry.connect(registrar).registerTitle(
        owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI
      );
      const record = await landRegistry.getRecordByParcelId(PARCEL_ID);
      expect(record.tokenId).to.equal(BigInt(1));
      expect(record.owner).to.equal(owner.address);
    });
  });

  describe("transferTitle", () => {
    let tokenId: bigint;

    beforeEach(async () => {
      await landRegistry.connect(registrar).registerTitle(
        owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI
      );
      tokenId = BigInt(1);
    });

    it("REGISTRAR_ROLE can transfer a title to a new owner", async () => {
      await landRegistry.connect(registrar).transferTitle(tokenId, owner.address, buyer.address);
      expect(await landTitleNFT.ownerOf(tokenId)).to.equal(buyer.address);
    });

    it("emits TransferRecorded event", async () => {
      await expect(
        landRegistry.connect(registrar).transferTitle(tokenId, owner.address, buyer.address)
      ).to.emit(landRegistry, "TransferRecorded")
        .withArgs(tokenId, owner.address, buyer.address, await getNextTimestamp());
    });

    it("updates ownership record after transfer", async () => {
      await landRegistry.connect(registrar).transferTitle(tokenId, owner.address, buyer.address);
      const record = await landRegistry.getRecordByParcelId(PARCEL_ID);
      expect(record.owner).to.equal(buyer.address);
    });

    it("non-registrar cannot initiate transfer", async () => {
      await expect(
        landRegistry.connect(randomUser).transferTitle(tokenId, owner.address, buyer.address)
      ).to.be.reverted;
    });

    it("owner cannot directly initiate transfer (Table 2A — owner-initiated rejected)", async () => {
      await expect(
        landTitleNFT.connect(owner).transferFrom(owner.address, buyer.address, tokenId)
      ).to.be.reverted;
    });
  });

  describe("Integration: revocation blocks registry transfer", () => {
    it("revoked title cannot be transferred even by registrar", async () => {
      await landRegistry.connect(registrar).registerTitle(
        owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI
      );
      await landTitleNFT.connect(governor).revoke(BigInt(1), 0);
      await expect(
        landRegistry.connect(registrar).transferTitle(BigInt(1), owner.address, buyer.address)
      ).to.be.revertedWith("LandTitleNFT: token is revoked");
    });
  });
});

async function getNextTimestamp(): Promise<number> {
  const block = await ethers.provider.getBlock("latest");
  return block!.timestamp + 1;
}
