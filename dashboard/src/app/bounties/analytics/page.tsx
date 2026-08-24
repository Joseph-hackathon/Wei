'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, MotionValue } from 'framer-motion';
import { ShieldCheck, Search, Lock, X, Activity } from 'lucide-react';
import styles from './atlas.module.css';

const BOTS = [
  {
    id: 'eip-review-bot', title: 'WEI EIP-REVIEWER',
    description: 'Automates Ethereum EIP structure checks. Assigns USDC bounties for valid E2B static test passes and verifies authors via World ID.',
    status: 'ACTIVE', runs: '1,206', sources: 'ethereum/EIPs', spent: '2,450 USDC', color: '#60a5fa', volume: '14,200 USDC',
    prs: [ { id: '#8010', name: 'EIP-7702 Delegation', val: '500 USDC' }, { id: '#7992', name: 'EIP-7540 Async Vault', val: '250 USDC' } ]
  },
  {
    id: 'gip-bounty-tracker', title: 'WEI GIP-TRACKER',
    description: 'Monitors Graph Improvement Proposals (GIPs). Distributes GRT rewards to verified community reviewers using World ID sybil resistance.',
    status: 'ACTIVE', runs: '432', sources: 'graphprotocol/GIPs', spent: '80,000 GRT', color: '#10b981', volume: '450,000 GRT',
    prs: [ { id: '#45', name: 'GIP-0045 Indexer Rewards', val: '5,000 GRT' }, { id: '#52', name: 'GIP-0052 Timeline', val: '2,000 GRT' } ]
  },
  {
    id: 'l2-rollup-guard', title: 'WEI ARBITRUM-GUARD',
    description: 'Read-only monitor for Arbitrum RIPs. Flags dangerous state transitions in PRs targeting sequencer contracts.',
    status: 'READ ONLY', runs: '8,921', sources: 'OffchainLabs/RIPs', spent: '0 USDC', color: '#a1a1aa', volume: '0 USDC',
    prs: [ { id: '#12', name: 'RIP-12 State Root', val: '0 USDC' } ]
  },
  {
    id: 'optimism-op-bot', title: 'WEI OP-RETROPGF',
    description: 'Scans Optimism repositories for RetroPGF contributions and assigns automated review scores before human validation.',
    status: 'ACTIVE', runs: '241', sources: 'ethereum-optimism', spent: '12,000 OP', color: '#ef4444', volume: '250,000 OP',
    prs: [ { id: '#102', name: 'Superchain Faucet', val: '1,500 OP' } ]
  },
  {
    id: 'base-deploy-guard', title: 'WEI BASE-INSPECTOR',
    description: 'Watches factory contract PRs on Base ecosystem repositories to enforce standard proxy patterns.',
    status: 'READ ONLY', runs: '15,023', sources: 'base-org/contracts', spent: '0 USDC', color: '#3b82f6', volume: '0 USDC',
    prs: [ { id: '#88', name: 'BaseBridge Upgrade', val: '0 USDC' } ]
  },
  {
    id: 'zksync-prover', title: 'WEI ZKSYNC-VERIFIER',
    description: 'Runs static analysis on zkSync Era circuit PRs, distributing bounties to external security researchers.',
    status: 'ACTIVE', runs: '98', sources: 'matter-labs/zksync', spent: '4,500 USDC', color: '#8b5cf6', volume: '18,000 USDC',
    prs: [ { id: '#401', name: 'Boojum Prover Update', val: '1,000 USDC' } ]
  }
];

// Helper component to calculate and apply 3D transforms per card based on scroll
function WheelCard({ 
  bot, 
  index, 
  total, 
  scrollYProgress, 
  isActive, 
  onClick 
}: { 
  bot: typeof BOTS[0], 
  index: number, 
  total: number, 
  scrollYProgress: MotionValue<number>,
  isActive: boolean,
  onClick: () => void
}) {
  // We want the wheel to rotate fully depending on how many items there are.
  // When scrollYProgress is 0, index 0 is at 0deg.
  // When scrollYProgress is 1, the last item is at 0deg.
  // Total angle range to scroll through: (total - 1) * 25 degrees.
  const anglePerItem = 25;
  const totalAngle = (total - 1) * anglePerItem;
  
  // Base angle for this specific card
  const baseAngle = index * anglePerItem;
  
  // Current angle = baseAngle - (scrollProgress * totalAngle)
  const currentAngle = useTransform(scrollYProgress, [0, 1], [baseAngle, baseAngle - totalAngle]);

  // Transform string combining rotation and translation to form a wheel
  // We translate the center of the wheel back by the radius (800px), 
  // rotate on X axis, then translate OUT by the radius so the front-most card is at Z=0 (normal size).
  const transform = useTransform(currentAngle, (a) => 
    `translateZ(-800px) rotateX(${a}deg) translateZ(800px) rotateY(-10deg)`
  );
  
  // Also fade out items that rotate too far out of view
  const opacity = useTransform(currentAngle, [-60, -30, 0, 30, 60], [0, 0.3, 1, 0.3, 0]);

  return (
    <motion.div
      className={`${styles.floatingCard} ${isActive ? styles.active : ''}`}
      style={{
        position: 'absolute',
        top: '50%',
        left: '75%', // Moved to the right as requested
        marginLeft: '-230px',
        marginTop: '-120px',
        transform,
        opacity,
        zIndex: isActive ? 50 : 10,
        pointerEvents: 'auto'
      }}
      onClick={onClick}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTag} style={{ color: bot.color, border: `1px solid ${bot.color}` }}>
          {bot.status === 'ACTIVE' ? <ShieldCheck size={12}/> : <Lock size={12}/>}
          {bot.status}
        </div>
        <span style={{ color: isActive ? bot.color : 'inherit' }}>
          {isActive ? 'SELECTED' : 'STANDBY'}
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
          <div className={styles.statLabel}>REPO</div>
          <div className={styles.statValue}>{bot.sources}</div>
        </div>
        <div>
          <div className={styles.statLabel}>BOUNTIES</div>
          <div className={styles.statValue}>{bot.spent}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [activeBot, setActiveBot] = useState<typeof BOTS[0] | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });

  return (
    <div className={styles.container}>
      
      {/* LEFT: Overlay Detailed Panel or Idle Animation */}
      <AnimatePresence mode="wait">
        {activeBot ? (
          <motion.div 
            key="panel"
            className={styles.overlayPanel}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ zIndex: 100 }}
          >
            <div className={styles.panelHeader} style={{ borderTop: `4px solid ${activeBot.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className={styles.panelMeta}>
                  <span>WEI CONFIG @{activeBot.id}</span>
                  <span className={styles.metaHighlight}>WORLD ID VERIFIED</span>
                  <span>AUTO-PAYOUTS</span>
                </div>
                <button 
                  onClick={() => setActiveBot(null)} 
                  style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className={styles.panelMeta} style={{ marginBottom: 24 }}>
                <span>BOUNTY LIMIT $5,000.00</span>
                <span>MAX PER PR 500 USDC</span>
              </div>
              
              <h2 className={styles.panelTitle}>{activeBot.title}</h2>
              <div className={styles.panelSub}>
                {activeBot.status === 'ACTIVE' ? 'Running on GitHub Webhooks — E2B Sandbox Enabled' : 'Dry-run Mode — Read Only'}
              </div>
              
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                {activeBot.description}
              </p>
              
              <div className={styles.panelActions}>
                <div className={styles.cardTag} style={{ background: activeBot.color, color: '#000', marginRight: '8px' }}>
                  {activeBot.status}
                </div>
                <button className={styles.btnSecondary}>Sync Webhook</button>
                <button className={styles.btnSecondary}>View Logs</button>
                <button className={styles.btnSecondary}>Edit Policy</button>
              </div>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.tvlBlock}>
                <div className={styles.tvlLabel}>Total Bounties Distributed</div>
                <div className={styles.tvlValue}>{activeBot.volume}</div>
                <div className={styles.tvlDesc}>
                  Total volume of automated rewards paid out to contributors on {activeBot.sources} via the Wei Smart Contracts.
                </div>
              </div>

              <div className={styles.dataTable}>
                <div className={styles.tableHeader}>
                  <span>RECENT AUTOMATED PRs</span>
                  <span>{activeBot.prs.length} latest entries</span>
                </div>
                {activeBot.prs.map((item) => (
                  <div key={item.id} className={styles.tableRow}>
                    <div className={styles.tableColId}>{item.id}</div>
                    <div className={styles.tableColName}>{item.name}</div>
                    <div className={styles.tableColVal}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '15%',
              transform: 'translateY(-50%)',
              width: '400px',
              zIndex: 10,
              pointerEvents: 'none'
            }}
          >
            {/* Idle Animation Graphic */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--accent-blue-light)' }}>
                <Activity size={32} className="animate-pulse" />
                <h2 style={{ fontFamily: 'monospace', letterSpacing: '2px', fontSize: '18px' }}>NETWORK ACTIVE</h2>
              </div>
              
              <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '12px', lineHeight: 2 }}>
                  &gt; INDEXING SUBGRAPHS...<br/>
                  <span style={{ color: '#10b981' }}>[OK]</span> Wei Core Proxy Synced<br/>
                  <span style={{ color: '#10b981' }}>[OK]</span> 14,302 Events Processed<br/>
                  &gt; WAITING FOR SELECTION...<br/>
                  <br/>
                  <span style={{ color: 'var(--text-muted)' }}>// Click any node on the right to intercept real-time telemetry and fork its automation policy.</span>
                </p>
              </div>
              
              {/* Simulated data stream visualization */}
              <div style={{ display: 'flex', gap: '4px', height: '60px', alignItems: 'flex-end', opacity: 0.5 }}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <motion.div
                    key={i}
                    style={{
                      width: '12px',
                      background: 'var(--accent-blue-light)',
                      borderRadius: '2px 2px 0 0'
                    }}
                    animate={{ height: ['10%', '100%', '30%', '80%', '10%'] }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT: 3D Canvas Context */}
      <div 
        className={styles.canvas} 
        ref={scrollContainerRef}
        style={{ overflowY: 'auto', overflowX: 'hidden' }}
      >
        {/* Scrollable track */}
        <div style={{ height: `${BOTS.length * 400}px`, position: 'relative' }}>
          {/* Sticky container for the 3D items */}
          <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', perspective: '1200px' }}>
              {BOTS.map((bot, index) => (
                <WheelCard 
                  key={bot.id}
                  bot={bot}
                  index={index}
                  total={BOTS.length}
                  scrollYProgress={scrollYProgress}
                  isActive={activeBot?.id === bot.id}
                  onClick={() => setActiveBot(bot)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ position: 'sticky', bottom: '24px', left: '100%', transform: 'translateX(-340px)', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)', zIndex: 60, paddingBottom: '24px', pointerEvents: 'none' }}>
          scroll down to rotate wheel — click another card to switch
        </div>
      </div>
    </div>
  );
}
