-- AI Build Advisor System Tables
-- This migration adds tables to support AI-powered build suggestions with engineering education

-- Build Sessions (user's interaction with AI Build Advisor)
CREATE TABLE build_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL CHECK (status IN ('planning', 'building', 'completed', 'abandoned')),
  preferences JSONB DEFAULT '{}'::jsonb,
  current_build_id UUID,
  progress_tracking JSONB DEFAULT '[]'::jsonb,
  learning_progress JSONB DEFAULT '{
    "engineering_concepts_learned": [],
    "design_skills_developed": [],
    "physics_principles_understood": [],
    "total_learning_points": 0,
    "achievement_badges": []
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Build Suggestions (generated builds with comprehensive analysis)
CREATE TABLE ai_build_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES build_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  build_name VARCHAR NOT NULL,
  difficulty_level VARCHAR NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  estimated_build_time INTEGER NOT NULL, -- minutes
  
  -- Comprehensive Analysis Data (JSONB for flexibility)
  structural_analysis JSONB NOT NULL,
  design_optimization JSONB NOT NULL,
  audio_experience JSONB NOT NULL,
  
  -- Build Details
  required_pieces JSONB NOT NULL DEFAULT '[]'::jsonb,
  step_by_step_instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  piece_utilization DECIMAL(5,2) DEFAULT 0, -- percentage 0-100
  educational_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadata
  confidence_score DECIMAL(5,2) DEFAULT 0, -- AI confidence 0-100
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  completed_by_user BOOLEAN DEFAULT FALSE,
  completion_time_minutes INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Build Ratings (for improving AI suggestions)
CREATE TABLE build_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  build_suggestion_id UUID NOT NULL REFERENCES ai_build_suggestions(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  educational_value INTEGER CHECK (educational_value >= 1 AND educational_value <= 5),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, build_suggestion_id)
);

-- Completed Builds (user's successful build completions)
CREATE TABLE completed_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  build_suggestion_id UUID NOT NULL REFERENCES ai_build_suggestions(id) ON DELETE CASCADE,
  session_id UUID REFERENCES build_sessions(id) ON DELETE CASCADE,
  completion_time_minutes INTEGER NOT NULL,
  difficulty_level VARCHAR NOT NULL,
  learning_points_earned INTEGER DEFAULT 0,
  photos JSONB DEFAULT '[]'::jsonb, -- array of photo URLs
  user_notes TEXT,
  shared_publicly BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Achievement Badges
CREATE TABLE achievement_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  category VARCHAR NOT NULL CHECK (category IN ('engineering', 'design', 'physics', 'creativity', 'completion')),
  points_required INTEGER DEFAULT 0,
  builds_required INTEGER DEFAULT 0,
  difficulty_required VARCHAR,
  special_conditions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Badge Achievements
CREATE TABLE user_badge_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES achievement_badges(id) ON DELETE CASCADE,
  build_suggestion_id UUID REFERENCES ai_build_suggestions(id) ON DELETE SET NULL,
  session_id UUID REFERENCES build_sessions(id) ON DELETE SET NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Engineering Principles Database (educational content)
CREATE TABLE engineering_principles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  category VARCHAR NOT NULL CHECK (category IN ('structural', 'mechanical', 'acoustics', 'materials', 'design')),
  description TEXT NOT NULL,
  detailed_explanation TEXT,
  real_world_applications TEXT[],
  difficulty_level VARCHAR NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  interactive_demo_url TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build Challenge Templates (monthly challenges, competitions)
CREATE TABLE build_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  challenge_type VARCHAR NOT NULL CHECK (challenge_type IN ('monthly', 'weekly', 'special_event', 'educational')),
  difficulty_level VARCHAR NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  engineering_focus VARCHAR[], -- array of engineering concepts to emphasize
  constraints JSONB DEFAULT '{}'::jsonb, -- piece limits, size limits, etc.
  success_criteria JSONB NOT NULL,
  reward_points INTEGER DEFAULT 0,
  badge_reward UUID REFERENCES achievement_badges(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Challenge Submissions
CREATE TABLE challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES build_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  build_suggestion_id UUID REFERENCES ai_build_suggestions(id) ON DELETE SET NULL,
  submission_photos JSONB DEFAULT '[]'::jsonb,
  submission_video TEXT,
  description TEXT,
  engineering_explanation TEXT,
  meets_criteria BOOLEAN DEFAULT FALSE,
  judge_score DECIMAL(4,2), -- 0-100 scoring
  judge_feedback TEXT,
  points_awarded INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  judged_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_build_sessions_user ON build_sessions(user_id, status, created_at DESC);
CREATE INDEX idx_ai_build_suggestions_session ON ai_build_suggestions(session_id, created_at);
CREATE INDEX idx_ai_build_suggestions_user ON ai_build_suggestions(user_id, difficulty_level);
CREATE INDEX idx_build_ratings_user ON build_ratings(user_id, rating DESC);
CREATE INDEX idx_completed_builds_user ON completed_builds(user_id, completed_at DESC);
CREATE INDEX idx_user_achievements_user ON user_badge_achievements(user_id, earned_at DESC);
CREATE INDEX idx_engineering_principles_category ON engineering_principles(category, difficulty_level);
CREATE INDEX idx_build_challenges_active ON build_challenges(is_active, starts_at, ends_at);
CREATE INDEX idx_challenge_submissions_challenge ON challenge_submissions(challenge_id, submitted_at DESC);
CREATE INDEX idx_challenge_submissions_user ON challenge_submissions(user_id, submitted_at DESC);

-- RLS Policies
ALTER TABLE build_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_build_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badge_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Build sessions - users can only access their own
CREATE POLICY build_sessions_policy ON build_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Build suggestions - users can access their own + public completed builds
CREATE POLICY ai_build_suggestions_policy ON ai_build_suggestions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR completed_by_user = TRUE);

CREATE POLICY ai_build_suggestions_modify_policy ON ai_build_suggestions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY ai_build_suggestions_update_policy ON ai_build_suggestions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Build ratings - users can rate any build, but only see their own ratings
CREATE POLICY build_ratings_policy ON build_ratings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Completed builds - users can access their own + public builds
CREATE POLICY completed_builds_policy ON completed_builds
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR shared_publicly = TRUE);

CREATE POLICY completed_builds_modify_policy ON completed_builds
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User achievements - users can see their own
CREATE POLICY user_achievements_policy ON user_badge_achievements
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Challenge submissions - users can see their own + public results
CREATE POLICY challenge_submissions_policy ON challenge_submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR meets_criteria = TRUE);

CREATE POLICY challenge_submissions_modify_policy ON challenge_submissions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Public read access to reference tables
CREATE POLICY public_read_achievement_badges ON achievement_badges FOR SELECT TO public USING (is_active = TRUE);
CREATE POLICY public_read_engineering_principles ON engineering_principles FOR SELECT TO public USING (true);
CREATE POLICY public_read_build_challenges ON build_challenges FOR SELECT TO public USING (is_active = TRUE);

-- Functions for Build Advisor analytics
CREATE OR REPLACE FUNCTION get_user_learning_stats(user_uuid UUID)
RETURNS TABLE (
  total_builds_completed INTEGER,
  total_learning_points INTEGER,
  engineering_concepts_count INTEGER,
  design_skills_count INTEGER,
  physics_principles_count INTEGER,
  badges_earned INTEGER,
  avg_difficulty_score DECIMAL,
  current_streak_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT cb.id)::INTEGER as total_builds_completed,
    COALESCE(SUM(cb.learning_points_earned), 0)::INTEGER as total_learning_points,
    COALESCE(jsonb_array_length(bs.learning_progress->'engineering_concepts_learned'), 0)::INTEGER as engineering_concepts_count,
    COALESCE(jsonb_array_length(bs.learning_progress->'design_skills_developed'), 0)::INTEGER as design_skills_count,
    COALESCE(jsonb_array_length(bs.learning_progress->'physics_principles_understood'), 0)::INTEGER as physics_principles_count,
    COUNT(DISTINCT uba.id)::INTEGER as badges_earned,
    CASE 
      WHEN COUNT(cb.difficulty_level) > 0 THEN
        AVG(CASE cb.difficulty_level 
          WHEN 'beginner' THEN 1 
          WHEN 'intermediate' THEN 2 
          WHEN 'advanced' THEN 3 
          WHEN 'expert' THEN 4 
          ELSE 0 
        END)::DECIMAL
      ELSE 0
    END as avg_difficulty_score,
    -- Simplified streak calculation
    CASE 
      WHEN MAX(cb.completed_at) >= NOW() - INTERVAL '1 day' THEN 1
      ELSE 0
    END::INTEGER as current_streak_days
  FROM build_sessions bs
  LEFT JOIN completed_builds cb ON bs.user_id = cb.user_id
  LEFT JOIN user_badge_achievements uba ON bs.user_id = uba.user_id
  WHERE bs.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some default achievement badges
INSERT INTO achievement_badges (name, description, category, points_required, builds_required, icon_url) VALUES
('First Build', 'Complete your first AI-suggested build', 'completion', 0, 1, '/badges/first-build.png'),
('Engineering Apprentice', 'Learn 5 engineering concepts', 'engineering', 50, 0, '/badges/engineering-apprentice.png'),
('Triangle Master', 'Master triangular structural principles', 'engineering', 100, 3, '/badges/triangle-master.png'),
('Design Enthusiast', 'Complete 3 builds focused on design', 'design', 150, 3, '/badges/design-enthusiast.png'),
('Sound Engineer', 'Create 5 builds with complex audio experiences', 'physics', 200, 5, '/badges/sound-engineer.png'),
('Build Streak', 'Complete builds on 7 consecutive days', 'completion', 300, 7, '/badges/build-streak.png'),
('Expert Builder', 'Complete 3 expert-level builds', 'completion', 500, 3, '/badges/expert-builder.png');

-- Insert engineering principles for educational content
INSERT INTO engineering_principles (name, category, description, detailed_explanation, real_world_applications, difficulty_level) VALUES
('Triangular Structures', 'structural', 'Triangles are the strongest geometric shape for load-bearing structures', 
 'Triangles distribute forces evenly across three points and cannot be deformed without changing the length of their sides. This makes them inherently stable and strong.',
 ARRAY['Bridge trusses', 'Building frames', 'Tower cranes', 'Roof structures'],
 'beginner'),

('Foundation Engineering', 'structural', 'Wide, stable foundations distribute weight and prevent structural failure',
 'Foundations spread the load of a structure across a larger area, reducing pressure per unit area. The wider the base, the more stable the structure.',
 ARRAY['Building foundations', 'Monument bases', 'Bridge piers'],
 'beginner'),

('Cantilever Principles', 'structural', 'Projecting structures require careful load calculation and support',
 'Cantilevers create bending moments that increase with distance from the support. The moment equals the load times the distance.',
 ARRAY['Diving boards', 'Building balconies', 'Bridge spans'],
 'intermediate'),

('Resonance and Frequency', 'acoustics', 'Objects vibrate at natural frequencies, creating sound',
 'Every material has natural frequencies at which it vibrates. When excited at these frequencies, resonance occurs, amplifying the sound.',
 ARRAY['Musical instruments', 'Building acoustics', 'Bridge vibrations'],
 'intermediate'),

('Material Properties', 'materials', 'Different materials produce different sounds and structural properties',
 'Density, elasticity, and surface texture all affect how materials sound and behave structurally.',
 ARRAY['Instrument construction', 'Building materials', 'Automotive design'],
 'advanced');