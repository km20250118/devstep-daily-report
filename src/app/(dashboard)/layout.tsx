import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-zinc-50">
      <Sidebar profile={profile} />
      {/* モバイル時はトップバー分の余白を追加 */}
      <main className="flex-1 overflow-auto p-4 md:p-6 pt-16 md:pt-6">
        {children}
      </main>
    </div>
  )
}
