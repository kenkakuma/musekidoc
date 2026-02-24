import { Suspense } from 'react'
import { prisma } from '@/lib/db/client'
import { PotteryCard } from '@/components/public/PotteryCard'
import { SearchBar } from '@/components/public/SearchBar'
import type { PotteryEntryData } from '@/lib/db/types'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HomePageProps {
  searchParams: {
    page?: string
    search?: string
    category?: string
    region?: string
  }
}

async function getEntries(searchParams: HomePageProps['searchParams']) {
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

export default async function HomePage({ searchParams }: HomePageProps) {
  const { entries, total, page, totalPages } = await getEntries(searchParams)

  // 构建分页 URL
  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams()
    if (searchParams.search) params.set('search', searchParams.search)
    if (searchParams.category) params.set('category', searchParams.category)
    if (searchParams.region) params.set('region', searchParams.region)
    if (newPage > 1) params.set('page', newPage.toString())
    return `/?${params.toString()}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题和简介 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          探索日本陶艺之美
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          从传统技法到现代创作，深入了解日本陶器的历史、产地与名家作品
        </p>
      </div>

      {/* 搜索栏 */}
      <div className="flex justify-center mb-8">
        <Suspense fallback={<div className="h-12 w-full max-w-2xl bg-slate-100 animate-pulse rounded-md" />}>
          <SearchBar />
        </Suspense>
      </div>

      {/* 结果统计 */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-600">
          找到 <span className="font-semibold text-slate-900">{total}</span> 个陶器条目
        </p>
        {searchParams.search && (
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            清除搜索
          </Link>
        )}
      </div>

      {/* 陶器卡片网格 */}
      {entries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {entries.map((entry) => (
            <PotteryCard key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg">暂无符合条件的陶器条目</p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 mt-4 inline-block"
          >
            返回首页
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
  )
}
