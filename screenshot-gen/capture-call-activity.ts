import { test } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const OUTPUT = path.resolve(__dirname, '../docs/Calls/img/Activity');

test('capture call-activity screenshots', async ({ page }) => {
  fs.mkdirSync(OUTPUT, { recursive: true });

  // Login
  await page.goto(process.env.BASE_URL + '/login');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');

  // Navigate to Call Activity
  await page.goto(process.env.BASE_URL + '/call-activity');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' }).catch(() => {});
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);

  // --- Current Calls tab (default) ---
  await page.getByRole('tab', { name: /current calls/i }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'call-activity-current-calls.png') });

  // --- Recent Calls tab ---
  await page.getByRole('tab', { name: /recent calls/i }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'call-activity-recent-calls.png') });

  // --- Call Statistics tab ---
  await page.getByRole('tab', { name: /call statistics/i }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUTPUT, 'call-activity-call-statistics.png') });
});
