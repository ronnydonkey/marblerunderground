import type { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  user_metadata: {
    firstName?: string
    lastName?: string
    avatar_url?: string
    role?: 'admin' | 'user'
  }
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  isAdmin: boolean
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => Promise<{ error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
}