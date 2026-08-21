'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, ExternalLink, ClipboardList, CheckSquare, DollarSign, Award, ShieldCheck, Zap } from 'lucide-react';
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

const ATTESTATIONS = [
  {
    id: 'uid-01',
    name: 'Verified Protocol Reviewer',
    issuer: 'NexusCore.eth',
    date: '2026-08-01',
    icon: <ShieldCheck size={32} color="#10b981" />,
    description: 'World ID verified human developer authorized to review proposals.',
    color: '#10b981'
  },
  {
    id: 'uid-02',
    name: 'Expert Solidity Analyst',
    issuer: 'Ethereum Foundation',
    date: '2026-07-15',
    icon: <Award size={32} color="#a855f7" />,
    description: 'Consistently high-quality ERC reviews with proven security audits.',
    color: '#a855f7'
  },
  {
    id: 'uid-03',
    name: 'Early Adopter',
    issuer: 'Wei Protocol',
    date: '2026-06-01',
    icon: <Zap size={32} color="#f59e0b" />,
    description: 'Joined during the ETHGlobal Hackathon phase.',
    color: '#f59e0b'
  }
];

export default function MyDashboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "40px", width: "100%" }}>
      
      {/* Top Stats */}
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

      {/* Attestations Section */}
      <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>Your On-Chain Identity</h2>
        <p style={{ color: '#a1a1aa', marginBottom: '40px', fontSize: '15px', lineHeight: 1.6, maxWidth: '700px' }}>
          These are your Ethereum Attestation Service (EAS) badges. They represent your cryptographic reputation and unlock higher multipliers for future bounties across all supported protocols.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {ATTESTATIONS.map((att, i) => (
            <motion.div
              key={att.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid rgba(255,255,255,0.05)`,
                borderRadius: '16px',
                padding: '32px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s, border-color 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              }}
            >
              <div style={{
                position: 'absolute', top: '-40px', right: '-40px',
                width: '160px', height: '160px',
                background: att.color, opacity: 0.15, filter: 'blur(40px)', borderRadius: '50%',
                pointerEvents: 'none'
              }} />
              
              <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.03)', width: '64px', height: '64px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                {att.icon}
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'white' }}>{att.name}</h3>
              <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '24px', lineHeight: 1.6 }}>
                {att.description}
              </p>
              
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#71717a', fontWeight: 500 }}>Issuer: <span style={{ color: '#e4e4e7', fontWeight: 600 }}>{att.issuer}</span></span>
                <span style={{ color: '#71717a', fontWeight: 500 }}>{att.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Reviews Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Recent PR Reviews</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '20px 32px', fontSize: '14px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>PR Info</th>
              <th style={{ padding: '20px 32px', fontSize: '14px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
              <th style={{ padding: '20px 32px', fontSize: '14px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Earned</th>
              <th style={{ padding: '20px 32px', fontSize: '14px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
              <th style={{ padding: '20px 32px', fontSize: '14px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Tx Hash</th>
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
                <td style={{ padding: '24px 32px' }}>
                  <div style={{ fontWeight: 600, fontSize: '16px', color: 'white', marginBottom: '6px' }}>
                    {review.prTitle}
                  </div>
                  <div style={{ fontSize: '14px', color: '#a1a1aa' }}>
                    {review.protocol} • <span style={{ color: '#60a5fa' }}>{review.prId}</span>
                  </div>
                </td>
                <td style={{ padding: '24px 32px' }}>
                  {review.status === 'Accepted' && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 600 }}><CheckCircle2 size={16}/> Accepted</span>}
                  {review.status === 'Pending' && <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 600 }}><Clock size={16}/> Pending</span>}
                  {review.status === 'Rejected' && <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 600 }}><XCircle size={16}/> Rejected</span>}
                </td>
                <td style={{ padding: '24px 32px', fontWeight: 700, fontSize: '17px', color: review.bounty > 0 ? '#10b981' : '#71717a' }}>
                  {review.bounty > 0 ? `$${review.bounty}` : '-'}
                </td>
                <td style={{ padding: '24px 32px', fontSize: '15px', color: '#a1a1aa' }}>
                  {review.date}
                </td>
                <td style={{ padding: '24px 32px' }}>
                  <a href="#" style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 600, textDecoration: 'none' }}>
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
