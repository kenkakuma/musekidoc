import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { z } from 'zod'

// 批量导入验证 schema（简化版，只要求必填字段）
const BulkEntrySchema = z.object({
  slug: z.string().min(1),
  nameZh: z.string().min(1),
  nameJa: z.string().min(1),
  nameEn: z.string().optional(),
  category: z.string().min(1),
  region: z.string().min(1),
  type: z.string().optional(),
  description: z.string().min(1),
  positioning: z.string().min(1),
  signatureFeatures: z.array(z.string()),
  keywords: z.array(z.string()),
  notableArtists: z.array(z.string()).optional().default([]),
  representativeForms: z.array(z.string()).optional().default([]),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
    })
  ),
  published: z.boolean().default(false),
  artistId: z.string().optional(),
})

const BulkImportRequestSchema = z.object({
  entries: z.array(BulkEntrySchema),
  updateExisting: z.boolean().default(false), // 如果slug已存在，是否更新
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

    const { entries, updateExisting } = validationResult.data

    // 批量导入处理
    const results = {
      total: entries.length,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as any[],
      created: [] as any[],
      updated: [] as any[],
    }

    for (const entry of entries) {
      try {
        // 检查slug是否已存在
        const existing = await prisma.potteryEntry.findUnique({
          where: { slug: entry.slug },
        })

        if (existing) {
          if (updateExisting) {
            // 更新现有条目
            const updated = await prisma.potteryEntry.update({
              where: { slug: entry.slug },
              data: {
                nameZh: entry.nameZh,
                nameJa: entry.nameJa,
                nameEn: entry.nameEn,
                category: entry.category,
                region: entry.region,
                type: entry.type,
                description: entry.description,
                positioning: entry.positioning,
                signatureFeatures: entry.signatureFeatures,
                keywords: entry.keywords,
                notableArtists: entry.notableArtists,
                representativeForms: entry.representativeForms,
                sources: entry.sources,
                published: entry.published,
                artistId: entry.artistId,
              },
            })
            results.success++
            results.updated.push({ slug: entry.slug, id: updated.id })
          } else {
            // 跳过已存在的
            results.skipped++
            results.errors.push({
              slug: entry.slug,
              error: 'Slug已存在，跳过（使用updateExisting=true来更新）',
            })
          }
        } else {
          // 创建新条目
          const created = await prisma.potteryEntry.create({
            data: {
              slug: entry.slug,
              nameZh: entry.nameZh,
              nameJa: entry.nameJa,
              nameEn: entry.nameEn,
              category: entry.category,
              region: entry.region,
              type: entry.type,
              description: entry.description,
              positioning: entry.positioning,
              signatureFeatures: entry.signatureFeatures,
              keywords: entry.keywords,
              notableArtists: entry.notableArtists,
              representativeForms: entry.representativeForms,
              sources: entry.sources,
              published: entry.published,
              artistId: entry.artistId,
            },
          })
          results.success++
          results.created.push({ slug: entry.slug, id: created.id })
        }
      } catch (error: any) {
        results.failed++
        results.errors.push({
          slug: entry.slug,
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
    console.error('Bulk import error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || '服务器错误',
      },
      { status: 500 }
    )
  }
}
