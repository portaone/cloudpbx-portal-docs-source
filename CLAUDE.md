# Claude Code Instructions — cloudpbx-portal-docs

This file contains instructions and lessons learned for AI-assisted work in this repository.

## Project Overview

Docusaurus (classic preset) documentation site for the PortaOne Cloud PBX admin portal.
The portal source code lives two levels up at `../../ip-centrex-admin-portal/` (the `ip-centrex-admin-portal` repo).
Deployed to GitHub Pages at `portaone/cloudpbx-portal-docs`.

---

## Docs Structure

Two-level hierarchy mirroring the portal navigation:

```
docs/
├── intro.md                     ← site introduction / overview
├── Cloud_PBX/
│   ├── _category_.json
│   ├── img/<Feature>/           ← screenshots live here
│   └── Extensions.md, Ring_Groups.md, Auto_Attendants.md, Fax_Mailboxes.md,
│       Phone_Book.md, Call_Parking_Slots.md, Wallboard.md,
│       Business_Hours.md, Call_Supervision.md,
│       Voicemail.md, Automated_Call_Distribution.md
├── Calls/
│   ├── _category_.json
│   ├── img/<Feature>/
│   └── Settings.md, Recordings.md, Activity.md
├── SIP_Trunks/
│   ├── img/SIP_Trunks/
│   └── SIP_Trunks.md
├── Inventory/
│   ├── _category_.json
│   ├── img/<Feature>/
│   └── Devices.md, Device_Profiles.md, Device_Phone_Books.md, DID_Numbers.md
├── My_Company/
│   ├── _category_.json
│   ├── img/<Feature>/
│   └── My_Profile.md, Portal_Users.md, Company_Info.md, Billing.md, Licensing.md
└── Security/
    ├── _category_.json
    ├── img/<Feature>/           ← if screenshots are needed
    └── Two-factor-authentication.md, Allow-web-access-only-from-trusted-IP-addresses.mdx,
        Blocking-phone-lines.md, PIN-protection-for-outgoing-paid-calls.md
```

**Note:** `Getting_Started.md` has been replaced by `intro.md` at the docs root.

**Image paths:**
- File: `docs/<Section>/img/<Feature>/screenshot.png`
- Reference in .md: `./img/<Feature>/screenshot.png`

**Screenshot naming:** `<feature>-<page-or-state>.png`
Examples: `extensions-list.png`, `extensions-add-dialog.png`, `call-parking-slots-list.png`

---

## Writing Style

Follow the **Auto-Dialer_User_Guide.md** style:
- Numbered steps for procedures
- **Bold** field names inline and in tables
- Markdown tables for field reference sections
- Image syntax: `![Title](./img/Feature/name.png "Title")`
- `*` marks required fields in tables

**Admonitions (important notes / tips / warnings):**

Use Docusaurus admonition syntax — **no space** between `:::` and the type:

```md
:::note
The languages that are currently supported are …
:::

:::tip
You can copy an existing profile instead of creating one from scratch.
:::
```

**Never** use the old single-column table style:
```md
| Some important text |
| --- |
```
Replace those with `:::note … :::` blocks.

**Navigation lines** belong in the Overview section, after the description paragraph. Use this format exactly:

```
Navigate to **Section → Page name**.
```

Do NOT include the route (`route: /...`), do NOT use `Open menu "..."` style, do NOT use `>` instead of `→`.

Examples:
- `Navigate to **Cloud PBX → Extensions**.`
- `Navigate to **Calls → Activity**.`
- `Navigate to **Inventory → Device profiles**.`

**Always validate UI labels** by reading the portal source (component files, translation keys) or browsing the live portal before writing. Do not assume a field label matches the word used in business logic — for example, what the API calls "extension" may be labelled **Agent** in the UI.

---

## Adding Documentation for a New Feature

### Step 1 — Discover the UI using the browser MCP

**Always use the browser MCP (Claude in Chrome) first** to explore the live portal before writing anything.
This is the primary source of truth for UI labels, tab names, field names, and page structure.

```
navigate → https://cloudpbx.portaone.com
screenshot / snapshot → identify all tabs, fields, dialogs, and states to document
```

For each page:
- Take a snapshot/screenshot of the list view
- Open the add/create dialog — note all fields and their labels exactly
- Open a detail/edit page — note every tab and the fields within each tab
- Look for any conditional UI (e.g. fields that appear only when a toggle is enabled)

Use `get_page_text` or `snapshot` to read actual label text — do not guess from source code alone.

### Step 2 — Research business logic

Search `docs.portaone.com` for the underlying PortaSwitch/PortaBilling concepts behind the feature.

### Step 3 — Read the portal source

Cross-reference with source code to confirm selectors, routes, and any fields not visible in a default state:
- Translation keys: `../../ip-centrex-admin-portal/src/translations/`
- E2E page objects: `../../ip-centrex-admin-portal/e2e_tests/`
- Routes: `../../ip-centrex-admin-portal/src/routes/routes.ts`

### Step 4 — Write the doc

Write `docs/<Section>/<Feature>.md` following the writing style above.

### Step 5 — Write the screenshot script

Write `screenshot-gen/capture-<feature>.ts` and add a `screenshots:<feature>` script to `package.json`.

---

## Screenshot Generation

**Config:** `screenshot-gen/playwright.config.ts` — Chromium, 1440×900, headless:false
**Credentials:** `screenshot-gen/.env` (gitignored). Copy from `.env.example`:

```
BASE_URL=https://cloudpbx.portaone.com
CUSTOMER_USR=your-username
CUSTOMER_PWD="your-password"   # quote passwords with special characters
```

**Run one feature:**
```
npm run screenshots:extensions
```

**Run all:**
```
npm run screenshots
```

> **Note:** Running all 17 tests in a single `npm run screenshots` call can die silently after a few
> tests without surfacing an error. If that happens, run the individual `screenshots:<feature>` scripts
> one at a time (or in small batches with `&&`) instead.

**Available screenshot scripts** (in `package.json`):

| Script | Status |
|---|---|
| `screenshots:sip-trunks` | ✅ |
| `screenshots:extensions` | ✅ |
| `screenshots:ring-groups` | ✅ |
| `screenshots:fax-mailboxes` | ✅ |
| `screenshots:call-parking-slots` | ✅ |
| `screenshots:call-settings` | ✅ |
| `screenshots:call-activity` | ✅ |
| `screenshots:recordings` | ✅ |
| `screenshots:voicemail` | ✅ |
| `screenshots:did-numbers` | ✅ |
| `screenshots:devices` | ✅ |
| `screenshots:device-profiles` | ✅ |
| `screenshots:device-phone-books` | ✅ |
| `screenshots:my-profile` | ✅ |
| `screenshots:portal-users` | ✅ |
| `screenshots:company-info` | ✅ |
| `screenshots:billing` | ✅ |

**No capture script yet** (docs exist but screenshots not automated):
`auto-attendants`, `phone-book`, `wallboard`, `business-hours`, `call-supervision`,
`licensing`, `security/*`, `automated-call-distribution`

---

## Playwright Patterns and Lessons Learned

### Sidebar navigation

Always navigate to list pages by clicking through the sidebar rather than using `page.goto()` directly.
This ensures screenshots show the correct section expanded and the active item highlighted.

Import the helper at the top of each capture script:

```typescript
import { sidebarNavigate } from './nav';
```

Usage:
```typescript
// Section with submenu (Cloud PBX, Calls, Inventory, My company)
await sidebarNavigate(page, 'Cloud PBX', '/ring-groups');

// Direct nav item with no parent section (SIP trunks)
await sidebarNavigate(page, null, '/sip-trunks');
```

The function expands the section if it is collapsed, then clicks the link, waits for the URL to match,
and moves the mouse to `(800, 400)` (main content area). This last step is essential: the portal's
sidebar hover style is **visually identical** to the active style (both use the same background colour),
so leaving the cursor over any sidebar item after clicking would make it look highlighted in screenshots.

For detail pages reached after the initial list navigation (e.g. `page.goto('/extensions/1000')`),
the sidebar state persists — no need to call `sidebarNavigate` again.

**Sidebar section → links map:**
| Section | Links |
|---|---|
| Cloud PBX | /extensions, /ring-groups, /auto-attendants, /fax-mailboxes, /phone-book, /parking-slots, /wallboard |
| Calls | /call-settings, /call-recordings, /call-activity |
| Inventory | /devices, /device-profiles, /device-phone-books, /did-numbers |
| My company | /my-profile, /portal-users, /my-company, /billing |
| (direct) | /sip-trunks |

---

### Standard script structure

```typescript
import { test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { sidebarNavigate } from './nav';

const OUTPUT = path.resolve(__dirname, '../docs/<Section>/img/<Feature>');
fs.mkdirSync(OUTPUT, { recursive: true });

test('capture <feature> screenshots', async ({ page }) => {
  // Login (baseURL is set in playwright.config.ts)
  await page.goto('/');
  await page.locator('#login').fill(process.env.CUSTOMER_USR!);
  await page.locator('#password').fill(process.env.CUSTOMER_PWD!);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');

  // Navigate via sidebar (expands section, highlights target item, moves mouse away)
  await sidebarNavigate(page, 'Section name', '/your-route');
  await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
  // ...
});
```

Credentials are loaded from `screenshot-gen/.env` first; `playwright.config.ts` falls back to the
project root `.env` if that file is absent.

### Waiting for spinners (MUI CircularProgress)

Many tabs and dialogs fire async requests after rendering. Always wait for spinners to clear:

```typescript
await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
```

The `.catch(() => {})` is intentional — if no spinner appears, the selector throws and we ignore it.

For tabs that trigger heavy data loads (Call settings, Plan), also wait for networkidle first:

```typescript
await page.getByRole('tab', { name: 'Call settings' }).click();
await page.waitForLoadState('networkidle');
await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
await page.waitForTimeout(800);
```

### Waiting for list pages to fully render

Not all list pages use `[data-testid="loader"]`. Use the "Add new" button as a proxy:

```typescript
const addNewBtn = page.locator('button').filter({ hasText: /Add new/i });
await addNewBtn.waitFor({ state: 'visible', timeout: 20000 });
await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
```

Use `locator('button').filter({ hasText: ... })` rather than `getByRole('button', { name: ... })` for better reliability when the page has multiple buttons.

### Waiting for dialogs

```typescript
await page.getByRole('button', { name: 'Add new' }).click();
await page.waitForSelector('[role="dialog"]', { state: 'visible' });
await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 }).catch(() => {});
await page.waitForTimeout(600);
```

### Toggle switches (MUI IconButton with inner input)

Clicking the wrapping span may not register. Click the inner `input` with `force: true`:

```typescript
await page.locator('[data-testid="status-switch-callForwardingStatus"] input').click({ force: true });
// Wait for a visible consequence, e.g. a section that appears after enabling:
await page.waitForSelector('text=Follow-me', { state: 'visible', timeout: 6000 }).catch(() => {});
```

### Navigating to detail pages

Navigate directly to a known record URL rather than clicking through the list — more stable:

```typescript
await page.goto(process.env.BASE_URL + '/extensions/1000');
await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
```

To discard unsaved changes (e.g. after toggling a switch for a screenshot), navigate back to the same URL:

```typescript
await page.goto(process.env.BASE_URL + '/extensions/1000');
await page.waitForSelector('[data-testid="loader"]', { state: 'detached' });
```

### Row action buttons (transmission history, edit, delete)

The order of action buttons per row is not always obvious. Inspect the DOM or read the component:
- Fax mailbox row: `button[0]` = transmission history, `button[1]` = edit, `button[2]` = delete

Prefer direct URL navigation to detail pages when available (`/fax-mailboxes/<id>`) over clicking edit buttons.

---

## Portal Routes Reference

Always verify routes against `../../ip-centrex-admin-portal/src/routes/routes.ts`. Complete route list:

| Feature | Actual route |
|---|---|
| Extensions (list) | `/extensions` |
| Extension detail | `/extensions/:id` |
| Ring Groups (list) | `/ring-groups` |
| Ring Group detail | `/ring-groups/:id` |
| Auto Attendants (list) | `/auto-attendants` |
| Auto Attendant detail | `/auto-attendants/:id` |
| Fax Mailboxes | `/fax-mailboxes` |
| Phone Book | `/phone-book` |
| Call Parking Slots | `/parking-slots` (NOT `/call-parking-slots`) |
| Wallboard | `/wallboard` |
| Call Supervision | `/supervisor-panel` |
| Call Activity | `/call-activity` |
| Call Recordings | `/call-recordings` |
| Call Settings | `/call-settings` |
| SIP Trunks | `/sip-trunks` |
| DID Numbers | `/did-numbers` |
| Devices | `/devices` |
| Device Profiles | `/device-profiles` |
| Device Phone Books | `/device-phone-books` |
| My Company / Company Info | `/my-company` |
| My Profile | `/my-profile` |
| Portal Users | `/portal-users` |
| Billing | `/billing` |
| Payment Invoices | `/payment-invoices` |
| Dashboard | `/dashboard` |

**Note:** Business Hours, Voicemail, ACD, Licensing, and Security articles are **not standalone routes** — they are tabs within other pages or tutorial-style articles. Do not attempt to navigate to them by URL.

---

## Finding UI Labels

Do not invent labels. Check in order:

1. **Translation keys:** `../../ip-centrex-admin-portal/src/translations/en.json` (or per-screen translation files)
2. **Component source:** `../../ip-centrex-admin-portal/src/` — search for the field name or `data-testid`
3. **Live portal:** browse `https://cloudpbx.portaone.com` with browser tools

Example: the filter field internally called "extension" is labelled **Agent** in the call activity UI.
