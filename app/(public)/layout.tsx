import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '日本陶器知识库 | Japan Pottery Knowledge Base',
  description: '探索日本陶艺的历史、技法与名家作品',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:opacity-80">
              <h1 className="text-xl font-bold text-slate-900">
                日本陶器知识库
              </h1>
              <p className="text-xs text-slate-500 font-jp">Japan Pottery Knowledge Base</p>
            </Link>
            <nav className="flex gap-6">
              <Link href="/" className="text-sm text-slate-700 hover:text-blue-600 transition-colors">
                首页
              </Link>
              <Link href="/artists" className="text-sm text-slate-700 hover:text-blue-600 transition-colors">
                作家
              </Link>
              <Link href="/admin" className="text-sm text-slate-700 hover:text-blue-600 transition-colors">
                管理
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-200px)]">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sm text-slate-600">
              © 2026 Japan Pottery Knowledge Base
            </p>
            <p className="text-xs text-slate-500 mt-2">
              探索日本陶艺之美 | Discover the beauty of Japanese pottery
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
