'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from './simulator.module.css';
import StepModal from './StepModal';

import {
  ProposalNode,
  ReviewerNode,
  AIAgentNode,
  SmartContractNode,
  RewardNode,
} from './CustomNodes';

const initialNodes: Node[] = [
  {
    id: 'proposal',
    type: 'proposalNode',
    position: { x: 50, y: 250 },
    data: { label: 'Proposal Created' },
  },
  {
    id: 'reviewer1',
    type: 'reviewerNode',
    position: { x: 350, y: 150 },
    data: { label: 'Reviewer (Alice)' },
  },
  {
    id: 'reviewer2',
    type: 'reviewerNode',
    position: { x: 350, y: 250 },
    data: { label: 'Reviewer (Bob)' },
  },
  {
    id: 'agent',
    type: 'agentNode',
    position: { x: 350, y: 350 },
    data: { label: 'AI Reviewer' },
  },
  {
    id: 'contract',
    type: 'contractNode',
    position: { x: 650, y: 250 },
    data: { label: 'Wei Smart Contract' },
  },
  {
    id: 'reward-eas',
    type: 'rewardNode',
    position: { x: 950, y: 200 },
    data: { label: 'Reviewers', type: 'eas' },
  },
  {
    id: 'reward-bounty',
    type: 'rewardNode',
    position: { x: 950, y: 300 },
    data: { label: 'Reviewers', type: 'bounty' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'proposal', target: 'reviewer1', animated: false, style: { stroke: '#3f3f46' } },
  { id: 'e1-3', source: 'proposal', target: 'reviewer2', animated: false, style: { stroke: '#3f3f46' } },
  { id: 'e1-4', source: 'proposal', target: 'agent', animated: false, style: { stroke: '#3f3f46' } },
  { id: 'e2-5', source: 'reviewer1', target: 'contract', animated: false, style: { stroke: '#3f3f46' } },
  { id: 'e3-5', source: 'reviewer2', target: 'contract', animated: false, style: { stroke: '#3f3f46' } },
  { id: 'e4-5', source: 'agent', target: 'contract', animated: false, style: { stroke: '#3f3f46' } },
  { id: 'e5-6', source: 'contract', target: 'reward-eas', animated: false, style: { stroke: '#3f3f46' } },
  { id: 'e5-7', source: 'contract', target: 'reward-bounty', animated: false, style: { stroke: '#3f3f46' } },
];

export default function SimulatorCanvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isRunning, setIsRunning] = useState(false);

  const nodeTypes = useMemo(
    () => ({
      proposalNode: ProposalNode,
      reviewerNode: ReviewerNode,
      agentNode: AIAgentNode,
      contractNode: SmartContractNode,
      rewardNode: RewardNode,
    }),
    []
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );



  const [currentStep, setCurrentStep] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (!isRunning) return;

    if (currentStep > 0 && currentStep <= 4) {
      if (showModal) {
        // Modal is currently visible. After showing it for a while, close it and advance the step.
        timer = setTimeout(() => {
          setShowModal(false);
          nextStep();
        }, 8000);
      } else {
        // Modal is hidden, edge animation is happening. After 2 seconds, pop up the modal.
        timer = setTimeout(() => {
          setShowModal(true);
        }, 2000);
      }
    } else if (currentStep > 4) {
      // Simulation finished, wait a bit then close
      timer = setTimeout(() => {
        closeSimulation();
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRunning, currentStep, showModal]);

  const runSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCurrentStep(1);
    setShowModal(false); // Start with animation, then show modal
    setEdges(initialEdges);
  };

  const nextStep = () => {
    const next = currentStep + 1;
    setCurrentStep(next);
    setShowModal(false); // Hide modal while animating to next step

    if (next === 2) {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.source === 'proposal') {
            return { ...e, animated: true, style: { stroke: '#8b5cf6' } };
          }
          return e;
        })
      );
    } else if (next === 3) {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.source === 'proposal') {
            return { ...e, animated: false, style: { stroke: '#10b981' } };
          }
          if (e.target === 'contract') {
            return { ...e, animated: true, style: { stroke: '#8b5cf6' } };
          }
          return e;
        })
      );
    } else if (next === 4) {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.target === 'contract') {
            return { ...e, animated: false, style: { stroke: '#10b981' } };
          }
          if (e.source === 'contract') {
            return { ...e, animated: true, style: { stroke: '#f97316' } };
          }
          return e;
        })
      );
    } else if (next > 4) {
      setEdges((eds) =>
        eds.map((e) => {
          if (e.source === 'contract') {
            return { ...e, animated: false, style: { stroke: '#10b981' } };
          }
          return e;
        })
      );
    }
  };

  const closeSimulation = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setEdges(initialEdges);
  };

  const getModalData = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Bounty Creation via GitHub PR",
          description: "A new Protocol Improvement Proposal (PR) has been submitted. This automatically creates a bounty and triggers the Wei review process.",
          iframeSrc: "/bounties/submit"
        };
      case 2:
        return {
          title: "World ID Auth & AI Static Analysis",
          description: "Human reviewers authenticate their uniqueness via World ID. Meanwhile, the AI Agent begins static analysis on the proposed code changes.",
          iframeSrc: "/bounties/reviews"
        };
      case 3:
        return {
          title: "Smart Contract Consensus",
          description: "Reviews are submitted on-chain. Chainlink Automation verifies consensus by reading Oracle data feeds and triggering the Smart Contract.",
          iframeSrc: "/bounties/attestations"
        };
      case 4:
        return {
          title: "Rewards & EAS Reputation",
          description: "Consensus reached! The Smart Contract automatically executes payouts, distributing USDC bounties and minting EAS reputation badges.",
          iframeSrc: "/bounties/leaderboard"
        };
      default:
        return { title: "", description: "", iframeSrc: "" };
    }
  };

  const modalData = getModalData();

  return (
    <div style={{ width: '100%', height: '700px', position: 'relative' }} className={styles.simulatorContainer}>
      <button onClick={runSimulation} className={styles.simulateBtn} disabled={isRunning}>
        {isRunning ? 'Simulating Workflow...' : 'Run Simulation'}
      </button>
      
      {showModal && currentStep > 0 && currentStep <= 4 && (
        <StepModal 
          step={currentStep}
          title={modalData.title}
          description={modalData.description}
          iframeSrc={modalData.iframeSrc}
          onNext={nextStep}
          onClose={closeSimulation}
          isLastStep={currentStep === 4}
        />
      )}

      <div style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          className="dark"
          minZoom={0.5}
          maxZoom={2}
        >
          <Background color="#27272a" gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
