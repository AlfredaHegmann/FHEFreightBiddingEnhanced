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

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>Freight Bidding Platform - Built on Sepolia Testnet</p>
          <p className="text-sm mt-2">
            Contract:{' '}
            <a
              href="https://sepolia.etherscan.io/address/0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              0x9E6B...1576
            </a>
          </p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
