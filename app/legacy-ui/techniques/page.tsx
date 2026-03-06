import Link from 'next/link'
import { prisma } from '@/lib/db/client'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Flame, Palette, Hand, Droplets, Sparkles, ArrowRight } from 'lucide-react'
import type { PotteryEntryData } from '@/lib/db/types'

export const metadata = {
  title: '技法百科 - 日本陶艺传统技法',
  description: '了解日本陶艺的传统技法，包括成型、装饰、施釉和烧制技术',
}

async function getTechniquesData() {
  // 获取所有技法相关的条目
  const entries = await prisma.potteryEntry.findMany({
    where: {
      published: true,
      OR: [
        { category: { contains: '技法' } },
        { category: { contains: '技術' } },
      ]
    },
    include: {
      artist: {
        select: {
          id: true,
          slug: true,
          nameZh: true,
          nameJa: true,
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  // 按分类组织数据
  const categories: Record<string, any[]> = {}

  entries.forEach(entry => {
    const category = entry.category
    if (!categories[category]) {
      categories[category] = []
    }
    categories[category].push(entry)
  })

  return {
    entries: entries as unknown as PotteryEntryData[],
    categories,
    totalCount: entries.length
  }
}

// 根据分类名称返回图标
function getCategoryIcon(category: string) {
  if (category.includes('窯変') || category.includes('烧')) return Flame
  if (category.includes('釉')) return Droplets
  if (category.includes('象嵌') || category.includes('装饰')) return Palette
  if (category.includes('朝鮮') || category.includes('传来')) return Sparkles
  return Hand
}

// 根据分类名称返回颜色
function getCategoryColor(category: string, index: number) {
  const colors = ['sand', 'ivory', 'accent']
  if (category.includes('窯変')) return 'accent'
  if (category.includes('釉')) return 'ivory'
  if (category.includes('象嵌')) return 'sand'
  return colors[index % colors.length]
}

export default async function TechniquesPage() {
  const { entries, categories, totalCount } = await getTechniquesData()

  // 对分类进行排序：主分类在前，子分类在后
  const sortedCategories = Object.entries(categories).sort((a, b) => {
    const [catA] = a
    const [catB] = b

    // 主分类（不含 /）排在前面
    const isMainA = !catA.includes('/')
    const isMainB = !catB.includes('/')

    if (isMainA && !isMainB) return -1
    if (!isMainA && isMainB) return 1

    // 同级别按条目数量排序
    return b[1].length - a[1].length
  })

  return (
    <div className="min-h-screen washi-texture">
      {/* Breadcrumb */}
      <nav className="container-zen pb-0">
        <div className="breadcrumb-zen animate-ink-wash">
          <Link href="/" className="brush-underline">首页</Link>
          <ChevronRight className="w-3 h-3 breadcrumb-zen-separator" />
          <span className="text-foreground">技法百科</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-zen pt-8">
        <div className="max-w-4xl stagger-reveal">
          <Badge className="mb-6 bg-accent text-accent-foreground px-4 py-2 rounded-full">
            <Hand className="w-4 h-4 mr-2" />
            传统技法 · {totalCount} 个条目
          </Badge>

          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6 text-balance leading-tight">
            技法百科
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed mb-4">
            探索日本陶艺的传统技法，从经典烧制工艺到独特装饰手法
          </p>
        </div>
      </section>

      {/* Brush Divider */}
      <div className="container-zen py-0">
        <div className="divider-brush" />
      </div>

      {/* Main Content */}
      <section className="container-zen">
        <div className="space-zen-y">
          {sortedCategories.map(([category, items], categoryIndex) => {
            const Icon = getCategoryIcon(category)
            const bgColor = getCategoryColor(category, categoryIndex)
            const isSubCategory = category.includes('/')

            // 提取分类名称的主要部分
            const categoryName = isSubCategory
              ? category.split('/').pop()?.trim() || category
              : category.split('（')[0].trim()

            return (
              <div
                key={category}
                className={`card-zen ${
                  bgColor === 'sand' ? 'bg-sand/10' :
                  bgColor === 'ivory' ? 'bg-ivory/20' :
                  'bg-accent/5 border-accent/20'
                } animate-ink-wash`}
                style={{ animationDelay: `${categoryIndex * 100}ms` }}
              >
                <div className="mb-8">
                  <h2 className={`${
                    isSubCategory ? 'text-2xl' : 'text-3xl'
                  } font-serif font-medium seasonal-accent flex items-center gap-3`}>
                    <Icon className="w-7 h-7 text-accent" />
                    {categoryName}
                  </h2>
                  {isSubCategory && (
                    <p className="text-sm text-muted-foreground mt-2 ml-10">
                      {category.split('/')[0]?.trim()}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((entry: any, index: number) => {
                    const images = entry.images ? (entry.images as any) as any[] : []
                    const firstImage = images[0]

                    return (
                      <Link
                        key={entry.id}
                        href={`/pottery/${entry.slug}`}
                        className="group card-zen bg-card hover:bg-accent/10 transition-all duration-300 hover:-translate-y-1"
                      >
                        {/* 图片 */}
                        {firstImage && (
                          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg mb-4 bg-gradient-to-br from-sand/10 to-ivory/20">
                            <img
                              src={firstImage.url}
                              alt={firstImage.alt || entry.nameZh}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        )}

                        {/* 内容 */}
                        <div className="space-y-3">
                          <h3 className="text-xl font-serif font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2">
                            {entry.nameZh}
                          </h3>

                          <p className="text-sm font-jp text-muted-foreground tracking-wider">
                            {entry.nameJa}
                          </p>

                          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                            {entry.positioning || entry.description.substring(0, 80) + '...'}
                          </p>

                          {/* 标签 */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            <Badge variant="outline" className="px-3 py-1 rounded-full text-xs border-accent/30">
                              {entry.region}
                            </Badge>
                            {entry.keywords.slice(0, 2).map((keyword: string) => (
                              <Badge
                                key={keyword}
                                variant="outline"
                                className="px-2 py-0.5 rounded-full text-xs border-border/50"
                              >
                                {keyword}
                              </Badge>
                            ))}
                          </div>

                          {/* 查看详情 */}
                          <div className="flex items-center gap-2 text-sm text-accent pt-2">
                            <span className="group-hover:underline">查看详情</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* 技法理论知识 */}
          <div className="card-zen bg-gradient-to-br from-sand/20 via-ivory/30 to-sand/20 border-accent/20 animate-ink-wash" style={{ animationDelay: `${sortedCategories.length * 100}ms` }}>
            <h2 className="text-3xl font-serif font-medium mb-8 seasonal-accent flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-accent" />
              技法理论
            </h2>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* 成型技法 */}
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-medium text-foreground flex items-center gap-2">
                  <Hand className="w-5 h-5 text-accent" />
                  成型技法
                </h3>
                <ul className="space-y-3 text-sm text-foreground/90">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">◆</span>
                    <div>
                      <strong className="text-foreground">手捏成型（手びねり）</strong>
                      <p className="text-muted-foreground mt-1">用手直接捏塑，适合不规则造型</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">◆</span>
                    <div>
                      <strong className="text-foreground">轱辘成型（ろくろ）</strong>
                      <p className="text-muted-foreground mt-1">转轮拉坯，制作圆形器物的主要方法</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">◆</span>
                    <div>
                      <strong className="text-foreground">泥条盘筑（ひもづくり）</strong>
                      <p className="text-muted-foreground mt-1">古老技法，适合大型器物</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* 烧成技法 */}
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-medium text-foreground flex items-center gap-2">
                  <Flame className="w-5 h-5 text-accent" />
                  烧成技法
                </h3>
                <ul className="space-y-3 text-sm text-foreground/90">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">◆</span>
                    <div>
                      <strong className="text-foreground">氧化烧成（酸化焼成）</strong>
                      <p className="text-muted-foreground mt-1">供氧充足，釉色明亮清澈</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">◆</span>
                    <div>
                      <strong className="text-foreground">还原烧成（還元焼成）</strong>
                      <p className="text-muted-foreground mt-1">窑内缺氧，产生特殊窑变效果</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">◆</span>
                    <div>
                      <strong className="text-foreground">无釉烧成（焼締）</strong>
                      <p className="text-muted-foreground mt-1">不施釉，依靠火焰自然成釉</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center pt-6 border-t border-border/50">
              <Sparkles className="w-16 h-16 text-accent mx-auto mb-6" />
              <h3 className="text-2xl font-serif font-medium mb-4">
                在作品中发现技法之美
              </h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                这些传统技法在每一件陶器作品中都有所体现，通过浏览具体作品，
                您可以更直观地理解和欣赏这些技艺的精妙之处。
              </p>
              <Link href="/pottery" className="btn-zen inline-flex">
                浏览所有陶器作品
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Spacer */}
      <div className="h-24 md:h-32" />
    </div>
  )
}
