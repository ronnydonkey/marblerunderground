-- AI Collection System Tables
-- This migration adds tables to support AI-powered photo analysis and collection building

-- Photo Analysis Sessions
CREATE TABLE ai_collection_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_name VARCHAR NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  auto_add_threshold DECIMAL(3,2) DEFAULT 0.8,
  total_pieces_detected INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo Analysis Results
CREATE TABLE photo_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_collection_sessions(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  detected_pieces JSONB DEFAULT '[]'::jsonb,
  total_pieces_detected INTEGER DEFAULT 0,
  processing_time_ms INTEGER DEFAULT 0,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.7,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unknown/Unmatched Pieces discovered by AI
CREATE TABLE unknown_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES ai_collection_sessions(id) ON DELETE SET NULL,
  predicted_name VARCHAR NOT NULL,
  predicted_brand VARCHAR NOT NULL,
  predicted_category VARCHAR NOT NULL,
  confidence DECIMAL(3,2) NOT NULL,
  photo_url TEXT,
  bounding_box JSONB,
  description TEXT,
  user_confirmed BOOLEAN DEFAULT FALSE,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User votes on unknown pieces (community validation)
CREATE TABLE unknown_piece_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unknown_piece_id UUID NOT NULL REFERENCES unknown_pieces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR NOT NULL CHECK (vote_type IN ('correct', 'incorrect', 'similar')),
  suggested_name VARCHAR,
  suggested_brand VARCHAR,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unknown_piece_id, user_id)
);

-- Collection Import History (track how pieces were added)
CREATE TABLE collection_import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES ai_collection_sessions(id) ON DELETE SET NULL,
  import_type VARCHAR NOT NULL CHECK (import_type IN ('ai_scan', 'manual_photo', 'bulk_upload', 'manual_entry')),
  pieces_added INTEGER DEFAULT 0,
  pieces_updated INTEGER DEFAULT 0,
  confidence_score DECIMAL(3,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage bucket for AI collection photos
INSERT INTO storage.buckets (id, name, public) VALUES ('collection-photos', 'collection-photos', true);

-- Indexes for performance
CREATE INDEX idx_ai_sessions_user ON ai_collection_sessions(user_id, status);
CREATE INDEX idx_ai_sessions_created ON ai_collection_sessions(created_at DESC);
CREATE INDEX idx_photo_results_session ON photo_analysis_results(session_id, created_at);
CREATE INDEX idx_unknown_pieces_user ON unknown_pieces(user_id, created_at DESC);
CREATE INDEX idx_unknown_pieces_votes ON unknown_pieces(votes_count DESC, confidence DESC);
CREATE INDEX idx_collection_history_user ON collection_import_history(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE ai_collection_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE unknown_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE unknown_piece_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_import_history ENABLE ROW LEVEL SECURITY;

-- Users can only access their own AI collection sessions
CREATE POLICY ai_sessions_policy ON ai_collection_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only access photo results from their sessions
CREATE POLICY photo_results_policy ON photo_analysis_results
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM ai_collection_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM ai_collection_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  ));

-- Users can access their own unknown pieces + public ones for voting
CREATE POLICY unknown_pieces_policy ON unknown_pieces
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_confirmed = TRUE);

-- Users can insert their own unknown pieces
CREATE POLICY unknown_pieces_insert_policy ON unknown_pieces
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own unknown pieces
CREATE POLICY unknown_pieces_update_policy ON unknown_pieces
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can vote on any confirmed unknown piece
CREATE POLICY unknown_piece_votes_policy ON unknown_piece_votes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only see their own import history
CREATE POLICY collection_history_policy ON collection_import_history
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage policies for collection photos
CREATE POLICY "Users can upload their own collection photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'collection-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view collection photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'collection-photos');

CREATE POLICY "Users can update their own collection photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'collection-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own collection photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'collection-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Functions for AI collection analytics
CREATE OR REPLACE FUNCTION get_user_ai_stats(user_uuid UUID)
RETURNS TABLE (
  total_sessions INTEGER,
  total_photos INTEGER,
  total_pieces_detected INTEGER,
  avg_confidence DECIMAL,
  pieces_added_via_ai INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT s.id)::INTEGER as total_sessions,
    COUNT(DISTINCT p.id)::INTEGER as total_photos,
    COALESCE(SUM(p.total_pieces_detected), 0)::INTEGER as total_pieces_detected,
    COALESCE(AVG(
      CASE 
        WHEN jsonb_array_length(p.detected_pieces) > 0 
        THEN (
          SELECT AVG((piece->>'confidence')::DECIMAL)
          FROM jsonb_array_elements(p.detected_pieces) AS piece
        )
        ELSE NULL
      END
    ), 0)::DECIMAL as avg_confidence,
    COALESCE(SUM(h.pieces_added + h.pieces_updated), 0)::INTEGER as pieces_added_via_ai
  FROM ai_collection_sessions s
  LEFT JOIN photo_analysis_results p ON s.id = p.session_id
  LEFT JOIN collection_import_history h ON s.id = h.session_id
  WHERE s.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old session data (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_ai_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete sessions older than 30 days that are completed or cancelled
  DELETE FROM ai_collection_sessions 
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND status IN ('completed', 'cancelled');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;