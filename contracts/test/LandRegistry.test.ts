import { expect } from "chai";
import { ethers } from "hardhat";
import { LandTitleNFT, LandRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("LandRegistry", () => {
  let nft:      LandTitleNFT;
  let registry: LandRegistry;
  let admin:      HardhatEthersSigner;
  let registrar:  HardhatEthersSigner;
  let governor:   HardhatEthersSigner;
  let owner:      HardhatEthersSigner;
  let buyer:      HardhatEthersSigner;
  let randomUser: HardhatEthersSigner;

  const PARCEL_ID    = "parcel-registry-test-001";
  const SPATIAL_HASH = ethers.keccak256(ethers.toUtf8Bytes("POLYGON((3.396 6.454,...))"));
  const TOKEN_URI    = "ipfs://QmRegistryTestHash";

  beforeEach(async () => {
    [admin, registrar, governor, owner, buyer, randomUser] = await ethers.getSigners();

    const NFTFactory = await ethers.getContractFactory("LandTitleNFT");
    nft = (await NFTFactory.deploy(admin.address)) as LandTitleNFT;
    await nft.waitForDeployment();

    const RegFactory = await ethers.getContractFactory("LandRegistry");
    registry = (await RegFactory.deploy(await nft.getAddress(), admin.address)) as LandRegistry;
    await registry.waitForDeployment();

    // Grant registry contract REGISTRAR_ROLE on the NFT
    await nft.connect(admin).grantRole(await nft.REGISTRAR_ROLE(), await registry.getAddress());
    // Grant registrar signer REGISTRAR_ROLE on the registry
    await registry.connect(admin).grantRole(await registry.REGISTRAR_ROLE(), registrar.address);
    // Grant governor GOVERNOR_ROLE on the NFT
    await nft.connect(admin).grantRole(await nft.GOVERNOR_ROLE(), governor.address);
  });

  describe("registerTitle", () => {
    it("REGISTRAR_ROLE can register a title", async () => {
      await expect(
        registry.connect(registrar).registerTitle(owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI)
      ).to.not.be.reverted;
    });

    it("emits RegistrationRecorded", async () => {
      await expect(
        registry.connect(registrar).registerTitle(owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI)
      ).to.emit(registry, "RegistrationRecorded");
    });

    it("marks parcel as registered", async () => {
      await registry.connect(registrar).registerTitle(owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI);
      expect(await registry.isParcelRegistered(PARCEL_ID)).to.equal(true);
    });

    it("reverts on duplicate parcel registration", async () => {
      await registry.connect(registrar).registerTitle(owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI);
      await expect(
        registry.connect(registrar).registerTitle(owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI)
      ).to.be.revertedWith("LandRegistry: parcel already registered");
    });

    it("non-registrar cannot register", async () => {
      await expect(
        registry.connect(randomUser).registerTitle(owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI)
      ).to.be.reverted;
    });

    it("getRecordByParcelId returns correct tokenId and owner", async () => {
      await registry.connect(registrar).registerTitle(owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI);
      const record = await registry.getRecordByParcelId(PARCEL_ID);
      expect(record.tokenId).to.equal(1n);
      expect(record.owner).to.equal(owner.address);
    });
  });

  describe("transferTitle", () => {
    beforeEach(async () => {
      await registry.connect(registrar).registerTitle(owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI);
    });

    it("REGISTRAR_ROLE can transfer a title", async () => {
      await registry.connect(registrar).transferTitle(1n, owner.address, buyer.address);
      expect(await nft.ownerOf(1n)).to.equal(buyer.address);
    });

    it("emits TransferRecorded", async () => {
      await expect(
        registry.connect(registrar).transferTitle(1n, owner.address, buyer.address)
      ).to.emit(registry, "TransferRecorded");
    });

    it("updates ownership record after transfer", async () => {
      await registry.connect(registrar).transferTitle(1n, owner.address, buyer.address);
      const record = await registry.getRecordByParcelId(PARCEL_ID);
      expect(record.owner).to.equal(buyer.address);
    });

    it("non-registrar cannot transfer", async () => {
      await expect(
        registry.connect(randomUser).transferTitle(1n, owner.address, buyer.address)
      ).to.be.reverted;
    });

    it("[Table 2A] owner cannot directly transfer their title", async () => {
      await expect(
        nft.connect(owner).transferFrom(owner.address, buyer.address, 1n)
      ).to.be.revertedWith("LandTitleNFT: only REGISTRAR can transfer");
    });
  });

  describe("Integration: revocation blocks transfer", () => {
    it("revoked title cannot be transferred by registrar either", async () => {
      await registry.connect(registrar).registerTitle(owner.address, PARCEL_ID, SPATIAL_HASH, TOKEN_URI);
      await nft.connect(governor).revoke(1n, 0);
      await expect(
        registry.connect(registrar).transferTitle(1n, owner.address, buyer.address)
      ).to.be.revertedWith("LandTitleNFT: token is revoked");
    });
  });
});
