'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import styles from './bot.module.css';

export default function BotPage() {
  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.inner}>
        
        <div className={styles.leftCol}>
          <motion.h1 
            className={styles.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Wei GitHub App
          </motion.h1>
          
          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Bring Web3 proposal automation directly into your repository workflow. No more manual forum reviews; just drop a command in your EIP PR.
          </motion.p>

          <motion.div 
            className={styles.installCommand}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            /wei bounty 150 USDC
          </motion.div>

          <motion.ul 
            className={styles.featuresList}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <li><CheckCircle2 size={20} color="#10b981" /> Triggers AI Sandbox immediately</li>
            <li><CheckCircle2 size={20} color="#10b981" /> Generates 1-click funding link</li>
            <li><CheckCircle2 size={20} color="#10b981" /> Alerts verified reviewers in Dashboard</li>
          </motion.ul>
        </div>

        <motion.div 
          className={styles.terminalVisual}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.terminalHeader}>
            <span className={`${styles.dot} ${styles.dotRed}`}></span>
            <span className={`${styles.dot} ${styles.dotYellow}`}></span>
            <span className={`${styles.dot} ${styles.dotGreen}`}></span>
          </div>
          <div className={styles.terminalContent}>
            <span className={styles.comment}>// GitHub Issue Comment Webhook</span><br/>
            <br/>
            <span className={styles.prompt}>github-bot$</span> <span className={styles.cmd}>Listening for triggers on ethereum/EIPs...</span><br/>
            <br/>
            [+] Detected payload on PR #9999<br/>
            [+] Parsed command: "/wei bounty 200 USDC"<br/>
            <br/>
            <span className={styles.prompt}>wei-core$</span> <span className={styles.cmd}>Generating smart contract intent...</span><br/>
            <span className={styles.success}>✔ Funding link generated:</span> https://wei.network/fund?pr=9999<br/>
            <br/>
            <span className={styles.prompt}>wei-api$</span> <span className={styles.cmd}>Replying to PR thread...</span><br/>
            <span className={styles.success}>✔ Comment posted successfully!</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
