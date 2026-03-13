import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const OUTPUT = path.resolve(__dirname, '../docs/My_Company/img/Billing');

test('capture billing screenshots', async ({ page }) => {
  fs.mkdirSync(OUTPUT, { recursive: true });

  // Login
  await page.goto(process.env.BASE_URL + '/login');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');

  // Navigate to Billing
  await page.goto(process.env.BASE_URL + '/billing');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  await page.waitForTimeout(800);

  // Screenshot 1: Transactions tab → Charges sub-tab (default view)
  await page.getByRole('tab', { name: 'Transactions' }).click();
  await page.waitForTimeout(600);
  // Ensure Charges sub-tab is active (it is by default)
  const chargesTab = page.getByRole('tab', { name: 'Charges' });
  if (await chargesTab.isVisible()) {
    await chargesTab.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({
    path: path.join(OUTPUT, 'billing-transactions.png'),
    fullPage: false,
  });

  // Screenshot 2: Invoices tab
  await page.getByRole('tab', { name: 'Invoices' }).click();
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(OUTPUT, 'billing-invoices.png'),
    fullPage: false,
  });

  // Screenshot 3: Payment method tab
  await page.getByRole('tab', { name: 'Payment method' }).click();
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(OUTPUT, 'billing-payment-method.png'),
    fullPage: false,
  });

  console.log('Billing screenshots saved to', OUTPUT);
});
