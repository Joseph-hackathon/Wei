'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MessageSquare, ThumbsUp, DollarSign, Clock, Users, ArrowLeft, ExternalLink, GitPullRequest, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useWriteContract, useAccount } from 'wagmi';
import { decodeAbiParameters, parseAbi } from 'viem';
import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';
import { NEXUS_CORE_ADDRESS } from '../../../config/constants';
import NexusCoreABI from '../../../config/NexusCore.json';
import styles from './detail.module.css';

const GET_BOUNTY_DETAIL = gql`
  query GetBountyDetail($id: ID!) {
    bounty(id: $id) {
      id
      prId
      author
      rewardAmount
      token
      requiredReviews
      currentReviews
      isCompleted
      deadline
      createdAt
      reviews {
        reviewer
        verified
        timestamp
      }
    }
  }
`;

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/12345/eip-nexus-subgraph/version/latest';

export default function BountyDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['bountyDetail', id],
    queryFn: async () => {
      try {
        const res = await request(SUBGRAPH_URL, GET_BOUNTY_DETAIL, { id: id?.toLowerCase() || '' });
        return res || null;
      } catch (err) {
        console.warn('Subgraph fetch failed:', err);
        return null; // Return null instead of undefined
      }
    }
  });

  const proposal = (data as any)?.bounty ? {
    id: (data as any).bounty.id,
    prId: `#${(data as any).bounty.prId}`,
    title: `PR #${(data as any).bounty.prId}`,
    author: (data as any).bounty.author || 'Unknown',
    protocol: 'Ethereum',
    type: 'EIP',
    amount: Number(data.bounty.rewardAmount) / 1e6,
    token: 'USDC',
    requiredReviews: Number(data.bounty.requiredReviews),
    currentReviews: Number(data.bounty.currentReviews),
    deadline: data.bounty.deadline ? new Date(Number(data.bounty.deadline) * 1000).toISOString().split('T')[0] : '2026-09-01',
    githubUrl: 'https://github.com/ethereum/EIPs/pull/' + data.bounty.prId,
    abstract: `Bounty data loaded from The Graph Subgraph.`,
    motivation: `The bounty details are retrieved dynamically from the on-chain events via the eip-nexus-subgraph.`,
    specification: `GraphQL Query used to fetch details for PR #${data.bounty.prId}.`,
    rationale: ``,
    backwardCompatibility: ``,
    reviews: ((data as any).bounty.reviews || []).map((r: any, idx: number) => ({
      id: idx,
      author: r.reviewer,
      date: new Date(Number(r.timestamp) * 1000).toLocaleString(),
      content: 'Review verified on-chain via World ID.',
      upvotes: 0,
      verified: r.verified
    }))
  } : {
    prId: '#000',
    title: 'Loading or Not Found',
    author: '-',
    protocol: 'Ethereum',
    type: 'EIP',
    amount: 0,
    token: 'USDC',
    requiredReviews: 1,
    currentReviews: 0,
    deadline: '2026-09-01',
    githubUrl: '#',
    abstract: 'Loading...',
    reviews: []
  };

  const [reviewDraft, setReviewDraft] = useState('');
  const [sandboxData, setSandboxData] = useState<any>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Run AI Sandbox analysis on mount
  useEffect(() => {
    if (proposal.githubUrl !== '#') {
      setSandboxLoading(true);
      fetch('/api/ai/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prUrl: proposal.githubUrl })
      })
      .then(res => res.json())
      .then(data => {
        setSandboxData(data);
        setSandboxLoading(false);
      })
      .catch(err => {
        console.error(err);
        setSandboxLoading(false);
      });
    }
  }, [proposal.githubUrl]);

  const handleVerify = async (proof: any) => {
    try {
      const unpackedProof = decodeAbiParameters([{ type: 'uint256[8]' }], proof.proof as `0x${string}`)[0];
      
      await writeContractAsync({
        address: NEXUS_CORE_ADDRESS as `0x${string}`,
        abi: NexusCoreABI.abi,
        functionName: 'submitReview',
        args: [
          BigInt(proposal.prId.replace('#', '')), // _prId
          address as `0x${string}`, // _reviewer
          BigInt(proof.merkle_root), // root
          BigInt(proof.nullifier_hash), // nullifierHash
          unpackedProof // proof
        ]
      });
      alert('Review successfully submitted on-chain!');
    } catch (error) {
      console.error(error);
      alert('Failed to submit review');
    }
  };

  const isCompleted = proposal.currentReviews >= proposal.requiredReviews;
  const progressPct = Math.min((proposal.currentReviews / proposal.requiredReviews) * 100, 100);

  return (
    <div className={styles.container}>
      {/* Back Navigation */}
      <Link href="/bounties" className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Bounties
      </Link>

      <div className={styles.layout}>
        {/* Main Content Area (Forum Post) */}
        <div className={styles.mainContent}>
          {/* Post Header */}
          <div className={styles.postHeader}>
            <div className={styles.postMeta}>
              <span className={styles.protocolBadge}>{proposal.protocol}</span>
              <span className={styles.typeBadge}>{proposal.type}</span>
              <span className={styles.prId}>PR {proposal.prId}</span>
            </div>
            <h1 className={styles.postTitle}>{proposal.title}</h1>
            <div className={styles.authorRow}>
              <div className={styles.avatar} />
              <div className={styles.authorInfo}>
                <div className={styles.authorName}>{proposal.author}</div>
                <div className={styles.postDate}>Posted 3 days ago in Core Standards</div>
              </div>
            </div>
          </div>

          {/* Post Body */}
          <div className={styles.postBody}>
            <h2>Abstract</h2>
            <p>{proposal.abstract}</p>
            
            <h2>Motivation</h2>
            <p>{proposal.motivation}</p>

            {proposal.specification && (
              <>
                <h2>Specification</h2>
                <p>{proposal.specification}</p>
              </>
            )}

            {proposal.rationale && (
              <>
                <h2>Rationale</h2>
                <p>{proposal.rationale}</p>
              </>
            )}

            {proposal.backwardCompatibility && (
              <>
                <h2>Backwards Compatibility</h2>
                <p>{proposal.backwardCompatibility}</p>
              </>
            )}

            <a href={proposal.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.githubLink}>
              <GitPullRequest size={18} />
              Read full specification on GitHub <ExternalLink size={14} />
            </a>

            {/* Sandbox AI Review Section */}
            <div style={{ marginTop: '32px', background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🤖 Dynamic Sandbox Analysis
                </h2>
                {sandboxLoading ? (
                  <span style={{ fontSize: '14px', color: '#60a5fa', animation: 'pulse 2s infinite' }}>Analyzing in isolated environment...</span>
                ) : sandboxData ? (
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '16px', 
                    fontSize: '12px', 
                    fontWeight: 700,
                    background: sandboxData.verdict === 'SAFE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: sandboxData.verdict === 'SAFE' ? '#10b981' : '#ef4444'
                  }}>
                    VERDICT: {sandboxData.verdict}
                  </span>
                ) : null}
              </div>
              
              <div style={{ position: 'relative', background: '#000', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '13px', color: '#a3a3a3', overflowX: 'auto', minHeight: '150px' }}>
                {sandboxLoading && <div className="wei-scanline"></div>}
                
                {sandboxLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>[+] Initializing secure E2B container environment...</div>
                    <div style={{ color: '#60a5fa' }}>Pulling latest PR code...</div>
                  </div>
                ) : sandboxData ? (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {sandboxData.logs}
                  </pre>
                ) : (
                  <div>Waiting for execution...</div>
                )}
              </div>
            </div>
          </div>

          {/* Discussion Thread */}
          <div className={styles.discussionSection}>
            <div className={styles.discussionHeader}>
              <MessageSquare size={20} />
              <h2>Reviews & Discussion ({proposal.reviews.length})</h2>
            </div>

            <div className={styles.thread}>
              {proposal.reviews.map((review: any) => (
                <div key={review.id} className={styles.commentCard}>
                  <div className={styles.commentHeader}>
                    <div className={styles.commentAuthor}>
                      <div className={styles.smallAvatar} />
                      <span className={styles.authorName}>{review.author}</span>
                      {review.verified && (
                        <span className={styles.verifiedBadge}>
                          <CheckCircle2 size={12} /> Verified Reviewer
                        </span>
                      )}
                    </div>
                    <span className={styles.commentDate}>{review.date}</span>
                  </div>
                  <div className={styles.commentBody}>
                    <p>{review.content}</p>
                  </div>
                  <div className={styles.commentFooter}>
                    <button className={styles.upvoteBtn}>
                      <ThumbsUp size={14} /> {review.upvotes}
                    </button>
                    <button className={styles.replyBtn}>Reply</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Review Box */}
            <div className={styles.replyBox}>
              <h3>Submit your Review</h3>
              <p className={styles.replyNotice}>
                Your review will be verified via World ID and attested on-chain using EAS.
              </p>
              <textarea 
                rows={5} 
                placeholder="Write your technical analysis or review here..." 
                value={reviewDraft}
                onChange={(e) => setReviewDraft(e.target.value)}
                className={styles.replyInput}
              />
              <div className={styles.replyActions}>
                {!isCompleted ? (
                  <button 
                    className={styles.submitReplyBtn} 
                    onClick={() => handleVerify({ proof: '0x0000000000000000000000000000000000000000000000000000000000000000' })}
                    disabled={!reviewDraft || (mounted && !address)}
                  >
                    {mounted ? (!address ? 'Connect Wallet First' : 'Verify with World ID & Submit (Mock)') : 'Verify with World ID & Submit (Mock)'}
                  </button>
                ) : (
                  <button className={styles.submitReplyBtn} disabled>
                    Bounty Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar (Bounty Metadata) */}
        <aside className={styles.sidebar}>
          <div className={styles.stickyPanel}>
            <div className={styles.bountyStatusHeader}>
              {isCompleted ? (
                <span className={styles.statusCompleted}>Consensus Met</span>
              ) : (
                <span className={styles.statusOpen}>Reviewing</span>
              )}
            </div>

            <div className={styles.bountyAmountBox}>
              <div className={styles.amountLabel}>Total Bounty Pool</div>
              <div className={styles.amountValue}>
                <DollarSign size={24} color="#10b981" />
                <span>{proposal.amount} {proposal.token}</span>
              </div>
            </div>

            <div className={styles.bountyMetrics}>
              <div className={styles.metricRow}>
                <span className={styles.metricLabel}><Users size={16} /> Required Consensus</span>
                <span className={styles.metricValue}>{proposal.currentReviews} / {proposal.requiredReviews}</span>
              </div>
              <div className={styles.progressTrack}>
                <div 
                  className={styles.progressBar} 
                  style={{ width: `${progressPct}%`, background: isCompleted ? '#10b981' : '#2563eb' }}
                />
              </div>

              <div className={styles.metricRow} style={{ marginTop: '16px' }}>
                <span className={styles.metricLabel}><Clock size={16} /> Deadline</span>
                <span className={styles.metricValue}>
                  {new Date(proposal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.sidebarInfo}>
              <h4>How it works</h4>
              <ul>
                <li>Review the PR on GitHub to fully understand the code.</li>
                <li>Write a substantive technical review above.</li>
                <li>Upon submission, your World ID proves sybil resistance.</li>
                <li>Once consensus is met, the smart contract disperses USDC/GRT.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
