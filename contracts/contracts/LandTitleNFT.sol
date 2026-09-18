// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title  LandTitleNFT
 * @notice ERC-721 land title token for the Anagu Land Administration Framework.
 *
 * @dev    Key design decisions:
 *         - Owner-initiated transfers are DISABLED. All transfers must go through
 *           an address holding REGISTRAR_ROLE (the land registry process).
 *         - Statutory revocation is restricted to GOVERNOR_ROLE only, on two
 *           grounds defined by Nigeria's Land Use Act (1978), Section 28.
 *         - Revocation is recorded as an immutable on-chain EVENT, not a field
 *           update — the original issuance record is never overwritten.
 *         - Revoked tokens cannot be transferred.
 *
 * @dev    NFT metadata fields (per token):
 *         - tokenId:       unique on-chain identifier
 *         - parcelId:      off-chain UUID of the land parcel
 *         - spatialHash:   keccak256 of the parcel's WKT polygon geometry
 *         - tokenURI:      link to full metadata (IPFS or MinIO)
 *         - txHash:        recorded off-chain via TitleIssued event
 */
contract LandTitleNFT is ERC721, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;

    // ── Role constants ─────────────────────────────────────────────────────
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant GOVERNOR_ROLE  = keccak256("GOVERNOR_ROLE");

    // ── Statutory revocation grounds (Land Use Act 1978, s.28) ───────────
    enum RevocationGround {
        OverridingPublicInterest,       // 0
        BreachOfStatutoryCondition      // 1
    }

    // ── Token counters and state ───────────────────────────────────────────
    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => bool)    public isRevoked;
    mapping(uint256 => bytes32) public spatialHash;  // keccak256 of parcel WKT
    mapping(uint256 => string)  public parcelId;     // off-chain parcel UUID

    // ── Events ────────────────────────────────────────────────────────────
    /**
     * @dev Emitted when a new land title NFT is issued.
     *      The txHash is available from the transaction receipt off-chain.
     */
    event TitleIssued(
        uint256 indexed tokenId,
        address indexed owner,
        string  parcelId,
        bytes32 spatialHash,
        uint256 timestamp
    );

    /**
     * @dev Emitted on statutory revocation. This event is the permanent
     *      on-chain record of the revocation — it supplements, not replaces,
     *      the original TitleIssued event.
     */
    event TitleRevoked(
        uint256 indexed tokenId,
        RevocationGround ground,
        address indexed revokedBy,
        uint256 timestamp
    );

    // ── Constructor ───────────────────────────────────────────────────────
    constructor(address adminAddress) ERC721("AnaguLandTitle", "ALT") {
        require(adminAddress != address(0), "LandTitleNFT: zero admin address");
        _grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _grantRole(REGISTRAR_ROLE,     adminAddress);
    }

    // ── Title issuance ─────────────────────────────────────────────────────
    /**
     * @notice Issue a new land title NFT.
     * @dev    Only callable by REGISTRAR_ROLE. The application must have
     *         already passed spatial and ownership verification off-chain.
     * @param  to          Address of the new titleholder.
     * @param  _parcelId   UUID of the off-chain land parcel record.
     * @param  _spatialHash keccak256 hash of the parcel's WKT polygon.
     * @param  _tokenURI   Metadata URI (IPFS CID or MinIO presigned URL).
     * @return tokenId     The newly minted ERC-721 token ID.
     */
    function issueTitle(
        address        to,
        string calldata _parcelId,
        bytes32         _spatialHash,
        string calldata _tokenURI
    ) external onlyRole(REGISTRAR_ROLE) returns (uint256 tokenId) {
        require(to != address(0),              "LandTitleNFT: zero owner address");
        require(bytes(_parcelId).length > 0,   "LandTitleNFT: empty parcel ID");
        require(_spatialHash != bytes32(0),    "LandTitleNFT: zero spatial hash");

        _tokenIdCounter.increment();
        tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        spatialHash[tokenId] = _spatialHash;
        parcelId[tokenId]    = _parcelId;

        emit TitleIssued(tokenId, to, _parcelId, _spatialHash, block.timestamp);
    }

    // ── Statutory revocation (Land Use Act 1978, s.28) ────────────────────
    /**
     * @notice Revoke a land title on a statutory ground.
     * @dev    Restricted to GOVERNOR_ROLE. Valid grounds are defined by
     *         Nigeria's Land Use Act (1978), Section 28:
     *         0 = OverridingPublicInterest
     *         1 = BreachOfStatutoryCondition
     *
     *         This is a distinct executive act. A judicial dispute-resolution
     *         mechanism does NOT satisfy this requirement, even if it results
     *         in a title change.
     *
     * @param  tokenId  The ERC-721 token ID to revoke.
     * @param  ground   The statutory ground for revocation.
     */
    function revoke(uint256 tokenId, RevocationGround ground)
        external
        onlyRole(GOVERNOR_ROLE)
    {
        require(_exists(tokenId),       "LandTitleNFT: token does not exist");
        require(!isRevoked[tokenId],    "LandTitleNFT: already revoked");

        isRevoked[tokenId] = true;

        emit TitleRevoked(tokenId, ground, msg.sender, block.timestamp);
    }

    // ── Transfer guards ───────────────────────────────────────────────────

    /**
     * @dev Block ALL transfers of revoked tokens.
     *      OpenZeppelin v4 hook — use _update() on OZ v5.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(!isRevoked[tokenId], "LandTitleNFT: token is revoked");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Block owner-initiated transferFrom.
     *      Only REGISTRAR_ROLE may call transfer functions.
     */
    function transferFrom(address from, address to, uint256 tokenId)
        public
        override(ERC721, IERC721)
        onlyRole(REGISTRAR_ROLE)
    {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId)
        public
        override(ERC721, IERC721)
        onlyRole(REGISTRAR_ROLE)
    {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override(ERC721, IERC721) onlyRole(REGISTRAR_ROLE) {
        super.safeTransferFrom(from, to, tokenId, data);
    }

    // ── View helpers ─────────────────────────────────────────────────────
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // ── Required OpenZeppelin overrides ───────────────────────────────────
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }
}
