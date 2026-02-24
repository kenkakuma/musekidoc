'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ImportType = 'entries' | 'artists'

interface ImportResult {
  success: boolean
  message?: string
  results?: {
    total: number
    success: number
    failed: number
    skipped: number
    errors: Array<{ slug: string; error: string }>
    created: Array<{ slug: string; id: string }>
    updated: Array<{ slug: string; id: string }>
  }
}

// JSON模板
const ENTRY_TEMPLATE = [
  {
    slug: 'example-pottery',
    nameZh: '示例陶器',
    nameJa: '例の陶器',
    nameEn: 'Example Pottery',
    category: '陶器/无釉/薪窑',
    region: '示例地区',
    description: '这是一个示例陶器条目的详细描述，至少需要100字...',
    positioning: '这是一句话定位，20-50字',
    signatureFeatures: ['特征1', '特征2', '特征3'],
    keywords: ['关键词1', '关键词2', '关键词3'],
    notableArtists: ['作家1', '作家2'],
    representativeForms: ['器型1', '器型2'],
    sources: [{ title: '来源标题', url: 'https://example.com' }],
    published: false,
  },
]

const ARTIST_TEMPLATE = [
  {
    slug: 'example-artist',
    nameZh: '示例作家',
    nameJa: '例の作家',
    nameEn: 'Example Artist',
    bio: '这是作家的详细简介，至少需要100字...',
    birthYear: 1950,
    region: '示例地区',
    style: '示例风格',
    awards: ['奖项1', '奖项2'],
    exhibitions: [{ year: 2020, title: '展览标题', venue: '展览地点' }],
    sources: [{ title: '来源标题', url: 'https://example.com' }],
    published: false,
  },
]

export function BulkImportForm() {
  const [activeTab, setActiveTab] = useState<ImportType>('entries')
  const [jsonInput, setJsonInput] = useState('')
  const [updateExisting, setUpdateExisting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleDownloadTemplate = (type: ImportType) => {
    const template = type === 'entries' ? ENTRY_TEMPLATE : ARTIST_TEMPLATE
    const jsonStr = JSON.stringify(template, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-template.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async () => {
    setLoading(true)
    setResult(null)

    try {
      // 解析JSON
      const data = JSON.parse(jsonInput)

      // 构建请求体
      const requestBody = activeTab === 'entries'
        ? { entries: Array.isArray(data) ? data : [data], updateExisting }
        : { artists: Array.isArray(data) ? data : [data], updateExisting }

      // 调用API
      const endpoint = activeTab === 'entries' ? '/api/entries/bulk' : '/api/artists/bulk'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123'}`,
        },
        body: JSON.stringify(requestBody),
      })

      const resultData = await res.json()
      setResult(resultData)
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'JSON 解析失败或网络错误',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 标签切换 */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('entries')}
          className={`px-4 py-2 rounded-t-md transition-colors ${
            activeTab === 'entries'
              ? 'bg-white border-t border-l border-r border-slate-200 text-slate-900 font-medium'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          陶器条目
        </button>
        <button
          onClick={() => setActiveTab('artists')}
          className={`px-4 py-2 rounded-t-md transition-colors ${
            activeTab === 'artists'
              ? 'bg-white border-t border-l border-r border-slate-200 text-slate-900 font-medium'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          作家
        </button>
      </div>

      {/* 导入表单 */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'entries' ? '批量导入陶器条目' : '批量导入作家'}
          </CardTitle>
          <CardDescription>
            粘贴 JSON 格式的数据，可以一次导入多个{activeTab === 'entries' ? '陶器条目' : '作家'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 模板下载 */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-md">
            <div>
              <p className="text-sm font-medium text-blue-900">
                不确定格式？下载 JSON 模板
              </p>
              <p className="text-xs text-blue-700 mt-1">
                包含所有必填字段和示例数据
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadTemplate(activeTab)}
            >
              📥 下载模板
            </Button>
          </div>

          {/* JSON 输入 */}
          <div>
            <label className="text-sm font-medium text-slate-900 mb-2 block">
              JSON 数据 <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`粘贴 JSON 数组或对象...\n例如：[{ "slug": "...", "nameZh": "...", ... }]`}
              rows={12}
              className="font-mono text-xs"
            />
          </div>

          {/* 选项 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="updateExisting"
              checked={updateExisting}
              onChange={(e) => setUpdateExisting(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="updateExisting" className="text-sm text-slate-700 cursor-pointer">
              更新已存在的{activeTab === 'entries' ? '条目' : '作家'}（根据 slug 匹配）
            </label>
          </div>

          {/* 导入按钮 */}
          <Button
            onClick={handleImport}
            disabled={loading || !jsonInput.trim()}
            className="w-full"
          >
            {loading ? '导入中...' : `🚀 开始导入`}
          </Button>
        </CardContent>
      </Card>

      {/* 导入结果 */}
      {result && (
        <Card className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardHeader>
            <CardTitle className={result.success ? 'text-green-900' : 'text-red-900'}>
              {result.success ? '✅ 导入完成' : '❌ 导入失败'}
            </CardTitle>
            {result.message && (
              <CardDescription className={result.success ? 'text-green-700' : 'text-red-700'}>
                {result.message}
              </CardDescription>
            )}
          </CardHeader>
          {result.results && (
            <CardContent className="space-y-4">
              {/* 统计 */}
              <div className="flex gap-4">
                <Badge variant="default">总数: {result.results.total}</Badge>
                <Badge className="bg-green-600">成功: {result.results.success}</Badge>
                {result.results.failed > 0 && (
                  <Badge variant="destructive">失败: {result.results.failed}</Badge>
                )}
                {result.results.skipped > 0 && (
                  <Badge variant="secondary">跳过: {result.results.skipped}</Badge>
                )}
              </div>

              {/* 成功列表 */}
              {result.results.created.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-900 mb-2">
                    新建成功 ({result.results.created.length}):
                  </p>
                  <div className="space-y-1">
                    {result.results.created.map((item) => (
                      <p key={item.id} className="text-xs text-green-700">
                        ✓ {item.slug}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 更新列表 */}
              {result.results.updated.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    更新成功 ({result.results.updated.length}):
                  </p>
                  <div className="space-y-1">
                    {result.results.updated.map((item) => (
                      <p key={item.id} className="text-xs text-blue-700">
                        ↻ {item.slug}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 错误列表 */}
              {result.results.errors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-900 mb-2">
                    错误详情 ({result.results.errors.length}):
                  </p>
                  <div className="space-y-1">
                    {result.results.errors.map((item, index) => (
                      <p key={index} className="text-xs text-red-700">
                        ✗ {item.slug}: {item.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* 使用提示 */}
      <Card className="bg-slate-50">
        <CardHeader>
          <CardTitle className="text-base">💡 使用提示</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>1. 点击"下载模板"获取标准 JSON 格式</p>
          <p>2. 编辑 JSON 文件，填写{activeTab === 'entries' ? '陶器' : '作家'}信息（可以包含多个对象）</p>
          <p>3. 复制 JSON 内容，粘贴到上方文本框</p>
          <p>4. 勾选"更新已存在"可以覆盖现有数据（根据 slug 匹配）</p>
          <p>5. 点击"开始导入"执行批量导入</p>
          <p className="text-blue-600 font-medium mt-4">
            ⚡ AI 代理可以直接生成 JSON 格式数据，然后使用此功能快速批量导入！
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
