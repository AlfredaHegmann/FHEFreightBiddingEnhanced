/**
 * Deploy script for Private Freight Bidding Platform
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network localhost
 *   npx hardhat run scripts/deploy.js --network sepolia
 *   npx hardhat run scripts/deploy.js --network fhevmSepolia
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=================================================");
  console.log("   Private Freight Bidding Platform Deployment");
  console.log("=================================================\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${network.chainId}\n`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // Deploy PrivateFreightBidding contract
  console.log("Deploying PrivateFreightBidding contract...");
  const PrivateFreightBidding = await hre.ethers.getContractFactory("PrivateFreightBidding");

  const deployStartTime = Date.now();
  const contract = await PrivateFreightBidding.deploy();
  await contract.waitForDeployment();
  const deployEndTime = Date.now();

  const contractAddress = await contract.getAddress();
  console.log(`✓ Contract deployed to: ${contractAddress}`);
  console.log(`Deployment time: ${(deployEndTime - deployStartTime) / 1000}s\n`);

  // Get deployment transaction
  const deployTx = contract.deploymentTransaction();
  if (deployTx) {
    console.log(`Deployment transaction hash: ${deployTx.hash}`);
    const receipt = await deployTx.wait();
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`Block number: ${receipt.blockNumber}\n`);
  }

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    contractName: "PrivateFreightBidding",
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: deployTx?.hash || "",
    blockNumber: deployTx ? (await deployTx.wait()).blockNumber : 0,
    compiler: {
      version: "0.8.24",
      optimizer: true,
      runs: 200
    }
  };

  // Create deployments directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, `${network.name}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentFile}\n`);

  // Display contract info
  console.log("=================================================");
  console.log("   Deployment Summary");
  console.log("=================================================");
  console.log(`Contract: PrivateFreightBidding`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);

  // Generate Etherscan link if on Sepolia
  if (network.chainId === 11155111n) {
    console.log(`\nEtherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log(`\n⚠️  Remember to verify the contract:`);
    console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
  }

  console.log("\n=================================================");
  console.log("   Next Steps");
  console.log("=================================================");
  console.log("1. Verify contract on Etherscan (if applicable):");
  console.log(`   node scripts/verify.js ${contractAddress}`);
  console.log("\n2. Interact with the contract:");
  console.log(`   node scripts/interact.js ${contractAddress}`);
  console.log("\n3. Run simulation:");
  console.log(`   node scripts/simulate.js ${contractAddress}`);
  console.log("=================================================\n");

  return {
    contract,
    address: contractAddress,
    deploymentInfo
  };
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("\n❌ Deployment failed:");
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };
