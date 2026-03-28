'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DailyReport, Category } from '@/types'

export default function EditReportForm({ report }: { report: DailyReport }) {
  const router = useRouter()
  const [title, setTitle] = useState(report.title)
  const [date, setDate] = useState(report.date)
  const [category, setCategory] = useState<Category>(report.category as Category)
  const [content, setContent] = useState(report.content)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'タイトルは必須です'
    if (title.length > 50) newErrors.title = 'タイトルは50文字以内で入力してください'
    if (!content.trim()) newErrors.content = '内容は必須です'
    if (content.length > 2000) newErrors.content = '内容は2000文字以内で入力してください'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('daily_reports')
      .update({ title: title.trim(), date, category, content: content.trim() })
      .eq('id', report.id)

    if (error) {
      setErrors({ submit: '更新に失敗しました' })
      setLoading(false)
      return
    }

    router.push(`/reports/${report.id}`)
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-zinc-900">日報を編集</h1>
        <Button variant="ghost" onClick={() => router.back()} className="cursor-pointer">← キャンセル</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">タイトル <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={errors.title ? 'border-red-500' : ''}
            maxLength={50}
          />
          <div className="flex justify-between">
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            <span className="text-xs text-zinc-400 ml-auto">{title.length} / 50</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="date">日付 <span className="text-red-500">*</span></Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="cursor-pointer"
            />
          </div>
          <div className="space-y-1.5">
            <Label>カテゴリ <span className="text-red-500">*</span></Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
              <SelectContent>
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
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className={errors.content ? 'border-red-500' : ''}
            maxLength={2000}
          />
          <div className="flex justify-between">
            {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
            <span className="text-xs text-zinc-400 ml-auto">{content.length} / 2000</span>
          </div>
        </div>

        {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} className="cursor-pointer">キャンセル</Button>
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading ? '更新中...' : '更新する'}
          </Button>
        </div>
      </form>
    </div>
  )
}
