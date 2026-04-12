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
    <div className="mt-6 bg-white border border-zinc-200 rounded-lg p-5">
      <h2 className="text-sm font-semibold text-zinc-900 mb-4">
        コメント（{comments.length}件）
      </h2>

      <div className="space-y-1 mb-4">
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

      {/* 入力フォーム：縦並びでボタンを下に配置 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="コメントを入力（500文字以内）"
          rows={3}
          className="w-full resize-none bg-zinc-50"
          maxLength={500}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">{content.length}/500</span>
          <Button
            type="submit"
            disabled={loading || !content.trim()}
            className="cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                送信中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
                送信
              </span>
            )}
          </Button>
        </div>
      </form>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  )
}
