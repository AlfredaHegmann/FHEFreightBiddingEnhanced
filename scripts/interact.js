/**
 * Interaction script for Private Freight Bidding Platform
 *
 * Usage:
 *   node scripts/interact.js <CONTRACT_ADDRESS>
 *   node scripts/interact.js 0x2E7B5f277595e3F1eeB9548ef654E178537cb90E
 */

import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function getContractInstance(contractAddress) {
  const PrivateFreightBidding = await ethers.getContractFactory("PrivateFreightBidding");
  return PrivateFreightBidding.attach(contractAddress);
}

async function displayMenu() {
  console.log("\n=================================================");
  console.log("   Private Freight Bidding - Interaction Menu");
  console.log("=================================================");
  console.log("1.  View Contract Info");
  console.log("2.  Get Platform Statistics");
  console.log("3.  Register as Shipper");
  console.log("4.  Register as Carrier");
  console.log("5.  Create Freight Job");
  console.log("6.  View All Jobs");
  console.log("7.  View Job Details");
  console.log("8.  Place Bid on Job");
  console.log("9.  View Job Bids");
  console.log("10. Award Job to Carrier");
  console.log("11. Complete Job");
  console.log("12. Get User Role");
  console.log("0.  Exit");
  console.log("=================================================\n");
}

async function viewContractInfo(contract, contractAddress) {
  console.log("\n--- Contract Information ---");
  console.log(`Address: ${contractAddress}`);

  try {
    const owner = await contract.owner();
    console.log(`Owner: ${owner}`);
  } catch (error) {
    console.log("Owner: Not available or contract doesn't have owner function");
  }

  console.log("\n");
}

async function getPlatformStats(contract) {
  console.log("\n--- Platform Statistics ---");

  try {
    // Try to get job counter or iterate through jobs
    let jobCount = 0;
    try {
      // Assuming there's a way to get job count
      for (let i = 1; i <= 100; i++) {
        try {
          await contract.jobs(i);
          jobCount = i;
        } catch {
          break;
        }
      }
    } catch (error) {
      console.log("Unable to fetch job count");
    }

    console.log(`Total Jobs: ${jobCount}`);
    console.log("\n");
  } catch (error) {
    console.error("Error fetching statistics:", error.message);
  }
}

async function registerShipper(contract, signer) {
  console.log("\n--- Register as Shipper ---");
  const name = await question("Enter shipper name: ");
  const company = await question("Enter company name: ");

  try {
    const tx = await contract.registerShipper(name, company);
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Successfully registered as shipper! (Block: ${receipt.blockNumber})`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function registerCarrier(contract, signer) {
  console.log("\n--- Register as Carrier ---");
  const name = await question("Enter carrier name: ");
  const company = await question("Enter company name: ");

  try {
    const tx = await contract.registerCarrier(name, company);
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Successfully registered as carrier! (Block: ${receipt.blockNumber})`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function createJob(contract, signer) {
  console.log("\n--- Create Freight Job ---");
  const origin = await question("Enter origin: ");
  const destination = await question("Enter destination: ");
  const cargoType = await question("Enter cargo type: ");
  const weight = await question("Enter weight (kg): ");
  const maxBudget = await question("Enter max budget (ETH): ");
  const deadline = await question("Enter deadline (hours from now): ");

  try {
    const deadlineTimestamp = Math.floor(Date.now() / 1000) + parseInt(deadline) * 3600;
    const maxBudgetWei = ethers.parseEther(maxBudget);

    const tx = await contract.createJob(
      origin,
      destination,
      cargoType,
      parseInt(weight),
      maxBudgetWei,
      deadlineTimestamp
    );
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Job created successfully! (Block: ${receipt.blockNumber})`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function viewAllJobs(contract) {
  console.log("\n--- All Freight Jobs ---");

  try {
    for (let i = 1; i <= 50; i++) {
      try {
        const job = await contract.jobs(i);
        if (job.shipper && job.shipper !== ethers.ZeroAddress) {
          console.log(`\nJob ID: ${i}`);
          console.log(`  Origin: ${job.origin}`);
          console.log(`  Destination: ${job.destination}`);
          console.log(`  Cargo Type: ${job.cargoType}`);
          console.log(`  Status: ${["Active", "Awarded", "Completed", "Cancelled"][job.status]}`);
        }
      } catch {
        break;
      }
    }
    console.log("\n");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function viewJobDetails(contract) {
  const jobId = await question("Enter Job ID: ");

  try {
    const job = await contract.jobs(jobId);
    console.log("\n--- Job Details ---");
    console.log(`Job ID: ${jobId}`);
    console.log(`Shipper: ${job.shipper}`);
    console.log(`Origin: ${job.origin}`);
    console.log(`Destination: ${job.destination}`);
    console.log(`Cargo Type: ${job.cargoType}`);
    console.log(`Weight: ${job.weight} kg`);
    console.log(`Status: ${["Active", "Awarded", "Completed", "Cancelled"][job.status]}`);
    console.log(`Deadline: ${new Date(Number(job.deadline) * 1000).toLocaleString()}`);
    console.log(`Bid Count: ${job.bidCount}`);
    if (job.awardedCarrier !== ethers.ZeroAddress) {
      console.log(`Awarded Carrier: ${job.awardedCarrier}`);
    }
    console.log("\n");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function placeBid(contract, signer) {
  console.log("\n--- Place Bid ---");
  const jobId = await question("Enter Job ID: ");
  const bidAmount = await question("Enter bid amount (ETH): ");

  try {
    const bidAmountWei = ethers.parseEther(bidAmount);
    const tx = await contract.placeBid(jobId, bidAmountWei);
    console.log(`Transaction sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`✓ Bid placed successfully! (Block: ${receipt.blockNumber})`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function viewJobBids(contract) {
  const jobId = await question("Enter Job ID: ");

  console.log("\n--- Job Bids ---");
  try {
    const bidCount = await contract.getBidCount(jobId);
    console.log(`Total Bids: ${bidCount}\n`);

    // Note: Bid details are encrypted in FHE version
    console.log("Note: Bid amounts are encrypted and can only be revealed by authorized parties.");
    console.log("\n");
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
    console.log(`✓ Job awarded successfully! (Block: ${receipt.blockNumber})`);
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
    console.log(`✓ Job completed successfully! (Block: ${receipt.blockNumber})`);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function getUserRole(contract, signer) {
  const address = await question("Enter address (or press enter for current account): ");
  const targetAddress = address || signer.address;

  try {
    console.log("\n--- User Role ---");
    console.log(`Address: ${targetAddress}`);

    try {
      const isShipper = await contract.shippers(targetAddress);
      if (isShipper.isRegistered) {
        console.log(`Role: Shipper`);
        console.log(`Name: ${isShipper.name}`);
        console.log(`Company: ${isShipper.company}`);
      }
    } catch {}

    try {
      const isCarrier = await contract.carriers(targetAddress);
      if (isCarrier.isRegistered) {
        console.log(`Role: Carrier`);
        console.log(`Name: ${isCarrier.name}`);
        console.log(`Company: ${isCarrier.company}`);
      }
    } catch {}

    console.log("\n");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function main() {
  const contractAddress = process.argv[2];

  if (!contractAddress) {
    console.error("Usage: node scripts/interact.js <CONTRACT_ADDRESS>");
    process.exit(1);
  }

  console.log("=================================================");
  console.log("   Private Freight Bidding - Contract Interaction");
  console.log("=================================================\n");
  console.log(`Contract Address: ${contractAddress}`);

  const [signer] = await ethers.getSigners();
  console.log(`Your Address: ${signer.address}\n`);

  const contract = await getContractInstance(contractAddress);

  let running = true;
  while (running) {
    await displayMenu();
    const choice = await question("Select an option: ");

    switch (choice) {
      case "1":
        await viewContractInfo(contract, contractAddress);
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
        await createJob(contract, signer);
        break;
      case "6":
        await viewAllJobs(contract);
        break;
      case "7":
        await viewJobDetails(contract);
        break;
      case "8":
        await placeBid(contract, signer);
        break;
      case "9":
        await viewJobBids(contract);
        break;
      case "10":
        await awardJob(contract, signer);
        break;
      case "11":
        await completeJob(contract, signer);
        break;
      case "12":
        await getUserRole(contract, signer);
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

// Execute interaction
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });

export { getContractInstance };
