import { test as base, type TestInfo } from '@playwright/test';
import * as fs from 'fs';
import { PageActions } from '@actions/PageActions.js';
import { UIActions } from '@actions/UIActions.js';
import { SetupConstants } from '@constants/SetupConstants.js';
import { Logger } from '@logger/Logger.js';
import { AllureReporter } from '@reporting/AllureReporter.js';

/**
 * Custom fixture types extending Playwright's default test context.
 */
export type CustomFixtures = {
  pageActions: PageActions;
  uiActions: UIActions;
};

base.beforeAll(async () => {
  Logger.info('='.repeat(80));
  Logger.info(`${SetupConstants.FRAMEWORK_TITLE} Suite Starting`);
  Logger.info('='.repeat(80));
  AllureReporter.logEnvironmentInfo();
});

base.beforeEach(async ({ page, context }, testInfo: TestInfo) => {
  Logger.info('-'.repeat(80));
  Logger.info(`Test Starting: ${testInfo.title}`);
  Logger.info(`Worker: ${testInfo.parallelIndex + 1}`);
  Logger.info(`Project: ${testInfo.project.name}`);
  Logger.info('-'.repeat(80));

  testInfo.setTimeout(SetupConstants.TEST_TIMEOUT);

  const browserName = context.browser()?.browserType().name();
  const viewport = page.viewportSize();

  Logger.info(`Browser: ${browserName ?? 'unknown'}`);
  Logger.info(`Viewport: ${viewport ? `${viewport.width}x${viewport.height}` : 'unknown'}`);

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      Logger.warn(`Browser ${message.type()}: ${message.text()}`);
    }
  });
});

base.afterEach(async ({ page }, testInfo: TestInfo) => {
  Logger.info('-'.repeat(80));
  Logger.info(`Test Finished: ${testInfo.title}`);
  Logger.info(`Status: ${testInfo.status}`);
  Logger.info(`Duration: ${testInfo.duration}ms`);

  if (testInfo.status === 'failed' || testInfo.status === 'timedOut') {
    try {
      const screenshot = await page.screenshot({
        fullPage: true,
        timeout: 5000,
      });
      await AllureReporter.attachScreenshot(
        `failure-screenshot-${testInfo.title.replace(/\s+/g, '-')}`,
        screenshot
      );

      await AllureReporter.attachHTML('page-source', await page.content());
      await AllureReporter.attachText('current-url', page.url());
      await AllureReporter.attachText('page-title', await page.title());

      if (testInfo.errors.length > 0) {
        await AllureReporter.attachJSON('test-errors', testInfo.errors);
      }
    } catch (error) {
      Logger.error(`Failed to capture failure artifacts: ${error}`);
    }
  }

  if (testInfo.status === 'failed' || testInfo.status === 'timedOut') {
    try {
      const video = page.video();
      if (video) {
        const videoPath = await video.path();
        await new Promise((resolve) => setTimeout(resolve, 200));
        if (fs.existsSync(videoPath)) {
          await AllureReporter.attachVideo('test-recording', videoPath);
        }
      }
    } catch (error) {
      Logger.warn(`Could not attach video: ${error}`);
    }
  }

  Logger.info('-'.repeat(80));
});

base.afterAll(async () => {
  Logger.info('='.repeat(80));
  Logger.info(`${SetupConstants.FRAMEWORK_TITLE} Suite Completed`);
  Logger.info('='.repeat(80));
});

/**
 * Extended Playwright `test` fixture equipped with `pageActions` and `uiActions` fixtures
 * alongside full lifecycle logging and Allure failure artifact capture.
 */
export const test = base.extend<CustomFixtures>({
  pageActions: async ({ page, context }, use) => {
    const pageActions = new PageActions(page, context);
    await use(pageActions);
  },
  uiActions: async ({ pageActions }, use) => {
    const uiActions = new UIActions(pageActions);
    await use(uiActions);
  },
});

export { expect } from '@playwright/test';
