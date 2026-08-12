# FrameWright — Enterprise Playwright UI & API Test Automation Framework

[![Playwright](https://img.shields.io/badge/Playwright-v1.62+-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v6.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NodeJS](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Allure Report](https://img.shields.io/badge/Allure_Report-v3.10+-ff69b4?style=for-the-badge&logo=qameta-allure&logoColor=white)](https://allurereport.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**FrameWright** (`playwright-ui-api-framework`) is a high-performance, enterprise-ready **UI and API Test Automation Framework** built on **Microsoft Playwright** and **TypeScript**. Designed for speed, maintainability, and scalability, FrameWright simplifies end-to-end (E2E) testing with dependency-injected fixtures, Page Object Model (POM), modular API wrappers, Winston logging, and Allure reporting.

---

## ✨ Features

- 🎭 **Unified UI & API Testing**: Seamlessly automate web UI interactions and RESTful API endpoints in a single test runner.
- 🧩 **Page Object Model & Fixtures**: Inject pages (`loginPage`, `ticketsPage`) and HTTP clients (`apiActions`) directly into tests using custom Playwright fixtures.
- ⚡ **Modular Action Engine**: Resilient action wrappers for clicks, form inputs, dropdowns, dialogs, and HTTP requests (`GET`, `POST`, `PUT`, `DELETE`).
- 🌐 **Multi-Environment Config**: Easily switch environments (`qa`, `dev`, `stage`, `prod`) using `.env` files.
- 📊 **Allure & HTML Reporting**: Built-in step tracking, automatic screenshots on failure, and HTML report bundling.
- 📝 **Winston Daily Rotating Logs**: Production-grade log files with execution timing for fast root-cause analysis (RCA).
- 🛠️ **Developer Experience (DX)**: Strict TypeScript checking, ESLint 10, Prettier, and Husky pre-commit hooks.

---

## ⚡ Quick Start

### 1. Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher

### 2. Installation

```bash
# Clone repository
git clone https://github.com/subramanyamr-in/playwright-ui-api-framework.git
cd playwright-ui-api-framework

# Install dependencies & Playwright browsers
npm install
npx playwright install --with-deps
```

### 3. Environment Setup

```bash
cp .env.example .env
```

---

## 🚀 Execution Commands

| Command             | Description                             |
| :------------------ | :-------------------------------------- |
| `npm run test`      | Run all UI and API tests                |
| `npm run test:ui`   | Run UI E2E test suite (`tests/e2e`)     |
| `npm run test:api`  | Run API test suite (`tests/api`)        |
| `npm run typecheck` | Run TypeScript strict type verification |
| `npm run lint`      | Run ESLint static code analysis         |
| `npm run format`    | Auto-format codebase with Prettier      |

---

## 💡 Code Examples

### 🌐 1. UI Test Example (Page Object Model)

```typescript
import { test, expect } from '@fixtures/UiFixture.js';

test.describe('Authentication Suite', () => {
  test('User can log in successfully', async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login('user@example.com', 'securePassword');
    await loginPage.verifyLoginSuccess();
  });
});
```

### 📡 2. API Test Example (`ApiActions`)

```typescript
import { test, expect } from '@fixtures/UiFixture.js';

test.describe('Users API Suite', () => {
  test('GET /users returns 200 OK', async ({ apiActions }) => {
    const response = await apiActions.get('/users');
    await apiActions.validateStatusCode(response, 200);

    const users = await apiActions.getResponseJson<Array<{ id: number; name: string }>>(response);
    expect(users.length).toBeGreaterThan(0);
  });
});
```

---

## 🏗️ Folder Structure

```text
playwright-ui-api-framework/
├── .github/workflows/          # GitHub Actions CI/CD pipeline
├── docs/                       # Manual test specifications & documentation
├── src/
│   ├── actions/                # UI (Click, Input, Page) & API (GET, POST, PUT, DELETE) wrappers
│   ├── assertions/             # Custom assertion & expectation helpers
│   ├── config/                 # Environment & Playwright config builders
│   ├── fixtures/               # Dependency-injected UI & API test fixtures
│   ├── pages/                  # Page Object Model (POM) classes
│   ├── reporting/              # Allure reporting listeners & StepRunner
│   └── utils/                  # Winston logger, DateUtils, FileUtils
├── tests/
│   ├── api/                    # API test specification suites
│   └── e2e/                    # UI E2E test specification suites
├── .env.example                # Environment configuration template
├── package.json                # Project dependencies and scripts
└── playwright.config.ts        # Main Playwright test configuration
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
