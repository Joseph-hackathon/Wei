'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import styles from './how.module.css';

export default function HowItWorksPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress through the timeline container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const rowVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.1,
      } 
    }
  };

  const textVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const visualVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  // For nodes on the timeline to pop in when reached
  const nodeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } }
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.inner}>

        {/* Header Section */}
        <motion.div 
          className={styles.headerSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.kicker}>
            <div className={styles.kickerLine}></div>
            EIP & GIP WORKFLOW AUTOMATION
          </div>
          <h1 className={styles.title}>No more manual reviews.</h1>
          <p className={styles.subtitle}>
            Following a single EIP Pull Request through our fully automated AI sandbox, human consensus pipeline, and on-chain payout logic.
          </p>
        </motion.div>

        {/* Timeline Section */}
        <div className={styles.timeline} ref={containerRef}>
          
          {/* Animated Fill Line */}
          <motion.div 
            style={{
              position: 'absolute',
              top: 0,
              bottom: '4rem', // match padding-bottom of timeline
              left: '50%',
              width: '2px',
              background: '#60a5fa', // Bright blue active line
              transformOrigin: 'top center',
              scaleY: scaleY,
              x: '-50%',
              zIndex: 5,
              boxShadow: '0 0 15px rgba(96, 165, 250, 0.8)'
            }}
          />

          {/* STEP 1: LEFT TEXT, RIGHT VISUAL */}
          <motion.div 
            className={`${styles.stepRow} ${styles.leftText}`}
            variants={rowVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
          >
            <div className={styles.nodeWrapper}>
              <motion.div className={styles.timelineNode} variants={nodeVariants}>
                <div className={styles.timelineNodeInner}></div>
              </motion.div>
            </div>
            
            <motion.div className={styles.textContent} variants={textVariants}>
              <span className={styles.stepNumber}>01</span>
              <h2 className={styles.stepTitle}>Trigger the review</h2>
              <p className={styles.stepDesc}>
                Comment directly on any GitHub Pull Request. The Wei bot intercepts the command and generates a secure checkout session, funding the bounty on-chain in USDC.
              </p>
            </motion.div>
            
            <motion.div className={styles.visualContent} variants={visualVariants}>
              <div className={styles.mockupCard}>
                <div style={{ color: '#60a5fa', marginBottom: '1rem' }}>User commented:</div>
                <div style={{ background: '#09090b', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  /wei bounty 150 USDC
                </div>
                <div style={{ color: '#10b981', marginTop: '1rem' }}>WeiBot replied:</div>
                <div style={{ background: '#09090b', padding: '1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '0.5rem' }}>
                  Checkout ready. <a href="#" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Deposit 150 USDC</a>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* STEP 2: RIGHT TEXT, LEFT VISUAL */}
          <motion.div 
            className={`${styles.stepRow} ${styles.rightText}`}
            variants={rowVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
          >
            <div className={styles.nodeWrapper}>
              <motion.div className={styles.timelineNode} variants={nodeVariants}>
                <div className={styles.timelineNodeInner}></div>
              </motion.div>
            </div>
            
            <motion.div className={styles.textContent} variants={visualVariants}> {/* Right text uses positive x offset */}
              <span className={styles.stepNumber}>02</span>
              <h2 className={styles.stepTitle}>Automate the Checks</h2>
              <p className={styles.stepDesc}>
                No more pulling branches manually. Our AI Sandbox dynamically builds the EIP proposal, runs test suites, and evaluates the logic against the protocol's constraints.
              </p>
            </motion.div>
            
            <motion.div className={styles.visualContent} variants={textVariants}> {/* Left visual uses negative x offset */}
              <div className={styles.mockupCard}>
                <div style={{ marginBottom: '1rem', color: '#60a5fa' }}>▣ E2B Isolated Environment</div>
                <motion.div className={styles.mockFile} variants={textVariants}>
                  <span>src/contracts/Nexus.sol</span>
                  <span className={styles.mockBadge}>compiled</span>
                </motion.div>
                <motion.div className={styles.mockFile} variants={textVariants}>
                  <span>test/reentrancy.t.sol</span>
                  <span className={`${styles.mockBadge} ${styles.danger}`}>failed</span>
                </motion.div>
                <motion.div className={styles.mockFile} variants={textVariants}>
                  <span>docs/README.md</span>
                  <span className={styles.mockBadge}>doc</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* STEP 3: LEFT TEXT, RIGHT VISUAL */}
          <motion.div 
            className={`${styles.stepRow} ${styles.leftText}`}
            variants={rowVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
          >
            <div className={styles.nodeWrapper}>
              <motion.div className={styles.timelineNode} variants={nodeVariants}>
                <div className={styles.timelineNodeInner}></div>
              </motion.div>
            </div>
            
            <motion.div className={styles.textContent} variants={textVariants}>
              <span className={styles.stepNumber}>03</span>
              <h2 className={styles.stepTitle}>Decentralized Consensus</h2>
              <p className={styles.stepDesc}>
                Instead of core devs getting bogged down in forum threads, verified network participants (World ID) submit their votes and technical reviews. We auto-tally the consensus.
              </p>
            </motion.div>
            
            <motion.div className={styles.visualContent} variants={visualVariants}>
              <div className={styles.mockupCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981' }}></div>
                  <span style={{ color: '#fff' }}>0xAlice.eth</span>
                  <span style={{ color: '#10b981', fontSize: '0.75rem' }}>✓ World ID Verified</span>
                </div>
                <div style={{ color: '#a8a29e', lineHeight: 1.5 }}>
                  "I reviewed the AI sandbox failure logs. The reentrancy risk is a false positive because the state is updated before the external call. Safe to merge."
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* STEP 4: RIGHT TEXT, LEFT VISUAL */}
          <motion.div 
            className={`${styles.stepRow} ${styles.rightText}`}
            variants={rowVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
          >
            <div className={styles.nodeWrapper}>
              <motion.div className={styles.timelineNode} variants={nodeVariants}>
                <div className={styles.timelineNodeInner}></div>
              </motion.div>
            </div>
            
            <motion.div className={styles.textContent} variants={visualVariants}>
              <span className={styles.stepNumber}>04</span>
              <h2 className={styles.stepTitle}>Settle on-chain</h2>
              <p className={styles.stepDesc}>
                Everything after this is automated. Chainlink verifies the consensus threshold and triggers the smart contract to disperse the USDC directly to the reviewers.
              </p>
            </motion.div>
            
            <motion.div className={styles.visualContent} variants={textVariants}>
              <div className={styles.mockupCard} style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <motion.div variants={textVariants} style={{ color: '#10b981', marginBottom: '1rem', fontWeight: 'bold' }}>TRANSACTION SUCCESS</motion.div>
                <motion.div variants={textVariants} style={{ display: 'flex', justifyContent: 'space-between', color: '#a8a29e', marginBottom: '0.5rem' }}>
                  <span>From:</span> <span style={{ color: '#fff' }}>NexusCore</span>
                </motion.div>
                <motion.div variants={textVariants} style={{ display: 'flex', justifyContent: 'space-between', color: '#a8a29e', marginBottom: '0.5rem' }}>
                  <span>To:</span> <span style={{ color: '#fff' }}>0xAlice.eth</span>
                </motion.div>
                <motion.div variants={textVariants} style={{ display: 'flex', justifyContent: 'space-between', color: '#a8a29e' }}>
                  <span>Amount:</span> <span style={{ color: '#60a5fa' }}>150 USDC</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
