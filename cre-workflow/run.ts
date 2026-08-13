import { config } from 'dotenv';
import workflow from './workflow';

config();

async function main() {
  console.log('--- EIP Nexus Chainlink CRE Workflow Runner ---');
  console.log('Simulating a ReviewVerified event trigger from NexusCore...');
  
  // Mock CRE context
  const mockContext = {
    trigger: {
      data: {
        prId: '9999',
        reviewer: '0xabc123...',
      }
    },
    secrets: {
      get: async (key: string) => process.env[key] || ''
    }
  };

  try {
    const result = await workflow.run(mockContext as any);
    console.log('\n--- Workflow Execution Complete ---');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Workflow failed:', error);
  }
}

main();
