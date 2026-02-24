import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function AdminDashboard() {
  // 检查认证
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    redirect('/admin/login')
  }

  // 获取统计数据
  const stats = await Promise.all([
    prisma.potteryEntry.count(),
    prisma.potteryEntry.count({ where: { published: true } }),
    prisma.artist.count(),
    prisma.artist.count({ where: { published: true } }),
  ])

  const [totalEntries, publishedEntries, totalArtists, publishedArtists] = stats

  // 获取最近创建的条目
  const recentEntries = await prisma.potteryEntry.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      nameZh: true,
      nameJa: true,
      published: true,
      createdAt: true,
    },
  })

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">仪表板</h1>
        <p className="text-slate-600 mt-2">
          欢迎回来！这里是内容管理概览
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              陶器条目
            </CardTitle>
            <span className="text-2xl">🏺</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalEntries}</div>
            <p className="text-xs text-slate-500 mt-2">
              {publishedEntries} 个已发布
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              作家信息
            </CardTitle>
            <span className="text-2xl">👨‍🎨</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalArtists}</div>
            <p className="text-xs text-slate-500 mt-2">
              {publishedArtists} 个已发布
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              发布率
            </CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {totalEntries > 0
                ? Math.round((publishedEntries / totalEntries) * 100)
                : 0}%
            </div>
            <p className="text-xs text-slate-500 mt-2">
              陶器条目发布比例
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              完成度
            </CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {Math.round((totalEntries / 50) * 100)}%
            </div>
            <p className="text-xs text-slate-500 mt-2">
              目标 50 个条目
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 快捷操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild>
            <Link href="/admin/entries/new">
              + 新建陶器条目
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/artists/new">
              + 新建作家
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/import">
              📥 批量导入
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* 最近创建 */}
      <Card>
        <CardHeader>
          <CardTitle>最近创建的条目</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEntries.length > 0 ? (
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-1">
                    <Link
                      href={`/admin/entries/${entry.id}/edit`}
                      className="font-medium text-slate-900 hover:text-blue-600"
                    >
                      {entry.nameZh}
                    </Link>
                    <p className="text-sm text-slate-500 font-jp mt-1">
                      {entry.nameJa}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        entry.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {entry.published ? '已发布' : '草稿'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(entry.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">
              暂无数据，开始创建你的第一个条目吧！
            </p>
          )}
        </CardContent>
      </Card>

      {/* AI 提示 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 AI 内容填充提示</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• 使用「新建陶器条目」开始创建内容</p>
          <p>• 所有字段都提供了清晰的说明，便于 AI 理解和填充</p>
          <p>• 支持批量导入功能，可快速添加多个条目</p>
          <p>• 记得在完成后点击「发布」使内容在前台显示</p>
        </CardContent>
      </Card>
    </div>
  )
}
