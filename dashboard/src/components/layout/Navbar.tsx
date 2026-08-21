import React from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div className={styles.logo}>
          <img src="/logos/wei.png" alt="Wei Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          <span className={styles.logoText}>Wei</span>
        </div>
      </Link>
      <div className={styles.navLinks}>
        <Link href="/how-it-works" className={styles.navLink}>How It Works</Link>
        <Link href="/bot" className={styles.navLink}>GitHub Bot</Link>
        <Link href="/#resources" className={styles.navLink}>Resources</Link>
        <Link href="/bounties" className={styles.launchBtn}>Launch App</Link>
      </div>
    </nav>
  );
}
