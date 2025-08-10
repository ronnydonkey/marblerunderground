'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { PieceType, Brand } from '@/lib/types/database'

export function usePieces() {
  const [pieces, setPieces] = useState<(PieceType & { brand: Brand })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPieces() {
      try {
        const { data, error } = await supabase
          .from('piece_types')
          .select(`
            *,
            brand:brands (*)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) throw error

        setPieces(data as (PieceType & { brand: Brand })[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPieces()
  }, [])

  return { pieces, loading, error }
}