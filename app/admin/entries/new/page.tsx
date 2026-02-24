import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth/session'
import { PotteryEntryForm } from '@/components/admin/PotteryEntryForm'

export default async function NewEntryPage() {
  // 检查认证
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    redirect('/admin/login')
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">新建陶器条目</h1>
        <p className="text-slate-600 mt-1">
          填写以下信息创建新的陶器条目，标有 <span className="text-red-500">*</span> 的为必填项
        </p>
      </div>

      <PotteryEntryForm />
    </div>
  )
}
