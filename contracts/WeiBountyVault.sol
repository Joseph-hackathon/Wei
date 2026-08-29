// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title WeiBountyVault
 * @dev Manages repository budgets and pays out bounties to contributors.
 * Triggered by the Wei Off-Chain Oracle (Chainlink/Backend) upon E2B static analysis success.
 */
contract WeiBountyVault {
    address public owner;
    address public oracle; // Authorized off-chain agent that triggers payouts

    // Mapping from repoId to budget (USDC/GRT equivalent representation)
    mapping(string => uint256) public budgets;
    
    // Sybil resistance: nullifierHash prevents double claims for the same PR
    mapping(uint256 => bool) public usedNullifiers;

    event BudgetFunded(string repoId, uint256 amount);
    event BountyDistributed(string repoId, address contributor, uint256 amount, uint256 nullifierHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Only authorized oracle");
        _;
    }

    constructor(address _oracle) {
        owner = msg.sender;
        oracle = _oracle;
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }

    /**
     * @dev Sponsor deposits funds into a repository's budget pool.
     */
    function fundVault(string memory repoId) external payable {
        budgets[repoId] += msg.value;
        emit BudgetFunded(repoId, msg.value);
    }

    /**
     * @dev Distributes a bounty. Only the Wei oracle can call this after validating
     * the PR via E2B and verifying the user via World ID.
     */
    function distributeBounty(
        string memory repoId,
        address payable contributor,
        uint256 amount,
        uint256 nullifierHash
    ) external onlyOracle {
        require(budgets[repoId] >= amount, "Insufficient repo budget");
        require(!usedNullifiers[nullifierHash], "Nullifier already used (sybil/double-claim attempt)");

        // Deduct from budget and mark nullifier as used
        budgets[repoId] -= amount;
        usedNullifiers[nullifierHash] = true;

        // Payout to contributor
        (bool success, ) = contributor.call{value: amount}("");
        require(success, "Payout failed");

        emit BountyDistributed(repoId, contributor, amount, nullifierHash);
    }
}
