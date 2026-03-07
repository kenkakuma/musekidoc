import { prisma } from '../lib/db/client'

async function checkCategories() {
  const entries = await prisma.potteryEntry.findMany({
    where: { published: true },
    select: { id: true, slug: true, category: true, nameZh: true }
  })

  const categories: Record<string, any[]> = {}
  entries.forEach(entry => {
    if (!categories[entry.category]) {
      categories[entry.category] = []
    }
    categories[entry.category].push({
      id: entry.id,
      slug: entry.slug,
      nameZh: entry.nameZh
    })
  })

  console.log('\n=== 分类统计 ===')
  Object.entries(categories)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([cat, items]) => {
      console.log(`\n${cat}: ${items.length}条`)
      if (cat.includes('技法') || cat.includes('技術')) {
        console.log('条目:')
        items.forEach((item: any) => {
          console.log(`  - ${item.nameZh} (${item.slug})`)
        })
      }
    })

  await prisma.$disconnect()
}

checkCategories().catch(console.error)
