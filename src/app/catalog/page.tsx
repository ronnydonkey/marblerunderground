'use client'

import { Header } from '@/components/layout/header'
import { PieceGrid } from '@/components/catalog/piece-grid'
import { usePieces } from '@/lib/hooks/use-pieces'

export default function CatalogPage() {
  const { pieces, loading, error } = usePieces()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Marble Run Catalog
          </h1>
          <p className="text-gray-600 mt-2">
            Explore thousands of marble run pieces from all major brands
          </p>
        </div>

        {/* Filters - Placeholder for now */}
        <div className="mb-6 p-4 bg-white rounded-lg border">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="search"
                placeholder="Search pieces..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">All Brands</option>
              <option value="gravitrax">GraviTrax</option>
              <option value="marble-genius">Marble Genius</option>
              <option value="hubelino">Hubelino</option>
              <option value="quadrilla">Quadrilla</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">All Categories</option>
              <option value="track">Track</option>
              <option value="support">Support</option>
              <option value="connector">Connector</option>
              <option value="special">Special</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">
              Error loading catalog: {error}
            </p>
          </div>
        )}

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${pieces.length} pieces found`}
          </p>
          <select className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="newest">Newest First</option>
            <option value="name">Name A-Z</option>
            <option value="brand">Brand</option>
            <option value="category">Category</option>
          </select>
        </div>

        {/* Pieces Grid */}
        <PieceGrid pieces={pieces} loading={loading} />
      </main>
    </div>
  )
}