import { test } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const OUTPUT = path.resolve(__dirname, '../docs/Cloud_PBX/img/Call_Parking_Slots');

test('capture call-parking-slots screenshots', async ({ page }) => {
  fs.mkdirSync(OUTPUT, { recursive: true });

  // Login
  await page.goto(process.env.BASE_URL + '/login');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');

  // Navigate to Call Parking Slots list
  await page.goto(process.env.BASE_URL + '/parking-slots');
  // Wait for table rows to confirm the page has fully rendered
  const addNewBtn = page.locator('button').filter({ hasText: /Add new/i });
  await addNewBtn.waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);

  // --- List page ---
  await page.screenshot({ path: path.join(OUTPUT, 'call-parking-slots-list.png') });

  // --- Add new dialog ---
  await addNewBtn.click();
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUTPUT, 'call-parking-slots-add-dialog.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
});
