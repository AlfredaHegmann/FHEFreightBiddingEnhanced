/**
 * Verification script for Private Freight Bidding Platform
 *
 * Usage:
 *   node scripts/verify.js <CONTRACT_ADDRESS>
 *   node scripts/verify.js 0x2E7B5f277595e3F1eeB9548ef654E178537cb90E
 */

import { run } from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verify(contractAddress, constructorArguments = []) {
  console.log("=================================================");
  console.log("   Contract Verification on Etherscan");
  console.log("=================================================\n");

  console.log(`Verifying contract at: ${contractAddress}`);
  console.log(`Constructor arguments:`, constructorArguments, "\n");

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
      contract: "contracts/PrivateFreightBidding.sol:PrivateFreightBidding"
    });

    console.log("\n✓ Contract verified successfully!");
    console.log(`View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}#code`);

    return true;
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("\n✓ Contract is already verified!");
      console.log(`View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}#code`);
      return true;
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);
      return false;
    }
  }
}

async function verifyFromDeployment(networkName = "sepolia") {
  const deploymentFile = path.join(__dirname, "..", "deployments", `${networkName}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  console.log(`Loading deployment from: ${deploymentFile}\n`);

  return await verify(deployment.contractAddress, []);
}

async function main() {
  // Check if contract address provided as argument
  const contractAddress = process.argv[2];

  if (contractAddress) {
    // Verify with provided address
    if (!contractAddress.startsWith("0x") || contractAddress.length !== 42) {
      throw new Error("Invalid contract address format");
    }
    await verify(contractAddress, []);
  } else {
    // Verify from deployment file
    const hre = await import("hardhat");
    const networkName = hre.network.name;
    console.log(`Network: ${networkName}\n`);
    await verifyFromDeployment(networkName);
  }
}

// Execute verification
main()
  .then(() => {
    console.log("\n=================================================");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error.message);
    console.log("\n=================================================");
    process.exit(1);
  });

export { verify, verifyFromDeployment };
