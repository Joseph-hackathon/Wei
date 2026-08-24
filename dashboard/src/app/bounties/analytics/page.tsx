'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, Search, Lock, X } from 'lucide-react';
import styles from './atlas.module.css';

// Expand to 6 items to show the wheel effect better
const BOTS = [
  {
    id: 'eip-review-bot', title: 'EIP-REVIEW-BOT — ETHEREUM',
    description: 'Watches for new EIP submissions on the ethereum/EIPs repository.',
    status: 'AUTONOMOUS', runs: '1,206', sources: '8/9', spent: '$2,450.00', color: '#60a5fa', tvl: '$976M',
    schema: [ { id: '01', name: 'Ethereum EIP-721', val: '$258M' }, { id: '02', name: 'Ethereum EIP-1155', val: '$217M' } ]
  },
  {
    id: 'gip-bounty-tracker', title: 'GIP-BOUNTY-TRACKER — THE GRAPH',
    description: 'Tracks Graph Improvement Proposals. Monitors forum activity and GitHub.',
    status: 'AUTONOMOUS', runs: '432', sources: '4/4', spent: '$800.00', color: '#10b981', tvl: '$312M',
    schema: [ { id: '01', name: 'GIP-0012 Network Upgrade', val: '$120M' } ]
  },
  {
    id: 'l2-rollup-guard', title: 'L2-ROLLUP-GUARD — ARBITRUM',
    description: 'Read-only monitor for Arbitrum RIPs (Rollup Improvement Proposals).',
    status: 'READ ONLY', runs: '8,921', sources: '12/12', spent: '$0.00', color: '#a1a1aa', tvl: '$1.2B',
    schema: [ { id: '01', name: 'Arbitrum RIP-4', val: '$800M' } ]
  },
  {
    id: 'optimism-op-bot', title: 'OP-GOV-BOT — OPTIMISM',
    description: 'Automates OP token grant reviews based on predefined metrics.',
    status: 'AUTONOMOUS', runs: '241', sources: '2/3', spent: '$1,200.00', color: '#ef4444', tvl: '$450M',
    schema: [ { id: '01', name: 'RetroPGF Round 3', val: '$300M' } ]
  },
  {
    id: 'base-deploy-guard', title: 'BASE-DEPLOY-GUARD — BASE',
    description: 'Watches factory contract deployments on Base mainnet.',
    status: 'READ ONLY', runs: '15,023', sources: '1/1', spent: '$0.00', color: '#3b82f6', tvl: '$2.1B',
    schema: [ { id: '01', name: 'Base Mainnet TVL', val: '$2.1B' } ]
  },
  {
    id: 'zksync-prover', title: 'ZKSYNC-PROVER-BOT — ZKSYNC',
    description: 'Analyzes zero knowledge proof submissions for validity.',
    status: 'AUTONOMOUS', runs: '98', sources: '5/5', spent: '$3,400.00', color: '#8b5cf6', tvl: '$890M',
    schema: [ { id: '01', name: 'zkSync Era', val: '$890M' } ]
  }
];

export default function AnalyticsPage() {
  // 1. Initial state is null, so left panel is hidden.
  const [activeBot, setActiveBot] = useState<typeof BOTS[0] | null>(null);

  // 2. Scroll container for the roulette effect
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress of the hidden scroll layer
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });

  // Map scroll progress (0 to 1) to a rotation angle. 
  // e.g. 0% = 0deg, 100% = -100deg (rotates the wheel up)
  const wheelRotation = useTransform(scrollYProgress, [0, 1], [0, -(BOTS.length * 15)]);

  return (
    <div className={styles.container}>
      
      {/* LEFT: Overlay Detailed Panel */}
      <AnimatePresence mode="wait">
        {activeBot && (
          <motion.div 
            key={activeBot.id}
            className={styles.overlayPanel}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className={styles.panelHeader} style={{ borderTop: `4px solid ${activeBot.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className={styles.panelMeta}>
                  <span>POLICY @0x4a...9b1c</span>
                  <span className={styles.metaHighlight}>SERVER-ENFORCED</span>
                  <span>CAP $5,000.00</span>
                </div>
                <button 
                  onClick={() => setActiveBot(null)} 
                  style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
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
        )}
      </AnimatePresence>

      {/* RIGHT: 3D Canvas Context (Now the scroll container itself) */}
      <div 
        className={styles.canvas} 
        ref={scrollContainerRef}
        style={{ overflowY: 'auto' }}
      >
        <div style={{ position: 'sticky', top: '40px', left: '380px', zIndex: 10 }}>
          <div className={styles.canvasTitle}>
            <Search size={24} color="#60a5fa" />
            EXPLORE MINI APPS ON THE GRAPH
          </div>
        </div>
        
        {/* Huge height wrapper to enable scrolling */}
        <div style={{ height: `${BOTS.length * 400}px`, position: 'relative' }}>
          
          {/* The visual 3D wheel container, sticky to the viewport center */}
          <motion.div 
            style={{
              position: 'sticky',
              top: '50%',
              left: '90%', // Push to the right
              width: '1px',
              height: '1px',
              transformStyle: 'preserve-3d',
              rotateX: wheelRotation, // Rotate the entire wheel based on scroll
            }}
          >
            {BOTS.map((bot, index) => {
              // Each card is distributed along a circle around the X-axis
              const angle = index * 18; // 18 degrees between cards
              const radius = 900; // Large radius makes it feel like a gentle curve
              
              return (
                <div 
                  key={bot.id}
                  className={`${styles.floatingCard} ${activeBot?.id === bot.id ? styles.active : ''}`}
                  style={{
                    // Center the card on the 1x1px origin before translating
                    marginLeft: '-230px',
                    marginTop: '-120px', 
                    // Rotate to its slot on the wheel, then push it out by the radius
                    transform: `rotateX(${angle}deg) translateZ(${radius}px) rotateY(-15deg)`,
                  }}
                  onClick={() => setActiveBot(bot)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTag} style={{ color: bot.color, border: `1px solid ${bot.color}` }}>
                      {bot.status === 'AUTONOMOUS' ? <ShieldCheck size={12}/> : <Lock size={12}/>}
                      {bot.status}
                    </div>
                    <span style={{ color: activeBot?.id === bot.id ? bot.color : 'inherit' }}>
                      {activeBot?.id === bot.id ? 'SELECTED' : 'UNPUBLISHED'}
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
              );
            })}
          </motion.div>
        </div>

        {/* Legend */}
        <div style={{ position: 'sticky', bottom: '24px', left: '100%', transform: 'translateX(-340px)', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)', zIndex: 5, paddingBottom: '24px' }}>
          scroll down to rotate wheel — click another card to switch
        </div>
      </div>
    </div>
  );
}
