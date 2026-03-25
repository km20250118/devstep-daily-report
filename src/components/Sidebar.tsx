'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/reports', label: '日報一覧', icon: '📄' },
    { href: '/reports/new', label: '日報を作成', icon: '✏️' },
  ]

  return (
    <aside className="w-52 bg-zinc-50 border-r border-zinc-200 flex flex-col p-3 gap-1">
      <div className="text-sm font-semibold text-zinc-900 px-2 py-3 border-b border-zinc-200 mb-2">
        📋 日報管理
      </div>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
            pathname === item.href
              ? 'bg-zinc-100 text-zinc-900 font-medium'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <span>{item.icon}</span>
          {item.label}
        </Link>
      ))}
      <div className="mt-auto pt-3 border-t border-zinc-200 space-y-1">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-semibold">
            {profile?.name?.[0] ?? '?'}
          </div>
          <span className="text-xs text-zinc-500 truncate">{profile?.name}</span>
        </div>
        <Link
          href="/profile"
          className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
            pathname === '/profile'
              ? 'bg-zinc-100 text-zinc-900 font-medium'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <span>⚙️</span>プロフィール
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-zinc-600 hover:bg-zinc-100"
        >
          <span>🚪</span>ログアウト
        </button>
      </div>
    </aside>
  )
}
