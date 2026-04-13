import { describe, it, expect } from 'vitest'
import {
  validateTitle,
  validateContent,
  validateEmail,
  validatePassword,
} from '@/lib/validation'

describe('validateTitle', () => {
  it('空文字の場合エラーを返す', () => {
    expect(validateTitle('')).toBe('タイトルは必須です')
  })
  it('スペースのみの場合エラーを返す', () => {
    expect(validateTitle('   ')).toBe('タイトルは必須です')
  })
  it('50文字を超える場合エラーを返す', () => {
    expect(validateTitle('a'.repeat(51))).toBe('50文字以内で入力してください')
  })
  it('正常な入力の場合nullを返す', () => {
    expect(validateTitle('今日の業務内容')).toBeNull()
  })
  it('ちょうど50文字の場合nullを返す', () => {
    expect(validateTitle('a'.repeat(50))).toBeNull()
  })
})

describe('validateContent', () => {
  it('空文字の場合エラーを返す', () => {
    expect(validateContent('')).toBe('内容は必須です')
  })
  it('2000文字を超える場合エラーを返す', () => {
    expect(validateContent('a'.repeat(2001))).toBe('2000文字以内で入力してください')
  })
  it('正常な入力の場合nullを返す', () => {
    expect(validateContent('今日は○○を実装しました')).toBeNull()
  })
  it('ちょうど2000文字の場合nullを返す', () => {
    expect(validateContent('a'.repeat(2000))).toBeNull()
  })
})

describe('validateEmail', () => {
  it('空文字の場合エラーを返す', () => {
    expect(validateEmail('')).toBe('メールアドレスを入力してください')
  })
  it('形式が不正な場合エラーを返す', () => {
    expect(validateEmail('invalid-email')).toBe('メールアドレスの形式が正しくありません')
  })
  it('正常なメールアドレスの場合nullを返す', () => {
    expect(validateEmail('test@example.com')).toBeNull()
  })
})

describe('validatePassword', () => {
  it('空文字の場合エラーを返す', () => {
    expect(validatePassword('')).toBe('パスワードを入力してください')
  })
  it('7文字以下の場合エラーを返す', () => {
    expect(validatePassword('1234567')).toBe('8文字以上で入力してください')
  })
  it('8文字以上の場合nullを返す', () => {
    expect(validatePassword('12345678')).toBeNull()
  })
})
