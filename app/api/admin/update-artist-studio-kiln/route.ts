import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import * as fs from 'fs'
import * as path from 'path'

interface StudioKilnUpdate {
  slug: string
  kilnName?: string
  studioName?: string
  locationPrefecture?: string
  locationCity?: string
  locationArea?: string
  kilnType?: string
  studioInfo?: any
}

export async function POST(request: Request) {
  try {
    const { batch } = await request.json()

    // 读取JSON文件
    const dataPath = path.join(process.cwd(), 'data', `artists-studio-kiln-batch-${batch || 1}.json`)
    const jsonData = fs.readFileSync(dataPath, 'utf-8')
    const updates: StudioKilnUpdate[] = JSON.parse(jsonData)

    console.log(`准备更新 ${updates.length} 位作家的窑场/工作室信息...`)

    let successCount = 0
    let notFoundCount = 0
    let errorCount = 0
    const details: string[] = []

    for (const update of updates) {
      try {
        // 查找作家
        const artist = await prisma.artist.findUnique({
          where: { slug: update.slug }
        })

        if (!artist) {
          details.push(`⚠️  作家不存在: ${update.slug}`)
          notFoundCount++
          continue
        }

        // 更新作家窑场/工作室信息
        await prisma.artist.update({
          where: { slug: update.slug },
          data: {
            kilnName: update.kilnName !== undefined ? update.kilnName : artist.kilnName,
            studioName: update.studioName !== undefined ? update.studioName : artist.studioName,
            locationPrefecture: update.locationPrefecture !== undefined ? update.locationPrefecture : artist.locationPrefecture,
            locationCity: update.locationCity !== undefined ? update.locationCity : artist.locationCity,
            locationArea: update.locationArea !== undefined ? update.locationArea : artist.locationArea,
            kilnType: update.kilnType !== undefined ? update.kilnType : artist.kilnType,
            studioInfo: update.studioInfo !== undefined ? update.studioInfo : artist.studioInfo
          }
        })

        const locationStr = [update.locationPrefecture, update.locationCity, update.locationArea]
          .filter(Boolean).join(' ')
        const infoStr = [
          update.kilnName && `窑场: ${update.kilnName}`,
          update.studioName && `工作室: ${update.studioName}`,
          locationStr && `地点: ${locationStr}`,
          update.kilnType && `窑炉: ${update.kilnType}`
        ].filter(Boolean).join(', ')

        details.push(`✅ 成功更新: ${artist.nameZh} - ${infoStr || '基础信息'}`)
        successCount++

      } catch (error) {
        details.push(`❌ 失败: ${update.slug} - ${error instanceof Error ? error.message : '未知错误'}`)
        errorCount++
      }
    }

    // 统计整体数据完整度
    const totalArtists = await prisma.artist.count()
    const artistsWithKiln = await prisma.artist.count({
      where: {
        OR: [
          { kilnName: { not: null } },
          { studioName: { not: null } }
        ]
      }
    })
    const artistsWithLocation = await prisma.artist.count({
      where: {
        AND: [
          { locationPrefecture: { not: null } },
          { locationCity: { not: null } }
        ]
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        total: updates.length,
        success: successCount,
        notFound: notFoundCount,
        errors: errorCount
      },
      details,
      globalStats: {
        totalArtists,
        artistsWithKiln,
        artistsWithLocation,
        completionRate: {
          kiln: Math.round((artistsWithKiln / totalArtists) * 100),
          location: Math.round((artistsWithLocation / totalArtists) * 100)
        }
      }
    })

  } catch (error) {
    console.error('更新窑场/工作室信息过程出错:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
