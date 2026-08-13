import { Logger } from '@logger/Logger.js';
import type { Locator, Page } from '@playwright/test';
import { LocatorHelper } from './LocatorHelper.js';
import { PageActions } from './PageActions.js';

/**
 * Advanced UI Element Interaction Utilities.
 *
 * Provides high-level element operations including mouse pointer actions, clicks with retries,
 * double/right clicks, hovers, drag-and-drop, focus, text retrieval, and visibility queries.
 */
export class UIElementActions {
  private readonly pageActions: PageActions;

  /**
   * Initializes a new instance of UIElementActions.
   *
   * @param pageActions - Active PageActions instance.
   */
  constructor(pageActions: PageActions) {
    this.pageActions = pageActions;
  }

  /**
   * Internal helper to access active Playwright Page instance.
   *
   * @returns Active Playwright Page object.
   */
  private get page(): Page {
    return this.pageActions.getPage();
  }

  /**
   * Clicks an element with automatic retry logic on failure.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @param maxRetries - Maximum retry attempts (defaults to 3).
   * @returns Promise resolving when click succeeds.
   * @throws Error if click fails after maxRetries attempts.
   */
  public async click(input: string | Locator, maxRetries: number = 3): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.info(`Clicking element (attempt ${attempt}/${maxRetries})`);
        await locator.click({ timeout: 10000 });
        Logger.info('Click successful');
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          try {
            await locator.scrollIntoViewIfNeeded().catch(() => {});
            await locator.click({ force: true, timeout: 5000 });
            Logger.info('Force click fallback successful');
            return;
          } catch (_fallbackError) {
            Logger.error(`Failed to click after ${maxRetries} attempts: ${error}`);
            throw error;
          }
        }
        Logger.warn(`Click attempt ${attempt} failed, retrying...`);
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await this.page.waitForTimeout(1000 * attempt);
      }
    }
  }

  /**
   * Force clicks an element when standard Playwright actionability checks fail.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving when force click is performed.
   */
  public async forceClick(input: string | Locator): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info('Force clicking element');
    // eslint-disable-next-line playwright/no-force-option
    await locator.click({ force: true });
  }

  /**
   * Clicks at a specific relative pixel coordinate position inside the target element.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @param position - Object with x and y pixel offsets relative to element top-left.
   * @returns Promise resolving when click is performed.
   */
  public async clickAtPosition(
    input: string | Locator,
    position: { x: number; y: number }
  ): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Clicking at position (${position.x}, ${position.y})`);
    await locator.click({ position });
  }

  /**
   * Performs a double click action on the target element.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving when double click completes.
   */
  public async doubleClick(input: string | Locator): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info('Double clicking element');
    await locator.dblclick();
  }

  /**
   * Performs a right click (context menu) action on the target element.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving when right click completes.
   */
  public async rightClick(input: string | Locator): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info('Right clicking element');
    await locator.click({ button: 'right' });
  }

  /**
   * Moves mouse pointer over the target element to trigger hover state.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving when hover completes.
   */
  public async hover(input: string | Locator): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info('Hovering over element');
    await locator.hover();
  }

  /**
   * Drags source element and drops it onto target element.
   *
   * @param source - Source element selector or Locator.
   * @param target - Target destination element selector or Locator.
   * @returns Promise resolving when drag and drop completes.
   */
  public async dragAndDrop(source: string | Locator, target: string | Locator): Promise<void> {
    const sourceLocator = LocatorHelper.getLocator(this.page, source);
    const targetLocator = LocatorHelper.getLocator(this.page, target);

    Logger.info('Performing drag and drop');
    await sourceLocator.dragTo(targetLocator);
  }

  /**
   * Focuses the target input or interactive element.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving when element receives focus.
   */
  public async focus(input: string | Locator): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info('Focusing element');
    await locator.focus();
  }

  /**
   * Fills text value into input field directly.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @param value - Text value to fill.
   * @returns Promise resolving when input is filled.
   */
  public async fill(input: string | Locator, value: string): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Filling value: ${value}`);
    await locator.fill(value);
  }

  /**
   * Types text into element character-by-character with optional delay.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @param text - Text string to type.
   * @param delay - Optional delay in milliseconds between keypresses.
   * @returns Promise resolving when typing completes.
   */
  public async type(input: string | Locator, text: string, delay?: number): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Typing text: ${text}`);
    await locator.pressSequentially(text, { delay });
  }

  /**
   * Sends a specific keyboard keypress to the element.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @param key - Keyboard key identifier string (e.g. 'Enter').
   * @returns Promise resolving when keypress completes.
   */
  public async pressKey(input: string | Locator, key: string): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Pressing key: ${key}`);
    await locator.press(key);
  }

  /**
   * Clears content of text input field.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving when input is cleared.
   */
  public async clear(input: string | Locator): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info('Clearing input');
    await locator.clear();
  }

  /**
   * Gets trimmed text content of target element.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving to trimmed text string.
   */
  public async text(input: string | Locator): Promise<string> {
    const locator = LocatorHelper.getLocator(this.page, input);
    const textContent = await locator.textContent();
    Logger.info(`Element text: ${textContent}`);
    return textContent?.trim() || '';
  }

  /**
   * Gets trimmed text contents of all matching elements as an array.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving to array of trimmed text strings.
   */
  public async texts(input: string | Locator): Promise<string[]> {
    const locator = LocatorHelper.getLocator(this.page, input);
    const textContents = await locator.allTextContents();
    Logger.info(`Found ${textContents.length} text contents`);
    return textContents.map((t) => t.trim());
  }

  /**
   * Gets value of specified DOM attribute.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @param attribute - DOM attribute name string.
   * @returns Promise resolving to attribute value or null if absent.
   */
  public async getAttribute(input: string | Locator, attribute: string): Promise<string | null> {
    const locator = LocatorHelper.getLocator(this.page, input);
    const value = await locator.getAttribute(attribute);
    Logger.info(`Attribute ${attribute}: ${value}`);
    return value;
  }

  /**
   * Checks if target element is currently visible.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving to true if visible, false otherwise.
   */
  public async isElementVisible(input: string | Locator): Promise<boolean> {
    try {
      const locator = LocatorHelper.getLocator(this.page, input);
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Checks if target element is enabled.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving to true if enabled, false otherwise.
   */
  public async isElementEnabled(input: string | Locator): Promise<boolean> {
    const locator = LocatorHelper.getLocator(this.page, input);
    return await locator.isEnabled();
  }

  /**
   * Returns total count of matching elements.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving to element count number.
   */
  public async count(input: string | Locator): Promise<number> {
    const locator = LocatorHelper.getLocator(this.page, input);
    const totalCount = await locator.count();
    Logger.info(`Element count: ${totalCount}`);
    return totalCount;
  }

  /**
   * Returns array of all matching Playwright Locators.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving to array of Locators.
   */
  public async getAllElements(input: string | Locator): Promise<Locator[]> {
    return await LocatorHelper.getAllLocators(this.page, input);
  }

  /**
   * Scrolls target element into viewport if needed.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving when scroll completes.
   */
  public async scrollIntoView(input: string | Locator): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info('Scrolling element into view');
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Waits for element to reach specified DOM or visibility state.
   *
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @param state - Target state ('visible' | 'hidden' | 'attached' | 'detached').
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when element reaches target state.
   */
  public async waitForElementState(
    input: string | Locator,
    state: 'visible' | 'hidden' | 'attached' | 'detached',
    timeout: number = 30000
  ): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Waiting for element state: ${state}`);
    await locator.waitFor({ state, timeout });
  }
}
