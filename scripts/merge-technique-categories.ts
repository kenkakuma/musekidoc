import { prisma } from '../lib/db/client'

async function mergeTechniqueCategories() {
  console.log('开始合并技法分类...\n')

  // 查找简体"样式"的条目
  const entriesToUpdate = await prisma.potteryEntry.findMany({
    where: {
      category: '技法·样式（Techniques & Styles）'
    },
    select: {
      id: true,
      slug: true,
      nameZh: true,
      category: true,
    }
  })

  console.log(`找到 ${entriesToUpdate.length} 个需要更新的条目：`)
  entriesToUpdate.forEach(entry => {
    console.log(`  - ${entry.nameZh} (${entry.slug})`)
  })

  if (entriesToUpdate.length === 0) {
    console.log('\n没有需要更新的条目')
    return
  }

  // 更新分类
  const result = await prisma.potteryEntry.updateMany({
    where: {
      category: '技法·样式（Techniques & Styles）'
    },
    data: {
      category: '技法·様式（Techniques & Styles）'
    }
  })

  console.log(`\n✅ 成功更新 ${result.count} 个条目`)
  console.log('分类已合并为：技法·様式（Techniques & Styles）')

  // 验证结果
  const updatedEntries = await prisma.potteryEntry.findMany({
    where: {
      category: '技法·様式（Techniques & Styles）'
    },
    select: {
      nameZh: true,
    }
  })

  console.log(`\n合并后的分类包含 ${updatedEntries.length} 个条目：`)
  updatedEntries.forEach(entry => {
    console.log(`  - ${entry.nameZh}`)
  })

  await prisma.$disconnect()
}

mergeTechniqueCategories().catch(console.error)
