export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  website_url?: string
  country?: string
  founded_year?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductSet {
  id: string
  brand_id: string
  name: string
  slug: string
  description?: string
  set_number?: string
  release_year?: number
  age_range_min?: number
  age_range_max?: number
  piece_count?: number
  msrp_usd?: number
  is_active: boolean
  created_at: string
  updated_at: string
  brand?: Brand
}

export interface PieceType {
  id: string
  brand_id: string
  name: string
  slug: string
  category: 'track' | 'support' | 'connector' | 'special'
  subcategory?: string
  dimensions?: {
    length?: number
    width?: number
    height?: number
    diameter?: number
  }
  materials?: string[]
  color?: string
  description?: string
  compatibility_notes?: string
  brand_specific_data?: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
  brand?: Brand
  photos?: PiecePhoto[]
}

export interface PiecePhoto {
  id: string
  piece_type_id: string
  url: string
  alt_text?: string
  angle?: 'front' | 'back' | 'side' | 'top' | 'bottom' | 'detail'
  is_primary: boolean
  sort_order: number
  uploaded_by?: string
  created_at: string
}

export interface PieceCompatibility {
  id: string
  piece1_id: string
  piece2_id: string
  compatibility_type: 'direct' | 'adapter_required' | 'incompatible'
  adapter_piece_id?: string
  confidence_score: number
  verified_by?: string
  notes?: string
  created_at: string
  updated_at: string
  piece1?: PieceType
  piece2?: PieceType
  adapter_piece?: PieceType
}

export interface UserCollection {
  id: string
  user_id: string
  piece_type_id: string
  quantity: number
  condition: 'new' | 'good' | 'fair' | 'poor'
  acquisition_date?: string
  acquisition_price?: number
  notes?: string
  is_wishlist: boolean
  created_at: string
  updated_at: string
  piece_type?: PieceType
}

export interface AICollectionSession {
  id: string
  user_id: string
  session_name: string
  status: 'active' | 'completed' | 'cancelled'
  auto_add_threshold: number
  total_pieces_detected: number
  created_at: string
  completed_at?: string
  updated_at: string
}

export interface PhotoAnalysisResult {
  id: string
  session_id: string
  photo_url: string
  status: 'processing' | 'completed' | 'failed'
  detected_pieces: any[] // JSONB array
  total_pieces_detected: number
  processing_time_ms: number
  confidence_threshold: number
  error_message?: string
  created_at: string
}

export interface UnknownPiece {
  id: string
  user_id: string
  session_id?: string
  predicted_name: string
  predicted_brand: string
  predicted_category: string
  confidence: number
  photo_url?: string
  bounding_box?: any // JSONB
  description?: string
  user_confirmed: boolean
  votes_count: number
  created_at: string
  updated_at: string
}

export interface UnknownPieceVote {
  id: string
  unknown_piece_id: string
  user_id: string
  vote_type: 'correct' | 'incorrect' | 'similar'
  suggested_name?: string
  suggested_brand?: string
  notes?: string
  created_at: string
}

export interface CollectionImportHistory {
  id: string
  user_id: string
  session_id?: string
  import_type: 'ai_scan' | 'manual_photo' | 'bulk_upload' | 'manual_entry'
  pieces_added: number
  pieces_updated: number
  confidence_score?: number
  notes?: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      brands: {
        Row: Brand
        Insert: Omit<Brand, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Brand, 'id' | 'created_at' | 'updated_at'>>
      }
      product_sets: {
        Row: ProductSet
        Insert: Omit<ProductSet, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ProductSet, 'id' | 'created_at' | 'updated_at'>>
      }
      piece_types: {
        Row: PieceType
        Insert: Omit<PieceType, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PieceType, 'id' | 'created_at' | 'updated_at'>>
      }
      piece_photos: {
        Row: PiecePhoto
        Insert: Omit<PiecePhoto, 'id' | 'created_at'>
        Update: Partial<Omit<PiecePhoto, 'id' | 'created_at'>>
      }
      piece_compatibility: {
        Row: PieceCompatibility
        Insert: Omit<PieceCompatibility, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PieceCompatibility, 'id' | 'created_at' | 'updated_at'>>
      }
      user_collections: {
        Row: UserCollection
        Insert: Omit<UserCollection, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserCollection, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}