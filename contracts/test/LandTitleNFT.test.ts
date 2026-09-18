import { expect } from "chai";
import { ethers } from "hardhat";
import { LandTitleNFT } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * LandTitleNFT — Full test suite
 *
 * Covers the six validation cases required by the Component 2 build gate:
 *   1. Governor-role revocation succeeds
 *   2. Non-Governor revocation reverts
 *   3. Transfer of a revoked token reverts
 *   4. NFT issuance (REGISTRAR_ROLE only)
 *   5. Owner-initiated transfer is blocked
 *   6. Events are emitted correctly
 *
 * Also measures gas cost and confirmation time for revoke() (Table 2B in PROJECT.md).
 */
describe("LandTitleNFT", () => {
  let landTitleNFT: LandTitleNFT;
  let admin: HardhatEthersSigner;
  let registrar: HardhatEthersSigner;
  let governor: HardhatEthersSigner;
  let owner: HardhatEthersSigner;
  let buyer: HardhatEthersSigner;
  let randomUser: HardhatEthersSigner;

  const SAMPLE_PARCEL_ID = "parcel-uuid-test-001";
  const SAMPLE_SPATIAL_HASH = ethers.keccak256(
    ethers.toUtf8Bytes("POLYGON((3.396 6.454, 3.397 6.454, 3.397 6.455, 3.396 6.455, 3.396 6.454))")
  );
  const SAMPLE_TOKEN_URI = "ipfs://QmTestHashForAnaguLandTitle";

  // ── Setup ─────────────────────────────────────────────────────────────
  beforeEach(async () => {
    [admin, registrar, governor, owner, buyer, randomUser] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("LandTitleNFT");
    landTitleNFT = (await Factory.deploy(admin.address)) as LandTitleNFT;
    await landTitleNFT.waitForDeployment();

    // Grant roles
    const REGISTRAR_ROLE = await landTitleNFT.REGISTRAR_ROLE();
    const GOVERNOR_ROLE  = await landTitleNFT.GOVERNOR_ROLE();

    await landTitleNFT.connect(admin).grantRole(REGISTRAR_ROLE, registrar.address);
    await landTitleNFT.connect(admin).grantRole(GOVERNOR_ROLE,  governor.address);
  });

  // ── Helper: issue a title ─────────────────────────────────────────────
  async function issueTitle(to = owner.address): Promise<bigint> {
    const tx = await landTitleNFT.connect(registrar).issueTitle(
      to,
      SAMPLE_PARCEL_ID,
      SAMPLE_SPATIAL_HASH,
      SAMPLE_TOKEN_URI
    );
    const receipt = await tx.wait();
    // tokenId is always 1 on a fresh contract (Counters starts at 0, increments before use)
    return BigInt(1);
  }

  // ════════════════════════════════════════════════════════════════════════
  // BLOCK 1 — NFT Issuance
  // ════════════════════════════════════════════════════════════════════════
  describe("NFT Issuance", () => {
    it("REGISTRAR_ROLE can issue a title", async () => {
      await expect(
        landTitleNFT.connect(registrar).issueTitle(
          owner.address,
          SAMPLE_PARCEL_ID,
          SAMPLE_SPATIAL_HASH,
          SAMPLE_TOKEN_URI
        )
      ).to.not.be.reverted;

      expect(await landTitleNFT.ownerOf(1)).to.equal(owner.address);
    });

    it("non-REGISTRAR cannot issue a title", async () => {
      await expect(
        landTitleNFT.connect(randomUser).issueTitle(
          owner.address,
          SAMPLE_PARCEL_ID,
          SAMPLE_SPATIAL_HASH,
          SAMPLE_TOKEN_URI
        )
      ).to.be.reverted;
    });

    it("stores parcelId and spatialHash on the token", async () => {
      const tokenId = await issueTitle();
      expect(await landTitleNFT.parcelId(tokenId)).to.equal(SAMPLE_PARCEL_ID);
      expect(await landTitleNFT.spatialHash(tokenId)).to.equal(SAMPLE_SPATIAL_HASH);
    });

    it("emits TitleIssued with correct args", async () => {
      await expect(
        landTitleNFT.connect(registrar).issueTitle(
          owner.address,
          SAMPLE_PARCEL_ID,
          SAMPLE_SPATIAL_HASH,
          SAMPLE_TOKEN_URI
        )
      )
        .to.emit(landTitleNFT, "TitleIssued")
        .withArgs(
          BigInt(1),
          owner.address,
          SAMPLE_PARCEL_ID,
          SAMPLE_SPATIAL_HASH,
          (await ethers.provider.getBlock("latest"))!.timestamp + 1
        );
    });

    it("reverts on zero owner address", async () => {
      await expect(
        landTitleNFT.connect(registrar).issueTitle(
          ethers.ZeroAddress,
          SAMPLE_PARCEL_ID,
          SAMPLE_SPATIAL_HASH,
          SAMPLE_TOKEN_URI
        )
      ).to.be.revertedWith("LandTitleNFT: zero owner address");
    });

    it("increments totalSupply on each issuance", async () => {
      expect(await landTitleNFT.totalSupply()).to.equal(0);
      await issueTitle();
      expect(await landTitleNFT.totalSupply()).to.equal(1);
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // BLOCK 2 — Transfer Control
  // ════════════════════════════════════════════════════════════════════════
  describe("Transfer control", () => {
    let tokenId: bigint;

    beforeEach(async () => {
      tokenId = await issueTitle();
    });

    it("REGISTRAR_ROLE can transfer a title", async () => {
      await expect(
        landTitleNFT.connect(registrar).transferFrom(owner.address, buyer.address, tokenId)
      ).to.not.be.reverted;
      expect(await landTitleNFT.ownerOf(tokenId)).to.equal(buyer.address);
    });

    it("owner cannot directly transfer their own title (Table 2A — owner-initiated attempts rejected)", async () => {
      await expect(
        landTitleNFT.connect(owner).transferFrom(owner.address, buyer.address, tokenId)
      ).to.be.reverted;
    });

    it("random user cannot transfer a title", async () => {
      await expect(
        landTitleNFT.connect(randomUser).transferFrom(owner.address, buyer.address, tokenId)
      ).to.be.reverted;
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // BLOCK 3 — Statutory Revocation (Component 2, Part C)
  // Required test cases for Table 2B in PROJECT.md
  // ════════════════════════════════════════════════════════════════════════
  describe("Statutory revocation", () => {
    let tokenId: bigint;

    beforeEach(async () => {
      tokenId = await issueTitle();
    });

    // ── Case 1: Governor-role revocation succeeds (Table 2B row 1) ───────
    it("[Table 2B row 1] allows the Governor-role address to revoke a title", async () => {
      await landTitleNFT.connect(governor).revoke(tokenId, 0); // 0 = OverridingPublicInterest
      expect(await landTitleNFT.isRevoked(tokenId)).to.equal(true);
    });

    // ── Case 2: Non-Governor revocation reverts (Table 2B row 2) ─────────
    it("[Table 2B row 2] reverts when a non-Governor address attempts to revoke", async () => {
      await expect(
        landTitleNFT.connect(randomUser).revoke(tokenId, 0)
      ).to.be.reverted;
    });

    it("[Table 2B row 2] reverts when the owner themselves attempts to revoke", async () => {
      await expect(
        landTitleNFT.connect(owner).revoke(tokenId, 0)
      ).to.be.reverted;
    });

    it("[Table 2B row 2] reverts when the registrar attempts to revoke", async () => {
      await expect(
        landTitleNFT.connect(registrar).revoke(tokenId, 0)
      ).to.be.reverted;
    });

    // ── Case 3: Transfer of a revoked token reverts (Table 2B row 3) ─────
    it("[Table 2B row 3] reverts any transfer attempt on a revoked token", async () => {
      await landTitleNFT.connect(governor).revoke(tokenId, 1); // 1 = BreachOfStatutoryCondition
      await expect(
        landTitleNFT.connect(registrar).transferFrom(owner.address, buyer.address, tokenId)
      ).to.be.revertedWith("LandTitleNFT: token is revoked");
    });

    // ── Additional revocation tests ───────────────────────────────────────
    it("reverts on double-revocation", async () => {
      await landTitleNFT.connect(governor).revoke(tokenId, 0);
      await expect(
        landTitleNFT.connect(governor).revoke(tokenId, 0)
      ).to.be.revertedWith("LandTitleNFT: already revoked");
    });

    it("reverts revocation of a non-existent token", async () => {
      await expect(
        landTitleNFT.connect(governor).revoke(BigInt(9999), 0)
      ).to.be.revertedWith("LandTitleNFT: token does not exist");
    });

    it("emits TitleRevoked event with correct ground (OverridingPublicInterest)", async () => {
      await expect(landTitleNFT.connect(governor).revoke(tokenId, 0))
        .to.emit(landTitleNFT, "TitleRevoked")
        .withArgs(tokenId, 0, governor.address, await getNextTimestamp());
    });

    it("emits TitleRevoked event with correct ground (BreachOfStatutoryCondition)", async () => {
      await expect(landTitleNFT.connect(governor).revoke(tokenId, 1))
        .to.emit(landTitleNFT, "TitleRevoked")
        .withArgs(tokenId, 1, governor.address, await getNextTimestamp());
    });

    // ── Gas cost measurement (Table 2B — gas cost row) ───────────────────
    it("[Table 2B] measures gas cost of revoke() call", async () => {
      const tx = await landTitleNFT.connect(governor).revoke(tokenId, 0);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed;
      console.log(`\n  📊 Gas used for revoke(): ${gasUsed.toString()} gas`);
      console.log(`     → Record this in Table 2B of PROJECT.md\n`);
      expect(gasUsed).to.be.gt(0);
    });

    // ── Confirmation time measurement (Table 2B — confirmation time row) ─
    it("[Table 2B] measures confirmation time of revoke() call", async () => {
      const start = Date.now();
      const tx = await landTitleNFT.connect(governor).revoke(tokenId, 0);
      await tx.wait();
      const elapsed = Date.now() - start;
      console.log(`\n  📊 revoke() confirmation time: ${elapsed}ms`);
      console.log(`     → This is also the T_contract figure for Component 4 latency table.\n`);
      expect(elapsed).to.be.gt(0);
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // BLOCK 4 — Metadata and URI
  // ════════════════════════════════════════════════════════════════════════
  describe("Metadata", () => {
    it("returns correct tokenURI", async () => {
      await issueTitle();
      expect(await landTitleNFT.tokenURI(BigInt(1))).to.equal(SAMPLE_TOKEN_URI);
    });

    it("supports ERC-721 interface", async () => {
      expect(await landTitleNFT.supportsInterface("0x80ac58cd")).to.equal(true);
    });

    it("supports AccessControl interface", async () => {
      expect(await landTitleNFT.supportsInterface("0x7965db0b")).to.equal(true);
    });
  });
});

// ── Utility ────────────────────────────────────────────────────────────────
async function getNextTimestamp(): Promise<number> {
  const block = await ethers.provider.getBlock("latest");
  return block!.timestamp + 1;
}
