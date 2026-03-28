'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function DeleteReportButton({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('この日報を削除しますか？')) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('daily_reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      alert('削除に失敗しました')
      setLoading(false)
      return
    }

    router.push('/reports')
    router.refresh()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 border-red-200 hover:bg-red-50 cursor-pointer"
    >
      {loading ? '削除中...' : '削除'}
    </Button>
  )
}
