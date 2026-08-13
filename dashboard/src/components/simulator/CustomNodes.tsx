import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, CheckCircle2, Bot, Link, Award, DollarSign } from 'lucide-react';
import styles from './simulator.module.css';

// 1. Proposal Node (Start)
export const ProposalNode = memo(({ data }: any) => {
  return (
    <div className={`${styles.customNode} ${styles.proposalNode}`}>
      <div className={styles.nodeIconWrap}>
        <FileText size={20} className={styles.iconPurple} />
      </div>
      <div className={styles.nodeContent}>
        <div className={styles.nodeTitle}>{data.label}</div>
        <div className={styles.nodeSubtitle}>GitHub PR #42</div>
      </div>
      <Handle type="source" position={Position.Right} id="a" className={styles.handleRight} />
    </div>
  );
});
ProposalNode.displayName = 'ProposalNode';

// 2. Reviewer Node (World ID)
export const ReviewerNode = memo(({ data }: any) => {
  return (
    <div className={`${styles.customNode} ${styles.reviewerNode}`}>
      <Handle type="target" position={Position.Left} className={styles.handleLeft} />
      <div className={styles.nodeIconWrap}>
        <CheckCircle2 size={20} className={styles.iconGreen} />
      </div>
      <div className={styles.nodeContent}>
        <div className={styles.nodeTitle}>{data.label}</div>
        <div className={styles.nodeSubtitle}>World ID Verified</div>
      </div>
      <Handle type="source" position={Position.Right} id="a" className={styles.handleRight} />
    </div>
  );
});
ReviewerNode.displayName = 'ReviewerNode';

// 3. AI Agent Node
export const AIAgentNode = memo(({ data }: any) => {
  return (
    <div className={`${styles.customNode} ${styles.agentNode}`}>
      <Handle type="target" position={Position.Left} className={styles.handleLeft} />
      <div className={styles.nodeIconWrap}>
        <Bot size={20} className={styles.iconBlue} />
      </div>
      <div className={styles.nodeContent}>
        <div className={styles.nodeTitle}>{data.label}</div>
        <div className={styles.nodeSubtitle}>Static Analysis Bot</div>
      </div>
      <Handle type="source" position={Position.Right} id="a" className={styles.handleRight} />
    </div>
  );
});
AIAgentNode.displayName = 'AIAgentNode';

// 4. Smart Contract Node (Consensus)
export const SmartContractNode = memo(({ data }: any) => {
  return (
    <div className={`${styles.customNode} ${styles.contractNode}`}>
      <Handle type="target" position={Position.Left} className={styles.handleLeft} />
      <div className={styles.nodeIconWrap}>
        <Link size={20} className={styles.iconWhite} />
      </div>
      <div className={styles.nodeContent}>
        <div className={styles.nodeTitle}>{data.label}</div>
        <a href="https://sepolia.etherscan.io/address/0xb4A698ffd8C151c911Df17bB3356B2DDd88B1337" target="_blank" rel="noopener noreferrer" className={styles.txLink}>
          View Contract ↗
        </a>
      </div>
      <Handle type="source" position={Position.Right} id="a" className={styles.handleRight} />
    </div>
  );
});
SmartContractNode.displayName = 'SmartContractNode';

// 5. Reward/Payout Node
export const RewardNode = memo(({ data }: any) => {
  const isEAS = data.type === 'eas';
  return (
    <div className={`${styles.customNode} ${styles.rewardNode}`}>
      <Handle type="target" position={Position.Left} className={styles.handleLeft} />
      <div className={styles.nodeIconWrap}>
        {isEAS ? (
          <Award size={20} className={styles.iconOrange} />
        ) : (
          <DollarSign size={20} className={styles.iconGreen} />
        )}
      </div>
      <div className={styles.nodeContent}>
        <div className={styles.nodeTitle}>{data.label}</div>
        <a href="https://sepolia.etherscan.io/tx/0xd70e841a1b7999b0f3c2c7495ff7513989a7e19d211894def68b307a234df693" target="_blank" rel="noopener noreferrer" className={styles.txLink}>
          {isEAS ? 'View EAS ↗' : 'View Tx ↗'}
        </a>
      </div>
    </div>
  );
});
RewardNode.displayName = 'RewardNode';
