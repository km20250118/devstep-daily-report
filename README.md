# 📋 日報管理システム（devstep-daily-report）

チームの日々の業務内容を記録・共有するWebアプリケーションです。  
メンバーが日報を投稿し、チーム内でコメントを通じてフィードバックを行えます。

> **デモURL:** https://devstep-daily-report.vercel.app （Week4デプロイ後に更新）

---

## 画面設計（ワイヤーフレーム）

`docs/wireframes.html` をブラウザで開くと、主要画面のワイヤーフレームを確認できます。

```bash
open docs/wireframes.html
```

収録画面：日報一覧 / 日報詳細 / 日報作成 / エラー状態 / ログイン / プロフィール

---

## スクリーンショット

> Week4実装後に追加予定

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 16（App Router） |
| 言語 | TypeScript（strict: true） |
| データベース / 認証 | Supabase |
| スタイリング | Tailwind CSS + shadcn/ui |
| デプロイ | Vercel |
| テスト | Vitest・Playwright |
| CI/CD | GitHub Actions |

---

## 機能一覧

### ユーザー認証
- メール / パスワードによる新規登録・ログイン・ログアウト
- パスワードリセット（メール送信）
- 未ログイン時・セッション切れ時の自動リダイレクト

### プロフィール管理
- 表示名・アバター画像の編集

### 日報 CRUD
- 日報の作成（タイトル・日付・カテゴリ・本文）
- チーム全員の日報一覧表示
- 日報の詳細表示
- 自分の日報の編集・削除

### 検索・フィルター
- キーワード検索（タイトル・本文）
- 日付範囲・投稿者・カテゴリによる絞り込み

### コメント
- 日報へのコメント投稿・表示
- 自分のコメントの削除

---

## セットアップ手順

### 必要環境

- Node.js 20 以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/<your-username>/devstep-daily-report.git
cd devstep-daily-report

# 依存パッケージをインストール
npm install
```

### 環境変数の設定

`.env.local` ファイルをプロジェクトルートに作成し、以下を設定してください。

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

---

## 環境変数

| 変数名 | 説明 | 必須 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトの URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の公開 anon キー | ✅ |

Supabase プロジェクトの作成方法は [Supabase 公式ドキュメント](https://supabase.com/docs) を参照してください。

---

## テスト実行方法

```bash
# ユニットテスト（Vitest）
npm run test

# ユニットテスト（ウォッチモード）
npm run test:watch

# E2Eテスト（Playwright）
npm run test:e2e

# カバレッジ計測
npm run test:coverage
```

---

## デプロイ方法

本プロジェクトは Vercel にデプロイします。

1. [Vercel](https://vercel.com) にログインし、リポジトリを連携
2. 環境変数（`NEXT_PUBLIC_SUPABASE_URL`・`NEXT_PUBLIC_SUPABASE_ANON_KEY`）を Vercel の設定画面で登録
3. `main` ブランチへのマージで自動デプロイされます

---

## 開発プロセス

> Week8完成時に記載予定

- 工夫した点
- 苦労した点
- 今後の改善案

---

## ライセンス

MIT
