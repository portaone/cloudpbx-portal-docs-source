/**
 * Screenshot capture script for: Device Profiles
 *
 * Prerequisites:
 *  - At least one device profile must exist in the portal.
 *
 * Run:
 *   npx playwright test --config=screenshot-gen/playwright.config.ts capture-device-profiles
 *
 * Output: docs/Inventory/img/Device_Profiles/*.png
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT = path.resolve(__dirname, '../docs/Inventory/img/Device_Profiles');
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

test('Device Profiles', async ({ page }) => {
  // ── Login ─────────────────────────────────────────────────────────────────
  await page.goto('/');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
  await waitReady(page);

  // ── Device profiles list ──────────────────────────────────────────────────
  await page.goto('/device-profiles');
  await waitReady(page);
  await capture(page, 'device-profiles-list');

  // ── Add new profile dialog ────────────────────────────────────────────────
  // The button is labelled "+ Add new" (generic across all list pages)
  await page.getByRole('button', { name: 'Add new' }).click();
  await page.waitForSelector('[role="dialog"]');
  await waitReady(page);
  await capture(page, 'device-profiles-add-dialog');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 5000 }).catch(() => {});

  // ── Open first profile via edit icon ──────────────────────────────────────
  const firstEditBtn = page
    .locator('.MuiTableContainer-root table tbody tr')
    .first()
    .locator('button')
    .first();
  await expect(firstEditBtn, 'No device profiles found').toBeVisible({ timeout: 10000 });
  await firstEditBtn.click();
  await page.waitForURL('**/device-profiles/**');
  await waitReady(page);

  // ── Programmable keys tab (default) ──────────────────────────────────────
  await capture(page, 'device-profiles-programmable-keys-tab');

  // ── Phone books tab ───────────────────────────────────────────────────────
  const phoneBooksTab = page.getByRole('tab', { name: /phone books/i });
  if (await phoneBooksTab.isVisible().catch(() => false)) {
    await phoneBooksTab.click();
    await waitReady(page);
    await capture(page, 'device-profiles-phone-books-tab');
  }
});
