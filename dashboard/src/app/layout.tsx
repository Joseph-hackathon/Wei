import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import '@xyflow/react/dist/style.css';

const sans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-sans" 
});

const display = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-display" 
});

export const metadata: Metadata = {
  title: "Wei",
  description: "Wei On-chain Developer Bounties & Reputation",
};

import { Providers } from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
