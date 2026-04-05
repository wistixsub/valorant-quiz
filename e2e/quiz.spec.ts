import { test, expect } from '@playwright/test';

test.describe('ホーム画面', () => {
  test('マップ選択カードが3枚表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=バインド')).toBeVisible();
    await expect(page.locator('text=ヘイヴン')).toBeVisible();
    await expect(page.locator('text=スプリット')).toBeVisible();
  });

  test('バインドカードをクリックするとクイズ画面に遷移する', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=バインド').click();
    await expect(page).toHaveURL(/\/quiz\?map=bind/);
  });
});

test.describe('クイズ画面 (バインド)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz?map=bind');
  });

  test('topbar・progressbar・選択肢が表示される', async ({ page }) => {
    await expect(page.locator('#quiz-topbar')).toBeVisible();
    await expect(page.locator('#quiz-progressbar')).toBeVisible();
    await expect(page.locator('.choice-btn').first()).toBeVisible();
  });

  test('回答前は「次の問題」ボタンが表示されない', async ({ page }) => {
    await expect(page.locator('button:has-text("次の問題")')).toHaveCount(0);
    await expect(page.locator('button:has-text("結果を見る")')).toHaveCount(0);
  });

  test('選択肢クリック後に正解/不正解フィードバックが表示される', async ({ page }) => {
    await page.locator('.choice-btn').first().click();
    // choice-correct または choice-wrong が付く
    const correctEl = page.locator('.choice-correct');
    const wrongEl = page.locator('.choice-wrong');
    const hasFeedback =
      (await correctEl.count()) > 0 || (await wrongEl.count()) > 0;
    expect(hasFeedback).toBe(true);
  });

  test('回答後に解説が表示される', async ({ page }) => {
    await page.locator('.choice-btn').first().click();
    await expect(page.locator('text=解説')).toBeVisible();
  });

  test('回答後に「次の問題」または「結果を見る」が表示される', async ({ page }) => {
    await page.locator('.choice-btn').first().click();
    const next = page.locator('button:has-text("次の問題"), button:has-text("結果を見る")');
    await expect(next.first()).toBeVisible();
  });

  test('「← ホーム」でトップに戻れる', async ({ page }) => {
    await page.locator('text=← ホーム').click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('クイズ完走フロー', () => {
  test('全問回答後に結果画面が表示される', async ({ page }) => {
    await page.goto('/quiz?map=bind');

    // 全問を最初の選択肢で回答
    for (let i = 0; i < 20; i++) {
      const choiceBtn = page.locator('.choice-btn').first();
      if (!(await choiceBtn.isVisible({ timeout: 2000 }).catch(() => false))) break;

      await choiceBtn.click();

      const nextBtn = page.locator(
        'button:has-text("次の問題"), button:has-text("結果を見る")'
      ).first();
      await nextBtn.waitFor({ state: 'visible' });
      await nextBtn.click();

      // 結果画面に到達したら終了
      if (await page.locator('text=もう一度').isVisible({ timeout: 500 }).catch(() => false)) {
        break;
      }
    }

    await expect(page.locator('text=もう一度')).toBeVisible();
    await expect(page.locator('text=マップ選択へ')).toBeVisible();
  });

  test('結果画面から「もう一度」で再挑戦できる', async ({ page }) => {
    await page.goto('/quiz?map=bind');

    for (let i = 0; i < 20; i++) {
      const choiceBtn = page.locator('.choice-btn').first();
      if (!(await choiceBtn.isVisible({ timeout: 2000 }).catch(() => false))) break;

      await choiceBtn.click();
      const nextBtn = page.locator(
        'button:has-text("次の問題"), button:has-text("結果を見る")'
      ).first();
      await nextBtn.waitFor({ state: 'visible' });
      await nextBtn.click();

      if (await page.locator('text=もう一度').isVisible({ timeout: 500 }).catch(() => false)) {
        break;
      }
    }

    await page.locator('button:has-text("もう一度")').click();
    await expect(page.locator('.choice-btn').first()).toBeVisible();
  });
});
