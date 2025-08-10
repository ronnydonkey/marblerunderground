import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-blue-600 via-purple-700 to-pink-600">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center text-white">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to GravityPlay
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                  The definitive catalog and community for marble run enthusiasts. Discover, build, and share incredible marble run creations.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/catalog">
                  <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
                    Explore Catalog
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-700">
                    Join Community
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-purple-100 p-3">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4-3-3m0 0-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Comprehensive Catalog</h3>
                <p className="text-gray-600">
                  Browse thousands of marble run pieces from all major brands with detailed specifications and compatibility information.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-blue-100 p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Compatibility Matrix</h3>
                <p className="text-gray-600">
                  Discover which pieces work together across different brands and systems with our community-verified compatibility data.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-green-100 p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Community Driven</h3>
                <p className="text-gray-600">
                  Join thousands of builders sharing knowledge, builds, and expanding the database with new discoveries.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Ready to Build Something Amazing?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-600 md:text-xl">
                  Start exploring our catalog, track your collection, and connect with fellow marble run enthusiasts today.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth/register">
                  <Button size="lg">Get Started Free</Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">Sign In</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-900 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex items-center space-x-2">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6" />
                <path d="m9 9 3 3 3-3" />
              </svg>
              <span className="text-lg font-bold">GravityPlay</span>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 GravityPlay. The ultimate marble run platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
