import path from 'path';
import os from 'os';
import fs from 'fs';
import dotenv from 'dotenv';
import { z } from 'zod';
import { devices, type ReporterDescription } from '@playwright/test';
import { Browsers, Environment } from '@enums/ConfigEnums.js';
import { PathConstants } from '@constants/PathConstants.js';
import { SetupConstants } from '@constants/SetupConstants.js';

export type DeviceDescriptor = (typeof devices)[keyof typeof devices];

/**
 * Mapping of supported framework browser targets to Playwright device descriptors and browser engines.
 */
export const BROWSER_MAP: Record<
  Browsers,
  { device: DeviceDescriptor; engine: 'chromium' | 'firefox' | 'webkit' }
> = {
  [Browsers.CHROMIUM]: { device: devices['Desktop Chrome'], engine: 'chromium' },
  [Browsers.FIREFOX]: { device: devices['Desktop Firefox'], engine: 'firefox' },
  [Browsers.WEBKIT]: { device: devices['Desktop Safari'], engine: 'webkit' },
  [Browsers.MOBILE_CHROME]: { device: devices['Pixel 7'], engine: 'chromium' },
  [Browsers.MOBILE_SAFARI]: { device: devices['iPhone 14'], engine: 'webkit' },
};

/**
 * Helper utility for managing environment configuration, dynamic output paths,
 * environment metadata extraction, and Allure reporter descriptors for Playwright.
 */
export class PlaywrightConfigHelper {
  /**
   * Environment Loader:
   * Dynamically loads `.env.{ENVIRONMENT}` (e.g., `.env.qa`, `.env.prod`)
   * and falls back to base `.env` if shared defaults exist.
   */
  static loadEnvironment(): void {
    process.env['DOTENV_CONFIG_QUIET'] = 'true';
    const env = process.env['ENVIRONMENT']?.trim().toLowerCase() || 'qa';
    const envFilePath = path.resolve(process.cwd(), `.env.${env}`);

    if (fs.existsSync(envFilePath)) {
      dotenv.config({ path: envFilePath, override: true, quiet: true });
    }
    dotenv.config({ quiet: true });
  }

  /**
   * Safely parses a non-negative numeric environment variable with a fallback default.
   *
   * @param val - Environment variable string value.
   * @param fallback - Default numeric value if parsing fails.
   * @returns Parsed non-negative number or fallback value.
   */
  static parseNum(val: string | undefined, fallback: number): number {
    const n = Number(val);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  /**
   * Validates and parses a URL environment variable using Zod.
   *
   * @param key - Environment variable key name.
   * @param friendlyName - Human-readable label for error reporting.
   * @returns Validated URL string without trailing slashes.
   * @throws Error if key is missing or invalid URL.
   */
  static parseUrl(key: string, friendlyName: string): string {
    const val = process.env[key];
    if (val && z.string().url().safeParse(val).success) {
      return val.replace(/\/+$/, '');
    }
    throw new Error(`[Config Error]: Please provide a valid ${friendlyName}`);
  }

  /**
   * Parses an enum environment variable string against an allowed set of options.
   *
   * @template T
   * @param key - Environment variable key name.
   * @param allowed - Array of allowed string options.
   * @param fallback - Fallback enum value.
   * @returns Validated enum string value.
   * @throws Error if value is unsupported.
   */
  static parseEnum<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
    const val = process.env[key]?.trim().toLowerCase();
    const res = z.enum(allowed as [T, ...T[]]).safeParse(val || fallback);
    if (res.success) return res.data;
    throw new Error(
      `[Config Error]: Invalid ${key} configured: "${process.env[key]}". Supported options: ${allowed.join(', ')}`
    );
  }

  /**
   * Generates or retrieves a timestamped report directory path.
   *
   * @param segments - Additional subfolder path segments.
   * @returns Full absolute path string.
   */
  static getReportPath(...segments: string[]): string {
    if (!process.env['REPORT_ROOT']) {
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, 19);
      process.env['REPORT_ROOT'] = path.join(process.cwd(), 'reports', timestamp);
    }
    return path.join(process.env['REPORT_ROOT'], ...segments);
  }

  /**
   * Resolves storage state JSON path if state file exists on disk.
   *
   * @returns Absolute path string if present, undefined otherwise.
   */
  static getStorageStatePath(): string | undefined {
    const authPath = path.resolve(process.cwd(), PathConstants.STORAGE_STATE_PATH);
    return fs.existsSync(authPath) ? authPath : undefined;
  }

  /**
   * Extracts environment metadata dictionary for reports.
   *
   * @param extraInfo - Optional key-value pairs to merge.
   * @returns Record object containing system and environment parameters.
   */
  static getEnvironmentInfo(extraInfo: Record<string, string> = {}): Record<string, string> {
    return {
      Framework: SetupConstants.FRAMEWORK_TITLE,
      Environment: process.env['ENVIRONMENT'] || Environment.QA,
      Browser: process.env['BROWSER'] || Browsers.CHROMIUM,
      UI_Base_URL: process.env['UI_BASE_URL'] || '',
      API_Base_URL: process.env['API_BASE_URL'] || '',
      OS_Platform: os.platform(),
      OS_Release: os.release(),
      Node_Version: process.version,
      Report_Generation_Time: new Date().toLocaleString(),
      ...extraInfo,
    };
  }

  /**
   * Constructs Playwright Allure reporter configuration description.
   *
   * @param extraInfo - Optional extra environment properties.
   * @returns ReporterDescription configuration tuple.
   */
  static createAllureReporter(extraInfo: Record<string, string> = {}): ReporterDescription {
    return [
      'allure-playwright',
      {
        detail: true,
        resultsDir: this.getReportPath(PathConstants.ALLURE_REPORTS_PATH),
        suiteTitle: true,
        environmentInfo: this.getEnvironmentInfo(extraInfo),
      },
    ];
  }
}
