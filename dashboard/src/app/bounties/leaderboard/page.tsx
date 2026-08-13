'use client';

import { motion } from 'framer-motion';

const LEADERBOARD = [
  { rank: 1, address: '0xvitalik.eth', reviews: 45, reputation: 9.8, earnings: 12500 },
  { rank: 2, address: '0xsamczsun.eth', reviews: 38, reputation: 9.9, earnings: 10200 },
  { rank: 3, address: '0x3f...4a9b', reviews: 24, reputation: 8.5, earnings: 4800 },
  { rank: 4, address: '0xalice.eth', reviews: 20, reputation: 8.2, earnings: 3500 },
  { rank: 5, address: '0xbob.eth', reviews: 18, reputation: 7.9, earnings: 2900 },
];

export default function LeaderboardPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>Top Reviewers</h2>
          <p style={{ color: '#a1a1aa', fontSize: '15px' }}>
            Ranked by successful PIP reviews and total earned bounties across all protocols.
          </p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', width: '100px' }}>Rank</th>
              <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Reviewer</th>
              <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Accepted Reviews</th>
              <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Reputation Score</th>
              <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Earned</th>
            </tr>
          </thead>
          <tbody>
            {LEADERBOARD.map((user, i) => (
              <motion.tr 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={user.rank} 
                style={{ 
                  borderBottom: '1px solid var(--border)',
                  background: user.address.includes('3f') ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!user.address.includes('3f')) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
                onMouseLeave={(e) => {
                  if (!user.address.includes('3f')) e.currentTarget.style.background = 'transparent';
                }}
              >
                <td style={{ padding: '24px 32px', fontWeight: 800, fontSize: '20px', color: user.rank === 1 ? '#fbbf24' : user.rank === 2 ? '#9ca3af' : user.rank === 3 ? '#b45309' : 'white' }}>
                  #{user.rank}
                </td>
                <td style={{ padding: '24px 32px', fontWeight: 600, color: 'white', fontSize: '15px' }}>
                  {user.address} {user.address.includes('3f') && <span style={{ fontSize: '11px', background: '#2563eb', color: 'white', padding: '4px 8px', borderRadius: '4px', marginLeft: '12px', fontWeight: 700 }}>YOU</span>}
                </td>
                <td style={{ padding: '24px 32px', color: '#a1a1aa', fontWeight: 500, fontSize: '15px' }}>
                  {user.reviews}
                </td>
                <td style={{ padding: '24px 32px', color: '#a1a1aa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 600, color: 'white', fontSize: '15px' }}>{user.reputation}</span>
                    <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${user.reputation * 10}%`, height: '100%', background: '#10b981', borderRadius: '3px' }} />
                    </div>
                  </div>
                </td>
                <td style={{ padding: '24px 32px', fontWeight: 800, color: '#10b981', fontSize: '16px' }}>
                  ${user.earnings.toLocaleString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
