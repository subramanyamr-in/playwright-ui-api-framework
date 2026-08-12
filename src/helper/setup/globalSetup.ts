import type { FullConfig } from '@playwright/test';
import { PlaywrightConfigHelper } from '@config/PlaywrightConfigHelper.js';
import { SetupConstants } from '@constants/SetupConstants.js';
import { Logger } from '@logger/Logger.js';

/**
 * Global Setup function executed once before all Playwright UI test suites start.
 *
 * Loads environment configuration variables, initializes output directories,
 * and logs framework execution parameters.
 *
 * @param config - Playwright FullConfig options.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  PlaywrightConfigHelper.loadEnvironment();

  Logger.consoleOnly('═══════════════════════════════════════════════════════════════');
  Logger.consoleOnly(
    `           Global Setup - ${SetupConstants.FRAMEWORK_TITLE} Started            `
  );
  Logger.consoleOnly('═══════════════════════════════════════════════════════════════');
  Logger.info(`Root Directory   : ${config.rootDir}`);
  Logger.info(`Environment      : ${process.env['ENVIRONMENT'] || 'qa'}`);
  Logger.info(`UI Base URL      : ${process.env['UI_BASE_URL'] || 'Not set'}`);
  Logger.info(`Browser Target   : ${process.env['BROWSER'] || 'chromium'}`);
  Logger.info(`Headless Mode    : ${process.env['HEADLESS'] ?? 'default'}`);
  Logger.info(`Parallel Workers : ${config.workers}`);
  Logger.info(`Global Timeout   : ${config.globalTimeout}ms`);
  Logger.consoleOnly('═══════════════════════════════════════════════════════════════');
}
