'use client'

import { Button } from '@/components/ui/button'

interface DeleteEntryButtonProps {
  entryId: string
  entryName: string
}

export function DeleteEntryButton({ entryId, entryName }: DeleteEntryButtonProps) {
  const handleDelete = async () => {
    if (!confirm(`确定要删除「${entryName}」吗？`)) {
      return
    }

    try {
      const res = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer admin123`,
        },
      })

      if (res.ok) {
        window.location.reload()
      } else {
        alert('删除失败')
      }
    } catch (err) {
      alert('删除失败')
    }
  }

  return (
    <Button
      onClick={handleDelete}
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      删除
    </Button>
  )
}
