'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { useAIBuildAdvisor } from '@/lib/hooks/use-ai-build-advisor'
import { 
  Brain, 
  Zap, 
  Building, 
  Palette, 
  Volume2, 
  Trophy, 
  Target,
  Lightbulb,
  Clock,
  Award
} from 'lucide-react'

export default function BuildAdvisorPage() {
  const {
    currentSession,
    buildSuggestions,
    isGenerating,
    error,
    startBuildSession,
    selectBuild,
    getLearningStats,
    clearError
  } = useAIBuildAdvisor()

  const [preferences, setPreferences] = useState<{
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    focus: 'engineering' | 'design' | 'audio' | 'balanced'
    build_time: number
  }>({
    difficulty: 'intermediate',
    focus: 'balanced',
    build_time: 60
  })

  const learningStats = getLearningStats()

  const handleStartSession = async () => {
    try {
      await startBuildSession(preferences)
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100'
      case 'intermediate': return 'text-blue-600 bg-blue-100'
      case 'advanced': return 'text-purple-600 bg-purple-100'
      case 'expert': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getFocusIcon = (focus: string) => {
    switch (focus) {
      case 'engineering': return <Building className="h-5 w-5" />
      case 'design': return <Palette className="h-5 w-5" />
      case 'audio': return <Volume2 className="h-5 w-5" />
      default: return <Target className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Brain className="h-12 w-12 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI Build Advisor</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized marble run builds designed from engineering, design, and audio perspectives. 
            Learn why triangles are strongest, how to build solid foundations, and create amazing sound experiences.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-red-700">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {!currentSession ? (
          /* Setup New Session */
          <div className="max-w-4xl mx-auto">
            {/* Learning Stats Preview */}
            {learningStats && (
              <div className="bg-white rounded-lg border p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
                  Your Learning Progress
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {learningStats.totalConcepts}
                    </div>
                    <div className="text-sm text-blue-800">Concepts Learned</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {learningStats.totalPoints}
                    </div>
                    <div className="text-sm text-green-800">Learning Points</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {learningStats.badges.length}
                    </div>
                    <div className="text-sm text-purple-800">Badges Earned</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {learningStats.completedBuilds}
                    </div>
                    <div className="text-sm text-yellow-800">Builds Completed</div>
                  </div>
                </div>
              </div>
            )}

            {/* Build Preferences */}
            <div className="bg-white rounded-lg border p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Build Preferences</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Difficulty Level
                  </label>
                  <div className="space-y-2">
                    {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                      <label key={level} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="difficulty"
                          value={level}
                          checked={preferences.difficulty === level}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'expert'
                          }))}
                          className="text-purple-600"
                        />
                        <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${getDifficultyColor(level)}`}>
                          {level}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Focus */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Learning Focus
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'engineering', label: 'Engineering' },
                      { value: 'design', label: 'Design' },
                      { value: 'audio', label: 'Audio Experience' },
                      { value: 'balanced', label: 'Balanced' }
                    ].map((focus) => (
                      <label key={focus.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="focus"
                          value={focus.value}
                          checked={preferences.focus === focus.value}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            focus: e.target.value as 'engineering' | 'design' | 'audio' | 'balanced'
                          }))}
                          className="text-purple-600"
                        />
                        <span className="flex items-center space-x-2">
                          {getFocusIcon(focus.value)}
                          <span>{focus.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Build Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Target Build Time
                  </label>
                  <div className="space-y-2">
                    {[30, 60, 90, 120].map((time) => (
                      <label key={time} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="build_time"
                          value={time}
                          checked={preferences.build_time === time}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            build_time: parseInt(e.target.value)
                          }))}
                          className="text-purple-600"
                        />
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{time} minutes</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  onClick={handleStartSession}
                  disabled={isGenerating}
                  className="px-8 py-3 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <Zap className="h-5 w-5 mr-2 animate-spin" />
                      Generating Builds...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Generate AI Build Suggestions
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Lightbulb className="h-6 w-6 text-yellow-500 mr-2" />
                What You'll Learn
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Structural Engineering</h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Why triangles are the strongest shape</li>
                    <li>• Foundation engineering principles</li>
                    <li>• Load distribution and stress analysis</li>
                    <li>• Cantilever design and limits</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Palette className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Design Principles</h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Golden ratio and proportions</li>
                    <li>• Color theory and harmony</li>
                    <li>• Visual balance and focal points</li>
                    <li>• Aesthetic composition rules</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Volume2 className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Audio Experience</h4>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Sound frequency and pitch</li>
                    <li>• Material acoustics properties</li>
                    <li>• Rhythm and musical patterns</li>
                    <li>• Audio engineering concepts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Session - Build Suggestions */
          <div className="space-y-8">
            {/* Session Header */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Your AI-Generated Builds</h2>
                <div className="text-sm text-gray-600">
                  Session started {new Date(currentSession.created_at).toLocaleTimeString()}
                </div>
              </div>
              <p className="text-gray-600 mt-2">
                Each build is analyzed from engineering, design, and audio perspectives
              </p>
            </div>

            {/* Build Suggestions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {buildSuggestions.map((build) => (
                <div key={build.id} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">{build.build_name}</h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${getDifficultyColor(build.difficulty_level)}`}>
                      {build.difficulty_level}
                    </span>
                  </div>

                  {/* Build Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {build.structural_analysis.stability_score}%
                      </div>
                      <div className="text-xs text-blue-800">Stability</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {build.design_optimization.aesthetic_score}%
                      </div>
                      <div className="text-xs text-purple-800">Design</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {build.audio_experience.sound_profile.duration_estimate}s
                      </div>
                      <div className="text-xs text-green-800">Audio</div>
                    </div>
                  </div>

                  {/* Learning Highlights */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">What You'll Learn:</h4>
                    <div className="space-y-2">
                      {build.educational_objectives.slice(0, 2).map((objective, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm">
                          <Award className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{objective.objective}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Build Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>🎯 {build.piece_utilization}% of your collection</span>
                    <span>⏱️ ~{build.estimated_build_time} minutes</span>
                  </div>

                  <Button 
                    onClick={() => selectBuild(build.id)}
                    className="w-full"
                  >
                    Start Building
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}