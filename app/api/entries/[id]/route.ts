import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { updateEntrySchema } from '@/lib/validations/entry'
import { requireAuth } from '@/lib/auth/middleware'
import type { ApiResponse } from '@/lib/db/types'

// GET /api/entries/[id] - 获取单个条目
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entry = await prisma.potteryEntry.findUnique({
      where: { id: params.id },
      include: {
        artist: true,
      },
    })

    if (!entry) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '条目不存在',
          },
        },
        { status: 404 }
      )
    }

    const response: ApiResponse = {
      success: true,
      data: entry,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error(`GET /api/entries/${params.id} error:`, error)

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '获取条目失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// PUT /api/entries/[id] - 更新条目（需要认证）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const validated = updateEntrySchema.parse(body)

    // 检查条目是否存在
    const existing = await prisma.potteryEntry.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '条目不存在',
          },
        },
        { status: 404 }
      )
    }

    // 如果更新 slug，检查新 slug 唯一性
    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await prisma.potteryEntry.findUnique({
        where: { slug: validated.slug },
      })

      if (slugExists) {
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
    }

    // 构建更新数据
    const updateData: any = {}

    // 只更新提供的字段
    Object.keys(validated).forEach((key) => {
      const value = (validated as any)[key]
      if (value !== undefined) {
        updateData[key] = value
      }
    })

    // 如果更新 published 状态为 true，设置 publishedAt
    if (validated.published === true && !existing.publishedAt) {
      updateData.publishedAt = new Date()
    }

    // 更新条目
    const entry = await prisma.potteryEntry.update({
      where: { id: params.id },
      data: updateData,
    })

    const response: ApiResponse = {
      success: true,
      data: entry,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error(`PUT /api/entries/${params.id} error:`, error)

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
        message: error.message || '更新条目失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// DELETE /api/entries/[id] - 删除条目（需要认证）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const entry = await prisma.potteryEntry.findUnique({
      where: { id: params.id },
    })

    if (!entry) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '条目不存在',
          },
        },
        { status: 404 }
      )
    }

    await prisma.potteryEntry.delete({
      where: { id: params.id },
    })

    const response: ApiResponse = {
      success: true,
      data: { id: params.id },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error(`DELETE /api/entries/${params.id} error:`, error)

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '删除条目失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}
