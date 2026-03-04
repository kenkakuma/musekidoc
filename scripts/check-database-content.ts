import { prisma } from '../lib/db/client'

async function checkDatabaseContent() {
  console.log('\n=== 数据库内容统计 ===\n')

  // 陶器条目统计
  const totalEntries = await prisma.potteryEntry.count({ where: { published: true } })
  const entriesByCategory = await prisma.potteryEntry.groupBy({
    by: ['category'],
    where: { published: true },
    _count: true,
  })
  
  console.log(`📦 陶器条目总数: ${totalEntries}`)
  console.log('\n按分类统计:')
  entriesByCategory.forEach(cat => {
    console.log(`  - ${cat.category}: ${cat._count} 条`)
  })

  // 作家统计
  const totalArtists = await prisma.artist.count({ where: { published: true } })
  console.log(`\n👤 作家总数: ${totalArtists}`)

  // 产地统计
  const entriesByRegion = await prisma.potteryEntry.groupBy({
    by: ['region'],
    where: { published: true },
    _count: true,
  })
  
  console.log('\n📍 按产地统计:')
  entriesByRegion.forEach(reg => {
    console.log(`  - ${reg.region}: ${reg._count} 条`)
  })

  // 列出所有条目
  const allEntries = await prisma.potteryEntry.findMany({
    where: { published: true },
    select: { nameZh: true, category: true, region: true },
    orderBy: { category: 'asc' }
  })

  console.log('\n📋 现有条目列表:')
  allEntries.forEach(entry => {
    console.log(`  - ${entry.nameZh} [${entry.category}] (${entry.region})`)
  })

  await prisma.$disconnect()
}

checkDatabaseContent().catch(console.error)
