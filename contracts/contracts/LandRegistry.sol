// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./LandTitleNFT.sol";

/**
 * @title  LandRegistry
 * @notice Manages land title issuance and registry-controlled transfers.
 *         All business-rule validation happens here before calling LandTitleNFT.
 *
 * @dev    This contract is the single entry point for the NestJS backend.
 *         The backend should call registerTitle() and transferTitle() here,
 *         not call LandTitleNFT directly.
 *
 *         Separation of concerns:
 *         - LandTitleNFT: ERC-721 token mechanics + revocation
 *         - LandRegistry: business rules + event log for the registry office
 */
contract LandRegistry is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    LandTitleNFT public immutable landTitleNFT;

    // ── Registry records (off-chain DB mirrors this, but on-chain is canonical) ──
    struct RegistryRecord {
        uint256 tokenId;
        string  parcelId;
        address owner;
        uint256 issuedAt;
        bool    exists;
    }

    mapping(string => RegistryRecord) private _recordsByParcelId;  // parcelId → record
    mapping(uint256 => string)        private _parcelByTokenId;    // tokenId  → parcelId

    // ── Events ────────────────────────────────────────────────────────────
    event RegistrationRecorded(
        uint256 indexed tokenId,
        string  parcelId,
        address indexed owner,
        uint256 timestamp
    );

    event TransferRecorded(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    // ── Constructor ───────────────────────────────────────────────────────
    constructor(address _landTitleNFT, address adminAddress) {
        require(_landTitleNFT != address(0), "LandRegistry: zero NFT address");
        require(adminAddress  != address(0), "LandRegistry: zero admin address");

        landTitleNFT = LandTitleNFT(_landTitleNFT);

        _grantRole(DEFAULT_ADMIN_ROLE, adminAddress);
        _grantRole(REGISTRAR_ROLE,     adminAddress);
    }

    // ── Title registration ────────────────────────────────────────────────
    /**
     * @notice Register a new land title after the application has passed
     *         spatial verification, ownership verification, and registrar approval.
     *
     * @param  owner        Ethereum address of the new titleholder.
     * @param  _parcelId    UUID of the off-chain parcel record.
     * @param  _spatialHash keccak256 of the parcel WKT polygon.
     * @param  _tokenURI    Metadata URI (IPFS or MinIO).
     * @return tokenId      The newly issued ERC-721 token ID.
     */
    function registerTitle(
        address         owner,
        string calldata _parcelId,
        bytes32         _spatialHash,
        string calldata _tokenURI
    ) external onlyRole(REGISTRAR_ROLE) returns (uint256 tokenId) {
        require(
            !_recordsByParcelId[_parcelId].exists,
            "LandRegistry: parcel already registered"
        );

        tokenId = landTitleNFT.issueTitle(owner, _parcelId, _spatialHash, _tokenURI);

        _recordsByParcelId[_parcelId] = RegistryRecord({
            tokenId:  tokenId,
            parcelId: _parcelId,
            owner:    owner,
            issuedAt: block.timestamp,
            exists:   true
        });
        _parcelByTokenId[tokenId] = _parcelId;

        emit RegistrationRecorded(tokenId, _parcelId, owner, block.timestamp);
    }

    // ── Registry-controlled transfer ─────────────────────────────────────
    /**
     * @notice Transfer title ownership through the registry process.
     *         Ownership changes must go through the land office, not direct
     *         peer-to-peer NFT transfers (which are blocked in LandTitleNFT).
     *
     * @param  tokenId  The ERC-721 token to transfer.
     * @param  from     Current owner's Ethereum address.
     * @param  to       New owner's Ethereum address.
     */
    function transferTitle(
        uint256 tokenId,
        address from,
        address to
    ) external onlyRole(REGISTRAR_ROLE) {
        require(to != address(0), "LandRegistry: zero destination address");

        string memory _parcelId = _parcelByTokenId[tokenId];
        require(bytes(_parcelId).length > 0, "LandRegistry: unknown token");

        landTitleNFT.transferFrom(from, to, tokenId);

        _recordsByParcelId[_parcelId].owner = to;

        emit TransferRecorded(tokenId, from, to, block.timestamp);
    }

    // ── View functions ────────────────────────────────────────────────────
    function getRecordByParcelId(string calldata _parcelId)
        external
        view
        returns (RegistryRecord memory)
    {
        return _recordsByParcelId[_parcelId];
    }

    function getParcelIdByTokenId(uint256 tokenId)
        external
        view
        returns (string memory)
    {
        return _parcelByTokenId[tokenId];
    }

    function isParcelRegistered(string calldata _parcelId)
        external
        view
        returns (bool)
    {
        return _recordsByParcelId[_parcelId].exists;
    }
}
