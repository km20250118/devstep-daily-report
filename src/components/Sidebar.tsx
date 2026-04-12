'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const applyCalendarStyle = (isDark: boolean) => {
    const id = 'dark-calendar-style'
    const existing = document.getElementById(id)
    if (existing) existing.remove()
    const style = document.createElement('style')
    style.id = id
    style.textContent = isDark
      ? 'input[type="date"],input[type="month"]{color-scheme:dark!important}'
      : 'input[type="date"],input[type="month"]{color-scheme:light!important}'
    document.head.appendChild(style)
  }

  useEffect(() => {
    const stored = localStorage.getItem('darkMode')
    if (stored === 'true') {
      setDark(true)
      document.documentElement.setAttribute('data-theme', 'dark')
      applyCalendarStyle(true)
    }
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('darkMode', String(next))
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    applyCalendarStyle(next)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/reports', label: '日報一覧', icon: '📄' },
    { href: '/reports/new', label: '日報を作成', icon: '✏️' },
  ]

  const Logo = () => (
    <div className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="6" fill="white" fillOpacity="0.15"/>
        <path d="M6 8h16M6 14h10M6 20h13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx="21" cy="20" r="3.5" fill="#6ee7b7"/>
        <path d="M19.5 20l1 1 2-2" stroke="#065f46" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-sm font-black tracking-wide text-white leading-snug">
        Devstep<br />Daily-report
      </span>
    </div>
  )

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
            pathname === item.href
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
          }`}
        >
          <span>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </>
  )

  const BottomLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      <Link
        href="/profile"
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
          pathname === '/profile'
            ? 'bg-zinc-700 text-white'
            : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
        }`}
      >
        <span>👤</span> プロフィール
      </Link>
      <button
        onClick={toggleDark}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white cursor-pointer transition-colors"
      >
        <span>{dark ? '☀️' : '🌙'}</span>
        {dark ? 'ライトモード' : 'ダークモード'}
      </button>
      <button
        onClick={() => { onClick?.(); handleLogout() }}
        disabled={loggingOut}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-zinc-700 cursor-pointer disabled:opacity-50 transition-colors"
      >
        <span>🚪</span>
        {loggingOut ? 'ログアウト中...' : 'ログアウト'}
      </button>
    </>
  )

  return (
    <>
      {/* モバイル トップバー */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-zinc-900 border-b border-zinc-700 px-4 py-3 flex items-center justify-between">
        <Logo />
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="cursor-pointer px-3 py-1.5 rounded-md hover:bg-zinc-700 transition-colors"
          aria-label="メニュー"
        >
          {menuOpen
            ? <span className="text-white text-xl font-bold">✕</span>
            : <div className="flex flex-col gap-1.5 w-8">
                <span className="block h-0.5 w-full bg-white rounded" />
                <span className="block h-0.5 w-full bg-white rounded" />
                <span className="block h-0.5 w-full bg-white rounded" />
              </div>
          }
        </button>
      </div>

      {/* モバイル ドロワー */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-black/40" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute top-0 left-0 h-full w-64 bg-zinc-900 shadow-lg pt-16 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-zinc-700">
              <p className="text-xs text-zinc-400">ログイン中</p>
              <p className="text-sm font-medium text-white truncate">{profile?.full_name ?? 'ユーザー'}</p>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              <NavLinks onClick={() => setMenuOpen(false)} />
            </nav>
            <div className="px-3 py-4 border-t border-zinc-700 space-y-1">
              <BottomLinks onClick={() => setMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* デスクトップ サイドバー */}
      <aside className="hidden md:flex w-56 shrink-0 bg-zinc-900 flex-col h-screen sticky top-0">
        <div className="px-4 py-5 border-b border-zinc-700">
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLinks />
        </nav>
        <div className="px-3 py-4 border-t border-zinc-700 space-y-1">
          <div className="px-3 py-1">
            <p className="text-xs text-zinc-400 truncate">{profile?.full_name ?? 'ユーザー'}</p>
          </div>
          <BottomLinks />
        </div>
      </aside>
    </>
  )
}
