import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Header */}
      <header className="relative z-10 border-b border-dark-border backdrop-blur-md bg-dark-panel/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-success flex items-center justify-center">
                <span className="text-xl font-bold">F</span>
              </div>
              <h1 className="text-xl font-bold">Freight Bidding</h1>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="pt-20 pb-16 sm:pt-28 sm:pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center mb-6 animate-fade-in">
            <span className="badge badge-accent">
              <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Privacy-Preserving
            </span>
          </div>

          {/* Title */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in">
            <span className="text-gradient">Secure Freight</span>
            <br />
            Bidding Platform
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl text-dark-text-secondary mb-10 max-w-2xl mx-auto animate-fade-in">
            Transparent, efficient, and privacy-preserving logistics on the blockchain.
            Connect shippers with carriers seamlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Link href="/jobs" className="btn btn-primary w-full sm:w-auto px-8">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Jobs
            </Link>
            <Link href="/jobs/create" className="btn btn-secondary w-full sm:w-auto px-8">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post a Job
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            <StatCard label="On-Chain" value="100%" />
            <StatCard label="Encrypted" value="Secure" />
            <StatCard label="Network" value="Sepolia" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16">
        <div className="text-center mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">Why Choose Us</h3>
          <p className="text-dark-text-secondary">Built with cutting-edge blockchain technology</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            title="Encrypted Bidding"
            description="All bids are encrypted on-chain using FHE technology, ensuring complete privacy during the bidding process."
          />
          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            title="Transparent & Auditable"
            description="Full audit trail of all transactions recorded permanently on the blockchain for complete transparency."
          />
          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            title="Instant Settlement"
            description="Automated smart contract execution ensures instant job awards and settlement without intermediaries."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-16">
        <div className="text-center mb-12">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">How It Works</h3>
          <p className="text-dark-text-secondary">Simple 4-step process</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <StepCard number="1" title="Register" description="Connect wallet and register as shipper or carrier" />
          <StepCard number="2" title="Create Job" description="Shippers post freight jobs with requirements" />
          <StepCard number="3" title="Place Bids" description="Carriers submit encrypted competitive bids" />
          <StepCard number="4" title="Award & Complete" description="Best bid wins and job is completed" />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-dark-border mt-20 backdrop-blur-md bg-dark-panel/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-success flex items-center justify-center">
                <span className="text-sm font-bold">F</span>
              </div>
              <span className="font-semibold">Freight Bidding Platform</span>
            </div>
            <p className="text-sm text-dark-text-secondary mb-3">
              Built on Sepolia Testnet with privacy-preserving FHE technology
            </p>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-dark-text-secondary">Contract:</span>
              <a
                href="https://sepolia.etherscan.io/address/0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-accent hover:text-accent-light transition-colors"
              >
                0x9E6B...1576
              </a>
              <a
                href="https://sepolia.etherscan.io/address/0x9E6B9F8afcC5A6E98A8d9967f2cA2edb3C191576"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-text-secondary hover:text-accent transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-4 text-center">
      <div className="text-xs uppercase tracking-wider text-dark-text-secondary mb-1">{label}</div>
      <div className="text-lg font-bold text-accent">{value}</div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass-panel p-6 group">
      <div className="w-14 h-14 rounded-xl bg-accent-soft flex items-center justify-center mb-4 text-accent group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-dark-text-secondary leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="glass-panel p-6 text-center group">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-success flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">
        {number}
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-xs text-dark-text-secondary leading-relaxed">{description}</p>
    </div>
  )
}
