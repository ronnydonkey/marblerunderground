export interface DetectedPiece {
  id: string
  piece_type_id: string | null
  brand_id: string | null
  confidence: number
  bounding_box: {
    x: number
    y: number
    width: number
    height: number
  }
  predicted_name: string
  predicted_brand: string
  predicted_category: string
}

export interface PhotoAnalysisResult {
  id: string
  photo_url: string
  status: 'processing' | 'completed' | 'failed'
  detected_pieces: DetectedPiece[]
  total_pieces_detected: number
  processing_time_ms: number
  confidence_threshold: number
  error_message?: string
  created_at: string
}

export interface CollectionUpdateResult {
  pieces_added: number
  pieces_updated: number
  new_pieces_discovered: number
  confidence_score: number
  manual_review_required: DetectedPiece[]
}

export interface AICollectionSession {
  id: string
  user_id: string
  session_name: string
  photos: import('@/lib/types/database').PhotoAnalysisResult[]
  total_pieces_detected: number
  status: 'active' | 'completed' | 'cancelled'
  auto_add_threshold: number // Confidence threshold for auto-adding to collection
  created_at: string
  completed_at?: string
}

export interface PieceRecognitionModel {
  name: string
  version: string
  supported_brands: string[]
  accuracy_metrics: {
    overall_accuracy: number
    per_brand_accuracy: Record<string, number>
  }
  last_trained: string
}