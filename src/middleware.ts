import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting store (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100 // requests per window
const AUTH_RATE_LIMIT_MAX_REQUESTS = 5 // auth endpoints are more restrictive

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0] || 'unknown'
  return ip
}

function checkRateLimit(key: string, maxRequests: number): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, lastReset: now })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count++
  return true
}

export async function middleware(request: NextRequest) {
  // Rate limiting
  const key = getRateLimitKey(request)
  const isAuthEndpoint = request.nextUrl.pathname.startsWith('/auth') || 
                        request.nextUrl.pathname.startsWith('/api/auth')
  
  const maxRequests = isAuthEndpoint ? AUTH_RATE_LIMIT_MAX_REQUESTS : RATE_LIMIT_MAX_REQUESTS
  
  if (!checkRateLimit(key, maxRequests)) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'Retry-After': '900', // 15 minutes
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (Date.now() + RATE_LIMIT_WINDOW).toString()
        }
      }
    )
  }

  // Authentication check for protected routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const response = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res: response })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Check if user is admin (you'll need to implement this check based on your user roles)
    // For now, we'll allow any authenticated user to access admin routes
  }

  // Security headers
  const response = NextResponse.next()
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // HSTS (Strict Transport Security)
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}