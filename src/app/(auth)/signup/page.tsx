'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme')
    document.documentElement.removeAttribute('data-theme')
    return () => {
      if (prev) document.documentElement.setAttribute('data-theme', prev)
    }
  }, [])

  const validateField = (name: string, value: string): string => {
    if (name === 'name' && !value.trim()) return '表示名は必須です'
    if (name === 'email' && !value.trim()) return 'メールアドレスは必須です'
    if (name === 'password') {
      if (!value) return 'パスワードは必須です'
      if (value.length < 6) return 'パスワードは6文字以上で入力してください'
    }
    return ''
  }

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = {
      name: validateField('name', name),
      email: validateField('email', email),
      password: validateField('password', password),
    }
    setErrors(newErrors)
    setTouched({ name: true, email: true, password: true })
    if (Object.values(newErrors).some(Boolean)) return

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (error) {
      setErrors({ submit: '登録に失敗しました。別のメールアドレスをお試しください' })
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
          <CardTitle>新規登録</CardTitle>
          <CardDescription>アカウントを作成してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">表示名</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => handleBlur('name', e.target.value)}
                placeholder="山田 太郎"
                className={`bg-zinc-100 ${errors.name && touched.name ? 'border-red-500' : ''}`}
              />
              {errors.name && touched.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
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
              <Label htmlFor="password">パスワード（6文字以上）</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={(e) => handleBlur('password', e.target.value)}
                className={`bg-zinc-100 ${errors.password && touched.password ? 'border-red-500' : ''}`}
              />
              {errors.password && touched.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>
            {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}
            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? '登録中...' : 'アカウントを作成'}
            </Button>
          </form>
          <div className="text-center text-sm text-zinc-500 mt-4">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-zinc-900 font-medium underline cursor-pointer">
              ログイン
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
