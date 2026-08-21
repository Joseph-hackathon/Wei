'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Target, DollarSign, UserCheck, Shuffle, Clock, ExternalLink, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { request, gql } from 'graphql-request';
import styles from './page.module.css';

// ?�?�?� Types ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

interface Bounty {
  id: number;
  prId: string;
  title: string;
  protocol: string;
  protocolLogo: string;
  amount: number;
  token: string;
  requiredReviews: number;
  currentReviews: number;
  tags: string[];
  deadline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  type: 'EIP' | 'ERC' | 'Core' | 'GIP' | 'AIP';
}

const GET_BOUNTIES = gql`
  query GetBounties {
    bounties(orderBy: createdAt, orderDirection: desc) {
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
    }
  }
`;

const STATS = [
  { label: 'Active PRs', value: '142', icon: Target },
  { label: 'USDC Distributed', value: '$184,200', icon: DollarSign },
  { label: 'Verified Reviewers', value: '3,804', icon: UserCheck },
  { label: 'Consensus Reached', value: '1,387', icon: Shuffle },
];

// ?�?�?� Helper Components ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

function DifficultyBadge({ level }: { level: Bounty['difficulty'] }) {
  const map = {
    Beginner: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    Intermediate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    Expert: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  };
  const { color, bg } = map[level];
  return (
    <span style={{ color, background: bg, fontSize: '15px', fontWeight: 600, padding: '4px 10px', borderRadius: '4px' }}>
      {level}
    </span>
  );
}

function TypeBadge({ type }: { type: Bounty['type'] }) {
  const map: Record<string, {color: string, bg: string}> = {
    EIP: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' },
    ERC: { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' },
    Core: { color: '#f472b6', bg: 'rgba(244, 114, 182, 0.1)' },
    GIP: { color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)' },
    AIP: { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' },
  };
  const { color, bg } = map[type] || map.EIP;
  return (
    <span style={{ color, background: bg, fontSize: '15px', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.5px' }}>
      {type}
    </span>
  );
}

function ProgressBar({ current, required }: { current: number; required: number }) {
  const pct = Math.min((current / required) * 100, 100);
  const done = current >= required;
  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Review Consensus</span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: done ? '#10b981' : 'var(--text-primary)' }}>
          {current}/{required} {done ? '??Met' : ''}
        </span>
      </div>
      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: done ? '#10b981' : '#2563eb',
          borderRadius: '3px',
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

// ?�?�?� Main Page ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || 'https://api.studio.thegraph.com/query/12345/eip-nexus-subgraph/version/latest';

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<'All' | 'EIP' | 'GIP' | 'AIP'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Completed'>('All');
  const [sortBy, setSortBy] = useState<'Newest' | 'Reward'>('Newest');

  const { data, isLoading: loading, error } = useQuery({
    queryKey: ['bounties'],
    queryFn: async () => {
      try {
        const result = await request(SUBGRAPH_URL, GET_BOUNTIES);
        return result || { bounties: [] };
      } catch (err) {
        console.warn("Subgraph fetch failed, falling back to empty list:", err);
        return { bounties: [] };
      }
    }
  });

  // Map subgraph data to our UI model
  const BOUNTIES: Bounty[] = ((data as any)?.bounties || []).map((b: any) => ({
    id: Number(b.id),
    prId: `#${b.prId}`,
    title: `PR #${b.prId} (Metadata loaded from Subgraph)`,
    protocol: 'Ethereum',
    protocolLogo: 'ETH',
    amount: Number(b.rewardAmount) / 1e6, // Assuming USDC 6 decimals
    token: 'USDC',
    requiredReviews: Number(b.requiredReviews),
    currentReviews: Number(b.currentReviews),
    tags: ['Subgraph', 'Live'],
    deadline: b.deadline ? new Date(Number(b.deadline) * 1000).toISOString().split('T')[0] : '2026-09-01',
    difficulty: 'Intermediate',
    type: 'EIP'
  }));

  const filtered = BOUNTIES.filter(b => {
    const matchesType = activeFilter === 'All' || b.type === activeFilter || (activeFilter === 'EIP' && b.type === 'ERC') || (activeFilter === 'EIP' && b.type === 'Core');
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.protocol.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isCompleted = b.currentReviews >= b.requiredReviews;
    const matchesStatus = statusFilter === 'All' || (statusFilter === 'Open' && !isCompleted) || (statusFilter === 'Completed' && isCompleted);

    return matchesType && matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'Reward') {
      return b.amount - a.amount;
    }
    // Newest is default (using ID as proxy for newest here)
    return b.id - a.id;
  });

  return (
    <div className={styles.container}>
      
      {/* Top Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.heroTag}>PR Workflow Automation</div>
          <h2 className={styles.heroTitle}>Review PRs. Build Consensus.</h2>
          <p className={styles.heroSub}>
            Submit World ID-verified code reviews for EIPs, GIPs, and other protocol upgrades. Our AI sandbox runs the tests, you provide the consensus, and smart contracts handle the payouts.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsGrid}>
        {STATS.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Icon size={20} className={styles.statIcon} />
              </div>
              <div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters & Search */}
      <div className={styles.toolbar}>
        <div className={styles.filterTabs}>
          {(['All', 'EIP', 'GIP', 'AIP'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`${styles.filterTab} ${activeFilter === f ? styles.filterActive : ''}`}
            >
              {f === 'EIP' ? 'Ethereum (EIP)' : f === 'GIP' ? 'The Graph (GIP)' : f === 'AIP' ? 'Arbitrum (AIP)' : 'All Protocols'}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', padding: '8px 12px', fontSize: '15px', outline: 'none' }}
          >
            <option value="All" style={{ background: '#121214' }}>All Status</option>
            <option value="Open" style={{ background: '#121214' }}>Open</option>
            <option value="Completed" style={{ background: '#121214' }}>Completed</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white', padding: '8px 12px', fontSize: '15px', outline: 'none' }}
          >
            <option value="Newest" style={{ background: '#121214' }}>Sort by Newest</option>
            <option value="Reward" style={{ background: '#121214' }}>Sort by Highest Reward</option>
          </select>

          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIconSvg} />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Bounty Cards Grid */}
      <div className={styles.bountyGrid}>
        {filtered.map(bounty => {
          const isCompleted = bounty.currentReviews >= bounty.requiredReviews;
          return (
            <article key={bounty.id} className={`${styles.bountyCard} ${isCompleted ? styles.bountyCompleted : ''}`}>
              <div className={styles.cardHeader}>
                <div className={styles.protocolInfo}>
                  <div className={styles.protocolLogo}>{bounty.protocolLogo}</div>
                  <div>
                    <div className={styles.protocolName}>{bounty.protocol}</div>
                    <div className={styles.prId}>PR {bounty.prId}</div>
                  </div>
                </div>
                <div className={styles.cardBadges}>
                  <TypeBadge type={bounty.type} />
                  <DifficultyBadge level={bounty.difficulty} />
                </div>
              </div>

              <h3 className={styles.bountyTitle}>{bounty.title}</h3>

              <div className={styles.tagRow}>
                {bounty.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>

              <ProgressBar current={bounty.currentReviews} required={bounty.requiredReviews} />

              <div className={styles.cardFooter}>
                <div className={styles.bountyAmount}>
                  <span className={styles.amountValue}>${bounty.amount.toLocaleString()}</span>
                  <span className={styles.amountToken}>{bounty.token}</span>
                </div>
                
                <div className={styles.actionGroup}>
                  <div className={styles.deadline}>
                    <Clock size={14} />
                    {new Date(bounty.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  {/* Changed from external github link to internal detail page link */}
                  <Link
                    href={`/bounties/${bounty.id}`}
                    className={`${styles.reviewBtn} ${isCompleted ? styles.reviewBtnDone : ''}`}
                  >
                    {isCompleted ? 'Consensus Met' : <>View Proposal <ExternalLink size={14} /></>}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
