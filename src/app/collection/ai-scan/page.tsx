'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { PhotoUpload } from '@/components/ai-collection/photo-upload'
import { DetectionResults } from '@/components/ai-collection/detection-results'
import { Button } from '@/components/ui/button'
import { useAICollection } from '@/lib/hooks/use-ai-collection'
import { Sparkles, Archive, CheckCircle2 } from 'lucide-react'
import type { CollectionUpdateResult, DetectedPiece } from '@/lib/types/ai-collection'
import type { PhotoAnalysisResult } from '@/lib/types/database'

export default function AIScanPage() {
  const {
    currentSession,
    isProcessing,
    error,
    startSession,
    analyzePhoto,
    addToCollection,
    completeSession,
    getSessionStats,
    clearError
  } = useAICollection()

  const [analysisResults, setAnalysisResults] = useState<PhotoAnalysisResult[]>([])
  const [collectionResults, setCollectionResults] = useState<CollectionUpdateResult[]>([])
  const [sessionName, setSessionName] = useState('')

  // Initialize session on mount
  useEffect(() => {
    if (!currentSession) {
      const defaultName = `Collection Scan - ${new Date().toLocaleDateString()}`
      setSessionName(defaultName)
    }
  }, [currentSession])

  const handleStartSession = async () => {
    try {
      await startSession(sessionName)
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  const handlePhotoAnalyzed = (result: PhotoAnalysisResult) => {
    setAnalysisResults(prev => [...prev, result])
  }

  const handlePhotoUpload = async (file: File): Promise<PhotoAnalysisResult> => {
    return analyzePhoto(file, 0.8)
  }

  const handleAddToCollection = async (pieces: DetectedPiece[], forceAdd = false) => {
    try {
      const result = await addToCollection(pieces, forceAdd)
      setCollectionResults(prev => [...prev, result])
    } catch (error) {
      console.error('Failed to add to collection:', error)
    }
  }

  const handleRejectPiece = (pieceId: string) => {
    setAnalysisResults(prev => 
      prev.map(result => ({
        ...result,
        detected_pieces: (result.detected_pieces as DetectedPiece[]).filter(p => p.id !== pieceId)
      }))
    )
  }

  const sessionStats = getSessionStats()
  const totalPiecesAdded = collectionResults.reduce((acc, result) => 
    acc + result.pieces_added + result.pieces_updated, 0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              AI Collection Scanner
            </h1>
          </div>
          <p className="text-gray-600">
            Upload photos of your marble run pieces and let AI automatically identify and count them for your collection.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-700">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {!currentSession ? (
          /* Session Setup */
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Start New Scan Session</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Name
                  </label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="My marble collection scan"
                  />
                </div>

                <Button
                  onClick={handleStartSession}
                  className="w-full"
                  disabled={!sessionName.trim()}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start AI Scan Session
                </Button>
              </div>

              {/* Feature highlights */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-3">What you can do:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Identify piece types and brands automatically</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Count quantities of each piece</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Add pieces to your collection automatically</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Review and approve AI suggestions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Session Info */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{currentSession.session_name}</h2>
                <div className="flex items-center space-x-4">
                  {sessionStats && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{sessionStats.totalPhotos} photos</span>
                      <span>{sessionStats.totalPiecesDetected} pieces detected</span>
                      <span>{totalPiecesAdded} added to collection</span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    onClick={completeSession}
                    className="flex items-center space-x-2"
                  >
                    <Archive className="h-4 w-4" />
                    <span>Complete Session</span>
                  </Button>
                </div>
              </div>

              {/* Session stats */}
              {sessionStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {sessionStats.totalPhotos}
                    </div>
                    <div className="text-xs text-blue-800">Photos</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {sessionStats.totalPiecesDetected}
                    </div>
                    <div className="text-xs text-green-800">Pieces</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {Math.round(sessionStats.averageConfidence * 100)}%
                    </div>
                    <div className="text-xs text-purple-800">Confidence</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">
                      {totalPiecesAdded}
                    </div>
                    <div className="text-xs text-yellow-800">Added</div>
                  </div>
                </div>
              )}
            </div>

            {/* Photo Upload */}
            <PhotoUpload
              onPhotoAnalyzed={handlePhotoAnalyzed}
              onUpload={handlePhotoUpload}
              isProcessing={isProcessing}
            />

            {/* Analysis Results */}
            {analysisResults.map((result) => (
              <DetectionResults
                key={result.id}
                result={result}
                onAddToCollection={handleAddToCollection}
                onRejectPiece={handleRejectPiece}
              />
            ))}

            {/* Collection Summary */}
            {collectionResults.length > 0 && (
              <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  Collection Updated!
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {collectionResults.map((result, index) => (
                    <div key={index} className="text-center p-4 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {result.pieces_added}
                      </div>
                      <div className="text-sm text-green-800">New Pieces Added</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}