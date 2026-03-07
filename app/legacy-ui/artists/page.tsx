import { prisma } from '@/lib/db/client'
import type { ArtistData } from '@/lib/db/types'
import { ArtistsLayout } from '@/components/public/ArtistsLayout'
import Link from 'next/link'

interface ArtistsPageProps {
  searchParams: {
    artist?: string
  }
}

async function getArtistsWithRelatedWorks() {
  // 一次性获取所有作家及其相关作品（解决 N+1 查询问题）
  const artists = await prisma.artist.findMany({
    where: {
      published: true,
    },
    include: {
      potteryEntries: {
        where: {
          published: true,
        },
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          slug: true,
          nameZh: true,
          nameJa: true,
          positioning: true,
          description: true,
          region: true,
          keywords: true,
          images: true,
          createdAt: true,
          artist: {
            select: {
              id: true,
              slug: true,
              nameZh: true,
              nameJa: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // 转换为原有的数据结构格式
  const relatedPotteries: Record<string, any[]> = {}
  artists.forEach(artist => {
    relatedPotteries[artist.id] = artist.potteryEntries
  })

  return {
    artists: artists as unknown as ArtistData[],
    relatedPotteries,
  }
}

export default async function ArtistsPage({ searchParams }: ArtistsPageProps) {
  const { artists, relatedPotteries } = await getArtistsWithRelatedWorks()

  if (artists.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">暂无作家信息</h1>
        <p className="text-slate-600 mb-8">
          目前还没有添加任何作家信息
        </p>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 underline"
        >
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col washi-texture">
      {/* 页面标题栏 with Japanese Aesthetic */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 px-10 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-medium text-foreground mb-2 tracking-wide seasonal-accent">
                日本陶艺作家
              </h1>
              <p className="text-base text-muted-foreground font-serif tracking-wide leading-relaxed">
                探索当代和传统日本陶艺家的作品与传承
              </p>
            </div>
            <Link
              href="/"
              className="text-base text-accent hover:text-accent-hover font-serif tracking-wide brush-underline"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <ArtistsLayout
        artists={artists}
        initialSelectedSlug={searchParams.artist}
        relatedPotteries={relatedPotteries}
      />
    </div>
  )
}
