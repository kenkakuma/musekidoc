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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-100 via-orange-50 to-red-50 border-b border-amber-200">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-amber-600 hover:bg-amber-700">
              <Library className="w-3 h-3 mr-1" />
              日本陶艺知识库
            </Badge>
            <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              探索日本陶艺之美
            </h1>
            <p className="text-xl text-slate-700 mb-8 leading-relaxed">
              从传统技法到现代创作，深入了解日本陶器的历史、产地与名家作品
            </p>

            {/* 搜索栏 */}
            <div className="max-w-2xl mx-auto mb-8">
              <Suspense fallback={
                <div className="h-14 w-full bg-white/50 animate-pulse rounded-lg shadow-sm" />
              }>
                <SearchBar />
              </Suspense>
            </div>

            {/* 统计面板 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
                <CardContent className="pt-6 pb-4 text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                  <div className="text-2xl font-bold text-slate-900">{stats.entries}</div>
                  <div className="text-sm text-slate-600">陶器条目</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardContent className="pt-6 pb-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-slate-900">{stats.artists}</div>
                  <div className="text-sm text-slate-600">知名作家</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-red-200">
                <CardContent className="pt-6 pb-4 text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold text-slate-900">{stats.regions}</div>
                  <div className="text-sm text-slate-600">产地地区</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
                <CardContent className="pt-6 pb-4 text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                  <div className="text-2xl font-bold text-slate-900">{stats.categories}</div>
                  <div className="text-sm text-slate-600">分类类型</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 快速导航 */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* 按产地浏览 */}
          <Card className="border-2 hover:border-amber-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                按产地浏览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topRegions.map(({ name, count }) => (
                  <Link
                    key={name}
                    href={`/pottery?region=${encodeURIComponent(name)}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-amber-50 transition-colors group"
                  >
                    <span className="text-slate-700 group-hover:text-amber-900">
                      {name}
                    </span>
                    <Badge variant="secondary" className="group-hover:bg-amber-200">
                      {count}
                    </Badge>
                  </Link>
                ))}
              </div>
              <Button variant="link" className="w-full mt-4 text-amber-700" asChild>
                <Link href="/pottery">
                  查看全部产地
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* 按分类浏览 */}
          <Card className="border-2 hover:border-orange-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="w-5 h-5 text-orange-600" />
                按分类浏览
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topCategories.map(({ name, count }) => (
                  <Link
                    key={name}
                    href={`/pottery?category=${encodeURIComponent(name)}`}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-orange-50 transition-colors group"
                  >
                    <span className="text-slate-700 group-hover:text-orange-900">
                      {name}
                    </span>
                    <Badge variant="secondary" className="group-hover:bg-orange-200">
                      {count}
                    </Badge>
                  </Link>
                ))}
              </div>
              <Button variant="link" className="w-full mt-4 text-orange-700" asChild>
                <Link href="/pottery">
                  查看全部分类
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 精选内容 */}
      {featuredEntries.length > 0 && (
        <section className="container mx-auto px-4 py-12 bg-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-amber-600" />
                精选推荐
              </h2>
              <p className="text-slate-600 mt-2">编辑推荐的优质陶艺内容</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEntries.map((entry) => (
              <PotteryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      )}

      {/* 最新添加 */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              最新添加
            </h2>
            <p className="text-slate-600 mt-2">探索最近更新的陶艺条目</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/pottery">
              查看全部
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestEntries.map((entry) => (
            <PotteryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      {/* 快速入口 */}
      <section className="container mx-auto px-4 py-12 mb-12">
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
          <CardContent className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Link
                href="/artists"
                className="flex flex-col items-center p-6 bg-white rounded-lg hover:shadow-lg transition-all group"
              >
                <Users className="w-12 h-12 text-amber-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg text-slate-900 mb-1">
                  陶艺作家
                </h3>
                <p className="text-sm text-slate-600 text-center">
                  探索日本陶艺大师
                </p>
              </Link>

              <Link
                href="/pottery"
                className="flex flex-col items-center p-6 bg-white rounded-lg hover:shadow-lg transition-all group"
              >
                <BookOpen className="w-12 h-12 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg text-slate-900 mb-1">
                  陶器条目
                </h3>
                <p className="text-sm text-slate-600 text-center">
                  浏览所有陶艺作品
                </p>
              </Link>

              <Link
                href="/about"
                className="flex flex-col items-center p-6 bg-white rounded-lg hover:shadow-lg transition-all group"
              >
                <Info className="w-12 h-12 text-red-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-lg text-slate-900 mb-1">
                  关于项目
                </h3>
                <p className="text-sm text-slate-600 text-center">
                  了解知识库详情
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
