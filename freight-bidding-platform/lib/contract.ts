export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`

export const CONTRACT_ABI = [
  // Owner & Setup
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Registration
  {
    "inputs": [],
    "name": "registerShipper",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "registerCarrier",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "", "type": "address"}],
    "name": "shippers",
    "outputs": [
      {"name": "isRegistered", "type": "bool"},
      {"name": "jobCount", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "", "type": "address"}],
    "name": "carriers",
    "outputs": [
      {"name": "isRegistered", "type": "bool"},
      {"name": "jobsCompleted", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Job Management
  {
    "inputs": [
      {"name": "origin", "type": "string"},
      {"name": "destination", "type": "string"},
      {"name": "cargoType", "type": "string"},
      {"name": "weight", "type": "uint256"},
      {"name": "maxBudget", "type": "uint256"},
      {"name": "deadline", "type": "uint256"}
    ],
    "name": "createJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "", "type": "uint256"}],
    "name": "jobs",
    "outputs": [
      {"name": "origin", "type": "string"},
      {"name": "destination", "type": "string"},
      {"name": "cargoType", "type": "string"},
      {"name": "weight", "type": "uint256"},
      {"name": "maxBudget", "type": "uint256"},
      {"name": "deadline", "type": "uint256"},
      {"name": "shipper", "type": "address"},
      {"name": "status", "type": "uint8"},
      {"name": "bidCount", "type": "uint256"},
      {"name": "awardedCarrier", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "jobCount",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Bidding
  {
    "inputs": [
      {"name": "jobId", "type": "uint256"},
      {"name": "bidAmount", "type": "uint256"}
    ],
    "name": "placeBid",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "", "type": "uint256"},
      {"name": "", "type": "address"}
    ],
    "name": "bids",
    "outputs": [
      {"name": "carrier", "type": "address"},
      {"name": "timestamp", "type": "uint256"},
      {"name": "isValid", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Job Completion
  {
    "inputs": [
      {"name": "jobId", "type": "uint256"},
      {"name": "carrier", "type": "address"}
    ],
    "name": "awardJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "jobId", "type": "uint256"}],
    "name": "completeJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "shipper", "type": "address"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "ShipperRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "carrier", "type": "address"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "CarrierRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "jobId", "type": "uint256"},
      {"indexed": true, "name": "shipper", "type": "address"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "JobPosted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "jobId", "type": "uint256"},
      {"indexed": true, "name": "carrier", "type": "address"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "BidSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "jobId", "type": "uint256"},
      {"indexed": true, "name": "carrier", "type": "address"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "JobAwarded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "jobId", "type": "uint256"},
      {"indexed": false, "name": "timestamp", "type": "uint256"}
    ],
    "name": "JobCompleted",
    "type": "event"
  }
] as const

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11155111
