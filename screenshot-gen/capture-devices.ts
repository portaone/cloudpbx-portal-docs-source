/**
 * Screenshot capture script for: Devices
 *
 * Prerequisites:
 *  - At least one device must exist in the portal (with at least one line assigned).
 *
 * Run:
 *   npx playwright test --config=screenshot-gen/playwright.config.ts capture-devices
 *
 * Output: docs/Inventory/img/Devices/*.png
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT = path.resolve(__dirname, '../docs/Inventory/img/Devices');
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

test('Devices', async ({ page }) => {
  // ── Login ─────────────────────────────────────────────────────────────────
  await page.goto('/');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
  await waitReady(page);

  // ── Devices list ──────────────────────────────────────────────────────────
  await page.goto('/devices');
  await waitReady(page);
  await capture(page, 'devices-list');

  // ── Add new device dialog ─────────────────────────────────────────────────
  // The button is labelled "+ Add new" (generic across all list pages)
  await page.getByRole('button', { name: 'Add new' }).click();
  await page.waitForSelector('[role="dialog"]');
  await waitReady(page);
  await capture(page, 'devices-add-dialog');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 5000 }).catch(() => {});

  // ── Open first device via edit icon ───────────────────────────────────────
  // Rows are not <a> tags — navigate via the edit (pencil) icon in the first row
  const firstEditBtn = page
    .locator('.MuiTableContainer-root table tbody tr')
    .first()
    .locator('button')
    .first();
  await expect(firstEditBtn, 'No devices found').toBeVisible({ timeout: 10000 });
  await firstEditBtn.click();
  await page.waitForURL('**/devices/**');
  await waitReady(page);

  // ── General tab ───────────────────────────────────────────────────────────
  const generalTab = page.getByRole('tab', { name: /general/i });
  if (await generalTab.isVisible().catch(() => false)) {
    await generalTab.click();
  }
  await waitReady(page);
  await capture(page, 'devices-general-tab');

  // ── Lines tab ─────────────────────────────────────────────────────────────
  await page.getByRole('tab', { name: /lines/i }).click();
  await waitReady(page);
  await capture(page, 'devices-lines-tab');

  // ── Assign extension dialog (click first line's edit button) ──────────────
  const lineEditBtn = page
    .locator('.MuiTableContainer-root table tbody tr')
    .first()
    .locator('button')
    .first();
  const hasLineEdit = await lineEditBtn.isVisible().catch(() => false);
  if (hasLineEdit) {
    await lineEditBtn.click();
    await page.waitForSelector('[role="dialog"]');
    await waitReady(page);
    await capture(page, 'devices-assign-extension-dialog');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 5000 }).catch(() => {});
  }

  // ── Profile tab ───────────────────────────────────────────────────────────
  const profileTab = page.getByRole('tab', { name: /profile/i });
  if (await profileTab.isVisible().catch(() => false)) {
    await profileTab.click();
    await waitReady(page);
    await capture(page, 'devices-profile-tab');
  }
});
