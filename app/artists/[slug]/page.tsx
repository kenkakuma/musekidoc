import { notFound } from 'next/navigation'
import NotionLayout from '@/components/notion-layout/NotionLayout'
import NotionBreadcrumb from '@/components/notion-layout/NotionBreadcrumb'
import { prisma } from '@/lib/db/client'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Award, Calendar, MapPin, Palette } from 'lucide-react'

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      if (typeof item === 'number') return String(item)
      return ''
    })
    .filter((item) => item.length > 0)
}

function normalizeExhibitions(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim()

      if (item && typeof item === 'object') {
        const record = item as { year?: unknown; title?: unknown; venue?: unknown }
        const year =
          typeof record.year === 'number' || typeof record.year === 'string'
            ? String(record.year).trim()
            : ''
        const title = typeof record.title === 'string' ? record.title.trim() : ''
        const venue = typeof record.venue === 'string' ? record.venue.trim() : ''

        return [year, title, venue].filter(Boolean).join(' · ')
      }

      return ''
    })
    .filter((item) => item.length > 0)
}

async function getArtist(slug: string) {
  const artist = await prisma.artist.findUnique({
    where: { slug, published: true },
    include: {
      potteryEntries: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          slug: true,
          nameZh: true,
          nameJa: true,
          category: true,
          positioning: true,
          images: true,
          keywords: true,
        },
      },
    },
  })

  if (!artist) {
    notFound()
  }

  return artist
}

export default async function ArtistDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const artist = await getArtist(params.slug)
  const awards = normalizeStringList(artist.awards)
  const exhibitions = normalizeExhibitions(artist.exhibitions)

  return (
    <NotionLayout>
      {/* Breadcrumb */}
      <NotionBreadcrumb
        items={[
          { label: '陶艺作家', labelJa: '陶芸作家', href: '/artists' },
          { label: artist.nameZh, labelJa: artist.nameJa || undefined },
        ]}
      />

      {/* Artist Header */}
      <div className="mb-12">
        <div className="flex items-start gap-8 mb-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative w-40 h-40">
              {artist.avatar ? (
                <Image
                  src={artist.avatar}
                  alt={artist.nameZh}
                  fill
                  className="object-cover rounded-2xl border-2 border-clay-warm/30 shadow-lg"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-washi-cream to-clay-warm/30 rounded-2xl flex items-center justify-center border-2 border-clay-warm/30">
                  <span className="font-serif text-6xl text-ink-light/40">
                    {artist.nameZh.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="font-serif text-5xl text-ink-dark mb-2 tracking-wide">
              {artist.nameZh}
            </h1>
            {artist.nameEn && (
              <p className="font-serif text-2xl text-ink-light mb-6 tracking-wider">
                {artist.nameEn}
              </p>
            )}

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {(artist.birthYear || artist.deathYear) && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-ink-light mt-0.5" />
                  <div>
                    <div className="font-serif text-xs text-ink-light mb-1">年代</div>
                    <div className="font-serif text-sm text-ink-dark">
                      {artist.birthYear && <span>{artist.birthYear}</span>}
                      {artist.birthYear && artist.deathYear && <span> - </span>}
                      {artist.deathYear && <span>{artist.deathYear}</span>}
                    </div>
                  </div>
                </div>
              )}

              {artist.kilnName && (
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">🏺</span>
                  <div>
                    <div className="font-serif text-xs text-ink-light mb-1">窑名</div>
                    <div className="font-serif text-sm text-ink-dark">
                      {artist.kilnName}
                    </div>
                  </div>
                </div>
              )}

              {artist.studioName && (
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">🏠</span>
                  <div>
                    <div className="font-serif text-xs text-ink-light mb-1">工作室</div>
                    <div className="font-serif text-sm text-ink-dark">
                      {artist.studioName}
                    </div>
                  </div>
                </div>
              )}

              {artist.locationPrefecture && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-ink-light mt-0.5" />
                  <div>
                    <div className="font-serif text-xs text-ink-light mb-1">所在地</div>
                    <div className="font-serif text-sm text-ink-dark">
                      {artist.locationPrefecture}
                      {artist.locationCity && artist.locationCity !== artist.locationPrefecture && ` ${artist.locationCity}`}
                      {artist.locationArea && artist.locationArea !== artist.locationCity && artist.locationArea !== artist.locationPrefecture && ` ${artist.locationArea}`}
                    </div>
                  </div>
                </div>
              )}

              {artist.kilnType && (
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">🔥</span>
                  <div>
                    <div className="font-serif text-xs text-ink-light mb-1">窑类型</div>
                    <div className="font-serif text-sm text-ink-dark">
                      {artist.kilnType}
                    </div>
                  </div>
                </div>
              )}

              {artist.region && (
                <div className="flex items-start gap-3">
                  <Palette className="w-5 h-5 text-ink-light mt-0.5" />
                  <div>
                    <div className="font-serif text-xs text-ink-light mb-1">产地</div>
                    <div className="font-serif text-sm text-ink-dark">
                      {artist.region}
                    </div>
                  </div>
                </div>
              )}

              {artist.style && (
                <div className="flex items-start gap-3">
                  <Palette className="w-5 h-5 text-ink-light mt-0.5" />
                  <div>
                    <div className="font-serif text-xs text-ink-light mb-1">风格</div>
                    <div className="font-serif text-sm text-ink-dark">
                      {artist.style}
                    </div>
                  </div>
                </div>
              )}

              {artist.websiteUrl && (
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-ink-light mt-0.5" />
                  <div>
                    <div className="font-serif text-xs text-ink-light mb-1">网站</div>
                    <a
                      href={artist.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-serif text-sm text-clay-terracotta hover:underline"
                    >
                      访问官网
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {artist.bio && (
          <div className="p-8 bg-white/60 border border-ink-light/20 rounded-xl">
            <h2 className="font-serif text-lg text-ink-dark mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-clay-terracotta rounded-full" />
              艺术家简介
            </h2>
            <p className="font-serif text-base text-ink-medium leading-relaxed whitespace-pre-wrap">
              {artist.bio}
            </p>
          </div>
        )}
      </div>

      {/* Awards */}
      {awards.length > 0 && (
        <div className="mb-12">
          <h2 className="font-serif text-2xl text-ink-dark mb-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-clay-terracotta" />
            荣誉与奖项
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {awards.map((award, index) => (
              <div
                key={index}
                className="p-4 bg-white/60 border border-ink-light/20 rounded-lg"
              >
                <p className="font-serif text-sm text-ink-dark">{award}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exhibitions */}
      {exhibitions.length > 0 && (
        <div className="mb-12">
          <h2 className="font-serif text-2xl text-ink-dark mb-6 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-clay-terracotta rounded-full" />
            展览记录
          </h2>
          <div className="space-y-3">
            {exhibitions.map((exhibition, index) => (
              <div
                key={index}
                className="p-4 bg-white/60 border border-ink-light/20 rounded-lg hover:border-clay-terracotta/30 transition-colors"
              >
                <p className="font-serif text-sm text-ink-dark">{exhibition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Works */}
      {artist.potteryEntries.length > 0 && (
        <div>
          <h2 className="font-serif text-2xl text-ink-dark mb-6 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-clay-terracotta rounded-full" />
            相关陶器作品
            <span className="text-sm text-ink-light font-normal">
              ({artist.potteryEntries.length})
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artist.potteryEntries.map((entry, index) => (
              <Link
                key={entry.id}
                href={`/notion/pottery/${entry.slug}`}
                className="group block"
                style={{
                  animation: 'fadeInUp 0.5s ease-out forwards',
                  animationDelay: `${index * 50}ms`,
                  opacity: 0,
                }}
              >
                <div className="h-full bg-white/60 border border-ink-light/20 rounded-xl overflow-hidden hover:shadow-xl hover:border-clay-terracotta/30 transition-all duration-300">
                  {/* Image */}
                  {entry.images && entry.images.length > 0 ? (
                    <div className="aspect-[4/3] bg-gradient-to-br from-washi-cream to-clay-warm/30 overflow-hidden">
                      <Image
                        src={entry.images[0] as string}
                        alt={entry.nameZh}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-gradient-to-br from-washi-cream to-clay-warm/30 flex items-center justify-center">
                      <span className="font-serif text-6xl text-ink-light/20">陶</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-serif text-lg text-ink-dark mb-1 group-hover:text-clay-terracotta transition-colors">
                      {entry.nameZh}
                    </h3>
                    {entry.nameJa && (
                      <p className="font-serif text-xs text-ink-light mb-3 tracking-wider">
                        {entry.nameJa}
                      </p>
                    )}

                    {entry.category && (
                      <div className="mb-3">
                        <span className="inline-block px-2.5 py-1 bg-clay-warm/20 text-ink-medium text-xs font-serif rounded-md">
                          {entry.category.split('/')[0]}
                        </span>
                      </div>
                    )}

                    {entry.positioning && (
                      <p className="font-serif text-sm text-ink-light leading-relaxed line-clamp-2">
                        {entry.positioning}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </NotionLayout>
  )
}
