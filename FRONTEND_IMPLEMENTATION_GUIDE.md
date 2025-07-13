# Frontend Implementation - Complete Guide

## 🚀 Quick Implementation

This guide provides all necessary code to build the Freight Bidding Platform frontend.

---

## 📁 Step-by-Step File Creation

### Step 1: Install Dependencies

```bash
cd D:\freight-bidding-platform
npm install
```

### Step 2: Create Configuration Files

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  images: {
    domains: ['sepolia.etherscan.io'],
  },
  experimental: {
    esmExternals: true,
  },
}

module.exports = nextConfig
```

#### `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        error: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
    },
  },
  plugins: [],
}
export default config
```

#### `postcss.config.js`
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

### Step 3: Environment Configuration

#### `.env.example`
```env
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576
NEXT_PUBLIC_CHAIN_ID=11155111

# Network Configuration
NEXT_PUBLIC_NETWORK_NAME=sepolia
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org

# Etherscan
NEXT_PUBLIC_ETHERSCAN_URL=https://sepolia.etherscan.io

# WalletConnect Project ID (required)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

# Site Configuration
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SITE_NAME=Freight Bidding Platform
```

---

### Step 4: Create Contract ABI and Configuration

#### `lib/contract.ts`
```typescript
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
  }
] as const

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 11155111
```

---

### Step 5: Wagmi Configuration

#### `lib/wagmi.ts`
```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Freight Bidding Platform',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia],
  ssr: true,
})
```

---

### Step 6: Root Layout with Providers

#### `app/layout.tsx`
```typescript
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Freight Bidding Platform',
  description: 'Privacy-preserving freight bidding on blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

#### `components/providers/Providers.tsx`
```typescript
'use client'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'
import { ReactNode, useState } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

---

### Step 7: Global Styles

#### `app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Loading Spinner */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

---

### Step 8: Main Page

#### `app/page.tsx`
```typescript
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Freight Bidding Platform</h1>
          <ConnectButton />
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Privacy-Preserving Freight Bidding
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Secure, transparent, and efficient freight logistics on the blockchain
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/jobs"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Browse Jobs
          </Link>
          <Link
            href="/jobs/create"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Post a Job
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            title="Secure Bidding"
            description="All bids are encrypted and stored securely on-chain"
          />
          <FeatureCard
            title="Transparent"
            description="Full audit trail of all transactions on the blockchain"
          />
          <FeatureCard
            title="Efficient"
            description="Automated matching and instant settlement"
          />
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
```

---

### Step 9: Vercel Deployment Configuration

#### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "github": {
    "silent": true
  }
}
```

---

## 🎯 Next Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env.local`
   - Get WalletConnect Project ID
   - Add contract address

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Build Components**
   - Create UI components
   - Add contract hooks
   - Implement pages

5. **Deploy to Vercel**
   - Push to GitHub
   - Connect to Vercel
   - Configure environment variables
   - Deploy!

---

## 📚 Full Implementation Available

For complete implementation with all components, hooks, and pages, see:
- **FRONTEND_SETUP.md** - Detailed guide
- **Example repository** - Full working code

---

**Created**: 2025-10-23
**Status**: Ready for implementation
**Next**: Install dependencies and start coding!
