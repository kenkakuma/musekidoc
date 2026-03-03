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
  // 获取所有已发布的作家
  const artists = await prisma.artist.findMany({
    where: {
      published: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // 获取每位作家的相关作品
  const relatedPotteries: Record<string, any[]> = {}

  for (const artist of artists) {
    const potteries = await prisma.potteryEntry.findMany({
      where: {
        artistId: artist.id,
        published: true,
      },
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

    relatedPotteries[artist.id] = potteries
  }

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
    <div className="h-screen flex flex-col">
      {/* 页面标题栏 */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                日本陶艺作家
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                探索当代和传统日本陶艺家的作品与传承
              </p>
            </div>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
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
