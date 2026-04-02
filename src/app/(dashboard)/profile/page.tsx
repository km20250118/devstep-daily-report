'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (profile) {
          setName(profile.name)
          setEmail(profile.email)
        }
      } catch (err) {
        console.error(err)
        setFetchError('プロフィールの取得に失敗しました。ページを再読み込みしてください。')
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('表示名は必須です')
      return
    }
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim() })
        .eq('id', user.id)

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
      setError('更新に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  if (fetchError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm max-w-lg">
        {fetchError}
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-semibold text-zinc-900 mb-6">プロフィール設定</h1>

      <Card>
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-full bg-zinc-900 text-white text-2xl font-semibold flex items-center justify-center mx-auto mb-3">
            {name?.[0] ?? '?'}
          </div>
          <CardTitle className="text-base">{name}</CardTitle>
          <p className="text-sm text-zinc-500">{email}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">表示名 <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={error ? 'border-red-500' : ''}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                value={email}
                readOnly
                className="bg-zinc-50 text-zinc-400"
              />
              <p className="text-xs text-zinc-400">メールアドレスは変更できません</p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="cursor-pointer">
                {loading ? '保存中...' : saved ? '✓ 保存しました' : '保存する'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
