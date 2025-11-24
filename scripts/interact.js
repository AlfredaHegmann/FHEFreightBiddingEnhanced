const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Interactive script to demonstrate marketplace functionality
 * Shows complete workflow: Order creation → Gateway callback → Settlement
 */
async function main() {
    console.log("=== Privacy-Preserving Marketplace Interaction ===\n");

    const network = hre.network.name;
    const [deployer, buyer, seller] = await hre.ethers.getSigners();

    console.log(`Network: ${network}`);
    console.log(`Buyer: ${buyer.address}`);
    console.log(`Seller: ${seller.address}\n`);

    // Load deployment info
    const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-deployment.json`);

    if (!fs.existsSync(deploymentFile)) {
        console.error(`❌ Deployment file not found: ${deploymentFile}`);
        console.error("Please run 'npm run deploy' first.");
        process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    const contractAddress = deployment.contractAddress;

    console.log(`Contract Address: ${contractAddress}\n`);

    // Attach to deployed contract
    const PrivacyPreservingMarketplace = await hre.ethers.getContractFactory(
        "PrivacyPreservingMarketplace"
    );
    const marketplace = PrivacyPreservingMarketplace.attach(contractAddress);

    // === SCENARIO 1: Create Order with Privacy Features ===
    console.log("=== Scenario 1: Create Encrypted Order ===");

    const basePrice = 5000; // Base price (will be obfuscated)
    const amount = 100;     // Quantity

    console.log(`Creating order:`);
    console.log(`  Base Price: ${basePrice}`);
    console.log(`  Amount: ${amount}`);
    console.log(`  Buyer: ${buyer.address}`);
    console.log(`  Seller: ${seller.address}\n`);

    const createTx = await marketplace.connect(buyer).createOrder(
        seller.address,
        basePrice,
        amount
    );

    console.log(`Transaction hash: ${createTx.hash}`);
    const createReceipt = await createTx.wait();
    console.log(`✓ Order created in block ${createReceipt.blockNumber}`);
    console.log(`  Gas used: ${createReceipt.gasUsed.toString()}\n`);

    // Extract events
    const events = createReceipt.logs.map(log => {
        try {
            return marketplace.interface.parseLog(log);
        } catch {
            return null;
        }
    }).filter(event => event !== null);

    let orderId = null;
    let requestId = null;
    let priceNoise = null;

    for (const event of events) {
        if (event.name === "OrderCreated") {
            orderId = event.args.orderId.toString();
            console.log(`📝 Event: OrderCreated`);
            console.log(`   Order ID: ${orderId}`);
        } else if (event.name === "PriceObfuscated") {
            priceNoise = event.args.noiseApplied.toString();
            console.log(`🔒 Event: PriceObfuscated`);
            console.log(`   Noise Applied: ${priceNoise} (privacy protection)`);
        } else if (event.name === "DecryptionRequested") {
            requestId = event.args.requestId.toString();
            console.log(`🔑 Event: DecryptionRequested`);
            console.log(`   Request ID: ${requestId}`);
            console.log(`   Type: Order Decryption`);
        }
    }

    console.log();

    // Get order details
    const order = await marketplace.getOrder(orderId);
    console.log(`Order Details (ID: ${orderId}):`);
    console.log(`  Status: ${getStatusName(order.status)}`);
    console.log(`  Created At: ${new Date(Number(order.createdAt) * 1000).toISOString()}`);
    console.log(`  Expires At: ${new Date(Number(order.expiresAt) * 1000).toISOString()}`);
    console.log(`  Decryption Request: ${requestId}\n`);

    // === SCENARIO 2: Simulate Gateway Callback ===
    console.log("=== Scenario 2: Process Gateway Callback ===");
    console.log("Simulating Gateway decryption callback...\n");

    const obfuscatedPrice = basePrice + parseInt(priceNoise);
    const totalValue = obfuscatedPrice * amount;

    console.log(`Decrypted Values:`);
    console.log(`  Price (obfuscated): ${obfuscatedPrice}`);
    console.log(`  Amount: ${amount}`);
    console.log(`  Total: ${totalValue}\n`);

    const callbackTx = await marketplace.processOrderDecryption(
        requestId,
        obfuscatedPrice,
        amount,
        totalValue
    );

    console.log(`Transaction hash: ${callbackTx.hash}`);
    const callbackReceipt = await callbackTx.wait();
    console.log(`✓ Callback processed in block ${callbackReceipt.blockNumber}`);
    console.log(`  Gas used: ${callbackReceipt.gasUsed.toString()}\n`);

    // Verify status changed
    const updatedOrder = await marketplace.getOrder(orderId);
    console.log(`Order Status Updated: ${getStatusName(order.status)} → ${getStatusName(updatedOrder.status)}\n`);

    // === SCENARIO 3: Settle Order ===
    console.log("=== Scenario 3: Settle Order ===");

    const settleTx = await marketplace.connect(buyer).settleOrder(orderId);
    console.log(`Transaction hash: ${settleTx.hash}`);
    const settleReceipt = await settleTx.wait();
    console.log(`✓ Order settled in block ${settleReceipt.blockNumber}`);
    console.log(`  Gas used: ${settleReceipt.gasUsed.toString()}\n`);

    // Final order status
    const finalOrder = await marketplace.getOrder(orderId);
    console.log(`Final Order Status: ${getStatusName(finalOrder.status)}\n`);

    // === SCENARIO 4: Query User Orders ===
    console.log("=== Scenario 4: Query User Order History ===");

    const userOrders = await marketplace.getUserOrders(buyer.address);
    console.log(`Buyer's Orders: ${userOrders.length}`);
    for (const id of userOrders) {
        console.log(`  - Order ID: ${id}`);
    }
    console.log();

    // === SCENARIO 5: System Statistics ===
    console.log("=== Scenario 5: System Statistics ===");

    const orderCounter = await marketplace.orderCounter();
    const totalActive = await marketplace.totalActiveOrders();
    const pendingDecryptions = await marketplace.getPendingDecryptionsCount();

    console.log(`Total Orders Created: ${orderCounter}`);
    console.log(`Active Orders: ${totalActive}`);
    console.log(`Pending Decryptions: ${pendingDecryptions}\n`);

    console.log("=== Interaction Complete ===");
}

/**
 * Helper function to get human-readable status name
 */
function getStatusName(status) {
    const statuses = [
        "Pending",
        "Active",
        "Completed",
        "Cancelled",
        "RefundProcessing",
        "Refunded",
        "TimedOut"
    ];
    return statuses[status] || "Unknown";
}

// Execute interaction
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Interaction failed:", error);
        process.exit(1);
    });

module.exports = main;
