import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth/session'
import { BulkImportForm } from '@/components/admin/BulkImportForm'

export default async function ImportPage() {
  // 检查认证
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    redirect('/admin/login')
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">批量导入</h1>
        <p className="text-slate-600 mt-1">
          使用 JSON 格式批量导入陶器条目或作家信息，快速填充内容
        </p>
      </div>

      <BulkImportForm />
    </div>
  )
}
