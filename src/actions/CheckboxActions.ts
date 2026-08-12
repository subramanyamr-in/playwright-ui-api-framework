import { Logger } from '@logger/Logger.js';
import { expect, type Locator, type Page } from '@playwright/test';
import { LocatorHelper } from './LocatorHelper.js';
import { PageActions } from './PageActions.js';

/**
 * Utility class providing high-level interaction routines for checkbox controls,
 * radio buttons, and select option assertions.
 *
 * Wraps Playwright Locator state operations with diagnostic step logging.
 */
export class CheckboxActions {
  private readonly pageActions: PageActions;

  /**
   * Initializes a new instance of CheckboxActions.
   *
   * @param pageActions - The active PageActions instance for the current context.
   */
  constructor(pageActions: PageActions) {
    this.pageActions = pageActions;
  }

  /**
   * Retrieves the active Playwright Page instance.
   *
   * @returns Active Playwright Page object.
   */
  private get page(): Page {
    return this.pageActions.getPage();
  }

  /**
   * Checks the target checkbox or radio button element.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @returns Promise resolving when the element is checked.
   */
  public async check(input: string | Locator): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info('Checking checkbox');
    await locator.check();
  }

  /**
   * Unchecks the target checkbox element.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @returns Promise resolving when the element is unchecked.
   */
  public async uncheck(input: string | Locator): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info('Unchecking checkbox');
    await locator.uncheck();
  }

  /**
   * Toggles the target checkbox state (unchecks if checked, checks if unchecked).
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @returns Promise resolving when the toggle operation completes.
   */
  public async toggle(input: string | Locator): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    const isChecked = await this.isChecked(input);

    if (isChecked) {
      Logger.info('Toggling: Unchecking checkbox');
      await locator.uncheck();
    } else {
      Logger.info('Toggling: Checking checkbox');
      await locator.check();
    }
  }

  /**
   * Explicitly sets the target checkbox to a specified boolean state (checked or unchecked).
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @param checked - Target state (true for checked, false for unchecked).
   * @returns Promise resolving when state modification completes.
   */
  public async setChecked(input: string | Locator, checked: boolean): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);

    if (checked) {
      Logger.info('Setting checkbox to checked');
      await locator.check();
    } else {
      Logger.info('Setting checkbox to unchecked');
      await locator.uncheck();
    }
  }

  /**
   * Queries whether the target checkbox or radio button is currently checked.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @returns Promise resolving to true if checked, false otherwise.
   */
  public async isChecked(input: string | Locator): Promise<boolean> {
    const locator = LocatorHelper.getLocator(this.page, input);
    const checked = await locator.isChecked();
    Logger.info(`Checkbox checked state: ${checked}`);
    return checked;
  }

  /**
   * Waits until the target checkbox becomes checked within a specified timeout.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @param timeout - Maximum wait duration in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when element is verified checked.
   */
  public async waitForChecked(input: string | Locator, timeout: number = 30000): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info('Waiting for checkbox to be checked');
    await expect(locator).toBeChecked({ timeout });
  }

  /**
   * Waits until the target checkbox becomes unchecked within a specified timeout.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @param timeout - Maximum wait duration in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when element is verified unchecked.
   */
  public async waitForUnchecked(input: string | Locator, timeout: number = 30000): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info('Waiting for checkbox to be unchecked');
    await expect(locator).not.toBeChecked({ timeout });
  }

  /**
   * Waits for a target select/dropdown element to contain an option with specified text.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @param optionText - Expected option label or text.
   * @param timeout - Maximum wait duration in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when option is attached.
   */
  public async waitForOption(
    input: string | Locator,
    optionText: string,
    timeout: number = 30000
  ): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Waiting for option: ${optionText}`);

    await expect(locator.locator('option', { hasText: optionText })).toBeAttached({ timeout });
  }

  /**
   * Waits for a target select element to contain an exact count of option children.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @param count - Expected number of option elements.
   * @param timeout - Maximum wait duration in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when count is met.
   */
  public async waitForOptionCount(
    input: string | Locator,
    count: number,
    timeout: number = 30000
  ): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Waiting for ${count} options`);

    await expect(locator.locator('option')).toHaveCount(count, { timeout });
  }
}
