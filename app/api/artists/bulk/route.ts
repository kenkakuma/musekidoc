import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { z } from 'zod'

// 批量导入作家验证 schema
const BulkArtistSchema = z.object({
  slug: z.string().min(1),
  nameZh: z.string().min(1),
  nameJa: z.string().min(1),
  nameEn: z.string().optional(),
  bio: z.string().min(1),
  birthYear: z.number().int().optional(),
  deathYear: z.number().int().optional(),
  region: z.string().optional(),
  style: z.string().optional(),
  awards: z.array(z.string()).optional(),
  exhibitions: z.array(
    z.object({
      year: z.number().int(),
      title: z.string(),
      venue: z.string().optional(),
    })
  ).optional(),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
    })
  ),
  websiteUrl: z.string().url().optional(),
  instagramHandle: z.string().optional(),
  priceRange: z.string().optional(),
  published: z.boolean().default(false),
})

const BulkImportRequestSchema = z.object({
  artists: z.array(BulkArtistSchema),
  updateExisting: z.boolean().default(false),
})

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
    const validationResult = BulkImportRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '数据验证失败',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { artists, updateExisting } = validationResult.data

    // 批量导入处理
    const results = {
      total: artists.length,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as any[],
      created: [] as any[],
      updated: [] as any[],
    }

    for (const artist of artists) {
      try {
        // 检查slug是否已存在
        const existing = await prisma.artist.findUnique({
          where: { slug: artist.slug },
        })

        if (existing) {
          if (updateExisting) {
            // 更新现有作家
            const updated = await prisma.artist.update({
              where: { slug: artist.slug },
              data: {
                nameZh: artist.nameZh,
                nameJa: artist.nameJa,
                nameEn: artist.nameEn,
                bio: artist.bio,
                birthYear: artist.birthYear,
                deathYear: artist.deathYear,
                region: artist.region,
                style: artist.style,
                awards: artist.awards || [],
                exhibitions: artist.exhibitions || [],
                sources: artist.sources,
                websiteUrl: artist.websiteUrl,
                instagramHandle: artist.instagramHandle,
                priceRange: artist.priceRange,
                published: artist.published,
              },
            })
            results.success++
            results.updated.push({ slug: artist.slug, id: updated.id })
          } else {
            // 跳过已存在的
            results.skipped++
            results.errors.push({
              slug: artist.slug,
              error: 'Slug已存在，跳过（使用updateExisting=true来更新）',
            })
          }
        } else {
          // 创建新作家
          const created = await prisma.artist.create({
            data: {
              slug: artist.slug,
              nameZh: artist.nameZh,
              nameJa: artist.nameJa,
              nameEn: artist.nameEn,
              bio: artist.bio,
              birthYear: artist.birthYear,
              deathYear: artist.deathYear,
              region: artist.region,
              style: artist.style,
              awards: artist.awards || [],
              exhibitions: artist.exhibitions || [],
              sources: artist.sources,
              websiteUrl: artist.websiteUrl,
              instagramHandle: artist.instagramHandle,
              priceRange: artist.priceRange,
              published: artist.published,
            },
          })
          results.success++
          results.created.push({ slug: artist.slug, id: created.id })
        }
      } catch (error: any) {
        results.failed++
        results.errors.push({
          slug: artist.slug,
          error: error.message || '未知错误',
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `批量导入完成：${results.success}个成功，${results.failed}个失败，${results.skipped}个跳过`,
      results,
    })
  } catch (error: any) {
    console.error('Bulk import artists error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    )
  }
}
