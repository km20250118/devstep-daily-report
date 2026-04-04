'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [fetchError, setFetchError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setUserId(user.id)

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (profile) {
          setName(profile.name)
          setEmail(profile.email)
          setAvatarUrl(profile.avatar_url)
        }
      } catch (err) {
        console.error(err)
        setFetchError('プロフィールの取得に失敗しました。ページを再読み込みしてください。')
      }
    }
    fetchProfile()
  }, [])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    // ファイルサイズチェック（2MB以下）
    if (file.size > 2 * 1024 * 1024) {
      setError('画像サイズは2MB以下にしてください')
      return
    }

    // ファイル形式チェック
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('JPG・PNG・WebP形式の画像を選択してください')
      return
    }

    setUploading(true)
    setError('')

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const filePath = `${userId}/avatar.${ext}`

      // Storageにアップロード
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // 公開URLを取得
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`

      // profilesテーブルを更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
    } catch (err) {
      console.error(err)
      setError('画像のアップロードに失敗しました。もう一度お試しください。')
    } finally {
      setUploading(false)
    }
  }

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
          <div className="relative inline-block mx-auto mb-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="アバター"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-zinc-900 text-white text-2xl font-semibold flex items-center justify-center">
                {name?.[0] ?? '?'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-6 h-6 bg-white border border-zinc-300 rounded-full flex items-center justify-center text-xs cursor-pointer hover:bg-zinc-50"
            >
              {uploading ? '…' : '✎'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <CardTitle className="text-base">{name}</CardTitle>
          <p className="text-sm text-zinc-500">{email}</p>
          <p className="text-xs text-zinc-400 mt-1">JPG・PNG・WebP / 2MB以下</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">表示名 <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={error && !name.trim() ? 'border-red-500' : ''}
              />
              {error && !name.trim() && <p className="text-xs text-red-500">{error}</p>}
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
            {error && name.trim() && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
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
