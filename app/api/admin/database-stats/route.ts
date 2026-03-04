import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET() {
  try {
    // 陶器条目统计
    const totalEntries = await prisma.potteryEntry.count({ where: { published: true } })
    const entriesByCategory = await prisma.potteryEntry.groupBy({
      by: ['category'],
      where: { published: true },
      _count: true,
    })

    // 作家统计
    const totalArtists = await prisma.artist.count({ where: { published: true } })

    // 产地统计
    const entriesByRegion = await prisma.potteryEntry.groupBy({
      by: ['region'],
      where: { published: true },
      _count: true,
    })

    // 列出所有条目
    const allEntries = await prisma.potteryEntry.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        nameZh: true,
        nameJa: true,
        category: true,
        region: true,
        createdAt: true,
      },
      orderBy: { category: 'asc' }
    })

    // 列出所有作家
    const allArtists = await prisma.artist.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        nameZh: true,
        nameJa: true,
        region: true,
        birthYear: true,
      },
      orderBy: { nameZh: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalEntries,
          totalArtists,
          categoriesCount: entriesByCategory.length,
          regionsCount: entriesByRegion.length,
        },
        entriesByCategory: entriesByCategory.map(c => ({
          category: c.category,
          count: c._count,
        })),
        entriesByRegion: entriesByRegion.map(r => ({
          region: r.region,
          count: r._count,
        })),
        allEntries,
        allArtists,
      }
    })
  } catch (error) {
    console.error('获取数据库统计出错:', error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
