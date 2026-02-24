import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { ArtistData } from '@/lib/db/types'

interface ArtistCardProps {
  artist: ArtistData
}

export function ArtistCard({ artist }: ArtistCardProps) {
  // 计算年龄/时期
  const yearInfo = () => {
    if (artist.birthYear && artist.deathYear) {
      return `${artist.birthYear} - ${artist.deathYear}`
    } else if (artist.birthYear) {
      const age = new Date().getFullYear() - artist.birthYear
      return `${artist.birthYear} 年生 (${age}岁)`
    }
    return null
  }

  return (
    <Link href={`/artists/${artist.slug}`}>
      <div className="group rounded-lg border bg-white p-4 hover:shadow-lg transition-all duration-200 h-full flex flex-col">
        {/* 头像 */}
        <div className="aspect-square w-full overflow-hidden rounded-md bg-slate-100 mb-3">
          {artist.avatar ? (
            <img
              src={artist.avatar}
              alt={artist.nameZh}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          )}
        </div>

        {/* 姓名 */}
        <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 transition-colors">
          {artist.nameZh}
        </h3>

        {/* 日文名 */}
        <p className="text-sm text-slate-600 mb-2 font-jp">
          {artist.nameJa}
        </p>

        {/* 年份信息 */}
        {yearInfo() && (
          <p className="text-sm text-slate-500 mb-3">{yearInfo()}</p>
        )}

        {/* 简介预览 */}
        <p className="text-sm text-slate-600 mb-3 flex-grow line-clamp-2">
          {artist.bio.substring(0, 80)}...
        </p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {artist.exhibitionCount && artist.exhibitionCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {artist.exhibitionCount} 次展览
            </Badge>
          )}
          {artist.avgPriceRange && (
            <Badge variant="outline" className="text-xs">
              {artist.avgPriceRange}
            </Badge>
          )}
          {artist.instagramHandle && (
            <Badge variant="outline" className="text-xs">
              Instagram
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}
