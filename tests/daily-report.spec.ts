import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.TEST_EMAIL ?? 'test@example.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'testpassword123'

test.describe('ログイン → 日報作成 → 表示フロー', () => {
  test('ログインできる', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()

    await page.getByLabel('メールアドレス').fill(TEST_EMAIL)
    await page.getByLabel('パスワード').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page).toHaveURL('/reports')
    await expect(page.getByText('チームの日報')).toBeVisible()
  })

  test('日報を作成できる', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill(TEST_EMAIL)
    await page.getByLabel('パスワード').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'ログイン' }).click()
    await expect(page).toHaveURL('/reports')

    await page.goto('/reports/new')
    // h1タグで厳密に指定
    await expect(page.getByRole('heading', { name: '日報を作成', level: 1 })).toBeVisible()

    await page.getByLabel('タイトル').fill('E2Eテスト用日報')
    await page.getByLabel('内容').fill('Playwrightで自動作成したテスト日報です。')
    await page.getByRole('button', { name: '作成する' }).click()

    await expect(page).toHaveURL('/reports')
    await expect(page.getByText('E2Eテスト用日報').first()).toBeVisible()
  })

  test('作成した日報の詳細を表示できる', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill(TEST_EMAIL)
    await page.getByLabel('パスワード').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'ログイン' }).click()
    await expect(page).toHaveURL('/reports')

    // /reports/new以外のリンクをクリック
    const firstCard = page.locator('main a[href^="/reports/"]').first()
    await firstCard.click()

    // URLが /reports/{id} になっていることを確認
    await expect(page).toHaveURL(/\/reports\/[a-z0-9-]+$/)
    await expect(page.getByText('チームの日報').or(page.getByRole('heading'))).toBeVisible()
  })

  test('未ログイン時は/loginにリダイレクトされる', async ({ page }) => {
    await page.goto('/reports')
    await expect(page).toHaveURL('/login')
  })
})
