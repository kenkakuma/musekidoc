'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const prevSearchQueryRef = useRef(searchQuery)

  // 获取搜索建议
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true)
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=5`)
        const data = await response.json()

        if (data.success && Array.isArray(data.data)) {
          setSuggestions(data.data)
          setShowSuggestions(data.data.length > 0)
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // 防抖搜索 - 300ms 延迟
  useEffect(() => {
    if (prevSearchQueryRef.current === searchQuery) {
      return
    }

    prevSearchQueryRef.current = searchQuery

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (searchQuery) {
        params.set('search', searchQuery)
      } else {
        params.delete('search')
      }

      params.delete('page')
      router.push(`/?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  // 键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          setSearchQuery(suggestions[selectedIndex])
          setShowSuggestions(false)
          setSelectedIndex(-1)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full max-w-2xl mb-6">
      {/* Search Icon */}
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 z-10" />

      {/* Loading Spinner */}
      {isLoadingSuggestions && (
        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-accent animate-spin z-10" />
      )}

      {/* Search Input with Zen Styling */}
      <input
        ref={inputRef}
        type="text"
        placeholder="搜索陶器名称、产地、关键词..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="input-zen pl-12 pr-12 h-14 text-base shadow-sm"
      />

      {/* Search Suggestions with Ink-Wash Animation */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border/50 rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto animate-ink-wash washi-texture">
          {/* Decorative top border accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`
                w-full text-left px-5 py-4
                transition-all duration-300 ease-out
                hover:bg-accent/10 hover:translate-x-1
                ${index === selectedIndex ? 'bg-accent/15 translate-x-1 border-l-2 border-accent' : ''}
                ${index === 0 ? 'rounded-t-xl pt-5' : ''}
                ${index === suggestions.length - 1 ? 'rounded-b-xl pb-5' : 'border-b border-border/30'}
              `}
            >
              <div className="flex items-center gap-3">
                <Search className={`h-4 w-4 transition-colors ${
                  index === selectedIndex ? 'text-accent' : 'text-muted-foreground/50'
                }`} />
                <span className={`text-sm transition-colors ${
                  index === selectedIndex ? 'text-foreground font-medium' : 'text-foreground/80'
                }`}>
                  {suggestion}
                </span>
              </div>
            </button>
          ))}

          {/* Decorative bottom border accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        </div>
      )}
    </div>
  )
}
