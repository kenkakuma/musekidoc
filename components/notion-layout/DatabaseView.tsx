'use client'

import { useState } from 'react'
import { LayoutGrid, List, Table, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type ViewType = 'table' | 'gallery' | 'list'

interface DatabaseItem {
  id: string
  slug: string
  nameZh: string
  nameJa?: string
  category?: string
  region?: string
  positioning?: string
  description?: string
  images?: string[]
  keywords?: string[]
}

interface DatabaseViewProps {
  items: DatabaseItem[]
  title: string
  titleJa?: string
}

export default function DatabaseView({ items, title, titleJa }: DatabaseViewProps) {
  const [viewType, setViewType] = useState<ViewType>('gallery')
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-4xl text-ink-dark mb-2 tracking-wide">
            {title}
          </h1>
          {titleJa && (
            <p className="font-serif text-lg text-ink-light tracking-wider">
              {titleJa}
            </p>
          )}
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-3">
          {/* View Type Selector */}
          <div className="flex items-center bg-white/60 border border-ink-light/20 rounded-lg p-1">
            <button
              onClick={() => setViewType('table')}
              className={`
                p-2 rounded transition-all duration-200
                ${viewType === 'table' ? 'bg-clay-warm/40 text-ink-dark shadow-sm' : 'text-ink-light hover:text-ink-dark'}
              `}
              title="表格视图"
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewType('gallery')}
              className={`
                p-2 rounded transition-all duration-200
                ${viewType === 'gallery' ? 'bg-clay-warm/40 text-ink-dark shadow-sm' : 'text-ink-light hover:text-ink-dark'}
              `}
              title="画廊视图"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`
                p-2 rounded transition-all duration-200
                ${viewType === 'list' ? 'bg-clay-warm/40 text-ink-dark shadow-sm' : 'text-ink-light hover:text-ink-dark'}
              `}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter & Sort */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="
              px-3 py-2 bg-white/60 border border-ink-light/20 rounded-lg
              text-sm font-serif text-ink-medium hover:text-ink-dark
              hover:border-clay-terracotta/30 transition-all duration-200
              flex items-center gap-2
            "
          >
            <SlidersHorizontal className="w-4 h-4" />
            筛选
          </button>
          <button className="
              px-3 py-2 bg-white/60 border border-ink-light/20 rounded-lg
              text-sm font-serif text-ink-medium hover:text-ink-dark
              hover:border-clay-terracotta/30 transition-all duration-200
              flex items-center gap-2
            "
          >
            <ArrowUpDown className="w-4 h-4" />
            排序
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-6 bg-white/40 border border-ink-light/20 rounded-xl backdrop-blur-sm">
          <p className="text-sm font-serif text-ink-light">筛选功能开发中...</p>
        </div>
      )}

      {/* Database Content */}
      <div className="mt-8">
        {viewType === 'table' && <TableView items={items} />}
        {viewType === 'gallery' && <GalleryView items={items} />}
        {viewType === 'list' && <ListView items={items} />}
      </div>

      {/* Results Count */}
      <div className="mt-8 text-center text-sm font-serif text-ink-light">
        共 {items.length} 个条目
      </div>
    </div>
  )
}

// Table View
function TableView({ items }: { items: DatabaseItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-ink-light/20">
            <th className="px-6 py-4 text-left font-serif text-sm text-ink-medium font-normal">名称</th>
            <th className="px-6 py-4 text-left font-serif text-sm text-ink-medium font-normal">分类</th>
            <th className="px-6 py-4 text-left font-serif text-sm text-ink-medium font-normal">地区</th>
            <th className="px-6 py-4 text-left font-serif text-sm text-ink-medium font-normal">定位</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.id}
              className="border-b border-ink-light/10 hover:bg-washi-cream/50 transition-colors group"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <td className="px-6 py-4">
                <Link href={`/pottery/${item.slug}`} className="block group-hover:text-clay-terracotta transition-colors">
                  <div className="font-serif text-ink-dark">{item.nameZh}</div>
                  {item.nameJa && (
                    <div className="font-serif text-xs text-ink-light mt-0.5">{item.nameJa}</div>
                  )}
                </Link>
              </td>
              <td className="px-6 py-4">
                <span className="inline-block px-2.5 py-1 bg-clay-warm/20 text-ink-medium text-xs font-serif rounded-md">
                  {item.category || '-'}
                </span>
              </td>
              <td className="px-6 py-4 font-serif text-sm text-ink-medium">{item.region || '-'}</td>
              <td className="px-6 py-4 font-serif text-sm text-ink-light">{item.positioning || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Gallery View
function GalleryView({ items }: { items: DatabaseItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <Link
          key={item.id}
          href={`/pottery/${item.slug}`}
          className="group block"
          style={{
            animation: 'fadeInUp 0.5s ease-out forwards',
            animationDelay: `${index * 50}ms`,
            opacity: 0,
          }}
        >
          <div className="
            h-full bg-white/60 border border-ink-light/20 rounded-xl overflow-hidden
            hover:shadow-xl hover:border-clay-terracotta/30
            transition-all duration-300
          ">
            {/* Image */}
            {item.images && item.images.length > 0 ? (
              <div className="aspect-[4/3] bg-gradient-to-br from-washi-cream to-clay-warm/30 overflow-hidden">
                <Image
                  src={item.images[0]}
                  alt={item.nameZh}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-gradient-to-br from-washi-cream to-clay-warm/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-serif text-6xl text-ink-light/20 mb-2">陶</div>
                  <div className="font-serif text-xs text-ink-light/40">暂无图片</div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-5">
              <h3 className="font-serif text-lg text-ink-dark mb-1 group-hover:text-clay-terracotta transition-colors">
                {item.nameZh}
              </h3>
              {item.nameJa && (
                <p className="font-serif text-xs text-ink-light mb-3 tracking-wider">
                  {item.nameJa}
                </p>
              )}

              {item.category && (
                <div className="mb-3">
                  <span className="inline-block px-2.5 py-1 bg-clay-warm/20 text-ink-medium text-xs font-serif rounded-md">
                    {item.category.split('/')[0]}
                  </span>
                </div>
              )}

              {item.positioning && (
                <p className="font-serif text-sm text-ink-light leading-relaxed line-clamp-2">
                  {item.positioning}
                </p>
              )}

              {/* Keywords */}
              {item.keywords && item.keywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.keywords.slice(0, 3).map((keyword, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-glaze-celadon/10 text-ink-medium text-xs font-serif rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

// List View
function ListView({ items }: { items: DatabaseItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <Link
          key={item.id}
          href={`/pottery/${item.slug}`}
          className="
            block p-5 bg-white/60 border border-ink-light/20 rounded-xl
            hover:shadow-lg hover:border-clay-terracotta/30
            transition-all duration-300 group
          "
          style={{
            animation: 'fadeInUp 0.4s ease-out forwards',
            animationDelay: `${index * 40}ms`,
            opacity: 0,
          }}
        >
          <div className="flex items-start gap-5">
            {/* Icon/Image */}
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-washi-cream to-clay-warm/30 rounded-lg flex items-center justify-center">
              <span className="font-serif text-2xl text-ink-light/40">陶</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-serif text-lg text-ink-dark mb-1 group-hover:text-clay-terracotta transition-colors">
                {item.nameZh}
                {item.nameJa && (
                  <span className="ml-2 text-sm text-ink-light tracking-wider">
                    {item.nameJa}
                  </span>
                )}
              </h3>

              {item.positioning && (
                <p className="font-serif text-sm text-ink-medium mb-2 leading-relaxed">
                  {item.positioning}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs">
                {item.category && (
                  <span className="px-2.5 py-1 bg-clay-warm/20 text-ink-medium font-serif rounded-md">
                    {item.category.split('/')[0]}
                  </span>
                )}
                {item.region && (
                  <span className="text-ink-light font-serif">
                    {item.region}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

// Add animation keyframes to globals.css
