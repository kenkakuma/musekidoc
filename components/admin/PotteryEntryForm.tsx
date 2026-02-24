'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface PotteryEntryFormProps {
  initialData?: any
  entryId?: string
}

export function PotteryEntryForm({ initialData, entryId }: PotteryEntryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 表单状态
  const [formData, setFormData] = useState({
    slug: initialData?.slug || '',
    nameZh: initialData?.nameZh || '',
    nameJa: initialData?.nameJa || '',
    nameEn: initialData?.nameEn || '',
    category: initialData?.category || '',
    region: initialData?.region || '',
    type: initialData?.type || '',
    description: initialData?.description || '',
    positioning: initialData?.positioning || '',
    signatureFeatures: initialData?.signatureFeatures?.join('\n') || '',
    keywords: initialData?.keywords?.join(', ') || '',
    notableArtists: initialData?.notableArtists?.join('\n') || '',
    representativeForms: initialData?.representativeForms?.join('\n') || '',
    sources: initialData?.sources ? JSON.stringify(initialData.sources, null, 2) : '[{"title": "", "url": ""}]',
    published: initialData?.published || false,
  })

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 处理数据
      const payload = {
        slug: formData.slug.trim(),
        nameZh: formData.nameZh.trim(),
        nameJa: formData.nameJa.trim(),
        nameEn: formData.nameEn.trim() || undefined,
        category: formData.category.trim(),
        region: formData.region.trim(),
        type: formData.type.trim() || undefined,
        description: formData.description.trim(),
        positioning: formData.positioning.trim(),
        signatureFeatures: formData.signatureFeatures
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean),
        keywords: formData.keywords
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        notableArtists: formData.notableArtists
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean),
        representativeForms: formData.representativeForms
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean),
        sources: JSON.parse(formData.sources),
        published: publish,
      }

      const url = entryId ? `/api/entries/${entryId}` : '/api/entries'
      const method = entryId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        router.push('/admin/entries')
        router.refresh()
      } else {
        setError(data.error?.message || '保存失败')
      }
    } catch (err: any) {
      setError(err.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, formData.published)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 基础信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基础信息</CardTitle>
          <CardDescription>条目的基本标识信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slug">
                URL Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="bizen-yaki"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                英文小写，用连字符分隔，例如：bizen-yaki
              </p>
            </div>

            <div>
              <Label htmlFor="category">
                分类 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="陶器/无釉/薪窑"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                用斜杠分隔，例如：陶器/无釉/薪窑
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nameZh">
                中文名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nameZh"
                value={formData.nameZh}
                onChange={(e) => setFormData({ ...formData, nameZh: e.target.value })}
                placeholder="备前烧"
                required
              />
            </div>

            <div>
              <Label htmlFor="nameJa">
                日文名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nameJa"
                value={formData.nameJa}
                onChange={(e) => setFormData({ ...formData, nameJa: e.target.value })}
                placeholder="備前焼"
                required
              />
            </div>

            <div>
              <Label htmlFor="nameEn">英文名</Label>
              <Input
                id="nameEn"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Bizen ware"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="region">
                产地 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="冈山县・备前市"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">类型</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="陶器/瓷器"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 内容描述 */}
      <Card>
        <CardHeader>
          <CardTitle>内容描述</CardTitle>
          <CardDescription>详细的介绍和定位信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="positioning">
              定位 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="positioning"
              value={formData.positioning}
              onChange={(e) => setFormData({ ...formData, positioning: e.target.value })}
              placeholder="一句话概括这个条目的核心特点"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              20-50字，快速说明这个条目的核心定位
            </p>
          </div>

          <div>
            <Label htmlFor="description">
              详细描述 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="详细介绍这个陶器的历史、特点、制作工艺等..."
              rows={6}
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              至少100字，详细介绍历史、特点、工艺等
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 特征和关键词 */}
      <Card>
        <CardHeader>
          <CardTitle>特征和关键词</CardTitle>
          <CardDescription>识别特征、关键词等标签信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="signatureFeatures">
              识别特征 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="signatureFeatures"
              value={formData.signatureFeatures}
              onChange={(e) => setFormData({ ...formData, signatureFeatures: e.target.value })}
              placeholder="每行一个特征&#10;无釉高温烧成（焼締）&#10;窯变分类：胡麻/緋襷/桟切"
              rows={4}
            />
            <p className="text-xs text-slate-500 mt-1">
              每行一个特征，列出3-5个识别特征
            </p>
          </div>

          <div>
            <Label htmlFor="keywords">
              关键词 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="備前焼, 無釉, 焼締, 窯変"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              用逗号分隔，至少3个关键词
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="notableArtists">知名作家</Label>
              <Textarea
                id="notableArtists"
                value={formData.notableArtists}
                onChange={(e) => setFormData({ ...formData, notableArtists: e.target.value })}
                placeholder="每行一个作家姓名&#10;金重陶陽&#10;藤原雄"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="representativeForms">代表器型</Label>
              <Textarea
                id="representativeForms"
                value={formData.representativeForms}
                onChange={(e) => setFormData({ ...formData, representativeForms: e.target.value })}
                placeholder="每行一个器型&#10;茶碗&#10;徳利"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 参考来源 */}
      <Card>
        <CardHeader>
          <CardTitle>参考来源</CardTitle>
          <CardDescription>参考资料和外部链接</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="sources">
              来源 (JSON格式) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="sources"
              value={formData.sources}
              onChange={(e) => setFormData({ ...formData, sources: e.target.value })}
              placeholder='[{"title": "来源标题", "url": "https://example.com"}]'
              rows={4}
              className="font-mono text-xs"
            />
            <p className="text-xs text-slate-500 mt-1">
              JSON 数组格式，至少包含一个来源
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          取消
        </Button>

        <div className="flex gap-3">
          {!formData.published && (
            <Button
              type="submit"
              variant="outline"
              disabled={loading}
              onClick={(e) => {
                setFormData({ ...formData, published: false })
              }}
            >
              {loading ? '保存中...' : '保存草稿'}
            </Button>
          )}

          <Button
            type="submit"
            disabled={loading}
            onClick={(e) => {
              setFormData({ ...formData, published: true })
            }}
          >
            {loading ? '发布中...' : formData.published ? '更新发布' : '保存并发布'}
          </Button>
        </div>
      </div>
    </form>
  )
}
