'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, ExternalLink, ClipboardList, CheckSquare, DollarSign } from 'lucide-react';
import styles from '../page.module.css';

const MOCK_REVIEWS = [
  {
    id: 1,
    prTitle: 'EIP-7702: Set EOA account code for one transaction',
    prId: '#9999',
    protocol: 'Ethereum',
    status: 'Accepted',
    bounty: 50,
    date: '2026-08-01',
    hash: '0x1234...abcd',
  },
  {
    id: 2,
    prTitle: 'GIP-0052: Subgraph API Versioning and Migration Strategy',
    prId: '#102',
    protocol: 'The Graph',
    status: 'Pending',
    bounty: 40,
    date: '2026-08-05',
    hash: '0x5678...efgh',
  },
  {
    id: 3,
    prTitle: 'ERC-6900: Modular Smart Contract Accounts',
    prId: '#5500',
    protocol: 'Ethereum',
    status: 'Rejected',
    bounty: 0,
    date: '2026-07-28',
    hash: '0x9abc...1234',
  }
];

export default function MyReviewsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%" }}>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <ClipboardList size={20} className={styles.statIcon} />
          </div>
          <div>
            <div className={styles.statValue}>12</div>
            <div className={styles.statLabel}>Total Reviews</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <CheckSquare size={20} className={styles.statIcon} style={{ color: '#10b981' }} />
          </div>
          <div>
            <div className={styles.statValue}>9</div>
            <div className={styles.statLabel}>Accepted</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrapper}>
            <DollarSign size={20} className={styles.statIcon} style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <div className={styles.statValue}>$450</div>
            <div className={styles.statLabel}>Earned (USDC)</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>PR Info</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Earned</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_REVIEWS.map((review, i) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={review.id} 
                style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'white', marginBottom: '6px' }}>
                    {review.prTitle}
                  </div>
                  <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                    {review.protocol} • <span style={{ color: '#60a5fa' }}>{review.prId}</span>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  {review.status === 'Accepted' && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}><CheckCircle2 size={16}/> Accepted</span>}
                  {review.status === 'Pending' && <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}><Clock size={16}/> Pending</span>}
                  {review.status === 'Rejected' && <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}><XCircle size={16}/> Rejected</span>}
                </td>
                <td style={{ padding: '20px 24px', fontWeight: 700, fontSize: '15px', color: review.bounty > 0 ? '#10b981' : '#71717a' }}>
                  {review.bounty > 0 ? `$${review.bounty}` : '-'}
                </td>
                <td style={{ padding: '20px 24px', fontSize: '13px', color: '#a1a1aa' }}>
                  {review.date}
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <a href="#" style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                    {review.hash} <ExternalLink size={14} />
                  </a>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
