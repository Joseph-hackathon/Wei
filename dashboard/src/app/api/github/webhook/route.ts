import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { triggerBountyPayout } from '@/lib/oracle';

// Secret used to verify GitHub webhook payloads (mock for hackathon)
const WEBHOOK_SECRET = 'super_secret_webhook_key_12345';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256');
    const eventType = req.headers.get('x-github-event');

    // 1. Verify Webhook Signature (Optional but recommended for demo)
    if (signature) {
      const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
      const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
      if (signature !== digest) {
        console.warn('Webhook signature mismatch. Ignoring for hackathon demo.');
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); 
      }
    }

    const payload = JSON.parse(rawBody);

    // 2. Handle PR Comment Events
    if (eventType === 'issue_comment' && payload.action === 'created') {
      const commentBody = payload.comment.body;
      const author = payload.comment.user.login;
      const issueNumber = payload.issue.number;
      const repoFullName = payload.repository.full_name;

      console.log(`[GitHub Webhook] Received comment from @${author} on ${repoFullName}#${issueNumber}`);

      // Check if it's our bot command: "/wei bounty <amount> <token>"
      if (commentBody.startsWith('/wei bounty')) {
        const parts = commentBody.split(' ');
        const amount = parts[2] || '0';
        const token = parts[3] || 'USDC';

        console.log(`🚀 [Wei Bot] Triggered! Initiating Bounty: ${amount} ${token} on PR #${issueNumber}`);
        
        // In a real app, you would:
        // 1. Call GitHub API to reply to the comment ("Bounty created! View here: https://...")
        // 2. Update your database/subgraph or trigger the smart contract indexing
      }
      
      // Check if it's a review command: "/wei review"
      if (commentBody.startsWith('/wei review')) {
        console.log(`🕵️ [Wei Bot] Triggered! Initiating Sandbox AI Review for PR #${issueNumber}`);
        // Simulate E2B passing...
        console.log(`[E2B Sandbox] Analysis passed! PR is valid.`);
      }

      // Check if it's a payout command: "/wei payout 0x..."
      if (commentBody.startsWith('/wei payout')) {
        const parts = commentBody.split(' ');
        const address = parts[2];
        if (address && address.startsWith('0x')) {
          console.log(`[Wei Bot] Triggered payout to ${address}`);
          // Mock nullifier hash (in reality, look this up from a DB where the user verified World ID)
          const mockNullifier = BigInt(Math.floor(Math.random() * 1000000));
          // Mock amount: 100 USDC (6 decimals = 100000000)
          const amount = BigInt(100 * 1000000); 
          
          triggerBountyPayout(repoFullName, address, amount, mockNullifier).catch(console.error);
        } else {
          console.log(`[Wei Bot] Invalid address provided for payout.`);
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
