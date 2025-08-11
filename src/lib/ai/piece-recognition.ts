import { supabase } from '@/lib/supabase/client'
import type { PhotoAnalysisResult, PieceType, Brand } from '@/lib/types/database'
import type { DetectedPiece } from '@/lib/types/ai-collection'

// Mock AI service - In production, this would connect to OpenAI Vision API, 
// Google Cloud Vision, or a custom trained model
export class PieceRecognitionService {
  private apiKey: string = process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
  private model = 'gpt-4-vision-preview'
  
  async analyzePhoto(
    imageFile: File, 
    sessionId: string,
    confidenceThreshold = 0.7
  ): Promise<PhotoAnalysisResult> {
    const startTime = Date.now()
    
    try {
      // Upload image to Supabase Storage
      const photoUrl = await this.uploadPhoto(imageFile, sessionId)
      
      // Get piece catalog for reference
      const catalog = await this.getPieceCatalog()
      
      // Analyze image using AI
      const detectedPieces = await this.performAIAnalysis(photoUrl, catalog)
      
      // Filter by confidence threshold
      const highConfidencePieces = detectedPieces.filter(
        piece => piece.confidence >= confidenceThreshold
      )
      
      const result: PhotoAnalysisResult = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        photo_url: photoUrl,
        status: 'completed',
        detected_pieces: highConfidencePieces,
        total_pieces_detected: detectedPieces.length,
        processing_time_ms: Date.now() - startTime,
        confidence_threshold: confidenceThreshold,
        created_at: new Date().toISOString()
      }
      
      // Save analysis result
      await this.saveAnalysisResult(result, sessionId)
      
      return result
      
    } catch (error) {
      console.error('Photo analysis failed:', error)
      
      return {
        id: crypto.randomUUID(),
        session_id: sessionId,
        photo_url: '',
        status: 'failed',
        detected_pieces: [],
        total_pieces_detected: 0,
        processing_time_ms: Date.now() - startTime,
        confidence_threshold: confidenceThreshold,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        created_at: new Date().toISOString()
      }
    }
  }
  
  private async uploadPhoto(imageFile: File, sessionId: string): Promise<string> {
    const fileName = `${sessionId}/${Date.now()}-${imageFile.name}`
    
    const { data, error } = await supabase.storage
      .from('collection-photos')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw new Error(`Failed to upload photo: ${error.message}`)
    
    const { data: { publicUrl } } = supabase.storage
      .from('collection-photos')
      .getPublicUrl(fileName)
    
    return publicUrl
  }
  
  private async getPieceCatalog(): Promise<(PieceType & { brand: Brand })[]> {
    const { data, error } = await supabase
      .from('piece_types')
      .select(`
        *,
        brand:brands (*)
      `)
      .eq('is_active', true)
    
    if (error) throw new Error(`Failed to fetch catalog: ${error.message}`)
    return data as (PieceType & { brand: Brand })[]
  }
  
  private async performAIAnalysis(
    imageUrl: string, 
    catalog: (PieceType & { brand: Brand })[]
  ): Promise<DetectedPiece[]> {
    
    // Create piece reference for AI prompt
    const pieceReference = catalog.map(piece => ({
      id: piece.id,
      name: piece.name,
      brand: piece.brand.name,
      category: piece.category,
      description: piece.description
    }))
    
    const prompt = `
    You are an expert at identifying marble run pieces. Analyze this image and identify all marble run pieces visible.
    
    For each piece you identify, provide:
    1. Piece name and brand (match to catalog if possible)
    2. Category (track, support, connector, special)
    3. Confidence score (0-1)
    4. Bounding box coordinates (x, y, width, height as percentages of image)
    5. Quantity if multiple identical pieces are visible
    
    Available piece catalog reference:
    ${JSON.stringify(pieceReference.slice(0, 50), null, 2)}
    
    Return results as JSON array matching this format:
    [{
      "id": "unique-detection-id",
      "piece_type_id": "catalog-id-if-matched",
      "brand_id": "brand-id-if-matched", 
      "confidence": 0.95,
      "bounding_box": {"x": 10, "y": 20, "width": 30, "height": 40},
      "predicted_name": "Curved Track",
      "predicted_brand": "GraviTrax",
      "predicted_category": "track"
    }]
    
    Focus on accuracy over completeness. Only include pieces you're confident about.
    `
    
    // In production, replace this with actual AI API call
    if (this.apiKey) {
      return await this.callOpenAIVision(imageUrl, prompt)
    } else {
      // Mock response for development
      return this.getMockDetection()
    }
  }
  
  private async callOpenAIVision(imageUrl: string, prompt: string): Promise<DetectedPiece[]> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 2000
      })
    })
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    const content = data.choices[0]?.message?.content
    
    try {
      return JSON.parse(content) as DetectedPiece[]
    } catch (parseError) {
      throw new Error('Failed to parse AI response as JSON')
    }
  }
  
  private getMockDetection(): DetectedPiece[] {
    // Mock detection for development/testing
    return [
      {
        id: crypto.randomUUID(),
        piece_type_id: null,
        brand_id: null,
        confidence: 0.92,
        bounding_box: { x: 10, y: 15, width: 25, height: 30 },
        predicted_name: 'Curved Track',
        predicted_brand: 'GraviTrax',
        predicted_category: 'track'
      },
      {
        id: crypto.randomUUID(),
        piece_type_id: null,
        brand_id: null,
        confidence: 0.87,
        bounding_box: { x: 45, y: 20, width: 20, height: 25 },
        predicted_name: 'Tower Support',
        predicted_brand: 'GraviTrax',
        predicted_category: 'support'
      }
    ]
  }
  
  private async saveAnalysisResult(result: PhotoAnalysisResult, sessionId: string) {
    // Save to database for later retrieval and manual review
    const { error } = await supabase
      .from('photo_analysis_results')
      .insert({
        id: result.id,
        session_id: sessionId,
        photo_url: result.photo_url,
        status: result.status,
        detected_pieces: result.detected_pieces,
        total_pieces_detected: result.total_pieces_detected,
        processing_time_ms: result.processing_time_ms,
        confidence_threshold: result.confidence_threshold,
        error_message: result.error_message,
        created_at: result.created_at
      })
    
    if (error) {
      console.error('Failed to save analysis result:', error)
    }
  }
}