export type Profile = {
  id: string
  email: string
  name: string
  avatar_url: string | null
  created_at: string
}

export type Category = '開発' | '会議' | 'その他'

export type DailyReport = {
  id: string
  user_id: string
  title: string
  date: string
  category: Category
  content: string
  created_at: string
  updated_at: string
  profiles?: Profile
  comments?: Comment[]
}

export type Comment = {
  id: string
  report_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: Profile
}
