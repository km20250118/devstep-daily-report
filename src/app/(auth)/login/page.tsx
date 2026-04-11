'use client'

import { useState } from 'react'
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  const validateField = (name: string, value: string): string => {
    if (name === 'email' && !value.trim()) return 'メールアドレスは必須です'
    if (name === 'password' && !value) return 'パスワードは必須です'
    return ''
  }

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = {
      email: validateField('email', email),
      password: validateField('password', password),
    }
    setErrors(newErrors)
    setTouched({ email: true, password: true })
    if (Object.values(newErrors).some(Boolean)) return

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrors({ submit: 'メールアドレスまたはパスワードが正しくありません' })
      setLoading(false)
      return
    }

    router.push('/reports')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-300 px-4"
      style={{ fontFamily: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif' }}>
      <Card className="w-full max-w-sm bg-white">
        <CardHeader className="text-center">
          <div className="text-3xl mb-2">📋</div>
          <CardTitle>日報管理システム</CardTitle>
          <CardDescription>チームの日報をまとめて管理</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => handleBlur('email', e.target.value)}
                placeholder="you@example.com"
                className={`bg-zinc-100 ${errors.email && touched.email ? 'border-red-500' : ''}`}
              />
              {errors.email && touched.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => handleBlur('password', e.target.value)}
                className={`bg-zinc-100 ${errors.password && touched.password ? 'border-red-500' : ''}`}
              />
              {errors.password && touched.password && <p className="text-xs text-red-500">{errors.password}</p>}
              <div className="text-right">
                <Link href="/reset-password" className="text-xs text-zinc-500 underline cursor-pointer">
                  パスワードを忘れた場合
                </Link>
              </div>
            </div>
            {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}
            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
          <div className="text-center text-sm text-zinc-500 mt-4">
            アカウントをお持ちでない方は{' '}
            <Link href="/signup" className="text-zinc-900 font-medium underline cursor-pointer whitespace-nowrap">
              新規登録
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
