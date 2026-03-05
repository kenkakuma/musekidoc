import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import * as fs from 'fs'
import * as path from 'path'

interface ArtistUpdate {
  slug: string
  awards?: string[]
  exhibitions?: Array<{
    year: number
    title: string
    venue: string
  }>
  exhibitionCount?: number
}

export async function POST(request: Request) {
  try {
    const { batch } = await request.json()

    // 读取JSON文件
    const dataPath = path.join(process.cwd(), 'data', `artists-awards-exhibitions-batch-${batch || 1}.json`)
    const jsonData = fs.readFileSync(dataPath, 'utf-8')
    const updates: ArtistUpdate[] = JSON.parse(jsonData)

    console.log(`准备更新 ${updates.length} 位作家的展览和获奖信息...`)

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

        // 更新作家信息
        await prisma.artist.update({
          where: { slug: update.slug },
          data: {
            awards: update.awards || artist.awards,
            exhibitions: update.exhibitions || artist.exhibitions,
            exhibitionCount: update.exhibitionCount !== undefined ? update.exhibitionCount : artist.exhibitionCount
          }
        })

        const awardsCount = update.awards?.length || 0
        const exhibitionsCount = update.exhibitions?.length || 0
        details.push(`✅ 成功更新: ${artist.nameZh} - ${awardsCount}项奖项, ${exhibitionsCount}个展览`)
        successCount++

      } catch (error) {
        details.push(`❌ 失败: ${update.slug} - ${error instanceof Error ? error.message : '未知错误'}`)
        errorCount++
      }
    }

    // 统计整体数据完整度
    const totalArtists = await prisma.artist.count()
    const artistsWithAwards = await prisma.artist.count({
      where: {
        awards: {
          not: {
            equals: []
          }
        }
      }
    })
    const artistsWithExhibitions = await prisma.artist.count({
      where: {
        exhibitions: {
          not: {
            equals: []
          }
        }
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
        artistsWithAwards,
        artistsWithExhibitions,
        completionRate: {
          awards: Math.round((artistsWithAwards / totalArtists) * 100),
          exhibitions: Math.round((artistsWithExhibitions / totalArtists) * 100)
        }
      }
    })

  } catch (error) {
    console.error('更新过程出错:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
