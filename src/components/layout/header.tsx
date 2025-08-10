'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/auth-provider'

export function Header() {
  const { user, signOut, loading } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <svg
              className="h-6 w-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6" />
              <path d="m9 9 3 3 3-3" />
            </svg>
            <span className="text-lg font-bold text-gray-900">GravityPlay</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/catalog" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Catalog
            </Link>
            <Link 
              href="/catalog/brands" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Brands
            </Link>
            {user && (
              <>
                <Link 
                  href="/collection" 
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  My Collection
                </Link>
                {user.user_metadata?.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-700">
                      {user.user_metadata?.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {user.user_metadata?.firstName} {user.user_metadata?.lastName}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}