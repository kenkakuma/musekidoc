'use client'

import { ReactNode } from 'react'
import NotionSidebar from './NotionSidebar'

interface NotionLayoutProps {
  children: ReactNode
}

export default function NotionLayout({ children }: NotionLayoutProps) {
  return (
    <div className="min-h-screen bg-washi-white">
      {/* Washi Paper Texture Background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Sidebar */}
      <NotionSidebar />

      {/* Main Content */}
      <main className="pl-72 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-12 py-12">
          <div className="relative">
            {/* Content with subtle shadow */}
            <div className="relative z-10">
              {children}
            </div>

            {/* Decorative Element - 和纸边缘效果 */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-l-2 border-t-2 border-clay-warm/20 rounded-tl-3xl pointer-events-none" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-clay-warm/20 rounded-br-3xl pointer-events-none" />
          </div>
        </div>
      </main>
    </div>
  )
}
