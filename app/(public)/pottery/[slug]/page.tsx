import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db/client'
import { ImageGallery } from '@/components/public/ImageGallery'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, MapPin, Tag, Sparkles, User, BookOpen, ExternalLink } from 'lucide-react'

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
    <div className="min-h-screen washi-texture">
      {/* Breadcrumb with Japanese Aesthetic */}
      <nav className="container-zen pb-0">
        <div className="breadcrumb-zen animate-ink-wash">
          <Link href="/" className="brush-underline">首页</Link>
          <ChevronRight className="w-3 h-3 breadcrumb-zen-separator" />
          <Link href="/pottery" className="brush-underline">陶器条目</Link>
          <ChevronRight className="w-3 h-3 breadcrumb-zen-separator" />
          <span className="text-foreground">{entry.nameZh}</span>
        </div>
      </nav>

      {/* Hero Section - Title with Generous Whitespace */}
      <section className="container-zen pt-8">
        <div className="max-w-4xl stagger-reveal">
          {/* Category Badge */}
          <div className="mb-6">
            <Badge className="bg-accent text-accent-foreground px-4 py-1.5 rounded-full">
              <Sparkles className="w-3 h-3 mr-1.5" />
              {entry.category}
            </Badge>
          </div>

          {/* Title - Vertical Rhythm */}
          <h1 className="text-5xl md:text-6xl font-serif font-medium mb-6 text-balance leading-tight">
            {entry.nameZh}
          </h1>

          {/* Subtitle - Japanese and English Names */}
          <div className="flex flex-col gap-3 text-lg text-muted-foreground mb-8">
            <p className="font-jp tracking-wider">{entry.nameJa}</p>
            {entry.nameEn && (
              <p className="font-serif italic">{entry.nameEn}</p>
            )}
          </div>

          {/* Positioning Statement - Highlighted */}
          <div className="card-zen bg-accent/5 border-accent/20 mb-12">
            <p className="text-lg leading-relaxed text-balance">
              {entry.positioning}
            </p>
          </div>
        </div>
      </section>

      {/* Brush Divider */}
      <div className="container-zen py-0">
        <div className="divider-brush" />
      </div>

      {/* Main Content - Asymmetric Layout */}
      <section className="container-zen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column - Images and Description (8 cols) */}
          <div className="lg:col-span-8 space-zen-y">
            {/* Image Gallery with Organic Shadows */}
            {images.length > 0 && (
              <div className="animate-ink-wash">
                <ImageGallery images={images} />
              </div>
            )}

            {/* Description - Generous Leading */}
            <div className="animate-ink-wash">
              <h2 className="text-2xl font-serif font-medium mb-6 seasonal-accent">
                详细介绍
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-wrap leading-loose text-foreground/90">
                  {entry.description}
                </p>
              </div>
            </div>

            {/* Signature Features - Elegant List */}
            {signatureFeatures.length > 0 && (
              <div className="card-zen animate-ink-wash">
                <h3 className="text-xl font-serif font-medium mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  识别特征
                </h3>
                <ul className="space-y-4">
                  {signatureFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-accent mt-1.5 text-xs">◆</span>
                      <span className="flex-1 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Representative Forms */}
            {representativeForms.length > 0 && representativeForms[0] !== '—' && (
              <div className="card-zen animate-ink-wash bg-sand/10">
                <h3 className="text-xl font-serif font-medium mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  代表器型
                </h3>
                <div className="flex flex-wrap gap-3">
                  {representativeForms.map((form, index) => (
                    <Badge key={index} variant="secondary" className="px-4 py-2 rounded-full">
                      {form}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Metadata (4 cols) */}
          <aside className="lg:col-span-4 space-zen-y">
            {/* Basic Information */}
            <div className="card-zen animate-ink-wash">
              <h3 className="text-lg font-serif font-medium mb-6 pb-4 border-b border-border/50">
                基础信息
              </h3>
              <dl className="space-y-6">
                <div>
                  <dt className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    分类
                  </dt>
                  <dd className="font-medium">{entry.category}</dd>
                </div>

                <div>
                  <dt className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    产地
                  </dt>
                  <dd className="font-medium">{entry.region}</dd>
                </div>

                {entry.artist && (
                  <div>
                    <dt className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      相关作家
                    </dt>
                    <dd>
                      <Link
                        href={`/artists/${entry.artist.slug}`}
                        className="text-accent hover:text-accent-hover brush-underline"
                      >
                        {entry.artist.nameZh}
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Keywords - Organic Tags */}
            {entry.keywords.length > 0 && (
              <div className="card-zen animate-ink-wash bg-ivory/30">
                <h3 className="text-lg font-serif font-medium mb-4">关键词</h3>
                <div className="flex flex-wrap gap-2">
                  {entry.keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="px-3 py-1 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notable Artists */}
            {notableArtists.length > 0 && notableArtists[0] !== '—' && (
              <div className="card-zen animate-ink-wash">
                <h3 className="text-lg font-serif font-medium mb-4">知名作家</h3>
                <ul className="space-y-3">
                  {notableArtists.map((artist, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-accent text-xs mt-1">◆</span>
                      <span className="font-jp">{artist}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sources - Minimal Design */}
            <div className="card-zen animate-ink-wash border-dashed">
              <h3 className="text-lg font-serif font-medium mb-4">参考来源</h3>
              <ul className="space-y-3">
                {sources.map((source, index) => (
                  <li key={index}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:text-accent-hover transition-colors flex items-start gap-2 group"
                    >
                      <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      <span className="brush-underline">{source.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Bottom Spacer - Generous Whitespace */}
      <div className="h-24 md:h-32" />
    </div>
  )
}
