// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IEAS, AttestationRequest, AttestationRequestData } from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";

interface IWorldID {
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}

contract NexusCore {
    using SafeERC20 for IERC20;

    IWorldID public immutable worldId;
    IEAS public immutable eas;
    bytes32 public immutable schemaId;
    uint256 public immutable externalNullifier;
    uint256 public immutable groupId = 1; // 1 for Device-level, 0 for Orb

    struct Bounty {
        uint256 prId;
        address creator;
        IERC20 token;
        uint256 amount;
        uint256 requiredReviews;
        uint256 currentReviews;
        bool isCompleted;
    }

    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => mapping(address => bool)) public hasReviewed;
    // Prevent double verification via World ID nullifier
    mapping(uint256 => bool) public nullifierHashes;

    event BountyCreated(uint256 indexed prId, address indexed creator, uint256 amount, uint256 requiredReviews);
    event ReviewVerified(uint256 indexed prId, address indexed reviewer);
    event BountyCompleted(uint256 indexed prId);

    constructor(IWorldID _worldId, IEAS _eas, bytes32 _schemaId, string memory _appId, string memory _actionId) {
        worldId = _worldId;
        eas = _eas;
        schemaId = _schemaId;
        externalNullifier = abi.decode(abi.encodePacked(keccak256(abi.encodePacked(_appId, _actionId))), (uint256));
    }

    function createBounty(uint256 _prId, IERC20 _token, uint256 _amount, uint256 _requiredReviews) external {
        require(bounties[_prId].creator == address(0), "Bounty already exists for this PR");
        require(_amount > 0, "Amount must be greater than 0");
        require(_requiredReviews > 0, "Requires at least 1 review");

        _token.safeTransferFrom(msg.sender, address(this), _amount);

        bounties[_prId] = Bounty({
            prId: _prId,
            creator: msg.sender,
            token: _token,
            amount: _amount,
            requiredReviews: _requiredReviews,
            currentReviews: 0,
            isCompleted: false
        });

        emit BountyCreated(_prId, msg.sender, _amount, _requiredReviews);
    }

    function submitReview(
        uint256 _prId, 
        address _reviewer,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        Bounty storage bounty = bounties[_prId];
        require(bounty.creator != address(0), "Bounty does not exist");
        require(!bounty.isCompleted, "Bounty already completed");
        require(!hasReviewed[_prId][_reviewer], "Already reviewed");
        require(!nullifierHashes[nullifierHash], "World ID proof already used");

        // 1. World ID Verification
        worldId.verifyProof(
            root,
            groupId,
            abi.decode(abi.encodePacked(keccak256(abi.encodePacked(_reviewer))), (uint256)),
            nullifierHash,
            externalNullifier,
            proof
        );
        nullifierHashes[nullifierHash] = true;

        // 2. Update state
        hasReviewed[_prId][_reviewer] = true;
        bounty.currentReviews += 1;

        emit ReviewVerified(_prId, _reviewer);

        // 3. Issue EAS Attestation
        eas.attest(
            AttestationRequest({
                schema: schemaId,
                data: AttestationRequestData({
                    recipient: _reviewer,
                    expirationTime: 0,
                    revocable: false,
                    refUID: bytes32(0),
                    data: abi.encode(_prId, true), // simple schema: prId, isVerified
                    value: 0
                })
            })
        );

        // 4. Distribute bounty and check completion
        if (bounty.currentReviews >= bounty.requiredReviews) {
            bounty.isCompleted = true;
            emit BountyCompleted(_prId);
        }
        
        // Payout to this reviewer
        uint256 rewardPerReviewer = bounty.amount / bounty.requiredReviews;
        bounty.token.safeTransfer(_reviewer, rewardPerReviewer);
    }
}
