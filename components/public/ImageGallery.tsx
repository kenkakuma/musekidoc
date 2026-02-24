'use client'

import { useState } from 'react'
import type { ImageAsset } from '@/lib/db/types'

interface ImageGalleryProps {
  images: ImageAsset[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video w-full bg-slate-100 rounded-lg flex items-center justify-center">
        <p className="text-slate-400">暂无图片</p>
      </div>
    )
  }

  const selectedImage = images[selectedIndex]

  return (
    <div className="space-y-4">
      {/* 主图 */}
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
        <img
          src={selectedImage.url}
          alt={selectedImage.alt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 图片说明 */}
      {selectedImage.caption && (
        <p className="text-sm text-slate-600">{selectedImage.caption}</p>
      )}

      {/* 缩略图 */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-colors ${
                index === selectedIndex
                  ? 'border-blue-600'
                  : 'border-transparent hover:border-slate-300'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
