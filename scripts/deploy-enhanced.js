/**
 * Deploy script for PrivateFreightBiddingEnhanced (FHE Version)
 *
 * Usage:
 *   npx hardhat run scripts/deploy-enhanced.js --network fhevmSepolia
 *   npx hardhat run scripts/deploy-enhanced.js --network localhost
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=================================================");
  console.log("   Private Freight Bidding Enhanced Deployment");
  console.log("   (FHE-Enabled Version)");
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

  // Get environment variables
  const pauserAddress = process.env.PAUSER_ADDRESS_0 || deployer.address;

  console.log("Deployment Configuration:");
  console.log(`  Owner: ${deployer.address}`);
  console.log(`  Pauser: ${pauserAddress}\n`);

  // Deploy PrivateFreightBiddingEnhanced contract
  console.log("Deploying PrivateFreightBiddingEnhanced contract...");
  console.log("⚠️  This contract uses FHE (Fully Homomorphic Encryption)");
  console.log("⚠️  Ensure you're deploying to an fhEVM-compatible network\n");

  const PrivateFreightBiddingEnhanced = await hre.ethers.getContractFactory(
    "PrivateFreightBiddingEnhanced"
  );

  const deployStartTime = Date.now();

  // Deploy with constructor parameters if needed
  const contract = await PrivateFreightBiddingEnhanced.deploy();

  console.log("Waiting for deployment...");
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

  // Initialize pauser if different from owner
  if (pauserAddress !== deployer.address) {
    console.log("Setting up pauser...");
    try {
      const setPauserTx = await contract.setPauser(pauserAddress);
      await setPauserTx.wait();
      console.log(`✓ Pauser set to: ${pauserAddress}\n`);
    } catch (error) {
      console.log(`⚠️  Could not set pauser: ${error.message}\n`);
    }
  }

  // Save deployment information
  const deploymentInfo = {
    contractName: "PrivateFreightBiddingEnhanced",
    contractAddress: contractAddress,
    network: network.name,
    chainId: Number(network.chainId),
    deployer: deployer.address,
    pauser: pauserAddress,
    deploymentTime: new Date().toISOString(),
    transactionHash: deployTx?.hash || "",
    blockNumber: deployTx ? (await deployTx.wait()).blockNumber : 0,
    fheEnabled: true,
    compiler: {
      version: "0.8.24",
      optimizer: true,
      runs: 200
    },
    features: [
      "Fully Homomorphic Encryption",
      "Gateway Callbacks",
      "Encrypted Bids",
      "Pausable Mechanism",
      "Multi-type FHE (euint32, euint64, ebool)"
    ]
  };

  // Create deployments directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(
    deploymentsDir,
    `${network.name}-enhanced-deployment.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${deploymentFile}\n`);

  // Display contract info
  console.log("=================================================");
  console.log("   Deployment Summary");
  console.log("=================================================");
  console.log(`Contract: PrivateFreightBiddingEnhanced`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Pauser: ${pauserAddress}`);
  console.log(`FHE Enabled: Yes`);

  // Generate Etherscan link if on Sepolia
  if (network.chainId === 11155111n) {
    console.log(`\nEtherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  }

  // fhEVM Sepolia explorer
  if (network.chainId === 8009n) {
    console.log(`\nfhEVM Explorer: https://explorer.zama.ai/address/${contractAddress}`);
  }

  console.log("\n=================================================");
  console.log("   FHE Features Enabled");
  console.log("=================================================");
  console.log("✓ Encrypted bid prices (euint64)");
  console.log("✓ Encrypted delivery days (euint32)");
  console.log("✓ Encrypted reliability scores (euint32)");
  console.log("✓ Encrypted cargo weight & volume (euint64)");
  console.log("✓ Encrypted urgency flags (ebool)");
  console.log("✓ Gateway callbacks for decryption");
  console.log("✓ Privacy-preserving bid comparison");

  console.log("\n=================================================");
  console.log("   Next Steps");
  console.log("=================================================");
  console.log("1. Verify contract (if on public testnet):");
  console.log(`   node scripts/verify-enhanced.js ${contractAddress}`);
  console.log("\n2. Interact with the contract:");
  console.log(`   node scripts/interact-enhanced.js ${contractAddress}`);
  console.log("\n3. Run FHE simulation:");
  console.log(`   node scripts/simulate-enhanced.js ${contractAddress}`);

  console.log("\n4. Register as shipper/carrier:");
  console.log(`   - Use the interact script to register`);
  console.log(`   - All sensitive data will be FHE-encrypted`);

  console.log("\n⚠️  Important Notes:");
  console.log("   - This contract requires fhEVM-compatible network");
  console.log("   - All bids are encrypted and private");
  console.log("   - Use Gateway callbacks to decrypt values");
  console.log("   - Ensure sufficient gas for FHE operations");
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
