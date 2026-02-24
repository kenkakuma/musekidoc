import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth/session'
import { LogoutButton } from '@/components/admin/LogoutButton'

export const metadata: Metadata = {
  title: '管理后台 - 日本陶器知识库',
  description: '内容管理系统',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 检查认证（登录页面除外）
  const authenticated = await isAuthenticated()

  // 如果未登录且不在登录页，重定向到登录页
  // 注意：这里需要在客户端判断当前路径，所以我们在每个需要认证的页面单独处理

  return (
    <div className="min-h-screen bg-slate-50">
      {authenticated ? (
        <div className="flex h-screen">
          {/* 侧边栏 */}
          <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-200">
              <Link href="/admin" className="block">
                <h1 className="text-lg font-bold text-slate-900">
                  陶器知识库
                </h1>
                <p className="text-xs text-slate-500 mt-1">管理后台</p>
              </Link>
            </div>

            {/* 导航菜单 */}
            <nav className="flex-1 p-4">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    📊 仪表板
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/entries"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    🏺 陶器管理
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/artists"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    👨‍🎨 作家管理
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/import"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    📥 批量导入
                  </Link>
                </li>
              </ul>

              {/* 快捷操作 */}
              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                  快捷操作
                </p>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/admin/entries/new"
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium"
                    >
                      + 新建陶器条目
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/artists/new"
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors font-medium"
                    >
                      + 新建作家
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>

            {/* 底部信息 */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-600">AI</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Admin</p>
                    <p className="text-xs text-slate-500">管理员</p>
                  </div>
                </div>
                <LogoutButton />
              </div>
            </div>
          </aside>

          {/* 主内容区域 */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">{children}</div>
          </main>
        </div>
      ) : (
        // 未登录时直接显示内容（登录页）
        children
      )}
    </div>
  )
}
