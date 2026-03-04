import Link from 'next/link'
import { prisma } from '@/lib/db/client'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, MapPin, Layers, TrendingUp, ArrowRight } from 'lucide-react'

export const metadata = {
  title: '分类目录 - 按产地和类型浏览',
  description: '按产地、分类浏览所有日本陶器条目，发现您感兴趣的陶艺作品',
}

async function getCategoriesData() {
  const entries = await prisma.potteryEntry.findMany({
    where: { published: true },
    select: {
      id: true,
      slug: true,
      nameZh: true,
      nameJa: true,
      category: true,
      region: true,
      keywords: true,
      images: true,
    },
  })

  // 统计产地
  const regionCounts = entries.reduce((acc, entry) => {
    acc[entry.region] = (acc[entry.region] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const regions = Object.entries(regionCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }))

  // 统计分类
  const categoryCounts = entries.reduce((acc, entry) => {
    const mainCategory = entry.category.split('/')[0]
    acc[mainCategory] = (acc[mainCategory] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({ name, count }))

  // 热门关键词
  const keywordCounts = entries.reduce((acc, entry) => {
    entry.keywords.forEach(keyword => {
      acc[keyword] = (acc[keyword] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const topKeywords = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }))

  return {
    regions,
    categories,
    topKeywords,
    totalEntries: entries.length,
  }
}

export default async function CategoriesPage() {
  const { regions, categories, topKeywords, totalEntries } = await getCategoriesData()

  return (
    <div className="min-h-screen washi-texture">
      {/* Breadcrumb */}
      <nav className="container-zen pb-0">
        <div className="breadcrumb-zen animate-ink-wash">
          <Link href="/" className="brush-underline">首页</Link>
          <ChevronRight className="w-3 h-3 breadcrumb-zen-separator" />
          <span className="text-foreground">分类目录</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-zen pt-8">
        <div className="max-w-4xl stagger-reveal">
          <Badge className="mb-6 bg-accent text-accent-foreground px-4 py-2 rounded-full">
            <Layers className="w-4 h-4 mr-2" />
            分类浏览
          </Badge>

          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6 text-balance leading-tight">
            分类目录
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed mb-4">
            按产地、分类、关键词浏览 {totalEntries} 个陶器条目
          </p>
        </div>
      </section>

      {/* Brush Divider */}
      <div className="container-zen py-0">
        <div className="divider-brush" />
      </div>

      {/* Main Content */}
      <section className="container-zen">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* 按产地浏览 */}
          <div className="lg:col-span-2 space-y-8">
            <div className="card-zen bg-sand/10 animate-ink-wash">
              <h2 className="text-3xl font-serif font-medium mb-8 seasonal-accent flex items-center gap-3">
                <MapPin className="w-8 h-8 text-accent" />
                按产地浏览
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {regions.map(({ name, count }, index) => (
                  <Link
                    key={name}
                    href={`/pottery?region=${encodeURIComponent(name)}`}
                    className="group card-zen bg-card hover:bg-accent/10 transition-all duration-300 hover:translate-x-1 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-serif font-medium text-lg text-foreground group-hover:text-accent transition-colors mb-2">
                          {name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {count} 个条目
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-accent/40 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 按分类浏览 */}
            <div className="card-zen bg-ivory/20 animate-ink-wash" style={{ animationDelay: '100ms' }}>
              <h2 className="text-3xl font-serif font-medium mb-8 seasonal-accent flex items-center gap-3">
                <Layers className="w-8 h-8 text-accent" />
                按分类浏览
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {categories.map(({ name, count }) => (
                  <Link
                    key={name}
                    href={`/pottery?category=${encodeURIComponent(name)}`}
                    className="group card-zen bg-card hover:bg-accent/10 transition-all duration-300 hover:translate-x-1 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-serif font-medium text-lg text-foreground group-hover:text-accent transition-colors mb-2">
                          {name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {count} 个条目
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-accent/40 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 侧边栏 - 热门关键词 */}
          <aside className="space-y-8">
            <div className="card-zen bg-accent/5 border-accent/20 sticky top-8 animate-ink-wash" style={{ animationDelay: '200ms' }}>
              <h2 className="text-2xl font-serif font-medium mb-6 seasonal-accent flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-accent" />
                热门关键词
              </h2>

              <div className="flex flex-wrap gap-2">
                {topKeywords.map(({ name, count }) => (
                  <Link
                    key={name}
                    href={`/pottery?search=${encodeURIComponent(name)}`}
                  >
                    <Badge
                      variant="outline"
                      className="px-4 py-2 rounded-full hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all cursor-pointer"
                    >
                      {name}
                      <span className="ml-2 text-xs opacity-60">{count}</span>
                    </Badge>
                  </Link>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border/50">
                <Link
                  href="/pottery"
                  className="btn-zen w-full justify-center"
                >
                  浏览全部条目
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Bottom Spacer */}
      <div className="h-24 md:h-32" />
    </div>
  )
}
