'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

type Props = {
  users: { id: string; name: string }[]
}

export default function SearchFilter({ users }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  const handleReset = () => {
    router.push('/reports')
  }

  const hasFilter =
    searchParams.get('q') ||
    searchParams.get('userId') ||
    searchParams.get('category') ||
    searchParams.get('from') ||
    searchParams.get('to')

  return (
    <div className="space-y-3 mb-6">
      <div className="flex gap-2 items-end">
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-xs text-zinc-400">キーワード</span>
          <Input
            placeholder="キーワードで検索..."
            defaultValue={searchParams.get('q') ?? ''}
            onChange={(e) => {
              const val = e.target.value
              const params = new URLSearchParams(searchParams.toString())
              if (val) {
                params.set('q', val)
              } else {
                params.delete('q')
              }
              params.delete('page')
              router.push(`/reports?${params.toString()}`)
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-zinc-400">開始日</span>
          <Input
            type="date"
            defaultValue={searchParams.get('from') ?? ''}
            onChange={(e) => updateParams('from', e.target.value)}
            className="w-36 cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-zinc-400">終了日</span>
          <Input
            type="date"
            defaultValue={searchParams.get('to') ?? ''}
            onChange={(e) => updateParams('to', e.target.value)}
            className="w-36 cursor-pointer"
          />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        <Select
          defaultValue={searchParams.get('userId') ?? 'all'}
          onValueChange={(v) => updateParams('userId', v)}
        >
          <SelectTrigger className="w-36 cursor-pointer">
            <SelectValue placeholder="投稿者" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">全員</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id} className="cursor-pointer">
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get('category') ?? 'all'}
          onValueChange={(v) => updateParams('category', v)}
        >
          <SelectTrigger className="w-36 cursor-pointer">
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent>
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
