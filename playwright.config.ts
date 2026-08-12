import { defineConfig } from '@playwright/test';
import { PlaywrightConfigManager } from '@config/PlaywrightConfigManager.js';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig(PlaywrightConfigManager.getConfig());
