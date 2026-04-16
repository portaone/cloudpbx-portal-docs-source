import { test } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { sidebarNavigate } from './nav';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const OUTPUT = path.resolve(__dirname, '../docs/Cloud_PBX/img/Ring_Groups');

test('capture ring-groups screenshots', async ({ page }) => {
  fs.mkdirSync(OUTPUT, { recursive: true });

  // Login
  await page.goto(process.env.BASE_URL + '/login');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');

  // Navigate to Ring Groups via sidebar (expands Cloud PBX, highlights Ring groups)
  await sidebarNavigate(page, 'Cloud PBX', '/ring-groups');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  // Wait for the table rows to be visible
  await page.waitForSelector('tbody tr', { state: 'visible' });
  await page.waitForTimeout(600);

  // --- List page ---
  await page.screenshot({ path: path.join(OUTPUT, 'ring-groups-list.png') });

  // --- Add dialog ---
  await page.getByRole('button', { name: 'Add new' }).click();
  await page.waitForSelector('[data-testid="create-extension-form"]', { state: 'visible' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'ring-groups-add-dialog.png') });
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForSelector('[role="dialog"]', { state: 'detached' });
  await page.waitForTimeout(400);

  // Navigate to first ring group via edit button (index 1 = pencil, index 0 = call history)
  const firstEditBtn = page
    .locator('tbody tr')
    .first()
    .locator('button')
    .nth(1);
  await firstEditBtn.click();
  await page.waitForURL('**/ring-groups/**');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  await page.waitForTimeout(500);

  // --- General tab (default) ---
  await page.getByRole('tab', { name: 'General' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUTPUT, 'ring-groups-detail-general.png') });

  // --- Members tab ---
  await page.getByRole('tab', { name: 'Members' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUTPUT, 'ring-groups-detail-members.png') });

  // --- Call queue tab ---
  await page.getByRole('tab', { name: 'Call queue' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUTPUT, 'ring-groups-detail-call-queue.png') });
});
