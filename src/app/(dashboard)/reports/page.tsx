import Link from 'next/link'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { DailyReport } from '@/types'
import { format } from 'date-fns'
import SearchFilter from '@/components/reports/SearchFilter'

const CATEGORY_COLOR: Record<string, string> = {
  '開発': 'bg-green-100 text-green-700',
  '会議': 'bg-yellow-100 text-yellow-700',
  'その他': 'bg-zinc-100 text-zinc-600',
}

type SearchParams = {
  q?: string
  userId?: string
  category?: string
  from?: string
  to?: string
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { q, userId, category, from, to } = await searchParams
  const supabase = await createClient()

  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, name')
    .order('name')

  if (usersError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
        ユーザー情報の取得に失敗しました。ページを再読み込みしてください。
      </div>
    )
  }

  let query = supabase
    .from('daily_reports')
    .select('*, profiles(id, name, avatar_url), comments(count)')
    .order('created_at', { ascending: false })

  if (q) query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`)
  if (userId) query = query.eq('user_id', userId)
  if (category) query = query.eq('category', category)
  if (from) query = query.gte('date', from)
  if (to) query = query.lte('date', to)

  const { data: reports, error: reportsError } = await query

  if (reportsError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
        日報の取得に失敗しました。ページを再読み込みしてください。
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">チームの日報</h1>
          <p className="text-sm text-zinc-500">{reports?.length ?? 0}件</p>
        </div>
        <Link href="/reports/new">
          <Button className="cursor-pointer">＋ 日報を作成</Button>
        </Link>
      </div>

      <Suspense fallback={<div className="text-sm text-zinc-400">読み込み中...</div>}>
        <SearchFilter users={users ?? []} />
      </Suspense>

      <div className="space-y-3">
        {reports?.length === 0 && (
          <p className="text-zinc-500 text-sm py-8 text-center">
            {q || userId || category || from || to
              ? '条件に一致する日報がありません'
              : 'まだ日報がありません'}
          </p>
        )}
        {reports?.map((report: DailyReport & { comments: { count: number }[] }) => (
          <Link key={report.id} href={`/reports/${report.id}`}>
            <div className="bg-white border border-zinc-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                {report.profiles?.avatar_url ? (
                  <img
                    src={report.profiles.avatar_url}
                    alt={report.profiles.name ?? ''}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
                    {report.profiles?.name?.[0] ?? '?'}
                  </div>
                )}
                <span className="font-medium text-zinc-900 flex-1 truncate">{report.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${CATEGORY_COLOR[report.category]}`}>
                  {report.category}
                </span>
                <span className="text-xs text-zinc-400 whitespace-nowrap">
                  {format(new Date(report.date), 'yyyy/MM/dd')}
                </span>
              </div>
              <p className="text-sm text-zinc-500 line-clamp-2">{report.content}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-zinc-400">{report.profiles?.name}</span>
                <span className="text-xs text-zinc-400">
                  💬 {report.comments?.[0]?.count ?? 0}件
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
