import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditReportForm from '@/components/reports/EditReportForm'

export default async function EditReportPage({
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
    .select('*')
    .eq('id', id)
    .single()

  if (!report) notFound()
  if (report.user_id !== user.id) redirect('/reports')

  return (
    <div className="px-4 py-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-zinc-900 mb-6">日報を編集</h1>
      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <EditReportForm report={report} />
      </div>
    </div>
  )
}
