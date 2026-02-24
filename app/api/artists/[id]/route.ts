import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { updateArtistSchema } from '@/lib/validations/artist'

// GET /api/artists/[id] - 获取单个作家
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artist = await prisma.artist.findUnique({
      where: { id: params.id },
      include: {
        potteryEntries: {
          where: { published: true },
          select: {
            id: true,
            slug: true,
            nameZh: true,
            nameJa: true,
            category: true,
            region: true,
          },
        },
      },
    })

    if (!artist) {
      return NextResponse.json(
        { success: false, error: '作家不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: artist,
    })
  } catch (error: any) {
    console.error('GET /api/artists/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '获取作家失败',
      },
      { status: 500 }
    )
  }
}

// PUT /api/artists/[id] - 更新作家
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validationResult = updateArtistSchema.safeParse(body)

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

    // 检查作家是否存在
    const existing = await prisma.artist.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { message: '作家不存在' } },
        { status: 404 }
      )
    }

    // 如果更新 slug，检查新 slug 是否已被使用
    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await prisma.artist.findUnique({
        where: { slug: data.slug },
      })

      if (slugTaken) {
        return NextResponse.json(
          {
            success: false,
            error: { message: `Slug "${data.slug}" 已被使用` },
          },
          { status: 409 }
        )
      }
    }

    // 更新作家
    const artist = await prisma.artist.update({
      where: { id: params.id },
      data: {
        ...(data.slug && { slug: data.slug }),
        ...(data.nameZh && { nameZh: data.nameZh }),
        ...(data.nameJa && { nameJa: data.nameJa }),
        ...(data.nameEn !== undefined && { nameEn: data.nameEn }),
        ...(data.bio && { bio: data.bio }),
        ...(data.birthYear !== undefined && { birthYear: data.birthYear }),
        ...(data.deathYear !== undefined && { deathYear: data.deathYear }),
        ...(data.region !== undefined && { region: data.region }),
        ...(data.style !== undefined && { style: data.style }),
        ...(data.awards !== undefined && { awards: data.awards || [] }),
        ...(data.exhibitions !== undefined && { exhibitions: data.exhibitions || [] }),
        ...(data.sources && { sources: data.sources }),
        ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
        ...(data.instagramHandle !== undefined && { instagramHandle: data.instagramHandle }),
        ...(data.priceRange !== undefined && { priceRange: data.priceRange }),
        ...(data.published !== undefined && { published: data.published }),
      },
    })

    return NextResponse.json({
      success: true,
      data: artist,
    })
  } catch (error: any) {
    console.error('PUT /api/artists/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message || '更新作家失败' },
      },
      { status: 500 }
    )
  }
}

// DELETE /api/artists/[id] - 删除作家
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 检查作家是否存在
    const artist = await prisma.artist.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { potteryEntries: true },
        },
      },
    })

    if (!artist) {
      return NextResponse.json(
        { success: false, error: '作家不存在' },
        { status: 404 }
      )
    }

    // 检查是否有关联的陶器条目
    if (artist._count.potteryEntries > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `无法删除：该作家有 ${artist._count.potteryEntries} 个关联的陶器条目`,
        },
        { status: 409 }
      )
    }

    // 删除作家
    await prisma.artist.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      data: { id: params.id },
    })
  } catch (error: any) {
    console.error('DELETE /api/artists/[id] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '删除作家失败',
      },
      { status: 500 }
    )
  }
}
