'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/components/providers/auth-provider'
import { 
  Camera, 
  Brain, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Play,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Shield,
  Rocket
} from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const [animatedStats, setAnimatedStats] = useState({ users: 0, pieces: 0, builds: 0 })

  // Animate stats on load
  useEffect(() => {
    const targets = { users: 1247, pieces: 15420, builds: 3891 }
    const duration = 2000
    const steps = 60
    
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = Math.min(step / steps, 1)
      
      setAnimatedStats({
        users: Math.floor(targets.users * progress),
        pieces: Math.floor(targets.pieces * progress),
        builds: Math.floor(targets.builds * progress)
      })
      
      if (progress >= 1) clearInterval(timer)
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Marble Runderground
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {!loading && (
              user ? (
                <div className="flex items-center space-x-3">
                  <Link href="/collection/ai-scan">
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      AI Scan
                    </Button>
                  </Link>
                  <Link href="/build-advisor">
                    <Button size="sm">
                      <Brain className="w-4 h-4 mr-2" />
                      Build Advisor
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        <section className="relative px-4 py-20 lg:py-32">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Badge */}
              <Badge variant="gradient" size="lg" className="mb-6">
                <Rocket className="w-4 h-4 mr-2" />
                Revolutionary AI Technology
              </Badge>

              {/* Main heading */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight">
                <span className="block text-gray-900">The Future of</span>
                <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Marble Runs
                </span>
                <span className="block text-gray-900">is Here</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Upload a photo and watch AI identify every piece in your collection. 
                Get personalized builds that teach engineering while you play.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {user ? (
                  <>
                    <Link href="/collection/ai-scan">
                      <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg">
                        <Camera className="w-5 h-5 mr-2" />
                        Try AI Scanner
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/build-advisor">
                      <Button variant="outline" size="lg" className="px-8 py-4 text-lg group">
                        <Brain className="w-5 h-5 mr-2" />
                        Get Build Ideas
                        <Play className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/register">
                      <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg">
                        Start Free Today
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/catalog">
                      <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                        Explore Catalog
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="pt-12">
                <p className="text-sm text-gray-500 mb-6">Trusted by marble run enthusiasts worldwide</p>
                <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {animatedStats.users.toLocaleString()}+
                    </div>
                    <div className="text-sm text-gray-600">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {animatedStats.pieces.toLocaleString()}+
                    </div>
                    <div className="text-sm text-gray-600">Pieces Cataloged</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {animatedStats.builds.toLocaleString()}+
                    </div>
                    <div className="text-sm text-gray-600">Builds Created</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Features Showcase */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Badge variant="purple" size="lg" className="mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Revolutionary AI Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Experience the Magic
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI technology transforms how you interact with marble runs. 
                From instant piece recognition to personalized build suggestions.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              {/* AI Scanner Feature */}
              <div className="order-2 lg:order-1">
                <Card variant="elevated" size="lg" className="hover-lift">
                  <CardHeader 
                    icon={
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center animate-glow">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    }
                    badge={<Badge variant="gradient">NEW</Badge>}
                  >
                    <CardTitle>AI Collection Scanner</CardTitle>
                    <CardDescription>
                      Revolutionary computer vision technology that identifies and catalogs 
                      your marble run pieces instantly.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Identifies piece types & brands automatically</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Counts quantities with 95%+ accuracy</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Builds digital inventory instantly</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                      <div className="text-sm font-medium text-gray-900 mb-2">Recognition Accuracy</div>
                      <Progress value={95} variant="gradient" showPercentage />
                    </div>

                    {user && (
                      <Link href="/collection/ai-scan">
                        <Button className="w-full group">
                          <Camera className="w-4 h-4 mr-2" />
                          Try AI Scanner Now
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="order-1 lg:order-2 animate-float">
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-3xl p-8">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl h-full flex items-center justify-center">
                      <div className="text-center text-white">
                        <Camera className="w-20 h-20 mx-auto mb-4 animate-pulse" />
                        <div className="text-lg font-semibold">AI Vision Processing</div>
                        <div className="text-sm opacity-80 mt-2">Identifying pieces...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* AI Build Advisor Feature */}
              <div className="animate-float" style={{ animationDelay: '1s' }}>
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 rounded-3xl p-8">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl h-full flex items-center justify-center">
                      <div className="text-center text-white">
                        <Brain className="w-20 h-20 mx-auto mb-4 animate-pulse" />
                        <div className="text-lg font-semibold">AI Engineering Analysis</div>
                        <div className="text-sm opacity-80 mt-2">Designing your build...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Card variant="elevated" size="lg" className="hover-lift">
                  <CardHeader 
                    icon={
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center animate-glow">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                    }
                    badge={<Badge variant="gradient">AI-POWERED</Badge>}
                  >
                    <CardTitle>AI Build Advisor</CardTitle>
                    <CardDescription>
                      Get personalized build suggestions that teach engineering principles 
                      while you create amazing marble runs.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Structural engineering education</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Design optimization principles</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Audio experience engineering</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">🔺</div>
                        <div className="text-xs text-green-800">Triangular Strength</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">🏗️</div>
                        <div className="text-xs text-blue-800">Foundation Design</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">🎵</div>
                        <div className="text-xs text-purple-800">Sound Physics</div>
                      </div>
                    </div>

                    {user && (
                      <Link href="/build-advisor">
                        <Button variant="outline" className="w-full group">
                          <Brain className="w-4 h-4 mr-2" />
                          Get Build Ideas
                          <Play className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <Badge variant="default" size="lg" className="bg-white/20 text-white border-white/30">
                <Star className="w-4 h-4 mr-2" />
                Join the Revolution
              </Badge>

              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Ready to Experience the Future?
              </h2>

              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join thousands of marble run enthusiasts already using AI to build, learn, and create amazing runs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {!loading && !user && (
                  <>
                    <Link href="/auth/register">
                      <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg group">
                        Start Free Today
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/auth/login">
                      <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg">
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="pt-8">
                <div className="flex justify-center space-x-8 text-white/80">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm">Secure & Private</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span className="text-sm">Community Driven</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm">Always Learning</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Marble Runderground</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 Marble Runderground. The AI-powered marble run platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
