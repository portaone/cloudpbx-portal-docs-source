import { test } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const OUTPUT = path.resolve(__dirname, '../docs/My_Company/img/Company_Info');

test('capture company-info screenshots', async ({ page }) => {
  fs.mkdirSync(OUTPUT, { recursive: true });

  // Login
  await page.goto(process.env.BASE_URL + '/login');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');

  // Navigate to Company Info (route is /my-company)
  await page.goto(process.env.BASE_URL + '/my-company');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  await page.waitForTimeout(600);

  // --- Main (HQ) tab (default) ---
  await page.screenshot({ path: path.join(OUTPUT, 'company-info-hq.png') });
});
