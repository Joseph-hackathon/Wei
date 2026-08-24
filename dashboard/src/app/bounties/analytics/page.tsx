'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, MotionValue } from 'framer-motion';
import { ShieldCheck, Search, Lock, X, Activity } from 'lucide-react';
import styles from './atlas.module.css';

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
          {bot.status === 'AUTONOMOUS' ? <ShieldCheck size={12}/> : <Lock size={12}/>}
          {bot.status}
        </div>
        <span style={{ color: isActive ? bot.color : 'inherit' }}>
          {isActive ? 'SELECTED' : 'UNPUBLISHED'}
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
        <div style={{ position: 'sticky', top: '60px', left: '75%', marginLeft: '-230px', zIndex: 60, pointerEvents: 'none', width: '460px' }}>
          <div className={styles.canvasTitle}>
            <Search size={24} color="#60a5fa" />
            EXPLORE MINI APPS ON THE GRAPH
          </div>
        </div>
        
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
