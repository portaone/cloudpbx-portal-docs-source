/**
 * Screenshot capture script for: Call Recordings
 *
 * Prerequisites:
 *  - At least one call recording must exist in the portal.
 *
 * Run:
 *   npx playwright test --config=screenshot-gen/playwright.config.ts capture-recordings
 *
 * Output: docs/Calls/img/Recordings/*.png
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT = path.resolve(__dirname, '../docs/Calls/img/Recordings');
fs.mkdirSync(OUTPUT, { recursive: true });

async function waitReady(page: Page) {
  await page
    .waitForSelector('[data-testid="loader"]', { state: 'attached', strict: false, timeout: 2000 })
    .catch(() => {});
  await page
    .waitForSelector('[data-testid="loader"]', { state: 'detached', strict: false, timeout: 20000 })
    .catch(() => {});
  await page
    .waitForSelector('[data-testid="bar-loader"]', { state: 'detached', strict: false, timeout: 10000 })
    .catch(() => {});
}

async function capture(page: Page, name: string) {
  await waitReady(page);
  await page.screenshot({ path: path.join(OUTPUT, `${name}.png`) });
  console.log(`  ✓ ${name}.png`);
}

test('Call Recordings', async ({ page }) => {
  // ── Login ─────────────────────────────────────────────────────────────────
  await page.goto('/');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
  await waitReady(page);

  // ── Recordings list ───────────────────────────────────────────────────────
  await page.goto('/call-recordings');
  await waitReady(page);
  await capture(page, 'recordings-list');

  // ── Call detail record dialog ─────────────────────────────────────────────
  // Click the Details button (📋) on the first row.
  // Action buttons order: Play (0), Details (1), Download (2), Delete (3).
  // Details is typically at index 1; fall back to index 0 if Play is absent.
  const firstRow = page.locator('.MuiTableContainer-root table tbody tr').first();
  await expect(firstRow, 'No recordings found').toBeVisible({ timeout: 15000 });

  const actionButtons = firstRow.locator('button');
  const buttonCount = await actionButtons.count();
  // Details button is second if Play is present (count >= 2), otherwise first
  const detailsBtnIndex = buttonCount >= 2 ? 1 : 0;
  await actionButtons.nth(detailsBtnIndex).click();

  await page.waitForSelector('[role="dialog"]');
  await waitReady(page);

  // ── Info tab ──────────────────────────────────────────────────────────────
  // Info tab is active by default
  await capture(page, 'recordings-detail-info-tab');

  // ── Recording tab ─────────────────────────────────────────────────────────
  const recordingTab = page.getByRole('tab', { name: /recording/i });
  if (await recordingTab.isVisible().catch(() => false)) {
    await recordingTab.click();
    await waitReady(page);
    await capture(page, 'recordings-detail-recording-tab');
  }

  // Close dialog
  const closeBtn = page.getByRole('button', { name: /close/i });
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
    await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 5000 }).catch(() => {});
  } else {
    await page.keyboard.press('Escape');
    await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 5000 }).catch(() => {});
  }
});
