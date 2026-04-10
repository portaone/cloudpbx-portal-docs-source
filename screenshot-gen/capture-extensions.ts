import { test } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const OUTPUT = path.resolve(__dirname, '../docs/Cloud_PBX/img/Extensions');

test('capture extensions screenshots', async ({ page }) => {
  fs.mkdirSync(OUTPUT, { recursive: true });

  // Login
  await page.goto(process.env.BASE_URL + '/login');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');

  // Navigate to Extensions list
  await page.goto(process.env.BASE_URL + '/extensions');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  // Wait for the data grid rows to appear (MUI DataGrid loads after the global loader)
  await page.waitForSelector('tbody tr', { state: 'visible' });
  await page.waitForTimeout(600);

  // --- List page ---
  await page.screenshot({ path: path.join(OUTPUT, 'extensions-list.png') });

  // --- Add new dialog ---
  await page.getByRole('button', { name: 'Add new' }).click();
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'extensions-add-dialog.png') });
  // Close dialog
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Navigate directly to extension 1000 (Klaus Haertel – regular extension with all tabs populated)
  await page.goto(process.env.BASE_URL + '/extensions/1000');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  await page.waitForTimeout(600);

  // --- Extension tab (default) ---
  await page.getByRole('tab', { name: 'Extension' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUTPUT, 'extensions-detail-extension.png') });

  // --- Call settings tab ---
  await page.getByRole('tab', { name: 'Call settings' }).click();
  // Wait for voicemail greeting options, barring categories, etc. to finish loading
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUTPUT, 'extensions-detail-call-settings.png') });

  // --- Call screening tab ---
  await page.getByRole('tab', { name: 'Call screening' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUTPUT, 'extensions-detail-call-screening.png') });

  // --- Call forwarding tab ---
  await page.getByRole('tab', { name: 'Call forwarding' }).click();
  await page.waitForTimeout(400);
  // Enable the Call forwarding toggle to reveal the forwarding configuration.
  // data-testid="status-switch-callForwardingStatus" is on the MuiIconButton span wrapping the input.
  await page.locator('[data-testid="status-switch-callForwardingStatus"] input').click({ force: true });
  // Wait for the "Follow-me" option to become visible — confirms the config panel has rendered
  await page.waitForSelector('text=Follow-me', { state: 'visible', timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'extensions-detail-call-forwarding.png') });
  // Navigate back to extension 1000 without saving (toggle change is discarded on navigation)
  await page.goto(process.env.BASE_URL + '/extensions/1000');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  await page.waitForTimeout(400);

  // --- Plan tab ---
  await page.getByRole('tab', { name: 'Plan' }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'extensions-detail-plan.png') });

  // --- Device tab ---
  await page.getByRole('tab', { name: 'Device' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUTPUT, 'extensions-detail-device.png') });

  // --- Call history tab ---
  await page.getByRole('tab', { name: 'Call history' }).click();
  // Wait for the call records table to load
  await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT, 'extensions-detail-call-history.png') });
});
