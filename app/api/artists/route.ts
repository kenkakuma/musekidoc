import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { createArtistSchema } from '@/lib/validations/artist'

// GET /api/artists - 获取作家列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 分页参数
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const skip = (page - 1) * pageSize

    // 搜索参数
    const search = searchParams.get('search') || ''
    const published = searchParams.get('published')

    // 构建查询条件
    const where: any = {}

    // 发布状态筛选
    if (published === 'true') {
      where.published = true
    } else if (published === 'false') {
      where.published = false
    }

    // 搜索（支持中文名、日文名、英文名）
    if (search) {
      where.OR = [
        { nameZh: { contains: search } },
        { nameJa: { contains: search } },
        { nameEn: { contains: search } },
        { region: { contains: search } },
        { style: { contains: search } },
      ]
    }

    // 查询总数
    const total = await prisma.artist.count({ where })

    // 查询数据
    const artists = await prisma.artist.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: artists,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error: any) {
    console.error('GET /api/artists error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '获取作家列表失败',
      },
      { status: 500 }
    )
  }
}

// POST /api/artists - 创建新作家
export async function POST(request: NextRequest) {
  try {
    // 简单认证检查
    const authHeader = request.headers.get('Authorization')
    const expectedAuth = `Bearer ${process.env.ADMIN_PASSWORD || 'admin123'}`

    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = createArtistSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: '数据验证失败',
            details: validationResult.error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // 检查 slug 是否已存在
    const existing = await prisma.artist.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { message: `Slug "${data.slug}" 已存在` },
        },
        { status: 409 }
      )
    }

    // 创建作家
    const artist = await prisma.artist.create({
      data: {
        slug: data.slug,
        nameZh: data.nameZh,
        nameJa: data.nameJa,
        nameEn: data.nameEn,
        bio: data.bio,
        birthYear: data.birthYear,
        deathYear: data.deathYear,
        region: data.region,
        style: data.style,
        awards: data.awards || [],
        exhibitions: data.exhibitions || [],
        sources: data.sources,
        websiteUrl: data.websiteUrl,
        instagramHandle: data.instagramHandle,
        priceRange: data.priceRange,
        published: data.published,
      },
    })

    return NextResponse.json({
      success: true,
      data: artist,
    })
  } catch (error: any) {
    console.error('POST /api/artists error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || '创建作家失败' },
      },
      { status: 500 }
    )
  }
}
