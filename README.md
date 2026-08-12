# FrameWright — Enterprise Playwright TypeScript Test Automation Framework

[![Playwright](https://img.shields.io/badge/Playwright-v1.62+-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v6.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NodeJS](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Allure Report](https://img.shields.io/badge/Allure_Report-v3.10+-ff69b4?style=for-the-badge&logo=qameta-allure&logoColor=white)](https://allurereport.org/)
[![Code Style](https://img.shields.io/badge/Code_Style-Prettier%2FESLint-F7B93E?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**FrameWright** is an open-source, enterprise-grade End-to-End (E2E) UI and API test automation framework built on top of **Microsoft Playwright** and **TypeScript**. Engineered for reliability, maintainability, high execution speed, and comprehensive reporting, FrameWright abstracts browser automation complexities through custom action wrappers, robust page object fixtures, advanced assertions, multi-environment management, and Allure integration.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Architecture & Folder Structure](#-architecture--folder-structure)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start & Installation](#-quick-start--installation)
- [Environment Configuration](#-environment-configuration)
- [Test Execution & Command Matrix](#-test-execution--command-matrix)
- [Writing Tests (POM & Fixtures)](#-writing-tests-pom--fixtures)
- [Reporting & Logging](#-reporting--logging)
- [CI/CD Integration](#-cicd-integration)
- [Code Quality & Git Hooks](#-code-quality--git-hooks)
- [Frequently Asked Questions (FAQ)](#-frequently-asked-questions-faq)
- [Author & Maintainer](#-author--maintainer)
- [License](#-license)

---

## ✨ Key Features

- **Page Object Model (POM) with Custom Fixtures**: Injects page instances (`loginPage`, `ticketsPage`) directly into test specifications using Playwright fixtures (`UiFixture.ts`), eliminating boilerplate instantiation code.
- **Modular Action Wrappers (`src/actions`)**: Smart, enterprise-ready action modules (`PageActions`, `UIElementActions`, `InputActions`, `DropDownActions`, `CheckboxActions`, `WaitActions`) featuring auto-retries, element readiness checks, and execution logging.
- **Enterprise Assertion Engine (`src/assertions`)**: Custom `AssertUtils` and `ExpectUtils` wrapping standard Playwright assertions with integrated step logging and reporting hooks.
- **Dynamic Multi-Environment Config (`src/config`)**: `PlaywrightConfigManager` dynamically resolves environment settings (`qa`, `dev`, `stage`, `prod`), base URLs, viewport sizes, and worker parallelism via `.env` files.
- **Advanced Allure & HTML Reporting (`src/reporting`)**: Integrated `AllureReporter`, step decorators via `StepRunner`, dynamic test metadata tracking (`AllureMeta`), and automated report generation scripts (`GenerateReports`).
- **Structured Winston Logging (`src/utils`)**: Production-ready logging utility (`Logger.ts`) supporting daily rotating log files, log levels (`debug`, `info`, `warn`, `error`), and detailed context metadata for rapid Root Cause Analysis (RCA).
- **Comprehensive Utility Suite (`src/utils`)**: Out-of-the-box support for date formatting (`DateUtils`), string generation (`StringsUtils`), file parsing & Excel/XML handling (`FileUtils`).
- **Strict Developer Experience (DX)**: Enforces TypeScript strict mode, ESLint 10, Prettier formatting, and Husky pre-commit hooks via `lint-staged`.
- **CI/CD Pipeline Ready**: Pre-configured GitHub Actions workflow (`.github/workflows/playwright.yml`) for seamless continuous integration testing.

---

## 🏗️ Architecture & Folder Structure

FrameWright adopts a modular, decoupled architecture following industry-standard software engineering design patterns.

```text
FrameWright/
├── .github/
│   └── workflows/
│       └── playwright.yml          # GitHub Actions CI/CD Pipeline Configuration
├── .husky/                          # Git Hooks for Pre-commit Linting & Formatting
├── docs/
│   └── test-cases/                  # Manual Test Cases & Automation Test Specifications
├── src/
│   ├── actions/                     # Modular Web Element Action Wrappers
│   │   ├── CheckboxActions.ts       # Checkbox & Toggle Operations
│   │   ├── DropDownActions.ts       # Single & Multi-Select Dropdown Handlers
│   │   ├── InputActions.ts          # Form Input & Keyboard Interaction Methods
│   │   ├── LocatorHelper.ts         # Dynamic Selector & Locator Resolvers
│   │   ├── PageActions.ts           # Navigation, Dialogs, Frame & Tab Handlers
│   │   ├── UIActions.ts             # Generic UI Action Interface Wrappers
│   │   ├── UIElementActions.ts      # Click, Hover, Scroll & Element State Interactions
│   │   └── WaitActions.ts           # Explicit, Implicit & State Synchronization Waits
│   ├── assertions/                  # Custom Assertion & Verification Utilities
│   │   ├── AssertUtils.ts           # Soft & Hard Assertions with Reporting Hooks
│   │   └── ExpectUtils.ts           # Extended Playwright Matchers & Expectations
│   ├── config/                      # Framework Configuration & Environment Managers
│   │   ├── PlaywrightConfigHelper.ts# Browser, Timeout & Context Configuration Builders
│   │   └── PlaywrightConfigManager.ts # Central Environment & `.env` Variable Resolver
│   ├── fixtures/                    # Custom Playwright Test Fixtures
│   │   └── UiFixture.ts             # Dependency-Injected Page Object Fixtures
│   ├── helper/
│   │   └── setup/                   # Global Setup, Teardown & Page Initializers
│   ├── pages/                       # Page Object Model (POM) Implementations
│   │   ├── BasePage.ts              # Abstract Base Page with Common Components
│   │   ├── LoginPage.ts             # Login & Authentication Page Object
│   │   └── TicketsPage.ts           # Ticket Management Page Object
│   ├── reporting/                   # Allure & Custom HTML Reporting Handlers
│   │   ├── AllureMeta.ts            # Test Suite & Case Metadata Decorators
│   │   ├── AllureReporter.ts        # Allure Lifecycle & Attachment Listener
│   │   ├── CustomReporterConfig.ts  # Reporter Selection & Configuration Engine
│   │   ├── GenerateReports.ts       # Automated Allure HTML Report Bundler
│   │   └── StepRunner.ts            # Standardized Execution Step Wrapper
│   └── utils/                       # Enterprise Utility Modules
│       ├── DateUtils.ts             # Date & Timestamp Formatting Utilities
│       ├── FileUtils.ts             # File Reading, Writing, Excel (XLSX) & XML Parsers
│       ├── Logger.ts                # Winston Daily Rotate Logger Setup
│       └── StringsUtils.ts          # String Manipulation & Random Data Generators
├── tests/
│   └── e2e/                         # End-to-End Test Specification Suites
│       ├── login.spec.ts            # Authentication Test Cases
│       └── tickets.spec.ts          # Ticket Management Test Cases
├── .env.example                     # Environment Variables Template File
├── eslint.config.mjs                # ESLint Configuration
├── package.json                     # Node.js Package Dependencies & NPM Scripts
├── playwright.config.ts             # Main Playwright Test Runner Config Entrypoint
└── tsconfig.json                    # TypeScript Compiler Configuration
```

---

## 🛠️ Technology Stack

| Component                | Technology / Library                                   | Description                                                           |
| :----------------------- | :----------------------------------------------------- | :-------------------------------------------------------------------- |
| **Automation Engine**    | [Microsoft Playwright](https://playwright.dev/) v1.62+ | High-performance cross-browser E2E testing framework                  |
| **Programming Language** | [TypeScript](https://www.typescriptlang.org/) v6.0+    | Type-safe JavaScript execution environment                            |
| **Test Runner**          | `@playwright/test`                                     | Built-in parallel test execution framework                            |
| **Reporting Engine**     | [Allure Report](https://allurereport.org/) v3.10+      | Visual test execution metrics & step-level reports                    |
| **Logger**               | [Winston](https://github.com/winstonjs/winston)        | Structured logging with daily file rotation                           |
| **Code Quality**         | ESLint, Prettier, Husky                                | Static analysis, automated code formatting, and pre-commit checks     |
| **Utilities**            | Zod, Date-fns, XLSX, Crypto-JS                         | Data validation, date manipulation, spreadsheet handling & encryption |

---

## ⚡ Prerequisites

Ensure your system meets the following software requirements before setting up FrameWright:

- **Node.js**: `v20.0.0` or higher (LTS recommended)
- **npm**: `v10.0.0` or higher
- **Git**: Installed and configured on your path

---

## 🚀 Quick Start & Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-org/FrameWright.git
   cd FrameWright
   ```

2. **Install Node.js Dependencies**:

   ```bash
   npm install
   ```

3. **Install Playwright Browsers & OS Dependencies**:

   ```bash
   npx playwright install --with-deps
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to create your local `.env` configuration:
   ```bash
   cp .env.example .env
   ```

---

## ⚙️ Environment Configuration

FrameWright manages execution parameters flexibly using environment variables defined in `.env` files.

### Key `.env` Configuration Variables

| Variable       | Default Value       | Supported Values                                                  | Description                         |
| :------------- | :------------------ | :---------------------------------------------------------------- | :---------------------------------- |
| `ENVIRONMENT`  | `qa`                | `qa`, `dev`, `stage`, `prod`                                      | Target environment identifier       |
| `UI_BASE_URL`  | `https://...`       | Any valid URL                                                     | Base URL for application under test |
| `BROWSER`      | `chromium`          | `chromium`, `firefox`, `webkit`, `mobile_chrome`, `mobile_safari` | Target browser engine               |
| `HEADLESS`     | `true`              | `true`, `false`                                                   | Run browser in headless mode        |
| `WORKERS`      | `4`                 | Number (e.g. `1`, `4`)                                            | Parallel worker thread count        |
| `TEST_TIMEOUT` | `600000`            | Milliseconds                                                      | Global test execution timeout       |
| `RETRIES`      | `0`                 | Integer                                                           | Failed test retry count             |
| `TRACE`        | `on-first-retry`    | `off`, `on`, `retain-on-failure`, `on-first-retry`                | Playwright trace viewer mode        |
| `SCREENSHOT`   | `only-on-failure`   | `off`, `on`, `only-on-failure`                                    | Screenshot capture trigger          |
| `VIDEO`        | `retain-on-failure` | `off`, `on`, `retain-on-failure`                                  | Video recording strategy            |
| `LOG_LEVEL`    | `info`              | `debug`, `info`, `warn`, `error`                                  | Winston logger verbosity            |

---

## 🧪 Test Execution & Command Matrix

Execute tests using the built-in Playwright CLI and npm scripts:

```bash
# Run all End-to-End E2E tests
npx playwright test

# Run tests in headed (visible browser) mode
npx playwright test --headed

# Run tests targeting a specific browser
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run a single spec file
npx playwright test tests/e2e/login.spec.ts

# Run tests matching a specific tag or title
npx playwright test -g "@smoke"

# Execute tests with custom environment configuration
ENVIRONMENT=stage npx playwright test

# Type checking & static linting
npm run typecheck
npm run lint
npm run format
```

---

## 📝 Writing Tests (POM & Fixtures)

FrameWright utilizes custom Playwright test fixtures (`UiFixture.ts`) to inject Page Object instances directly into test steps.

### Example: Authentication Test Suite (`tests/e2e/login.spec.ts`)

```typescript
import { test } from '@fixtures/UiFixture.js';

const validEmail = process.env['TEST_USER_EMAIL'] || '';
const validPassword = process.env['TEST_USER_PASSWORD'] || '';

test.describe('Authentication Page E2E Tests', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigateToLoginPage();
    await loginPage.verifyLoginFormVisible();
  });

  test('TC_AUTH_001: Verify Successful Login with Valid Credentials', async ({ loginPage }) => {
    await loginPage.performLogin(validEmail, validPassword);
    await loginPage.verifyPostLoginDashboard('Subramanyam Reddy');
  });

  test('TC_AUTH_002: Verify Error Message on Incorrect Password', async ({ loginPage }) => {
    await loginPage.enterEmail(validEmail);
    await loginPage.enterPassword('InvalidPassword#123');
    await loginPage.clickLoginButton();
    await loginPage.verifyErrorMessageVisible();
  });
});
```

---

## 📊 Reporting & Logging

### Allure Reports

FrameWright is integrated with Allure Report for visual analytics, step-by-step execution breakdown, and screenshot attachments.

1. **Generate Allure HTML Report**:

   ```bash
   npx allure generate reports/allure-results --clean -o reports/allure-report
   ```

2. **Open Interactive Allure Report**:
   ```bash
   npx allure open reports/allure-report
   ```

### Winston Framework Logs

Execution logs are automatically saved to `output/logs/` with daily log rotation:

- `output/logs/application-YYYY-MM-DD.log`: Full execution trace and step metadata.
- `output/logs/error-YYYY-MM-DD.log`: Detailed error stack trace logs for fast debugging.

---

## 🔄 CI/CD Integration

FrameWright includes a production-grade GitHub Actions workflow (`.github/workflows/playwright.yml`).

### Workflow Triggers & Execution Pipeline

- **Triggers**: On every `push` and `pull_request` against `main` or `master` branches.
- **Pipeline Steps**:
  1. Installs Node.js & caches dependencies.
  2. Runs TypeScript type checking (`npm run typecheck`).
  3. Runs ESLint static analysis (`npm run lint`).
  4. Downloads Playwright browser binaries with OS dependencies.
  5. Executes Playwright test suites in parallel.
  6. Uploads Playwright HTML & Allure artifacts for download.

---

## 🧹 Code Quality & Git Hooks

To maintain high standards across the codebase, FrameWright enforces automated pre-commit checks using **Husky** and **lint-staged**.

- **Linting**: ESLint 10 with Playwright plugin (`npm run lint`).
- **Formatting**: Prettier formatting checks (`npm run format`).
- **Type Safety**: TypeScript compiler check (`npm run typecheck`).

---

## ❓ Frequently Asked Questions (FAQ)

### Q1: What makes FrameWright different from basic Playwright setups?

> FrameWright is an enterprise framework solution that abstracts Playwright's raw API into reusable action wrappers (`PageActions`, `UIElementActions`, `InputActions`), provides dependency-injected page fixtures, includes built-in Winston logging, multi-environment `.env` resolution, and pre-configured Allure reporting out-of-the-box.

### Q2: How do I add a new Page Object to FrameWright?

> 1. Create a new page class extending `BasePage` in `src/pages/YourNewPage.ts`.
> 2. Define page locators and interaction methods.
> 3. Register the new page fixture inside `src/fixtures/UiFixture.ts`.
> 4. Access `yourNewPage` directly in any test spec via test function arguments.

### Q3: How do I switch environments (QA, Staging, Production)?

> Set the `ENVIRONMENT` variable in your `.env` file or pass it directly via CLI:
>
> ```bash
> ENVIRONMENT=stage npx playwright test
> ```

### Q4: Does FrameWright support parallel test execution?

> Yes. Parallelism is controlled via the `WORKERS` variable in `.env` or through the CLI flag (`npx playwright test --workers=4`).

### Q5: How are test failures diagnosed in FrameWright?

> On test failure, FrameWright automatically captures screenshot artifacts, records Playwright video traces, and logs detailed error stack traces into Winston log files (`output/logs/error-*.log`) and Allure report steps.

---

## 👤 Author & Maintainer

**Subramanyam Reddy**

- **Role**: Software Development Engineer in Test (SDET) / QA Automation Architect
- **GitHub**: [@subramanyamr](https://github.com/subramanyamr)

---

## 📄 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute FrameWright according to your project requirements.

---

<p align="center">
  Crafted with ❤️ by <b>Subramanyam Reddy</b> for modern software quality assurance and test automation engineers.
</p>
