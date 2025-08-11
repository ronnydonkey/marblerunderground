'use client'

import { useState, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { AIBuildAdvisor } from '@/lib/ai/build-advisor'
import type { 
  AIBuildSuggestion, 
  BuildSession, 
  ProgressStep,
  LearningProgress,
  Badge
} from '@/lib/types/ai-build-advisor'

export function useAIBuildAdvisor() {
  const [currentSession, setCurrentSession] = useState<BuildSession | null>(null)
  const [buildSuggestions, setBuildSuggestions] = useState<AIBuildSuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isBuilding, setIsBuilding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const advisor = useMemo(() => new AIBuildAdvisor(), [])

  // Start a new build session
  const startBuildSession = useCallback(async (preferences?: unknown) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Authentication required')

      setIsGenerating(true)
      setError(null)

      // Generate AI build suggestions
      const suggestions = await advisor.generateBuildSuggestions(user.id, preferences as any)
      
      // Create new session
      const session: BuildSession = {
        id: crypto.randomUUID(),
        user_id: user.id,
        status: 'planning',
        suggested_builds: suggestions,
        progress_tracking: [],
        learning_progress: {
          engineering_concepts_learned: [],
          design_skills_developed: [],
          physics_principles_understood: [],
          total_learning_points: 0,
          achievement_badges: []
        },
        created_at: new Date().toISOString()
      }

      // Save session to database
      await supabase.from('build_sessions').insert(session)

      setCurrentSession(session)
      setBuildSuggestions(suggestions)
      
      return session
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start build session'
      setError(message)
      throw new Error(message)
    } finally {
      setIsGenerating(false)
    }
  }, [advisor])

  // Select a build to work on
  const selectBuild = useCallback(async (buildId: string) => {
    if (!currentSession) throw new Error('No active session')

    const updatedSession: BuildSession = {
      ...currentSession,
      current_build_id: buildId,
      status: 'building'
    }

    await supabase
      .from('build_sessions')
      .update({ 
        current_build_id: buildId,
        status: 'building' 
      })
      .eq('id', currentSession.id)

    setCurrentSession(updatedSession)
    setIsBuilding(true)
  }, [currentSession])

  // Track progress on current build
  const updateProgress = useCallback(async (
    stepNumber: number,
    status: 'pending' | 'in_progress' | 'completed' | 'needs_help',
    userNotes?: string,
    photoUrl?: string
  ) => {
    if (!currentSession) throw new Error('No active session')

    const progressStep: ProgressStep = {
      build_step_number: stepNumber,
      status,
      time_spent_seconds: 0, // Would track this in real implementation
      user_notes: userNotes,
      photo_url: photoUrl,
      timestamp: new Date().toISOString()
    }

    const updatedProgress = [
      ...currentSession.progress_tracking.filter(p => p.build_step_number !== stepNumber),
      progressStep
    ]

    const updatedSession: BuildSession = {
      ...currentSession,
      progress_tracking: updatedProgress
    }

    await supabase
      .from('build_sessions')
      .update({ progress_tracking: updatedProgress })
      .eq('id', currentSession.id)

    setCurrentSession(updatedSession)

    // Check if build is completed
    const currentBuild = buildSuggestions.find(b => b.id === currentSession.current_build_id)
    if (currentBuild && updatedProgress.filter(p => p.status === 'completed').length === currentBuild.step_by_step_instructions.length) {
      await completeBuild()
    }
  }, [currentSession, buildSuggestions])

  // Record learning achievement
  const recordLearning = useCallback(async (
    concept: string,
    category: 'engineering_concepts_learned' | 'design_skills_developed' | 'physics_principles_understood',
    points = 10
  ) => {
    if (!currentSession) return

    const updatedLearning: LearningProgress = {
      ...currentSession.learning_progress,
      [category]: [...currentSession.learning_progress[category], concept],
      total_learning_points: currentSession.learning_progress.total_learning_points + points
    }

    // Check for new badges
    const newBadges = await checkForBadges(updatedLearning)
    updatedLearning.achievement_badges = [...currentSession.learning_progress.achievement_badges, ...newBadges]

    const updatedSession: BuildSession = {
      ...currentSession,
      learning_progress: updatedLearning
    }

    await supabase
      .from('build_sessions')
      .update({ learning_progress: updatedLearning })
      .eq('id', currentSession.id)

    setCurrentSession(updatedSession)
  }, [currentSession])

  // Complete current build
  const completeBuild = useCallback(async () => {
    if (!currentSession || !currentSession.current_build_id) return

    const completedBuild = buildSuggestions.find(b => b.id === currentSession.current_build_id)
    if (!completedBuild) return

    // Mark build as completed
    const updatedSuggestions = buildSuggestions.map(build => 
      build.id === currentSession.current_build_id 
        ? { ...build, completed_by_user: true }
        : build
    )

    // Award completion badges and learning points
    const completionPoints = completedBuild.difficulty_level === 'expert' ? 100 :
                            completedBuild.difficulty_level === 'advanced' ? 75 :
                            completedBuild.difficulty_level === 'intermediate' ? 50 : 25

    await recordLearning(`Completed ${completedBuild.build_name}`, 'engineering_concepts_learned', completionPoints)

    setBuildSuggestions(updatedSuggestions)
    setIsBuilding(false)

    // Save completion to user's build history
    await supabase.from('completed_builds').insert({
      user_id: currentSession.user_id,
      build_suggestion_id: completedBuild.id,
      session_id: currentSession.id,
      completion_time_minutes: Math.round(
        currentSession.progress_tracking.reduce((sum, step) => sum + step.time_spent_seconds, 0) / 60
      ),
      difficulty_level: completedBuild.difficulty_level,
      learning_points_earned: completionPoints,
      completed_at: new Date().toISOString()
    })

  }, [currentSession, buildSuggestions, recordLearning])

  // Rate a build suggestion
  const rateBuild = useCallback(async (buildId: string, rating: number) => {
    const updatedSuggestions = buildSuggestions.map(build =>
      build.id === buildId ? { ...build, user_rating: rating } : build
    )

    setBuildSuggestions(updatedSuggestions)

    // Save rating to database
    await supabase.from('build_ratings').insert({
      user_id: currentSession?.user_id,
      build_suggestion_id: buildId,
      rating,
      created_at: new Date().toISOString()
    })
  }, [buildSuggestions, currentSession])

  // Get current build details
  const getCurrentBuild = useCallback(() => {
    if (!currentSession?.current_build_id) return null
    return buildSuggestions.find(b => b.id === currentSession.current_build_id) || null
  }, [currentSession, buildSuggestions])

  // Get learning statistics
  const getLearningStats = useCallback(() => {
    if (!currentSession) return null

    const progress = currentSession.learning_progress
    return {
      totalConcepts: progress.engineering_concepts_learned.length + 
                   progress.design_skills_developed.length + 
                   progress.physics_principles_understood.length,
      totalPoints: progress.total_learning_points,
      badges: progress.achievement_badges,
      completedBuilds: buildSuggestions.filter(b => b.completed_by_user).length,
      averageDifficulty: buildSuggestions.length > 0 
        ? buildSuggestions.reduce((sum, b) => {
            const difficultyScore = b.difficulty_level === 'expert' ? 4 :
                                  b.difficulty_level === 'advanced' ? 3 :
                                  b.difficulty_level === 'intermediate' ? 2 : 1
            return sum + difficultyScore
          }, 0) / buildSuggestions.length
        : 0
    }
  }, [currentSession, buildSuggestions])

  // Helper function to check for new badges
  const checkForBadges = async (learning: LearningProgress): Promise<Badge[]> => {
    const newBadges: Badge[] = []
    
    // Engineering Master badge
    if (learning.engineering_concepts_learned.length >= 10) {
      newBadges.push({
        id: crypto.randomUUID(),
        name: 'Engineering Master',
        description: 'Learned 10+ engineering concepts',
        icon_url: '/badges/engineering-master.png',
        earned_at: new Date().toISOString(),
        category: 'engineering'
      })
    }

    // Triangle Expert badge
    if (learning.engineering_concepts_learned.some(c => c.toLowerCase().includes('triangle'))) {
      newBadges.push({
        id: crypto.randomUUID(),
        name: 'Triangle Expert',
        description: 'Master of triangular structures',
        icon_url: '/badges/triangle-expert.png',
        earned_at: new Date().toISOString(),
        category: 'engineering'
      })
    }

    // Points milestone badges
    if (learning.total_learning_points >= 500) {
      newBadges.push({
        id: crypto.randomUUID(),
        name: 'Knowledge Seeker',
        description: 'Earned 500+ learning points',
        icon_url: '/badges/knowledge-seeker.png',
        earned_at: new Date().toISOString(),
        category: 'completion'
      })
    }

    return newBadges.filter(badge => 
      !learning.achievement_badges.some(existing => existing.name === badge.name)
    )
  }

  return {
    // State
    currentSession,
    buildSuggestions,
    isGenerating,
    isBuilding,
    error,

    // Actions
    startBuildSession,
    selectBuild,
    updateProgress,
    recordLearning,
    completeBuild,
    rateBuild,

    // Computed values
    getCurrentBuild,
    getLearningStats,

    // Utilities
    clearError: () => setError(null)
  }
}