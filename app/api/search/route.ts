import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { createSearchIndex, searchEntries } from '@/lib/search'
import type { ApiResponse } from '@/lib/db/types'

// POST /api/search - 全文搜索
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, limit = 20, offset = 0 } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_QUERY',
            message: '搜索关键词不能为空',
          },
        },
        { status: 400 }
      )
    }

    // 获取所有已发布的条目
    const allEntries = await prisma.potteryEntry.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        nameZh: true,
        nameJa: true,
        nameEn: true,
        description: true,
        keywords: true,
        region: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // 创建搜索索引
    const searchIndex = createSearchIndex(allEntries as any)

    // 执行搜索
    const searchResult = searchEntries(searchIndex, query, {
      limit: Number(limit),
      offset: Number(offset),
    })

    // 获取完整的条目信息
    const resultIds = searchResult.results.map((r: any) => r.id)
    const fullEntries = await prisma.potteryEntry.findMany({
      where: {
        id: { in: resultIds },
      },
      include: {
        artist: {
          select: {
            id: true,
            slug: true,
            nameZh: true,
            nameJa: true,
          },
        },
      },
    })

    // 按搜索结果排序
    const sortedEntries = resultIds
      .map(id => fullEntries.find(e => e.id === id))
      .filter(Boolean)

    const response: ApiResponse = {
      success: true,
      data: sortedEntries,
      meta: {
        total: searchResult.total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit,
        query,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('POST /api/search error:', error)

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '搜索失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// 注意：搜索建议功能已移至 /api/search/suggestions/route.ts
