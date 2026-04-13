// バリデーション関数

export function validateTitle(title: string): string | null {
  if (!title.trim()) return 'タイトルは必須です'
  if (title.length > 50) return '50文字以内で入力してください'
  return null
}

export function validateContent(content: string): string | null {
  if (!content.trim()) return '内容は必須です'
  if (content.length > 2000) return '2000文字以内で入力してください'
  return null
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'メールアドレスを入力してください'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'メールアドレスの形式が正しくありません'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'パスワードを入力してください'
  if (password.length < 8) return '8文字以上で入力してください'
  return null
}
