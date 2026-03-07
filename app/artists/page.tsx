import { Suspense } from 'react'
import NotionLayout from '@/components/notion-layout/NotionLayout'
import NotionBreadcrumb from '@/components/notion-layout/NotionBreadcrumb'
import { prisma } from '@/lib/db/client'
import Link from 'next/link'
import Image from 'next/image'

interface SearchParams {
  sort?: string
  region?: string
}

async function getArtists(searchParams: SearchParams) {
  let orderBy: any = { createdAt: 'desc' }

  if (searchParams.sort === 'name-asc') {
    orderBy = { nameZh: 'asc' }
  } else if (searchParams.sort === 'name-desc') {
    orderBy = { nameZh: 'desc' }
  } else if (searchParams.sort === 'birth-asc') {
    orderBy = { birthYear: 'asc' }
  } else if (searchParams.sort === 'birth-desc') {
    orderBy = { birthYear: 'desc' }
  }

  const where: any = { published: true }
  if (searchParams.region) {
    where.region = { contains: searchParams.region }
  }

  const artists = await prisma.artist.findMany({
    where,
    orderBy,
    include: {
      potteryEntries: {
        where: { published: true },
        take: 3,
        select: {
          id: true,
          nameZh: true,
          images: true,
        },
      },
    },
  })

  return artists
}

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const artists = await getArtists(searchParams)

  return (
    <NotionLayout>
      {/* Breadcrumb */}
      <NotionBreadcrumb
        items={[{ label: '陶艺作家', labelJa: '陶芸作家' }]}
      />

      {/* Header */}
      <div className="mb-12">
        <h1 className="font-serif text-5xl text-ink-dark mb-3 tracking-wide">
          陶艺作家
        </h1>
        <p className="font-serif text-lg text-ink-medium leading-relaxed max-w-3xl">
          探索日本陶艺大师 — 从人间国宝到传统工匠，从现代陶艺家到民艺传承者
        </p>
      </div>

      {/* Sort Controls */}
      <div className="mb-8 flex items-center gap-3">
        <span className="font-serif text-sm text-ink-light">排序：</span>
        <div className="flex gap-2">
          <SortButton href="/artists?sort=name-asc" active={searchParams.sort === 'name-asc'}>
            姓名 ↑
          </SortButton>
          <SortButton href="/artists?sort=name-desc" active={searchParams.sort === 'name-desc'}>
            姓名 ↓
          </SortButton>
          <SortButton href="/artists?sort=birth-asc" active={searchParams.sort === 'birth-asc'}>
            出生年份 ↑
          </SortButton>
          <SortButton href="/artists?sort=birth-desc" active={searchParams.sort === 'birth-desc'}>
            出生年份 ↓
          </SortButton>
          <SortButton href="/artists" active={!searchParams.sort}>
            最新添加
          </SortButton>
        </div>
      </div>

      {/* Artists Grid */}
      <Suspense fallback={<LoadingSkeleton />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist, index) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.slug}`}
              className="group block"
              style={{
                animation: 'fadeInUp 0.5s ease-out forwards',
                animationDelay: `${index * 50}ms`,
                opacity: 0,
              }}
            >
              <div className="h-full bg-white/60 border border-ink-light/20 rounded-xl overflow-hidden hover:shadow-xl hover:border-clay-terracotta/30 transition-all duration-300">
                {/* Avatar */}
                <div className="p-8 pb-6 flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    {artist.avatar ? (
                      <Image
                        src={artist.avatar}
                        alt={artist.nameZh}
                        fill
                        className="object-cover rounded-full border-2 border-clay-warm/30 group-hover:border-clay-terracotta/50 transition-colors"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-washi-cream to-clay-warm/30 rounded-full flex items-center justify-center border-2 border-clay-warm/30">
                        <span className="font-serif text-4xl text-ink-light/40">
                          {artist.nameZh.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="font-serif text-2xl text-ink-dark text-center mb-1 group-hover:text-clay-terracotta transition-colors">
                    {artist.nameZh}
                  </h3>
                  {artist.nameEn && (
                    <p className="font-serif text-sm text-ink-light mb-3 tracking-wider">
                      {artist.nameEn}
                    </p>
                  )}

                  {/* Birth/Death Years */}
                  {(artist.birthYear || artist.deathYear) && (
                    <div className="font-serif text-xs text-ink-medium mb-4">
                      {artist.birthYear && <span>{artist.birthYear}</span>}
                      {artist.birthYear && artist.deathYear && <span> - </span>}
                      {artist.deathYear && <span>{artist.deathYear}</span>}
                    </div>
                  )}

                  {/* Kiln & Location */}
                  {(artist.kilnName || artist.locationPrefecture) && (
                    <div className="text-center mb-3">
                      {artist.kilnName && (
                        <div className="font-serif text-xs text-ink-medium mb-1">
                          🏺 {artist.kilnName}
                        </div>
                      )}
                      {artist.locationPrefecture && (
                        <div className="font-serif text-xs text-ink-light">
                          📍 {artist.locationPrefecture}
                          {artist.locationCity && artist.locationCity !== artist.locationPrefecture && ` ${artist.locationCity}`}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Region & Style */}
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {artist.region && (
                      <span className="px-3 py-1 bg-clay-warm/20 text-ink-medium text-xs font-serif rounded-full">
                        {artist.region}
                      </span>
                    )}
                    {artist.style && (
                      <span className="px-3 py-1 bg-glaze-celadon/20 text-ink-medium text-xs font-serif rounded-full">
                        {artist.style}
                      </span>
                    )}
                  </div>

                  {/* Bio Excerpt */}
                  {artist.bio && (
                    <p className="font-serif text-sm text-ink-light leading-relaxed line-clamp-3 text-center">
                      {artist.bio}
                    </p>
                  )}
                </div>

                {/* Works Preview */}
                {artist.potteryEntries.length > 0 && (
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-ink-light/10">
                      <p className="font-serif text-xs text-ink-light mb-3">
                        代表作品
                      </p>
                      <div className="flex gap-2">
                        {artist.potteryEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex-1 aspect-square bg-gradient-to-br from-washi-cream to-clay-warm/30 rounded-lg overflow-hidden"
                          >
                            {entry.images && entry.images.length > 0 ? (
                              <Image
                                src={entry.images[0] as string}
                                alt={entry.nameZh}
                                width={100}
                                height={100}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="font-serif text-xl text-ink-light/30">陶</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </Suspense>

      {/* Results Count */}
      <div className="mt-12 text-center text-sm font-serif text-ink-light">
        共 {artists.length} 位陶艺作家
      </div>
    </NotionLayout>
  )
}

function SortButton({
  href,
  active,
  children,
}: {
  href: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`
        px-3 py-1.5 rounded-lg font-serif text-sm
        transition-all duration-200
        ${
          active
            ? 'bg-clay-warm/40 text-ink-dark border border-clay-terracotta/30'
            : 'bg-white/60 text-ink-medium border border-ink-light/20 hover:border-clay-terracotta/20'
        }
      `}
    >
      {children}
    </Link>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-96 bg-white/60 border border-ink-light/20 rounded-xl animate-pulse"
        />
      ))}
    </div>
  )
}
