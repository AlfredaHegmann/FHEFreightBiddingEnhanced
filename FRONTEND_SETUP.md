# Freight Bidding Platform - Frontend Setup Guide

## 🎯 Project Overview

A modern, privacy-preserving freight bidding platform built with:
- **Next.js 14** (App Router)
- **TypeScript** for type safety
- **Wagmi v2** + **RainbowKit** for Web3 integration
- **Tailwind CSS** + **Radix UI** for styling
- **ESBuild** for fast builds
- **Vercel** for deployment

---

## 📦 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn
- MetaMask or compatible wallet

### Installation

```bash
# Navigate to frontend directory
cd D:\freight-bidding-platform

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your configuration
```

### Environment Variables

Create `.env.local`:

```env
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576
NEXT_PUBLIC_CHAIN_ID=11155111

# Network Configuration
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org

# Etherscan
NEXT_PUBLIC_ETHERSCAN_URL=https://sepolia.etherscan.io

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://freight-bidding.vercel.app
NEXT_PUBLIC_SITE_NAME=Freight Bidding Platform
```

### Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

### Build & Deploy

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

---

## 🏗️ Project Structure

```
freight-bidding-platform/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Homepage
│   ├── jobs/                    # Job management pages
│   │   ├── page.tsx            # Job list
│   │   ├── create/page.tsx     # Create job
│   │   └── [id]/page.tsx       # Job details
│   ├── bids/                    # Bidding pages
│   │   └── page.tsx            # Bid management
│   └── profile/                 # User profile
│       └── page.tsx
├── components/                   # React components
│   ├── providers/               # Context providers
│   │   ├── Web3Provider.tsx    # Wagmi + RainbowKit
│   │   └── QueryProvider.tsx   # TanStack Query
│   ├── ui/                      # UI components
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   ├── Tabs.tsx
│   │   ├── Toast.tsx
│   │   └── ...
│   ├── features/                # Feature components
│   │   ├── JobCard.tsx
│   │   ├── BidForm.tsx
│   │   ├── TransactionHistory.tsx
│   │   └── ...
│   └── layout/                  # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── hooks/                        # Custom React hooks
│   ├── useContract.ts           # Contract interaction
│   ├── useJobs.ts               # Job management
│   ├── useBids.ts               # Bid management
│   ├── useTransactions.ts       # Transaction history
│   └── useToast.ts              # Toast notifications
├── lib/                          # Utilities
│   ├── contract.ts              # Contract configuration
│   ├── wagmi.ts                 # Wagmi configuration
│   ├── utils.ts                 # Helper functions
│   └── constants.ts             # App constants
├── types/                        # TypeScript types
│   ├── contract.ts
│   ├── job.ts
│   └── bid.ts
├── public/                       # Static assets
│   ├── favicon.ico
│   └── ...
├── styles/                       # Global styles
│   └── globals.css
├── .env.example                  # Environment template
├── .env.local                    # Local environment (gitignored)
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── vercel.json                   # Vercel deployment config
```

---

## 🔧 Technology Stack Details

### Next.js 14 (App Router)
- Server Components by default
- Client Components with 'use client'
- API Routes with Route Handlers
- Automatic code splitting
- Fast refresh in development

### TypeScript
- Strict type checking
- IntelliSense support
- Type-safe contract interactions
- Interface definitions for all data

### Wagmi v2
- React hooks for Ethereum
- Multi-wallet support
- Transaction management
- Contract read/write operations
- Event listening

### RainbowKit
- Beautiful wallet connect UI
- Multiple wallet support (MetaMask, WalletConnect, Coinbase, etc.)
- Chain switching
- Recent transactions
- Account management

### Tailwind CSS
- Utility-first CSS framework
- Responsive design
- Dark mode support
- Custom color palette
- JIT compiler

### Radix UI
- Accessible UI primitives
- Headless components
- Fully customizable
- WAI-ARIA compliant
- Keyboard navigation

### ESBuild
- Fast bundling
- Tree shaking
- Minification
- Source maps

---

## 🎨 UI Components

### Core Components (Radix UI)

1. **Dialog**
   - Modals for forms
   - Confirmation dialogs
   - Detail views

2. **Tabs**
   - Job filtering
   - Profile sections
   - Settings

3. **Toast**
   - Success messages
   - Error notifications
   - Transaction updates

4. **Alert Dialog**
   - Confirmations
   - Warnings
   - Critical actions

5. **Dropdown Menu**
   - User menu
   - Action menus
   - Filters

6. **Select**
   - Form inputs
   - Filtering options

### Custom Components

1. **LoadingSpinner**
   - Transaction pending
   - Data fetching
   - Page loading

2. **ErrorBoundary**
   - Error catching
   - Fallback UI
   - Error reporting

3. **TransactionStatus**
   - Pending state
   - Success/failure
   - Transaction link

4. **JobCard**
   - Job information
   - Bid count
   - Status badge

5. **BidCard**
   - Bid details
   - Carrier info
   - Action buttons

---

## 🔌 Web3 Integration

### Wagmi Configuration

```typescript
// lib/wagmi.ts
import { configureChains, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [sepolia],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'Freight Bidding Platform',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains
})

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export { chains }
```

### Contract Hooks

```typescript
// hooks/useContract.ts
import { useContractRead, useContractWrite } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/contract'

export function useRegisterShipper() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'registerShipper',
  })
}

export function useCreateJob() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'createJob',
  })
}

export function useJobs() {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getJobs',
    watch: true, // Auto-refresh
  })
}
```

---

## 🎯 Key Features

### 1. Loading States

```typescript
// components/features/JobList.tsx
'use client'

import { useJobs } from '@/hooks/useJobs'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export function JobList() {
  const { data: jobs, isLoading, error } = useJobs()

  if (isLoading) {
    return <LoadingSpinner message="Loading jobs..." />
  }

  if (error) {
    return <ErrorMessage error={error} />
  }

  return (
    <div className="grid gap-4">
      {jobs?.map(job => <JobCard key={job.id} job={job} />)}
    </div>
  )
}
```

### 2. Error Handling

```typescript
// components/ui/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 3. Transaction History

```typescript
// hooks/useTransactions.ts
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

export function useTransactions() {
  const { address } = useAccount()
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem(`tx_${address}`)
    if (stored) {
      setTransactions(JSON.parse(stored))
    }
  }, [address])

  const addTransaction = (tx) => {
    const updated = [tx, ...transactions].slice(0, 50) // Keep last 50
    setTransactions(updated)
    localStorage.setItem(`tx_${address}`, JSON.stringify(updated))
  }

  return { transactions, addTransaction }
}
```

```typescript
// components/features/TransactionHistory.tsx
'use client'

import { useTransactions } from '@/hooks/useTransactions'
import { formatDistanceToNow } from 'date-fns'

export function TransactionHistory() {
  const { transactions } = useTransactions()

  return (
    <div className="space-y-2">
      {transactions.map(tx => (
        <div key={tx.hash} className="p-4 border rounded">
          <div className="flex justify-between">
            <span>{tx.description}</span>
            <a
              href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
          </div>
          <div className="text-sm text-gray-500">
            {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 🚀 Deployment to Vercel

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_CONTRACT_ADDRESS": "@contract-address",
    "NEXT_PUBLIC_CHAIN_ID": "@chain-id",
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID": "@walletconnect-id"
  }
}
```

### Deployment Steps

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your repository
   - Framework preset: Next.js (auto-detected)

3. **Configure Environment Variables**
   - Add all `NEXT_PUBLIC_*` variables
   - Get WalletConnect Project ID from https://cloud.walletconnect.com/

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Get deployment URL

### Custom Domain (Optional)

```bash
# Add custom domain in Vercel dashboard
# Configure DNS:
# Type: A Record
# Name: @
# Value: 76.76.21.21

# Type: CNAME
# Name: www
# Value: cname.vercel-dns.com
```

---

## 📝 Development Workflow

### 1. Start Development
```bash
npm run dev
```

### 2. Make Changes
- Edit components in `components/`
- Update pages in `app/`
- Add hooks in `hooks/`

### 3. Test Locally
- Connect wallet (MetaMask)
- Switch to Sepolia network
- Test all features

### 4. Type Check
```bash
npm run type-check
```

### 5. Build
```bash
npm run build
```

### 6. Deploy
```bash
git add .
git commit -m "Description"
git push

# Vercel auto-deploys
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Wallet not connecting
- Check WalletConnect Project ID
- Ensure on correct network (Sepolia)
- Clear browser cache

#### 2. Contract calls failing
- Verify contract address
- Check wallet has Sepolia ETH
- Confirm ABI is up to date

#### 3. Build errors
- Run `npm run type-check`
- Check all imports
- Verify environment variables

#### 4. Slow loading
- Check RPC provider
- Use caching for contract reads
- Optimize images

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://rainbowkit.com)
- [Radix UI Documentation](https://radix-ui.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Vercel Documentation](https://vercel.com/docs)

---

## ✅ Checklist

- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Set up WalletConnect Project ID
- [ ] Test wallet connection
- [ ] Test contract interactions
- [ ] Implement loading states
- [ ] Add error handling
- [ ] Build transaction history
- [ ] Deploy to Vercel
- [ ] Configure custom domain (optional)
- [ ] Test production deployment

---

**Created**: 2025-10-23
**Contract**: 0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576
**Network**: Sepolia Testnet
**Framework**: Next.js 14 + TypeScript
