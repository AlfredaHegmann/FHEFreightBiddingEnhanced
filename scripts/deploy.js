const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deployment script for PrivacyPreservingMarketplace
 * Supports multiple networks with automatic verification
 */
async function main() {
    console.log("=== Privacy-Preserving Marketplace Deployment ===\n");

    const [deployer] = await hre.ethers.getSigners();
    const network = hre.network.name;
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;

    console.log(`Network: ${network}`);
    console.log(`Chain ID: ${chainId}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH\n`);

    // Deploy contract
    console.log("Deploying PrivacyPreservingMarketplace...");
    const PrivacyPreservingMarketplace = await hre.ethers.getContractFactory(
        "PrivacyPreservingMarketplace"
    );

    const marketplace = await PrivacyPreservingMarketplace.deploy();
    await marketplace.waitForDeployment();

    const contractAddress = await marketplace.getAddress();
    console.log(`✓ Contract deployed to: ${contractAddress}`);

    // Get deployment transaction details
    const deployTx = marketplace.deploymentTransaction();
    const deployReceipt = await deployTx.wait();

    console.log(`✓ Transaction hash: ${deployTx.hash}`);
    console.log(`✓ Block number: ${deployReceipt.blockNumber}`);
    console.log(`✓ Gas used: ${deployReceipt.gasUsed.toString()}\n`);

    // Verify contract configuration
    console.log("Verifying contract configuration...");
    const timeout = await marketplace.DECRYPTION_TIMEOUT();
    const maxPending = await marketplace.MAX_PENDING_REQUESTS();
    const priceNoise = await marketplace.PRICE_NOISE_RANGE();

    console.log(`  Decryption Timeout: ${timeout} seconds (${timeout / 3600} hours)`);
    console.log(`  Max Pending Requests: ${maxPending}`);
    console.log(`  Price Noise Range: ${priceNoise}\n`);

    // Save deployment info
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentInfo = {
        network: network,
        chainId: chainId.toString(),
        contractName: "PrivacyPreservingMarketplace",
        contractAddress: contractAddress,
        deployer: deployer.address,
        deployerBalance: hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)),
        transactionHash: deployTx.hash,
        blockNumber: deployReceipt.blockNumber,
        gasUsed: deployReceipt.gasUsed.toString(),
        timestamp: new Date().toISOString(),
        configuration: {
            decryptionTimeout: timeout.toString(),
            maxPendingRequests: maxPending.toString(),
            priceNoiseRange: priceNoise.toString()
        },
        abi: marketplace.interface.format('json')
    };

    const deploymentFile = path.join(deploymentsDir, `${network}-deployment.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`✓ Deployment info saved to: ${deploymentFile}\n`);

    // Verification instructions
    if (network !== "hardhat" && network !== "localhost") {
        console.log("=== Contract Verification ===");
        console.log("To verify on Etherscan, run:");
        console.log(`npx hardhat verify --network ${network} ${contractAddress}\n`);
    }

    console.log("=== Deployment Complete ===");
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Deployment File: ${deploymentFile}\n`);

    return {
        marketplace,
        contractAddress,
        deploymentInfo
    };
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });

module.exports = main;
