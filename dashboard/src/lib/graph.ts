// The Graph GraphQL client for EIP Nexus
// Queries the NexusCore subgraph deployed on Sepolia

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 
  "https://api.studio.thegraph.com/query/YOUR_ID/eip-nexus/version/latest";

export interface BountyFromGraph {
  id: string;
  prId: string;
  creator: string;
  amount: string;
  requiredReviews: string;
  currentReviews: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface ProtocolStatsFromGraph {
  totalBounties: string;
  totalReviews: string;
  totalDistributed: string;
  activeBounties: string;
}

export interface ReviewerStatsFromGraph {
  id: string;
  address: string;
  totalReviews: string;
  totalEarned: string;
  lastReviewAt: string;
}

async function query<T>(gql: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: gql, variables }),
    // Cache for 30 seconds in Next.js
    next: { revalidate: 30 },
  } as RequestInit);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function fetchActiveBounties(): Promise<BountyFromGraph[]> {
  const data = await query<{ bounties: BountyFromGraph[] }>(`
    query ActiveBounties {
      bounties(
        where: { isCompleted: false }
        orderBy: createdAt
        orderDirection: desc
        first: 50
      ) {
        id
        prId
        creator
        amount
        requiredReviews
        currentReviews
        isCompleted
        createdAt
      }
    }
  `);
  return data.bounties;
}

export async function fetchProtocolStats(): Promise<ProtocolStatsFromGraph | null> {
  const data = await query<{ protocolStats: ProtocolStatsFromGraph | null }>(`
    query ProtocolStats {
      protocolStats(id: "global") {
        totalBounties
        totalReviews
        totalDistributed
        activeBounties
      }
    }
  `);
  return data.protocolStats;
}

export async function fetchReviewerStats(address: string): Promise<ReviewerStatsFromGraph | null> {
  const data = await query<{ reviewerStats: ReviewerStatsFromGraph | null }>(`
    query ReviewerStats($id: ID!) {
      reviewerStats(id: $id) {
        id
        address
        totalReviews
        totalEarned
        lastReviewAt
      }
    }
  `, { id: address.toLowerCase() });
  return data.reviewerStats;
}

export async function fetchLeaderboard(): Promise<ReviewerStatsFromGraph[]> {
  const data = await query<{ reviewerStats: ReviewerStatsFromGraph[] }>(`
    query Leaderboard {
      reviewerStats(
        orderBy: totalReviews
        orderDirection: desc
        first: 20
      ) {
        id
        address
        totalReviews
        totalEarned
        lastReviewAt
      }
    }
  `);
  return data.reviewerStats;
}
