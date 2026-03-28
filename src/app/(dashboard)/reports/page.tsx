'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Category } from '@/types'
import { format } from 'date-fns'

type Report = {
  id: string
  title: string
  date: string
  category: Category
  content: string
  created_at: string
}

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReports = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .order('date', { ascending: false })

      if (!error && data) {
        setReports(data)
      }
      setLoading(false)
    }
    fetchReports()
  }, [])

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-zinc-900">日報一覧</h1>
        <Button onClick={() => router.push(`/reports/new`)} className="cursor-pointer">+ 新規作成</Button>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">読み込み中...</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-zinc-500">日報がまだありません。</p>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className="border border-zinc-200 rounded-lg p-4 cursor-pointer hover:bg-zinc-50 transition"
              onClick={() => router.push(`/reports/${report.id}`)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-zinc-900">{report.title}</span>
                <span className="text-xs text-zinc-400">{format(new Date(report.date), 'yyyy/MM/dd')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">{report.category}</span>
                <span className="text-xs text-zinc-400 truncate">{report.content.slice(0, 60)}...</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
