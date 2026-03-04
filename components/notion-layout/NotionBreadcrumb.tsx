'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  labelJa?: string
  href?: string
}

interface NotionBreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function NotionBreadcrumb({ items }: NotionBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm font-serif mb-8">
      {/* Home */}
      <Link
        href="/"
        className="flex items-center gap-1.5 text-ink-light hover:text-ink-dark transition-colors group"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="group-hover:underline decoration-clay-terracotta/50 underline-offset-4">
          首页
        </span>
      </Link>

      {/* Items */}
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-3.5 h-3.5 text-ink-light/50" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-ink-light hover:text-ink-dark transition-colors group"
            >
              <span className="group-hover:underline decoration-clay-terracotta/50 underline-offset-4">
                {item.label}
              </span>
              {item.labelJa && (
                <span className="ml-1.5 text-xs text-ink-light/70">
                  {item.labelJa}
                </span>
              )}
            </Link>
          ) : (
            <span className="text-ink-dark">
              {item.label}
              {item.labelJa && (
                <span className="ml-1.5 text-xs text-ink-light">
                  {item.labelJa}
                </span>
              )}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
