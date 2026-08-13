import * as cre from "@chainlink/cre-sdk";

// ── Types ─────────────────────────────────────────────────────────────────────

interface GitHubReview {
  user: { login: string };
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED";
  body: string;
  submitted_at: string;
}

interface GitHubComment {
  user: { login: string };
  body: string;
  created_at: string;
}

interface FileDiff {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch?: string;
}

interface PRContext {
  title: string;
  body: string;
  headSha: string;
  baseBranch: string;
  labels: string[];
  changedFiles: FileDiff[];
  reviewApprovals: number;
  reviewChangesRequested: number;
  totalComments: number;
}

interface ReviewerTrust {
  address: string;
  totalReviews: number;
  weight: number; // 1.0 - 3.0
}

interface AnalysisResult {
  decision: "ACCEPT" | "REJECT" | "NEEDS_MORE_REVIEW";
  confidence: number;
  reasoning: string;
  keyPoints: string[];
  suggestedChanges?: string[];
}

// ── Workflow Definition ───────────────────────────────────────────────────────

const workflow = cre.workflow({
  name: "eip-nexus-ai-review-agent",
  description:
    "Decentralized AI agent that analyzes EIP/ERC PRs using structured diff analysis, community consensus, and World ID trust weights via Chainlink CRE.",

  trigger: cre.evmLogTrigger({
    network: "ethereum-sepolia",
    contractAddress: process.env.NEXUS_CORE_ADDRESS || "",
    eventSignature: "ReviewVerified(uint256,address)",
  }),

  run: async (ctx) => {
    const { prId, reviewer } = ctx.trigger.data;

    // ── Load secrets ──────────────────────────────────────────────────────────
    const [githubToken, openaiKey, subgraphUrl, githubRepo] = await Promise.all([
      ctx.secrets.get("GITHUB_BOT_TOKEN"),
      ctx.secrets.get("OPENAI_API_KEY"),
      ctx.secrets.get("THE_GRAPH_SUBGRAPH_URL"),
      ctx.secrets.get("GITHUB_REPO"), // e.g. "ethereum/EIPs"
    ]);

    console.log(`[EIP Nexus Agent] 🚀 Triggered for PR #${prId} | new reviewer: ${reviewer}`);

    // ── Step 1: On-chain state via The Graph ──────────────────────────────────
    const onChain = await fetchOnChainState(subgraphUrl, String(prId));
    console.log(`[Step 1] On-chain: ${onChain.currentReviews}/${onChain.requiredReviews} reviews`);

    // Early exit: already completed
    if (onChain.isCompleted) {
      console.log("[Agent] Bounty already completed. Skipping.");
      return { skipped: true, reason: "bounty_completed" };
    }

    const prNumber = parseInt(String(prId));

    // ── Step 2: Structured GitHub PR data collection (PR Agent pattern) ───────
    const prContext = await collectPRContext(githubRepo, prNumber, githubToken);
    console.log(`[Step 2] PR context: ${prContext.changedFiles.length} files, ${prContext.labels.join(",")} labels`);

    // ── Step 3: Fetch all reviews + comments ─────────────────────────────────
    const [reviews, comments] = await Promise.all([
      fetchPRReviews(githubRepo, prNumber, githubToken),
      fetchPRComments(githubRepo, prNumber, githubToken),
    ]);
    console.log(`[Step 3] GitHub: ${reviews.length} reviews, ${comments.length} comments`);

    // ── Step 4: Reviewer trust scores from The Graph (World ID weighted) ──────
    const trustScores = await fetchReviewerTrustScores(subgraphUrl, onChain.reviewers);
    console.log(`[Step 4] Trust scores for ${trustScores.length} World ID verified reviewers`);

    // ── Step 5: Structured diff analysis (PR Agent approach) ─────────────────
    const diffSummary = analyzeDiff(prContext.changedFiles);
    console.log(`[Step 5] Diff summary: +${diffSummary.totalAdditions} -${diffSummary.totalDeletions} across ${diffSummary.fileCount} files`);

    // ── Step 6: Multi-stage AI analysis via OpenAI ───────────────────────────
    const analysis = await runAIAnalysis(openaiKey, {
      prContext,
      reviews,
      comments,
      trustScores,
      diffSummary,
      onChain,
    });
    console.log(`[Step 6] AI Decision: ${analysis.decision} | Confidence: ${analysis.confidence}%`);

    // ── Step 7: Post GitHub comment with full report ──────────────────────────
    await postAgentReport(githubRepo, prNumber, analysis, onChain, githubToken);

    // ── Step 8: Update GitHub Status Check ───────────────────────────────────
    const isConsensusReached =
      analysis.decision === "ACCEPT" &&
      onChain.currentReviews >= onChain.requiredReviews;

    await updateCommitStatus(
      githubRepo,
      prContext.headSha,
      analysis.decision,
      onChain,
      githubToken
    );

    console.log(`[Agent] ✅ Complete. Decision: ${analysis.decision} | Consensus: ${isConsensusReached}`);
    return { decision: analysis.decision, prId, confidence: analysis.confidence, consensusReached: isConsensusReached };
  },
});

// ── Data Collection ───────────────────────────────────────────────────────────

async function fetchOnChainState(subgraphUrl: string, prId: string) {
  const query = `
    query GetBounty($id: ID!) {
      bounty(id: $id) {
        currentReviews
        requiredReviews
        isCompleted
        amount
        reviews { reviewer }
      }
    }`;
  const res = await fetch(subgraphUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { id: prId } }),
  });
  const { data } = (await res.json()) as { data: { bounty: any } };
  const b = data.bounty;
  return {
    currentReviews: parseInt(b.currentReviews),
    requiredReviews: parseInt(b.requiredReviews),
    isCompleted: b.isCompleted as boolean,
    amount: b.amount as string,
    reviewers: (b.reviews as any[]).map((r) => r.reviewer as string),
  };
}

async function collectPRContext(repo: string, prNumber: number, token: string): Promise<PRContext> {
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" };

  const [prRes, filesRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${repo}/pulls/${prNumber}`, { headers }),
    fetch(`https://api.github.com/repos/${repo}/pulls/${prNumber}/files`, { headers }),
  ]);

  const pr = (await prRes.json()) as any;
  const files = (await filesRes.json()) as any[];

  // Structured diff collection (inspired by PR Agent: per-file patch extraction)
  const changedFiles: FileDiff[] = files.map((f: any) => ({
    filename: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
    patch: f.patch ? f.patch.slice(0, 2000) : undefined, // cap per file
  }));

  return {
    title: pr.title,
    body: (pr.body || "").slice(0, 2000),
    headSha: pr.head.sha,
    baseBranch: pr.base.ref,
    labels: (pr.labels || []).map((l: any) => l.name),
    changedFiles,
    reviewApprovals: 0, // filled later
    reviewChangesRequested: 0,
    totalComments: pr.comments + pr.review_comments,
  };
}

async function fetchPRReviews(repo: string, prNumber: number, token: string): Promise<GitHubReview[]> {
  const res = await fetch(`https://api.github.com/repos/${repo}/pulls/${prNumber}/reviews`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  return (await res.json()) as GitHubReview[];
}

async function fetchPRComments(repo: string, prNumber: number, token: string): Promise<GitHubComment[]> {
  const res = await fetch(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  const all = (await res.json()) as GitHubComment[];
  return all.slice(0, 15); // limit context size
}

async function fetchReviewerTrustScores(subgraphUrl: string, addresses: string[]): Promise<ReviewerTrust[]> {
  if (addresses.length === 0) return [];
  const query = `
    query Reviewers($ids: [ID!]!) {
      reviewerStats(where: { id_in: $ids }) {
        id
        totalReviews
        totalEarned
      }
    }`;
  const res = await fetch(subgraphUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { ids: addresses.map((a) => a.toLowerCase()) } }),
  });
  const { data } = (await res.json()) as { data: { reviewerStats: any[] } };
  return (data.reviewerStats || []).map((rs) => ({
    address: rs.id,
    totalReviews: parseInt(rs.totalReviews),
    // World ID-verified reviewers on-chain get progressive trust:
    // 1 review = 1.0x, 5 reviews = 1.5x, 20+ reviews = 3.0x
    weight: Math.min(1 + parseInt(rs.totalReviews) / 10, 3.0),
  }));
}

// ── Diff Analysis (PR Agent pattern) ─────────────────────────────────────────

function analyzeDiff(files: FileDiff[]) {
  const totalAdditions = files.reduce((s, f) => s + f.additions, 0);
  const totalDeletions = files.reduce((s, f) => s + f.deletions, 0);
  const fileCount = files.length;

  // Classify files by type (EIP-specific heuristics)
  const specFiles = files.filter(
    (f) => f.filename.endsWith(".md") || f.filename.endsWith(".rst")
  );
  const testFiles = files.filter((f) => f.filename.includes("test"));
  const codeFiles = files.filter(
    (f) =>
      f.filename.endsWith(".sol") ||
      f.filename.endsWith(".py") ||
      f.filename.endsWith(".ts")
  );

  // Build compact diff representation for AI context
  const diffContext = files
    .slice(0, 8)
    .map(
      (f) =>
        `[${f.status.toUpperCase()}] ${f.filename} (+${f.additions}/-${f.deletions})${
          f.patch ? `\n${f.patch.slice(0, 800)}` : ""
        }`
    )
    .join("\n\n");

  return {
    totalAdditions,
    totalDeletions,
    fileCount,
    specFileCount: specFiles.length,
    testFileCount: testFiles.length,
    codeFileCount: codeFiles.length,
    diffContext,
  };
}

// ── AI Analysis Pipeline ──────────────────────────────────────────────────────

async function runAIAnalysis(
  openaiKey: string,
  ctx: {
    prContext: PRContext;
    reviews: GitHubReview[];
    comments: GitHubComment[];
    trustScores: ReviewerTrust[];
    diffSummary: ReturnType<typeof analyzeDiff>;
    onChain: Awaited<ReturnType<typeof fetchOnChainState>>;
  }
): Promise<AnalysisResult> {
  const trustMap = new Map(ctx.trustScores.map((t) => [t.address.toLowerCase(), t.weight]));

  // Build weighted review summary
  const reviewBlock = ctx.reviews
    .map((r) => {
      const weight = trustMap.get(r.user.login.toLowerCase()) ?? 1.0;
      const icon = r.state === "APPROVED" ? "✅" : r.state === "CHANGES_REQUESTED" ? "❌" : "💬";
      return `${icon} [${r.state}] @${r.user.login} (trust: ${weight.toFixed(1)}x)\n${(r.body || "").slice(0, 400)}`;
    })
    .join("\n\n");

  const commentBlock = ctx.comments
    .map((c) => `@${c.user.login}: ${c.body.slice(0, 300)}`)
    .join("\n");

  const approvals = ctx.reviews.filter((r) => r.state === "APPROVED").length;
  const changesRequested = ctx.reviews.filter((r) => r.state === "CHANGES_REQUESTED").length;

  const prompt = `You are an expert Ethereum protocol reviewer AI agent for the EIP Nexus platform.
Analyze this EIP/ERC Pull Request and provide a structured consensus decision.

## PR: ${ctx.prContext.title}
**Labels:** ${ctx.prContext.labels.join(", ") || "none"}
**Description:** ${ctx.prContext.body}

## Code Changes
- ${ctx.diffSummary.fileCount} files changed (+${ctx.diffSummary.totalAdditions}/-${ctx.diffSummary.totalDeletions})
- Spec files: ${ctx.diffSummary.specFileCount} | Code files: ${ctx.diffSummary.codeFileCount} | Test files: ${ctx.diffSummary.testFileCount}

\`\`\`diff
${ctx.diffSummary.diffContext}
\`\`\`

## Community Reviews (World ID trust-weighted)
GitHub Approvals: ${approvals} | Changes Requested: ${changesRequested}

${reviewBlock}

## Discussion
${commentBlock}

## On-Chain Verification Status
World ID Verified Reviewers: ${ctx.onChain.currentReviews}/${ctx.onChain.requiredReviews} required

## Instructions
Return ONLY a valid JSON object:
{
  "decision": "ACCEPT" | "REJECT" | "NEEDS_MORE_REVIEW",
  "confidence": <0-100>,
  "reasoning": "<2-3 sentence summary>",
  "keyPoints": ["<point>", "<point>", "<point>"],
  "suggestedChanges": ["<suggestion>"] // only if REJECT or NEEDS_MORE_REVIEW
}

Rules:
- ACCEPT: Clear consensus, no unresolved critical issues, spec is sound
- REJECT: Security flaws, backward compatibility breaks, EIP format violations
- NEEDS_MORE_REVIEW: Split opinions, unresolved concerns, or not enough verified reviewers
- High-trust World ID reviewers (weight > 2.0) carry more weight in decision
- Be conservative: when uncertain, use NEEDS_MORE_REVIEW`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.15,
      max_tokens: 800,
    }),
  });
  const result = (await res.json()) as any;
  return JSON.parse(result.choices[0].message.content) as AnalysisResult;
}

// ── GitHub Output ─────────────────────────────────────────────────────────────

async function postAgentReport(
  repo: string,
  prNumber: number,
  analysis: AnalysisResult,
  onChain: Awaited<ReturnType<typeof fetchOnChainState>>,
  token: string
) {
  const icon = { ACCEPT: "✅", REJECT: "❌", NEEDS_MORE_REVIEW: "⏳" }[analysis.decision];
  const progressBar = buildProgressBar(onChain.currentReviews, onChain.requiredReviews);

  const suggestedSection =
    analysis.suggestedChanges && analysis.suggestedChanges.length > 0
      ? `\n**Suggested Changes:**\n${analysis.suggestedChanges.map((s) => `- ${s}`).join("\n")}`
      : "";

  const body = `## ${icon} EIP Nexus — AI Review Agent

> **Decision: \`${analysis.decision}\`** · Confidence: **${analysis.confidence}%**

**Reasoning:** ${analysis.reasoning}

**Key Points:**
${analysis.keyPoints.map((p) => `- ${p}`).join("\n")}
${suggestedSection}

---

**On-Chain Consensus Progress**
${progressBar} ${onChain.currentReviews}/${onChain.requiredReviews} World ID verified reviewers

<sub>🤖 Powered by [EIP Nexus](https://eip-nexus.xyz) · Chainlink CRE · The Graph · World ID · OpenAI GPT-4o</sub>`;

  await fetch(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
}

async function updateCommitStatus(
  repo: string,
  sha: string,
  decision: AnalysisResult["decision"],
  onChain: Awaited<ReturnType<typeof fetchOnChainState>>,
  token: string
) {
  const stateMap: Record<string, "success" | "failure" | "pending"> = {
    ACCEPT: onChain.currentReviews >= onChain.requiredReviews ? "success" : "pending",
    REJECT: "failure",
    NEEDS_MORE_REVIEW: "pending",
  };
  const descMap: Record<string, string> = {
    ACCEPT:
      onChain.currentReviews >= onChain.requiredReviews
        ? "✅ EIP Nexus: Consensus reached — ready to merge"
        : `⏳ EIP Nexus: ${onChain.currentReviews}/${onChain.requiredReviews} verified reviews`,
    REJECT: "❌ EIP Nexus: AI Agent flagged critical issues",
    NEEDS_MORE_REVIEW: `⏳ EIP Nexus: ${onChain.currentReviews}/${onChain.requiredReviews} — more reviews needed`,
  };

  await fetch(`https://api.github.com/repos/${repo}/statuses/${sha}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify({
      state: stateMap[decision],
      description: descMap[decision],
      context: "EIP Nexus / AI Review Agent",
      target_url: "https://eip-nexus.xyz",
    }),
  });
}

function buildProgressBar(current: number, required: number): string {
  const pct = Math.min(Math.floor((current / required) * 10), 10);
  return "█".repeat(pct) + "░".repeat(10 - pct);
}

export default workflow;
