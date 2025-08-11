'use client'

import { useState } from 'react'
import { X, Eye, AlertTriangle, Package, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DetectedPiece } from '@/lib/types/ai-collection'
import type { PhotoAnalysisResult } from '@/lib/types/database'

interface DetectionResultsProps {
  result: PhotoAnalysisResult
  onAddToCollection: (pieces: DetectedPiece[], forceAdd?: boolean) => Promise<void>
  onRejectPiece: (pieceId: string) => void
  className?: string
}

export function DetectionResults({
  result,
  onAddToCollection,
  onRejectPiece,
  className
}: DetectionResultsProps) {
  // Type-safe conversion of detected pieces
  const detectedPieces = (result.detected_pieces as DetectedPiece[]) || []
  
  const [selectedPieces, setSelectedPieces] = useState<Set<string>>(
    new Set(detectedPieces.map(p => p.id))
  )
  const [isAdding, setIsAdding] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const togglePiece = (pieceId: string) => {
    const newSelection = new Set(selectedPieces)
    if (newSelection.has(pieceId)) {
      newSelection.delete(pieceId)
    } else {
      newSelection.add(pieceId)
    }
    setSelectedPieces(newSelection)
  }

  const handleAddSelected = async () => {
    const piecesToAdd = detectedPieces.filter(p => selectedPieces.has(p.id))
    setIsAdding(true)
    try {
      await onAddToCollection(piecesToAdd)
    } finally {
      setIsAdding(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100'
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High'
    if (confidence >= 0.7) return 'Medium'
    return 'Low'
  }

  if (result.status === 'failed') {
    return (
      <div className={`bg-red-50 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-lg font-medium text-red-800">
              Analysis Failed
            </h3>
            <p className="text-red-700 mt-1">
              {result.error_message || 'Unable to analyze this photo'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Detection Results
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Zap className="h-4 w-4" />
            <span>Processed in {result.processing_time_ms}ms</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {result.total_pieces_detected}
            </div>
            <div className="text-sm text-blue-800">Pieces Detected</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {detectedPieces.filter(p => p.confidence >= 0.8).length}
            </div>
            <div className="text-sm text-green-800">High Confidence</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(
                detectedPieces.reduce((acc, p) => acc + p.confidence, 0) / 
                detectedPieces.length * 100
              )}%
            </div>
            <div className="text-sm text-purple-800">Avg. Confidence</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="h-4 w-4 mr-1" />
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {selectedPieces.size} selected
            </span>
            <Button
              onClick={handleAddSelected}
              disabled={selectedPieces.size === 0 || isAdding}
              className="flex items-center space-x-2"
            >
              <Package className="h-4 w-4" />
              <span>
                {isAdding ? 'Adding...' : 'Add to Collection'}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Detected Pieces Grid */}
      {showDetails && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h4 className="font-medium text-gray-900">Detected Pieces</h4>
          </div>
          
          <div className="divide-y">
            {detectedPieces.map((piece) => (
              <div
                key={piece.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  selectedPieces.has(piece.id) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedPieces.has(piece.id)}
                        onChange={() => togglePiece(piece.id)}
                        className="h-4 w-4 rounded border-gray-300 text-purple-600"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {piece.predicted_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {piece.predicted_brand} • {piece.predicted_category}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${getConfidenceColor(piece.confidence)}
                    `}>
                      {getConfidenceLabel(piece.confidence)} ({Math.round(piece.confidence * 100)}%)
                    </span>

                    {piece.piece_type_id ? (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Catalog Match
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        New Piece
                      </span>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRejectPiece(piece.id)}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Bounding box visualization could go here */}
                {piece.bounding_box && (
                  <div className="mt-2 text-xs text-gray-500">
                    Detected at: {Math.round(piece.bounding_box.x)}%, {Math.round(piece.bounding_box.y)}% 
                    ({Math.round(piece.bounding_box.width)}×{Math.round(piece.bounding_box.height)})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => {
            const highConfidencePieces = detectedPieces.filter(p => p.confidence >= 0.8)
            setSelectedPieces(new Set(highConfidencePieces.map(p => p.id)))
          }}
        >
          Select High Confidence Only
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setSelectedPieces(new Set(detectedPieces.map(p => p.id)))}
        >
          Select All
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setSelectedPieces(new Set())}
        >
          Clear Selection
        </Button>
      </div>
    </div>
  )
}