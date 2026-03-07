import { prisma } from '../lib/db/client'

/**
 * 分类迁移脚本
 * 将旧的混合格式category值更新为新的纯中文标准格式
 */

interface CategoryMapping {
  old: string | RegExp
  new: string
  description: string
}

const categoryMappings: CategoryMapping[] = [
  // 六古窑系列
  {
    old: /六古窯.*历史发展/i,
    new: '产地窑系/六古窑',
    description: '六古窑历史发展 → 产地窑系/六古窑'
  },
  {
    old: /^六古窯/i,
    new: '产地窑系/六古窑',
    description: '六古窑 → 产地窑系/六古窑'
  },

  // 现代名窑系列
  {
    old: /名窯.*茶陶/i,
    new: '产地窑系/现代名窑',
    description: '名窑/茶陶 → 产地窑系/现代名窑'
  },
  {
    old: /名窯/i,
    new: '产地窑系/现代名窑',
    description: '名窑 → 产地窑系/现代名窑'
  },

  // 制作技法系列
  {
    old: /技法.*様式.*成型技法/i,
    new: '制作技法/成型技法',
    description: '技法·様式/成型技法 → 制作技法/成型技法'
  },
  {
    old: /技法.*様式.*装饰技法/i,
    new: '制作技法/装饰技法',
    description: '技法·様式/装饰技法 → 制作技法/装饰技法'
  },
  {
    old: /技法.*様式.*釉药技法/i,
    new: '制作技法/釉药技法',
    description: '技法·様式/釉药技法 → 制作技法/釉药技法'
  },
  {
    old: /技法.*様式.*烧成技法/i,
    new: '制作技法/烧成技法',
    description: '技法·様式/烧成技法 → 制作技法/烧成技法'
  },
  {
    old: /^technique$/i,
    new: '制作技法',
    description: 'technique → 制作技法'
  },
  {
    old: /技法.*様式/i,
    new: '制作技法',
    description: '技法·様式 → 制作技法'
  },

  // 器物用途系列
  {
    old: /器物分类.*茶道具/i,
    new: '器物用途/茶道具',
    description: '器物分类/茶道具 → 器物用途/茶道具'
  },
  {
    old: /器物分类.*酒器/i,
    new: '器物用途/酒器',
    description: '器物分类/酒器 → 器物用途/酒器'
  },
  {
    old: /器物分类.*日用器/i,
    new: '器物用途/日用器',
    description: '器物分类/日用器 → 器物用途/日用器'
  },
  {
    old: /器物分类.*储藏器/i,
    new: '器物用途/储藏器',
    description: '器物分类/储藏器 → 器物用途/储藏器'
  },

  // 历史文化系列
  {
    old: /历史文化.*美学思想/i,
    new: '历史文化/美学思想',
    description: '历史文化/美学思想 → 历史文化/美学思想'
  },
  {
    old: /历史文化.*文化史/i,
    new: '历史文化/文化史',
    description: '历史文化/文化史 → 历史文化/文化史'
  },
  {
    old: /历史文化.*茶道文化/i,
    new: '历史文化/茶道文化',
    description: '历史文化/茶道文化 → 历史文化/茶道文化'
  },
  {
    old: /历史文化.*民艺运动/i,
    new: '历史文化/民艺运动',
    description: '历史文化/民艺运动 → 历史文化/民艺运动'
  },
  {
    old: /历史文化.*文化运动/i,
    new: '历史文化/民艺运动',
    description: '历史文化/文化运动 → 历史文化/民艺运动'
  },

  // 基础知识系列
  {
    old: /基础知识.*术语/i,
    new: '基础知识/术语解释',
    description: '基础知识/术语 → 基础知识/术语解释'
  },
  {
    old: /基础知识.*鉴赏/i,
    new: '基础知识/鉴赏体系',
    description: '基础知识/鉴赏 → 基础知识/鉴赏体系'
  },
  {
    old: /基础知识.*文化认定/i,
    new: '基础知识/文化认定',
    description: '基础知识/文化认定 → 基础知识/文化认定'
  },
  {
    old: /框架.*索引/i,
    new: '基础知识/文化认定',
    description: '框架/索引 → 基础知识/文化认定'
  },
  {
    old: /框架.*分类标签/i,
    new: '基础知识/文化认定',
    description: '框架/分类标签 → 基础知识/文化认定'
  },
]

async function migrateCategories() {
  console.log('🚀 开始分类迁移...\n')

  // 获取所有条目
  const allEntries = await prisma.potteryEntry.findMany({
    select: {
      id: true,
      slug: true,
      nameZh: true,
      category: true,
    }
  })

  console.log(`📊 总条目数: ${allEntries.length}\n`)

  // 统计迁移结果
  const stats = {
    total: allEntries.length,
    migrated: 0,
    unchanged: 0,
    errors: 0,
  }

  const migrations: Array<{
    id: string
    nameZh: string
    oldCategory: string | null
    newCategory: string
  }> = []

  // 处理每个条目
  for (const entry of allEntries) {
    if (!entry.category) {
      console.log(`⚠️  跳过（无分类）: ${entry.nameZh}`)
      stats.unchanged++
      continue
    }

    let newCategory = entry.category
    let matched = false

    // 尝试匹配映射规则
    for (const mapping of categoryMappings) {
      if (mapping.old instanceof RegExp) {
        if (mapping.old.test(entry.category)) {
          newCategory = mapping.new
          matched = true
          break
        }
      } else {
        if (entry.category === mapping.old) {
          newCategory = mapping.new
          matched = true
          break
        }
      }
    }

    // 如果分类值发生了变化
    if (newCategory !== entry.category) {
      migrations.push({
        id: entry.id,
        nameZh: entry.nameZh,
        oldCategory: entry.category,
        newCategory: newCategory,
      })

      try {
        await prisma.potteryEntry.update({
          where: { id: entry.id },
          data: { category: newCategory },
        })
        console.log(`✅ ${entry.nameZh}`)
        console.log(`   旧: ${entry.category}`)
        console.log(`   新: ${newCategory}\n`)
        stats.migrated++
      } catch (error) {
        console.error(`❌ 更新失败: ${entry.nameZh}`, error)
        stats.errors++
      }
    } else {
      console.log(`⏭️  保持不变: ${entry.nameZh} - ${entry.category}`)
      stats.unchanged++
    }
  }

  // 打印统计信息
  console.log('\n' + '='.repeat(60))
  console.log('📈 迁移统计:')
  console.log(`   总条目数: ${stats.total}`)
  console.log(`   已迁移: ${stats.migrated}`)
  console.log(`   未改变: ${stats.unchanged}`)
  console.log(`   错误: ${stats.errors}`)
  console.log('='.repeat(60))

  // 验证新分类的分布
  console.log('\n🔍 验证新分类分布:\n')
  const categoryStats = await prisma.potteryEntry.groupBy({
    by: ['category'],
    _count: true,
  })

  categoryStats
    .sort((a, b) => (b._count || 0) - (a._count || 0))
    .forEach(stat => {
      console.log(`   ${stat.category}: ${stat._count} 条`)
    })

  await prisma.$disconnect()

  console.log('\n✨ 迁移完成！')
}

// 执行迁移
migrateCategories().catch((error) => {
  console.error('💥 迁移失败:', error)
  process.exit(1)
})
