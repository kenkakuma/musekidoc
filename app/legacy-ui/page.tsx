import { Suspense } from 'react'
import { prisma } from '@/lib/db/client'
import { PotteryCard } from '@/components/public/PotteryCard'
import { SearchBar } from '@/components/public/SearchBar'
import type { PotteryEntryData } from '@/lib/db/types'
import Link from 'next/link'
import {
  BookOpen,
  Users,
  MapPin,
  Sparkles,
  TrendingUp,
  Library,
  ArrowRight,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

async function getHomePageData() {
  // 获取统计数据
  const [entriesCount, artistsCount, publishedEntries] = await Promise.all([
    prisma.potteryEntry.count({ where: { published: true } }),
    prisma.artist.count({ where: { published: true } }),
    prisma.potteryEntry.findMany({
      where: { published: true },
      select: { region: true, category: true },
    }),
  ])

  // 计算产地和分类数量
  const regions = new Set(publishedEntries.map(e => e.region))
  const categories = new Set(publishedEntries.map(e => e.category))

  // 获取最新条目（8个）
  const latestEntries = await prisma.potteryEntry.findMany({
    where: { published: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      artist: {
        select: {
          id: true,
          slug: true,
          nameZh: true,
          nameJa: true,
        },
      },
    },
  })

  // 获取精选条目（按热度或手动标记，这里简单用前4个）
  const featuredEntries = await prisma.potteryEntry.findMany({
    where: { published: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: {
      artist: {
        select: {
          id: true,
          slug: true,
          nameZh: true,
          nameJa: true,
        },
      },
    },
  })

  // 获取热门产地和分类（前6个）
  const regionCounts = publishedEntries.reduce((acc, entry) => {
    acc[entry.region] = (acc[entry.region] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topRegions = Object.entries(regionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }))

  const categoryCounts = publishedEntries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }))

  return {
    stats: {
      entries: entriesCount,
      artists: artistsCount,
      regions: regions.size,
      categories: categories.size,
    },
    latestEntries: latestEntries as unknown as PotteryEntryData[],
    featuredEntries: featuredEntries as unknown as PotteryEntryData[],
    topRegions,
    topCategories,
  }
}

export default async function HomePage() {
  const { stats, latestEntries, featuredEntries, topRegions, topCategories } = await getHomePageData()

  return (
    <div className="min-h-screen washi-texture">
      {/* Hero Section with Japanese Aesthetic */}
      <section className="relative bg-gradient-to-b from-sand/20 via-ivory/10 to-transparent border-b border-border/50">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-3"></div>
        <div className="container-zen relative">
          <div className="max-w-4xl mx-auto text-center stagger-reveal">
            {/* Category Badge with Zen Styling */}
            <Badge className="mb-8 bg-accent text-accent-foreground px-6 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow animate-ink-wash">
              <Library className="w-4 h-4 mr-2" />
              日本陶艺知识库
            </Badge>

            {/* Main Title - Elegant Japanese Typography */}
            <h1 className="text-6xl md:text-7xl font-serif font-medium mb-8 text-balance leading-tight animate-ink-wash">
              探索日本陶艺之美
            </h1>

            {/* Subtitle with Generous Leading */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto animate-ink-wash">
              从传统技法到现代创作，深入了解日本陶器的历史、产地与名家作品
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12 animate-ink-wash">
              <Suspense fallback={
                <div className="h-14 w-full bg-mist-gray/30 animate-pulse rounded-xl shadow-sm" />
              }>
                <SearchBar />
              </Suspense>
            </div>

            {/* Statistics Panel with Washi Aesthetic */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              <div className="card-zen bg-card/80 backdrop-blur-sm hover:bg-accent/5 transition-colors animate-ink-wash">
                <div className="p-6 text-center">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 text-accent" />
                  <div className="text-3xl font-serif font-medium text-foreground mb-1">{stats.entries}</div>
                  <div className="text-sm text-muted-foreground">陶器条目</div>
                </div>
              </div>

              <div className="card-zen bg-card/80 backdrop-blur-sm hover:bg-accent/5 transition-colors animate-ink-wash" style={{ animationDelay: '100ms' }}>
                <div className="p-6 text-center">
                  <Users className="w-10 h-10 mx-auto mb-3 text-accent" />
                  <div className="text-3xl font-serif font-medium text-foreground mb-1">{stats.artists}</div>
                  <div className="text-sm text-muted-foreground">知名作家</div>
                </div>
              </div>

              <div className="card-zen bg-card/80 backdrop-blur-sm hover:bg-accent/5 transition-colors animate-ink-wash" style={{ animationDelay: '200ms' }}>
                <div className="p-6 text-center">
                  <MapPin className="w-10 h-10 mx-auto mb-3 text-accent" />
                  <div className="text-3xl font-serif font-medium text-foreground mb-1">{stats.regions}</div>
                  <div className="text-sm text-muted-foreground">产地地区</div>
                </div>
              </div>

              <div className="card-zen bg-card/80 backdrop-blur-sm hover:bg-accent/5 transition-colors animate-ink-wash" style={{ animationDelay: '300ms' }}>
                <div className="p-6 text-center">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 text-accent" />
                  <div className="text-3xl font-serif font-medium text-foreground mb-1">{stats.categories}</div>
                  <div className="text-sm text-muted-foreground">分类类型</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brush Divider */}
      <div className="container-zen py-0">
        <div className="divider-brush" />
      </div>

      {/* Quick Navigation with Zen Cards */}
      <section className="container-zen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Browse by Region */}
          <div className="card-zen bg-sand/10 hover:bg-sand/15 animate-ink-wash">
            <div className="mb-6">
              <h2 className="text-2xl font-serif font-medium flex items-center gap-3 seasonal-accent">
                <MapPin className="w-6 h-6 text-accent" />
                按产地浏览
              </h2>
            </div>
            <div className="space-y-3 mb-6">
              {topRegions.map(({ name, count }, index) => (
                <Link
                  key={name}
                  href={`/pottery?region=${encodeURIComponent(name)}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 transition-all duration-300 group hover:translate-x-1"
                >
                  <span className="text-foreground/90 group-hover:text-accent transition-colors">
                    {name}
                  </span>
                  <Badge className="bg-accent/15 text-accent border-accent/30 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    {count}
                  </Badge>
                </Link>
              ))}
            </div>
            <Link href="/pottery" className="btn-zen w-full justify-center">
              查看全部产地
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {/* Browse by Category */}
          <div className="card-zen bg-ivory/20 hover:bg-ivory/30 animate-ink-wash" style={{ animationDelay: '100ms' }}>
            <div className="mb-6">
              <h2 className="text-2xl font-serif font-medium flex items-center gap-3 seasonal-accent">
                <Library className="w-6 h-6 text-accent" />
                按分类浏览
              </h2>
            </div>
            <div className="space-y-3 mb-6">
              {topCategories.map(({ name, count }, index) => (
                <Link
                  key={name}
                  href={`/pottery?category=${encodeURIComponent(name)}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 transition-all duration-300 group hover:translate-x-1"
                >
                  <span className="text-foreground/90 group-hover:text-accent transition-colors">
                    {name}
                  </span>
                  <Badge className="bg-accent/15 text-accent border-accent/30 group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    {count}
                  </Badge>
                </Link>
              ))}
            </div>
            <Link href="/pottery" className="btn-zen w-full justify-center">
              查看全部分类
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brush Divider */}
      <div className="container-zen py-0">
        <div className="divider-brush" />
      </div>

      {/* Featured Content with Japanese Aesthetic */}
      {featuredEntries.length > 0 && (
        <section className="container-zen bg-gradient-to-b from-transparent to-sand/5 rounded-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4 animate-ink-wash">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-medium flex items-center gap-3 mb-3 seasonal-accent">
                <Sparkles className="w-10 h-10 text-accent" />
                精选推荐
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                编辑推荐的优质陶艺内容
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="animate-ink-wash"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PotteryCard entry={entry} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Brush Divider */}
      <div className="container-zen py-0">
        <div className="divider-brush" />
      </div>

      {/* Latest Additions with Zen Design */}
      <section className="container-zen">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4 animate-ink-wash">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-medium flex items-center gap-3 mb-3 seasonal-accent">
              <TrendingUp className="w-10 h-10 text-accent" />
              最新添加
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              探索最近更新的陶艺条目
            </p>
          </div>
          <Link href="/pottery" className="btn-zen">
            查看全部
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {latestEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="animate-ink-wash"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <PotteryCard entry={entry} />
            </div>
          ))}
        </div>
      </section>

      {/* Brush Divider */}
      <div className="container-zen py-0">
        <div className="divider-brush" />
      </div>

      {/* Quick Entry with Washi Aesthetic */}
      <section className="container-zen">
        <div className="card-zen bg-gradient-to-br from-sand/20 via-ivory/30 to-sand/20 border-accent/20 animate-ink-wash">
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Link
                href="/guide"
                className="card-zen bg-card flex flex-col items-center p-8 group hover:bg-accent/5 transition-all duration-[600ms]"
              >
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent group-hover:scale-110 transition-all duration-[600ms]">
                  <BookOpen className="w-10 h-10 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <h3 className="font-serif font-medium text-xl text-foreground mb-2 group-hover:text-accent transition-colors">
                  陶艺导览
                </h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  入门指南与基础知识
                </p>
              </Link>

              <Link
                href="/categories"
                className="card-zen bg-card flex flex-col items-center p-8 group hover:bg-accent/5 transition-all duration-[600ms]"
              >
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent group-hover:scale-110 transition-all duration-[600ms]">
                  <Library className="w-10 h-10 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <h3 className="font-serif font-medium text-xl text-foreground mb-2 group-hover:text-accent transition-colors">
                  分类目录
                </h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  按产地和类型浏览
                </p>
              </Link>

              <Link
                href="/techniques"
                className="card-zen bg-card flex flex-col items-center p-8 group hover:bg-accent/5 transition-all duration-[600ms]"
              >
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent group-hover:scale-110 transition-all duration-[600ms]">
                  <Sparkles className="w-10 h-10 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <h3 className="font-serif font-medium text-xl text-foreground mb-2 group-hover:text-accent transition-colors">
                  技法百科
                </h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  传统技法详细解说
                </p>
              </Link>

              <Link
                href="/artists"
                className="card-zen bg-card flex flex-col items-center p-8 group hover:bg-accent/5 transition-all duration-[600ms]"
              >
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent group-hover:scale-110 transition-all duration-[600ms]">
                  <Users className="w-10 h-10 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <h3 className="font-serif font-medium text-xl text-foreground mb-2 group-hover:text-accent transition-colors">
                  陶艺作家
                </h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  探索日本陶艺大师
                </p>
              </Link>

              <Link
                href="/pottery"
                className="card-zen bg-card flex flex-col items-center p-8 group hover:bg-accent/5 transition-all duration-[600ms]"
              >
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent group-hover:scale-110 transition-all duration-[600ms]">
                  <MapPin className="w-10 h-10 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <h3 className="font-serif font-medium text-xl text-foreground mb-2 group-hover:text-accent transition-colors">
                  陶器条目
                </h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  浏览所有陶艺作品
                </p>
              </Link>

              <Link
                href="/about"
                className="card-zen bg-card flex flex-col items-center p-8 group hover:bg-accent/5 transition-all duration-[600ms]"
              >
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent group-hover:scale-110 transition-all duration-[600ms]">
                  <Info className="w-10 h-10 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <h3 className="font-serif font-medium text-xl text-foreground mb-2 group-hover:text-accent transition-colors">
                  关于项目
                </h3>
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  了解知识库详情
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Spacer - Generous Whitespace */}
      <div className="h-24 md:h-32" />
    </div>
  )
}
