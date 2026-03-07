import { Suspense } from 'react'
import NotionLayout from '@/components/notion-layout/NotionLayout'
import NotionBreadcrumb from '@/components/notion-layout/NotionBreadcrumb'
import DatabaseView from '@/components/notion-layout/DatabaseView'
import { prisma } from '@/lib/db/client'

async function getLatestEntries() {
  const entries = await prisma.potteryEntry.findMany({
    where: { published: true },
    take: 12,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      nameZh: true,
      nameJa: true,
      category: true,
      region: true,
      positioning: true,
      description: true,
      images: true,
      keywords: true,
    },
  })

  return entries
}

async function getStats() {
  const [totalEntries, totalArtists] = await Promise.all([
    prisma.potteryEntry.count({ where: { published: true } }),
    prisma.artist.count({ where: { published: true } }),
  ])

  return { totalEntries, totalArtists }
}

export default async function NotionHomePage() {
  const [entries, stats] = await Promise.all([
    getLatestEntries(),
    getStats(),
  ])

  return (
    <NotionLayout>
      {/* Breadcrumb */}
      <NotionBreadcrumb items={[]} />

      {/* Welcome Section */}
      <div className="mb-16">
        <h1 className="font-serif text-5xl md:text-6xl text-ink-dark mb-4 tracking-wide">
          陶芸知識庫
        </h1>
        <p className="font-serif text-xl text-ink-medium mb-8 leading-relaxed max-w-3xl">
          探索日本陶瓷文化的完整典藏 — 从六古窑传统到现代名窑，从成型技法到器物分类，深入了解侘寂美学与茶道精神。
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="p-6 bg-white/60 border border-ink-light/20 rounded-xl">
            <div className="font-serif text-3xl text-ink-dark mb-1">{stats.totalEntries}</div>
            <div className="font-serif text-sm text-ink-light">陶器条目</div>
          </div>
          <div className="p-6 bg-white/60 border border-ink-light/20 rounded-xl">
            <div className="font-serif text-3xl text-ink-dark mb-1">{stats.totalArtists}</div>
            <div className="font-serif text-sm text-ink-light">陶艺作家</div>
          </div>
          <div className="p-6 bg-white/60 border border-ink-light/20 rounded-xl">
            <div className="font-serif text-3xl text-ink-dark mb-1">6</div>
            <div className="font-serif text-sm text-ink-light">古窑系统</div>
          </div>
          <div className="p-6 bg-white/60 border border-ink-light/20 rounded-xl">
            <div className="font-serif text-3xl text-ink-dark mb-1">25+</div>
            <div className="font-serif text-sm text-ink-light">技法分类</div>
          </div>
        </div>
      </div>

      {/* Latest Entries Database */}
      <Suspense fallback={<div className="text-ink-light">加载中...</div>}>
        <DatabaseView
          items={entries}
          title="最新添加"
          titleJa="最新追加"
        />
      </Suspense>

      {/* Quick Links */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/pottery?category=六古窯"
          className="group p-8 bg-gradient-to-br from-white/60 to-clay-warm/20 border border-ink-light/20 rounded-xl hover:shadow-xl hover:border-clay-terracotta/30 transition-all duration-300"
        >
          <div className="font-serif text-4xl mb-3 text-ink-dark group-hover:text-clay-terracotta transition-colors">
            六古窯
          </div>
          <p className="font-serif text-sm text-ink-medium">
            备前、信乐、常滑、濑户、丹波、越前 — 日本陶瓷的历史根基
          </p>
        </a>

        <a
          href="/pottery?category=技法"
          className="group p-8 bg-gradient-to-br from-white/60 to-glaze-celadon/20 border border-ink-light/20 rounded-xl hover:shadow-xl hover:border-clay-terracotta/30 transition-all duration-300"
        >
          <div className="font-serif text-4xl mb-3 text-ink-dark group-hover:text-clay-terracotta transition-colors">
            陶瓷技法
          </div>
          <p className="font-serif text-sm text-ink-medium">
            成型、装饰、釉药、烧成 — 传统工艺的精髓传承
          </p>
        </a>

        <a
          href="/artists"
          className="group p-8 bg-gradient-to-br from-white/60 to-clay-warm/20 border border-ink-light/20 rounded-xl hover:shadow-xl hover:border-clay-terracotta/30 transition-all duration-300"
        >
          <div className="font-serif text-4xl mb-3 text-ink-dark group-hover:text-clay-terracotta transition-colors">
            陶艺作家
          </div>
          <p className="font-serif text-sm text-ink-medium">
            人间国宝、传统工匠、现代陶艺家 — 匠人精神的传承
          </p>
        </a>
      </div>
    </NotionLayout>
  )
}
