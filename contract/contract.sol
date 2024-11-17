// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title FunkyReputationCoin
 * @dev A reputation-based ERC20 token with upvoting/downvoting mechanics and quadratic rewards
 */
contract FunkyReputationCoin is ERC20, Ownable {
    using SafeMath for uint256;

    // Constants
    uint256 public constant REWARD_COOLDOWN = 24 hours;
    uint256 public constant BASE_REWARD = 100 * 10**18;    // 100 FRC tokens
    uint256 public constant QUADRATIC_FACTOR = 2;
    uint256 private constant INITIAL_SUPPLY = 1_000_000 * 10**18;  // 1 million FRC

    // Structs
    struct ReputationData {
        uint256 upvotes;
        uint256 downvotes;
        mapping(address => bool) hasUpvoted;
        mapping(address => bool) hasDownvoted;
        uint256 lastRewardClaim;
    }

    struct VoterData {
        uint256 totalVotesCast;
        uint256 upvotesCast;
        uint256 downvotesCast;
        uint256 lastVoteTimestamp;
    }

    // State Variables
    mapping(address => ReputationData) public reputations;
    mapping(address => VoterData) public voterStats;

    // Events
    event Upvoted(address indexed voter, address indexed target);
    event Downvoted(address indexed voter, address indexed target);
    event RewardsClaimed(address indexed user, uint256 amount);
    event VoteTracked(address indexed voter, uint256 totalVotes, bool isUpvote);

    /**
     * @dev Constructor that mints initial supply to the contract owner
     */
    constructor() ERC20("Funky Reputation Coin", "FRC") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Upvote a target address
     * @param target The address to upvote
     */
    function upvote(address target) external {
        require(target != msg.sender, "Cannot vote for yourself");
        require(!reputations[target].hasUpvoted[msg.sender], "Already upvoted");
        require(!reputations[target].hasDownvoted[msg.sender], "Already downvoted");

        ReputationData storage targetReputation = reputations[target];
        VoterData storage voterData = voterStats[msg.sender];

        // Update target's reputation
        targetReputation.upvotes = targetReputation.upvotes.add(1);
        targetReputation.hasUpvoted[msg.sender] = true;

        // Update voter's statistics
        voterData.totalVotesCast = voterData.totalVotesCast.add(1);
        voterData.upvotesCast = voterData.upvotesCast.add(1);
        voterData.lastVoteTimestamp = block.timestamp;

        emit Upvoted(msg.sender, target);
        emit VoteTracked(msg.sender, voterData.totalVotesCast, true);
    }

    /**
     * @dev Downvote a target address
     * @param target The address to downvote
     */
    function downvote(address target) external {
        require(target != msg.sender, "Cannot vote for yourself");
        require(!reputations[target].hasUpvoted[msg.sender], "Already upvoted");
        require(!reputations[target].hasDownvoted[msg.sender], "Already downvoted");

        ReputationData storage targetReputation = reputations[target];
        VoterData storage voterData = voterStats[msg.sender];

        // Update target's reputation
        targetReputation.downvotes = targetReputation.downvotes.add(1);
        targetReputation.hasDownvoted[msg.sender] = true;

        // Update voter's statistics
        voterData.totalVotesCast = voterData.totalVotesCast.add(1);
        voterData.downvotesCast = voterData.downvotesCast.add(1);
        voterData.lastVoteTimestamp = block.timestamp;

        emit Downvoted(msg.sender, target);
        emit VoteTracked(msg.sender, voterData.totalVotesCast, false);
    }

    /**
     * @dev Calculate quadratic reward based on reputation
     * @param upvotes Number of upvotes
     * @param downvotes Number of downvotes
     * @return uint256 The calculated reward amount
     */
    function calculateReward(uint256 upvotes, uint256 downvotes) public pure returns (uint256) {
        if (upvotes <= downvotes) {
            return 0;
        }
        
        uint256 netVotes = upvotes.sub(downvotes);
        uint256 quadraticReward = sqrt(netVotes).mul(BASE_REWARD);
        return quadraticReward.div(QUADRATIC_FACTOR);
    }

    /**
     * @dev Claim rewards based on reputation
     */
    function claimRewards() external {
        ReputationData storage reputation = reputations[msg.sender];
        require(
            block.timestamp >= reputation.lastRewardClaim + REWARD_COOLDOWN,
            "Too soon to claim rewards"
        );

        uint256 reward = calculateReward(reputation.upvotes, reputation.downvotes);
        require(reward > 0, "No rewards available");

        reputation.lastRewardClaim = block.timestamp;
        _mint(msg.sender, reward);

        emit RewardsClaimed(msg.sender, reward);
    }

    /**
     * @dev Get reputation data for an address
     * @param user Address to query
     * @return upvotes Number of upvotes received
     * @return downvotes Number of downvotes received
     */
    function getReputation(address user) external view returns (
        uint256 upvotes,
        uint256 downvotes
    ) {
        return (reputations[user].upvotes, reputations[user].downvotes);
    }

    /**
     * @dev Get voter statistics for an address
     * @param voter Address to query
     * @return totalVotes Total number of votes cast
     * @return upvotes Number of upvotes cast
     * @return downvotes Number of downvotes cast
     * @return lastVoteTime Timestamp of last vote
     */
    function getVoterStats(address voter) external view returns (
        uint256 totalVotes,
        uint256 upvotes,
        uint256 downvotes,
        uint256 lastVoteTime
    ) {
        VoterData storage data = voterStats[voter];
        return (
            data.totalVotesCast,
            data.upvotesCast,
            data.downvotesCast,
            data.lastVoteTimestamp
        );
    }

    /**
     * @dev Check if an address has voted for another address
     * @param voter The voter's address
     * @param target The target address
     * @return upvoted Whether the voter has upvoted
     * @return downvoted Whether the voter has downvoted
     */
    function hasVoted(address voter, address target) external view returns (
        bool upvoted,
        bool downvoted
    ) {
        return (
            reputations[target].hasUpvoted[voter],
            reputations[target].hasDownvoted[voter]
        );
    }

    /**
     * @dev Calculate square root using Newton's method
     * @param x Number to calculate square root of
     * @return uint256 The square root of the input
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        
        return y;
    }
}