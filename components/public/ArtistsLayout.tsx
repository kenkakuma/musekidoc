'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ArtistData } from '@/lib/db/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageGallery } from '@/components/public/ImageGallery'
import { PotteryCard } from '@/components/public/PotteryCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User, Users, Calendar, Award, Globe, Instagram, MapPin, Palette, Sparkles } from 'lucide-react'

interface ArtistsLayoutProps {
  artists: ArtistData[]
  initialSelectedSlug?: string
  relatedPotteries?: Record<string, any[]>
}

type SortOption = 'name-asc' | 'name-desc' | 'birth-asc' | 'birth-desc' | 'recent'

export function ArtistsLayout({ artists, initialSelectedSlug, relatedPotteries = {} }: ArtistsLayoutProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')

  // 使用本地状态管理选中的作家，这样点击后可以立即更新
  const [selectedSlug, setSelectedSlug] = useState<string>(
    initialSelectedSlug || artists[0]?.slug || ''
  )

  // 同步 URL 参数到本地状态
  useEffect(() => {
    const urlSlug = searchParams.get('artist')
    if (urlSlug && urlSlug !== selectedSlug) {
      setSelectedSlug(urlSlug)
    }
  }, [searchParams])

  // 获取当前选中的作家
  const selectedArtist = useMemo(() => {
    console.log('Selected slug:', selectedSlug) // 调试日志
    const artist = artists.find(a => a.slug === selectedSlug)
    console.log('Found artist:', artist?.nameZh) // 调试日志
    return artist || artists[0]
  }, [artists, selectedSlug])

  // 排序逻辑
  const sortedArtists = useMemo(() => {
    const sorted = [...artists]

    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.nameZh.localeCompare(b.nameZh, 'zh-CN'))
      case 'name-desc':
        return sorted.sort((a, b) => b.nameZh.localeCompare(a.nameZh, 'zh-CN'))
      case 'birth-asc':
        return sorted.sort((a, b) => (a.birthYear || 9999) - (b.birthYear || 9999))
      case 'birth-desc':
        return sorted.sort((a, b) => (b.birthYear || 0) - (a.birthYear || 0))
      case 'recent':
        return sorted.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      default:
        return sorted
    }
  }, [artists, sortBy])

  // 选择作家 - 立即更新本地状态，然后更新 URL
  const handleSelectArtist = (slug: string) => {
    console.log('Selecting artist:', slug) // 调试日志
    setSelectedSlug(slug) // 立即更新本地状态

    // 更新 URL（不会触发页面刷新）
    const params = new URLSearchParams(searchParams.toString())
    params.set('artist', slug)
    router.push(`/artists?${params.toString()}`, { scroll: false })
  }

  // 计算年龄/时期
  const getYearInfo = (artist: ArtistData) => {
    if (artist.birthYear && artist.deathYear) {
      return `${artist.birthYear} - ${artist.deathYear}`
    } else if (artist.birthYear) {
      const age = new Date().getFullYear() - artist.birthYear
      return `${artist.birthYear} 年生 (${age} 岁)`
    }
    return '年份未知'
  }

  const selectedImages = selectedArtist?.images
    ? (selectedArtist.images as any) as any[]
    : []

  const artistRelatedPotteries = selectedArtist ? (relatedPotteries[selectedArtist.id] || []) : []

  if (!selectedArtist) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">暂无作家数据</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden washi-texture">
      {/* 左侧边栏 - 作家列表 with Japanese Aesthetic */}
      <aside className="w-96 border-r border-border/50 flex flex-col bg-card shadow-xl">
        {/* 排序控制 with Zen Design */}
        <div className="p-6 border-b border-border/50 bg-gradient-to-br from-sand/20 to-ivory/30">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-serif font-medium text-foreground flex items-center gap-3 seasonal-accent">
              <Users className="w-6 h-6 text-accent" />
              陶艺作家
            </h2>
            <Badge className="bg-accent text-accent-foreground px-3 py-1.5 rounded-full">
              {artists.length} 位
            </Badge>
          </div>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="input-zen h-11">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">姓名 A → Z</SelectItem>
              <SelectItem value="name-desc">姓名 Z → A</SelectItem>
              <SelectItem value="birth-asc">出生年份 ↑</SelectItem>
              <SelectItem value="birth-desc">出生年份 ↓</SelectItem>
              <SelectItem value="recent">最近添加</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 作家列表 with Elegant Transitions */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {sortedArtists.map((artist, index) => {
            const isSelected = selectedArtist.id === artist.id
            return (
              <button
                key={artist.id}
                onClick={() => handleSelectArtist(artist.slug)}
                className={`
                  w-full px-6 py-5 text-left border-b border-border/30
                  transition-all duration-300 ease-out
                  ${isSelected
                    ? 'bg-accent/10 border-l-4 border-l-accent shadow-sm'
                    : 'hover:bg-accent/5 hover:translate-x-1'
                  }
                `}
                style={!isSelected ? { animationDelay: `${index * 30}ms` } : undefined}
              >
                <div className="flex items-start gap-4">
                  {/* 头像 with Zen Circle */}
                  <div className={`
                    flex-shrink-0 w-16 h-16 rounded-full overflow-hidden
                    ring-2 transition-all duration-300
                    ${isSelected ? 'ring-accent shadow-md' : 'ring-border/50'}
                  `}>
                    {artist.avatar ? (
                      <img
                        src={artist.avatar}
                        alt={artist.nameZh}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-sand/50 to-ivory/70 flex items-center justify-center">
                        <User className="w-8 h-8 text-accent/60" />
                      </div>
                    )}
                  </div>

                  {/* 信息 with Japanese Typography */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      font-serif font-medium text-base truncate mb-1.5
                      ${isSelected ? 'text-accent' : 'text-foreground'}
                      transition-colors duration-300
                    `}>
                      {artist.nameZh}
                    </h3>
                    <p className="text-sm text-muted-foreground font-jp tracking-wider truncate mb-2">
                      {artist.nameJa}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{getYearInfo(artist)}</span>
                    </div>
                  </div>

                  {/* 选中指示器 with Subtle Animation */}
                  {isSelected && (
                    <div className="flex-shrink-0 self-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shadow-sm" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* 右侧 - 作家详情 with Japanese Aesthetic */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-sand/5 scrollbar-hide">
        <div className="max-w-5xl mx-auto px-8 md:px-12 py-10">
          {/* 头部信息 with Generous Spacing */}
          <div className="mb-12 pb-8 border-b border-border/50 animate-ink-wash">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <Badge className="mb-5 bg-accent text-accent-foreground px-4 py-2 rounded-full shadow-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  陶艺作家
                </Badge>
                <h1 className="text-5xl md:text-6xl font-serif font-medium text-foreground mb-5 text-balance leading-tight">
                  {selectedArtist.nameZh}
                </h1>
                <div className="flex flex-wrap items-center gap-5 text-muted-foreground mb-4">
                  <span className="font-jp text-xl md:text-2xl tracking-wider">{selectedArtist.nameJa}</span>
                  {selectedArtist.nameEn && (
                    <>
                      <span className="text-border">|</span>
                      <span className="text-lg md:text-xl font-serif italic">{selectedArtist.nameEn}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-5 h-5 text-accent" />
                  <span className="font-medium text-base">{getYearInfo(selectedArtist)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 头像/作品图片 with Elegant Display */}
          <div className="mb-10 animate-ink-wash" style={{ animationDelay: '100ms' }}>
            {selectedArtist.avatar || selectedImages.length > 0 ? (
              selectedImages.length > 0 ? (
                <ImageGallery images={selectedImages} />
              ) : (
                <div className="aspect-[21/9] w-full overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br from-sand/20 to-ivory/30 border border-border/50">
                  <img
                    src={selectedArtist.avatar!}
                    alt={selectedArtist.nameZh}
                    className="w-full h-full object-cover img-zen"
                  />
                </div>
              )
            ) : (
              <div className="aspect-[21/9] w-full bg-gradient-to-br from-sand/30 via-ivory/40 to-sand/20 rounded-2xl flex items-center justify-center shadow-lg border border-border/50">
                <div className="w-40 h-40 rounded-full bg-mist-gray/50 flex items-center justify-center">
                  <User className="w-24 h-24 text-accent/40" />
                </div>
              </div>
            )}
          </div>

          {/* 信息卡片组 with Zen Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* 艺术特点 */}
            {(selectedArtist.region || selectedArtist.style) && (
              <div className="card-zen bg-sand/10 animate-ink-wash" style={{ animationDelay: '200ms' }}>
                <h3 className="text-lg font-serif font-medium mb-6 flex items-center gap-3 seasonal-accent">
                  <Palette className="w-5 h-5 text-accent" />
                  艺术特点
                </h3>
                <div className="space-y-5">
                  {selectedArtist.region && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-accent/60 mt-1" />
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">产地/地区</span>
                        <span className="font-medium text-foreground text-base">{selectedArtist.region}</span>
                      </div>
                    </div>
                  )}
                  {selectedArtist.style && (
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-accent/60 mt-1" />
                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">艺术风格</span>
                        <span className="font-medium text-foreground text-base">{selectedArtist.style}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 在线资源 */}
            {(selectedArtist.websiteUrl || selectedArtist.instagramHandle) && (
              <div className="card-zen bg-ivory/20 animate-ink-wash" style={{ animationDelay: '250ms' }}>
                <h3 className="text-lg font-serif font-medium mb-6 flex items-center gap-3 seasonal-accent">
                  <Globe className="w-5 h-5 text-accent" />
                  在线资源
                </h3>
                <div className="space-y-4">
                  {selectedArtist.websiteUrl && (
                    <a
                      href={selectedArtist.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-accent hover:text-accent-hover transition-colors group"
                    >
                      <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium brush-underline">官方网站</span>
                    </a>
                  )}
                  {selectedArtist.instagramHandle && (
                    <a
                      href={`https://instagram.com/${selectedArtist.instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-accent hover:text-accent-hover transition-colors group"
                    >
                      <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <div className="flex flex-col">
                        <span className="font-medium brush-underline">@{selectedArtist.instagramHandle}</span>
                        {selectedArtist.instagramFollowers && (
                          <span className="text-xs text-muted-foreground mt-1">
                            {selectedArtist.instagramFollowers.toLocaleString()} 粉丝
                          </span>
                        )}
                      </div>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* 展览信息 */}
            {selectedArtist.exhibitionCount !== null && selectedArtist.exhibitionCount !== undefined && (
              <div className="card-zen bg-accent/5 border-accent/20 animate-ink-wash" style={{ animationDelay: '300ms' }}>
                <h3 className="text-lg font-serif font-medium mb-6 flex items-center gap-3 seasonal-accent">
                  <Award className="w-5 h-5 text-accent" />
                  展览记录
                </h3>
                <div className="text-4xl font-serif font-medium text-foreground mb-2">
                  {selectedArtist.exhibitionCount} 次
                </div>
                <p className="text-sm text-muted-foreground">参展次数</p>
              </div>
            )}
          </div>

          {/* 艺术家简介 with Generous Leading */}
          <div className="card-zen mb-10 animate-ink-wash" style={{ animationDelay: '350ms' }}>
            <h3 className="text-2xl font-serif font-medium mb-6 seasonal-accent">
              艺术家简介
            </h3>
            <div className="prose prose-lg max-w-none">
              <p className="whitespace-pre-wrap text-foreground/90 leading-loose text-base">
                {selectedArtist.bio}
              </p>
            </div>
          </div>

          {/* 相关作品 with Stagger Animation */}
          {artistRelatedPotteries.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-10 animate-ink-wash" style={{ animationDelay: '400ms' }}>
                <Sparkles className="w-8 h-8 text-accent" />
                <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground seasonal-accent">
                  相关陶器作品
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {artistRelatedPotteries.map((pottery, index) => (
                  <div
                    key={pottery.id}
                    className="animate-ink-wash"
                    style={{ animationDelay: `${450 + index * 80}ms` }}
                  >
                    <PotteryCard entry={pottery as any} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
