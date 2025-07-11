/**
 * Simulation script for Private Freight Bidding Platform
 * Simulates a complete workflow with multiple users
 *
 * Usage:
 *   node scripts/simulate.js <CONTRACT_ADDRESS>
 *   node scripts/simulate.js 0x2E7B5f277595e3F1eeB9548ef654E178537cb90E
 */

import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getContractInstance(contractAddress) {
  const PrivateFreightBidding = await ethers.getContractFactory("PrivateFreightBidding");
  return PrivateFreightBidding.attach(contractAddress);
}

async function simulateFreightBidding(contractAddress) {
  console.log("=================================================");
  console.log("   Private Freight Bidding - Simulation");
  console.log("=================================================\n");
  console.log(`Contract Address: ${contractAddress}\n`);

  // Get signers
  const [owner, shipper1, shipper2, carrier1, carrier2, carrier3] = await ethers.getSigners();

  console.log("--- Accounts ---");
  console.log(`Owner:    ${owner.address}`);
  console.log(`Shipper1: ${shipper1.address}`);
  console.log(`Shipper2: ${shipper2.address}`);
  console.log(`Carrier1: ${carrier1.address}`);
  console.log(`Carrier2: ${carrier2.address}`);
  console.log(`Carrier3: ${carrier3.address}\n`);

  const contract = await getContractInstance(contractAddress);

  try {
    // Step 1: Register Shippers
    console.log("=================================================");
    console.log("STEP 1: Registering Shippers");
    console.log("=================================================\n");

    console.log("Registering Shipper 1...");
    const tx1 = await contract.connect(shipper1).registerShipper("Global Logistics Inc", "Global Logistics");
    await tx1.wait();
    console.log(`✓ Shipper 1 registered (tx: ${tx1.hash})\n`);

    console.log("Registering Shipper 2...");
    const tx2 = await contract.connect(shipper2).registerShipper("Express Freight Co", "Express Freight");
    await tx2.wait();
    console.log(`✓ Shipper 2 registered (tx: ${tx2.hash})\n`);

    await sleep(1000);

    // Step 2: Register Carriers
    console.log("=================================================");
    console.log("STEP 2: Registering Carriers");
    console.log("=================================================\n");

    console.log("Registering Carrier 1...");
    const tx3 = await contract.connect(carrier1).registerCarrier("FastTruck Transport", "FastTruck Ltd");
    await tx3.wait();
    console.log(`✓ Carrier 1 registered (tx: ${tx3.hash})\n`);

    console.log("Registering Carrier 2...");
    const tx4 = await contract.connect(carrier2).registerCarrier("Ocean Freight Lines", "Ocean Lines");
    await tx4.wait();
    console.log(`✓ Carrier 2 registered (tx: ${tx4.hash})\n`);

    console.log("Registering Carrier 3...");
    const tx5 = await contract.connect(carrier3).registerCarrier("Air Cargo Express", "AirCargo Inc");
    await tx5.wait();
    console.log(`✓ Carrier 3 registered (tx: ${tx5.hash})\n`);

    await sleep(1000);

    // Step 3: Create Freight Jobs
    console.log("=================================================");
    console.log("STEP 3: Creating Freight Jobs");
    console.log("=================================================\n");

    const deadlineInHours = 48;
    const deadline = Math.floor(Date.now() / 1000) + deadlineInHours * 3600;

    console.log("Shipper 1 creating Job 1: Shanghai to Los Angeles...");
    const job1Tx = await contract.connect(shipper1).createJob(
      "Shanghai, China",
      "Los Angeles, USA",
      "Electronics",
      5000, // 5000 kg
      ethers.parseEther("2.0"), // Max budget: 2 ETH
      deadline
    );
    await job1Tx.wait();
    console.log(`✓ Job 1 created (tx: ${job1Tx.hash})`);
    console.log(`  Route: Shanghai → Los Angeles`);
    console.log(`  Cargo: Electronics, 5000 kg`);
    console.log(`  Max Budget: 2 ETH\n`);

    console.log("Shipper 1 creating Job 2: New York to London...");
    const job2Tx = await contract.connect(shipper1).createJob(
      "New York, USA",
      "London, UK",
      "Machinery",
      8000, // 8000 kg
      ethers.parseEther("3.5"), // Max budget: 3.5 ETH
      deadline
    );
    await job2Tx.wait();
    console.log(`✓ Job 2 created (tx: ${job2Tx.hash})`);
    console.log(`  Route: New York → London`);
    console.log(`  Cargo: Machinery, 8000 kg`);
    console.log(`  Max Budget: 3.5 ETH\n`);

    console.log("Shipper 2 creating Job 3: Tokyo to Sydney...");
    const job3Tx = await contract.connect(shipper2).createJob(
      "Tokyo, Japan",
      "Sydney, Australia",
      "Textiles",
      3000, // 3000 kg
      ethers.parseEther("1.5"), // Max budget: 1.5 ETH
      deadline
    );
    await job3Tx.wait();
    console.log(`✓ Job 3 created (tx: ${job3Tx.hash})`);
    console.log(`  Route: Tokyo → Sydney`);
    console.log(`  Cargo: Textiles, 3000 kg`);
    console.log(`  Max Budget: 1.5 ETH\n`);

    await sleep(1000);

    // Step 4: Place Bids
    console.log("=================================================");
    console.log("STEP 4: Placing Bids (Encrypted)");
    console.log("=================================================\n");

    console.log("Carrier 1 bidding on Job 1...");
    const bid1Tx = await contract.connect(carrier1).placeBid(1, ethers.parseEther("1.8"));
    await bid1Tx.wait();
    console.log(`✓ Bid placed: 1.8 ETH (encrypted) (tx: ${bid1Tx.hash})\n`);

    console.log("Carrier 2 bidding on Job 1...");
    const bid2Tx = await contract.connect(carrier2).placeBid(1, ethers.parseEther("1.6"));
    await bid2Tx.wait();
    console.log(`✓ Bid placed: 1.6 ETH (encrypted) (tx: ${bid2Tx.hash})\n`);

    console.log("Carrier 3 bidding on Job 1...");
    const bid3Tx = await contract.connect(carrier3).placeBid(1, ethers.parseEther("1.9"));
    await bid3Tx.wait();
    console.log(`✓ Bid placed: 1.9 ETH (encrypted) (tx: ${bid3Tx.hash})\n`);

    console.log("Carrier 1 bidding on Job 2...");
    const bid4Tx = await contract.connect(carrier1).placeBid(2, ethers.parseEther("3.2"));
    await bid4Tx.wait();
    console.log(`✓ Bid placed: 3.2 ETH (encrypted) (tx: ${bid4Tx.hash})\n`);

    console.log("Carrier 2 bidding on Job 2...");
    const bid5Tx = await contract.connect(carrier2).placeBid(2, ethers.parseEther("3.0"));
    await bid5Tx.wait();
    console.log(`✓ Bid placed: 3.0 ETH (encrypted) (tx: ${bid5Tx.hash})\n`);

    console.log("Carrier 3 bidding on Job 3...");
    const bid6Tx = await contract.connect(carrier3).placeBid(3, ethers.parseEther("1.3"));
    await bid6Tx.wait();
    console.log(`✓ Bid placed: 1.3 ETH (encrypted) (tx: ${bid6Tx.hash})\n`);

    await sleep(1000);

    // Step 5: Check Job Status
    console.log("=================================================");
    console.log("STEP 5: Checking Job Status");
    console.log("=================================================\n");

    for (let jobId = 1; jobId <= 3; jobId++) {
      const job = await contract.jobs(jobId);
      console.log(`Job ${jobId}:`);
      console.log(`  Route: ${job.origin} → ${job.destination}`);
      console.log(`  Cargo: ${job.cargoType}, ${job.weight} kg`);
      console.log(`  Status: ${["Active", "Awarded", "Completed", "Cancelled"][job.status]}`);
      console.log(`  Total Bids: ${job.bidCount}`);
      console.log(`  Shipper: ${job.shipper}\n`);
    }

    // Step 6: Award Jobs
    console.log("=================================================");
    console.log("STEP 6: Awarding Jobs");
    console.log("=================================================\n");

    console.log("Shipper 1 awarding Job 1 to Carrier 2 (lowest bid)...");
    const award1Tx = await contract.connect(shipper1).awardJob(1, carrier2.address);
    await award1Tx.wait();
    console.log(`✓ Job 1 awarded to ${carrier2.address} (tx: ${award1Tx.hash})\n`);

    console.log("Shipper 1 awarding Job 2 to Carrier 2...");
    const award2Tx = await contract.connect(shipper1).awardJob(2, carrier2.address);
    await award2Tx.wait();
    console.log(`✓ Job 2 awarded to ${carrier2.address} (tx: ${award2Tx.hash})\n`);

    console.log("Shipper 2 awarding Job 3 to Carrier 3...");
    const award3Tx = await contract.connect(shipper2).awardJob(3, carrier3.address);
    await award3Tx.wait();
    console.log(`✓ Job 3 awarded to ${carrier3.address} (tx: ${award3Tx.hash})\n`);

    await sleep(1000);

    // Step 7: Complete Jobs
    console.log("=================================================");
    console.log("STEP 7: Completing Jobs");
    console.log("=================================================\n");

    console.log("Carrier 2 completing Job 1...");
    const complete1Tx = await contract.connect(carrier2).completeJob(1);
    await complete1Tx.wait();
    console.log(`✓ Job 1 completed (tx: ${complete1Tx.hash})\n`);

    console.log("Carrier 2 completing Job 2...");
    const complete2Tx = await contract.connect(carrier2).completeJob(2);
    await complete2Tx.wait();
    console.log(`✓ Job 2 completed (tx: ${complete2Tx.hash})\n`);

    console.log("Carrier 3 completing Job 3...");
    const complete3Tx = await contract.connect(carrier3).completeJob(3);
    await complete3Tx.wait();
    console.log(`✓ Job 3 completed (tx: ${complete3Tx.hash})\n`);

    // Step 8: Final Summary
    console.log("=================================================");
    console.log("STEP 8: Simulation Summary");
    console.log("=================================================\n");

    console.log("✓ Simulation completed successfully!\n");
    console.log("Summary:");
    console.log("  - 2 Shippers registered");
    console.log("  - 3 Carriers registered");
    console.log("  - 3 Freight jobs created");
    console.log("  - 6 Bids placed (all encrypted)");
    console.log("  - 3 Jobs awarded");
    console.log("  - 3 Jobs completed\n");

    console.log("Final Job Status:");
    for (let jobId = 1; jobId <= 3; jobId++) {
      const job = await contract.jobs(jobId);
      console.log(`  Job ${jobId}: ${["Active", "Awarded", "Completed", "Cancelled"][job.status]} - ${job.origin} → ${job.destination}`);
    }

    console.log("\n=================================================");
    console.log("Privacy Features Demonstrated:");
    console.log("=================================================");
    console.log("✓ All bid amounts encrypted using FHE");
    console.log("✓ Carriers cannot see competing bids");
    console.log("✓ Shippers can evaluate bids privately");
    console.log("✓ Winning bid revealed only upon award");
    console.log("✓ Complete audit trail on blockchain");
    console.log("=================================================\n");
  } catch (error) {
    console.error("\n❌ Simulation failed:");
    console.error(error.message);
    throw error;
  }
}

async function main() {
  const contractAddress = process.argv[2];

  if (!contractAddress) {
    // Try to load from deployment file
    const hre = await import("hardhat");

    const deploymentFile = path.join(
      __dirname,
      "..",
      "deployments",
      `${hre.network.name}-deployment.json`
    );

    if (fs.existsSync(deploymentFile)) {
      const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
      await simulateFreightBidding(deployment.contractAddress);
    } else {
      console.error("Usage: node scripts/simulate.js <CONTRACT_ADDRESS>");
      console.error("Or deploy the contract first to auto-detect the address");
      process.exit(1);
    }
  } else {
    await simulateFreightBidding(contractAddress);
  }
}

// Execute simulation
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { simulateFreightBidding };
