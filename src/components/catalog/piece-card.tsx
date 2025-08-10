import Image from 'next/image'
import Link from 'next/link'
import type { PieceType, Brand } from '@/lib/types/database'

interface PieceCardProps {
  piece: PieceType & { brand: Brand }
}

export function PieceCard({ piece }: PieceCardProps) {
  const primaryPhoto = piece.photos?.find(p => p.is_primary)

  return (
    <Link 
      href={`/catalog/pieces/${piece.brand.slug}/${piece.slug}`}
      className="group block"
    >
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
        <div className="aspect-square relative bg-gray-100">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto.url}
              alt={primaryPhoto.alt_text || `${piece.name} piece`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-full bg-gray-200 p-4">
                <svg
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                {piece.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {piece.brand.name}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                {piece.category}
              </span>
            </div>
          </div>
          
          {piece.description && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
              {piece.description}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {piece.color && (
                <div 
                  className="h-3 w-3 rounded-full border border-gray-200"
                  style={{ backgroundColor: piece.color.toLowerCase() }}
                  title={`Color: ${piece.color}`}
                />
              )}
              {piece.materials && piece.materials.length > 0 && (
                <span className="text-xs text-gray-500">
                  {piece.materials[0]}
                </span>
              )}
            </div>
            
            <svg
              className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}