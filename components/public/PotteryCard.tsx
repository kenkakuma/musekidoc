import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { PotteryEntryData } from '@/lib/db/types'

interface PotteryCardProps {
  entry: PotteryEntryData
}

export function PotteryCard({ entry }: PotteryCardProps) {
  return (
    <Link href={`/pottery/${entry.slug}`}>
      <div className="group rounded-lg border bg-white p-4 hover:shadow-lg transition-all duration-200 h-full flex flex-col">
        {/* 图片（如果有） */}
        {entry.images && Array.isArray(entry.images) && entry.images.length > 0 && (
          <div className="aspect-video w-full overflow-hidden rounded-md bg-slate-100 mb-3">
            <img
              src={entry.images[0].url}
              alt={entry.images[0].alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}

        {/* 标题 */}
        <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">
          {entry.nameZh}
        </h3>

        {/* 日文名 */}
        <p className="text-sm text-slate-600 mb-2 font-jp">
          {entry.nameJa}
        </p>

        {/* 产地 */}
        <p className="text-sm text-slate-500 mb-3 flex-grow">{entry.region}</p>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-2 mt-auto">
          <Badge variant="secondary" className="text-xs">
            {entry.category.split('/')[0]}
          </Badge>
          {entry.keywords.slice(0, 2).map((keyword) => (
            <Badge key={keyword} variant="outline" className="text-xs">
              {keyword}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  )
}
