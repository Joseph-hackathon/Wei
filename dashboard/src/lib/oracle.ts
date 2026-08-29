import { ethers } from 'ethers';

// WeiBountyVault ABI fragment for distributeBounty
const ABI = [
  "function distributeBounty(string repoId, address contributor, uint256 amount, uint256 nullifierHash) external"
];

// In a real scenario, this would be an Infura/Alchemy RPC URL
// For hackathon mock, we use a placeholder or local testnet
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Anvil default account 0
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export async function triggerBountyPayout(
  repoId: string, 
  contributorAddress: string, 
  amount: bigint, 
  nullifierHash: bigint
) {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    console.log(`[Oracle] Distributing bounty for ${repoId} to ${contributorAddress}`);
    
    // Call the contract (simulate transaction)
    const tx = await contract.distributeBounty(repoId, contributorAddress, amount, nullifierHash);
    
    console.log(`[Oracle] Tx submitted: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`[Oracle] Tx confirmed in block ${receipt.blockNumber}`);
    
    return { success: true, txHash: tx.hash };
  } catch (error: any) {
    console.error('[Oracle] Payout failed:', error);
    return { success: false, error: error.message };
  }
}
