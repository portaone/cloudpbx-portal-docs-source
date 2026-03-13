import { test } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const OUTPUT = path.resolve(__dirname, '../docs/Cloud_PBX/img/Fax_Mailboxes');

test('capture fax-mailboxes screenshots', async ({ page }) => {
  fs.mkdirSync(OUTPUT, { recursive: true });

  // Login
  await page.goto(process.env.BASE_URL + '/login');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');

  // Navigate to Fax Mailboxes list
  await page.goto(process.env.BASE_URL + '/fax-mailboxes');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  await page.waitForSelector('tbody tr', { state: 'visible', timeout: 20000 }).catch(() => {});
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);

  // --- List page ---
  await page.screenshot({ path: path.join(OUTPUT, 'fax-mailboxes-list.png') });

  // --- Add new dialog ---
  await page.getByRole('button', { name: 'Add new' }).click();
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'fax-mailboxes-add-dialog.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Navigate to fax mailbox 0529 detail (edit button is index 1; index 0 is transmission history)
  await page.goto(process.env.BASE_URL + '/fax-mailboxes/0529');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  await page.waitForTimeout(600);

  // --- Extension tab (default) ---
  await page.getByRole('tab', { name: 'Extension' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUTPUT, 'fax-mailboxes-detail-extension.png') });

  // --- Plan tab ---
  await page.getByRole('tab', { name: 'Plan' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'fax-mailboxes-detail-plan.png') });

  // --- Transmission history (navigate back to list, open dialog from first row button 0) ---
  await page.goto(process.env.BASE_URL + '/fax-mailboxes');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  // Click the transmission history button (first button in the first row)
  const historyBtn = page.locator('tbody tr').first().locator('button').first();
  await historyBtn.click();
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'fax-mailboxes-transmission-history.png') });
  await page.keyboard.press('Escape');
});
