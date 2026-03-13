/**
 * Screenshot capture script for: Voicemail
 *
 * Prerequisites:
 *  - At least one extension must have voicemail messages (ideally unread).
 *  - The script uses extension 1000 (Klaus Haertel) which has known voicemails.
 *    If that extension is empty, update EXTENSION_WITH_VOICEMAIL below.
 *
 * Run:
 *   npx playwright test --config=screenshot-gen/playwright.config.ts capture-voicemail
 *
 * Output: docs/Cloud_PBX/img/Voicemail/*.png
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT = path.resolve(__dirname, '../docs/Cloud_PBX/img/Voicemail');
fs.mkdirSync(OUTPUT, { recursive: true });

// Extension number/ID that has voicemail messages in the portal
const EXTENSION_WITH_VOICEMAIL = '1000';

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

test('Voicemail', async ({ page }) => {
  // ── Login ─────────────────────────────────────────────────────────────────
  await page.goto('/');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
  await waitReady(page);

  // ── Navigate to the extension detail page ─────────────────────────────────
  await page.goto(`/extensions/${EXTENSION_WITH_VOICEMAIL}`);
  await waitReady(page);

  // ── Extension header with Voicemail button ────────────────────────────────
  // The Voicemail button is a div (not a <button>) in the extension header.
  // Locate it by its visible "Voicemail" text label.
  const voicemailBtnByText = page.locator('text=Voicemail').first();
  await expect(voicemailBtnByText, 'Voicemail button not found — does this extension have voicemails?')
    .toBeVisible({ timeout: 15000 });
  await capture(page, 'voicemail-extension-header');

  // ── Open the Voicemail dialog ─────────────────────────────────────────────
  await voicemailBtnByText.click();
  await page.waitForSelector('[role="dialog"]');
  await waitReady(page);

  // ── Voicemail list ────────────────────────────────────────────────────────
  await capture(page, 'voicemail-list');

  // ── Voicemail detail dialog ───────────────────────────────────────────────
  // Click the Details button (📋) on the first voicemail row
  const dialogRows = page.locator('[role="dialog"] tbody tr');
  const rowCount = await dialogRows.count();

  if (rowCount > 0) {
    const detailsBtn = dialogRows.first().locator('[data-testid="details-icon-button"], [data-qa="details-icon-button"]').first();
    const detailsBtnVisible = await detailsBtn.isVisible().catch(() => false);

    if (detailsBtnVisible) {
      await detailsBtn.click();
    } else {
      // Fallback: click the second button in the row (Details comes after Play)
      const rowBtns = dialogRows.first().locator('button');
      const btnCount = await rowBtns.count();
      await rowBtns.nth(Math.min(1, btnCount - 1)).click();
    }

    await page.waitForSelector('[data-testid="voicemail-details-dialog"], [role="dialog"] [role="dialog"]', { timeout: 10000 }).catch(() => {});
    await waitReady(page);

    // ── Detail view ─────────────────────────────────────────────────────────
    // The voicemail detail is a single dialog (no separate tabs).
    // It shows metadata fields and an inline audio player.
    await capture(page, 'voicemail-detail-info');
  }
});
