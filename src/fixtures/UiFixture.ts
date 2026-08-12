import { test as baseTest } from '@playwright/test';
import { PageActions } from '@actions/PageActions.js';
import { AssertUtils } from '@asserts/AssertUtils.js';
import { ExpectUtils } from '@asserts/ExpectUtils.js';
import { Logger } from '@logger/Logger.js';
import { LoginPage } from '@pages/LoginPage.js';
import { TicketsPage } from '@pages/TicketsPage.js';

/**
 * Custom Playwright test fixture types for UI automation components.
 */
export type UiFixtures = {
  pageActions: PageActions;
  assertUtils: AssertUtils;
  expectUtils: ExpectUtils;
  loginPage: LoginPage;
  ticketsPage: TicketsPage;
};

/**
 * Extended Playwright `test` instance injecting initialized page objects and action fixtures.
 */
export const test = baseTest.extend<UiFixtures>({
  pageActions: async ({ page, context }, use) => {
    Logger.debug('Initializing PageActions fixture');
    const pageActions = new PageActions(page, context);
    await use(pageActions);
  },

  assertUtils: async ({}, use) => {
    Logger.debug('Initializing AssertUtils fixture');
    const assertUtils = new AssertUtils();
    await use(assertUtils);
  },

  expectUtils: async ({ pageActions }, use) => {
    Logger.debug('Initializing ExpectUtils fixture');
    const expectUtils = new ExpectUtils(pageActions);
    await use(expectUtils);
  },

  loginPage: async ({ pageActions }, use) => {
    Logger.debug('Initializing LoginPage fixture');
    const loginPage = new LoginPage(pageActions);
    await use(loginPage);
  },

  ticketsPage: async ({ pageActions }, use) => {
    Logger.debug('Initializing TicketsPage fixture');
    const ticketsPage = new TicketsPage(pageActions);
    await use(ticketsPage);
  },
});

export { expect } from '@playwright/test';
