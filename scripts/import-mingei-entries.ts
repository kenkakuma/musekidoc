import { prisma } from '../lib/db/client'
import * as fs from 'fs'
import * as path from 'path'

interface EntryData {
  slug: string
  nameZh: string
  nameJa: string
  nameEn?: string
  category: string
  region: string
  type?: string
  positioning: string
  description: string
  signatureFeatures: string[]
  keywords: string[]
  notableArtists: string[]
  representativeForms: string[]
  sources: Array<{
    title: string
    url: string
    type: string
  }>
  published: boolean
}

async function importEntries() {
  try {
    // 读取JSON文件
    const dataPath = path.join(process.cwd(), 'data', 'mingei-movement-entries.json')
    const jsonData = fs.readFileSync(dataPath, 'utf-8')
    const entries: EntryData[] = JSON.parse(jsonData)

    console.log(`准备导入 ${entries.length} 条民艺运动条目...`)

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const entry of entries) {
      try {
        // 检查是否已存在
        const existing = await prisma.potteryEntry.findUnique({
          where: { slug: entry.slug }
        })

        if (existing) {
          console.log(`⚠️  跳过已存在的条目: ${entry.nameZh} (${entry.slug})`)
          skipCount++
          continue
        }

        // 创建新条目
        await prisma.potteryEntry.create({
          data: {
            slug: entry.slug,
            nameZh: entry.nameZh,
            nameJa: entry.nameJa,
            nameEn: entry.nameEn,
            category: entry.category,
            region: entry.region,
            type: entry.type,
            positioning: entry.positioning,
            description: entry.description,
            signatureFeatures: entry.signatureFeatures,
            keywords: entry.keywords,
            notableArtists: entry.notableArtists,
            representativeForms: entry.representativeForms,
            sources: entry.sources,
            published: entry.published,
            publishedAt: entry.published ? new Date() : null,
          }
        })

        console.log(`✅ 成功导入: ${entry.nameZh} (${entry.slug})`)
        successCount++

      } catch (error) {
        console.error(`❌ 导入失败: ${entry.nameZh}`, error)
        errorCount++
      }
    }

    console.log('\n=== 导入完成 ===')
    console.log(`✅ 成功: ${successCount} 条`)
    console.log(`⚠️  跳过: ${skipCount} 条`)
    console.log(`❌ 失败: ${errorCount} 条`)
    console.log(`📊 总计: ${entries.length} 条`)

    // 统计当前分类分布
    const categoryStats = await prisma.potteryEntry.groupBy({
      by: ['category'],
      _count: true,
    })

    console.log('\n=== 当前分类分布 ===')
    categoryStats
      .sort((a, b) => (b._count || 0) - (a._count || 0))
      .forEach(stat => {
        console.log(`${stat.category}: ${stat._count} 条`)
      })

  } catch (error) {
    console.error('导入过程出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importEntries()
