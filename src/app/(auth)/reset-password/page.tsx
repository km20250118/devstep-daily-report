'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme')
    document.documentElement.removeAttribute('data-theme')
    return () => {
      if (prev) document.documentElement.setAttribute('data-theme', prev)
    }
  }, [])

  const validate = (value: string) => {
    if (!value.trim()) return 'メールアドレスは必須です'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'メールアドレスの形式が正しくありません'
    return ''
  }

  const handleBlur = () => {
    setTouched(true)
    setEmailError(validate(email))
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const err = validate(email)
    setEmailError(err)
    if (err) return

    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password/confirm`,
    })
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-300 px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle>メールを送信しました</CardTitle>
            <CardDescription>
              {email} にパスワードリセット用のリンクを送信しました。
              メールを確認してください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button variant="outline" className="w-full cursor-pointer">ログインページへ戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-300 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>パスワードリセット</CardTitle>
          <CardDescription>登録済みのメールアドレスを入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4" noValidate>
            <div className="space-y-1">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (touched) setEmailError(validate(e.target.value))
                }}
                onBlur={handleBlur}
                placeholder="you@example.com"
                className={touched && emailError ? 'border-red-500' : ''}
              />
              {touched && emailError && (
                <p className="text-xs text-red-500">{emailError}</p>
              )}
            </div>
            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading ? '送信中...' : 'リセットメールを送信'}
            </Button>
          </form>
          <div className="text-center text-sm text-zinc-500 mt-4">
            <Link href="/login" className="underline cursor-pointer">ログインページへ戻る</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
