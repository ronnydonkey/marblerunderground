'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { PieceType, Brand } from '@/lib/types/database'

export interface CatalogFilters {
  search: string
  brand: string
  category: string
  priceRange: [number, number]
  compatibility: string
  inStock: boolean
}

export interface CatalogSortOption {
  field: 'name' | 'brand' | 'category' | 'created_at' | 'price'
  direction: 'asc' | 'desc'
}

export type PieceWithBrand = PieceType & { 
  brand: Brand
  photos?: { url: string; alt_text?: string; is_primary: boolean }[]
}

export function useCatalogSearch() {
  const [pieces, setPieces] = useState<PieceWithBrand[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [filters, setFilters] = useState<CatalogFilters>({
    search: '',
    brand: '',
    category: '',
    priceRange: [0, 1000],
    compatibility: '',
    inStock: false
  })
  
  const [sortOption, setSortOption] = useState<CatalogSortOption>({
    field: 'created_at',
    direction: 'desc'
  })

  // Fetch initial data
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true)
        
        // Fetch brands for filter options
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (brandsError) throw brandsError
        setBrands(brandsData || [])

        // Fetch pieces with related data
        await fetchPieces()
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Fetch pieces when filters or sort options change
  useEffect(() => {
    if (!loading) {
      fetchPieces()
    }
  }, [filters, sortOption])

  async function fetchPieces() {
    try {
      let query = supabase
        .from('piece_types')
        .select(`
          *,
          brand:brands (*),
          photos:piece_photos (url, alt_text, is_primary)
        `)
        .eq('is_active', true)

      // Apply search filter using full-text search
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      // Apply brand filter
      if (filters.brand) {
        query = query.eq('brand_id', filters.brand)
      }

      // Apply category filter
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      // Apply sorting
      const sortField = sortOption.field === 'brand' ? 'brands.name' : sortOption.field
      query = query.order(sortField as any, { ascending: sortOption.direction === 'asc' })

      const { data, error } = await query

      if (error) throw error

      setPieces(data as PieceWithBrand[] || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pieces')
    }
  }

  // Computed values
  const filteredPieces = useMemo(() => {
    return pieces.filter(piece => {
      // Additional client-side filters that are hard to do in SQL
      return true // Placeholder for now
    })
  }, [pieces, filters])

  const totalCount = filteredPieces.length
  const categories = useMemo(() => {
    const cats = [...new Set(pieces.map(p => p.category))]
    return cats.sort()
  }, [pieces])

  // Filter and sort methods
  const updateFilter = (key: keyof CatalogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const updateSort = (field: CatalogSortOption['field'], direction: CatalogSortOption['direction']) => {
    setSortOption({ field, direction })
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      brand: '',
      category: '',
      priceRange: [0, 1000],
      compatibility: '',
      inStock: false
    })
  }

  return {
    // Data
    pieces: filteredPieces,
    brands,
    categories,
    totalCount,
    
    // State
    loading,
    error,
    filters,
    sortOption,
    
    // Actions
    updateFilter,
    updateSort,
    resetFilters,
    refetch: fetchPieces
  }
}