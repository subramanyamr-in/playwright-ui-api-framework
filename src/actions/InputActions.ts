import { Logger } from '@logger/Logger.js';
import type { Locator, Page } from '@playwright/test';
import { LocatorHelper } from './LocatorHelper.js';
import { PageActions } from './PageActions.js';

/**
 * High-level utilities for interacting with text input fields, textareas, and file uploads.
 *
 * Supports value population, natural character typing, value retrieval, blur events, and file attachments.
 */
export class InputActions {
  private readonly pageActions: PageActions;

  /**
   * Initializes a new instance of InputActions.
   *
   * @param pageActions - Active PageActions instance for the current context.
   */
  constructor(pageActions: PageActions) {
    this.pageActions = pageActions;
  }

  /**
   * Gets the active Playwright Page instance.
   *
   * @returns Active Playwright Page object.
   */
  private get page(): Page {
    return this.pageActions.getPage();
  }

  /**
   * Fills the target input field with a string value.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @param value - Text string to fill into the input.
   * @returns Promise resolving when input is filled.
   */
  public async fill(input: string | Locator, value: string): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Filling input with: ${value}`);
    await locator.fill(value);
  }

  /**
   * Types text character-by-character with a delay to simulate natural human typing.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @param text - Text string to type sequentially.
   * @param delay - Delay in milliseconds between keypresses (defaults to 100ms).
   * @returns Promise resolving when typing is complete.
   */
  public async type(input: string | Locator, text: string, delay: number = 100): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Typing: ${text} with delay ${delay}ms`);
    await locator.pressSequentially(text, { delay });
  }

  /**
   * Clears the current value of the target input field.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @returns Promise resolving when input is cleared.
   */
  public async clear(input: string | Locator): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info('Clearing input field');
    await locator.clear();
  }

  /**
   * Appends text to the existing input field value without clearing it first.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @param text - Text string to append.
   * @returns Promise resolving when text is appended.
   */
  public async appendText(input: string | Locator, text: string): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    const currentValue = await locator.inputValue();
    const newValue = currentValue + text;

    Logger.info(`Appending "${text}" to "${currentValue}"`);
    await locator.fill(newValue);
  }

  /**
   * Fills the input field and immediately presses a specified keyboard key (e.g., 'Enter').
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @param value - Text value to fill.
   * @param key - Keyboard key identifier to press (e.g. 'Enter', 'Tab').
   * @returns Promise resolving when action completes.
   */
  public async fillAndPressKey(input: string | Locator, value: string, key: string): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Filling input with: ${value} and pressing ${key}`);
    await locator.fill(value);
    await locator.press(key);
  }

  /**
   * Fills the input field and removes focus to trigger a blur event.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @param value - Text value to fill.
   * @returns Promise resolving when blur event is dispatched.
   */
  public async fillAndBlur(input: string | Locator, value: string): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Filling input and triggering blur: ${value}`);
    await locator.fill(value);
    await locator.blur();
  }

  /**
   * Sends a sequence of keyboard keypresses to the target input element.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @param keys - Array of keyboard keys to press sequentially.
   * @returns Promise resolving when all keys are pressed.
   */
  public async pressKeys(input: string | Locator, keys: string[]): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Pressing keys: ${keys.join(', ')}`);

    for (const key of keys) {
      await locator.press(key);
    }
  }

  /**
   * Uploads one or more files to a file input element.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @param filePath - Path or array of file paths to attach.
   * @returns Promise resolving when files are attached.
   */
  public async uploadFile(input: string | Locator, filePath: string | string[]): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Uploading file(s): ${filePath}`);
    await locator.setInputFiles(filePath);
  }

  /**
   * Clears all selected files from a file input element.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @returns Promise resolving when file selection is cleared.
   */
  public async clearFileUpload(input: string | Locator): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info('Clearing file upload');
    await locator.setInputFiles([]);
  }

  /**
   * Retrieves the current string value of an input element.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @returns Promise resolving to input value string.
   */
  public async getValue(input: string | Locator): Promise<string> {
    const locator = LocatorHelper.getLocator(this.page, input);
    const value = await locator.inputValue();
    Logger.info(`Input value: ${value}`);
    return value;
  }

  /**
   * Fills the input field and asserts that the resulting value matches the expected string.
   *
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @param value - Value to fill and verify.
   * @returns Promise resolving if verification succeeds.
   * @throws Error if filled value does not match expected value.
   */
  public async fillAndVerify(input: string | Locator, value: string): Promise<void> {
    const locator = LocatorHelper.getLocator(this.page, input);
    Logger.info(`Filling and verifying: ${value}`);

    await locator.fill(value);

    const actualValue = await locator.inputValue();
    if (actualValue !== value) {
      throw new Error(`Fill verification failed. Expected: "${value}", Actual: "${actualValue}"`);
    }
  }
}
