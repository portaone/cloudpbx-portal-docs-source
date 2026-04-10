/**
 * Screenshot capture script for: Device Phone Books
 *
 * Prerequisites:
 *  - At least one device phone book with entries must exist (e.g. "Suppliers").
 *
 * Run:
 *   npx playwright test --config=screenshot-gen/playwright.config.ts capture-device-phone-books
 *
 * Output: docs/Inventory/img/Device_Phone_Books/*.png
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT = path.resolve(__dirname, '../docs/Inventory/img/Device_Phone_Books');
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

test('Device Phone Books', async ({ page }) => {
  // ── Login ─────────────────────────────────────────────────────────────────
  await page.goto('/');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
  await waitReady(page);

  // ── Device phone books list ───────────────────────────────────────────────
  await page.goto('/device-phone-books');
  await waitReady(page);
  await capture(page, 'device-phone-books-list');

  // ── Add phone book dialog ─────────────────────────────────────────────────
  // The button is labelled "+ Add new" (generic across all list pages)
  await page.getByRole('button', { name: 'Add new' }).click();
  await page.waitForSelector('[role="dialog"]');
  await waitReady(page);
  await capture(page, 'device-phone-books-add-dialog');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 5000 }).catch(() => {});

  // ── Open first phone book via edit icon ───────────────────────────────────
  // Phone book rows are not <a> tags — click the edit (pencil) icon
  const firstEditBtn = page
    .locator('.MuiTableContainer-root table tbody tr')
    .first()
    .locator('button')
    .first();
  await expect(firstEditBtn, 'No phone books found').toBeVisible({ timeout: 10000 });
  await firstEditBtn.click();
  await page.waitForURL('**/device-phone-books/**');
  await waitReady(page);

  // ── Phone book entries ────────────────────────────────────────────────────
  await capture(page, 'device-phone-books-entries');

  // ── Add entry dialog ──────────────────────────────────────────────────────
  const addEntryBtn = page.getByRole('button', { name: /add entry/i });
  if (await addEntryBtn.isVisible().catch(() => false)) {
    await addEntryBtn.click();
    await page.waitForSelector('[role="dialog"]');
    await waitReady(page);
    await capture(page, 'device-phone-books-add-entry-dialog');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 5000 }).catch(() => {});
  }
});
