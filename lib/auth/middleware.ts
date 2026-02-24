import { NextRequest, NextResponse } from 'next/server'

export async function requireAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未提供认证令牌',
        },
      },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  if (token !== adminPassword) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '认证令牌无效',
        },
      },
      { status: 403 }
    )
  }

  return null // Auth passed
}
