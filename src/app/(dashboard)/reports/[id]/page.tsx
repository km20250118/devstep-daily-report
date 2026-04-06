import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import DeleteReportButton from '@/components/reports/DeleteReportButton'
import CommentSection from '@/components/reports/CommentSection'

const TZ = 'Asia/Tokyo'
const toJST = (dateStr: string) => toZonedTime(new Date(dateStr), TZ)

const CATEGORY_COLOR: Record<string, string> = {
  '開発': 'bg-green-100 text-green-700',
  '会議': 'bg-yellow-100 text-yellow-700',
  'その他': 'bg-zinc-100 text-zinc-600',
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: report } = await supabase
    .from('daily_reports')
    .select('*, profiles(id, name, avatar_url)')
    .eq('id', id)
    .single()

  if (!report) notFound()

  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles(id, name, avatar_url)')
    .eq('report_id', id)
    .order('created_at', { ascending: true })

  const isOwner = user.id === report.user_id

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link href="/reports">
          <Button variant="ghost" size="sm" className="cursor-pointer">← 一覧へ戻る</Button>
        </Link>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-zinc-900 mb-3">{report.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              {report.profiles?.avatar_url ? (
                <img
                  src={report.profiles.avatar_url}
                  alt={report.profiles.name ?? ''}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-semibold">
                  {report.profiles?.name?.[0] ?? '?'}
                </div>
              )}
              <span className="text-sm font-medium text-zinc-700">{report.profiles?.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${CATEGORY_COLOR[report.category]}`}>
                {report.category}
              </span>
              <span className="text-sm text-zinc-400">
                {format(new Date(report.date), 'yyyy年M月d日')}
              </span>
            </div>
          </div>
          {isOwner && (
            <div className="flex gap-2 flex-shrink-0">
              <Link href={`/reports/${report.id}/edit`} className="cursor-pointer">
                <Button variant="outline" size="sm" className="cursor-pointer">編集</Button>
              </Link>
              <DeleteReportButton reportId={report.id} />
            </div>
          )}
        </div>

        <hr className="border-zinc-100 my-4" />

        <div className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
          {report.content}
        </div>

        <div className="text-xs text-zinc-400 mt-4">
          作成: {format(toJST(report.created_at), 'yyyy/MM/dd HH:mm')}
          {report.updated_at !== report.created_at &&
            ` ／ 更新: ${format(toJST(report.updated_at), 'yyyy/MM/dd HH:mm')}`}
        </div>
      </div>

      <CommentSection
        reportId={report.id}
        initialComments={comments ?? []}
        currentUserId={user.id}
      />
    </div>
  )
}
