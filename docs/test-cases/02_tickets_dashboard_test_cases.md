# Manual Test Cases: Tickets Dashboard & Details Page

**Application:** Demo SaaS (`https://demo-saas.bugbug.io/`)  
**Target Page:** Tickets Dashboard (`/{organization}/tickets`)  
**Framework Target:** Playwright E2E Automation

---

## Test Cases Summary

| Test Case ID | Test Case Title                                 | Priority    | Automation Feasibility |
| :----------- | :---------------------------------------------- | :---------- | :--------------------- |
| `TC_TCK_001` | Verify Tickets Table Layout & Header Columns    | High (P0)   | Automated              |
| `TC_TCK_002` | Verify Search Ticket by Keyword/Title           | High (P0)   | Automated              |
| `TC_TCK_003` | Verify Ticket Status Filter Dropdown            | Medium (P1) | Automated              |
| `TC_TCK_004` | Verify Ticket Details Side Panel / Drawer View  | High (P0)   | Automated              |
| `TC_TCK_005` | Verify Adding a Comment to a Selected Ticket    | High (P0)   | Automated              |
| `TC_TCK_006` | Verify Pagination Controls (Next/Previous Page) | Medium (P1) | Automated              |
| `TC_TCK_007` | Verify User Profile Menu & Sign Out Action      | High (P0)   | Automated              |

---

### TC_TCK_001: Verify Tickets Table Layout & Header Columns

- **Description:** Verify that the logged-in user can access the Tickets dashboard and that the table displays standard header columns (`Title`, `Reported by`, `Status`, `Created at`).
- **Preconditions:** User is authenticated as `Subramanyam Reddy` (`reddysubramanyam24@gmail.com`) and navigated to `https://demo-saas.bugbug.io/demoorganization/tickets`.

| Step # | Action                               | Expected Result                                                                                                      | Playwright Automation Hint                                                                                             |
| :----- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| 1      | Navigate to Tickets dashboard        | Page loads completely with URL matching `.*/tickets`.                                                                | `page.goto('/demoorganization/tickets')`                                                                               |
| 2      | Verify top navigation bar elements   | Logo, Organization name ("DemoOrganization"), Nav links ("Tickets", "Settings"), and User Avatar ("SR") are visible. | `await expect(page.getByText('DemoOrganization')).toBeVisible()`                                                       |
| 3      | Inspect Tickets data table headers   | Table displays 4 columns: `Title`, `Reported by`, `Status`, `Created at`.                                            | `await expect(page.locator('th, [role="columnheader"]')).toHaveText(['Title', 'Reported by', 'Status', 'Created at'])` |
| 4      | Verify initial ticket records render | Data rows are loaded into the table.                                                                                 | `await expect(page.locator('tr, [role="row"]').count()).toBeGreaterThan(1)`                                            |

---

### TC_TCK_002: Verify Search Ticket by Keyword/Title

- **Description:** Verify that entering a ticket title in the Search input filters the ticket list dynamically.
- **Preconditions:** User is logged in on the Tickets page.
- **Test Data:**
  - `searchQuery`: `Dark mode`

| Step # | Action                                  | Expected Result                                                                                          | Playwright Automation Hint                                                                                                                         |
| :----- | :-------------------------------------- | :------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Locate Search input field               | Search input is visible on top of table.                                                                 | `const searchInput = page.getByPlaceholder('Search')`                                                                                              |
| 2      | Type `Dark mode` into Search input      | Search query is populated.                                                                               | `await searchInput.fill('Dark mode')`                                                                                                              |
| 3      | Press Enter or wait for filter response | Tickets table updates to show only matching tickets (e.g. "Dark mode not working on the settings page"). | `await page.waitForTimeout(500)`                                                                                                                   |
| 4      | Verify non-matching items are hidden    | Unrelated tickets (e.g., "Auto-logout occurring...") are filtered out of view.                           | `await expect(page.getByText('Dark mode not working')).toBeVisible()`<br>`await expect(page.getByText('Auto-logout occurring')).not.toBeVisible()` |

---

### TC_TCK_003: Verify Ticket Status Filter Dropdown

- **Description:** Verify that selecting a specific status (e.g. `NEW`, `IN PROGRESS`, `RESOLVED`, `CLOSED`) filters the list accordingly.
- **Preconditions:** User is logged in on the Tickets page.
- **Test Data:**
  - `selectedStatus`: `RESOLVED`

| Step # | Action                               | Expected Result                                                                     | Playwright Automation Hint                                                                            |
| :----- | :----------------------------------- | :---------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| 1      | Click Status filter dropdown control | Status dropdown options appear (`All`, `NEW`, `IN PROGRESS`, `RESOLVED`, `CLOSED`). | `page.locator('select, [data-mantine-select]').click()`                                               |
| 2      | Select status option `RESOLVED`      | Dropdown value changes to `RESOLVED`.                                               | `page.selectOption('select', 'RESOLVED')` or `page.getByRole('option', { name: 'RESOLVED' }).click()` |
| 3      | Observe table rows update            | Only tickets with `RESOLVED` status badges are visible in the table.                | `await expect(page.locator('tr:has-text("RESOLVED")')).toBeVisible()`                                 |

---

### TC_TCK_004: Verify Ticket Details Side Panel / Drawer View

- **Description:** Verify that clicking on a ticket row opens the ticket details drawer/panel displaying ticket metadata, ID, description, and comments.
- **Preconditions:** User is logged in on the Tickets page.

| Step # | Action                                                  | Expected Result                                                                                                                                     | Playwright Automation Hint                                                                                                  |
| :----- | :------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| 1      | Click on ticket row "Multi-step form validation issues" | Row is highlighted; URL updates with `?selectedId=...`.                                                                                             | `page.getByText('Multi-step form validation issues').click()`                                                               |
| 2      | Verify side panel/drawer opens                          | Drawer displays ticket title ("Multi-step form validation issues"), status badge ("NEW"), reporter email ("abby.allen@example.com"), and Ticket ID. | `await expect(page).toHaveURL(/.*selectedId=.*/)`<br>`await expect(page.getByText('Reported by Abby Allen')).toBeVisible()` |
| 3      | Verify Comments section is displayed                    | Comments list and comment input box with "Send" button are visible.                                                                                 | `await expect(page.getByText('Comments')).toBeVisible()`                                                                    |

---

### TC_TCK_005: Verify Adding a Comment to a Selected Ticket

- **Description:** Verify that a user can type a comment into the comment input field and submit it to append to the ticket history.
- **Preconditions:** Ticket detail drawer is active (e.g. `TC_TCK_004`).
- **Test Data:**
  - `commentText`: `Automated test comment verification - Playwright E2E`

| Step # | Action                                                      | Expected Result                                                                                 | Playwright Automation Hint                                                          |
| :----- | :---------------------------------------------------------- | :---------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| 1      | Locate comment input textarea/input                         | Comment input field is visible.                                                                 | `const commentInput = page.locator('textarea, input[placeholder*="comment"]')`      |
| 2      | Type `Automated test comment verification - Playwright E2E` | Comment field contains typed text.                                                              | `await commentInput.fill('Automated test comment verification - Playwright E2E')`   |
| 3      | Click "Send" button                                         | Comment is submitted; input is cleared.                                                         | `page.getByRole('button', { name: 'Send' }).click()`                                |
| 4      | Verify comment appears in thread                            | New comment is rendered in the discussion thread with author "Subramanyam Reddy" and timestamp. | `await expect(page.getByText('Automated test comment verification')).toBeVisible()` |

---

### TC_TCK_006: Verify Pagination Controls (Next/Previous Page)

- **Description:** Verify that user can navigate between pages of tickets using pagination controls.
- **Preconditions:** Multiple pages of tickets exist in the system.

| Step # | Action                            | Expected Result                                               | Playwright Automation Hint                                                                              |
| :----- | :-------------------------------- | :------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------ |
| 1      | Scroll to bottom of tickets table | Pagination bar is visible showing page numbers `1`, `2`, etc. | `await page.locator('.mantine-Pagination-root, nav[aria-label="Pagination"]').scrollIntoViewIfNeeded()` |
| 2      | Click page `2` button             | Page 2 loads; new ticket rows are rendered.                   | `page.getByRole('button', { name: '2' }).click()`                                                       |
| 3      | Verify active page indicator      | Button `2` is highlighted as active page.                     | `await expect(page.getByRole('button', { name: '2' })).toHaveAttribute('data-active', 'true')`          |

---

### TC_TCK_007: Verify User Profile Menu & Sign Out Action

- **Description:** Verify that clicking the user avatar displays profile dropdown options and clicking "Sign out" terminates the session.
- **Preconditions:** User is logged in on the Tickets page.

| Step # | Action                                                        | Expected Result                                                                                            | Playwright Automation Hint                               |
| :----- | :------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| 1      | Click user avatar / profile menu ("SR" / "Subramanyam Reddy") | Dropdown menu opens showing: `Tickets`, `Organization settings`, `Manage account`, `Sign out`.             | `page.getByText('Subramanyam Reddy').click()`            |
| 2      | Click "Sign out" option                                       | Session cookies/tokens are invalidated; browser redirects to `/sign-in` or home page.                      | `page.getByRole('button', { name: 'Sign out' }).click()` |
| 3      | Verify URL and post-logout state                              | URL is `https://demo-saas.bugbug.io/sign-in` or `/`; user cannot access `/tickets` without authenticating. | `await expect(page).toHaveURL(/.*\/sign-in/)`            |
