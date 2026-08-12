import { test, type Page } from '@playwright/test';
import { Logger } from '@logger/Logger.js';
import { AllureReporter } from './AllureReporter.js';

/**
 * StepRunner Options interface
 */
export type StepOptions = {
  /** Take screenshot after step execution (requires `page`) */
  screenshot?: boolean;
  /** Log step return result to Logger */
  logResult?: boolean;
  /** Playwright Page instance for capturing screenshots */
  page?: Page;
};

/**
 * StepRunner - Enhanced step execution wrapper with error handling, timing, and reporting integrations
 *
 * ENHANCEMENTS:
 * - Automatic step logging and execution timing
 * - Automatic screenshot capture on failure or step completion
 * - Nested step grouping and conditional execution
 * - Retry mechanisms with configurable backoff
 * - Parallel step execution support
 * - Timeout handling per step
 */
export class StepRunner {
  /**
   * Execute a step with automatic error handling, timing, and reporting
   *
   * @template T
   * @param stepName - Descriptive step title displayed in logs and reports
   * @param stepBody - Step execution function returning a Promise of T
   * @param options - Additional options including screenshot capture and result logging
   * @returns Result of step execution
   *
   * @example
   * ```typescript
   * await StepRunner.run('Login User', async () => {
   *   await page.fill('#username', 'user');
   * }, { screenshot: true, page });
   * ```
   */
  static async run<T>(
    stepName: string,
    stepBody: () => Promise<T>,
    options?: StepOptions
  ): Promise<T> {
    const startTime = Date.now();

    try {
      Logger.info(`▶ STEP START: ${stepName}`);

      const result = await test.step(stepName, async () => {
        return await stepBody();
      });

      const duration = Date.now() - startTime;
      Logger.info(`✔ STEP PASSED: ${stepName} (${duration}ms)`);

      if (options?.logResult) {
        const resultStr =
          typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
        Logger.info(`Step Result:\n${resultStr}`);
      }

      if (options?.screenshot && options?.page) {
        try {
          const screenshot = await options.page.screenshot({ fullPage: true });
          await AllureReporter.attachScreenshot(`${stepName}-success`, screenshot);
        } catch (screenshotError) {
          Logger.warn(`Could not capture step success screenshot: ${screenshotError}`);
        }
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      Logger.error(`✖ STEP FAILED: ${stepName} (${duration}ms)`);
      Logger.error(`Error: ${error}`);

      if (options?.page) {
        try {
          const failureScreenshot = await options.page.screenshot({ fullPage: true });
          await AllureReporter.attachScreenshot(`${stepName}-failure`, failureScreenshot);
        } catch (screenshotError) {
          Logger.warn(`Could not capture failure screenshot: ${screenshotError}`);
        }
      }

      // Re-throw to preserve test failure state
      throw error;
    }
  }

  /**
   * Execute multiple steps sequentially in order
   *
   * @param steps - Array of step definitions containing name and action
   *
   * @example
   * ```typescript
   * await StepRunner.runSequence([
   *   { name: 'Step 1', action: async () => doAction1() },
   *   { name: 'Step 2', action: async () => doAction2() }
   * ]);
   * ```
   */
  static async runSequence(
    steps: Array<{ name: string; action: () => Promise<unknown> }>
  ): Promise<void> {
    for (const step of steps) {
      await StepRunner.run(step.name, step.action);
    }
  }

  /**
   * Create a step group (nested step hierarchy in reports)
   *
   * @param groupName - Name of the group step
   * @param steps - Steps closure to execute inside the group
   */
  static async group(groupName: string, steps: () => Promise<void>): Promise<void> {
    await test.step(groupName, async () => {
      Logger.info(`📁 STEP GROUP: ${groupName}`);
      await steps();
      Logger.info(`📁 STEP GROUP COMPLETE: ${groupName}`);
    });
  }

  /**
   * Execute step conditionally based on a boolean flag
   *
   * @param condition - Boolean condition; if true executes step, if false skips
   * @param stepName - Step title
   * @param stepBody - Step execution function
   */
  static async runIf(
    condition: boolean,
    stepName: string,
    stepBody: () => Promise<void>
  ): Promise<void> {
    if (condition) {
      await StepRunner.run(stepName, stepBody);
    } else {
      Logger.info(`⏭ STEP SKIPPED: ${stepName} (condition not met)`);
    }
  }

  /**
   * Execute a step with automatic retry logic on failure
   *
   * @param stepName - Step title
   * @param stepBody - Step function to execute
   * @param maxRetries - Maximum retry attempts (default 3)
   */
  static async runWithRetry(
    stepName: string,
    stepBody: () => Promise<void>,
    maxRetries: number = 3
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await StepRunner.run(`${stepName} (Attempt ${attempt})`, stepBody);
        return; // Exit on success
      } catch (error) {
        if (attempt === maxRetries) {
          throw error; // Re-throw on final failure
        }
        Logger.warn(`Retry ${attempt}/${maxRetries} for step: ${stepName}`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  /**
   * Execute a step and capture a screenshot upon step completion
   *
   * @template T
   * @param stepName - Step title
   * @param stepBody - Step function
   * @param page - Playwright Page instance for taking screenshot
   * @returns Result of step execution
   */
  static async runWithScreenshot<T>(
    stepName: string,
    stepBody: () => Promise<T>,
    page: Page
  ): Promise<T> {
    return await StepRunner.run(stepName, stepBody, { screenshot: true, page });
  }

  /**
   * Execute multiple steps concurrently in parallel
   *
   * @param steps - Array of step definitions to run simultaneously
   */
  static async runParallel(
    steps: Array<{ name: string; action: () => Promise<unknown> }>
  ): Promise<void> {
    await test.step('Parallel Steps Execution', async () => {
      const promises = steps.map((step) => StepRunner.run(step.name, step.action));
      await Promise.all(promises);
    });
  }

  /**
   * Execute a step with a maximum timeout constraint
   *
   * @template T
   * @param stepName - Step title
   * @param stepBody - Step function
   * @param timeout - Timeout limit in milliseconds (default 30000ms)
   * @returns Result of step execution
   */
  static async runWithTimeout<T>(
    stepName: string,
    stepBody: () => Promise<T>,
    timeout: number = 30000
  ): Promise<T> {
    let timerId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerId = setTimeout(
        () => reject(new Error(`Step timeout after ${timeout}ms: ${stepName}`)),
        timeout
      );
    });

    try {
      return await StepRunner.run(stepName, async () => {
        return await Promise.race([stepBody(), timeoutPromise]);
      });
    } finally {
      clearTimeout(timerId!);
    }
  }
}
