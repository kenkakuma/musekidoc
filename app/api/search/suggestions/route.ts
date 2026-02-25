import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { createSearchIndex } from '@/lib/search'
import type { ApiResponse } from '@/lib/db/types'

// GET /api/search/suggestions - 获取搜索建议
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = Number(searchParams.get('limit')) || 5

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
      })
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

    // 获取搜索建议
    const miniSearch = searchIndex as any
    const suggestions = miniSearch.autoSuggest(query, {
      boost: {
        nameZh: 3,
        nameJa: 3,
        keywords: 2
      },
      fuzzy: 0.2,
      prefix: true
    })

    const limitedSuggestions = suggestions
      .slice(0, limit)
      .map((s: any) => s.suggestion)

    const response: ApiResponse = {
      success: true,
      data: limitedSuggestions,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('GET /api/search/suggestions error:', error)

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '获取搜索建议失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}
