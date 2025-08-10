'use client'

import { PieceCard } from './piece-card'
import type { PieceType, Brand } from '@/lib/types/database'

interface PieceGridProps {
  pieces: (PieceType & { brand: Brand })[]
  loading?: boolean
}

export function PieceGrid({ pieces, loading }: PieceGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (pieces.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.09M6.343 7.343A8 8 0 1017.657 16.657 8 8 0 006.343 7.343z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No pieces found</h3>
        <p className="mt-2 text-gray-500">
          Try adjusting your filters or search terms.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pieces.map((piece) => (
        <PieceCard key={piece.id} piece={piece} />
      ))}
    </div>
  )
}