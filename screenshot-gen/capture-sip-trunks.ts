/**
 * Screenshot capture script for: SIP Trunks
 *
 * Prerequisite: at least one SIP trunk must exist in the portal.
 *
 * Run:
 *   npx playwright test --config=screenshot-gen/playwright.config.ts capture-sip-trunks
 *
 * Output: docs/SIP_Trunks/img/SIP_Trunks/*.png
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT = path.resolve(__dirname, '../docs/SIP_Trunks/img/SIP_Trunks');
fs.mkdirSync(OUTPUT, { recursive: true });

async function waitReady(page: Page) {
  // Wait for loader to appear (briefly), then wait for it to disappear
  await page
    .waitForSelector('[data-testid="loader"]', { state: 'attached', strict: false, timeout: 2000 })
    .catch(() => {});
  await page
    .waitForSelector('[data-testid="loader"]', { state: 'detached', strict: false, timeout: 20000 })
    .catch(() => {});
  // Also wait for table bar-loader if present
  await page
    .waitForSelector('[data-testid="bar-loader"]', { state: 'detached', strict: false, timeout: 10000 })
    .catch(() => {});
}

async function capture(page: Page, name: string) {
  await waitReady(page);
  await page.screenshot({ path: path.join(OUTPUT, `${name}.png`) });
  console.log(`  ✓ ${name}.png`);
}

test('SIP Trunks', async ({ page }) => {
  // ── Login ────────────────────────────────────────────────────────────────
  await page.goto('/');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
  await waitReady(page);

  // ── SIP Trunks list ───────────────────────────────────────────────────────
  await page.goto('/sip-trunks');
  await waitReady(page);
  await capture(page, 'sip-trunks-list');

  // ── Add new SIP trunk dialog ──────────────────────────────────────────────
  await page
    .locator('[data-testid="list-view-header"]')
    .getByRole('button', { name: 'Add new' })
    .click();
  await page.waitForSelector('[data-qa="sip-dialog"]');
  await waitReady(page);
  await capture(page, 'sip-trunks-add-dialog');

  // Close dialog via Cancel button
  await page.locator('[data-qa="sip-dialog"]').getByRole('button', { name: 'Cancel' }).click();
  await page
    .waitForSelector('[data-qa="sip-dialog"]', { state: 'detached', timeout: 5000 })
    .catch(() => {});

  // ── Open first trunk in the list ──────────────────────────────────────────
  const firstRow = page
    .locator('.MuiTableContainer-root:visible table.MuiTable-root tbody tr')
    .first();
  await expect(
    firstRow,
    'No SIP trunks found — add at least one before running this script',
  ).toBeVisible({ timeout: 10000 });
  // Extract the trunk ID from the first cell and navigate directly
  const trunkId = (await firstRow.locator('td').first().textContent())?.trim();
  if (!trunkId) throw new Error('Could not read trunk ID from first row');
  await page.goto(`/sip-trunks/${trunkId}`);
  await page.waitForURL('**/sip-trunks/**');
  await waitReady(page);

  // ── SIP trunk tab (default) ───────────────────────────────────────────────
  await capture(page, 'sip-trunks-general-tab');

  // ── Call settings tab ─────────────────────────────────────────────────────
  await page.getByRole('tab', { name: 'Call settings' }).click();
  await waitReady(page);
  await capture(page, 'sip-trunks-call-settings-tab');

  // ── SIP contact – static address ─────────────────────────────────────────
  const sipContactToggle = page.locator(
    '[data-qa="status-switch-sip-contact-status-switch"] input',
  );
  const wasEnabled = await sipContactToggle.isChecked();
  if (!wasEnabled) {
    await page.locator('[data-qa="status-switch-sip-contact-status-switch"]').click();
    await page.waitForTimeout(500);
  }
  // Ensure Static address is selected
  const staticRadio = page.locator('[data-qa="sip-contact-static-address"] input');
  const isStatic = await staticRadio.isChecked().catch(() => false);
  if (!isStatic) {
    await page.locator('[data-qa="sip-contact-static-address"]').click();
    await page.waitForTimeout(400);
  }
  await capture(page, 'sip-trunks-sip-contact-static');

  // ── SIP contact – dynamic address ────────────────────────────────────────
  await page.locator('[data-qa="sip-contact-dynamic-address"]').click();
  await page.waitForTimeout(500);
  await capture(page, 'sip-trunks-sip-contact-dynamic');

  // Reset to clean state with a full page reload — bypasses the React Router
  // <Prompt> that would otherwise show "Discard unsaved changes?"
  await page.goto(`/sip-trunks/${trunkId}`);
  await waitReady(page);

  // ── Call forwarding tab ───────────────────────────────────────────────────
  await page.getByRole('tab', { name: 'Call forwarding' }).click();
  await waitReady(page);
  await capture(page, 'sip-trunks-call-forwarding-tab');

  // ── Plan tab ──────────────────────────────────────────────────────────────
  await page.getByRole('tab', { name: 'Plan' }).click();
  await waitReady(page);
  await capture(page, 'sip-trunks-plan-tab');

  // ── Call history tab ──────────────────────────────────────────────────────
  await page.getByRole('tab', { name: 'Call history' }).click();
  await waitReady(page);
  await capture(page, 'sip-trunks-call-history-tab');
});
