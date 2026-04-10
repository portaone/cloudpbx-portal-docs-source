import { test } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const OUTPUT = path.resolve(__dirname, '../docs/My_Company/img/My_Profile');

test('capture my-profile screenshots', async ({ page }) => {
  fs.mkdirSync(OUTPUT, { recursive: true });

  // Login
  await page.goto(process.env.BASE_URL + '/login');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');

  // Navigate to My Profile
  await page.goto(process.env.BASE_URL + '/my-profile');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });

  // --- Settings tab (default) ---
  await page.getByRole('tab', { name: 'Settings' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUTPUT, 'my-profile-settings.png') });

  // --- Security tab ---
  await page.getByRole('tab', { name: 'Security' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUTPUT, 'my-profile-security.png') });
});
