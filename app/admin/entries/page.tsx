import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteEntryButton } from '@/components/admin/DeleteEntryButton'
import Link from 'next/link'

export default async function EntriesManagePage() {
  // 检查认证
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    redirect('/admin/login')
  }

  // 获取所有条目
  const entries = await prisma.potteryEntry.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      artist: {
        select: {
          nameZh: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">陶器条目管理</h1>
          <p className="text-slate-600 mt-1">
            共 {entries.length} 个条目，{entries.filter(e => e.published).length} 个已发布
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/entries/new">
            + 新建条目
          </Link>
        </Button>
      </div>

      {/* 条目列表 */}
      <div className="bg-white rounded-lg border border-slate-200">
        {entries.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/admin/entries/${entry.id}/edit`}
                        className="text-lg font-semibold text-slate-900 hover:text-blue-600"
                      >
                        {entry.nameZh}
                      </Link>
                      <Badge variant={entry.published ? 'default' : 'secondary'}>
                        {entry.published ? '已发布' : '草稿'}
                      </Badge>
                    </div>

                    <p className="text-sm text-slate-600 font-jp mb-2">
                      {entry.nameJa}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>分类：{entry.category}</span>
                      <span>产地：{entry.region}</span>
                      {entry.artist && (
                        <span>作家：{entry.artist.nameZh}</span>
                      )}
                      <span>
                        更新：{new Date(entry.updatedAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* 查看 */}
                    {entry.published && (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                      >
                        <Link
                          href={`/pottery/${entry.slug}`}
                          target="_blank"
                        >
                          查看
                        </Link>
                      </Button>
                    )}

                    {/* 编辑 */}
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <Link href={`/admin/entries/${entry.id}/edit`}>
                        编辑
                      </Link>
                    </Button>

                    {/* 删除按钮 */}
                    <DeleteEntryButton
                      entryId={entry.id}
                      entryName={entry.nameZh}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-500 mb-4">还没有任何条目</p>
            <Button asChild>
              <Link href="/admin/entries/new">
                创建第一个条目
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
