'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Target, ClipboardList, Medal, Trophy, Send } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { label: 'Bounties', href: '/bounties', icon: Target },
  { label: 'My Reviews', href: '/bounties/reviews', icon: ClipboardList },
  { label: 'Attestations', href: '/bounties/attestations', icon: Medal },
  { label: 'Leaderboard', href: '/bounties/leaderboard', icon: Trophy },
  { label: 'Submit PR', href: '/bounties/submit', icon: Send },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={styles.wrapper}>
      {/* ?? Sidebar ?? */}
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo}>
          <img src="/logos/wei.png" alt="Wei Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          <div>
            <div className={styles.logoTitle}>Wei</div>
            <div className={styles.logoSub}>Universal PIP Review</div>
          </div>
        </Link>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navActive : ''}`}
              >
                <Icon size={18} className={`${styles.navIcon} ${isActive ? styles.navIconActive : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.chainInfo}>
            <span className={styles.chainDot} />
            <span>Sepolia Testnet</span>
          </div>
          <div className={styles.poweredBy}>
            <span>Powered by</span>
            <span className={styles.chainlink}>Chainlink CRE</span>
          </div>
        </div>
      </aside>

      {/* ?? Main Content ?? */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>
              {NAV_ITEMS.find((n) => n.href === pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className={styles.headerRight}>
            <button
              className={`${styles.connectBtn} ${mounted && isConnected ? styles.connected : ''}`}
              onClick={() => isConnected ? disconnect() : connect({ connector: injected() })}
            >
              {mounted && isConnected ? (
                <>
                  <span className={styles.connectedDot} />
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
}



