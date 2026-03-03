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
    <div className="min-h-screen bg-slate-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <nav className="text-sm text-slate-600 mb-4">
              <Link href="/" className="hover:text-amber-600">首页</Link>
              <span className="mx-2">/</span>
              <span>陶器条目</span>
            </nav>

            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              陶器条目
            </h1>

            {/* 搜索栏 */}
            <Suspense fallback={
              <div className="h-12 w-full bg-slate-100 animate-pulse rounded-md mb-4" />
            }>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 筛选条件标签 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Filter className="w-4 h-4" />
              <span>找到 <span className="font-semibold text-slate-900">{total}</span> 个条目</span>
            </div>

            {hasFilters && (
              <div className="flex items-center gap-2">
                {searchParams.search && (
                  <Badge variant="secondary" className="gap-1">
                    搜索: {searchParams.search}
                    <Link href={removeFilter('search')}>
                      <X className="w-3 h-3 hover:text-red-600" />
                    </Link>
                  </Badge>
                )}
                {searchParams.category && (
                  <Badge variant="secondary" className="gap-1">
                    分类: {searchParams.category}
                    <Link href={removeFilter('category')}>
                      <X className="w-3 h-3 hover:text-red-600" />
                    </Link>
                  </Badge>
                )}
                {searchParams.region && (
                  <Badge variant="secondary" className="gap-1">
                    产地: {searchParams.region}
                    <Link href={removeFilter('region')}>
                      <X className="w-3 h-3 hover:text-red-600" />
                    </Link>
                  </Badge>
                )}
                <Link
                  href="/pottery"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  清除全部
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 陶器卡片网格 */}
        {entries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {entries.map((entry) => (
              <PotteryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg">
            <p className="text-slate-500 text-lg mb-4">暂无符合条件的陶器条目</p>
            <Link
              href="/pottery"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              返回全部条目
            </Link>
          </div>
        )}

        {/* 分页控制 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              asChild={page > 1}
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

            <div className="flex items-center gap-1">
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

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    asChild={page !== pageNum}
                  >
                    {page !== pageNum ? (
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
      </div>
    </div>
  )
}
