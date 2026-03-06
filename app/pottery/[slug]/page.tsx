import { notFound } from 'next/navigation'
import NotionLayout from '@/components/notion-layout/NotionLayout'
import NotionBreadcrumb from '@/components/notion-layout/NotionBreadcrumb'
import { prisma } from '@/lib/db/client'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Tag, User, Flame, Paintbrush, ExternalLink } from 'lucide-react'

async function getPotteryEntry(slug: string) {
  const entry = await prisma.potteryEntry.findUnique({
    where: { slug, published: true },
    include: {
      artist: {
        select: {
          id: true,
          slug: true,
          nameZh: true,
          nameEn: true,
          avatar: true,
        },
      },
    },
  })

  if (!entry) {
    notFound()
  }

  return entry
}

export default async function PotteryDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const entry = await getPotteryEntry(params.slug)

  return (
    <NotionLayout>
      {/* Breadcrumb */}
      <NotionBreadcrumb
        items={[
          { label: '陶器条目', labelJa: '陶器', href: '/pottery' },
          ...(entry.category
            ? [{ label: entry.category.split('/')[0], href: `/pottery?category=${entry.category.split('/')[0]}` }]
            : []),
          { label: entry.nameZh, labelJa: entry.nameJa || undefined },
        ]}
      />

      {/* Title Section */}
      <div className="mb-12">
        <h1 className="font-serif text-5xl md:text-6xl text-ink-dark mb-3 tracking-wide">
          {entry.nameZh}
        </h1>
        {entry.nameJa && (
          <p className="font-serif text-2xl text-ink-light mb-6 tracking-wider">
            {entry.nameJa}
          </p>
        )}
        {entry.nameEn && (
          <p className="font-serif text-xl text-ink-medium mb-6">
            {entry.nameEn}
          </p>
        )}

        {/* Positioning */}
        {entry.positioning && (
          <p className="font-serif text-xl text-ink-dark leading-relaxed max-w-3xl border-l-4 border-clay-terracotta pl-6 py-2">
            {entry.positioning}
          </p>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left Column - Images */}
        <div className="lg:col-span-2 space-y-6">
          {entry.images && entry.images.length > 0 ? (
            <>
              {/* Main Image */}
              <div className="aspect-[21/9] bg-gradient-to-br from-washi-cream to-clay-warm/30 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={entry.images[0] as string}
                  alt={entry.nameZh}
                  width={1200}
                  height={514}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>

              {/* Thumbnail Gallery */}
              {entry.images.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {entry.images.slice(1, 4).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gradient-to-br from-washi-cream to-clay-warm/30 rounded-xl overflow-hidden shadow-md"
                    >
                      <Image
                        src={image as string}
                        alt={`${entry.nameZh} ${index + 2}`}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-[21/9] bg-gradient-to-br from-washi-cream to-clay-warm/30 rounded-2xl flex flex-col items-center justify-center">
              <span className="font-serif text-9xl text-ink-light/20 mb-4">陶</span>
              <span className="font-serif text-sm text-ink-light/60">暂无图片</span>
            </div>
          )}
        </div>

        {/* Right Column - Info Cards */}
        <div className="space-y-6">
          {/* Category */}
          {entry.category && (
            <InfoCard icon={<Tag className="w-5 h-5" />} title="分类">
              <p className="font-serif text-sm text-ink-dark">{entry.category}</p>
            </InfoCard>
          )}

          {/* Region */}
          {entry.region && (
            <InfoCard icon={<MapPin className="w-5 h-5" />} title="地区">
              <p className="font-serif text-sm text-ink-dark">{entry.region}</p>
            </InfoCard>
          )}

          {/* Type */}
          {entry.type && (
            <InfoCard icon={<Flame className="w-5 h-5" />} title="类型">
              <p className="font-serif text-sm text-ink-dark">{entry.type}</p>
            </InfoCard>
          )}

          {/* Artist */}
          {entry.artist && (
            <InfoCard icon={<User className="w-5 h-5" />} title="相关作家">
              <Link
                href={`/artists/${entry.artist.slug}`}
                className="flex items-center gap-3 group"
              >
                {entry.artist.avatar ? (
                  <Image
                    src={entry.artist.avatar}
                    alt={entry.artist.nameZh}
                    width={40}
                    height={40}
                    className="rounded-full border border-clay-warm/30"
                  />
                ) : (
                  <div className="w-10 h-10 bg-clay-warm/30 rounded-full flex items-center justify-center">
                    <span className="font-serif text-sm text-ink-light">
                      {entry.artist.nameZh.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-serif text-sm text-ink-dark group-hover:text-clay-terracotta transition-colors">
                    {entry.artist.nameZh}
                  </p>
                  {entry.artist.nameEn && (
                    <p className="font-serif text-xs text-ink-light">
                      {entry.artist.nameEn}
                    </p>
                  )}
                </div>
              </Link>
            </InfoCard>
          )}

          {/* Keywords */}
          {entry.keywords && entry.keywords.length > 0 && (
            <InfoCard icon={<Paintbrush className="w-5 h-5" />} title="关键词">
              <div className="flex flex-wrap gap-2">
                {(entry.keywords as string[]).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-glaze-celadon/10 text-ink-medium text-xs font-serif rounded-md border border-glaze-celadon/20"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </InfoCard>
          )}
        </div>
      </div>

      {/* Description */}
      {entry.description && (
        <div className="mb-12">
          <h2 className="font-serif text-2xl text-ink-dark mb-6 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-clay-terracotta rounded-full" />
            详细介绍
          </h2>
          <div className="p-8 bg-white/60 border border-ink-light/20 rounded-xl">
            <p className="font-serif text-base text-ink-dark leading-relaxed whitespace-pre-wrap">
              {entry.description}
            </p>
          </div>
        </div>
      )}

      {/* Signature Features */}
      {entry.signatureFeatures && entry.signatureFeatures.length > 0 && (
        <div className="mb-12">
          <h2 className="font-serif text-2xl text-ink-dark mb-6 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-clay-terracotta rounded-full" />
            特征要素
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(entry.signatureFeatures as string[]).map((feature, index) => (
              <div
                key={index}
                className="p-4 bg-white/60 border border-ink-light/20 rounded-lg text-center"
              >
                <p className="font-serif text-sm text-ink-dark">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notable Artists */}
      {entry.notableArtists && entry.notableArtists.length > 0 && (
        <div className="mb-12">
          <h2 className="font-serif text-2xl text-ink-dark mb-6 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-clay-terracotta rounded-full" />
            代表作家
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(entry.notableArtists as string[]).map((artist, index) => (
              <div
                key={index}
                className="p-4 bg-white/60 border border-ink-light/20 rounded-lg"
              >
                <p className="font-serif text-sm text-ink-dark">{artist}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Representative Forms */}
      {entry.representativeForms && entry.representativeForms.length > 0 && (
        <div className="mb-12">
          <h2 className="font-serif text-2xl text-ink-dark mb-6 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-clay-terracotta rounded-full" />
            代表器型
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(entry.representativeForms as string[]).map((form, index) => (
              <div
                key={index}
                className="p-4 bg-white/60 border border-ink-light/20 rounded-lg text-center"
              >
                <p className="font-serif text-sm text-ink-dark">{form}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources */}
      {entry.sources && entry.sources.length > 0 && (
        <div>
          <h2 className="font-serif text-2xl text-ink-dark mb-6 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-clay-terracotta rounded-full" />
            参考资料
          </h2>
          <div className="space-y-3">
            {(entry.sources as any[]).map((source, index) => (
              <div
                key={index}
                className="p-4 bg-white/60 border border-ink-light/20 rounded-lg"
              >
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between group"
                >
                  <span className="font-serif text-sm text-ink-dark group-hover:text-clay-terracotta transition-colors">
                    {source.title}
                  </span>
                  <ExternalLink className="w-4 h-4 text-ink-light group-hover:text-clay-terracotta transition-colors" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </NotionLayout>
  )
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="p-5 bg-white/60 border border-ink-light/20 rounded-xl">
      <div className="flex items-center gap-2 mb-3 text-ink-light">
        {icon}
        <h3 className="font-serif text-xs uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  )
}
