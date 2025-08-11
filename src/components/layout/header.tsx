'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/auth-provider'
import { Menu, X } from 'lucide-react'

export function Header() {
  const { user, signOut, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
  }

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => setIsMobileMenuOpen(false)
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

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
            <span className="text-lg font-bold text-gray-900">Marble Runderground</span>
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
                <Link 
                  href="/collection/ai-scan" 
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center space-x-1"
                >
                  <span>🤖</span>
                  <span>AI Scan</span>
                </Link>
                <Link 
                  href="/build-advisor" 
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center space-x-1"
                >
                  <span>🧠</span>
                  <span>Build Advisor</span>
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
                <Button variant="outline" size="sm" onClick={handleSignOut} className="hidden md:inline-flex">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
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
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Drawer */}
      <div className={`fixed inset-0 z-50 md:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Drawer */}
        <div className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex h-full flex-col">
            {/* Mobile menu header */}
            <div className="flex items-center justify-between border-b px-4 py-4">
              <span className="text-lg font-bold text-gray-900">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Close mobile menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* User info (if logged in) */}
            {user && (
              <div className="border-b px-4 py-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-700">
                      {user.user_metadata?.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {user.user_metadata?.firstName} {user.user_metadata?.lastName}
                    </p>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                <Link 
                  href="/catalog" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Catalog
                </Link>
                <Link 
                  href="/catalog/brands" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Brands
                </Link>
                
                {user && (
                  <>
                    <div className="my-2 border-t pt-2">
                      <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        My Account
                      </p>
                    </div>
                    <Link 
                      href="/collection" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      My Collection
                    </Link>
                    <Link 
                      href="/collection/ai-scan" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                    >
                      <span className="flex items-center space-x-2">
                        <span>🤖</span>
                        <span>AI Scan</span>
                      </span>
                    </Link>
                    <Link 
                      href="/build-advisor" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                    >
                      <span className="flex items-center space-x-2">
                        <span>🧠</span>
                        <span>Build Advisor</span>
                      </span>
                    </Link>
                    {user.user_metadata?.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2 text-base font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-md transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                  </>
                )}
              </div>
            </nav>
            
            {/* Auth Actions */}
            <div className="border-t p-4">
              {user ? (
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="w-full"
                >
                  Sign Out
                </Button>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}