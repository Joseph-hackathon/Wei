import { ethers } from "hardhat";

async function main() {
  // Sepolia Testnet Addresses
  const WORLD_ID_ADDRESS = "0x42ff982464bc22d46e308f237b8ce0b6471e8dbc"; 
  // EAS Contract on Sepolia: https://docs.attest.sh/docs/quick--start/contracts
  const EAS_ADDRESS = "0xc2679fbd37d54388ce493f1db75320d236e1815e";
  
  // Dummy schema for hackathon purposes
  const SCHEMA_ID = "0x0000000000000000000000000000000000000000000000000000000000000000";
  
  const APP_ID = "app_staging_00000000000000000000000000000000";
  const ACTION_ID = "submit-review";

  console.log("Deploying NexusCore...");
  const NexusCore = await ethers.getContractFactory("NexusCore");
  
  const nexusCore = await NexusCore.deploy(
    WORLD_ID_ADDRESS,
    EAS_ADDRESS,
    SCHEMA_ID,
    APP_ID,
    ACTION_ID
  );

  await nexusCore.waitForDeployment();

  console.log(`NexusCore deployed to: ${await nexusCore.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
