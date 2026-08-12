import type { PlaywrightTestConfig, Project, ReporterDescription } from '@playwright/test';
import fs from 'fs';
import { BROWSER_MAP, PlaywrightConfigHelper } from './PlaywrightConfigHelper.js';
import { PathConstants } from '@constants/PathConstants.js';
import { SetupConstants } from '@constants/SetupConstants.js';
import { Browsers } from '@enums/ConfigEnums.js';

PlaywrightConfigHelper.loadEnvironment();

/**
 * Centralized Configuration Manager for Playwright test execution.
 *
 * Assembles global test timeouts, worker counts, output folders, custom reporters,
 * browser project matrix, and setup/teardown lifecycle hooks.
 */
export class PlaywrightConfigManager {
  static readonly TEST_DIR = PathConstants.FOLDER_TESTS;
  static readonly GLOBAL_SETUP_PATH = './src/helper/setup/globalSetup.ts';
  static readonly GLOBAL_TEARDOWN_PATH = './src/helper/setup/globalTeardown.ts';

  /**
   * Generates the complete Playwright configuration object.
   *
   * @returns Configured PlaywrightTestConfig object.
   */
  static getConfig(): PlaywrightTestConfig {
    const config: PlaywrightTestConfig = {
      testDir: this.TEST_DIR,
      timeout: this.getTestTimeout(),
      fullyParallel: true,
      forbidOnly: !!process.env['CI'],
      retries: this.getRetries(),
      workers: this.getConfiguredWorkers(),
      outputDir: this.getOutputDirectory(),
      reporter: this.getReporters(),
      use: this.getUseOptions(),
      projects: this.getProjects(),
    };

    if (fs.existsSync(this.GLOBAL_SETUP_PATH)) {
      config.globalSetup = this.GLOBAL_SETUP_PATH;
    }
    if (fs.existsSync(this.GLOBAL_TEARDOWN_PATH)) {
      config.globalTeardown = this.GLOBAL_TEARDOWN_PATH;
    }

    return config;
  }

  /**
   * Resolves test timeout from environment or framework defaults.
   *
   * @returns Timeout in milliseconds.
   */
  static getTestTimeout(): number {
    return PlaywrightConfigHelper.parseNum(
      process.env['TEST_TIMEOUT'],
      SetupConstants.TEST_TIMEOUT
    );
  }

  /**
   * Resolves retry attempts count based on CI status and environment settings.
   *
   * @returns Number of retries.
   */
  static getRetries(): number {
    if (process.env['CI'] === 'true') {
      return PlaywrightConfigHelper.parseNum(process.env['CI_RETRIES'], 2);
    }
    return PlaywrightConfigHelper.parseNum(process.env['RETRIES'], 0);
  }

  /**
   * Resolves maximum parallel test worker count.
   *
   * @returns Configured worker count or undefined for default.
   */
  static getConfiguredWorkers(): number | undefined {
    if (process.env['CI'] === 'true') {
      return PlaywrightConfigHelper.parseNum(process.env['CI_WORKERS'], 1);
    }
    return process.env['WORKERS']
      ? PlaywrightConfigHelper.parseNum(process.env['WORKERS'], 1)
      : undefined;
  }

  /**
   * Resolves output directory path for test artifacts.
   *
   * @returns Directory path string.
   */
  static getOutputDirectory(): string {
    return PlaywrightConfigHelper.getReportPath('artifacts');
  }

  /**
   * Assembles array of configured Playwright test reporters.
   *
   * @returns Array of ReporterDescription tuples.
   */
  static getReporters(): ReporterDescription[] {
    const reporters: ReporterDescription[] = [
      ['list'],
      [
        'html',
        {
          open: 'never',
          outputFolder: PlaywrightConfigHelper.getReportPath(PathConstants.HTML_REPORTS_PATH),
        },
      ],
      [
        'json',
        {
          outputFile: PlaywrightConfigHelper.getReportPath(PathConstants.JSON_REPORTS_PATH),
        },
      ],
      [
        'junit',
        {
          outputFile: PlaywrightConfigHelper.getReportPath(PathConstants.JUNIT_REPORTS_PATH),
        },
      ],
      ['./src/reporting/CustomReporterConfig.ts'],
      PlaywrightConfigHelper.createAllureReporter(),
    ];
    return reporters;
  }

  /**
   * Assembles global Playwright browser options (tracing, screenshots, video, headless).
   *
   * @returns Playwright test `use` options object.
   */
  static getUseOptions(): PlaywrightTestConfig['use'] {
    const trace =
      (process.env['TRACE'] as NonNullable<PlaywrightTestConfig['use']>['trace']) ||
      'on-first-retry';
    const screenshot =
      (process.env['SCREENSHOT'] as NonNullable<PlaywrightTestConfig['use']>['screenshot']) ||
      'only-on-failure';
    const video =
      (process.env['VIDEO'] as NonNullable<PlaywrightTestConfig['use']>['video']) ||
      'retain-on-failure';
    const headless =
      process.env['HEADLESS'] !== undefined ? process.env['HEADLESS'] === 'true' : undefined;

    return {
      baseURL: process.env['UI_BASE_URL'] || undefined,
      headless,
      trace,
      screenshot,
      video,
      storageState: PlaywrightConfigHelper.getStorageStatePath(),
    };
  }

  /**
   * Resolves project matrix for configured target browsers.
   *
   * @returns Array of Playwright Project objects.
   */
  static getProjects(): Project[] {
    const configuredBrowser =
      (process.env['BROWSER']?.trim().toLowerCase() as Browsers) || Browsers.CHROMIUM;

    const matchedConfig = BROWSER_MAP[configuredBrowser];
    if (matchedConfig) {
      return [
        {
          name: configuredBrowser,
          use: { ...matchedConfig.device },
        },
      ];
    }

    const chromiumDevice = BROWSER_MAP[Browsers.CHROMIUM]?.device;
    const firefoxDevice = BROWSER_MAP[Browsers.FIREFOX]?.device;
    const webkitDevice = BROWSER_MAP[Browsers.WEBKIT]?.device;

    return [
      {
        name: Browsers.CHROMIUM,
        use: { ...chromiumDevice },
      },
      {
        name: Browsers.FIREFOX,
        use: { ...firefoxDevice },
      },
      {
        name: Browsers.WEBKIT,
        use: { ...webkitDevice },
      },
    ];
  }
}
