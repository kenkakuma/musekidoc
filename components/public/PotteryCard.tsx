import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'
import type { PotteryEntryData } from '@/lib/db/types'

interface PotteryCardProps {
  entry: PotteryEntryData
}

export function PotteryCard({ entry }: PotteryCardProps) {
  return (
    <Link href={`/pottery/${entry.slug}`} className="group block h-full">
      <article className="card-zen h-full flex flex-col overflow-hidden p-0">
        {/* Image with Organic Shadow */}
        {entry.images && Array.isArray(entry.images) && entry.images.length > 0 && (
          <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-sand/10 to-ivory/20 relative">
            <img
              src={entry.images[0].url}
              alt={entry.images[0].alt}
              className="w-full h-full object-cover img-zen transition-all duration-[600ms] group-hover:scale-[1.03]"
            />
            {/* Decorative Corner Accent */}
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-accent/40 rounded-tr-sm opacity-0 group-hover:opacity-100 transition-opacity duration-[600ms]" />
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 md:p-7 flex flex-col flex-grow space-y-4">
          {/* Title - Japanese Typography */}
          <h3 className="font-serif font-medium text-xl md:text-2xl leading-snug group-hover:text-accent transition-colors duration-[600ms]">
            {entry.nameZh}
          </h3>

          {/* Japanese Name with Special Font */}
          <p className="text-sm md:text-base text-muted-foreground font-jp tracking-wider">
            {entry.nameJa}
          </p>

          {/* Region with Icon */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-grow">
            <MapPin className="w-4 h-4 text-accent/60" />
            <span>{entry.region}</span>
          </div>

          {/* Category and Keywords - Elegant Badges */}
          <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-border/30">
            <Badge className="bg-accent/10 text-accent border-accent/30 px-3 py-1 rounded-full text-xs">
              {entry.category.split('/')[0]}
            </Badge>
            {entry.keywords.slice(0, 2).map((keyword) => (
              <Badge
                key={keyword}
                variant="outline"
                className="px-3 py-1 rounded-full text-xs border-border/50 hover:border-accent/50 hover:text-accent transition-colors"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </article>
    </Link>
  )
}
