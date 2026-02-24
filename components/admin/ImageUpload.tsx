'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { ImageAsset } from '@/lib/db/types'

interface ImageUploadProps {
  value: ImageAsset[]
  onChange: (images: ImageAsset[]) => void
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 10,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // 检查是否超过最大数量
    if (value.length + files.length > maxImages) {
      setError(`最多只能上传 ${maxImages} 张图片`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      // 上传所有文件
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || '上传失败')
        }

        const result = await response.json()
        const uploadedImage = result.data

        // 构造 ImageAsset 对象
        return {
          id: uploadedImage.id,
          url: uploadedImage.url,
          alt: uploadedImage.alt || file.name.replace(/\.[^.]+$/, ''),
          caption: '',
          width: uploadedImage.width,
          height: uploadedImage.height,
          order: value.length + index,
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)

      // 更新图片列表
      onChange([...value, ...uploadedImages])

      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || '上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index)
    // 重新排序
    const reorderedImages = newImages.map((img, i) => ({
      ...img,
      order: i,
    }))
    onChange(reorderedImages)
  }

  const handleCaptionChange = (index: number, caption: string) => {
    const newImages = [...value]
    newImages[index] = {
      ...newImages[index],
      caption,
    }
    onChange(newImages)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newImages = [...value]
    ;[newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]]
    // 更新 order
    newImages.forEach((img, i) => {
      img.order = i
    })
    onChange(newImages)
  }

  const handleMoveDown = (index: number) => {
    if (index === value.length - 1) return
    const newImages = [...value]
    ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
    // 更新 order
    newImages.forEach((img, i) => {
      img.order = i
    })
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* 上传按钮 */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading || value.length >= maxImages}
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || value.length >= maxImages}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              上传中...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              上传图片 ({value.length}/{maxImages})
            </>
          )}
        </Button>

        <p className="text-xs text-slate-500 mt-2">
          支持格式：JPG, PNG, WebP | 最大 5MB | 最多 {maxImages} 张
        </p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 图片列表 */}
      {value.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {value.map((image, index) => (
            <Card key={image.id} className="p-4">
              <div className="flex gap-4">
                {/* 缩略图 */}
                <div className="flex-shrink-0 w-32 h-32 relative bg-slate-100 rounded overflow-hidden">
                  {image.url ? (
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                </div>

                {/* 图片信息 */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">图片 {index + 1}</p>
                      <p className="text-xs text-slate-500">
                        {image.width} × {image.height}
                      </p>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveUp(index)}
                          disabled={disabled}
                          title="上移"
                        >
                          ↑
                        </Button>
                      )}
                      {index < value.length - 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveDown(index)}
                          disabled={disabled}
                          title="下移"
                        >
                          ↓
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(index)}
                        disabled={disabled}
                        title="删除"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  {/* 图片说明输入 */}
                  <input
                    type="text"
                    placeholder="图片说明（可选）"
                    value={image.caption || ''}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {value.length === 0 && !uploading && (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">暂无图片</p>
          <p className="text-xs text-slate-400 mt-1">点击上方按钮上传图片</p>
        </div>
      )}
    </div>
  )
}
