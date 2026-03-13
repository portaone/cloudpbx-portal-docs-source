import { test } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const OUTPUT = path.resolve(__dirname, '../docs/Calls/img/Settings');

test('capture call-settings screenshots', async ({ page }) => {
  fs.mkdirSync(OUTPUT, { recursive: true });

  // Login
  await page.goto(process.env.BASE_URL + '/login');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');

  // Navigate to Call Settings
  await page.goto(process.env.BASE_URL + '/call-settings');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' }).catch(() => {});
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);

  // --- General tab (default) ---
  await page.getByRole('tab', { name: /general/i }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUTPUT, 'call-settings-general.png') });

  // --- Service Codes tab ---
  await page.getByRole('tab', { name: /service codes/i }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'call-settings-service-codes.png') });

  // --- Call Barring tab ---
  await page.getByRole('tab', { name: /call barring/i }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'call-settings-call-barring.png') });

  // --- Call Screening tab ---
  await page.getByRole('tab', { name: /call screening/i }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'call-settings-call-screening.png') });

  // --- Music & Ringing tab ---
  await page.getByRole('tab', { name: /music/i }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'call-settings-music-ringing.png') });
});
