'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Layers } from 'lucide-react'

export default function LayoutSwitcher() {
  const pathname = usePathname()
  const isNotionLayout = pathname.startsWith('/notion')

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col gap-2">
        {/* Layout Toggle Button */}
        <Link
          href={isNotionLayout ? '/' : '/notion'}
          className="
            group flex items-center gap-3 px-4 py-3
            bg-white/90 backdrop-blur-sm border border-ink-light/30 rounded-xl
            shadow-lg hover:shadow-2xl
            transition-all duration-300
            hover:scale-105
          "
          title={isNotionLayout ? '切换到传统布局' : '切换到Notion布局'}
        >
          <div className="relative">
            {isNotionLayout ? (
              <Layers className="w-5 h-5 text-ink-dark" />
            ) : (
              <LayoutGrid className="w-5 h-5 text-ink-dark" />
            )}
          </div>

          <div className="font-serif text-sm">
            <div className="text-ink-dark font-medium">
              {isNotionLayout ? '传统布局' : 'Notion布局'}
            </div>
            <div className="text-ink-light text-xs">
              {isNotionLayout ? 'Classic View' : 'Notion View'}
            </div>
          </div>

          {/* Badge */}
          <div className="ml-2 px-2 py-0.5 bg-clay-terracotta/20 text-clay-terracotta text-xs font-serif rounded">
            {isNotionLayout ? '传统' : '新版'}
          </div>
        </Link>

        {/* Help Text */}
        <div className="text-center text-xs text-ink-light font-serif">
          试试新界面 👀
        </div>
      </div>
    </div>
  )
}
