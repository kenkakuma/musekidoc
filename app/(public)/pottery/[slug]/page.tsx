import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db/client'
import { ImageGallery } from '@/components/public/ImageGallery'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Metadata } from 'next'
import Link from 'next/link'

interface DetailPageProps {
  params: {
    slug: string
  }
}

// 生成 SEO 元数据
export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const entry = await prisma.potteryEntry.findUnique({
    where: { slug: params.slug },
  })

  if (!entry) {
    return {
      title: '条目不存在',
    }
  }

  return {
    title: `${entry.nameZh} - 日本陶器知识库`,
    description: entry.positioning || entry.description.substring(0, 160),
    openGraph: {
      title: entry.nameZh,
      description: entry.positioning,
    },
  }
}

// 预渲染热门条目（前 50 个）
export async function generateStaticParams() {
  const entries = await prisma.potteryEntry.findMany({
    where: { published: true },
    select: { slug: true },
    take: 50,
    orderBy: { createdAt: 'desc' },
  })

  return entries.map((entry) => ({
    slug: entry.slug,
  }))
}

export default async function PotteryDetailPage({ params }: DetailPageProps) {
  const entry = await prisma.potteryEntry.findUnique({
    where: { slug: params.slug },
    include: {
      artist: true,
    },
  })

  if (!entry || !entry.published) {
    notFound()
  }

  const signatureFeatures = (entry.signatureFeatures as any) as string[]
  const notableArtists = (entry.notableArtists as any) as string[]
  const representativeForms = (entry.representativeForms as any) as string[]
  const sources = (entry.sources as any) as { title: string; url: string }[]
  const images = entry.images ? (entry.images as any) as any[] : []

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 面包屑 */}
      <nav className="text-sm text-slate-600 mb-6">
        <Link href="/" className="hover:text-blue-600">首页</Link>
        <span className="mx-2">/</span>
        <span>{entry.nameZh}</span>
      </nav>

      {/* 主标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{entry.nameZh}</h1>
        <div className="flex items-center gap-3 text-slate-600">
          <span className="font-jp">{entry.nameJa}</span>
          {entry.nameEn && (
            <>
              <span>·</span>
              <span>{entry.nameEn}</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：图片 */}
        <div className="lg:col-span-2">
          <ImageGallery images={images} />

          {/* 描述 */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">详细介绍</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                {entry.description}
              </p>
            </div>
          </div>
        </div>

        {/* 右侧：基础信息 */}
        <div className="space-y-6">
          {/* 基础信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基础信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">分类</p>
                <p className="font-medium">{entry.category}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">产地</p>
                <p className="font-medium">{entry.region}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-1">定位</p>
                <p className="text-sm">{entry.positioning}</p>
              </div>

              {entry.artist && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">相关作家</p>
                  <Link
                    href={`/artists/${entry.artist.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    {entry.artist.nameZh}
                  </Link>
                </div>
              )}

              {/* 关键词 */}
              <div>
                <p className="text-sm text-slate-500 mb-2">关键词</p>
                <div className="flex flex-wrap gap-2">
                  {entry.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 识别特征 */}
          {signatureFeatures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">识别特征</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {signatureFeatures.map((feature, index) => (
                    <li key={index} className="text-sm flex">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 知名作家 */}
          {notableArtists.length > 0 && notableArtists[0] !== '—' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">知名作家</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {notableArtists.map((artist, index) => (
                    <li key={index} className="text-sm flex">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{artist}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 代表器型 */}
          {representativeForms.length > 0 && representativeForms[0] !== '—' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">代表器型</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {representativeForms.map((form, index) => (
                    <li key={index} className="text-sm flex">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>{form}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 来源 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">参考来源</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sources.map((source, index) => (
                  <li key={index} className="text-sm">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-start"
                    >
                      <span className="mr-2">🔗</span>
                      <span>{source.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
