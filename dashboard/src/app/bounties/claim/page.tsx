'use client';

import { useState } from 'react';
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit';
import { CheckCircle, Github, Wallet } from 'lucide-react';
import styles from './claim.module.css';

export default function ClaimBountyPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [nullifier, setNullifier] = useState<string | null>(null);

  const handleVerify = (result: ISuccessResult) => {
    console.log("Proof received from IDKit!", result);
    // In a real app, send result.proof, result.nullifier_hash to backend
    setNullifier(result.nullifier_hash);
    setIsVerified(true);
  };

  const handleLinkBounty = async () => {
    if (!walletAddress || !githubUsername || !isVerified) return;
    
    // For the hackathon demo, we just show an alert
    alert(`Successfully linked!\nGitHub: ${githubUsername}\nWallet: ${walletAddress}\nWorld ID Nullifier: ${nullifier?.slice(0, 10)}...`);
    
    // Ideally this POSTs to an API route to save the mapping
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Claim PR Bounty</h1>
      <p className={styles.subtitle}>
        Link your GitHub account and verify your humanity via World ID to receive automated payouts from Wei.
      </p>

      <div className={styles.card}>
        {/* Step 1: GitHub */}
        <div className={styles.step}>
          <div className={styles.stepHeader}>
            <Github size={20} />
            <h2>1. Link GitHub Account</h2>
          </div>
          <input 
            type="text" 
            placeholder="GitHub Username" 
            className={styles.input}
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
          />
        </div>

        {/* Step 2: Wallet */}
        <div className={styles.step}>
          <div className={styles.stepHeader}>
            <Wallet size={20} />
            <h2>2. Receiving Wallet</h2>
          </div>
          <input 
            type="text" 
            placeholder="0x... Address" 
            className={styles.input}
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
        </div>

        {/* Step 3: World ID */}
        <div className={styles.step}>
          <div className={styles.stepHeader}>
            <CheckCircle size={20} color={isVerified ? '#10b981' : 'currentColor'} />
            <h2>3. Sybil Resistance</h2>
          </div>
          {isVerified ? (
            <div className={styles.successBox}>
              <CheckCircle size={16} /> Successfully verified as a unique human.
            </div>
          ) : (
            <IDKitWidget
              app_id="app_staging_placeholder" // Get a real app_id from Worldcoin Developer Portal for prod
              action="verify_bounty_hunter"
              verification_level={VerificationLevel.Device} // Or Orb for strict
              handleVerify={handleVerify}
              onSuccess={handleVerify}
            >
              {({ open }) => (
                <button onClick={open} className={styles.worldIdBtn}>
                  Verify with World ID
                </button>
              )}
            </IDKitWidget>
          )}
        </div>

        <button 
          className={styles.submitBtn} 
          disabled={!isVerified || !walletAddress || !githubUsername}
          onClick={handleLinkBounty}
        >
          Register Bounty Identity
        </button>
      </div>
    </div>
  );
}
