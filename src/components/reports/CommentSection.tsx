'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Comment } from '@/types'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const TZ = 'Asia/Tokyo'
const toJST = (dateStr: string) => toZonedTime(new Date(dateStr), TZ)

export default function CommentSection({
  reportId,
  initialComments,
  currentUserId,
}: {
  reportId: string
  initialComments: Comment[]
  currentUserId: string
}) {
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    if (content.length > 500) {
      setError('コメントは500文字以内で入力してください')
      return
    }
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('comments')
        .insert({ report_id: reportId, user_id: currentUserId, content: content.trim() })
        .select('*, profiles(id, name, avatar_url)')
        .single()

      if (error) throw error

      setComments([...comments, data])
      setContent('')
    } catch (err) {
      console.error(err)
      setError('コメントの投稿に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('このコメントを削除しますか？')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('comments').delete().eq('id', commentId)
      if (error) throw error
      setComments(comments.filter((c) => c.id !== commentId))
    } catch (err) {
      console.error(err)
      alert('削除に失敗しました。もう一度お試しください。')
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-zinc-900 mb-4">
        コメント（{comments.length}件）
      </h2>

      <div className="space-y-1">
        {comments.map((comment) => (
          <div key={comment.id} className="py-3 border-b border-zinc-100 last:border-0">
            <div className="flex items-center gap-2 mb-1.5">
              {comment.profiles?.avatar_url ? (
                <img
                  src={comment.profiles.avatar_url}
                  alt={comment.profiles.name ?? ''}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-semibold">
                  {comment.profiles?.name?.[0] ?? '?'}
                </div>
              )}
              <span className="text-sm font-medium text-zinc-700">{comment.profiles?.name}</span>
              <span className="text-xs text-zinc-400">
                {format(toJST(comment.created_at), 'yyyy/MM/dd HH:mm')}
              </span>
              {comment.user_id === currentUserId && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="ml-auto text-xs text-red-400 hover:text-red-600 cursor-pointer"
                >
                  削除
                </button>
              )}
            </div>
            <p className="text-sm text-zinc-700 pl-8 leading-relaxed">{comment.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mt-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="コメントを入力（500文字以内）"
          rows={2}
          className="flex-1 resize-none"
          maxLength={500}
        />
        <Button type="submit" disabled={loading || !content.trim()} className="self-end cursor-pointer">
          {loading ? '送信中...' : '送信'}
        </Button>
      </form>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  )
}
