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
 *
 *  1. Owner-initiated transfers are DISABLED.
 *     All transfers must be initiated by an address holding REGISTRAR_ROLE.
 *     We bypass the ERC-721 approval gate by calling _transfer() directly,
 *     because the registrar acts as the institutional authority — not a
 *     peer-to-peer marketplace participant.
 *
 *  2. Statutory revocation restricted to GOVERNOR_ROLE only, on the two
 *     grounds defined by Nigeria's Land Use Act (1978), Section 28:
 *       - OverridingPublicInterest
 *       - BreachOfStatutoryCondition
 *
 *  3. Revocation is an immutable on-chain EVENT supplementing the original
 *     issuance record — the issuance record is never overwritten.
 *
 *  4. Revoked tokens cannot be transferred (enforced in _beforeTokenTransfer).
 */
contract LandTitleNFT is ERC721, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;

    // ── Roles ──────────────────────────────────────────────────────────────
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant GOVERNOR_ROLE  = keccak256("GOVERNOR_ROLE");

    // ── Revocation grounds (Land Use Act 1978, s.28) ───────────────────────
    enum RevocationGround {
        OverridingPublicInterest,    // 0
        BreachOfStatutoryCondition   // 1
    }

    // ── State ──────────────────────────────────────────────────────────────
    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => bool)    public isRevoked;
    mapping(uint256 => bytes32) public spatialHash; // keccak256 of parcel WKT
    mapping(uint256 => string)  public parcelId;    // off-chain parcel UUID

    // ── Events ─────────────────────────────────────────────────────────────
    event TitleIssued(
        uint256 indexed tokenId,
        address indexed owner,
        string  parcelId,
        bytes32 spatialHash,
        uint256 timestamp
    );

    event TitleRevoked(
        uint256 indexed tokenId,
        RevocationGround ground,
        address indexed revokedBy,
        uint256 timestamp
    );

    // ── Constructor ────────────────────────────────────────────────────────
    constructor(address adminAddress) ERC721("AnaguLandTitle", "ALT") {
        require(adminAddress != address(0), "LandTitleNFT: zero admin address");
        _grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _grantRole(REGISTRAR_ROLE,     adminAddress);
    }

    // ── Issuance ───────────────────────────────────────────────────────────
    function issueTitle(
        address        to,
        string calldata _parcelId,
        bytes32         _spatialHash,
        string calldata _tokenURI
    ) external onlyRole(REGISTRAR_ROLE) returns (uint256 tokenId) {
        require(to != address(0),            "LandTitleNFT: zero owner address");
        require(bytes(_parcelId).length > 0, "LandTitleNFT: empty parcel ID");
        require(_spatialHash != bytes32(0),  "LandTitleNFT: zero spatial hash");

        _tokenIdCounter.increment();
        tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        spatialHash[tokenId] = _spatialHash;
        parcelId[tokenId]    = _parcelId;

        emit TitleIssued(tokenId, to, _parcelId, _spatialHash, block.timestamp);
    }

    // ── Statutory revocation (LUA 1978, s.28) ──────────────────────────────
    function revoke(uint256 tokenId, RevocationGround ground)
        external
        onlyRole(GOVERNOR_ROLE)
    {
        require(_exists(tokenId),    "LandTitleNFT: token does not exist");
        require(!isRevoked[tokenId], "LandTitleNFT: already revoked");

        isRevoked[tokenId] = true;
        emit TitleRevoked(tokenId, ground, msg.sender, block.timestamp);
    }

    // ── Registry-controlled transfer ───────────────────────────────────────
    /**
     * @dev  The REGISTRAR calls _transfer() directly, bypassing ERC-721's
     *       _isApprovedOrOwner() check.  This is intentional: the land
     *       registry is the institutional authority and does not need the
     *       owner's per-token approval to execute a lawful title transfer.
     *
     *       Any direct call to transferFrom / safeTransferFrom by a
     *       non-REGISTRAR address (including the owner) is rejected.
     */
    function registrarTransfer(address from, address to, uint256 tokenId)
        external
        onlyRole(REGISTRAR_ROLE)
    {
        require(to != address(0), "LandTitleNFT: transfer to zero address");
        _transfer(from, to, tokenId); // _beforeTokenTransfer checks isRevoked
    }

    // ── Block ALL direct ERC-721 transfer calls from non-registrars ────────
    function transferFrom(address from, address to, uint256 tokenId)
        public
        override(ERC721, IERC721)
    {
        // Only the REGISTRAR can initiate transfers — not the owner, not approved
        require(hasRole(REGISTRAR_ROLE, msg.sender), "LandTitleNFT: only REGISTRAR can transfer");
        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId)
        public
        override(ERC721, IERC721)
    {
        require(hasRole(REGISTRAR_ROLE, msg.sender), "LandTitleNFT: only REGISTRAR can transfer");
        _safeTransfer(from, to, tokenId, "");
    }

    function safeTransferFrom(
        address from, address to, uint256 tokenId, bytes memory data
    ) public override(ERC721, IERC721) {
        require(hasRole(REGISTRAR_ROLE, msg.sender), "LandTitleNFT: only REGISTRAR can transfer");
        _safeTransfer(from, to, tokenId, data);
    }

    // ── _beforeTokenTransfer: block revoked token transfers ────────────────
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(!isRevoked[tokenId], "LandTitleNFT: token is revoked");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    // ── View helpers ────────────────────────────────────────────────────────
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // ── Required OZ overrides ───────────────────────────────────────────────
    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory)
    { return super.tokenURI(tokenId); }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool)
    { return super.supportsInterface(interfaceId); }

    function _burn(uint256 tokenId)
        internal override(ERC721, ERC721URIStorage)
    { super._burn(tokenId); }
}
