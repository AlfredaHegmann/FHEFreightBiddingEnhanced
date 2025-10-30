# 🔐 FHE Anonymous Freight Bidding Platform

A privacy-preserving freight bidding marketplace powered by **Fully Homomorphic Encryption (FHE)** - enabling confidential price matching and anonymous competitive bidding in logistics operations.

[![Live Demo](https://img.shields.io/badge/Demo-Live-success?style=for-the-badge&logo=vercel)](https://fhe-freight-bidding-enhanced.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Contract](https://img.shields.io/badge/Contract-Sepolia-purple?style=for-the-badge&logo=ethereum)](https://sepolia.etherscan.io/address/0x2E7B5f277595e3F1eeB9548ef654E178537cb90E)

**Built with Zama FHEVM** - Demonstrating enterprise-grade privacy in decentralized freight logistics.

---

## 🌐 Live Deployment

**Platform URL**: [https://fhe-freight-bidding-enhanced.vercel.app/](https://fhe-freight-bidding-enhanced.vercel.app/)

**Smart Contract**: [`0x2E7B5f277595e3F1eeB9548ef654E178537cb90E`](https://sepolia.etherscan.io/address/0x2E7B5f277595e3F1eeB9548ef654E178537cb90E)

**Network**: Sepolia Testnet (Chain ID: 11155111)

**Demo Video**: `demo.mp4` - Download this file to watch the complete platform demonstration (the video file must be downloaded to view, links to video files cannot be opened directly)

 

---

## 🎯 Core Concept: FHE-Based Anonymous Freight Bidding

### The Privacy Challenge in Logistics

Traditional freight bidding platforms expose competitive pricing strategies, creating disadvantages for both shippers and carriers:

- **Shippers** reveal their budget constraints, weakening negotiating power
- **Carriers** expose their pricing models to competitors
- **Market manipulation** becomes possible when bid prices are visible
- **Price fixing** can occur when competitors see each other's bids

### FHE Solution: Privacy-Preserving Price Matching

This platform uses **Fully Homomorphic Encryption (FHE)** to enable:

```
🔒 Encrypted Bids → 🔐 Homomorphic Comparison → ✅ Winner Selection
   (Private)           (On-Chain Computation)        (Public Result)
```

**Key Innovation**: Smart contracts can **compare and select the lowest bid** without ever decrypting the prices, ensuring complete confidentiality throughout the bidding process.

---

## 🔐 How FHE Powers Anonymous Bidding

### Privacy Model

#### What Remains Private (Encrypted with FHE)

- **Bid Prices** - Each carrier's proposed freight cost (euint32)
- **Cargo Details** - Weight, volume, special handling requirements (euint64)
- **Delivery Estimates** - Proposed delivery timeframes (euint32)
- **Competitive Strategy** - All pricing and operational data

#### What's Transparent (Public on Blockchain)

- **Job Listings** - Origin, destination, cargo type
- **Bidding Activity** - Number of participants (not identities)
- **Awarded Jobs** - Winner identity (after selection)
- **Transaction History** - Blockchain audit trail

### FHE Operations

The platform performs **encrypted comparisons** to find the lowest bid:

```solidity
// Find lowest price WITHOUT decryption
euint32 lowestPrice = bids[0].encryptedPrice;

for (uint i = 1; i < bidCount; i++) {
    // Homomorphic less-than comparison
    ebool isLower = FHE.lt(bids[i].encryptedPrice, lowestPrice);

    // Homomorphic conditional selection
    lowestPrice = FHE.select(isLower, bids[i].encryptedPrice, lowestPrice);
}

// Result: Lowest price found, all bids remain encrypted
```

---

## ✨ Platform Features

### 🔐 Privacy-First Architecture

- **Fully Homomorphic Encryption** using Zama FHEVM
- **Encrypted bid storage** with euint32/euint64 types
- **Zero-knowledge comparisons** for winner selection
- **Privacy-preserving price discovery**

### 📦 Complete Freight Lifecycle

**For Shippers**:
1. Post freight jobs (origin, destination, cargo type)
2. Receive anonymous encrypted bids
3. Automated lowest bid selection
4. Award job to winning carrier
5. Track delivery completion

**For Carriers**:
1. Browse available freight jobs
2. Submit encrypted competitive bids
3. Receive award notifications
4. Complete freight delivery
5. Build reputation score

### 🛡️ Enterprise Security

- **Access control** with role-based permissions
- **DoS protection** (rate limiting on bids and jobs)
- **Pausable mechanism** for emergency stops
- **Input validation** on all encrypted data
- **ReentrancyGuard** on critical functions

### 🎨 Modern Web3 Interface

- **Wallet Integration** via MetaMask
- **Real-time Updates** on job and bid status
- **Encrypted Data Display** with privacy indicators
- **Responsive Design** for desktop and mobile
- **Interactive Dashboard** with statistics

---

## 🏗️ Technical Architecture

```
┌──────────────────────────────────────────────────┐
│            Frontend (Vanilla JS)                 │
│  ├─ Ethers.js v5 for Web3 integration           │
│  ├─ MetaMask wallet connection                  │
│  ├─ Real-time contract interaction              │
│  └─ Encrypted data visualization                │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│      Smart Contract (Solidity 0.8.24)           │
│  ├─ PrivateFreightBiddingEnhanced.sol           │
│  │   ├─ FHE encrypted storage (euint32/64)     │
│  │   ├─ Homomorphic bid comparison             │
│  │   ├─ Privacy-preserving winner selection    │
│  │   └─ Role-based access control              │
│  └─ Deployed on Sepolia Testnet                │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│           Zama FHEVM Infrastructure             │
│  ├─ Fully Homomorphic Encryption library       │
│  ├─ @fhevm/solidity integration                │
│  ├─ SepoliaConfig for Sepolia deployment       │
│  └─ On-chain encrypted computation              │
└──────────────────────────────────────────────────┘
```

### Project Structure

```
freight-bidding-platform/
├── index.html                    # Main application interface
├── app.js                        # Application logic (ethers v5)
├── contracts/
│   ├── PrivateFreightBiddingEnhanced.sol
│   └── PrivateFreightBiddingEnhanced.json (ABI)
├── vercel.json                   # Vercel deployment config
├── .vercelignore                 # Deployment exclusions
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH** - Get free testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
- **Modern Web Browser** (Chrome, Firefox, Brave)

### Access the Platform

1. **Visit**: [https://fhe-freight-bidding-enhanced.vercel.app/](https://fhe-freight-bidding-enhanced.vercel.app/)

2. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection

3. **Switch Network**: Ensure MetaMask is on **Sepolia Testnet**
   - Network Name: Sepolia
   - Chain ID: 11155111
   - RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
   - Currency: SepoliaETH

4. **Start Using**:
   - **Shippers**: Post freight jobs and receive bids
   - **Carriers**: Browse jobs and submit competitive bids

---

## 📋 User Guide

### For Shippers

**Step 1: Register as Shipper**
```
1. Connect your wallet
2. Click "Register as Shipper"
3. Wait for transaction confirmation
```

**Step 2: Post Freight Job**
```
1. Navigate to "Post Job" tab
2. Enter job details:
   - Origin city
   - Destination city
   - Cargo type (Electronics, Perishables, etc.)
3. Submit and confirm transaction
```

**Step 3: Review Encrypted Bids**
```
- View number of bids received (prices remain encrypted)
- Smart contract automatically selects lowest bid
- Award job to winning carrier
```

**Step 4: Track Delivery**
```
- Monitor job status in dashboard
- Confirm delivery completion
- Review carrier performance
```

### For Carriers

**Step 1: Register as Carrier**
```
1. Connect your wallet
2. Click "Register as Carrier"
3. Wait for transaction confirmation
```

**Step 2: Browse Available Jobs**
```
- View active freight jobs
- Check origin, destination, cargo type
- Evaluate job requirements
```

**Step 3: Submit Encrypted Bid**
```
1. Select a job to bid on
2. Enter your bid price (USD)
3. Submit - price is automatically encrypted
4. Your bid remains confidential
```

**Step 4: Complete Awarded Jobs**
```
- Receive notification if you win
- Complete freight delivery
- Confirm completion on-chain
```

---

## 🔧 FHE Technical Implementation

### Encrypted Data Types

The platform uses Zama's FHEVM encrypted types:

```solidity
// Encrypted bid structure
struct EncryptedBid {
    euint32 encryptedPrice;          // Encrypted bid price (32-bit)
    euint32 encryptedDeliveryTime;   // Encrypted delivery estimate
    euint64 encryptedCargoWeight;    // Encrypted cargo weight
    address carrier;                  // Carrier address (public)
    bool isRevealed;                 // Reveal status
}
```

**FHE Type Reference**:
- `euint8` - 8-bit encrypted unsigned integer
- `euint32` - 32-bit encrypted unsigned integer (bid prices, times)
- `euint64` - 64-bit encrypted unsigned integer (weights, volumes)
- `ebool` - Encrypted boolean value

### Homomorphic Operations

**Price Comparison** (without decryption):
```solidity
// Compare two encrypted bids
ebool bidIsLower = FHE.lt(bid1.encryptedPrice, bid2.encryptedPrice);

// Select lower bid
euint32 lowerPrice = FHE.select(bidIsLower, bid1.encryptedPrice, bid2.encryptedPrice);
```

**Encrypted Arithmetic**:
```solidity
FHE.add(a, b)      // Encrypted addition
FHE.sub(a, b)      // Encrypted subtraction
FHE.mul(a, b)      // Encrypted multiplication
FHE.lt(a, b)       // Encrypted less-than comparison
FHE.eq(a, b)       // Encrypted equality check
FHE.select(c, a, b) // Encrypted conditional selection
```

### Frontend Integration

The frontend uses **ethers.js v5** for contract interaction:

```javascript
// Connect to Sepolia network
provider = new ethers.providers.Web3Provider(window.ethereum);
signer = provider.getSigner();

// Initialize contract
contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

// Submit encrypted bid (encryption handled on-chain)
await contract.submitBid(
    jobId,
    bidPrice,        // Plain value - encrypted by contract
    deliveryTime,
    cargoWeight
);
```

**Note**: With Sepolia deployment, FHE encryption is handled entirely on-chain using the SepoliaConfig. No client-side fhevmjs library is required.

---

## 🎬 Demo Video

**File**: `demo.mp4` - Download this file from the repository to watch the demonstration

**Live Example**: [https://fhe-freight-bidding-enhanced.vercel.app/](https://fhe-freight-bidding-enhanced.vercel.app/)

**Contents**:
- ✅ Complete platform walkthrough
- ✅ Shipper journey: Posting jobs and receiving bids
- ✅ Carrier journey: Browsing jobs and submitting encrypted bids
- ✅ FHE privacy demonstration
- ✅ Wallet connection and MetaMask interaction
- ✅ Smart contract transaction flow
- ✅ Job award and completion process

**Note**: The demo video file must be downloaded to your local device to view. Video files cannot be opened directly through web links - please download `demo.mp4` and open it with your video player.

---

## 📊 Smart Contract Details

### Deployed Contract Information

**Contract Name**: `PrivateFreightBiddingEnhanced`

**Address**: [`0x2E7B5f277595e3F1eeB9548ef654E178537cb90E`](https://sepolia.etherscan.io/address/0x2E7B5f277595e3F1eeB9548ef654E178537cb90E)

**Network**: Sepolia Testnet (Chain ID: 11155111)

**Compiler**: Solidity 0.8.24

**Optimization**: Enabled (200 runs)

### Key Contract Functions

**Registration**:
```solidity
function verifyShipper(address _shipper) external
function verifyCarrier(address _carrier) external
```

**Job Management**:
```solidity
function postJob(string origin, string destination, string cargoType) external returns (uint256)
function getJobInfo(uint256 jobId) external view returns (...)
```

**Encrypted Bidding**:
```solidity
function submitBid(uint256 jobId, uint32 price) external
function getBidInfo(uint256 jobId, address carrier) external view returns (...)
function getBidders(uint256 jobId) external view returns (address[])
```

**Job Award**:
```solidity
function closeBidding(uint256 jobId) external
function awardJob(uint256 jobId, address carrier) external
```

**Events**:
```solidity
event JobPosted(uint256 indexed jobId, address indexed shipper)
event BidSubmitted(uint256 indexed jobId, address indexed carrier)
event BidRevealed(uint256 indexed jobId, address indexed carrier, uint32 price)
event JobAwarded(uint256 indexed jobId, address indexed carrier, uint256 finalPrice)
```

---

## 🔒 Privacy & Security

### Privacy Guarantees

✅ **Bid Confidentiality**: All bid prices remain encrypted until job award

✅ **Zero-Knowledge Comparison**: Winner selection without revealing losing bids

✅ **Competitive Protection**: Competitors cannot see each other's pricing

✅ **Data Minimization**: Only essential data stored on-chain

### Security Features

✅ **Access Control**: Role-based permissions for shippers and carriers

✅ **Input Validation**: All user inputs validated before processing

✅ **DoS Protection**: Rate limiting on job posts and bid submissions

✅ **ReentrancyGuard**: Protection against reentrancy attacks

✅ **Pausable**: Emergency stop mechanism for critical issues

### Trust Model

**What You Must Trust**:
- Zama FHEVM encryption implementation
- Sepolia testnet validators
- Smart contract code correctness
- MetaMask wallet security

**What You Don't Need to Trust**:
- Platform operators (cannot see encrypted bids)
- Other users (cannot see your pricing)
- Centralized servers (fully on-chain logic)

---

## 🌐 Deployment Information

### Sepolia Testnet

**Blockchain**: Ethereum Sepolia Testnet

**Chain ID**: 11155111

**Contract Address**: `0x2E7B5f277595e3F1eeB9548ef654E178537cb90E`

**Explorer**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x2E7B5f277595e3F1eeB9548ef654E178537cb90E)

### Frontend Deployment

**Platform**: Vercel

**URL**: [https://fhe-freight-bidding-enhanced.vercel.app/](https://fhe-freight-bidding-enhanced.vercel.app/)

**Build**: Static HTML/JS deployment

**CDN**: Vercel Edge Network for global low-latency access

---

## 📊 Technology Stack

### Smart Contract Layer

**Core Technologies**:
- **Solidity** 0.8.24 - Smart contract programming language
- **Zama FHEVM** - Fully Homomorphic Encryption virtual machine
- **@fhevm/solidity** 0.5.0+ - FHE library for Solidity
- **SepoliaConfig** - Sepolia testnet configuration for FHEVM

**Security & Standards**:
- **OpenZeppelin Contracts** - Industry-standard secure contract implementations
- **ReentrancyGuard** - Protection against reentrancy attacks
- **Pausable** - Emergency stop mechanism
- **Access Control** - Role-based permissions system

**FHE Data Types**:
- `euint32` - 32-bit encrypted unsigned integers (bid prices)
- `euint64` - 64-bit encrypted unsigned integers (cargo details)
- `ebool` - Encrypted boolean values

### Frontend Layer

**Core Technologies**:
- **Vanilla JavaScript** (ES6+) - Pure JavaScript implementation
- **HTML5** - Modern semantic markup
- **CSS3** - Responsive styling with animations
- **Ethers.js** v6.7.1 - Ethereum library for Web3 interactions

**UI Framework & Styling**:
- **Tailwind CSS** v2.2.19 - Utility-first CSS framework
- **Font Awesome** 6.0.0 - Icon library
- **Custom CSS** - Gradient backgrounds and animations

**Web3 Integration**:
- **MetaMask** - Browser wallet for Ethereum
- **Ethers.js Provider** - Web3 provider abstraction
- **Contract ABI** - Type-safe contract interaction

### Blockchain Infrastructure

**Network**:
- **Sepolia Testnet** - Ethereum test network (Chain ID: 11155111)
- **FHEVM Compatible** - Supports homomorphic encryption operations

**Smart Contract**:
- **Contract Address**: `0x2E7B5f277595e3F1eeB9548ef654E178537cb90E`
- **Verification**: Verified on Sepolia Etherscan
- **Gas Optimization**: Compiler optimization enabled (200 runs)

### Deployment & Hosting

**Frontend Deployment**:
- **Vercel** - Serverless deployment platform
- **CDN**: Global content delivery
- **HTTPS**: Secure connection enabled
- **Custom Domain**: fhe-freight-bidding-enhanced.vercel.app

**Configuration Files**:
- `vercel.json` - Deployment configuration
- `.vercelignore` - Deployment exclusions

### Development Tools

**Version Control**:
- **Git** - Source control management
- **GitHub** - Repository hosting and collaboration

**Testing**:
- **Hardhat** (if used) - Ethereum development environment
- **Sepolia Testnet** - Live testing environment
- **MetaMask** - Manual testing and transaction signing

### Encryption & Privacy

**FHE Operations**:
- **Homomorphic Encryption** - Computation on encrypted data
- **On-chain Encryption** - SepoliaConfig handles encryption
- **Zero-Knowledge Comparisons** - Private bid evaluation
- **Encrypted Storage** - All sensitive data stored encrypted

**FHE Functions Used**:
```solidity
FHE.asEuint32()      // Convert to encrypted uint32
FHE.lt()             // Encrypted less-than comparison
FHE.select()         // Encrypted conditional selection
FHE.add()            // Encrypted addition
FHE.sub()            // Encrypted subtraction
```

### Architecture Patterns

**Design Patterns**:
- **Event-Driven Architecture** - Smart contract events for state changes
- **Role-Based Access Control (RBAC)** - Shipper/Carrier permissions
- **Factory Pattern** - Job and bid creation
- **State Machine** - Job lifecycle management (Open → Closed → Awarded → Completed)

**Smart Contract Patterns**:
- **Checks-Effects-Interactions** - Secure function execution order
- **Pull over Push** - Safer payment pattern
- **Emergency Stop** - Pausable contract functionality

### Key Features Enabled by Stack

**Privacy Features**:
- ✅ Encrypted bid storage (euint32)
- ✅ Homomorphic price comparison (FHE.lt)
- ✅ Privacy-preserving winner selection (FHE.select)
- ✅ Zero-knowledge verification

**Web3 Features**:
- ✅ Wallet connectivity (MetaMask)
- ✅ Transaction signing and submission
- ✅ Real-time blockchain state reading
- ✅ Event listening and updates

**User Experience**:
- ✅ Responsive design (mobile-friendly)
- ✅ Real-time updates
- ✅ Interactive dashboard
- ✅ Animated UI elements
- ✅ Privacy indicators

### Performance Characteristics

**Gas Costs** (Approximate):
- Register Shipper/Carrier: ~50,000 gas
- Post Job: ~150,000 gas
- Submit Encrypted Bid: ~200,000 gas (FHE operations)
- Award Job: ~80,000 gas

**Transaction Times**:
- Average block time: ~12 seconds (Sepolia)
- Confirmation time: ~24-36 seconds (2-3 blocks)

### Browser Compatibility

**Supported Browsers**:
- ✅ Chrome 90+ (Recommended)
- ✅ Firefox 88+
- ✅ Brave 1.24+
- ✅ Edge 90+
- ✅ Safari 14+ (with MetaMask extension)

**Requirements**:
- JavaScript enabled
- MetaMask extension installed
- Web3 wallet connection
- Sepolia testnet ETH

### External Dependencies

**CDN Resources**:
```html
<!-- Ethers.js for Web3 -->
<script src="https://cdn.jsdelivr.net/npm/ethers@6.7.1/dist/ethers.umd.min.js"></script>

<!-- Tailwind CSS for styling -->
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

<!-- Font Awesome for icons -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
```

### Security Considerations

**Frontend Security**:
- ✅ No private keys stored in code
- ✅ MetaMask handles key management
- ✅ Input sanitization on all forms
- ✅ HTTPS-only connections

**Smart Contract Security**:
- ✅ No direct ETH transfers (prevents loss)
- ✅ ReentrancyGuard on critical functions
- ✅ Access control on privileged functions
- ✅ Input validation on all parameters
- ✅ Emergency pause mechanism

### Comparison: Traditional vs FHE Stack

| Component | Traditional Stack | FHE Stack (This Project) |
|-----------|------------------|--------------------------|
| **Data Storage** | Plain text on-chain | Encrypted (euint32/64) on-chain |
| **Computation** | Requires decryption | Homomorphic (no decryption) |
| **Privacy** | Public or off-chain | On-chain + private |
| **Winner Selection** | Reveals all bids | Zero-knowledge comparison |
| **Gas Costs** | Lower (~100k gas) | Higher (~200k gas, FHE overhead) |
| **Security** | Standard | Enhanced with FHE |
| **Complexity** | Simpler | More advanced |

### Technology Stack Summary

```
┌─────────────────────────────────────────────────────────┐
│                   USER INTERFACE                        │
│  HTML5 + CSS3 + Vanilla JavaScript + Tailwind CSS      │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                  WEB3 LAYER                             │
│         Ethers.js v6 + MetaMask Integration            │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│              SMART CONTRACT LAYER                       │
│    Solidity 0.8.24 + Zama FHEVM + @fhevm/solidity     │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│            BLOCKCHAIN INFRASTRUCTURE                    │
│       Sepolia Testnet + FHEVM Configuration            │
└─────────────────────────────────────────────────────────┘
```

---

## 🏆 Zama FHEVM Integration

### Technologies Used

**Core FHE Components**:
- `@fhevm/solidity` - Solidity library for FHE operations
- `SepoliaConfig` - Sepolia network configuration for FHEVM
- `euint32/euint64` - Encrypted unsigned integer types
- `ebool` - Encrypted boolean type

**FHE Operations**:
- Homomorphic comparison (`FHE.lt`)
- Homomorphic selection (`FHE.select`)
- Encrypted arithmetic (`FHE.add`, `FHE.sub`)

### Why FHEVM?

Traditional encryption schemes require decryption before computation. **FHEVM enables computation on encrypted data**, making this privacy-preserving bidding platform possible.

**Without FHE**: Bid prices must be decrypted to compare → Privacy lost

**With FHE**: Bid prices remain encrypted during comparison → Privacy preserved

### Learn More About FHEVM

- **Zama Documentation**: [https://docs.zama.ai](https://docs.zama.ai)
- **FHEVM Guide**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Zama GitHub**: [https://github.com/zama-ai](https://github.com/zama-ai)

---

## 🚧 Future Enhancements

### Planned Features

**Phase 1**: Enhanced Privacy
- [ ] Encrypted cargo volume and weight
- [ ] Anonymous shipper/carrier identities
- [ ] Encrypted delivery confirmations
- [ ] Privacy-preserving reputation system

**Phase 2**: Advanced Functionality
- [ ] Multi-currency support (USDC, DAI)
- [ ] Automated bid evaluation algorithms
- [ ] Dispute resolution mechanism
- [ ] Carbon footprint tracking

**Phase 3**: Enterprise Features
- [ ] Multi-modal transportation (air, sea, rail)
- [ ] API for third-party integrations
- [ ] Analytics dashboard with privacy preservation
- [ ] International customs integration

**Phase 4**: Scaling
- [ ] Layer 2 deployment for lower gas costs
- [ ] Cross-chain freight coordination
- [ ] Mobile application (iOS, Android)
- [ ] White-label solutions for enterprises

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Please install MetaMask"
```
Solution: Install MetaMask browser extension
https://metamask.io/download/
```

**Issue**: "Wrong Network" error
```
Solution: Switch MetaMask to Sepolia Testnet
Network: Sepolia
Chain ID: 11155111
RPC: https://sepolia.infura.io/v3/YOUR_KEY
```

**Issue**: "Insufficient funds" error
```
Solution: Get free Sepolia ETH from faucet
https://sepoliafaucet.com/
Wait a few minutes for faucet transaction
```

**Issue**: "Contract connection failed"
```
Solution: Check contract address is correct
Expected: 0x2E7B5f277595e3F1eeB9548ef654E178537cb90E
Verify you're on Sepolia (not Mainnet)
```

**Issue**: Cannot submit bid
```
Solution: Ensure you're registered as a carrier
1. Click "Register as Carrier"
2. Confirm transaction in MetaMask
3. Wait for confirmation
4. Try submitting bid again
```

### Get Help

**GitHub Issues**: [Report bugs or request features](https://github.com/AlfredaHegmann/FHEFreightBiddingEnhanced/issues)

**Documentation**: Check repository README and code comments

**Zama Community**: [https://community.zama.ai](https://community.zama.ai)

---

## 📄 License

**MIT License**

Copyright (c) 2025 FHE Anonymous Freight Bidding Platform

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

---

## 🔗 Important Links

**Live Platform**: [https://fhe-freight-bidding-enhanced.vercel.app/](https://fhe-freight-bidding-enhanced.vercel.app/)

**GitHub Repository**: [https://github.com/AlfredaHegmann/FHEFreightBiddingEnhanced](https://github.com/AlfredaHegmann/FHEFreightBiddingEnhanced)

**Bounty Program**: [https://github.com/AlfredaHegmann/fhevm-react-template](https://github.com/AlfredaHegmann/fhevm-react-template)

**Smart Contract**: [0x2E7B5f277595e3F1eeB9548ef654E178537cb90E](https://sepolia.etherscan.io/address/0x2E7B5f277595e3F1eeB9548ef654E178537cb90E)

**Demo Video**: `demo.mp4` (download from repository)

**Zama FHEVM**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)

**Sepolia Faucet**: [https://sepoliafaucet.com/](https://sepoliafaucet.com/)

**Sepolia Explorer**: [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)

---

## 🙏 Acknowledgments

**Built with technology from**:
- **Zama** - Pioneering fully homomorphic encryption for blockchain
- **Ethereum** - Decentralized smart contract platform
- **Sepolia** - Ethereum testnet for development and testing

**Special Thanks**:
- Zama team for FHEVM development and documentation
- Ethereum Foundation for Sepolia testnet infrastructure
- Open-source community for Web3 tooling and libraries

---

**Privacy-First Logistics - Powered by Fully Homomorphic Encryption** 🔐🚚

*Making confidential freight bidding practical with Zama FHEVM*
