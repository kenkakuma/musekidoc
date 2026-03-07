import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'

export async function GET(request: Request) {
  try {
    const artists = await prisma.artist.findMany({
      select: {
        id: true,
        slug: true,
        nameZh: true,
        nameJa: true,
        nameEn: true,
        birthYear: true,
        deathYear: true,
        region: true,
        awards: true,
        exhibitions: true,
        exhibitionCount: true,
      },
      orderBy: {
        nameJa: 'asc'
      }
    })

    // 分析数据完整度
    const analysis = {
      total: artists.length,
      withAwards: artists.filter(a => a.awards && Array.isArray(a.awards) && a.awards.length > 0).length,
      withExhibitions: artists.filter(a => a.exhibitions && Array.isArray(a.exhibitions) && a.exhibitions.length > 0).length,
      withExhibitionCount: artists.filter(a => a.exhibitionCount && a.exhibitionCount > 0).length,
      incomplete: artists.filter(a => {
        const hasNoAwards = !a.awards || !Array.isArray(a.awards) || a.awards.length === 0
        const hasNoExhibitions = !a.exhibitions || !Array.isArray(a.exhibitions) || a.exhibitions.length === 0
        return hasNoAwards || hasNoExhibitions
      }).length
    }

    return NextResponse.json({
      success: true,
      analysis,
      artists
    })

  } catch (error) {
    console.error('获取作家列表出错:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
