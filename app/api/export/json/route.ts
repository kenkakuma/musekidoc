import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import type { ApiResponse } from '@/lib/db/types'

// GET /api/export/json - 导出所有数据为 JSON
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'pretty' // 'pretty' or 'compact'
    const include = searchParams.get('include') || 'all' // 'all', 'entries', 'artists', 'categories'

    const exportData: any = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {}
    }

    // 导出陶器条目
    if (include === 'all' || include === 'entries') {
      const entries = await prisma.potteryEntry.findMany({
        where: { published: true },
        include: {
          artist: {
            select: {
              id: true,
              slug: true,
              nameZh: true,
              nameJa: true,
              nameEn: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      exportData.data.entries = entries
      exportData.data.entriesCount = entries.length
    }

    // 导出作家
    if (include === 'all' || include === 'artists') {
      const artists = await prisma.artist.findMany({
        where: { published: true },
        include: {
          potteryEntries: {
            select: {
              id: true,
              slug: true,
              nameZh: true,
              nameJa: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      exportData.data.artists = artists
      exportData.data.artistsCount = artists.length
    }

    // 导出分类
    if (include === 'all' || include === 'categories') {
      const categories = await prisma.category.findMany({
        include: {
          parent: {
            select: {
              id: true,
              slug: true,
              nameZh: true,
            },
          },
          children: {
            select: {
              id: true,
              slug: true,
              nameZh: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      })

      exportData.data.categories = categories
      exportData.data.categoriesCount = categories.length
    }

    // 格式化 JSON
    const jsonString = format === 'pretty'
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData)

    // 设置响应头，支持文件下载
    const filename = `pottery-kb-export-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error: any) {
    console.error('GET /api/export/json error:', error)

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '导出数据失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// POST /api/export/json - 导出特定条目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, format = 'pretty' } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'ids 必须是非空数组',
          },
        },
        { status: 400 }
      )
    }

    // 获取指定的条目
    const entries = await prisma.potteryEntry.findMany({
      where: {
        id: { in: ids },
        published: true,
      },
      include: {
        artist: true,
      },
    })

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {
        entries,
        entriesCount: entries.length,
      },
    }

    // 格式化 JSON
    const jsonString = format === 'pretty'
      ? JSON.stringify(exportData, null, 2)
      : JSON.stringify(exportData)

    const filename = `pottery-kb-export-selected-${new Date().toISOString().split('T')[0]}.json`

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error: any) {
    console.error('POST /api/export/json error:', error)

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '导出数据失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}
