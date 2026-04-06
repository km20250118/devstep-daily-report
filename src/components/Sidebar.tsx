'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

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
    <>
      {/* モバイル トップバー */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-900">📋 日報管理</span>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-zinc-600 cursor-pointer p-1"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* モバイル ドロワー */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-black/30" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute top-0 left-0 w-64 h-full bg-white shadow-lg pt-14 px-3 flex flex-col gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
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
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name ?? ''}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-semibold">
                    {profile?.name?.[0] ?? '?'}
                  </div>
                )}
                <span className="text-xs text-zinc-500 truncate">{profile?.name}</span>
              </div>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              >
                <span>⚙️</span>プロフィール
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              >
                <span>🚪</span>ログアウト
              </button>
            </div>
          </div>
        </div>
      )}

      {/* デスクトップ サイドバー */}
      <aside className="hidden md:flex w-52 bg-zinc-50 border-r border-zinc-200 flex-col p-3 gap-1">
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
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name ?? ''}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-semibold">
                {profile?.name?.[0] ?? '?'}
              </div>
            )}
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
            className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 cursor-pointer"
          >
            <span>🚪</span>ログアウト
          </button>
        </div>
      </aside>
    </>
  )
}
