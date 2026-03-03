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
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden bg-slate-50">
      {/* 左侧边栏 - 作家列表 */}
      <aside className="w-96 border-r border-slate-200 flex flex-col bg-white shadow-lg">
        {/* 排序控制 */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              陶艺作家
            </h2>
            <Badge className="bg-amber-600">{artists.length} 位</Badge>
          </div>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full bg-white">
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

        {/* 作家列表 */}
        <div className="flex-1 overflow-y-auto">
          {sortedArtists.map((artist) => {
            const isSelected = selectedArtist.id === artist.id
            return (
              <button
                key={artist.id}
                onClick={() => handleSelectArtist(artist.slug)}
                className={`
                  w-full px-6 py-4 text-left border-b border-slate-100
                  transition-all duration-200
                  ${isSelected
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-600 shadow-sm'
                    : 'hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* 头像 */}
                  <div className={`
                    flex-shrink-0 w-14 h-14 rounded-full overflow-hidden
                    ring-2 transition-all
                    ${isSelected ? 'ring-amber-400' : 'ring-slate-200'}
                  `}>
                    {artist.avatar ? (
                      <img
                        src={artist.avatar}
                        alt={artist.nameZh}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <User className="w-7 h-7 text-amber-600" />
                      </div>
                    )}
                  </div>

                  {/* 信息 */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      font-semibold truncate mb-1
                      ${isSelected ? 'text-amber-900' : 'text-slate-900'}
                    `}>
                      {artist.nameZh}
                    </h3>
                    <p className="text-sm text-slate-600 font-jp truncate mb-1">
                      {artist.nameJa}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{getYearInfo(artist)}</span>
                    </div>
                  </div>

                  {/* 选中指示器 */}
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* 右侧 - 作家详情 */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {/* 头部信息 */}
          <div className="mb-8 pb-6 border-b border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Badge className="mb-3 bg-amber-600">
                  <Sparkles className="w-3 h-3 mr-1" />
                  陶艺作家
                </Badge>
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  {selectedArtist.nameZh}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-slate-600 mb-2">
                  <span className="font-jp text-xl">{selectedArtist.nameJa}</span>
                  {selectedArtist.nameEn && (
                    <>
                      <span className="text-slate-300">|</span>
                      <span className="text-lg">{selectedArtist.nameEn}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span className="font-medium">{getYearInfo(selectedArtist)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 头像/作品图片 */}
          <div className="mb-8">
            {selectedArtist.avatar || selectedImages.length > 0 ? (
              selectedImages.length > 0 ? (
                <ImageGallery images={selectedImages} />
              ) : (
                <div className="aspect-[21/9] w-full overflow-hidden rounded-xl shadow-lg bg-gradient-to-br from-slate-100 to-slate-200">
                  <img
                    src={selectedArtist.avatar!}
                    alt={selectedArtist.nameZh}
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            ) : (
              <div className="aspect-[21/9] w-full bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-xl flex items-center justify-center shadow-lg border border-amber-100">
                <User className="w-32 h-32 text-amber-300" />
              </div>
            )}
          </div>

          {/* 信息卡片组 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 艺术特点 */}
            {(selectedArtist.region || selectedArtist.style) && (
              <Card className="border-amber-200 bg-gradient-to-br from-white to-amber-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-600" />
                    艺术特点
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedArtist.region && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-500 block">产地/地区</span>
                        <span className="font-medium text-slate-900">{selectedArtist.region}</span>
                      </div>
                    </div>
                  )}
                  {selectedArtist.style && (
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <span className="text-xs text-slate-500 block">艺术风格</span>
                        <span className="font-medium text-slate-900">{selectedArtist.style}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 在线资源 */}
            {(selectedArtist.websiteUrl || selectedArtist.instagramHandle) && (
              <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="w-4 h-4 text-orange-600" />
                    在线资源
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedArtist.websiteUrl && (
                    <a
                      href={selectedArtist.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="font-medium">官方网站</span>
                    </a>
                  )}
                  {selectedArtist.instagramHandle && (
                    <a
                      href={`https://instagram.com/${selectedArtist.instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-pink-600 hover:text-pink-700 hover:underline transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                      <div className="flex flex-col">
                        <span className="font-medium">@{selectedArtist.instagramHandle}</span>
                        {selectedArtist.instagramFollowers && (
                          <span className="text-xs text-slate-500">
                            {selectedArtist.instagramFollowers.toLocaleString()} 粉丝
                          </span>
                        )}
                      </div>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 展览信息 */}
            {selectedArtist.exhibitionCount !== null && selectedArtist.exhibitionCount !== undefined && (
              <Card className="border-red-200 bg-gradient-to-br from-white to-red-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="w-4 h-4 text-red-600" />
                    展览记录
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {selectedArtist.exhibitionCount} 次
                  </div>
                  <p className="text-sm text-slate-600 mt-1">参展次数</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 艺术家简介 */}
          <Card className="mb-8 border-slate-200">
            <CardHeader>
              <CardTitle className="text-xl">艺术家简介</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-base">
                  {selectedArtist.bio}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 相关作品 */}
          {artistRelatedPotteries.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-amber-600" />
                <h2 className="text-2xl font-bold text-slate-900">相关陶器作品</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {artistRelatedPotteries.map((pottery) => (
                  <PotteryCard key={pottery.id} entry={pottery as any} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
