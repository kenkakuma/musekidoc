import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { createEntrySchema, entriesQuerySchema } from '@/lib/validations/entry'
import { requireAuth } from '@/lib/auth/middleware'
import type { ApiResponse } from '@/lib/db/types'

// GET /api/entries - 获取条目列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 验证查询参数
    const query = entriesQuerySchema.parse({
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      category: searchParams.get('category'),
      region: searchParams.get('region'),
      published: searchParams.get('published'),
      search: searchParams.get('search'),
    })

    // 构建 where 条件
    const where: any = {}

    if (query.category !== null && query.category !== undefined) {
      where.category = { contains: query.category }
    }

    if (query.region !== null && query.region !== undefined) {
      where.region = { contains: query.region }
    }

    if (query.published !== null && query.published !== undefined) {
      where.published = query.published
    }

    if (query.search !== null && query.search !== undefined) {
      where.OR = [
        { nameZh: { contains: query.search, mode: 'insensitive' } },
        { nameJa: { contains: query.search } },
        { nameEn: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ]
    }

    // 查询总数
    const total = await prisma.potteryEntry.count({ where })

    // 分页查询
    const entries = await prisma.potteryEntry.findMany({
      where,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { createdAt: 'desc' },
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

    const response: ApiResponse = {
      success: true,
      data: entries,
      meta: {
        total,
        page: query.page,
        pageSize: query.pageSize,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('GET /api/entries error:', error)

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '获取条目列表失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// POST /api/entries - 创建条目（需要认证）
export async function POST(request: NextRequest) {
  // 验证权限
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()

    // 验证输入
    const validated = createEntrySchema.parse(body)

    // 检查 slug 唯一性
    const existing = await prisma.potteryEntry.findUnique({
      where: { slug: validated.slug },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_SLUG',
            message: `Slug "${validated.slug}" 已存在`,
          },
        },
        { status: 400 }
      )
    }

    // 创建条目
    const entry = await prisma.potteryEntry.create({
      data: {
        slug: validated.slug,
        nameZh: validated.nameZh,
        nameJa: validated.nameJa,
        nameEn: validated.nameEn || null,
        category: validated.category,
        region: validated.region,
        type: validated.type || null,
        description: validated.description,
        positioning: validated.positioning,
        signatureFeatures: validated.signatureFeatures as any,
        keywords: validated.keywords,
        notableArtists: validated.notableArtists as any,
        representativeForms: validated.representativeForms as any,
        sources: validated.sources as any,
        artistId: validated.artistId || null,
        instagramHandle: validated.instagramHandle || null,
        instagramFollowers: validated.instagramFollowers || null,
        priceRange: validated.priceRange || null,
        exhibitionCount: validated.exhibitionCount || null,
        published: validated.published,
        publishedAt: validated.published ? new Date() : null,
        relatedProductIds: [],
        seoKeywords: [],
      },
    })

    const response: ApiResponse = {
      success: true,
      data: entry,
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/entries error:', error)

    // Zod 验证错误
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '输入数据验证失败',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '创建条目失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}
