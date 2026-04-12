'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

type Props = {
  users: { id: string; name: string }[]
}

export default function SearchFilter({ users }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`/reports?${params.toString()}`)
    },
    [router, searchParams]
  )

  const isComposing = useRef(false)

  const handleKeywordChange = (value: string) => {
    setKeyword(value)
    if (isComposing.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      params.delete('page')
      router.push(`/reports?${params.toString()}`)
    }, 300)
  }

  const handleCompositionEnd = (value: string) => {
    isComposing.current = false
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      params.delete('page')
      router.push(`/reports?${params.toString()}`)
    }, 300)
  }

  useEffect(() => {
    setKeyword(searchParams.get('q') ?? '')
  }, [searchParams])

  const handleReset = () => {
    router.push('/reports')
  }

  const hasFilter =
    searchParams.get('q') ||
    searchParams.get('userId') ||
    searchParams.get('category') ||
    searchParams.get('from') ||
    searchParams.get('to')

  const filterKey = searchParams.toString()

  return (
    <div className="space-y-3 mb-6" key={filterKey}>

      {/* キーワード：常に1行全幅 */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-zinc-400">キーワード</span>
        <Input
          placeholder="キーワードで検索..."
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          onCompositionStart={() => { isComposing.current = true }}
          onCompositionEnd={(e) => handleCompositionEnd(e.currentTarget.value)}
        />
      </div>

      {/* 日付：小さい画面では縦並び */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-xs text-zinc-400">開始日</span>
          <Input
            type="date"
            defaultValue={searchParams.get('from') ?? ''}
            onChange={(e) => updateParams('from', e.target.value)}
            className="cursor-pointer w-full"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-xs text-zinc-400">終了日</span>
          <Input
            type="date"
            defaultValue={searchParams.get('to') ?? ''}
            onChange={(e) => updateParams('to', e.target.value)}
            className="cursor-pointer w-full"
          />
        </div>
      </div>

      {/* 投稿者・カテゴリ */}
      <div className="flex gap-2 flex-wrap items-center">
        <Select
          key={`userId-${searchParams.get('userId') ?? 'all'}`}
          defaultValue={searchParams.get('userId') ?? 'all'}
          onValueChange={(v) => updateParams('userId', v)}
        >
          <SelectTrigger className="w-full sm:w-36 cursor-pointer bg-white">
            <SelectValue placeholder="投稿者" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-zinc-200 shadow-md">
            <SelectItem value="all" className="cursor-pointer">全員</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id} className="cursor-pointer">
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          key={`category-${searchParams.get('category') ?? 'all'}`}
          defaultValue={searchParams.get('category') ?? 'all'}
          onValueChange={(v) => updateParams('category', v)}
        >
          <SelectTrigger className="w-full sm:w-36 cursor-pointer bg-white">
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-zinc-200 shadow-md">
            <SelectItem value="all" className="cursor-pointer">全カテゴリ</SelectItem>
            <SelectItem value="開発" className="cursor-pointer">開発</SelectItem>
            <SelectItem value="会議" className="cursor-pointer">会議</SelectItem>
            <SelectItem value="その他" className="cursor-pointer">その他</SelectItem>
          </SelectContent>
        </Select>

        {hasFilter && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="cursor-pointer text-zinc-500">
            ✕ リセット
          </Button>
        )}
      </div>

    </div>
  )
}
