/**
 * Simulation script for PrivateFreightBiddingEnhanced (FHE Version)
 * Demonstrates complete workflow with FHE encryption
 *
 * Usage:
 *   node scripts/simulate-enhanced.js <CONTRACT_ADDRESS>
 */

const hre = require("hardhat");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getContractInstance(contractAddress) {
  const PrivateFreightBiddingEnhanced = await hre.ethers.getContractFactory(
    "PrivateFreightBiddingEnhanced"
  );
  return PrivateFreightBiddingEnhanced.attach(contractAddress);
}

async function simulateFHEWorkflow(contractAddress) {
  console.log("=================================================");
  console.log("   Private Freight Bidding Enhanced Simulation");
  console.log("   FHE-Enabled Workflow Demonstration");
  console.log("=================================================\n");
  console.log(`Contract Address: ${contractAddress}\n`);

  // Get signers
  const [owner, shipper1, shipper2, carrier1, carrier2, carrier3, carrier4] =
    await hre.ethers.getSigners();

  console.log("--- Accounts ---");
  console.log(`Owner:    ${owner.address}`);
  console.log(`Shipper1: ${shipper1.address}`);
  console.log(`Shipper2: ${shipper2.address}`);
  console.log(`Carrier1: ${carrier1.address}`);
  console.log(`Carrier2: ${carrier2.address}`);
  console.log(`Carrier3: ${carrier3.address}`);
  console.log(`Carrier4: ${carrier4.address}\n`);

  const contract = await getContractInstance(contractAddress);

  try {
    // Step 1: Register Shippers
    console.log("=================================================");
    console.log("STEP 1: Registering Shippers");
    console.log("=================================================\n");

    console.log("Registering Shipper 1...");
    const tx1 = await contract.connect(shipper1).registerShipper();
    await tx1.wait();
    console.log(`✓ Shipper 1 registered\n`);

    console.log("Registering Shipper 2...");
    const tx2 = await contract.connect(shipper2).registerShipper();
    await tx2.wait();
    console.log(`✓ Shipper 2 registered\n`);

    await sleep(1000);

    // Step 2: Register Carriers
    console.log("=================================================");
    console.log("STEP 2: Registering Carriers");
    console.log("=================================================\n");

    console.log("Registering Carrier 1...");
    const tx3 = await contract.connect(carrier1).registerCarrier();
    await tx3.wait();
    console.log(`✓ Carrier 1 registered\n`);

    console.log("Registering Carrier 2...");
    const tx4 = await contract.connect(carrier2).registerCarrier();
    await tx4.wait();
    console.log(`✓ Carrier 2 registered\n`);

    console.log("Registering Carrier 3...");
    const tx5 = await contract.connect(carrier3).registerCarrier();
    await tx5.wait();
    console.log(`✓ Carrier 3 registered\n`);

    console.log("Registering Carrier 4...");
    const tx6 = await contract.connect(carrier4).registerCarrier();
    await tx6.wait();
    console.log(`✓ Carrier 4 registered\n`);

    await sleep(1000);

    // Step 3: Post Freight Jobs with FHE Encryption
    console.log("=================================================");
    console.log("STEP 3: Posting Jobs with FHE Encryption");
    console.log("=================================================\n");

    const biddingDuration = 24 * 3600; // 24 hours
    const deliveryDeadline = 72 * 3600; // 72 hours
    const currentTime = Math.floor(Date.now() / 1000);

    console.log("Shipper 1 posting Job 1: Shanghai → Los Angeles");
    console.log("  🔒 Encrypting: Weight (5000kg), Volume (50m³), Urgency (High)...");
    const job1Tx = await contract.connect(shipper1).postFreightJob(
      "Shanghai, China",
      "Los Angeles, USA",
      "Electronics & Semiconductors",
      5000, // Weight (will be encrypted)
      50,   // Volume (will be encrypted)
      true, // Urgent (will be encrypted)
      currentTime + biddingDuration,
      currentTime + deliveryDeadline
    );
    await job1Tx.wait();
    console.log(`  ✓ Job 1 posted with FHE encryption\n`);

    console.log("Shipper 1 posting Job 2: Rotterdam → Singapore");
    console.log("  🔒 Encrypting: Weight (12000kg), Volume (120m³), Urgency (Normal)...");
    const job2Tx = await contract.connect(shipper1).postFreightJob(
      "Rotterdam, Netherlands",
      "Singapore",
      "Industrial Machinery",
      12000,
      120,
      false,
      currentTime + biddingDuration,
      currentTime + deliveryDeadline
    );
    await job2Tx.wait();
    console.log(`  ✓ Job 2 posted with FHE encryption\n`);

    console.log("Shipper 2 posting Job 3: Dubai → Mumbai");
    console.log("  🔒 Encrypting: Weight (3000kg), Volume (30m³), Urgency (High)...");
    const job3Tx = await contract.connect(shipper2).postFreightJob(
      "Dubai, UAE",
      "Mumbai, India",
      "Textiles & Apparel",
      3000,
      30,
      true,
      currentTime + biddingDuration,
      currentTime + deliveryDeadline
    );
    await job3Tx.wait();
    console.log(`  ✓ Job 3 posted with FHE encryption\n`);

    await sleep(1000);

    // Step 4: Submit Encrypted Bids
    console.log("=================================================");
    console.log("STEP 4: Submitting Encrypted Bids (FHE)");
    console.log("=================================================\n");

    console.log("Carrier 1 bidding on Job 1:");
    console.log("  🔒 Encrypting: Price (2.5 ETH), Days (7), Reliability (95), Express (Yes)...");
    const bid1Tx = await contract.connect(carrier1).submitBid(
      1,
      hre.ethers.parseEther("2.5"),
      7,
      95,
      true
    );
    await bid1Tx.wait();
    console.log(`  ✓ Encrypted bid submitted\n`);

    console.log("Carrier 2 bidding on Job 1:");
    console.log("  🔒 Encrypting: Price (2.2 ETH), Days (8), Reliability (88), Express (No)...");
    const bid2Tx = await contract.connect(carrier2).submitBid(
      1,
      hre.ethers.parseEther("2.2"),
      8,
      88,
      false
    );
    await bid2Tx.wait();
    console.log(`  ✓ Encrypted bid submitted\n`);

    console.log("Carrier 3 bidding on Job 1:");
    console.log("  🔒 Encrypting: Price (2.8 ETH), Days (6), Reliability (92), Express (Yes)...");
    const bid3Tx = await contract.connect(carrier3).submitBid(
      1,
      hre.ethers.parseEther("2.8"),
      6,
      92,
      true
    );
    await bid3Tx.wait();
    console.log(`  ✓ Encrypted bid submitted\n`);

    console.log("Carrier 2 bidding on Job 2:");
    console.log("  🔒 Encrypting: Price (4.5 ETH), Days (10), Reliability (90), Express (No)...");
    const bid4Tx = await contract.connect(carrier2).submitBid(
      2,
      hre.ethers.parseEther("4.5"),
      10,
      90,
      false
    );
    await bid4Tx.wait();
    console.log(`  ✓ Encrypted bid submitted\n`);

    console.log("Carrier 4 bidding on Job 2:");
    console.log("  🔒 Encrypting: Price (4.2 ETH), Days (9), Reliability (87), Express (No)...");
    const bid5Tx = await contract.connect(carrier4).submitBid(
      2,
      hre.ethers.parseEther("4.2"),
      9,
      87,
      false
    );
    await bid5Tx.wait();
    console.log(`  ✓ Encrypted bid submitted\n`);

    console.log("Carrier 3 bidding on Job 3:");
    console.log("  🔒 Encrypting: Price (1.8 ETH), Days (4), Reliability (93), Express (Yes)...");
    const bid6Tx = await contract.connect(carrier3).submitBid(
      3,
      hre.ethers.parseEther("1.8"),
      4,
      93,
      true
    );
    await bid6Tx.wait();
    console.log(`  ✓ Encrypted bid submitted\n`);

    await sleep(1000);

    // Step 5: Close Bidding
    console.log("=================================================");
    console.log("STEP 5: Closing Bidding Periods");
    console.log("=================================================\n");

    console.log("Closing bidding for Job 1...");
    const close1Tx = await contract.connect(shipper1).closeBidding(1);
    await close1Tx.wait();
    console.log(`✓ Bidding closed for Job 1\n`);

    console.log("Closing bidding for Job 2...");
    const close2Tx = await contract.connect(shipper1).closeBidding(2);
    await close2Tx.wait();
    console.log(`✓ Bidding closed for Job 2\n`);

    console.log("Closing bidding for Job 3...");
    const close3Tx = await contract.connect(shipper2).closeBidding(3);
    await close3Tx.wait();
    console.log(`✓ Bidding closed for Job 3\n`);

    await sleep(1000);

    // Step 6: Award Jobs
    console.log("=================================================");
    console.log("STEP 6: Awarding Jobs to Winners");
    console.log("=================================================\n");

    console.log("Shipper 1 awarding Job 1 to Carrier 2 (best encrypted bid)...");
    const award1Tx = await contract.connect(shipper1).awardJob(1, carrier2.address);
    await award1Tx.wait();
    console.log(`✓ Job 1 awarded to Carrier 2\n`);

    console.log("Shipper 1 awarding Job 2 to Carrier 4...");
    const award2Tx = await contract.connect(shipper1).awardJob(2, carrier4.address);
    await award2Tx.wait();
    console.log(`✓ Job 2 awarded to Carrier 4\n`);

    console.log("Shipper 2 awarding Job 3 to Carrier 3...");
    const award3Tx = await contract.connect(shipper2).awardJob(3, carrier3.address);
    await award3Tx.wait();
    console.log(`✓ Job 3 awarded to Carrier 3\n`);

    await sleep(1000);

    // Step 7: Complete Jobs
    console.log("=================================================");
    console.log("STEP 7: Completing Jobs");
    console.log("=================================================\n");

    console.log("Carrier 2 completing Job 1...");
    const complete1Tx = await contract.connect(carrier2).completeJob(1);
    await complete1Tx.wait();
    console.log(`✓ Job 1 completed\n`);

    console.log("Carrier 4 completing Job 2...");
    const complete2Tx = await contract.connect(carrier4).completeJob(2);
    await complete2Tx.wait();
    console.log(`✓ Job 2 completed\n`);

    console.log("Carrier 3 completing Job 3...");
    const complete3Tx = await contract.connect(carrier3).completeJob(3);
    await complete3Tx.wait();
    console.log(`✓ Job 3 completed\n`);

    // Step 8: Check Platform Statistics
    console.log("=================================================");
    console.log("STEP 8: Final Platform Statistics");
    console.log("=================================================\n");

    const totalBids = await contract.totalBidsSubmitted();
    const totalCompleted = await contract.totalJobsCompleted();
    const totalCarriers = await contract.totalActiveCarriers();
    const jobCounter = await contract.jobCounter();

    console.log(`Total Jobs Posted: ${jobCounter}`);
    console.log(`Total Bids Submitted: ${totalBids}`);
    console.log(`Total Jobs Completed: ${totalCompleted}`);
    console.log(`Active Carriers: ${totalCarriers}\n`);

    // Final Summary
    console.log("=================================================");
    console.log("   Simulation Summary");
    console.log("=================================================\n");
    console.log("✓ FHE Workflow Completed Successfully!\n");
    console.log("Participants:");
    console.log("  - 2 Shippers registered");
    console.log("  - 4 Carriers registered\n");
    console.log("Jobs:");
    console.log("  - 3 Jobs posted with FHE encryption");
    console.log("  - 6 Encrypted bids submitted");
    console.log("  - 3 Jobs awarded to winners");
    console.log("  - 3 Jobs completed\n");

    console.log("=================================================");
    console.log("   FHE Privacy Features Demonstrated");
    console.log("=================================================");
    console.log("✓ Encrypted Cargo Details:");
    console.log("  - Weight (euint64)");
    console.log("  - Volume (euint64)");
    console.log("  - Urgency flag (ebool)");
    console.log("\n✓ Encrypted Bid Information:");
    console.log("  - Bid prices (euint64)");
    console.log("  - Delivery times (euint32)");
    console.log("  - Reliability scores (euint32)");
    console.log("  - Express service flags (ebool)");
    console.log("\n✓ Privacy Guarantees:");
    console.log("  - Competitors cannot see each other's bids");
    console.log("  - Cargo details remain confidential");
    console.log("  - Only authorized parties can decrypt via Gateway");
    console.log("  - Full audit trail on blockchain");
    console.log("  - Zero-knowledge bid comparisons");
    console.log("\n✓ Advanced Features:");
    console.log("  - Gateway callbacks for selective decryption");
    console.log("  - Pausable emergency mechanism");
    console.log("  - Comprehensive access control");
    console.log("  - Multi-type FHE support");
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
    console.error("Usage: node scripts/simulate-enhanced.js <CONTRACT_ADDRESS>");
    console.error("\nExample:");
    console.error("  node scripts/simulate-enhanced.js 0x1234567890abcdef...");
    process.exit(1);
  }

  await simulateFHEWorkflow(contractAddress);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { simulateFHEWorkflow };
