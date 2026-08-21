'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitPullRequest, Webhook, Key, ShieldCheck, CheckCircle2, ChevronRight, Plug } from 'lucide-react';

export default function IntegrationsPage() {
  const [githubConnected, setGithubConnected] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://<your-ngrok-url>/api/github/webhook');

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%" }}>
      <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>Bot Integrations</h2>
        <p style={{ color: '#a1a1aa', marginBottom: '40px', fontSize: '16px', lineHeight: 1.6, maxWidth: '700px' }}>
          Connect Wei Bot to your GitHub repositories to enable automated PR workflows, smart contract bounties, and World ID verification directly from GitHub PR comments.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          
          {/* GitHub App Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--border)', 
              borderRadius: '16px', 
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GitPullRequest size={40} color="black" />
                </div>
                <div>
                  <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>GitHub App Integration</h3>
                  <p style={{ color: '#a1a1aa', fontSize: '15px' }}>Install Wei Bot on your repositories to listen for <code style={{ background: '#27272a', padding: '2px 6px', borderRadius: '4px', color: '#60a5fa' }}>/wei bounty</code> commands.</p>
                </div>
              </div>
              <button 
                onClick={() => setGithubConnected(true)}
                style={{
                  background: githubConnected ? 'rgba(16, 185, 129, 0.1)' : 'var(--gradient-blue)',
                  color: githubConnected ? '#10b981' : 'white',
                  border: githubConnected ? '1px solid rgba(16, 185, 129, 0.2)' : 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  cursor: githubConnected ? 'default' : 'pointer'
                }}
              >
                {githubConnected ? <><CheckCircle2 size={18} /> Connected as @EthereumFoundation</> : 'Connect GitHub'}
              </button>
            </div>

            {githubConnected && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#e4e4e7' }}>Active Repositories</h4>
                
                {['ethereum/EIPs', 'ethereum/core-specs'].map((repo) => (
                  <div key={repo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '16px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Plug size={18} color="#60a5fa" />
                      <span style={{ fontSize: '15px', fontWeight: 600 }}>{repo}</span>
                    </div>
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '999px', fontSize: '13px', fontWeight: 600 }}>Active</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Webhook Configuration */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--border)', 
              borderRadius: '16px', 
              padding: '32px'
            }}
          >
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
                <Webhook size={32} color="#60a5fa" />
              </div>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Manual Webhook Configuration</h3>
                <p style={{ color: '#a1a1aa', fontSize: '15px' }}>For custom deployments or local testing (e.g. ngrok).</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#a1a1aa', marginBottom: '8px' }}>Payload URL</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="text" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    style={{ flex: 1, background: '#000', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', color: 'white', fontSize: '14px', fontFamily: 'monospace' }}
                  />
                  <button style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', padding: '0 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>Copy</button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#a1a1aa', marginBottom: '8px' }}>Webhook Secret</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="password" 
                    value="super_secret_webhook_key_12345"
                    readOnly
                    style={{ flex: 1, background: '#000', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', color: 'white', fontSize: '14px', fontFamily: 'monospace' }}
                  />
                  <button style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', padding: '0 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>Copy</button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
