import { prisma } from '../lib/db/client'

async function analyzeCategories() {
  const entries = await prisma.potteryEntry.findMany({
    where: { published: true },
    select: {
      id: true,
      category: true,
      nameZh: true,
      nameJa: true,
      region: true,
      type: true
    }
  })

  // 统计分类
  const categories: Record<string, number> = {}
  const regions: Record<string, number> = {}
  const types: Record<string, number> = {}

  entries.forEach(entry => {
    if (entry.category) {
      categories[entry.category] = (categories[entry.category] || 0) + 1
    }
    if (entry.region) {
      regions[entry.region] = (regions[entry.region] || 0) + 1
    }
    if (entry.type) {
      types[entry.type] = (types[entry.type] || 0) + 1
    }
  })

  console.log('=== 分类统计 ===')
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`${cat}: ${count}条`)
    })

  console.log('\n=== 地区统计 ===')
  Object.entries(regions)
    .sort((a, b) => b[1] - a[1])
    .forEach(([reg, count]) => {
      console.log(`${reg}: ${count}条`)
    })

  console.log('\n=== 类型统计 ===')
  Object.entries(types)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`${type}: ${count}条`)
    })

  console.log(`\n总条目数: ${entries.length}`)

  // 列出所有条目的详细信息
  console.log('\n=== 所有条目详情 ===')
  entries.forEach(entry => {
    console.log(`${entry.nameZh} (${entry.nameJa || 'N/A'}) - 分类: ${entry.category || 'N/A'} - 地区: ${entry.region || 'N/A'} - 类型: ${entry.type || 'N/A'}`)
  })

  await prisma.$disconnect()
}

analyzeCategories().catch(console.error)
