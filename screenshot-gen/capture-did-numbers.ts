import { test } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { sidebarNavigate } from './nav';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const OUTPUT = path.resolve(__dirname, '../docs/Inventory/img/DID_Numbers');

test('capture did-numbers screenshots', async ({ page }) => {
  fs.mkdirSync(OUTPUT, { recursive: true });

  // Login
  await page.goto(process.env.BASE_URL + '/login');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');

  // Helper: two-phase spinner wait — avoids race where detached resolves before spinner appears
  const waitForSpinner = async () => {
    const appeared = await page.waitForSelector('.MuiCircularProgress-root', { state: 'visible', timeout: 5000 }).catch(() => null);
    if (appeared) {
      await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 20000 });
    }
  };

  // Navigate to DID Numbers via sidebar (expands Inventory, highlights DID numbers)
  await sidebarNavigate(page, 'Inventory', '/did-numbers');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  await page.waitForSelector('tbody tr', { state: 'visible' });
  await page.waitForTimeout(600);

  // --- List page ---
  await page.screenshot({ path: path.join(OUTPUT, 'did-numbers-list.png') });

  // --- Add dialog ---
  await page.getByRole('button', { name: 'Add new' }).click();
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  await waitForSpinner();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUTPUT, 'did-numbers-add-dialog.png') });
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForSelector('[role="dialog"]', { state: 'detached' });
  await page.waitForTimeout(400);

  // --- Edit dialog (second button = pencil/edit; first button = call history) ---
  const firstEditBtn = page.locator('tbody tr').first().locator('button').nth(1);
  await firstEditBtn.click();
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  await waitForSpinner();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUTPUT, 'did-numbers-edit-dialog.png') });
});
