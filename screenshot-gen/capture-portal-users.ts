import { test } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const OUTPUT = path.resolve(__dirname, '../docs/My_Company/img/Portal_Users');

test('capture portal-users screenshots', async ({ page }) => {
  fs.mkdirSync(OUTPUT, { recursive: true });

  // Login
  await page.goto(process.env.BASE_URL + '/login');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');

  // Navigate to Portal Users list
  await page.goto(process.env.BASE_URL + '/portal-users');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  // Wait for table rows AND for any lingering spinners to disappear
  await page.waitForSelector('tbody tr', { state: 'visible' });
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000);

  // --- List page ---
  await page.screenshot({ path: path.join(OUTPUT, 'portal-users-list.png') });

  // --- Add new portal user dialog ---
  await page.getByRole('button', { name: 'Add new' }).click();
  // Wait for the dialog to appear, then for all spinners to finish
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUTPUT, 'portal-users-add-dialog.png') });

  // Close dialog
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(300);

  // --- User detail: Settings tab ---
  // Navigate via first edit button in table
  const firstEditBtn = page
    .locator('.MuiTableContainer-root table tbody tr')
    .first()
    .locator('button')
    .first();
  await firstEditBtn.click();
  await page.waitForURL('**/portal-users/**');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  await page.waitForTimeout(500);
  await page.getByRole('tab', { name: 'Settings' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUTPUT, 'portal-users-detail-settings.png') });

  // --- User detail: Security tab ---
  await page.getByRole('tab', { name: 'Security' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUTPUT, 'portal-users-detail-security.png') });
});
