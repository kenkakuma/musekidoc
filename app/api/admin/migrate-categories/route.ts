import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

interface CategoryMapping {
  old: string | RegExp
  new: string
  description: string
}

const categoryMappings: CategoryMapping[] = [
  // 六古窑系列
  { old: /六古窯.*历史发展/i, new: '产地窑系/六古窑', description: '六古窑历史发展' },
  { old: /^六古窯/i, new: '产地窑系/六古窑', description: '六古窑' },

  // 现代名窑系列
  { old: /名窯.*茶陶/i, new: '产地窑系/现代名窑', description: '名窑/茶陶' },
  { old: /名窯/i, new: '产地窑系/现代名窑', description: '名窑' },

  // 制作技法系列
  { old: /技法.*様式.*成型技法/i, new: '制作技法/成型技法', description: '技法/成型技法' },
  { old: /技法.*様式.*装饰技法/i, new: '制作技法/装饰技法', description: '技法/装饰技法' },
  { old: /技法.*様式.*釉药技法/i, new: '制作技法/釉药技法', description: '技法/釉药技法' },
  { old: /技法.*様式.*烧成技法/i, new: '制作技法/烧成技法', description: '技法/烧成技法' },
  { old: /^technique$/i, new: '制作技法', description: 'technique' },
  { old: /技法.*様式/i, new: '制作技法', description: '技法·様式' },

  // 器物用途系列
  { old: /器物分类.*茶道具/i, new: '器物用途/茶道具', description: '器物分类/茶道具' },
  { old: /器物分类.*酒器/i, new: '器物用途/酒器', description: '器物分类/酒器' },
  { old: /器物分类.*日用器/i, new: '器物用途/日用器', description: '器物分类/日用器' },
  { old: /器物分类.*储藏器/i, new: '器物用途/储藏器', description: '器物分类/储藏器' },

  // 历史文化系列（包含所有History & Culture格式）
  { old: /历史文化.*美学思想/i, new: '历史文化/美学思想', description: '历史文化/美学思想' },
  { old: /历史文化.*文化史/i, new: '历史文化/文化史', description: '历史文化/文化史' },
  { old: /历史文化.*茶道文化/i, new: '历史文化/茶道文化', description: '历史文化/茶道文化' },
  { old: /历史文化.*民艺运动/i, new: '历史文化/民艺运动', description: '历史文化/民艺运动' },
  { old: /历史文化.*文化运动/i, new: '历史文化/民艺运动', description: '历史文化/文化运动' },
  { old: /历史文化.*陶瓷史/i, new: '历史文化/文化史', description: '历史文化/陶瓷史' },
  { old: /历史文化.*技术传统/i, new: '制作技法', description: '历史文化/技术传统' },
  { old: /历史文化.*文化交流/i, new: '历史文化/文化史', description: '历史文化/文化交流' },
  { old: /历史文化.*文化制度/i, new: '基础知识/文化认定', description: '历史文化/文化制度' },
  { old: /历史文化.*术语知识/i, new: '基础知识/术语解释', description: '历史文化/术语知识' },
  { old: /历史文化.*现代陶艺/i, new: '历史文化/文化史', description: '历史文化/现代陶艺' },
  { old: /历史文化.*窑业传承/i, new: '历史文化/文化史', description: '历史文化/窑业传承' },
  { old: /历史文化.*贸易史/i, new: '历史文化/文化史', description: '历史文化/贸易史' },
  { old: /历史文化.*鉴赏知识/i, new: '基础知识/鉴赏体系', description: '历史文化/鉴赏知识' },

  // 基础知识系列（包含所有Foundations格式）
  { old: /基础知识.*术语/i, new: '基础知识/术语解释', description: '基础知识/术语' },
  { old: /基础知识.*鉴赏/i, new: '基础知识/鉴赏体系', description: '基础知识/鉴赏' },
  { old: /基础知识.*文化认定/i, new: '基础知识/文化认定', description: '基础知识/文化认定' },
  { old: /基础知识.*作家体系/i, new: '基础知识/文化认定', description: '基础知识/作家体系' },
  { old: /基础知识.*六古窯/i, new: '基础知识/文化认定', description: '基础知识/六古窯' },
  { old: /基础知识.*历史/i, new: '历史文化/文化史', description: '基础知识/历史' },
  { old: /基础知识.*概念/i, new: '基础知识/术语解释', description: '基础知识/概念' },
  { old: /框架.*索引/i, new: '基础知识/文化认定', description: '框架/索引' },
  { old: /框架.*分类标签/i, new: '基础知识/文化认定', description: '框架/分类标签' },
]

export async function POST(request: Request) {
  try {
    const allEntries = await prisma.potteryEntry.findMany({
      select: {
        id: true,
        slug: true,
        nameZh: true,
        category: true,
      }
    })

    const migrations: Array<{
      id: string
      nameZh: string
      oldCategory: string | null
      newCategory: string
    }> = []

    let migratedCount = 0

    // 处理每个条目
    for (const entry of allEntries) {
      if (!entry.category) continue

      let newCategory = entry.category

      // 尝试匹配映射规则
      for (const mapping of categoryMappings) {
        if (mapping.old instanceof RegExp) {
          if (mapping.old.test(entry.category)) {
            newCategory = mapping.new
            break
          }
        } else {
          if (entry.category === mapping.old) {
            newCategory = mapping.new
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

        await prisma.potteryEntry.update({
          where: { id: entry.id },
          data: { category: newCategory },
        })

        migratedCount++
      }
    }

    // 获取新分类的分布
    const categoryStats = await prisma.potteryEntry.groupBy({
      by: ['category'],
      _count: true,
    })

    return NextResponse.json({
      success: true,
      stats: {
        total: allEntries.length,
        migrated: migratedCount,
        unchanged: allEntries.length - migratedCount,
      },
      migrations,
      categoryDistribution: categoryStats.sort((a, b) => (b._count || 0) - (a._count || 0)),
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
