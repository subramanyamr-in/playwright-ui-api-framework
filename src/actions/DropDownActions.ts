import { Logger } from '@logger/Logger.js';
import type { Locator, Page } from '@playwright/test';
import { LocatorHelper } from './LocatorHelper.js';
import { PageActions } from './PageActions.js';

/**
 * Utility class for interacting with HTML `<select>` dropdown elements.
 *
 * Supports option selection by value, label, index, or array, as well as
 * selected option inspection and option list retrieval.
 */
export class DropDownActions {
  private readonly pageActions: PageActions;

  /**
   * Initializes a new instance of DropDownActions.
   *
   * @param pageActions - The active PageActions instance.
   */
  constructor(pageActions: PageActions) {
    this.pageActions = pageActions;
  }

  /**
   * Internal helper to access the current active Playwright Page.
   *
   * @returns Active Playwright Page object.
   */
  private get page(): Page {
    return this.pageActions.getPage();
  }

  /**
   * Selects an option in the dropdown element by its attribute `value`.
   *
   * @param input - Selector string or Playwright Locator for the select element.
   * @param value - Attribute value of the option to select.
   * @returns Promise resolving when option is selected.
   */
  public async selectByValue(input: string | Locator, value: string): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Selecting option by value: ${value}`);
    await locator.selectOption({ value });
  }

  /**
   * Selects an option in the dropdown element by its visible label text.
   *
   * @param input - Selector string or Playwright Locator for the select element.
   * @param label - Visible text label of the option to select.
   * @returns Promise resolving when option is selected.
   */
  public async selectByLabel(input: string | Locator, label: string): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Selecting option by label: ${label}`);
    await locator.selectOption({ label });
  }

  /**
   * Selects an option in the dropdown element by its zero-based index.
   *
   * @param input - Selector string or Playwright Locator for the select element.
   * @param index - Zero-based index of the target option.
   * @returns Promise resolving when option is selected.
   */
  public async selectByIndex(input: string | Locator, index: number): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Selecting option by index: ${index}`);
    await locator.selectOption({ index });
  }

  /**
   * Selects multiple options in a multi-select dropdown by their values.
   *
   * @param input - Selector string or Playwright Locator for the select element.
   * @param values - Array of option values to select.
   * @returns Promise resolving when options are selected.
   */
  public async selectMultiple(input: string | Locator, values: string[]): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Selecting multiple options: ${values.join(', ')}`);
    await locator.selectOption(values);
  }

  /**
   * Retrieves the current string value attribute of the target select element.
   *
   * @param input - Selector string or Playwright Locator.
   * @returns Promise resolving to selected value string.
   */
  public async getSelectedValue(input: string | Locator): Promise<string> {
    const locator = LocatorHelper.getLocator(this.page, input);
    const value = await locator.inputValue();
    Logger.info(`Selected value: ${value}`);
    return value;
  }

  /**
   * Retrieves the visible text of the currently selected option in a select element.
   *
   * @param input - Selector string or Playwright Locator.
   * @returns Promise resolving to selected option visible text string.
   */
  public async getSelectedText(input: string | Locator): Promise<string> {
    const locator = LocatorHelper.getLocator(this.page, input);
    const selectedOption = locator.locator('option:checked');
    const text = await selectedOption.textContent();
    Logger.info(`Selected text: ${text}`);
    return text?.trim() || '';
  }

  /**
   * Retrieves all visible option label texts contained in the select element.
   *
   * @param input - Selector string or Playwright Locator.
   * @returns Promise resolving to array of option label strings.
   */
  public async getAllOptions(input: string | Locator): Promise<string[]> {
    const locator = LocatorHelper.getLocator(this.page, input);
    const options = await locator.locator('option').allTextContents();
    Logger.info(`All options: ${options.join(', ')}`);
    return options;
  }

  /**
   * Retrieves all option value attributes present in the select element.
   *
   * @param input - Selector string or Playwright Locator.
   * @returns Promise resolving to array of option attribute values.
   */
  public async getAllOptionValues(input: string | Locator): Promise<string[]> {
    const locator = LocatorHelper.getLocator(this.page, input);
    const options = await locator.locator('option').all();

    const values: string[] = [];
    for (const option of options) {
      const value = await option.getAttribute('value');
      if (value) values.push(value);
    }

    Logger.info(`All option values: ${values.join(', ')}`);
    return values;
  }

  /**
   * Checks whether the dropdown contains an option matching the specified visible text.
   *
   * @param input - Selector string or Playwright Locator.
   * @param optionText - Expected visible text to search for.
   * @returns Promise resolving to true if option exists, false otherwise.
   */
  public async hasOption(input: string | Locator, optionText: string): Promise<boolean> {
    const options = await this.getAllOptions(input);
    const hasIt = options.includes(optionText);
    Logger.info(`Dropdown has option "${optionText}": ${hasIt}`);
    return hasIt;
  }
}
