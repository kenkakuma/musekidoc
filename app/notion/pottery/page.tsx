import { Suspense } from 'react'
import NotionLayout from '@/components/notion-layout/NotionLayout'
import NotionBreadcrumb from '@/components/notion-layout/NotionBreadcrumb'
import DatabaseView from '@/components/notion-layout/DatabaseView'
import { prisma } from '@/lib/db/client'

interface SearchParams {
  category?: string
  region?: string
  search?: string
}

async function getPotteryEntries(searchParams: SearchParams) {
  const where: any = { published: true }

  if (searchParams.category) {
    where.category = { contains: searchParams.category }
  }

  if (searchParams.region) {
    where.region = { contains: searchParams.region }
  }

  if (searchParams.search) {
    where.OR = [
      { nameZh: { contains: searchParams.search } },
      { nameJa: { contains: searchParams.search } },
      { description: { contains: searchParams.search } },
    ]
  }

  const entries = await prisma.potteryEntry.findMany({
    where,
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

export default async function PotteryDatabasePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const entries = await getPotteryEntries(searchParams)

  // Determine breadcrumb title
  let pageTitle = '陶器条目'
  let pageTitleJa = '陶器エントリー'

  if (searchParams.category) {
    pageTitle = searchParams.category
  } else if (searchParams.region) {
    pageTitle = `${searchParams.region}地区`
  }

  return (
    <NotionLayout>
      {/* Breadcrumb */}
      <NotionBreadcrumb
        items={[
          { label: '陶器条目', labelJa: '陶器', href: '/notion/pottery' },
          ...(searchParams.category ? [{ label: searchParams.category }] : []),
        ]}
      />

      {/* Database View */}
      <Suspense fallback={<div className="text-ink-light font-serif">加载中...</div>}>
        <DatabaseView
          items={entries}
          title={pageTitle}
          titleJa={pageTitleJa}
        />
      </Suspense>
    </NotionLayout>
  )
}
