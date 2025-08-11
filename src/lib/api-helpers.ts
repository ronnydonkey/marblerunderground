import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// API Response helpers
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}

export function errorResponse(message: string, status = 400, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}

// Authentication helpers
export async function requireAuth() {
  const supabase = createRouteHandlerClient({ cookies })
  
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    throw new Error('Authentication required')
  }

  return { supabase, session, user: session.user }
}

export async function requireAdmin() {
  const { supabase, session, user } = await requireAuth()
  
  // Check if user has admin role
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || profile?.role !== 'admin') {
    throw new Error('Admin access required')
  }

  return { supabase, session, user }
}

// Error handler wrapper for API routes
export function withErrorHandling(
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>
) {
  return async function (request: NextRequest, context?: unknown) {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API Error:', error)
      
      if (error instanceof Error) {
        if (error.message === 'Authentication required') {
          return errorResponse('Authentication required', 401, 'AUTH_REQUIRED')
        }
        if (error.message === 'Admin access required') {
          return errorResponse('Admin access required', 403, 'ADMIN_REQUIRED')
        }
        return errorResponse(error.message, 500, 'INTERNAL_ERROR')
      }
      
      return errorResponse('An unexpected error occurred', 500, 'UNKNOWN_ERROR')
    }
  }
}

// Request logging middleware
export function logRequest(request: NextRequest) {
  const method = request.method
  const url = request.url
  const userAgent = request.headers.get('user-agent')
  const timestamp = new Date().toISOString()
  
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`)
}

// CORS helper for API routes
export function corsResponse(response: NextResponse, origin?: string) {
  const allowedOrigins = [
    'https://www.marblerunderground.com',
    'https://marblerunderground.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
  ]

  const requestOrigin = origin || '*'
  const allowOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0]

  response.headers.set('Access-Control-Allow-Origin', allowOrigin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400') // 24 hours

  return response
}