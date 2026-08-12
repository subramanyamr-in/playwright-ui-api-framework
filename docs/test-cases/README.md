# FrameWright Test Suite - Manual Test Cases Documentation

This directory contains comprehensive manual test cases designed for end-to-end (E2E) automation testing of the **Demo SaaS** application (`https://demo-saas.bugbug.io/`) using the **FrameWright** Playwright automation framework.

---

## 📌 Target Application & Test Credentials

- **Application URL:** [https://demo-saas.bugbug.io/](https://demo-saas.bugbug.io/)
- **Primary Test Account:**
  - **User ID / Email:** `reddysubramanyam24@gmail.com`
  - **Password:** `sUbbu#1234`
  - **User Display Name:** `Subramanyam Reddy` (`SR`)
  - **Default Organization:** `DemoOrganization`

---

## 📂 Test Cases Structure

The test cases are organized by application module/page under `docs/test-cases/`:

```
docs/test-cases/
├── 01_authentication_page_test_cases.md   # Authentication & Sign-in Scenarios
├── 02_tickets_dashboard_test_cases.md      # Tickets Dashboard, Filtering, & Details Scenarios
└── README.md                               # Test Suite Overview & Guidelines
```

### Module Breakdown

1. **[01_authentication_page_test_cases.md](file:///Users/subramanyamr/AutomationTesting/FrameWright/docs/test-cases/01_authentication_page_test_cases.md)**
   - Sign-in page rendering and form inputs
   - Valid credential login & session creation
   - Invalid email/password validation handling
   - Blank submission required field validations
   - Password masking security checks
   - Links navigation ("Forgot password?", "Sign up")

2. **[02_tickets_dashboard_test_cases.md](file:///Users/subramanyamr/AutomationTesting/FrameWright/docs/test-cases/02_tickets_dashboard_test_cases.md)**
   - Dashboard layout, navigation bar, & header columns
   - Live ticket search by keyword
   - Ticket status filtering (`NEW`, `IN PROGRESS`, `RESOLVED`, `CLOSED`)
   - Ticket detail drawer view & deep-linking (`?selectedId=...`)
   - Adding and verifying user comments
   - Table pagination controls
   - User session logout flow

---

## 🛠️ Mapping Manual Test Cases to Playwright Automation

Each manual test case contains step-by-step instructions alongside **Playwright Automation Hints** (locators, actions, assertions).

### Recommended Locator Strategies

- Prefer **user-facing attributes**:
  - `page.getByRole('button', { name: 'Log in' })`
  - `page.getByPlaceholder('Search')`
  - `page.getByText('Subramanyam Reddy')`
- For forms & inputs:
  - `page.locator('input[name="email"]')`
  - `page.locator('input[name="password"]')`

### Sample Playwright POM Implementation Pattern

```typescript
// Example Page Object Model Snippet (for reference when automating)
export class LoginPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://demo-saas.bugbug.io/sign-in');
  }

  async login(email: string, pass: string) {
    await this.page.locator('input[name="email"]').fill(email);
    await this.page.locator('input[name="password"]').fill(pass);
    await this.page.locator('button[type="submit"]').click();
  }
}
```

Using github mcp crete a repo that meets standards and google ranking.
title: FrameWright - Playwright UI Automation Framework or (as per your suggestion)
rest of the things as per your suggestion
plese let know before you push the code
