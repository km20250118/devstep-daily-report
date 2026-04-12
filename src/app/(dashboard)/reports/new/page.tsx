'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Category } from '@/types'
import { format } from 'date-fns'

export default function NewReportPage() {
  const router = useRouter()
  const today = format(new Date(), 'yyyy-MM-dd')

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(today)
  const [category, setCategory] = useState<Category>('開発')
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'タイトルは必須です'
        if (value.length > 50) return 'タイトルは50文字以内で入力してください'
        return ''
      case 'date':
        if (!value) return '日付は必須です'
        return ''
      case 'content':
        if (!value.trim()) return '内容は必須です'
        if (value.length > 2000) return '内容は2000文字以内で入力してください'
        return ''
      default:
        return ''
    }
  }

  const handleChange = (name: string, value: string) => {
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
  }

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {
      title: validateField('title', title),
      date: validateField('date', date),
      content: validateField('content', content),
    }
    setErrors(newErrors)
    setTouched({ title: true, date: true, content: true })
    return !Object.values(newErrors).some(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error } = await supabase.from('daily_reports').insert({
        user_id: user.id,
        title: title.trim(),
        date,
        category,
        content: content.trim(),
      })

      if (error) throw error

      router.push('/reports')
    } catch (err) {
      console.error(err)
      setErrors((prev) => ({ ...prev, submit: '日報の作成に失敗しました。もう一度お試しください。' }))
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-zinc-900">日報を作成</h1>
        <Button variant="ghost" onClick={() => router.back()} className="cursor-pointer">← キャンセル</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">タイトル <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); handleChange('title', e.target.value) }}
            onBlur={(e) => handleBlur('title', e.target.value)}
            placeholder="今日の業務タイトル"
            className={errors.title && touched.title ? 'border-red-500' : ''}
            maxLength={50}
          />
          <div className="flex justify-between">
            {errors.title && touched.title && <p className="text-xs text-red-500">{errors.title}</p>}
            <span className={`text-xs ml-auto ${title.length > 45 ? 'text-orange-500' : 'text-zinc-400'}`}>
              {title.length} / 50
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="date">日付 <span className="text-red-500">*</span></Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); handleChange('date', e.target.value) }}
              onBlur={(e) => handleBlur('date', e.target.value)}
              className={`cursor-pointer w-full${errors.date && touched.date ? ' border-red-500' : ''}`}
            />
            {errors.date && touched.date && <p className="text-xs text-red-500">{errors.date}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>カテゴリ <span className="text-red-500">*</span></Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="cursor-pointer w-full bg-white h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-zinc-200 shadow-md">
                <SelectItem value="開発" className="cursor-pointer">開発</SelectItem>
                <SelectItem value="会議" className="cursor-pointer">会議</SelectItem>
                <SelectItem value="その他" className="cursor-pointer">その他</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content">内容 <span className="text-red-500">*</span></Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => { setContent(e.target.value); handleChange('content', e.target.value) }}
            onBlur={(e) => handleBlur('content', e.target.value)}
            placeholder="今日の業務内容を記録してください"
            rows={8}
            className={errors.content && touched.content ? 'border-red-500' : ''}
            maxLength={2000}
          />
          <div className="flex justify-between">
            {errors.content && touched.content && <p className="text-xs text-red-500">{errors.content}</p>}
            <span className={`text-xs ml-auto ${content.length > 1900 ? 'text-orange-500' : 'text-zinc-400'}`}>
              {content.length} / 2000
            </span>
          </div>
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} className="cursor-pointer">キャンセル</Button>
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading ? '作成中...' : '作成する'}
          </Button>
        </div>
      </form>
    </div>
  )
}
