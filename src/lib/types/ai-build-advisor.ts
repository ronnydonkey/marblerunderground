export interface StructuralAnalysis {
  stability_score: number // 0-100
  load_distribution: 'excellent' | 'good' | 'fair' | 'poor'
  weak_points: WeakPoint[]
  reinforcement_suggestions: ReinforcementSuggestion[]
  engineering_principles: EngineeringPrinciple[]
}

export interface WeakPoint {
  id: string
  location: { x: number; y: number; z: number }
  issue_type: 'insufficient_support' | 'stress_concentration' | 'cantilever_too_long' | 'joint_failure_risk'
  severity: 'critical' | 'moderate' | 'minor'
  description: string
  educational_note: string
}

export interface ReinforcementSuggestion {
  id: string
  type: 'add_triangle_brace' | 'add_support_column' | 'redistribute_load' | 'strengthen_joint'
  required_pieces: RequiredPiece[]
  improvement_estimate: number // percentage improvement in stability
  explanation: string
  engineering_lesson: string
}

export interface EngineeringPrinciple {
  name: string
  description: string
  application_in_build: string
  visual_example?: string
  learn_more_url?: string
}

export interface DesignOptimization {
  aesthetic_score: number // 0-100
  flow_efficiency: number // marble flow rating
  visual_balance: 'excellent' | 'good' | 'needs_work'
  color_harmony: ColorAnalysis
  proportions: ProportionAnalysis
  design_suggestions: DesignSuggestion[]
}

export interface ColorAnalysis {
  dominant_colors: string[]
  color_scheme: 'monochromatic' | 'complementary' | 'triadic' | 'mixed'
  harmony_score: number
  suggestions: string[]
}

export interface ProportionAnalysis {
  height_to_width_ratio: number
  golden_ratio_adherence: number
  visual_weight_distribution: 'balanced' | 'top_heavy' | 'bottom_heavy'
  focal_points: FocalPoint[]
}

export interface FocalPoint {
  location: { x: number; y: number; z: number }
  type: 'entrance' | 'junction' | 'special_element' | 'exit'
  visual_impact: number
}

export interface DesignSuggestion {
  type: 'color_balance' | 'proportion_adjustment' | 'focal_point_enhancement' | 'visual_flow'
  description: string
  impact: 'high' | 'medium' | 'low'
  required_pieces?: RequiredPiece[]
}

export interface AudioExperience {
  sound_profile: SoundAnalysis
  rhythm_pattern: RhythmAnalysis
  audio_optimization: AudioSuggestion[]
  educational_acoustics: AcousticsLesson[]
}

export interface SoundAnalysis {
  primary_sounds: AudioElement[]
  sound_journey_map: SoundEvent[]
  overall_harmony: 'melodic' | 'rhythmic' | 'chaotic' | 'minimal'
  duration_estimate: number // seconds
}

export interface AudioElement {
  type: 'click' | 'roll' | 'drop' | 'bounce' | 'whoosh' | 'chime'
  frequency: number // Hz
  amplitude: number // dB estimate
  material_source: string // 'plastic_on_plastic', 'marble_on_wood', etc.
  educational_note: string
}

export interface SoundEvent {
  timestamp: number // seconds from start
  location: { x: number; y: number; z: number }
  sound_type: string
  intensity: number
  description: string
}

export interface RhythmAnalysis {
  tempo: 'allegro' | 'moderato' | 'andante' | 'largo'
  pattern_type: 'steady' | 'accelerating' | 'variable' | 'syncopated'
  rhythm_score: number // 0-100 for rhythmic interest
}

export interface AudioSuggestion {
  type: 'add_chime' | 'create_rhythm_section' | 'sound_dampening' | 'echo_chamber'
  description: string
  required_pieces: RequiredPiece[]
  sound_improvement: string
  physics_lesson: string
}

export interface AcousticsLesson {
  concept: 'resonance' | 'pitch' | 'amplitude' | 'sound_propagation' | 'material_properties'
  explanation: string
  demonstration_in_build: string
  experiment_suggestion?: string
}

export interface RequiredPiece {
  piece_type_id: string
  piece_name: string
  brand: string
  quantity: number
  user_has: number
  need_to_acquire: number
  alternative_pieces?: AlternativePiece[]
}

export interface AlternativePiece {
  piece_type_id: string
  piece_name: string
  brand: string
  compatibility_rating: number // 0-100
  modification_needed?: string
}

export interface AIBuildSuggestion {
  id: string
  user_id: string
  session_id: string
  build_name: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  estimated_build_time: number // minutes
  
  // Core Analysis
  structural_analysis: StructuralAnalysis
  design_optimization: DesignOptimization
  audio_experience: AudioExperience
  
  // Build Details
  required_pieces: RequiredPiece[]
  step_by_step_instructions: BuildStep[]
  piece_utilization: number // percentage of user's collection used
  educational_objectives: LearningObjective[]
  
  // Metadata
  confidence_score: number // 0-100
  created_at: string
  user_rating?: number
  completed_by_user: boolean
}

export interface BuildStep {
  step_number: number
  title: string
  description: string
  pieces_to_add: RequiredPiece[]
  engineering_note?: string
  design_tip?: string
  safety_warning?: string
  image_url?: string
  video_url?: string
}

export interface LearningObjective {
  category: 'structural_engineering' | 'mechanical_physics' | 'design_principles' | 'acoustics'
  objective: string
  explanation: string
  real_world_application: string
}

export interface BuildSession {
  id: string
  user_id: string
  status: 'planning' | 'building' | 'completed' | 'abandoned'
  suggested_builds: AIBuildSuggestion[]
  current_build_id?: string
  progress_tracking: ProgressStep[]
  learning_progress: LearningProgress
  created_at: string
  completed_at?: string
}

export interface ProgressStep {
  build_step_number: number
  status: 'pending' | 'in_progress' | 'completed' | 'needs_help'
  time_spent_seconds: number
  user_notes?: string
  photo_url?: string
  timestamp: string
}

export interface LearningProgress {
  engineering_concepts_learned: string[]
  design_skills_developed: string[]
  physics_principles_understood: string[]
  total_learning_points: number
  achievement_badges: Badge[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_url: string
  earned_at: string
  category: 'engineering' | 'design' | 'physics' | 'creativity' | 'completion'
}