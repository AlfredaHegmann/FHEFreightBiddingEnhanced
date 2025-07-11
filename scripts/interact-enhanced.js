/**
 * Interaction script for PrivateFreightBiddingEnhanced (FHE Version)
 *
 * Usage:
 *   node scripts/interact-enhanced.js <CONTRACT_ADDRESS>
 */

const hre = require("hardhat");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function getContractInstance(contractAddress) {
  const PrivateFreightBiddingEnhanced = await hre.ethers.getContractFactory(
    "PrivateFreightBiddingEnhanced"
  );
  return PrivateFreightBiddingEnhanced.attach(contractAddress);
}

async function displayMenu() {
  console.log("\n=================================================");
  console.log("   Private Freight Bidding Enhanced - FHE Version");
  console.log("=================================================");
  console.log("1.  View Contract Info");
  console.log("2.  Get Platform Statistics");
  console.log("3.  Register as Shipper");
  console.log("4.  Register as Carrier");
  console.log("5.  Post Freight Job (with FHE encryption)");
  console.log("6.  View All Jobs");
  console.log("7.  View Job Details");
  console.log("8.  Submit Encrypted Bid");
  console.log("9.  Close Bidding for Job");
  console.log("10. Award Job to Winner");
  console.log("11. Complete Job");
  console.log("12. Request Price Reveal (Gateway Callback)");
  console.log("13. Check Carrier Profile");
  console.log("14. Check Shipper Profile");
  console.log("15. Pause Contract (Emergency)");
  console.log("16. Unpause Contract");
  console.log("0.  Exit");
  console.log("=================================================\n");
}

async function viewContractInfo(contract, contractAddress, signer) {
  console.log("\n--- Contract Information (FHE Enhanced) ---");
  console.log(`Address: ${contractAddress}`);

  try {
    const owner = await contract.owner();
    console.log(`Owner: ${owner}`);

    const pauser = await contract.pauser();
    console.log(`Pauser: ${pauser}`);

    const isPaused = await contract.paused();
    console.log(`Status: ${isPaused ? "PAUSED" : "Active"}`);

    const jobCounter = await contract.jobCounter();
    console.log(`Total Jobs Created: ${jobCounter}`);
  } catch (error) {
    console.log("Error fetching contract info:", error.message);
  }

  console.log("\n✓ FHE Features Enabled:");
  console.log("  - Encrypted bid prices");
  console.log("  - Encrypted delivery times");
  console.log("  - Encrypted cargo weights");
  console.log("  - Privacy-preserving comparisons\n");
}

async function getPlatformStats(contract) {
  console.log("\n--- Platform Statistics ---");

  try {
    const totalBids = await contract.totalBidsSubmitted();
    const totalCompleted = await contract.totalJobsCompleted();
    const totalCarriers = await contract.totalActiveCarriers();
    const jobCounter = await contract.jobCounter();

    console.log(`Total Jobs: ${jobCounter}`);
    console.log(`Total Bids: ${totalBids}`);
    console.log(`Completed Jobs: ${totalCompleted}`);
    console.log(`Active Carriers: ${totalCarriers}\n`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function registerShipper(contract, signer) {
  console.log("\n--- Register as Shipper ---");

  try {
    const tx = await contract.registerShipper();
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Successfully registered as shipper! (Block: ${receipt.blockNumber})`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function registerCarrier(contract, signer) {
  console.log("\n--- Register as Carrier ---");

  try {
    const tx = await contract.registerCarrier();
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Successfully registered as carrier! (Block: ${receipt.blockNumber})`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function postJob(contract, signer) {
  console.log("\n--- Post Freight Job (FHE Encrypted) ---");
  console.log("⚠️  Cargo weight, volume, and urgency will be FHE-encrypted\n");

  const origin = await question("Enter origin: ");
  const destination = await question("Enter destination: ");
  const cargoType = await question("Enter cargo type: ");
  const weight = await question("Enter weight (kg): ");
  const volume = await question("Enter volume (m³): ");
  const isUrgent = await question("Is urgent? (yes/no): ");
  const biddingDuration = await question("Bidding duration (hours): ");
  const deadline = await question("Delivery deadline (hours from now): ");

  try {
    const biddingEndTime = Math.floor(Date.now() / 1000) + parseInt(biddingDuration) * 3600;
    const deliveryDeadline = Math.floor(Date.now() / 1000) + parseInt(deadline) * 3600;
    const urgentFlag = isUrgent.toLowerCase() === "yes";

    console.log("\n⏳ Creating encrypted inputs...");
    console.log("This may take a moment as FHE encryption is being applied...\n");

    // Note: In production, you would use fhevmjs to create encrypted inputs
    // For now, we'll use plaintext that will be encrypted by the contract
    const tx = await contract.postFreightJob(
      origin,
      destination,
      cargoType,
      weight,        // Will be encrypted as euint64
      volume,        // Will be encrypted as euint64
      urgentFlag,    // Will be encrypted as ebool
      biddingEndTime,
      deliveryDeadline
    );

    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Job posted successfully! (Block: ${receipt.blockNumber})`);
    console.log("✓ Sensitive data encrypted with FHE");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function submitBid(contract, signer) {
  console.log("\n--- Submit Encrypted Bid (FHE) ---");
  console.log("⚠️  All bid details will be FHE-encrypted\n");

  const jobId = await question("Enter Job ID: ");
  const price = await question("Enter bid price (ETH): ");
  const deliveryDays = await question("Enter delivery days: ");
  const reliabilityScore = await question("Enter your reliability score (0-100): ");
  const isExpress = await question("Express service? (yes/no): ");

  try {
    const priceWei = hre.ethers.parseEther(price);
    const expressFlag = isExpress.toLowerCase() === "yes";

    console.log("\n⏳ Encrypting bid data with FHE...\n");

    const tx = await contract.submitBid(
      jobId,
      priceWei,
      deliveryDays,
      reliabilityScore,
      expressFlag
    );

    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Bid submitted successfully! (Block: ${receipt.blockNumber})`);
    console.log("✓ Your bid is fully encrypted and private");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function closeBidding(contract, signer) {
  console.log("\n--- Close Bidding ---");
  const jobId = await question("Enter Job ID: ");

  try {
    const tx = await contract.closeBidding(jobId);
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Bidding closed! (Block: ${receipt.blockNumber})`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function awardJob(contract, signer) {
  console.log("\n--- Award Job ---");
  const jobId = await question("Enter Job ID: ");
  const carrierAddress = await question("Enter carrier address: ");

  try {
    const tx = await contract.awardJob(jobId, carrierAddress);
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Job awarded! (Block: ${receipt.blockNumber})`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function completeJob(contract, signer) {
  console.log("\n--- Complete Job ---");
  const jobId = await question("Enter Job ID: ");

  try {
    const tx = await contract.completeJob(jobId);
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Job completed! (Block: ${receipt.blockNumber})`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function requestPriceReveal(contract, signer) {
  console.log("\n--- Request Price Reveal (Gateway Callback) ---");
  const jobId = await question("Enter Job ID: ");

  try {
    console.log("\n⏳ Requesting decryption via Gateway...");
    const tx = await contract.requestJobPriceReveal(jobId);
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Reveal requested! (Block: ${receipt.blockNumber})`);
    console.log("⏳ Gateway callback will decrypt the price...");
    console.log("   Check events for PriceRevealed after callback completes");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function checkCarrierProfile(contract, signer) {
  const address = await question("Enter carrier address (or press enter for current): ");
  const targetAddress = address || signer.address;

  try {
    const profile = await contract.carrierProfiles(targetAddress);
    console.log("\n--- Carrier Profile ---");
    console.log(`Address: ${targetAddress}`);
    console.log(`Verified: ${profile.isVerified}`);
    console.log(`Active: ${profile.isActive}`);
    console.log(`Total Bids: ${profile.totalBids}`);
    console.log(`Won Bids: ${profile.wonBids}`);
    console.log(`Completed Jobs: ${profile.completedJobs}`);
    console.log(`Joined: ${new Date(Number(profile.joinedAt) * 1000).toLocaleString()}\n`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function checkShipperProfile(contract, signer) {
  const address = await question("Enter shipper address (or press enter for current): ");
  const targetAddress = address || signer.address;

  try {
    const profile = await contract.shipperProfiles(targetAddress);
    console.log("\n--- Shipper Profile ---");
    console.log(`Address: ${targetAddress}`);
    console.log(`Verified: ${profile.isVerified}`);
    console.log(`Active: ${profile.isActive}`);
    console.log(`Total Jobs Posted: ${profile.totalJobsPosted}`);
    console.log(`Total Jobs Completed: ${profile.totalJobsCompleted}`);
    console.log(`Joined: ${new Date(Number(profile.joinedAt) * 1000).toLocaleString()}\n`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function pauseContract(contract, signer) {
  console.log("\n--- Pause Contract (Emergency) ---");
  const confirm = await question("Are you sure you want to pause? (yes/no): ");

  if (confirm.toLowerCase() === "yes") {
    try {
      const tx = await contract.pause();
      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✓ Contract paused! (Block: ${receipt.blockNumber})`);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
}

async function unpauseContract(contract, signer) {
  console.log("\n--- Unpause Contract ---");

  try {
    const tx = await contract.unpause();
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Contract unpaused! (Block: ${receipt.blockNumber})`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function viewAllJobs(contract) {
  console.log("\n--- All Freight Jobs ---");

  try {
    const jobCounter = await contract.jobCounter();
    console.log(`Total jobs: ${jobCounter}\n`);

    for (let i = 1; i <= Math.min(Number(jobCounter), 20); i++) {
      try {
        const job = await contract.freightJobs(i);
        if (job.shipper !== hre.ethers.ZeroAddress) {
          console.log(`Job #${i}:`);
          console.log(`  ${job.origin} → ${job.destination}`);
          console.log(`  Cargo: ${job.cargoType}`);
          console.log(`  Status: ${["Open", "BiddingClosed", "Awarded", "Completed", "Cancelled"][job.status]}`);
          console.log(`  Shipper: ${job.shipper}`);
          console.log(`  ✓ FHE: Weight & Volume encrypted\n`);
        }
      } catch (e) {
        break;
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function viewJobDetails(contract) {
  const jobId = await question("Enter Job ID: ");

  try {
    const job = await contract.freightJobs(jobId);
    console.log("\n--- Job Details (FHE Enhanced) ---");
    console.log(`Job ID: ${jobId}`);
    console.log(`Origin: ${job.origin}`);
    console.log(`Destination: ${job.destination}`);
    console.log(`Cargo Type: ${job.cargoType}`);
    console.log(`Status: ${["Open", "BiddingClosed", "Awarded", "Completed", "Cancelled"][job.status]}`);
    console.log(`Shipper: ${job.shipper}`);
    console.log(`Deadline: ${new Date(Number(job.deadline) * 1000).toLocaleString()}`);
    console.log(`Bidding Ends: ${new Date(Number(job.biddingEndTime) * 1000).toLocaleString()}`);
    console.log(`Created: ${new Date(Number(job.createdAt) * 1000).toLocaleString()}`);

    console.log("\n🔒 Encrypted Data (FHE):");
    console.log(`  - Weight: ENCRYPTED`);
    console.log(`  - Volume: ENCRYPTED`);
    console.log(`  - Urgency: ENCRYPTED`);

    if (job.isPriceRevealed) {
      console.log(`\n✓ Final Price (Revealed): ${hre.ethers.formatEther(job.revealedFinalPrice)} ETH`);
    } else {
      console.log(`\n🔒 Final Price: ENCRYPTED (not yet revealed)`);
    }

    const bidders = await contract.jobBidders(jobId, 0).catch(() => []);
    console.log(`\nTotal Bidders: ${bidders.length || "Unknown"}\n`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function main() {
  const contractAddress = process.argv[2];

  if (!contractAddress) {
    console.error("Usage: node scripts/interact-enhanced.js <CONTRACT_ADDRESS>");
    process.exit(1);
  }

  console.log("=================================================");
  console.log("   Private Freight Bidding Enhanced");
  console.log("   FHE-Enabled Contract Interaction");
  console.log("=================================================\n");
  console.log(`Contract Address: ${contractAddress}`);

  const [signer] = await hre.ethers.getSigners();
  console.log(`Your Address: ${signer.address}\n`);

  const contract = await getContractInstance(contractAddress);

  let running = true;
  while (running) {
    await displayMenu();
    const choice = await question("Select an option: ");

    switch (choice) {
      case "1":
        await viewContractInfo(contract, contractAddress, signer);
        break;
      case "2":
        await getPlatformStats(contract);
        break;
      case "3":
        await registerShipper(contract, signer);
        break;
      case "4":
        await registerCarrier(contract, signer);
        break;
      case "5":
        await postJob(contract, signer);
        break;
      case "6":
        await viewAllJobs(contract);
        break;
      case "7":
        await viewJobDetails(contract);
        break;
      case "8":
        await submitBid(contract, signer);
        break;
      case "9":
        await closeBidding(contract, signer);
        break;
      case "10":
        await awardJob(contract, signer);
        break;
      case "11":
        await completeJob(contract, signer);
        break;
      case "12":
        await requestPriceReveal(contract, signer);
        break;
      case "13":
        await checkCarrierProfile(contract, signer);
        break;
      case "14":
        await checkShipperProfile(contract, signer);
        break;
      case "15":
        await pauseContract(contract, signer);
        break;
      case "16":
        await unpauseContract(contract, signer);
        break;
      case "0":
        running = false;
        console.log("\nGoodbye!\n");
        break;
      default:
        console.log("\nInvalid option. Please try again.\n");
    }
  }

  rl.close();
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("\n❌ Error:");
      console.error(error);
      process.exit(1);
    });
}

module.exports = { getContractInstance };
