import { prisma } from '../lib/db/client'

async function main() {
  console.log('🔍 验证数据库数据...\n')

  const userCount = await prisma.user.count()
  const entryCount = await prisma.potteryEntry.count()

  console.log(`✅ 用户数量: ${userCount}`)
  console.log(`✅ 陶器条目数量: ${entryCount}\n`)

  if (entryCount > 0) {
    const entries = await prisma.potteryEntry.findMany({
      select: {
        id: true,
        slug: true,
        nameZh: true,
        nameJa: true,
        published: true,
      },
      take: 5,
    })

    console.log('📝 陶器条目列表:')
    entries.forEach((entry, i) => {
      console.log(`   ${i + 1}. ${entry.nameZh} (${entry.nameJa})`)
      console.log(`      slug: ${entry.slug}`)
      console.log(`      published: ${entry.published}`)
    })
  }

  console.log('\n✅ 数据库验证成功！')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
