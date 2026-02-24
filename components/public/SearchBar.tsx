'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  // 防抖搜索 - 300ms 延迟
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (searchQuery) {
        params.set('search', searchQuery)
      } else {
        params.delete('search')
      }

      // 重置到第一页
      params.delete('page')

      router.push(`/?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, searchParams, router])

  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
      <Input
        type="text"
        placeholder="搜索陶器名称、产地、关键词..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 h-12 text-base"
      />
    </div>
  )
}
