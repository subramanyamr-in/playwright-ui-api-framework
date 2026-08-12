# Manual Test Cases: Authentication Page

**Application:** Demo SaaS (`https://demo-saas.bugbug.io/`)  
**Target Page:** Sign In (`/sign-in`)  
**Framework Target:** Playwright E2E Automation

---

## Test Cases Summary

| Test Case ID  | Test Case Title                                       | Priority    | Automation Feasibility |
| :------------ | :---------------------------------------------------- | :---------- | :--------------------- |
| `TC_AUTH_001` | Verify Successful Login with Valid Credentials        | High (P0)   | Automated              |
| `TC_AUTH_002` | Verify Validation Error on Invalid Email Format       | Medium (P1) | Automated              |
| `TC_AUTH_003` | Verify Error Message on Incorrect Password            | High (P0)   | Automated              |
| `TC_AUTH_004` | Verify Required Field Validations on Blank Submission | High (P0)   | Automated              |
| `TC_AUTH_005` | Verify "Forgot password?" Link Navigation             | Low (P2)    | Automated              |
| `TC_AUTH_006` | Verify Navigation to Sign-Up Page via Link            | Medium (P1) | Automated              |
| `TC_AUTH_007` | Verify Password Field Masking & Security              | Medium (P1) | Automated              |

---

### TC_AUTH_001: Verify Successful Login with Valid Credentials

- **Description:** Verify that a user can successfully log in using valid email and password credentials and get redirected to the organization tickets dashboard.
- **Preconditions:** User account exists (`reddysubramanyam24@gmail.com`).
- **Test Data:**
  - `email`: `reddysubramanyam24@gmail.com`
  - `password`: `sUbbu#1234`

| Step # | Action                                            | Expected Result                                                                                          | Playwright Automation Hint                                                                                         |
| :----- | :------------------------------------------------ | :------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| 1      | Navigate to `https://demo-saas.bugbug.io/sign-in` | Sign-in page loads with Email and Password fields visible.                                               | `page.goto('/sign-in')`                                                                                            |
| 2      | Enter valid email in Email field                  | Email field contains `reddysubramanyam24@gmail.com`.                                                     | `page.locator('input[name="email"]').fill(...)`                                                                    |
| 3      | Enter valid password in Password field            | Password input value is masked.                                                                          | `page.locator('input[name="password"]').fill(...)`                                                                 |
| 4      | Click the "Log in" button                         | Form is submitted; page redirects to `https://demo-saas.bugbug.io/demoorganization/tickets`.             | `page.locator('button[type="submit"]').click()`                                                                    |
| 5      | Verify post-login dashboard UI                    | Navigation header displays user profile ("Subramanyam Reddy"), Organization selector, and Tickets table. | `await expect(page).toHaveURL(/.*\/tickets/)`<br>`await expect(page.getByText('Subramanyam Reddy')).toBeVisible()` |

---

### TC_AUTH_002: Verify Validation Error on Invalid Email Format

- **Description:** Verify that entering an incorrectly formatted email address displays an inline or HTML5 validation error and prevents form submission.
- **Preconditions:** User is on `/sign-in` page.
- **Test Data:**
  - `email`: `invalid-email-format`
  - `password`: `sUbbu#1234`

| Step # | Action                                        | Expected Result                                                                                   | Playwright Automation Hint                                         |
| :----- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------- |
| 1      | Navigate to `/sign-in`                        | Login page is displayed.                                                                          | `page.goto('/sign-in')`                                            |
| 2      | Enter `invalid-email-format` into Email field | Input accepts text.                                                                               | `page.locator('input[name="email"]').fill('invalid-email-format')` |
| 3      | Enter password into Password field            | Password field populated.                                                                         | `page.locator('input[name="password"]').fill('sUbbu#1234')`        |
| 4      | Click "Log in" button                         | Native HTML5 browser validation or UI validation message is triggered; navigation does not occur. | `await page.locator('button[type="submit"]').click()`              |
| 5      | Verify URL remains `/sign-in`                 | User remains on login page.                                                                       | `await expect(page).toHaveURL(/.*\/sign-in/)`                      |

---

### TC_AUTH_003: Verify Error Message on Incorrect Password

- **Description:** Verify that providing a registered email with an invalid password displays an authentication failure error message.
- **Preconditions:** User is on `/sign-in` page.
- **Test Data:**
  - `email`: `reddysubramanyam24@gmail.com`
  - `password`: `WrongPassword#999`

| Step # | Action                                         | Expected Result                                                                                  | Playwright Automation Hint                                                               |
| :----- | :--------------------------------------------- | :----------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| 1      | Navigate to `/sign-in`                         | Sign-in page is visible.                                                                         | `page.goto('/sign-in')`                                                                  |
| 2      | Fill Email with `reddysubramanyam24@gmail.com` | Email field populated.                                                                           | `page.locator('input[name="email"]').fill(...)`                                          |
| 3      | Fill Password with `WrongPassword#999`         | Password field populated.                                                                        | `page.locator('input[name="password"]').fill(...)`                                       |
| 4      | Click "Log in" button                          | Login attempt fails.                                                                             | `page.locator('button[type="submit"]').click()`                                          |
| 5      | Verify error banner/notification               | Error message (e.g. "Invalid credentials" or alert banner) is displayed; URL remains `/sign-in`. | `await expect(page.locator('[role="alert"], .mantine-Notification-root')).toBeVisible()` |

---

### TC_AUTH_004: Verify Required Field Validations on Blank Submission

- **Description:** Verify that submitting the login form with empty input fields triggers required field validation warnings.
- **Preconditions:** User is on `/sign-in` page.

| Step # | Action                                     | Expected Result                                                      | Playwright Automation Hint                                      |
| :----- | :----------------------------------------- | :------------------------------------------------------------------- | :-------------------------------------------------------------- |
| 1      | Navigate to `/sign-in`                     | Login page is loaded.                                                | `page.goto('/sign-in')`                                         |
| 2      | Ensure Email and Password fields are empty | Inputs are empty.                                                    | `await expect(page.locator('input[name="email"]')).toBeEmpty()` |
| 3      | Click "Log in" button                      | Required field validation indicators appear; user is not redirected. | `page.locator('button[type="submit"]').click()`                 |
| 4      | Verify URL is still `/sign-in`             | Navigation is blocked.                                               | `await expect(page).toHaveURL(/.*\/sign-in/)`                   |

---

### TC_AUTH_005: Verify "Forgot password?" Link Navigation

- **Description:** Verify that clicking "Forgot password?" redirects the user to the password reset page.
- **Preconditions:** User is on `/sign-in` page.

| Step # | Action                        | Expected Result                                      | Playwright Automation Hint                                     |
| :----- | :---------------------------- | :--------------------------------------------------- | :------------------------------------------------------------- |
| 1      | Navigate to `/sign-in`        | Sign-in page loaded.                                 | `page.goto('/sign-in')`                                        |
| 2      | Click "Forgot password?" link | Page navigates to `/reset-password`.                 | `page.getByRole('link', { name: 'Forgot password?' }).click()` |
| 3      | Verify URL and header         | URL is `https://demo-saas.bugbug.io/reset-password`. | `await expect(page).toHaveURL(/.*\/reset-password/)`           |

---

### TC_AUTH_006: Verify Navigation to Sign-Up Page via Link

- **Description:** Verify that clicking "Sign up" link navigates the user to the registration page.
- **Preconditions:** User is on `/sign-in` page.

| Step # | Action                                 | Expected Result                                                                           | Playwright Automation Hint                                                                                           |
| :----- | :------------------------------------- | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| 1      | Navigate to `/sign-in`                 | Sign-in page loaded.                                                                      | `page.goto('/sign-in')`                                                                                              |
| 2      | Click "Sign up" link at bottom of form | Page navigates to `/sign-up`.                                                             | `page.getByRole('link', { name: 'Sign up' }).first().click()`                                                        |
| 3      | Verify URL and form elements           | URL is `https://demo-saas.bugbug.io/sign-up` and "Create your account" form is displayed. | `await expect(page).toHaveURL(/.*\/sign-up/)`<br>`await expect(page.getByText('Create your account')).toBeVisible()` |

---

### TC_AUTH_007: Verify Password Field Masking & Security

- **Description:** Verify that the password input element has `type="password"` attribute to mask user input.
- **Preconditions:** User is on `/sign-in` page.

| Step # | Action                              | Expected Result                                    | Playwright Automation Hint                                                                 |
| :----- | :---------------------------------- | :------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| 1      | Navigate to `/sign-in`              | Sign-in page loaded.                               | `page.goto('/sign-in')`                                                                    |
| 2      | Inspect `password` input attribute  | Field `type` attribute is equal to `password`.     | `await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password')` |
| 3      | Type characters into password field | Entered characters are rendered as dots/asterisks. | `page.locator('input[name="password"]').fill('sUbbu#1234')`                                |
