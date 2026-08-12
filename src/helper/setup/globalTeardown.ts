import type { FullConfig } from '@playwright/test';
import { SetupConstants } from '@constants/SetupConstants.js';
import { Logger } from '@logger/Logger.js';

/**
 * Global Teardown function executed once after all Playwright UI test suites finish.
 *
 * Performs post-execution cleanup, summary output, and resource release.
 *
 * @param config - Playwright FullConfig options.
 */
export default async function globalTeardown(config: FullConfig): Promise<void> {
  Logger.consoleOnly('═══════════════════════════════════════════════════════════════');
  Logger.consoleOnly(
    `          Global Teardown - ${SetupConstants.FRAMEWORK_TITLE} Finished         `
  );
  Logger.consoleOnly('═══════════════════════════════════════════════════════════════');
  Logger.info(`Test Run Completed for Root Directory: ${config.rootDir}`);
  Logger.consoleOnly('═══════════════════════════════════════════════════════════════');
}
