import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'admin-session'
const SESSION_SECRET = process.env.ADMIN_PASSWORD || 'admin123'

/**
 * 服务端：检查是否已登录
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE_NAME)
  return session?.value === SESSION_SECRET
}

/**
 * 服务端：要求认证，未登录则重定向
 */
export async function requireAuth() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    return {
      redirect: '/admin/login',
    }
  }
  return null
}
