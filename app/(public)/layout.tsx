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
    <div className="min-h-screen washi-texture">
      {/* Header with Japanese Aesthetic */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 md:px-12 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="group transition-all duration-300 hover:translate-x-1">
              <h1 className="text-2xl font-serif font-medium text-foreground group-hover:text-accent transition-colors">
                日本陶器知识库
              </h1>
              <p className="text-xs text-muted-foreground font-jp tracking-wider">
                Japan Pottery Knowledge Base
              </p>
            </Link>
            <nav className="hidden md:flex gap-8">
              <Link
                href="/"
                className="text-sm font-medium text-foreground/80 hover:text-accent transition-colors relative group"
              >
                首页
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/guide"
                className="text-sm font-medium text-foreground/80 hover:text-accent transition-colors relative group"
              >
                导览
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/categories"
                className="text-sm font-medium text-foreground/80 hover:text-accent transition-colors relative group"
              >
                分类
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/techniques"
                className="text-sm font-medium text-foreground/80 hover:text-accent transition-colors relative group"
              >
                技法
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/pottery"
                className="text-sm font-medium text-foreground/80 hover:text-accent transition-colors relative group"
              >
                陶器
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/artists"
                className="text-sm font-medium text-foreground/80 hover:text-accent transition-colors relative group"
              >
                作家
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/admin"
                className="text-sm font-medium text-muted-foreground/60 hover:text-accent transition-colors relative group"
              >
                管理
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
              </Link>
            </nav>
            {/* Mobile Menu - TODO: Add mobile navigation */}
            <button className="md:hidden text-foreground/80">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-200px)]">{children}</main>

      {/* Footer with Zen Design */}
      <footer className="border-t border-border/50 bg-gradient-to-b from-sand/10 to-ivory/20 mt-24">
        <div className="container mx-auto px-6 md:px-12 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="font-serif font-medium text-foreground mb-4">探索</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/guide" className="hover:text-accent transition-colors">陶艺导览</Link></li>
                  <li><Link href="/categories" className="hover:text-accent transition-colors">分类目录</Link></li>
                  <li><Link href="/techniques" className="hover:text-accent transition-colors">技法百科</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif font-medium text-foreground mb-4">浏览</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/pottery" className="hover:text-accent transition-colors">陶器条目</Link></li>
                  <li><Link href="/artists" className="hover:text-accent transition-colors">陶艺作家</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif font-medium text-foreground mb-4">关于</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/about" className="hover:text-accent transition-colors">关于项目</Link></li>
                </ul>
              </div>
            </div>

            <div className="divider-brush my-8" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                © 2026 Japan Pottery Knowledge Base
              </p>
              <p className="text-xs text-muted-foreground/60 font-jp tracking-wider">
                探索日本陶艺之美 | Discover the beauty of Japanese pottery
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
