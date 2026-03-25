import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditReportForm from '@/components/reports/EditReportForm'

export default async function EditReportPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: report } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!report) notFound()
  if (report.user_id !== user.id) redirect('/reports')

  return <EditReportForm report={report} />
}
