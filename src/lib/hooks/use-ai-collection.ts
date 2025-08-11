'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { PieceRecognitionService } from '@/lib/ai/piece-recognition'
import type { 
  AICollectionSession, 
  PhotoAnalysisResult, 
  CollectionUpdateResult, 
  DetectedPiece 
} from '@/lib/types/ai-collection'

export function useAICollection() {
  const [currentSession, setCurrentSession] = useState<AICollectionSession | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const recognitionService = new PieceRecognitionService()

  // Start a new AI collection session
  const startSession = useCallback(async (sessionName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Authentication required')

      const session: AICollectionSession = {
        id: crypto.randomUUID(),
        user_id: user.id,
        session_name: sessionName,
        photos: [],
        total_pieces_detected: 0,
        status: 'active',
        auto_add_threshold: 0.8,
        created_at: new Date().toISOString()
      }

      // Save session to database
      const { error } = await supabase
        .from('ai_collection_sessions')
        .insert(session)

      if (error) throw error

      setCurrentSession(session)
      setError(null)
      
      return session
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start session'
      setError(message)
      throw new Error(message)
    }
  }, [])

  // Upload and analyze a photo
  const analyzePhoto = useCallback(async (
    imageFile: File, 
    confidenceThreshold?: number
  ) => {
    if (!currentSession) {
      throw new Error('No active session')
    }

    setIsProcessing(true)
    setError(null)

    try {
      const result = await recognitionService.analyzePhoto(
        imageFile, 
        currentSession.id,
        confidenceThreshold || currentSession.auto_add_threshold
      )

      // Update session with new photo analysis
      const updatedSession: AICollectionSession = {
        ...currentSession,
        photos: [...currentSession.photos, result],
        total_pieces_detected: currentSession.total_pieces_detected + result.total_pieces_detected
      }

      setCurrentSession(updatedSession)

      // Update session in database
      await supabase
        .from('ai_collection_sessions')
        .update({
          photos: updatedSession.photos,
          total_pieces_detected: updatedSession.total_pieces_detected
        })
        .eq('id', currentSession.id)

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Photo analysis failed'
      setError(message)
      throw new Error(message)
    } finally {
      setIsProcessing(false)
    }
  }, [currentSession, recognitionService])

  // Auto-add detected pieces to user's collection
  const addToCollection = useCallback(async (
    detectedPieces: DetectedPiece[],
    forceAdd = false
  ): Promise<CollectionUpdateResult> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Authentication required')

      let piecesAdded = 0
      let piecesUpdated = 0
      let newPiecesDiscovered = 0
      const manualReviewRequired: DetectedPiece[] = []

      for (const detectedPiece of detectedPieces) {
        // Only auto-add if confidence is high or forced
        const shouldAutoAdd = forceAdd || detectedPiece.confidence >= (currentSession?.auto_add_threshold || 0.8)
        
        if (!shouldAutoAdd) {
          manualReviewRequired.push(detectedPiece)
          continue
        }

        if (detectedPiece.piece_type_id) {
          // Matched to existing catalog piece
          const { data: existingCollection, error: fetchError } = await supabase
            .from('user_collections')
            .select('*')
            .eq('user_id', user.id)
            .eq('piece_type_id', detectedPiece.piece_type_id)
            .eq('is_wishlist', false)
            .single()

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching collection:', fetchError)
            continue
          }

          if (existingCollection) {
            // Update quantity
            const { error: updateError } = await supabase
              .from('user_collections')
              .update({ 
                quantity: existingCollection.quantity + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingCollection.id)

            if (!updateError) piecesUpdated++
          } else {
            // Add new piece to collection
            const { error: insertError } = await supabase
              .from('user_collections')
              .insert({
                user_id: user.id,
                piece_type_id: detectedPiece.piece_type_id,
                quantity: 1,
                condition: 'good',
                acquisition_date: new Date().toISOString().split('T')[0],
                notes: `Added via AI detection (${Math.round(detectedPiece.confidence * 100)}% confidence)`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (!insertError) piecesAdded++
          }
        } else {
          // New piece not in catalog - could be added to a "unknown pieces" table
          newPiecesDiscovered++
          manualReviewRequired.push(detectedPiece)
        }
      }

      const result: CollectionUpdateResult = {
        pieces_added: piecesAdded,
        pieces_updated: piecesUpdated,
        new_pieces_discovered: newPiecesDiscovered,
        confidence_score: detectedPieces.reduce((acc, p) => acc + p.confidence, 0) / detectedPieces.length,
        manual_review_required: manualReviewRequired
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add pieces to collection'
      setError(message)
      throw new Error(message)
    }
  }, [currentSession])

  // Complete the current session
  const completeSession = useCallback(async () => {
    if (!currentSession) return

    try {
      const completedSession: AICollectionSession = {
        ...currentSession,
        status: 'completed',
        completed_at: new Date().toISOString()
      }

      await supabase
        .from('ai_collection_sessions')
        .update({
          status: 'completed',
          completed_at: completedSession.completed_at
        })
        .eq('id', currentSession.id)

      setCurrentSession(completedSession)
      return completedSession
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete session'
      setError(message)
      throw new Error(message)
    }
  }, [currentSession])

  // Get all detected pieces across all photos in current session
  const getAllDetectedPieces = useCallback(() => {
    if (!currentSession) return []
    
    return currentSession.photos.reduce((acc, photo) => {
      return acc.concat(photo.detected_pieces)
    }, [] as DetectedPiece[])
  }, [currentSession])

  // Get session statistics
  const getSessionStats = useCallback(() => {
    if (!currentSession) return null

    const allPieces = getAllDetectedPieces()
    const highConfidencePieces = allPieces.filter(p => p.confidence >= 0.8)
    const brandCounts = allPieces.reduce((acc, piece) => {
      acc[piece.predicted_brand] = (acc[piece.predicted_brand] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalPhotos: currentSession.photos.length,
      totalPiecesDetected: allPieces.length,
      highConfidencePieces: highConfidencePieces.length,
      averageConfidence: allPieces.length > 0 
        ? allPieces.reduce((acc, p) => acc + p.confidence, 0) / allPieces.length 
        : 0,
      brandDistribution: brandCounts,
      processingTime: currentSession.photos.reduce((acc, photo) => acc + photo.processing_time_ms, 0)
    }
  }, [currentSession, getAllDetectedPieces])

  return {
    // State
    currentSession,
    isProcessing,
    error,

    // Actions
    startSession,
    analyzePhoto,
    addToCollection,
    completeSession,

    // Computed values
    getAllDetectedPieces,
    getSessionStats,

    // Utilities
    clearError: () => setError(null)
  }
}