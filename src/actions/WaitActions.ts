import { expect, type Locator, type Page } from '@playwright/test';
import { Logger } from '@logger/Logger.js';
import { LocatorHelper } from './LocatorHelper.js';
import { PageActions } from './PageActions.js';

/**
 * Explicit Wait & Synchronization Helper Class.
 *
 * High-level explicit wait actions for elements, DOM states, navigation, URLs, and custom polling predicates.
 */
export class WaitActions {
  private readonly pageActions: PageActions;

  /**
   * Constructs a new WaitActions instance.
   *
   * @param pageActions - Active PageActions instance.
   */
  constructor(pageActions: PageActions) {
    this.pageActions = pageActions;
  }

  /**
   * Internal accessor to obtain active Playwright Page instance.
   *
   * @returns Active Playwright Page.
   */
  private get page(): Page {
    return this.pageActions.getPage();
  }

  /**
   * Resolves Locator from string or existing Locator using LocatorHelper.
   *
   * @param input - CSS/XPath string or Locator.
   * @returns Resolved Playwright Locator.
   */
  private getLocator(input: string | Locator): Locator {
    return LocatorHelper.getLocator(this.pageActions, input);
  }

  /**
   * Waits until target element becomes visible.
   *
   * @param input - CSS/XPath string selector or Locator.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when element is visible.
   */
  public async waitForVisible(input: string | Locator, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for target to be visible`);
    await this.getLocator(input).waitFor({ state: 'visible', timeout });
  }

  /**
   * Waits until target element becomes hidden or detached from DOM.
   *
   * @param input - CSS/XPath string selector or Locator.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when element is hidden.
   */
  public async waitForHidden(input: string | Locator, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for target to be hidden`);
    await this.getLocator(input).waitFor({ state: 'hidden', timeout });
  }

  /**
   * Waits until target element is attached to DOM.
   *
   * @param input - CSS/XPath string selector or Locator.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when element is attached.
   */
  public async waitForAttached(input: string | Locator, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for target to be attached`);
    await this.getLocator(input).waitFor({ state: 'attached', timeout });
  }

  /**
   * Waits until target element is detached from DOM.
   *
   * @param input - CSS/XPath string selector or Locator.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when element is detached.
   */
  public async waitForDetached(input: string | Locator, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for target to be detached`);
    await this.getLocator(input).waitFor({ state: 'detached', timeout });
  }

  /**
   * Waits until target element becomes enabled.
   *
   * @param input - CSS/XPath string selector or Locator.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when element is enabled.
   */
  public async waitForEnabled(input: string | Locator, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for target to be enabled`);
    await expect(this.getLocator(input)).toBeEnabled({ timeout });
  }

  /**
   * Waits until target element becomes disabled.
   *
   * @param input - CSS/XPath string selector or Locator.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when element is disabled.
   */
  public async waitForDisabled(input: string | Locator, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for target to be disabled`);
    await expect(this.getLocator(input)).toBeDisabled({ timeout });
  }

  /**
   * Waits until target input field contains expected string or regex value.
   *
   * @param input - CSS/XPath string selector or Locator.
   * @param value - Expected string or RegExp value.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when value matches.
   */
  public async waitForValue(
    input: string | Locator,
    value: string | RegExp,
    timeout: number = 30000
  ): Promise<void> {
    Logger.info(`Waiting for target to have value: ${value}`);
    await expect(this.getLocator(input)).toHaveValue(value, { timeout });
  }

  /**
   * Waits until specified text content becomes visible on the page.
   *
   * @param text - Expected text string or RegExp pattern.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when text is visible.
   */
  public async waitForText(text: string | RegExp, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for text: ${text}`);
    await this.page.getByText(text).waitFor({ state: 'visible', timeout });
  }

  /**
   * Waits until expected number of matching elements exist on page.
   *
   * @param input - CSS/XPath string selector or Locator.
   * @param count - Expected element count.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when element count matches.
   */
  public async waitForCount(
    input: string | Locator,
    count: number,
    timeout: number = 30000
  ): Promise<void> {
    Logger.info(`Waiting for ${count} matching elements`);
    await expect(this.getLocator(input)).toHaveCount(count, { timeout });
  }

  /**
   * Waits for page navigation to match URL pattern.
   *
   * @param urlPattern - Expected URL string or RegExp pattern.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when navigation matches.
   */
  public async waitForNavigation(
    urlPattern: string | RegExp,
    timeout: number = 30000
  ): Promise<void> {
    Logger.info(`Waiting for navigation to: ${urlPattern}`);
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Waits for page load state ('load' | 'domcontentloaded' | 'networkidle').
   *
   * @param state - Target load state (defaults to 'load').
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when load state is achieved.
   */
  public async waitForLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'load',
    timeout: number = 30000
  ): Promise<void> {
    Logger.info(`Waiting for load state: ${state}`);
    await this.page.waitForLoadState(state, { timeout });
  }

  /**
   * Waits for initial page load (domcontentloaded state).
   *
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when DOMContentLoaded is fired.
   */
  public async waitForPageLoad(timeout: number = 30000): Promise<void> {
    Logger.info('Waiting for initial page load');
    await this.waitForLoadState('domcontentloaded', timeout);
  }

  /**
   * Waits for page-ready indicator element to be visible.
   *
   * @param input - Indicator element selector or Locator.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when element is visible.
   */
  public async waitForPageReady(input: string | Locator, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for page-ready target`);
    await this.waitForVisible(input, timeout);
  }

  /**
   * Waits until current URL contains specified substring.
   *
   * @param urlPart - Expected URL substring.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when URL contains substring.
   */
  public async waitForUrlContains(urlPart: string, timeout: number = 30000): Promise<void> {
    Logger.info(`Waiting for URL to contain: ${urlPart}`);
    const urlRegex = new RegExp(urlPart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    await this.page.waitForURL(urlRegex, { timeout });
  }

  /**
   * Pauses execution for a specified duration in milliseconds.
   *
   * @param milliseconds - Pause duration in milliseconds.
   * @returns Promise resolving when sleep duration elapses.
   */
  public async sleep(milliseconds: number): Promise<void> {
    Logger.warn(`Hard wait for ${milliseconds}ms - prefer explicit waits where possible`);
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await this.page.waitForTimeout(milliseconds);
  }

  /**
   * Polls a custom predicate function until it evaluates to true or times out.
   *
   * @param fn - Predicate function returning boolean or Promise of boolean.
   * @param options - Optional timeout and polling interval configuration.
   * @returns Promise resolving when predicate returns true.
   * @throws Error if predicate does not evaluate to true within timeout.
   */
  public async waitForFunction(
    fn: () => boolean | Promise<boolean>,
    options?: { timeout?: number; polling?: number }
  ): Promise<void> {
    const timeout = options?.timeout ?? 30000;
    const polling = options?.polling ?? 100;

    Logger.info('Waiting for custom condition');

    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await fn()) {
        Logger.info('Custom condition satisfied');
        return;
      }
      await this.sleep(polling);
    }

    throw new Error(`Timeout: condition did not become true within ${timeout}ms`);
  }
}
