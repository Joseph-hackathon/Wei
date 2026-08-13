'use client';

import { motion } from 'framer-motion';
import { Award, ShieldCheck, Zap } from 'lucide-react';

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

export default function AttestationsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
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
    </div>
  );
}
