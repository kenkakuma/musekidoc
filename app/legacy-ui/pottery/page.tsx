import { Suspense } from 'react'
import { prisma } from '@/lib/db/client'
import { PotteryCard } from '@/components/public/PotteryCard'
import { SearchBar } from '@/components/public/SearchBar'
import type { PotteryEntryData } from '@/lib/db/types'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PotteryPageProps {
  searchParams: {
    page?: string
    search?: string
    category?: string
    region?: string
  }
}

async function getEntries(searchParams: PotteryPageProps['searchParams']) {
  const page = parseInt(searchParams.page || '1')
  const pageSize = 12
  const search = searchParams.search || ''
  const category = searchParams.category || ''
  const region = searchParams.region || ''

  // 构建 where 条件
  const where: any = {
    published: true,
  }

  if (category) {
    where.category = { contains: category }
  }

  if (region) {
    where.region = { contains: region }
  }

  if (search) {
    where.OR = [
      { nameZh: { contains: search, mode: 'insensitive' } },
      { nameJa: { contains: search } },
      { nameEn: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  // 查询总数
  const total = await prisma.potteryEntry.count({ where })

  // 分页查询
  const entries = await prisma.potteryEntry.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
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

  return {
    entries: entries as unknown as PotteryEntryData[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export default async function PotteryPage({ searchParams }: PotteryPageProps) {
  const { entries, total, page, totalPages } = await getEntries(searchParams)

  // 构建分页 URL
  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams()
    if (searchParams.search) params.set('search', searchParams.search)
    if (searchParams.category) params.set('category', searchParams.category)
    if (searchParams.region) params.set('region', searchParams.region)
    if (newPage > 1) params.set('page', newPage.toString())
    return `/pottery?${params.toString()}`
  }

  // 移除筛选条件
  const removeFilter = (filterType: 'category' | 'region' | 'search') => {
    const params = new URLSearchParams()
    if (filterType !== 'search' && searchParams.search) params.set('search', searchParams.search)
    if (filterType !== 'category' && searchParams.category) params.set('category', searchParams.category)
    if (filterType !== 'region' && searchParams.region) params.set('region', searchParams.region)
    return `/pottery?${params.toString()}`
  }

  const hasFilters = searchParams.search || searchParams.category || searchParams.region

  return (
    <div className="min-h-screen washi-texture">
      {/* Breadcrumb Navigation with Japanese Aesthetic */}
      <nav className="container-zen pb-0">
        <div className="breadcrumb-zen animate-ink-wash">
          <Link href="/" className="brush-underline">首页</Link>
          <ChevronRight className="w-3 h-3 breadcrumb-zen-separator" />
          <span className="text-foreground">陶器条目</span>
        </div>
      </nav>

      {/* Hero Section - Title and Search */}
      <section className="container-zen pt-8">
        <div className="max-w-4xl stagger-reveal">
          {/* Page Title with Generous Spacing */}
          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-8 text-balance leading-tight animate-ink-wash">
            陶器作品集
          </h1>

          {/* Search Bar with Zen Styling */}
          <Suspense fallback={
            <div className="h-14 w-full max-w-2xl bg-mist-gray/30 animate-pulse rounded-xl mb-6" />
          }>
            <SearchBar />
          </Suspense>
        </div>
      </section>

      {/* Brush Divider */}
      <div className="container-zen py-0">
        <div className="divider-brush" />
      </div>

      {/* Main Content */}
      <section className="container-zen">
        {/* Filter Tags with Elegant Design */}
        <div className="flex items-start justify-between mb-12 flex-wrap gap-4 animate-ink-wash">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Filter className="w-5 h-5 text-accent" />
            <span className="text-base">
              找到 <span className="font-semibold text-foreground">{total}</span> 个条目
            </span>
          </div>

          {hasFilters && (
            <div className="flex items-center gap-3 flex-wrap">
              {searchParams.search && (
                <Badge className="bg-accent/10 text-accent border-accent/30 px-4 py-2 rounded-full gap-2 hover:bg-accent/20 transition-colors">
                  搜索: {searchParams.search}
                  <Link href={removeFilter('search')}>
                    <X className="w-3.5 h-3.5 hover:text-accent-hover transition-colors" />
                  </Link>
                </Badge>
              )}
              {searchParams.category && (
                <Badge className="bg-accent/10 text-accent border-accent/30 px-4 py-2 rounded-full gap-2 hover:bg-accent/20 transition-colors">
                  分类: {searchParams.category}
                  <Link href={removeFilter('category')}>
                    <X className="w-3.5 h-3.5 hover:text-accent-hover transition-colors" />
                  </Link>
                </Badge>
              )}
              {searchParams.region && (
                <Badge className="bg-accent/10 text-accent border-accent/30 px-4 py-2 rounded-full gap-2 hover:bg-accent/20 transition-colors">
                  产地: {searchParams.region}
                  <Link href={removeFilter('region')}>
                    <X className="w-3.5 h-3.5 hover:text-accent-hover transition-colors" />
                  </Link>
                </Badge>
              )}
              <Link
                href="/pottery"
                className="text-sm text-accent hover:text-accent-hover brush-underline transition-colors"
              >
                清除全部
              </Link>
            </div>
          )}
        </div>

        {/* Pottery Cards Grid with Stagger Animation */}
        {entries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className="animate-ink-wash"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PotteryCard entry={entry} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card-zen text-center py-24 bg-accent/5 border-accent/20 animate-ink-wash">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-mist-gray/50 flex items-center justify-center">
                <Filter className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                暂无符合条件的陶器条目
              </p>
              <Link
                href="/pottery"
                className="btn-zen inline-flex"
              >
                返回全部条目
              </Link>
            </div>
          </div>
        )}

        {/* Pagination with Zen Button Styling */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 animate-ink-wash">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              asChild={page > 1}
              className="btn-zen"
            >
              {page > 1 ? (
                <Link href={buildPageUrl(page - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一页
                </Link>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一页
                </>
              )}
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }

                const isActive = page === pageNum

                return (
                  <Button
                    key={pageNum}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    asChild={!isActive}
                    className={isActive ? 'bg-accent text-accent-foreground hover:bg-accent-hover' : 'btn-zen'}
                  >
                    {!isActive ? (
                      <Link href={buildPageUrl(pageNum)}>{pageNum}</Link>
                    ) : (
                      <span>{pageNum}</span>
                    )}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              asChild={page < totalPages}
              className="btn-zen"
            >
              {page < totalPages ? (
                <Link href={buildPageUrl(page + 1)}>
                  下一页
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              ) : (
                <>
                  下一页
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        )}
      </section>

      {/* Bottom Spacer - Generous Whitespace */}
      <div className="h-24 md:h-32" />
    </div>
  )
}
