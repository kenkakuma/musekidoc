import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import crypto from 'crypto'
import type { ApiResponse } from '@/lib/db/types'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// 生成唯一文件名
function generateFileName(originalName: string): string {
  const ext = originalName.split('.').pop() || 'jpg'
  const hash = crypto.randomBytes(16).toString('hex')
  const timestamp = Date.now()
  return `${timestamp}-${hash}.${ext}`
}

// POST /api/upload - 上传图片（需要认证）
export async function POST(request: NextRequest) {
  // 验证权限
  const authError = await requireAuth(request)
  if (authError) return authError

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_FILE',
            message: '未提供文件',
          },
        },
        { status: 400 }
      )
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: `不支持的文件类型。仅支持: ${ALLOWED_TYPES.join(', ')}`,
          },
        },
        { status: 400 }
      )
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      const maxSizeMB = MAX_FILE_SIZE / 1024 / 1024
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `文件过大。最大允许 ${maxSizeMB}MB`,
          },
        },
        { status: 400 }
      )
    }

    // 确保上传目录存在
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // 读取文件buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 使用 Sharp 处理图片
    const fileName = generateFileName(file.name)
    const filePath = join(UPLOAD_DIR, fileName)

    // 获取图片元数据
    const metadata = await sharp(buffer).metadata()

    // 处理图片：
    // 1. 转换为 WebP 格式（更小的文件大小）
    // 2. 限制最大宽度为 1920px（保持宽高比）
    // 3. 优化质量
    const optimizedFileName = fileName.replace(/\.(jpg|jpeg|png|webp)$/i, '.webp')
    const optimizedFilePath = join(UPLOAD_DIR, optimizedFileName)

    const optimizedImage = await sharp(buffer)
      .resize(1920, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(optimizedFilePath)

    // 获取优化后的图片尺寸
    const { width: optimizedWidth, height: optimizedHeight } = optimizedImage

    // 生成缩略图（用于列表展示）
    const thumbFileName = optimizedFileName.replace('.webp', '-thumb.webp')
    const thumbFilePath = join(UPLOAD_DIR, thumbFileName)

    await sharp(buffer)
      .resize(400, 300, {
        fit: 'cover',
      })
      .webp({ quality: 80 })
      .toFile(thumbFilePath)

    // 返回图片信息
    const response: ApiResponse = {
      success: true,
      data: {
        id: crypto.randomBytes(8).toString('hex'),
        url: `/uploads/${optimizedFileName}`,
        thumbnailUrl: `/uploads/${thumbFileName}`,
        alt: file.name.replace(/\.[^.]+$/, ''), // 去掉扩展名作为alt
        width: optimizedWidth,
        height: optimizedHeight,
        size: file.size,
        format: 'webp',
      },
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/upload error:', error)

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message || '图片上传失败',
      },
    }

    return NextResponse.json(response, { status: 500 })
  }
}

// GET /api/upload - 获取上传限制信息（公开）
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      maxFileSize: MAX_FILE_SIZE,
      maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
      allowedTypes: ALLOWED_TYPES,
      allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    },
  })
}
