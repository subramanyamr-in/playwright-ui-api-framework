import { type Locator, type Page, selectors } from '@playwright/test';
import { PageActions } from './PageActions.js';

/**
 * Static utility for resolving Playwright Locators from PageActions instances or raw Page objects.
 *
 * Provides unified static methods for standard CSS/XPath selectors and built-in
 * Playwright getBy* locator strategies (testId, text, label, placeholder, altText, title, role).
 */
export class LocatorHelper {
  /**
   * Internal helper to extract the active Playwright Page instance from PageActions or Page object.
   *
   * @param page - PageActions or Page instance.
   * @returns Active Playwright Page object.
   */
  private static getPage(page: PageActions | Page): Page {
    if (page instanceof PageActions) {
      return page.getPage();
    }
    return page;
  }

  /**
   * Resolves a Playwright Locator from a string selector or returns the given Locator as-is.
   *
   * @param sourcePage - PageActions or Page instance.
   * @param input - CSS/XPath selector string or pre-built Playwright Locator.
   * @returns Resolved Playwright Locator.
   */
  public static getLocator(sourcePage: PageActions | Page, input: string | Locator): Locator {
    if (typeof input === 'string') {
      const page = this.getPage(sourcePage);
      return page.locator(input);
    }
    return input;
  }

  /**
   * Resolves a Locator by test ID attribute, optionally overriding the test ID attribute name.
   *
   * @param sourcePage - PageActions or Page instance.
   * @param testId - Test ID value string or RegExp.
   * @param attributeName - Optional custom attribute name (e.g., 'data-qa').
   * @returns Resolved Playwright Locator.
   */
  public static getLocatorByTestId(
    sourcePage: PageActions | Page,
    testId: string | RegExp,
    attributeName?: string
  ): Locator {
    if (attributeName) {
      selectors.setTestIdAttribute(attributeName);
    }
    const page = this.getPage(sourcePage);
    return page.getByTestId(testId);
  }

  /**
   * Resolves a Locator matching specified visible text string or regular expression.
   *
   * @param sourcePage - PageActions or Page instance.
   * @param text - Text string or RegExp pattern.
   * @returns Resolved Playwright Locator.
   */
  public static getLocatorByText(sourcePage: PageActions | Page, text: string | RegExp): Locator {
    const page = this.getPage(sourcePage);
    return page.getByText(text);
  }

  /**
   * Resolves a Locator matching an associated input label text.
   *
   * @param sourcePage - PageActions or Page instance.
   * @param text - Label text string or RegExp pattern.
   * @returns Resolved Playwright Locator.
   */
  public static getLocatorByLabel(sourcePage: PageActions | Page, text: string | RegExp): Locator {
    const page = this.getPage(sourcePage);
    return page.getByLabel(text);
  }

  /**
   * Resolves a Locator matching input placeholder text.
   *
   * @param sourcePage - PageActions or Page instance.
   * @param text - Placeholder text string or RegExp pattern.
   * @returns Resolved Playwright Locator.
   */
  public static getLocatorByPlaceholder(
    sourcePage: PageActions | Page,
    text: string | RegExp
  ): Locator {
    const page = this.getPage(sourcePage);
    return page.getByPlaceholder(text);
  }

  /**
   * Resolves a Locator matching element title attribute.
   *
   * @param sourcePage - PageActions or Page instance.
   * @param text - Title text string or RegExp pattern.
   * @returns Resolved Playwright Locator.
   */
  public static getLocatorByTitle(sourcePage: PageActions | Page, text: string | RegExp): Locator {
    const page = this.getPage(sourcePage);
    return page.getByTitle(text);
  }

  /**
   * Resolves a Locator matching image alt text attribute.
   *
   * @param sourcePage - PageActions or Page instance.
   * @param text - Alt text string or RegExp pattern.
   * @returns Resolved Playwright Locator.
   */
  public static getLocatorByAltText(
    sourcePage: PageActions | Page,
    text: string | RegExp
  ): Locator {
    const page = this.getPage(sourcePage);
    return page.getByAltText(text);
  }

  /**
   * Resolves a Locator matching specified ARIA role and filter options.
   *
   * @param sourcePage - PageActions or Page instance.
   * @param role - Target ARIA role.
   * @param options - Optional role options (e.g. { name: 'Submit' }).
   * @returns Resolved Playwright Locator.
   */
  public static getLocatorByRole(
    sourcePage: PageActions | Page,
    role: 'button' | 'link' | 'textbox' | 'heading' | 'img' | 'list' | 'listitem',
    options?: { name?: string | RegExp }
  ): Locator {
    const page = this.getPage(sourcePage);
    return page.getByRole(role, options);
  }

  /**
   * Resolves and returns all matching elements as an array of Playwright Locators.
   *
   * @param sourcePage - PageActions or Page instance.
   * @param input - CSS/XPath selector string or Playwright Locator.
   * @returns Promise resolving to array of matching Playwright Locators.
   */
  public static async getAllLocators(
    sourcePage: PageActions | Page,
    input: string | Locator
  ): Promise<Locator[]> {
    if (typeof input === 'string') {
      const page = this.getPage(sourcePage);
      return await page.locator(input).all();
    }
    return await input.all();
  }
}
