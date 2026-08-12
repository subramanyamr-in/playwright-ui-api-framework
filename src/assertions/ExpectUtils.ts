import { expect, type Expect, type Locator } from '@playwright/test';
import { LocatorHelper } from '@actions/LocatorHelper.js';
import { PageActions } from '@actions/PageActions.js';
import { Logger } from '@logger/Logger.js';
import { StepRunner } from '@reporting/StepRunner.js';

// -----------------------------------------------------------------------------
// ExpectUtils - Playwright Locator & Page Assertion Wrapper Class
//
// PURPOSE:
// - Instance-based assertion utility wrapping Playwright expect matchers.
// - Resolves locators via LocatorHelper and binds step logging via StepRunner.
// - Supports configurable timeouts and soft assertion options.
// -----------------------------------------------------------------------------

export type SoftOption = {
  soft?: boolean;
};

export type ExpectOptions = {
  timeout?: number;
} & SoftOption;

export class ExpectUtils {
  private readonly actions: PageActions;

  constructor(actions: PageActions) {
    this.actions = actions;
  }

  /**
   * Returns a configured `expect` instance with soft option.
   */
  private getExpectWithSoftOption(options?: SoftOption): Expect {
    return expect.configure({ soft: options?.soft });
  }

  /**
   * Extracts matcher-safe options.
   */
  private getMatcherOptions(options?: ExpectOptions) {
    return options?.timeout ? { timeout: options.timeout } : undefined;
  }

  /**
   * Resolves a locator and returns it with the configured expect.
   */
  private getLocatorAndAssert(
    input: string | Locator,
    options?: SoftOption
  ): { locator: Locator; assert: Expect } {
    const locator = LocatorHelper.getLocator(this.actions, input);
    const assert = this.getExpectWithSoftOption(options);
    return { locator, assert };
  }

  /**
   * Helper to format and rethrow assertion errors while preserving Playwright diagnostic details.
   */
  private handleAssertionError(methodName: string, error: unknown, errorMessage: string): never {
    Logger.error(`${methodName} error: ${error}`);
    if (error instanceof Error) {
      error.message = `${errorMessage}\nDetails: ${error.message}`;
      throw error;
    }
    throw new Error(`${errorMessage} | ${error}`);
  }

  /**
   * Verifies an element is hidden.
   */
  public async expectElementToBeHidden(
    input: string | Locator,
    description: string,
    errorMessage: string,
    options?: ExpectOptions
  ): Promise<void> {
    return StepRunner.run(`Verify ${description} is hidden:`, async () => {
      const { locator, assert } = this.getLocatorAndAssert(input, options);
      const matcherOptions = this.getMatcherOptions(options);
      try {
        await assert(locator).toBeHidden(matcherOptions);
      } catch (error) {
        this.handleAssertionError('expectElementToBeHidden', error, errorMessage);
      }
    });
  }

  /**
   * Verifies an element is visible.
   */
  public async expectElementToBeVisible(
    input: string | Locator,
    description: string,
    errorMessage: string,
    options?: ExpectOptions
  ): Promise<void> {
    return StepRunner.run(`Verify ${description} is visible:`, async () => {
      const { locator, assert } = this.getLocatorAndAssert(input, options);
      const matcherOptions = this.getMatcherOptions(options);
      try {
        await assert(locator).toBeVisible(matcherOptions);
      } catch (error) {
        this.handleAssertionError('expectElementToBeVisible', error, errorMessage);
      }
    });
  }

  /**
   * Asserts that the given element is not in the DOM nor visible.
   */
  public async expectElementNotToBeVisible(
    input: string | Locator,
    description: string,
    errorMessage: string,
    options?: ExpectOptions
  ): Promise<void> {
    return StepRunner.run(`Verify ${description} is NOT visible:`, async () => {
      const { locator, assert } = this.getLocatorAndAssert(input, options);
      const matcherOptions = this.getMatcherOptions(options);
      try {
        await assert(locator).not.toBeVisible(matcherOptions);
      } catch (error) {
        this.handleAssertionError('expectElementNotToBeVisible', error, errorMessage);
      }
    });
  }

  /**
   * Asserts that the given element is present in the DOM.
   */
  public async expectElementToBeAttached(
    input: string | Locator,
    description: string,
    errorMessage: string,
    options?: ExpectOptions
  ): Promise<void> {
    return StepRunner.run(`Verify ${description} is attached:`, async () => {
      const { locator, assert } = this.getLocatorAndAssert(input, options);
      const matcherOptions = this.getMatcherOptions(options);
      try {
        await assert(locator).toBeAttached(matcherOptions);
      } catch (error) {
        this.handleAssertionError('expectElementToBeAttached', error, errorMessage);
      }
    });
  }

  /**
   * Asserts that the given element is not present in the DOM.
   */
  public async expectElementNotToBeAttached(
    input: string | Locator,
    description: string,
    errorMessage: string,
    options?: ExpectOptions
  ): Promise<void> {
    return StepRunner.run(`Verify ${description} is NOT attached:`, async () => {
      const { locator, assert } = this.getLocatorAndAssert(input, options);
      const matcherOptions = this.getMatcherOptions(options);
      try {
        await assert(locator).not.toBeAttached(matcherOptions);
      } catch (error) {
        this.handleAssertionError('expectElementNotToBeAttached', error, errorMessage);
      }
    });
  }

  /**
   * Asserts that the element equals the provided string or regex.
   */
  public async expectElementToHaveText(
    input: string | Locator,
    description: string,
    text: string | RegExp | Array<string | RegExp>,
    errorMessage: string,
    options?: ExpectOptions
  ): Promise<void> {
    return StepRunner.run(`Verify ${description} text:`, async () => {
      const { locator, assert } = this.getLocatorAndAssert(input, options);
      const matcherOptions = this.getMatcherOptions(options);
      try {
        await assert(locator).toHaveText(text, matcherOptions);
      } catch (error) {
        this.handleAssertionError('expectElementToHaveText', error, errorMessage);
      }
    });
  }

  /**
   * Asserts that an element has an attribute with the given value.
   */
  public async expectElementToHaveAttributeValue(
    input: string | Locator,
    attribute: string,
    value: string | RegExp,
    errorMessage: string,
    options?: ExpectOptions
  ): Promise<void> {
    return StepRunner.run(`Verify attribute ${attribute}:`, async () => {
      const { locator, assert } = this.getLocatorAndAssert(input, options);
      const matcherOptions = this.getMatcherOptions(options);
      const expected = typeof value === 'string' ? new RegExp(value) : value;

      try {
        await assert(locator).toHaveAttribute(attribute, expected, matcherOptions);
      } catch (error) {
        this.handleAssertionError('expectElementToHaveAttributeValue', error, errorMessage);
      }
    });
  }

  /**
   * Page Assertions
   */

  /**
   * Asserts that the current page URL matches exactly the provided URL or regular expression.
   */
  public async expectPageToHaveURL(
    urlOrRegExp: string | RegExp,
    description: string,
    errorMessage: string,
    options?: ExpectOptions
  ): Promise<void> {
    return StepRunner.run(`Verify ${description} URL:`, async () => {
      const assert = this.getExpectWithSoftOption(options);
      const matcherOptions = this.getMatcherOptions(options);
      try {
        await assert(this.actions.getPage()).toHaveURL(urlOrRegExp, matcherOptions);
      } catch (error) {
        this.handleAssertionError('expectPageToHaveURL', error, errorMessage);
      }
    });
  }

  /**
   * Asserts that the current page Title matches exactly the provided title or regular expression.
   */
  public async expectPageToHaveTitle(
    titleOrRegExp: string | RegExp,
    description: string,
    errorMessage: string,
    options?: ExpectOptions
  ): Promise<void> {
    return StepRunner.run(`Verify ${description} title:`, async () => {
      const assert = this.getExpectWithSoftOption(options);
      const matcherOptions = this.getMatcherOptions(options);
      try {
        await assert(this.actions.getPage()).toHaveTitle(titleOrRegExp, matcherOptions);
      } catch (error) {
        this.handleAssertionError('expectPageToHaveTitle', error, errorMessage);
      }
    });
  }

  /**
   * Asserts that the element contains the provided substring.
   */
  public async expectElementToContainText(
    input: string | Locator,
    description: string,
    text: string | RegExp,
    errorMessage: string,
    options?: ExpectOptions
  ): Promise<void> {
    return StepRunner.run(`Verify ${description} contains text:`, async () => {
      const { locator, assert } = this.getLocatorAndAssert(input, options);
      const matcherOptions = this.getMatcherOptions(options);
      try {
        await assert(locator).toContainText(text, matcherOptions);
      } catch (error) {
        this.handleAssertionError('expectElementToContainText', error, errorMessage);
      }
    });
  }

  /**
   * Asserts that the element is enabled.
   */
  public async expectElementToBeEnabled(
    input: string | Locator,
    description: string,
    errorMessage: string,
    options?: ExpectOptions
  ): Promise<void> {
    return StepRunner.run(`Verify ${description} is enabled:`, async () => {
      const { locator, assert } = this.getLocatorAndAssert(input, options);
      const matcherOptions = this.getMatcherOptions(options);
      try {
        await assert(locator).toBeEnabled(matcherOptions);
      } catch (error) {
        this.handleAssertionError('expectElementToBeEnabled', error, errorMessage);
      }
    });
  }

  /**
   * Asserts that the element is disabled.
   */
  public async expectElementToBeDisabled(
    input: string | Locator,
    description: string,
    errorMessage: string,
    options?: ExpectOptions
  ): Promise<void> {
    return StepRunner.run(`Verify ${description} is disabled:`, async () => {
      const { locator, assert } = this.getLocatorAndAssert(input, options);
      const matcherOptions = this.getMatcherOptions(options);
      try {
        await assert(locator).toBeDisabled(matcherOptions);
      } catch (error) {
        this.handleAssertionError('expectElementToBeDisabled', error, errorMessage);
      }
    });
  }

  /**
   * Asserts that the locator resolves to exactly n matching elements.
   */
  public async expectElementToHaveCount(
    input: string | Locator,
    description: string,
    count: number,
    errorMessage: string,
    options?: ExpectOptions
  ): Promise<void> {
    return StepRunner.run(`Verify ${description} count:`, async () => {
      const { locator, assert } = this.getLocatorAndAssert(input, options);
      const matcherOptions = this.getMatcherOptions(options);
      try {
        await assert(locator).toHaveCount(count, matcherOptions);
      } catch (error) {
        this.handleAssertionError('expectElementToHaveCount', error, errorMessage);
      }
    });
  }
}
