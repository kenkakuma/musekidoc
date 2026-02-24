import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db/client'
import { ImageGallery } from '@/components/public/ImageGallery'
import { PotteryCard } from '@/components/public/PotteryCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Metadata } from 'next'
import Link from 'next/link'

interface ArtistDetailPageProps {
  params: {
    slug: string
  }
}

// 生成 SEO 元数据
export async function generateMetadata({ params }: ArtistDetailPageProps): Promise<Metadata> {
  const artist = await prisma.artist.findUnique({
    where: { slug: params.slug },
  })

  if (!artist) {
    return {
      title: '作家不存在',
    }
  }

  return {
    title: `${artist.nameZh} - 日本陶器知识库`,
    description: artist.bio.substring(0, 160),
    openGraph: {
      title: artist.nameZh,
      description: artist.bio.substring(0, 160),
    },
  }
}

// 预渲染热门作家（前 50 个）
export async function generateStaticParams() {
  const artists = await prisma.artist.findMany({
    where: { published: true },
    select: { slug: true },
    take: 50,
    orderBy: { createdAt: 'desc' },
  })

  return artists.map((artist) => ({
    slug: artist.slug,
  }))
}

export default async function ArtistDetailPage({ params }: ArtistDetailPageProps) {
  const artist = await prisma.artist.findUnique({
    where: { slug: params.slug },
  })

  if (!artist || !artist.published) {
    notFound()
  }

  // 获取该作家的相关陶器作品
  const relatedPotteries = await prisma.potteryEntry.findMany({
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

  const images = artist.images ? (artist.images as any) as any[] : []

  // 计算年龄/时期
  const yearInfo = () => {
    if (artist.birthYear && artist.deathYear) {
      return `${artist.birthYear} - ${artist.deathYear}`
    } else if (artist.birthYear) {
      const age = new Date().getFullYear() - artist.birthYear
      return `${artist.birthYear} 年生 (现年 ${age} 岁)`
    }
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 面包屑 */}
      <nav className="text-sm text-slate-600 mb-6">
        <Link href="/" className="hover:text-blue-600">首页</Link>
        <span className="mx-2">/</span>
        <Link href="/artists" className="hover:text-blue-600">作家</Link>
        <span className="mx-2">/</span>
        <span>{artist.nameZh}</span>
      </nav>

      {/* 主标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{artist.nameZh}</h1>
        <div className="flex items-center gap-3 text-slate-600">
          <span className="font-jp">{artist.nameJa}</span>
          {artist.nameEn && (
            <>
              <span>·</span>
              <span>{artist.nameEn}</span>
            </>
          )}
        </div>
        {yearInfo() && (
          <p className="text-slate-600 mt-2">{yearInfo()}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：图片和简介 */}
        <div className="lg:col-span-2">
          {/* 头像/作品图片 */}
          {artist.avatar || images.length > 0 ? (
            images.length > 0 ? (
              <ImageGallery images={images} />
            ) : (
              <div className="aspect-square w-full max-w-md mx-auto overflow-hidden rounded-lg bg-slate-100 mb-8">
                <img
                  src={artist.avatar!}
                  alt={artist.nameZh}
                  className="w-full h-full object-cover"
                />
              </div>
            )
          ) : (
            <div className="aspect-square w-full max-w-md mx-auto bg-slate-100 rounded-lg flex items-center justify-center mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          )}

          {/* 简介 */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">艺术家简介</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {artist.bio}
              </p>
            </div>
          </div>

          {/* 相关作品 */}
          {relatedPotteries.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">相关陶器作品</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPotteries.map((pottery) => (
                  <PotteryCard key={pottery.id} entry={pottery as any} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：基础信息 */}
        <div className="space-y-6">
          {/* 基础信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基础信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {artist.birthYear && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">出生年份</p>
                  <p className="font-medium">{artist.birthYear} 年</p>
                </div>
              )}

              {artist.deathYear && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">逝世年份</p>
                  <p className="font-medium">{artist.deathYear} 年</p>
                </div>
              )}

              {artist.exhibitionCount !== null && artist.exhibitionCount !== undefined && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">展览次数</p>
                  <p className="font-medium">{artist.exhibitionCount} 次</p>
                </div>
              )}

              {artist.avgPriceRange && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">作品价格范围</p>
                  <p className="font-medium">{artist.avgPriceRange}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 在线资源 */}
          {(artist.websiteUrl || artist.instagramHandle) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">在线资源</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {artist.websiteUrl && (
                  <div>
                    <a
                      href={artist.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <span>🌐</span>
                      <span>官方网站</span>
                    </a>
                  </div>
                )}

                {artist.instagramHandle && (
                  <div>
                    <a
                      href={`https://instagram.com/${artist.instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <span>📷</span>
                      <span>Instagram @{artist.instagramHandle}</span>
                    </a>
                    {artist.instagramFollowers && (
                      <p className="text-sm text-slate-500 ml-6 mt-1">
                        {artist.instagramFollowers.toLocaleString()} 粉丝
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
