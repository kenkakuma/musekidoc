'use client'

import { useState } from 'react'
import type { ImageAsset } from '@/lib/db/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGalleryProps {
  images: ImageAsset[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] w-full bg-gradient-to-br from-sand/20 to-ivory/30 rounded-2xl flex items-center justify-center border border-border/50">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-mist-gray/50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">暂无图片</p>
        </div>
      </div>
    )
  }

  const selectedImage = images[selectedIndex]

  const handlePrevious = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setTimeout(() => setIsTransitioning(false), 400)
  }

  const handleNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsTransitioning(false), 400)
  }

  const handleThumbnailClick = (index: number) => {
    if (index === selectedIndex || isTransitioning) return
    setIsTransitioning(true)
    setSelectedIndex(index)
    setTimeout(() => setIsTransitioning(false), 400)
  }

  return (
    <div className="space-y-6">
      {/* Main Image with Washi Paper Frame */}
      <div className="relative group">
        {/* Decorative Corner Elements */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-accent/30 rounded-tl-sm z-10" />
        <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-accent/30 rounded-tr-sm z-10" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-accent/30 rounded-bl-sm z-10" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-accent/30 rounded-br-sm z-10" />

        {/* Image Container with Organic Shadow */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-sand/10 to-ivory/20">
          <img
            key={selectedIndex}
            src={selectedImage.url}
            alt={selectedImage.alt}
            className={`w-full h-full object-cover transition-all duration-[600ms] ease-out img-zen ${
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          />

          {/* Navigation Arrows - Appear on Hover */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                disabled={isTransitioning}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                disabled={isTransitioning}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-charcoal/70 backdrop-blur-sm text-xs text-white font-medium">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Image Caption - Elegant Typography */}
      {selectedImage.caption && (
        <p className="text-sm text-center text-muted-foreground italic leading-relaxed px-4 animate-ink-wash">
          {selectedImage.caption}
        </p>
      )}

      {/* Thumbnail Gallery - Horizontal Scroll with Zen Spacing */}
      {images.length > 1 && (
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => handleThumbnailClick(index)}
                disabled={isTransitioning}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-300 ${
                  index === selectedIndex
                    ? 'ring-2 ring-accent ring-offset-2 ring-offset-background scale-105 shadow-md'
                    : 'ring-1 ring-border/50 hover:ring-accent/50 hover:scale-105 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                {index === selectedIndex && (
                  <div className="absolute inset-0 bg-accent/10" />
                )}
              </button>
            ))}
          </div>

          {/* Scroll Fade Indicators */}
          <div className="absolute top-0 left-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      )}

      {/* Keyboard Hints - Subtle */}
      {images.length > 1 && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground/60">
            使用方向键 ← → 或点击缩略图切换图片
          </p>
        </div>
      )}
    </div>
  )
}
