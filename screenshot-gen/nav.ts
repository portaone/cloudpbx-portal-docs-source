import { Page } from '@playwright/test';

/**
 * Navigate to a page via the left sidebar.
 *
 * Expands the parent section if it is collapsed, then clicks the target link.
 * This ensures screenshots show the sidebar in the correct state — section
 * expanded and the target item highlighted as active.
 *
 * @param page    Playwright page
 * @param section Section toggle label (e.g. 'Cloud PBX'), or null for items
 *                that are direct nav links with no parent section (SIP trunks)
 * @param href    The link's href attribute (e.g. '/ring-groups')
 */
export async function sidebarNavigate(page: Page, section: string | null, href: string): Promise<void> {
  if (section) {
    const link = page.locator(`nav a[href="${href}"]`);
    const isVisible = await link.isVisible().catch(() => false);
    if (!isVisible) {
      // Click the section toggle to expand the submenu
      await page
        .locator('nav div[class*="MuiListItem-button"]')
        .filter({ hasText: section })
        .first()
        .click();
      await link.waitFor({ state: 'visible', timeout: 5000 });
    }
    await link.click();
  } else {
    await page.locator(`nav a[href="${href}"]`).click();
  }
  await page.waitForURL(`**${href}**`);
  // Move cursor to the main content area so the sidebar hover state is cleared.
  // The hover style is identical to the active style, so leaving the cursor over
  // a sidebar item would make it appear highlighted in screenshots.
  await page.mouse.move(800, 400);
}
