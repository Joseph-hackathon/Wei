import {
  BountyCreated,
  ReviewVerified,
  BountyCompleted,
} from "../generated/NexusCore/NexusCore";
import {
  Bounty,
  Review,
  ReviewerStats,
  ProtocolStats,
} from "../generated/schema";
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

// ── Helper: load or create global stats ──────────────────────────────────────

function loadOrCreateStats(): ProtocolStats {
  let stats = ProtocolStats.load("global");
  if (!stats) {
    stats = new ProtocolStats("global");
    stats.totalBounties = BigInt.fromI32(0);
    stats.totalReviews = BigInt.fromI32(0);
    stats.totalDistributed = BigInt.fromI32(0);
    stats.activeBounties = BigInt.fromI32(0);
  }
  return stats;
}

function loadOrCreateReviewerStats(address: Bytes): ReviewerStats {
  let id = address.toHexString();
  let reviewer = ReviewerStats.load(id);
  if (!reviewer) {
    reviewer = new ReviewerStats(id);
    reviewer.address = address;
    reviewer.totalReviews = BigInt.fromI32(0);
    reviewer.totalEarned = BigInt.fromI32(0);
    reviewer.lastReviewAt = BigInt.fromI32(0);
  }
  return reviewer;
}

// ── Event Handlers ────────────────────────────────────────────────────────────

export function handleBountyCreated(event: BountyCreated): void {
  let id = event.params.prId.toString();
  let bounty = new Bounty(id);

  bounty.prId = event.params.prId;
  bounty.creator = event.params.creator;
  bounty.token = Bytes.empty(); // token address not in event, set via call
  bounty.amount = event.params.amount;
  bounty.requiredReviews = event.params.requiredReviews;
  bounty.currentReviews = BigInt.fromI32(0);
  bounty.isCompleted = false;
  bounty.createdAt = event.block.timestamp;
  bounty.save();

  let stats = loadOrCreateStats();
  stats.totalBounties = stats.totalBounties.plus(BigInt.fromI32(1));
  stats.activeBounties = stats.activeBounties.plus(BigInt.fromI32(1));
  stats.save();
}

export function handleReviewVerified(event: ReviewVerified): void {
  let prId = event.params.prId.toString();
  let reviewerId = event.params.reviewer.toHexString();
  let reviewId = prId + "-" + reviewerId;

  // Create review entity
  let review = new Review(reviewId);
  review.bounty = prId;
  review.reviewer = event.params.reviewer;
  review.timestamp = event.block.timestamp;
  review.transactionHash = event.transaction.hash;
  review.save();

  // Update bounty review count
  let bounty = Bounty.load(prId);
  if (bounty) {
    bounty.currentReviews = bounty.currentReviews.plus(BigInt.fromI32(1));
    bounty.save();
  }

  // Update reviewer stats
  let reviewerStats = loadOrCreateReviewerStats(event.params.reviewer);
  reviewerStats.totalReviews = reviewerStats.totalReviews.plus(BigInt.fromI32(1));
  reviewerStats.lastReviewAt = event.block.timestamp;
  reviewerStats.save();

  // Update global stats
  let stats = loadOrCreateStats();
  stats.totalReviews = stats.totalReviews.plus(BigInt.fromI32(1));
  stats.save();
}

export function handleBountyCompleted(event: BountyCompleted): void {
  let prId = event.params.prId.toString();
  let bounty = Bounty.load(prId);

  if (bounty) {
    bounty.isCompleted = true;
    bounty.completedAt = event.block.timestamp;
    bounty.save();

    // Update global stats
    let stats = loadOrCreateStats();
    stats.activeBounties = stats.activeBounties.minus(BigInt.fromI32(1));
    stats.totalDistributed = stats.totalDistributed.plus(bounty.amount);
    stats.save();
  }
}
