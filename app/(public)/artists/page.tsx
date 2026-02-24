import { prisma } from '@/lib/db/client'
import { ArtistCard } from '@/components/public/ArtistCard'
import type { ArtistData } from '@/lib/db/types'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ArtistsPageProps {
  searchParams: {
    page?: string
  }
}

async function getArtists(searchParams: ArtistsPageProps['searchParams']) {
  const page = parseInt(searchParams.page || '1')
  const pageSize = 12

  // 构建 where 条件
  const where: any = {
    published: true,
  }

  // 查询总数
  const total = await prisma.artist.count({ where })

  // 分页查询
  const artists = await prisma.artist.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  })

  return {
    artists: artists as unknown as ArtistData[],
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export default async function ArtistsPage({ searchParams }: ArtistsPageProps) {
  const { artists, total, page, totalPages } = await getArtists(searchParams)

  // 构建分页 URL
  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams()
    if (newPage > 1) params.set('page', newPage.toString())
    return `/artists?${params.toString()}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题和简介 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          日本陶艺作家
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          探索当代和传统日本陶艺家的作品与传承
        </p>
      </div>

      {/* 结果统计 */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-600">
          找到 <span className="font-semibold text-slate-900">{total}</span> 位作家
        </p>
      </div>

      {/* 作家卡片网格 */}
      {artists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg">暂无作家信息</p>
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
