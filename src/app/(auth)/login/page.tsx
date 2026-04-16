'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme')
    document.documentElement.removeAttribute('data-theme')
    return () => {
      if (prev) document.documentElement.setAttribute('data-theme', prev)
    }
  }, [])

  const validate = (fields = { email, password }) => {
    const e: typeof errors = {}
    if (!fields.email.trim()) e.email = 'メールアドレスは必須です'
    if (!fields.password) e.password = 'パスワードは必須です'
    return e
  }

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, ...validate() }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    setErrors({})
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setErrors({ general: 'メールアドレスまたはパスワードが正しくありません' })
        return
      }
      router.push('/reports')
      router.refresh()
    } catch {
      setErrors({ general: 'ログインに失敗しました。再度お試しください。' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-300 px-4"
      style={{ fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif' }}>
      <Card className="w-full max-w-sm bg-white">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="6" fill="#18181b"/>
              <path d="M6 8h16M6 14h10M6 20h13" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <circle cx="21" cy="20" r="3.5" fill="#6ee7b7"/>
              <path d="M19.5 20l1 1 2-2" stroke="#065f46" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-black tracking-tight text-zinc-900 leading-tight text-left">
              Devstep<br />Daily-report
            </span>
          </div>
          <CardTitle className="text-base">日報管理システム</CardTitle>
          <CardDescription>チームの日報をまとめて管理</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {errors.general}
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (touched.email) setErrors((prev) => ({ ...prev, ...validate({ email: e.target.value, password }) })) }}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                autoComplete="email"
                className={`bg-zinc-100 ${touched.email && errors.email ? 'border-red-500' : ''}`}
              />
              {touched.email && errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (touched.password) setErrors((prev) => ({ ...prev, ...validate({ email, password: e.target.value }) })) }}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`bg-zinc-100 ${touched.password && errors.password ? 'border-red-500' : ''}`}
              />
              {touched.password && errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
              <div className="text-right">
                <Link href="/reset-password" className="text-xs text-zinc-500 hover:underline">
                  パスワードを忘れた場合
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-500">
            アカウントをお持ちでない方は{' '}
            <Link href="/signup" className="text-zinc-900 font-semibold hover:underline">新規登録</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
