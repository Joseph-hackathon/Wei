'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Activity, Search, Box, Lock } from 'lucide-react';
import styles from './atlas.module.css';

// Mock data for the floating cards (Subgraphs/Bots)
const BOTS = [
  {
    id: 'eip-review-bot',
    title: 'EIP-REVIEW-BOT — ETHEREUM',
    description: 'Watches for new EIP submissions on the ethereum/EIPs repository. When a PR is opened, it analyzes the structure, runs static E2B tests, and manages USDC bounties.',
    status: 'AUTONOMOUS',
    runs: '1,206',
    sources: '8/9',
    spent: '$2,450.00',
    color: '#60a5fa', // Blue accent
    tvl: '$976M',
    schema: [
      { id: '01', name: 'Ethereum EIP-721', val: '$258M' },
      { id: '02', name: 'Ethereum EIP-1155', val: '$217M' },
      { id: '03', name: 'Ethereum EIP-4337', val: '$184M' },
      { id: '04', name: 'Ethereum Core Specs', val: '$99.9M' },
    ],
    rotation: { x: 5, y: -15, z: 2 },
    position: { top: '15%', right: '10%' }
  },
  {
    id: 'gip-bounty-tracker',
    title: 'GIP-BOUNTY-TRACKER — THE GRAPH',
    description: 'Tracks Graph Improvement Proposals. Monitors forum activity and GitHub discussions, assigning GRT bounties to highly-rated community reviewers via World ID.',
    status: 'AUTONOMOUS',
    runs: '432',
    sources: '4/4',
    spent: '$800.00',
    color: '#10b981', // Green accent
    tvl: '$312M',
    schema: [
      { id: '01', name: 'GIP-0012 Network Upgrade', val: '$120M' },
      { id: '02', name: 'GIP-0045 Indexer Rewards', val: '$85M' },
      { id: '03', name: 'GIP-0052 Subgraph Studio', val: '$60M' },
    ],
    rotation: { x: -5, y: -20, z: -2 },
    position: { top: '45%', right: '25%' }
  },
  {
    id: 'l2-rollup-guard',
    title: 'L2-ROLLUP-GUARD — ARBITRUM',
    description: 'Read-only monitor for Arbitrum RIPs (Rollup Improvement Proposals). Flags potentially dangerous state transitions or sequencer changes during PR reviews.',
    status: 'READ ONLY',
    runs: '8,921',
    sources: '12/12',
    spent: '$0.00',
    color: '#a1a1aa', // Gray accent
    tvl: '$1.2B',
    schema: [
      { id: '01', name: 'Arbitrum RIP-4', val: '$800M' },
      { id: '02', name: 'Arbitrum RIP-7', val: '$400M' },
    ],
    rotation: { x: 10, y: -10, z: 5 },
    position: { top: '75%', right: '15%' }
  }
];

export default function AnalyticsPage() {
  const [activeBot, setActiveBot] = useState(BOTS[0]);

  return (
    <div className={styles.container}>
      
      {/* LEFT: Overlay Detailed Panel */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeBot.id}
          className={styles.overlayPanel}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className={styles.panelHeader} style={{ borderTop: `4px solid ${activeBot.color}` }}>
            <div className={styles.panelMeta}>
              <span>POLICY @0x4a...9b1c</span>
              <span className={styles.metaHighlight}>SERVER-ENFORCED</span>
              <span>CAP $5,000.00</span>
              <span>PER TX $500.00</span>
            </div>
            <div className={styles.panelMeta} style={{ marginBottom: 24 }}>
              <span>2 ALLOWLISTED</span>
              <span>EXPIRES 2026-12-31</span>
            </div>
            
            <h2 className={styles.panelTitle}>{activeBot.title}</h2>
            <div className={styles.panelSub}>
              {activeBot.status === 'AUTONOMOUS' ? 'published — on-chain attestation issued' : 'unpublished — read only mode'}
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
              {activeBot.description}
            </p>
            
            <div className={styles.panelActions}>
              <div className={styles.cardTag} style={{ background: activeBot.color, color: '#000', marginRight: '8px' }}>
                {activeBot.status}
              </div>
              <button className={styles.btnSecondary}>Run</button>
              <button className={styles.btnSecondary}>Watch 3 blocks</button>
              <button className={styles.btnSecondary}>Fork</button>
            </div>
          </div>

          <div className={styles.panelBody}>
            <div className={styles.tvlBlock}>
              <div className={styles.tvlLabel}>Total Value Secured</div>
              <div className={styles.tvlValue}>{activeBot.tvl}</div>
              <div className={styles.tvlDesc}>
                Summed across {activeBot.schema.length} active protocol integrations. 
                Data indexed directly from The Graph Subgraphs, representing 
                the capital secured by this specific PR automation bot.
              </div>
            </div>

            <div className={styles.dataTable}>
              <div className={styles.tableHeader}>
                <span>CROSS SCHEMA TVL</span>
                <span>{activeBot.schema.length} ranked entries</span>
              </div>
              {activeBot.schema.map((item) => (
                <div key={item.id} className={styles.tableRow}>
                  <div className={styles.tableColId}>{item.id}</div>
                  <div className={styles.tableColName}>{item.name}</div>
                  <div className={styles.tableColVal}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* RIGHT: 3D Canvas Context */}
      <div className={styles.canvas}>
        <div className={styles.canvasTitle}>
          <Search size={24} color="#60a5fa" />
          EXPLORE MINI APPS ON THE GRAPH
        </div>
        
        {BOTS.map((bot) => (
          <div 
            key={bot.id}
            className={`${styles.floatingCard} ${activeBot.id === bot.id ? styles.active : ''}`}
            style={{
              top: bot.position.top,
              right: bot.position.right,
              transform: `rotateX(${bot.rotation.x}deg) rotateY(${bot.rotation.y}deg) rotateZ(${bot.rotation.z}deg)`,
            }}
            onClick={() => setActiveBot(bot)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardTag} style={{ color: bot.color, border: `1px solid ${bot.color}` }}>
                {bot.status === 'AUTONOMOUS' ? <ShieldCheck size={12}/> : <Lock size={12}/>}
                {bot.status}
              </div>
              <span style={{ color: activeBot.id === bot.id ? bot.color : 'inherit' }}>
                {activeBot.id === bot.id ? 'SELECTED' : 'UNPUBLISHED'}
              </span>
            </div>
            
            <h3 className={styles.cardTitle}>{bot.title}</h3>
            <p className={styles.cardDesc}>{bot.description}</p>
            
            <div className={styles.cardStats}>
              <div>
                <div className={styles.statLabel}>RUNS</div>
                <div className={styles.statValue}>{bot.runs}</div>
              </div>
              <div>
                <div className={styles.statLabel}>SOURCES</div>
                <div className={styles.statValue}>{bot.sources}</div>
              </div>
              <div>
                <div className={styles.statLabel}>SPENT</div>
                <div className={styles.statValue}>{bot.spent}</div>
              </div>
            </div>
          </div>
        ))}

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: '24px', right: '40px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
          still scrollable — click another card to switch
        </div>
      </div>
    </div>
  );
}
