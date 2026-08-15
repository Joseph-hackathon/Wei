'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, Link as LinkIcon, FileText, CheckCircle2, Copy } from 'lucide-react';
import { useWriteContract, useAccount } from 'wagmi';
import { parseUnits, erc20Abi } from 'viem';
import { NEXUS_CORE_ADDRESS, USDC_ADDRESS } from '../../../config/constants';
import NexusCoreABI from '../../../config/NexusCore.json';

export default function SubmitPRPage() {
  const [activeTab, setActiveTab] = useState<'draft' | 'fund'>('draft');
  const [loading, setLoading] = useState(false);

  // EIP / GIP Form State
  const [protocol, setProtocol] = useState<'EIP' | 'GIP'>('EIP');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState('Standards Track');
  const [category, setCategory] = useState('Core');
  const [abstract, setAbstract] = useState('');
  const [motivation, setMotivation] = useState('');
  const [specification, setSpecification] = useState('');
  const [rationale, setRationale] = useState('');
  const [backwardCompatibility, setBackwardCompatibility] = useState('');
  const [generatedMarkdown, setGeneratedMarkdown] = useState('');

  // Fund Bounty State
  const [prUrl, setPrUrl] = useState('');
  const [bountyAmount, setBountyAmount] = useState('');
  const [requiredReviews, setRequiredReviews] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const date = new Date().toISOString().split('T')[0];
    
    let md = `---
${protocol === 'EIP' ? 'eip' : 'gip'}: <To be assigned>
title: ${title || '<Title>'}
author: ${author || '<Author>'}
discussions-to: <URL>
status: Draft
type: ${type}
category: ${category}
created: ${date}
---

## Abstract
${abstract || 'Enter a short summary here.'}

## Motivation
${motivation || '<!-- Describe why this proposal is needed -->'}

## Specification
${specification || '<!-- Describe the syntax and semantics of the feature -->'}

## Rationale
${rationale || '<!-- Explain why the design decisions were made -->'}

## Backwards Compatibility
${backwardCompatibility || '<!-- Discuss any backwards compatibility issues and how they will be mitigated -->'}
`;
    setGeneratedMarkdown(md);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    alert('Markdown copied to clipboard! Paste it into a new GitHub PR.');
  };

  const handleSubmitFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert('Connect wallet first!');
      return;
    }
    
    // Extract PR ID from URL
    const match = prUrl.match(/pull\/(\d+)/);
    const prId = match ? match[1] : prUrl.replace(/\D/g, '');
    if (!prId) {
      alert('Invalid PR URL');
      return;
    }

    setLoading(true);
    try {
      // 1. Approve USDC
      const amount = parseUnits(bountyAmount, 6);
      await writeContractAsync({
        address: USDC_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [NEXUS_CORE_ADDRESS as `0x${string}`, amount]
      });

      // 2. Create Bounty
      const hash = await writeContractAsync({
        address: NEXUS_CORE_ADDRESS as `0x${string}`,
        abi: NexusCoreABI.abi,
        functionName: 'createBounty',
        args: [
          BigInt(prId), // _prId
          USDC_ADDRESS as `0x${string}`, // _token
          amount, // _rewardAmount
          BigInt(requiredReviews) // _requiredReviews
        ]
      });

      setTxHash(hash);
    } catch (error) {
      console.error(error);
      alert('Transaction failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: "20px", paddingBottom: "40px" }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '1200px' }}
      >
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--bg-card)', padding: '8px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActiveTab('draft')}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: activeTab === 'draft' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'draft' ? 'white' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <FileText size={18} /> Step 1: Draft Proposal
          </button>
          <button 
            onClick={() => setActiveTab('fund')}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: activeTab === 'fund' ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeTab === 'fund' ? 'white' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <DollarSign size={18} /> Step 2: Fund Bounty
          </button>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border)' }}>
          
          {/* TAB 1: DRAFT */}
          {activeTab === 'draft' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Draft Proposal (PIP)</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.5 }}>
                Use our template generator to ensure your proposal strictly follows the formatting guidelines of your target protocol. Once generated, copy the Markdown and create a PR on GitHub.
              </p>

              <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Target Protocol</label>
                    <select value={protocol} onChange={(e) => setProtocol(e.target.value as 'EIP' | 'GIP')} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }}>
                      <option value="EIP" style={{ background: '#121214', color: 'white' }}>Ethereum (EIP)</option>
                      <option value="GIP" style={{ background: '#121214', color: 'white' }}>The Graph (GIP)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Proposal Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. ERC-721 Non-Fungible Token" required style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Author Name</label>
                    <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Alice (@alice123)" required style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }}>
                      <option value="Standards Track" style={{ background: '#121214', color: 'white' }}>Standards Track</option>
                      <option value="Meta" style={{ background: '#121214', color: 'white' }}>Meta</option>
                      <option value="Informational" style={{ background: '#121214', color: 'white' }}>Informational</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }}>
                      <option value="Core" style={{ background: '#121214', color: 'white' }}>Core</option>
                      <option value="Networking" style={{ background: '#121214', color: 'white' }}>Networking</option>
                      <option value="Interface" style={{ background: '#121214', color: 'white' }}>Interface</option>
                      <option value="ERC" style={{ background: '#121214', color: 'white' }}>ERC</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Abstract</label>
                    <textarea value={abstract} onChange={(e) => setAbstract(e.target.value)} rows={4} placeholder="A short (~200 word) description of the technical issue being addressed." style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}></textarea>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Motivation</label>
                    <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)} rows={4} placeholder="Why is this proposal needed?" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}></textarea>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Specification</label>
                  <textarea value={specification} onChange={(e) => setSpecification(e.target.value)} rows={6} placeholder="Describe the syntax and semantics of the feature in detail." style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Rationale</label>
                    <textarea value={rationale} onChange={(e) => setRationale(e.target.value)} rows={4} placeholder="Explain the design decisions made in this proposal." style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}></textarea>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Backwards Compatibility</label>
                    <textarea value={backwardCompatibility} onChange={(e) => setBackwardCompatibility(e.target.value)} rows={4} placeholder="Discuss any backward compatibility issues." style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical' }}></textarea>
                  </div>
                </div>

                <button type="submit" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginTop: '8px' }}>
                  Generate Markdown
                </button>
              </form>

              {generatedMarkdown && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Generated {protocol} Template</span>
                    <button onClick={copyToClipboard} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <Copy size={14} /> Copy to Clipboard
                    </button>
                  </div>
                  <pre style={{ background: '#09090b', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', overflowX: 'auto', fontSize: '13px', color: '#d4d4d8', lineHeight: 1.5 }}>
                    {generatedMarkdown}
                  </pre>
                  <div style={{ marginTop: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ fontSize: '14px', color: '#a1a1aa', margin: 0, lineHeight: 1.5 }}>
                      Now paste this into a new file on GitHub and submit a PR. Once you have the PR URL, move to <strong>Step 2</strong> to fund your bounty.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* TAB 2: FUND */}
          {activeTab === 'fund' && (
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Create Review Bounty</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.5 }}>
                Deposit USDC into the Wei smart contract to incentivize World ID verified developers to review your Pull Request.
              </p>

              <form onSubmit={handleSubmitFund} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      GitHub PR URL
                    </label>
                    <div style={{ position: 'relative' }}>
                      <LinkIcon size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                      <input 
                        type="url" 
                        required
                        value={prUrl}
                        onChange={(e) => setPrUrl(e.target.value)}
                        placeholder="https://github.com/ethereum/EIPs/pull/123"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px 14px 44px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Bounty Amount (USDC)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                      <input 
                        type="number" 
                        required
                        min="5"
                        value={bountyAmount}
                        onChange={(e) => setBountyAmount(e.target.value)}
                        placeholder="50"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px 14px 44px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Required Reviews
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Users size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} />
                      <input 
                        type="number" 
                        required
                        min="1"
                        max="10"
                        value={requiredReviews}
                        onChange={(e) => setRequiredReviews(e.target.value)}
                        placeholder="3"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px 14px 44px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Minimum Required Difficulty
                  </label>
                  <select style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', appearance: 'none' }}>
                    <option value="Beginner" style={{ background: '#121214', color: 'white' }}>Beginner</option>
                    <option value="Intermediate" style={{ background: '#121214', color: 'white' }}>Intermediate</option>
                    <option value="Expert" style={{ background: '#121214', color: 'white' }}>Expert</option>
                  </select>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <button 
                    type="submit" 
                    disabled={loading}
                    style={{ width: '100%', background: 'var(--gradient-blue)', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)' }}
                  >
                    {loading ? 'Depositing USDC & Creating...' : 'Deposit Bounty & Publish'}
                  </button>
                </div>
              </form>

              {/* Success Modal */}
              {txHash && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                  <div style={{ background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border)', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                    <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Transaction Complete!</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px', lineHeight: 1.5 }}>
                      Your bounty has been successfully created on Sepolia testnet. It may take a few minutes for The Graph to index and display it on the main page.
                    </p>
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'block', width: '100%', background: 'rgba(255,255,255,0.05)', color: '#60a5fa', padding: '12px', borderRadius: '8px', textDecoration: 'none', marginBottom: '12px', fontSize: '14px', fontWeight: 600, border: '1px solid rgba(96, 165, 250, 0.3)' }}
                    >
                      View on Etherscan ↗
                    </a>
                    <button 
                      onClick={() => { setTxHash(null); setPrUrl(''); setBountyAmount(''); setRequiredReviews(''); }}
                      style={{ width: '100%', background: 'var(--gradient-blue)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
