'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Globe, XCircle, CheckCircle2 } from 'lucide-react';
import SimulatorCanvas from '../components/simulator/SimulatorCanvas';
import styles from './landing.module.css';

const GlowingDot = ({ color = '#4C66FF', isCheck = false, className = '' }: { color?: string, isCheck?: boolean, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 20" className={className}>
    <rect width="20" height="20" x=".952" fill="#000000" rx="10"></rect>
    <rect width="20" height="20" x=".952" fill={color} fillOpacity=".16" rx="10"></rect>
    <rect width="19.5" height="19.5" x="1.202" y=".25" stroke={color} strokeOpacity=".88" strokeWidth=".5" rx="9.75"></rect>
    {isCheck ? (
      <path fill={color} d="m15.717 7.64-6 6a.377.377 0 0 1-.53 0L6.56 11.015a.375.375 0 0 1 .531-.53l2.36 2.36 5.734-5.735a.375.375 0 0 1 .531.53Z"></path>
    ) : (
      <circle cx="10.952" cy="10" r="3" fill={color} />
    )}
  </svg>
);

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <div className={styles.wrapper}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <img src="/logos/wei.png" alt="Wei Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          <span className={styles.logoText}>Wei</span>
        </div>
        <div className={styles.navLinks}>
          <Link href="#products" className={styles.navLink}>Products</Link>
          <Link href="#developers" className={styles.navLink}>Developers</Link>
          <Link href="#resources" className={styles.navLink}>Resources</Link>
          <Link href="/bounties" className={styles.launchBtn}>Launch App</Link>
        </div>
      </nav>

      {/* 1. Hero Section (Split Layout) */}
      <motion.section 
        className={styles.hero}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className={styles.heroContent}>
          <motion.div variants={itemVariants} className={styles.badge}>
            DECENTRALIZED PR VERIFICATION INFRASTRUCTURE
          </motion.div>
          <motion.h1 variants={itemVariants} className={styles.title}>
            Automate PR <span className={styles.highlight}>Reviews</span>.
          </motion.h1>
          <motion.p variants={itemVariants} className={styles.subtitle}>
            AI-driven GitHub Pull Request verification with sybil-resistant consensus and automated on-chain bounty payouts.
          </motion.p>
          <motion.div variants={itemVariants} className={styles.ctaGroup}>
            <Link href="/bounties" className={styles.primaryBtn}>
              Launch App <ArrowRight size={20} />
            </Link>
            <Link href="https://github.com/your-repo" className={styles.secondaryBtn}>
              Read Docs
            </Link>
          </motion.div>
        </div>
        
        <motion.div variants={itemVariants} className={styles.heroVisual}>
          <div className={styles.heroVisualInner}>
            <img 
              src="/images/Dashboard Interface Graphic.png" 
              alt="Dashboard Interface Graphic" 
              className={styles.heroImage}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* 2. Logo Cloud Marquee */}
      <section className={styles.logoCloud}>
        <div className={styles.logoCloudTitle}>Infrastructure Partners & Integrations</div>
        <div className={styles.marquee}>
          <div className={styles.marqueeContent}>
            <img src="/logos/world.png" alt="Worldcoin" className={styles.marqueeLogoImg} style={{ height: '96px' }} />
            <img src="/logos/eas.png" alt="Ethereum Attestation Service" className={styles.marqueeLogoImg} style={{ height: '56px' }} />
            <img src="/logos/chainlink.png" alt="Chainlink" className={styles.marqueeLogoImg} />
            <img src="/logos/the graph.png" alt="The Graph" className={styles.marqueeLogoImg} />
            <img src="/logos/ethereum.png" alt="Ethereum" className={styles.marqueeLogoImg} />
          </div>
          <div className={styles.marqueeContent} aria-hidden="true">
            <img src="/logos/world.png" alt="Worldcoin" className={styles.marqueeLogoImg} style={{ height: '96px' }} />
            <img src="/logos/eas.png" alt="Ethereum Attestation Service" className={styles.marqueeLogoImg} style={{ height: '56px' }} />
            <img src="/logos/chainlink.png" alt="Chainlink" className={styles.marqueeLogoImg} />
            <img src="/logos/the graph.png" alt="The Graph" className={styles.marqueeLogoImg} />
            <img src="/logos/ethereum.png" alt="Ethereum" className={styles.marqueeLogoImg} />
          </div>
        </div>
      </section>

      {/* 3. Core Features (Capabilities) */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          <h2>Wei<br/>Capabilities</h2>
          <p>Create and manage secure, programmable bounties and automate payouts for open-source protocol contributions across the entire Web3 ecosystem.</p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.iconBox}><Zap size={24} /></div>
            <h3>Automated Payouts</h3>
            <p>Smart contracts automatically distribute USDC/GRT rewards to reviewers once a Proposal reaches the required consensus threshold.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconBox}><ShieldCheck size={24} /></div>
            <h3>Sybil Resistance</h3>
            <p>Integrated with World ID to ensure that every code review is conducted by a unique, verified human entity.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconBox}><Globe size={24} /></div>
            <h3>On-chain Reputation</h3>
            <p>Reviewers earn cryptographic attestations via EAS, building an immutable portfolio of their security and audit expertise.</p>
          </div>
        </div>
      </section>

      {/* 4. VS Comparison Section */}
      <section className={styles.vsSection}>
        <div className={styles.vsContainer}>
          <div className={styles.vsHeader}>
            <h2>Why Wei?</h2>
            <p>Legacy governance (like <code>eip-review-bot</code> or forum polls) is slow, unincentivized, and vulnerable to sybil attacks. Wei brings accountability and acceleration to protocol upgrades.</p>
          </div>
          
          <div className={styles.vsTable}>
            <div className={styles.vsHeaderRow}>
              <div>Feature</div>
              <div>Legacy Bots & Forums</div>
              <div className={styles.highlightCol}>Wei Infrastructure</div>
            </div>
            
            <div className={styles.vsRow}>
              <div>Reviewer Incentive</div>
              <div><XCircle size={18} className={styles.cross}/> None (Pure volunteer work)</div>
              <div className={styles.provCol}><CheckCircle2 size={18} className={styles.check}/> Automated USDC/GRT Bounties</div>
            </div>
            
            <div className={styles.vsRow}>
              <div>Sybil Resistance</div>
              <div><XCircle size={18} className={styles.cross}/> Vulnerable to bot farms</div>
              <div className={styles.provCol}><CheckCircle2 size={18} className={styles.check}/> World ID Integration</div>
            </div>

            <div className={styles.vsRow}>
              <div>Reputation System</div>
              <div><XCircle size={18} className={styles.cross}/> Fragmented GitHub commits</div>
              <div className={styles.provCol}><CheckCircle2 size={18} className={styles.check}/> On-chain EAS Attestations</div>
            </div>

            <div className={styles.vsRow}>
              <div>Validation & Formatting</div>
              <div><XCircle size={18} className={styles.cross}/> Manual tracking via Auto-assign</div>
              <div className={styles.provCol}><CheckCircle2 size={18} className={styles.check}/> AI Agent Static Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.5 Deep Integrations Section */}
      <section className={styles.zigzagSection}>
        <div className={styles.zigzagContainer}>
          
          {/* Row 1: The Graph */}
          <div className={styles.zigzagRow}>
            <div className={styles.zigzagText}>
              <h3>Decentralized Data via <span style={{color: '#60a5fa'}}>The Graph</span></h3>
              <p>
                Wei utilizes Subgraphs to instantly index and query protocol improvement proposals. Instead of relying on centralized servers, all proposal states, votes, and bounty statuses are queried directly from the blockchain through our custom Sepolia Subgraph. This guarantees transparent, censorship-resistant access to governance data.
              </p>
            </div>
            <div className={styles.zigzagImageWrapper}>
              <img 
                src="/images/Subgraph Architecture Visual.png" 
                alt="Subgraph Architecture Visual" 
                className={styles.zigzagImg} 
              />
            </div>
          </div>

          {/* Row 2: Chainlink (Reverse) */}
          <div className={`${styles.zigzagRow} ${styles.reverse}`}>
            <div className={styles.zigzagText}>
              <h3>Secure Automation with <span style={{color: '#60a5fa'}}>Chainlink</span></h3>
              <p>
                To automate complex multi-step workflows like bounty distribution and AI verification steps, we integrate Chainlink Functions and Automation. When consensus is met, Chainlink decentralized oracle networks trigger the smart contract payouts reliably without manual intervention.
              </p>
            </div>
            <div className={styles.zigzagImageWrapper}>
              <img 
                src="/images/Chainlink Integration Visual.png" 
                alt="Chainlink Integration Visual" 
                className={styles.zigzagImg} 
              />
            </div>
          </div>

        </div>
      </section>

      {/* 5. Workflow Simulator Section */}
      <section className={styles.workflowSection}>
        <div className={styles.workflowHeader}>
          <h2>Wei Verification Simulator</h2>
          <p>Run the simulation to see how a proposal triggers AI and human reviews, culminating in a smart contract bounty payout.</p>
        </div>
        <div style={{ width: '100%', maxWidth: '1200px', height: '600px', margin: '0 auto' }}>
          <SimulatorCanvas />
        </div>
      </section>

      {/* 6. Massive Bottom CTA */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerInner}>
          <h2>Ready to scale your protocol's governance?</h2>
          <p>Join the next generation of decentralized code review and auditing infrastructure.</p>
          <Link href="/bounties" className={styles.ctaBannerBtn}>
            Start Building
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.logo}>
          <img src="/logos/wei.png" alt="Wei Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          <span className={styles.logoText}>Wei</span>
        </div>
        <div className={styles.footerText}>
          짤 2026 Wei. ETHGlobal Hackathon Submission.
        </div>
      </footer>
    </div>
  );
}



