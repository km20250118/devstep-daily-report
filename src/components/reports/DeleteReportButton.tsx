'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function DeleteReportButton({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!confirm('この日報を削除しますか？')) return
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('daily_reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error

      router.push('/reports')
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('削除に失敗しました。もう一度お試しください。')
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        className="text-red-500 border-red-300 hover:bg-red-500 hover:text-white hover:border-red-500 cursor-pointer transition-colors"
      >
        {loading ? '削除中...' : '削除'}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
