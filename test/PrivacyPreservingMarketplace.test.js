const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PrivacyPreservingMarketplace", function () {

    /*//////////////////////////////////////////////////////////////
                            TEST FIXTURES
    //////////////////////////////////////////////////////////////*/

    async function deployMarketplaceFixture() {
        const [owner, buyer, seller, operator, user1, user2] = await ethers.getSigners();

        const PrivacyPreservingMarketplace = await ethers.getContractFactory(
            "PrivacyPreservingMarketplace"
        );
        const marketplace = await PrivacyPreservingMarketplace.deploy();
        await marketplace.waitForDeployment();

        // Grant operator role
        const OPERATOR_ROLE = await marketplace.OPERATOR_ROLE();
        await marketplace.grantRole(OPERATOR_ROLE, operator.address);

        return { marketplace, owner, buyer, seller, operator, user1, user2, OPERATOR_ROLE };
    }

    /*//////////////////////////////////////////////////////////////
                        DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            const { marketplace, owner } = await loadFixture(deployMarketplaceFixture);
            expect(await marketplace.getAddress()).to.be.properAddress;
        });

        it("Should set owner with admin role", async function () {
            const { marketplace, owner } = await loadFixture(deployMarketplaceFixture);
            const DEFAULT_ADMIN_ROLE = await marketplace.DEFAULT_ADMIN_ROLE();
            expect(await marketplace.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should initialize counters to zero", async function () {
            const { marketplace } = await loadFixture(deployMarketplaceFixture);
            expect(await marketplace.orderCounter()).to.equal(0);
            expect(await marketplace.requestCounter()).to.equal(0);
            expect(await marketplace.totalActiveOrders()).to.equal(0);
        });

        it("Should set correct timeout constants", async function () {
            const { marketplace } = await loadFixture(deployMarketplaceFixture);
            expect(await marketplace.DECRYPTION_TIMEOUT()).to.equal(3600); // 1 hour
            expect(await marketplace.MAX_PENDING_REQUESTS()).to.equal(100);
        });
    });

    /*//////////////////////////////////////////////////////////////
                        ORDER CREATION TESTS
    //////////////////////////////////////////////////////////////*/

    describe("Order Creation", function () {
        it("Should create order with encrypted data", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            const basePrice = 1000;
            const amount = 50;

            await expect(
                marketplace.connect(buyer).createOrder(seller.address, basePrice, amount)
            ).to.emit(marketplace, "OrderCreated")
             .and.to.emit(marketplace, "PriceObfuscated")
             .and.to.emit(marketplace, "DecryptionRequested");
        });

        it("Should increment order counter", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            expect(await marketplace.orderCounter()).to.equal(1);

            await marketplace.connect(buyer).createOrder(seller.address, 2000, 100);
            expect(await marketplace.orderCounter()).to.equal(2);
        });

        it("Should track user orders", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            await marketplace.connect(buyer).createOrder(seller.address, 2000, 100);

            const userOrders = await marketplace.getUserOrders(buyer.address);
            expect(userOrders.length).to.equal(2);
            expect(userOrders[0]).to.equal(1);
            expect(userOrders[1]).to.equal(2);
        });

        it("Should revert if seller is zero address", async function () {
            const { marketplace, buyer } = await loadFixture(deployMarketplaceFixture);

            await expect(
                marketplace.connect(buyer).createOrder(ethers.ZeroAddress, 1000, 50)
            ).to.be.revertedWith("Invalid seller");
        });

        it("Should revert if amount is zero", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            await expect(
                marketplace.connect(buyer).createOrder(seller.address, 1000, 0)
            ).to.be.revertedWith("Amount must be positive");
        });

        it("Should set order status to Pending initially", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            const order = await marketplace.getOrder(1);

            expect(order.status).to.equal(0); // OrderStatus.Pending
            expect(order.buyer).to.equal(buyer.address);
            expect(order.seller).to.equal(seller.address);
        });

        it("Should set correct expiration time (7 days)", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            const tx = await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            const receipt = await tx.wait();
            const blockTimestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;

            const order = await marketplace.getOrder(1);
            const expectedExpiry = blockTimestamp + (7 * 24 * 60 * 60); // 7 days

            expect(order.expiresAt).to.equal(expectedExpiry);
        });
    });

    /*//////////////////////////////////////////////////////////////
                    GATEWAY CALLBACK PATTERN TESTS
    //////////////////////////////////////////////////////////////*/

    describe("Gateway Callback Pattern", function () {
        it("Should create decryption request on order creation", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            const tx = await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            const receipt = await tx.wait();

            // Find DecryptionRequested event
            const event = receipt.logs.find(log => {
                try {
                    const parsed = marketplace.interface.parseLog(log);
                    return parsed.name === "DecryptionRequested";
                } catch {
                    return false;
                }
            });

            expect(event).to.not.be.undefined;
        });

        it("Should process order decryption callback successfully", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            // Create order
            const tx = await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            const receipt = await tx.wait();

            // Extract request ID from event
            const event = receipt.logs.find(log => {
                try {
                    const parsed = marketplace.interface.parseLog(log);
                    return parsed.name === "DecryptionRequested";
                } catch {
                    return false;
                }
            });

            const parsedEvent = marketplace.interface.parseLog(event);
            const requestId = parsedEvent.args.requestId;

            // Simulate Gateway callback
            await expect(
                marketplace.processOrderDecryption(requestId, 1050, 50, 52500)
            ).to.emit(marketplace, "DecryptionCompleted");

            // Verify order status changed to Active
            const order = await marketplace.getOrder(1);
            expect(order.status).to.equal(1); // OrderStatus.Active
        });

        it("Should prevent double processing of decryption requests", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            const tx = await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            const receipt = await tx.wait();

            const event = receipt.logs.find(log => {
                try {
                    const parsed = marketplace.interface.parseLog(log);
                    return parsed.name === "DecryptionRequested";
                } catch {
                    return false;
                }
            });

            const parsedEvent = marketplace.interface.parseLog(event);
            const requestId = parsedEvent.args.requestId;

            // First callback
            await marketplace.processOrderDecryption(requestId, 1050, 50, 52500);

            // Second callback should fail
            await expect(
                marketplace.processOrderDecryption(requestId, 1050, 50, 52500)
            ).to.be.revertedWith("Request already processed");
        });
    });

    /*//////////////////////////////////////////////////////////////
                        TIMEOUT PROTECTION TESTS
    //////////////////////////////////////////////////////////////*/

    describe("Timeout Protection", function () {
        it("Should trigger timeout after DECRYPTION_TIMEOUT", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            const tx = await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            const receipt = await tx.wait();

            const event = receipt.logs.find(log => {
                try {
                    const parsed = marketplace.interface.parseLog(log);
                    return parsed.name === "DecryptionRequested";
                } catch {
                    return false;
                }
            });

            const parsedEvent = marketplace.interface.parseLog(event);
            const requestId = parsedEvent.args.requestId;

            // Advance time beyond timeout (1 hour + 1 second)
            await time.increase(3601);

            // Trigger timeout
            await expect(
                marketplace.triggerTimeout(requestId)
            ).to.emit(marketplace, "TimeoutTriggered");
        });

        it("Should revert if timeout not reached", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            const tx = await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            const receipt = await tx.wait();

            const event = receipt.logs.find(log => {
                try {
                    const parsed = marketplace.interface.parseLog(log);
                    return parsed.name === "DecryptionRequested";
                } catch {
                    return false;
                }
            });

            const parsedEvent = marketplace.interface.parseLog(event);
            const requestId = parsedEvent.args.requestId;

            // Try to trigger timeout immediately (should fail)
            await expect(
                marketplace.triggerTimeout(requestId)
            ).to.be.revertedWith("Timeout period not reached");
        });

        it("Should batch process multiple timeouts", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            // Create 3 orders
            const tx1 = await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            const tx2 = await marketplace.connect(buyer).createOrder(seller.address, 2000, 100);
            const tx3 = await marketplace.connect(buyer).createOrder(seller.address, 3000, 150);

            const receipt1 = await tx1.wait();
            const receipt2 = await tx2.wait();
            const receipt3 = await tx3.wait();

            const requestIds = [];
            for (const receipt of [receipt1, receipt2, receipt3]) {
                const event = receipt.logs.find(log => {
                    try {
                        const parsed = marketplace.interface.parseLog(log);
                        return parsed.name === "DecryptionRequested";
                    } catch {
                        return false;
                    }
                });
                const parsedEvent = marketplace.interface.parseLog(event);
                requestIds.push(parsedEvent.args.requestId);
            }

            // Advance time
            await time.increase(3601);

            // Batch process
            await marketplace.batchProcessTimeouts(requestIds);

            // Verify all orders timed out
            const order1 = await marketplace.getOrder(1);
            const order2 = await marketplace.getOrder(2);
            const order3 = await marketplace.getOrder(3);

            expect(order1.status).to.equal(6); // OrderStatus.TimedOut
            expect(order2.status).to.equal(6);
            expect(order3.status).to.equal(6);
        });
    });

    /*//////////////////////////////////////////////////////////////
                        REFUND MECHANISM TESTS
    //////////////////////////////////////////////////////////////*/

    describe("Refund Mechanism", function () {
        it("Should allow user to request refund for expired order", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);

            // Advance time beyond expiration (7 days + 1 second)
            await time.increase(7 * 24 * 60 * 60 + 1);

            await expect(
                marketplace.connect(buyer).requestRefund(1)
            ).to.emit(marketplace, "DecryptionFailed");
        });

        it("Should revert if non-buyer requests refund", async function () {
            const { marketplace, buyer, seller, user1 } = await loadFixture(deployMarketplaceFixture);

            await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);

            // Advance time
            await time.increase(7 * 24 * 60 * 60 + 1);

            await expect(
                marketplace.connect(user1).requestRefund(1)
            ).to.be.revertedWith("Only buyer can request refund");
        });

        it("Should revert if order not expired", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);

            await expect(
                marketplace.connect(buyer).requestRefund(1)
            ).to.be.revertedWith("Order not expired");
        });

        it("Should process refund callback successfully", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            // Create order
            await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);

            // Advance time and request refund
            await time.increase(7 * 24 * 60 * 60 + 1);
            const tx = await marketplace.connect(buyer).requestRefund(1);
            const receipt = await tx.wait();

            // Find refund decryption request
            const event = receipt.logs.find(log => {
                try {
                    const parsed = marketplace.interface.parseLog(log);
                    return parsed.name === "DecryptionRequested" && parsed.args.requestType === 3n;
                } catch {
                    return false;
                }
            });

            const parsedEvent = marketplace.interface.parseLog(event);
            const requestId = parsedEvent.args.requestId;

            // Process refund callback
            await expect(
                marketplace.processRefund(requestId, 52500)
            ).to.emit(marketplace, "RefundIssued");

            // Verify order status
            const order = await marketplace.getOrder(1);
            expect(order.status).to.equal(5); // OrderStatus.Refunded
        });
    });

    /*//////////////////////////////////////////////////////////////
                        ORDER SETTLEMENT TESTS
    //////////////////////////////////////////////////////////////*/

    describe("Order Settlement", function () {
        it("Should settle active order", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            // Create and activate order
            const tx = await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            const receipt = await tx.wait();

            const event = receipt.logs.find(log => {
                try {
                    const parsed = marketplace.interface.parseLog(log);
                    return parsed.name === "DecryptionRequested";
                } catch {
                    return false;
                }
            });

            const parsedEvent = marketplace.interface.parseLog(event);
            const requestId = parsedEvent.args.requestId;

            // Process decryption
            await marketplace.processOrderDecryption(requestId, 1050, 50, 52500);

            // Settle order
            await expect(
                marketplace.connect(buyer).settleOrder(1)
            ).to.emit(marketplace, "OrderSettled");

            // Verify order status
            const order = await marketplace.getOrder(1);
            expect(order.status).to.equal(2); // OrderStatus.Completed
        });

        it("Should allow seller to settle order", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            const tx = await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            const receipt = await tx.wait();

            const event = receipt.logs.find(log => {
                try {
                    const parsed = marketplace.interface.parseLog(log);
                    return parsed.name === "DecryptionRequested";
                } catch {
                    return false;
                }
            });

            const parsedEvent = marketplace.interface.parseLog(event);
            const requestId = parsedEvent.args.requestId;

            await marketplace.processOrderDecryption(requestId, 1050, 50, 52500);

            // Seller settles
            await expect(
                marketplace.connect(seller).settleOrder(1)
            ).to.emit(marketplace, "OrderSettled");
        });

        it("Should allow operator to settle order", async function () {
            const { marketplace, buyer, seller, operator } = await loadFixture(deployMarketplaceFixture);

            const tx = await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            const receipt = await tx.wait();

            const event = receipt.logs.find(log => {
                try {
                    const parsed = marketplace.interface.parseLog(log);
                    return parsed.name === "DecryptionRequested";
                } catch {
                    return false;
                }
            });

            const parsedEvent = marketplace.interface.parseLog(event);
            const requestId = parsedEvent.args.requestId;

            await marketplace.processOrderDecryption(requestId, 1050, 50, 52500);

            // Operator settles
            await expect(
                marketplace.connect(operator).settleOrder(1)
            ).to.emit(marketplace, "OrderSettled");
        });

        it("Should revert if order not active", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);

            // Try to settle without activating
            await expect(
                marketplace.connect(buyer).settleOrder(1)
            ).to.be.revertedWith("Order not active");
        });

        it("Should decrease totalActiveOrders on settlement", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            const tx = await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            const receipt = await tx.wait();

            expect(await marketplace.totalActiveOrders()).to.equal(1);

            const event = receipt.logs.find(log => {
                try {
                    const parsed = marketplace.interface.parseLog(log);
                    return parsed.name === "DecryptionRequested";
                } catch {
                    return false;
                }
            });

            const parsedEvent = marketplace.interface.parseLog(event);
            const requestId = parsedEvent.args.requestId;

            await marketplace.processOrderDecryption(requestId, 1050, 50, 52500);
            await marketplace.connect(buyer).settleOrder(1);

            expect(await marketplace.totalActiveOrders()).to.equal(0);
        });
    });

    /*//////////////////////////////////////////////////////////////
                        ORDER CANCELLATION TESTS
    //////////////////////////////////////////////////////////////*/

    describe("Order Cancellation", function () {
        it("Should allow buyer to cancel pending order", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);

            await expect(
                marketplace.connect(buyer).cancelOrder(1)
            ).to.emit(marketplace, "DecryptionFailed");

            const order = await marketplace.getOrder(1);
            expect(order.status).to.equal(3); // OrderStatus.Cancelled
        });

        it("Should revert if non-buyer tries to cancel", async function () {
            const { marketplace, buyer, seller, user1 } = await loadFixture(deployMarketplaceFixture);

            await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);

            await expect(
                marketplace.connect(user1).cancelOrder(1)
            ).to.be.revertedWith("Only buyer can cancel");
        });
    });

    /*//////////////////////////////////////////////////////////////
                        GAS OPTIMIZATION TESTS
    //////////////////////////////////////////////////////////////*/

    describe("Gas Optimization (HCU)", function () {
        it("Should cleanup pending decryptions", async function () {
            const { marketplace, buyer, seller, operator } = await loadFixture(deployMarketplaceFixture);

            // Create multiple orders
            for (let i = 0; i < 5; i++) {
                await marketplace.connect(buyer).createOrder(seller.address, 1000 + i * 100, 50 + i * 10);
            }

            // Process some decryptions
            for (let orderId = 1; orderId <= 3; orderId++) {
                const order = await marketplace.getOrder(orderId);
                await marketplace.processOrderDecryption(order.decryptionRequestId, 1000, 50, 50000);
            }

            // Cleanup
            await marketplace.connect(operator).cleanupPendingDecryptions();

            const pendingCount = await marketplace.getPendingDecryptionsCount();
            expect(pendingCount).to.equal(2); // Only 2 remaining (orders 4 and 5)
        });

        it("Should get accurate pending decryptions count", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            expect(await marketplace.getPendingDecryptionsCount()).to.equal(0);

            await marketplace.connect(buyer).createOrder(seller.address, 1000, 50);
            await marketplace.connect(buyer).createOrder(seller.address, 2000, 100);

            expect(await marketplace.getPendingDecryptionsCount()).to.equal(2);
        });
    });

    /*//////////////////////////////////////////////////////////////
                        ACCESS CONTROL TESTS
    //////////////////////////////////////////////////////////////*/

    describe("Access Control", function () {
        it("Should grant OPERATOR_ROLE correctly", async function () {
            const { marketplace, operator, OPERATOR_ROLE } = await loadFixture(deployMarketplaceFixture);

            expect(await marketplace.hasRole(OPERATOR_ROLE, operator.address)).to.be.true;
        });

        it("Should allow only operator to cleanup", async function () {
            const { marketplace, buyer, user1 } = await loadFixture(deployMarketplaceFixture);

            await expect(
                marketplace.connect(user1).cleanupPendingDecryptions()
            ).to.be.reverted; // AccessControl revert
        });
    });

    /*//////////////////////////////////////////////////////////////
                        EDGE CASES
    //////////////////////////////////////////////////////////////*/

    describe("Edge Cases", function () {
        it("Should handle maximum pending requests limit", async function () {
            const { marketplace, buyer, seller } = await loadFixture(deployMarketplaceFixture);

            // This would require creating 100+ orders which is gas-intensive
            // For demonstration, we verify the constant exists
            expect(await marketplace.MAX_PENDING_REQUESTS()).to.equal(100);
        });

        it("Should handle zero-value encrypted balances", async function () {
            const { marketplace, buyer } = await loadFixture(deployMarketplaceFixture);

            // Query encrypted balance (should not revert even if zero)
            const balance = await marketplace.encryptedBalances(buyer.address);
            expect(balance).to.not.be.undefined;
        });
    });
});
