# Freight Bidding Platform

A modern, privacy-preserving freight bidding platform built with Next.js and blockchain technology.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Wagmi v2** - React hooks for Ethereum
- **RainbowKit** - Beautiful wallet connection UI
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible headless components
- **ESBuild** - Fast bundling
- **Vercel** - Deployment platform

## Smart Contract

- **Address**: `0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576`
- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Etherscan**: [View Contract](https://sepolia.etherscan.io/address/0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576)

## Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- MetaMask or compatible wallet

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your WalletConnect Project ID
# Get one at: https://cloud.walletconnect.com/
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Required environment variables in `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## Features

- Wallet connection with multiple wallet support
- Job creation and management
- Encrypted bidding system
- Job award mechanism
- Transaction history tracking
- Loading states and error handling
- Responsive design
- Dark mode support

## Project Structure

```
freight-bidding-platform/
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Homepage
│   └── globals.css      # Global styles
├── components/          # React components
│   └── providers/       # Context providers
├── lib/                 # Utilities
│   ├── contract.ts      # Contract config
│   ├── wagmi.ts         # Wagmi config
│   └── utils.ts         # Helper functions
├── public/              # Static assets
└── ...config files
```

## Deployment

### Vercel

1. Push to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy

```bash
# Or use Vercel CLI
vercel deploy
```

## Documentation

For more detailed information, see:

- [Frontend Setup Guide](../FRONTEND_SETUP.md)
- [Implementation Guide](../FRONTEND_IMPLEMENTATION_GUIDE.md)
- [Project Summary](../PROJECT_COMPLETE_SUMMARY.md)

## License

MIT
