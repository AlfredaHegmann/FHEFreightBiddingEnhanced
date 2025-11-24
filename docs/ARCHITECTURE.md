# System Architecture - Privacy-Preserving Marketplace

## Overview

This document describes the complete architecture of the Privacy-Preserving Marketplace, including the Gateway callback pattern, privacy techniques, and security mechanisms.

## 1. Core Architecture

### 1.1 Gateway Callback Pattern

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ 1. createOrder(encrypted data)
       ▼
┌──────────────────────────────────┐
│    Smart Contract                 │
│  - Encrypts order data            │
│  - Applies obfuscation            │
│  - Requests decryption            │
└──────┬───────────────────────────┘
       │ 2. FHE.requestDecryption()
       ▼
┌──────────────────────────────────┐
│    Zama Gateway                   │
│  - Receives encrypted ciphertexts │
│  - Decrypts values                │
│  - Prepares callback              │
└──────┬───────────────────────────┘
       │ 3. processOrderDecryption(callback)
       ▼
┌──────────────────────────────────┐
│    Smart Contract                 │
│  - Updates order status           │
│  - Records decrypted values       │
│  - Emits completion event         │
└──────────────────────────────────┘
```

**Key Advantages**:
- Asynchronous decryption - no blocking
- Atomic callback execution
- Automatic authorization by FHE system
- Full decryption happens off-chain

### 1.2 Request Tracking

```solidity
struct DecryptionRequest {
    address requester;      // Who submitted the request
    uint256 requestType;    // 1: Order, 2: Settlement, 3: Refund
    uint256 orderId;        // Associated order
    uint256 timestamp;      // Request creation time
    bool processed;         // Already handled?
    bool timedOut;         // Exceeded timeout window?
}
```

## 2. Privacy Techniques

### 2.1 Price Obfuscation

**Problem**: Exact prices could leak information about market conditions.

**Solution**: Add controlled noise to prices before encryption.

```solidity
// Generates pseudo-random noise in range [0, PRICE_NOISE_RANGE)
uint64 priceNoise = uint64(keccak256(...)) % PRICE_NOISE_RANGE;
uint64 obfuscatedPrice = basePrice + priceNoise;

// Encrypt obfuscated price
euint64 encryptedPrice = FHE.asEuint64(obfuscatedPrice);
```

**Properties**:
- Noise is deterministic but unpredictable
- Added only once during order creation
- Preserves order of magnitudes for comparison
- Easy to reverse-engineer (not crypto-secure) but adds a layer

### 2.2 Random Multiplier for Division Privacy

**Problem**: Division operations (total = price * amount) could leak intermediate values.

**Solution**: Multiply by random factor before encryption.

```solidity
// Generate random multiplier in [1000, 10000)
uint64 randomMult = MIN_RANDOM_MULTIPLIER +
                    (keccak256(...) % (MAX_RANDOM_MULTIPLIER - MIN_RANDOM_MULTIPLIER));

// Compute encrypted total with multiplier
euint64 tempTotal = FHE.mul(encryptedPrice, encryptedAmount);
euint64 encryptedTotal = FHE.mul(tempTotal, encryptedMultiplier);

// To get actual total: actual = encryptedTotal / randomMultiplier
// This division happens off-chain in Gateway
```

**Why This Works**:
- Intermediate multiplications hidden in encrypted domain
- Reveals only final encrypted result
- Gateway can safely divide during decryption
- Prevents pattern analysis

### 2.3 Access Control Lists (ACLs)

```solidity
// Allow contract to access encrypted value
FHE.allowThis(encryptedPrice);

// Allow specific user to access
FHE.allow(encryptedPrice, msg.sender);
```

**Prevents**:
- Unauthorized decryption requests
- Information leakage to third parties

## 3. Timeout Protection Mechanism

### 3.1 Timeout Flow

```
Order Created (t=0)
    │
    ├─ Decryption Requested
    │  ├─ Status: Pending
    │  └─ Timeout Window: [t, t+1hour]
    │
    └─ Two Outcomes:
       ├─ (Normal) Gateway Decrypts → Callback Received
       │  └─ Status: Active
       │
       └─ (Timeout) No Response After 1 Hour
          ├─ triggerTimeout() called
          ├─ Status: TimedOut
          └─ Auto-initiate Refund
```

### 3.2 Implementation

```solidity
// Public timeout trigger (anyone can call)
function triggerTimeout(uint256 requestId) external {
    DecryptionRequest storage request = decryptionRequests[requestId];

    require(!request.processed, "Already processed");
    require(block.timestamp > request.timestamp + DECRYPTION_TIMEOUT,
            "Timeout period not reached");

    // Mark as timed out
    request.timedOut = true;

    // Initiate refund
    _initiateRefund(request.orderId, "Decryption timeout");

    emit TimeoutTriggered(request.orderId, requestId);
}
```

### 3.3 Batch Processing (Gas Optimization)

```solidity
function batchProcessTimeouts(uint256[] calldata requestIds) external onlyRole(OPERATOR_ROLE) {
    for (uint256 i = 0; i < requestIds.length; i++) {
        DecryptionRequest storage request = decryptionRequests[requestIds[i]];

        if (!request.processed &&
            block.timestamp > request.timestamp + DECRYPTION_TIMEOUT) {
            _handleDecryptionTimeout(requestIds[i]);
        }
    }
}
```

**Benefits**:
- O(n) operation instead of n separate calls
- Reduces transaction overhead
- Single OPERATOR_ROLE check
- Cleanup happens periodically

## 4. Refund Mechanism

### 4.1 Refund Triggers

1. **Timeout**: No decryption response after 1 hour
2. **Expiration**: Order expires (7 days)
3. **User Request**: Buyer explicitly requests refund
4. **Failed Settlement**: Any error during settlement

### 4.2 Refund Flow

```
Refund Requested
    │
    ├─ Check Order Status (Pending or Active)
    │
    ├─ Set Status: RefundProcessing
    │
    ├─ Request Decryption of Refund Amount
    │  └─ FHE.requestDecryption(encryptedTotal, this.processRefund.selector)
    │
    └─ Gateway Decryption → Callback
       ├─ Decrypt Refund Amount
       ├─ Set Status: Refunded
       └─ Emit RefundIssued Event
```

### 4.3 Security Considerations

```solidity
// Prevent re-entrancy
function _initiateRefund(uint256 orderId, string memory reason) internal {
    Order storage order = orders[orderId];

    // Verify order state before proceeding
    require(order.status == OrderStatus.Pending ||
            order.status == OrderStatus.Active,
            "Invalid status for refund");

    // Mark as processing (prevents double-refund)
    order.status = OrderStatus.RefundProcessing;

    // Request new decryption
    uint256 requestId = FHE.requestDecryption(cts, this.processRefund.selector);

    // Track request
    decryptionRequests[requestId] = DecryptionRequest({...});
}
```

## 5. State Management

### 5.1 Order States

```
  ┌─────────┐
  │ Pending │  ← Created, awaiting Gateway decryption
  └────┬────┘
       │ processOrderDecryption()
       ▼
  ┌─────────┐
  │ Active  │  ← Decrypted, ready to settle
  └────┬────┘
       │ settleOrder() or refund triggered
       ├─────────────────┬────────────────┐
       ▼                 ▼                ▼
   ┌─────────┐   ┌──────────────┐  ┌─────────┐
   │Completed│   │RefundProcessing│  │TimedOut │
   └─────────┘   └────────┬────────┘  └─────────┘
                         │
                         │ processRefund()
                         ▼
                    ┌──────────┐
                    │ Refunded │
                    └──────────┘

  Cancelled State (from Pending or Active)
       ↓
    ┌─────────┐
    │Cancelled│  ← User initiated cancellation
    └─────────┘
```

### 5.2 Storage Layout

```solidity
// Order storage (packed efficiently)
struct Order {
    address buyer;              // 20 bytes
    address seller;             // 20 bytes
    euint64 encryptedPrice;     // 32 bytes (encrypted)
    euint64 encryptedAmount;    // 32 bytes (encrypted)
    euint64 encryptedTotal;     // 32 bytes (encrypted)
    euint64 randomMultiplier;   // 32 bytes (encrypted)
    uint256 createdAt;          // 32 bytes
    uint256 expiresAt;          // 32 bytes
    OrderStatus status;         // 1 byte (enum)
    uint256 decryptionRequestId;// 32 bytes
}

// Total: ~253 bytes per order (with packing)
```

## 6. Homomorphic Operations

### 6.1 Supported FHE Operations

```solidity
// Arithmetic
euint64 result = FHE.add(a, b);      // a + b
euint64 result = FHE.sub(a, b);      // a - b
euint64 result = FHE.mul(a, b);      // a * b
euint64 result = FHE.div(a, divisor);// a / divisor (approximate)

// Comparisons (return ebool)
ebool condition = FHE.gt(a, b);      // a > b
ebool condition = FHE.lt(a, b);      // a < b
ebool condition = FHE.eq(a, b);      // a == b

// Conditional
euint64 result = FHE.select(condition, ifTrue, ifFalse);
```

### 6.2 Example: Encrypted Balance Update

```solidity
// Before settlement
euint64 buyerBalance = encryptedBalances[buyer];     // Encrypted
euint64 sellerBalance = encryptedBalances[seller];   // Encrypted

// During settlement
encryptedBalances[buyer] = FHE.sub(buyerBalance, order.encryptedTotal);
encryptedBalances[seller] = FHE.add(sellerBalance, order.encryptedTotal);

// Result: Balances updated, actual values remain encrypted!
```

## 7. Gas Optimization Strategies

### 7.1 IR-Based Compilation

```javascript
// hardhat.config.js
settings: {
    optimizer: {
        enabled: true,
        runs: 200,
        details: {
            yul: true,  // Intermediate Representation
            yulDetails: {
                stackAllocation: true,
                optimizerSteps: "dhfoDgvulfnTUtnIf"
            }
        }
    },
    viaIR: true  // ← 30-40% gas savings
}
```

**Why viaIR Works**:
- Compiles to LLVM-like intermediate representation first
- Global optimization across function boundaries
- Better register allocation
- Improved dead code elimination

### 7.2 Lazy Evaluation

```solidity
// Don't compute encrypted values until needed
function settleOrder(uint256 orderId) external {
    Order storage order = orders[orderId];

    // Encrypted balances computed only once
    encryptedBalances[buyer] = FHE.sub(balance, order.encryptedTotal);
}
```

### 7.3 Batch Operations

```solidity
// Clean up processed decryptions in bulk
function cleanupPendingDecryptions() external onlyRole(OPERATOR_ROLE) {
    uint256 writeIndex = 0;

    for (uint256 readIndex = 0; readIndex < pendingDecryptions.length; readIndex++) {
        if (!decryptionRequests[pendingDecryptions[readIndex]].processed) {
            pendingDecryptions[writeIndex] = pendingDecryptions[readIndex];
            writeIndex++;
        }
    }

    // Truncate array - O(n) instead of n removals
    while (pendingDecryptions.length > writeIndex) {
        pendingDecryptions.pop();
    }
}
```

## 8. Security Model

### 8.1 Threat Model

| Threat | Mitigation |
|--------|-----------|
| Reentrancy | ReentrancyGuard + state updates first |
| Unauthorized Access | Role-based AccessControl |
| Overflow/Underflow | Solidity 0.8+ SafeMath |
| Decryption Leak | FHE.allow() ACLs |
| Fund Lock | Timeout + Refund mechanism |
| Double-Spend | Atomic status transitions |
| Unauthorized Refund | Require checks + role verification |

### 8.2 Access Control

```solidity
// Admin operations
function emergencyPause() external onlyRole(DEFAULT_ADMIN_ROLE) { ... }

// Operator operations (gas optimization)
function cleanupPendingDecryptions() external onlyRole(OPERATOR_ROLE) { ... }

// User operations (no special role)
function createOrder(...) external { ... }
function settleOrder(...) external { ... }
function cancelOrder(...) external { ... }
```

## 9. Deployment Architecture

### 9.1 Multi-Network Support

```
┌─────────────────────────────────────┐
│  PrivacyPreservingMarketplace.sol    │
│       Single Contract Binary         │
└────────────────┬────────────────────┘
                 │
        ┌────────┼────────┬────────┐
        ▼        ▼        ▼        ▼
    ┌────────┐┌────────┐┌──────┐┌───────┐
    │Hardhat ││Sepolia ││FHEVM ││Future │
    │Network ││Testnet ││Sept  ││Network│
    └────────┘└────────┘└──────┘└───────┘
```

### 9.2 Deployment Info Persistence

```javascript
// deployments/sepolia-deployment.json
{
  "network": "sepolia",
  "chainId": "11155111",
  "contractAddress": "0x...",
  "transactionHash": "0x...",
  "blockNumber": 4567890,
  "timestamp": "2025-01-15T10:30:00Z",
  "configuration": {
    "decryptionTimeout": "3600",
    "maxPendingRequests": "100",
    "priceNoiseRange": "100"
  },
  "abi": [...]
}
```

## 10. Data Flow Diagrams

### 10.1 Complete Order Lifecycle

```
┌──────────────┐
│ User Creates │
│ Order        │
└──────┬───────┘
       │ createOrder(seller, price, amount)
       │
       ├─ Add noise to price
       ├─ Generate random multiplier
       ├─ Encrypt all values
       ├─ Store encrypted order
       │
       ▼ (1) Request Decryption
┌──────────────────┐
│ Zama Gateway     │
│ (Off-chain)      │
│ Decrypts values  │
└──────┬───────────┘
       │
       ▼ (2) Gateway Callback
┌──────────────────────┐
│ processOrderDecryption│
│ - Validate request   │
│ - Check timeout      │
│ - Update status      │
│ - Emit event         │
└──────┬───────────────┘
       │
       ▼ (3) User Settlement
┌──────────────┐
│ settleOrder  │
│ - Update bal │
│ - Complete   │
└──────┬───────┘
       │
       ▼
   ┌─────────┐
   │Completed│
   └─────────┘
```

## 11. Future Enhancements

1. **Multi-signature Settlements**: Require multiple approvals
2. **Escrow Contracts**: Third-party dispute resolution
3. **Cross-chain Bridging**: Multi-network orders
4. **Yield Generation**: Earn on locked encrypted balances
5. **DAO Governance**: Community-controlled parameters
6. **Advanced Privacy**: ZK proofs for additional obfuscation

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
