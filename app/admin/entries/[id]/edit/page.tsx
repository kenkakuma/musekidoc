import { redirect, notFound } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth/session'
import { prisma } from '@/lib/db/client'
import { PotteryEntryForm } from '@/components/admin/PotteryEntryForm'

interface EditEntryPageProps {
  params: {
    id: string
  }
}

export default async function EditEntryPage({ params }: EditEntryPageProps) {
  // 检查认证
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    redirect('/admin/login')
  }

  // 获取条目数据
  const entry = await prisma.potteryEntry.findUnique({
    where: { id: params.id },
  })

  if (!entry) {
    notFound()
  }

  // 转换数据格式
  const initialData = {
    ...entry,
    signatureFeatures: entry.signatureFeatures as any as string[],
    notableArtists: entry.notableArtists as any as string[],
    representativeForms: entry.representativeForms as any as string[],
    sources: entry.sources as any as { title: string; url: string }[],
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">编辑陶器条目</h1>
        <p className="text-slate-600 mt-1">
          {entry.nameZh} · {entry.nameJa}
        </p>
      </div>

      <PotteryEntryForm initialData={initialData} entryId={params.id} />
    </div>
  )
}
