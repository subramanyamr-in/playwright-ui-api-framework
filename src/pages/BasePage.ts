import type { Locator, Page } from '@playwright/test';
import { LocatorHelper } from '@actions/LocatorHelper.js';
import { PageActions } from '@actions/PageActions.js';
import { UIActions } from '@actions/UIActions.js';
import { WaitActions } from '@actions/WaitActions.js';
import { AssertUtils } from '@asserts/AssertUtils.js';
import { ExpectUtils } from '@asserts/ExpectUtils.js';
import { Logger } from '@logger/Logger.js';
import { StepRunner } from '@reporting/StepRunner.js';

/**
 * Core Abstract Base Class for Page Object Model (POM) implementation.
 *
 * Provides shared Playwright actions, locator factories, assertions,
 * explicit waits, and page lifecycle management methods for all page objects.
 */
export abstract class BasePage {
  /** Active PageActions instance managing page and context navigation. */
  protected pageActions: PageActions;
  /** High-level UI actions facade for mouse, keyboard, input, dropdown, and checkbox operations. */
  protected ui: UIActions;
  /** Soft and hard general data assertion utilities. */
  protected assertUtils: AssertUtils;
  /** Locator and page assertion utilities wrapping Playwright expect matchers. */
  protected expectUtils: ExpectUtils;
  /** Explicit wait and page synchronization utilities. */
  protected waitUtils: WaitActions;

  /** Relative or absolute URL of the page. */
  protected abstract pageUrl: string;
  /** Expected page title string or RegExp pattern. */
  protected abstract pageTitle: string | RegExp;
  /** Ready selector indicating the page has fully rendered and is ready for interaction. */
  protected abstract pageReadySelector: string;

  /**
   * Constructs a new BasePage instance.
   *
   * @param pageActions - Active PageActions instance.
   */
  constructor(pageActions: PageActions) {
    this.pageActions = pageActions;
    this.ui = new UIActions(pageActions);
    this.assertUtils = new AssertUtils();
    this.expectUtils = new ExpectUtils(pageActions);
    this.waitUtils = new WaitActions(pageActions);

    Logger.debug(`${this.constructor.name} initialized`);
  }

  /**
   * Retrieves the active Playwright Page instance.
   *
   * @returns {Page} Active Playwright Page instance.
   */
  protected get page(): Page {
    return this.pageActions.getPage();
  }

  /**
   * Resolves a Playwright Locator for a CSS or XPath selector string.
   *
   * @param {string} selector - CSS or XPath selector string.
   * @returns {Locator} Resolved Playwright Locator instance.
   */
  protected locator(selector: string): Locator {
    return LocatorHelper.getLocator(this.pageActions, selector);
  }

  /**
   * Resolves a Playwright Locator for an element containing specific text.
   *
   * @param {string | RegExp} text - Target text pattern to locate.
   * @returns {Locator} Resolved Playwright Locator instance.
   */
  protected locatorByText(text: string | RegExp): Locator {
    return LocatorHelper.getLocatorByText(this.pageActions, text);
  }

  /**
   * Resolves a Playwright Locator for an element matching a specific ARIA role.
   *
   * @param {string} role - Target ARIA role.
   * @param {Object} [options] - Additional options for locating the element.
   * @param {string | RegExp} [options.name] - Accessible name of the element.
   * @returns {Locator} Resolved Playwright Locator instance.
   */
  protected locatorByRole(
    role: 'button' | 'link' | 'textbox' | 'heading' | 'img' | 'list' | 'listitem',
    options?: { name?: string | RegExp }
  ): Locator {
    return LocatorHelper.getLocatorByRole(this.pageActions, role, options);
  }

  /**
   * Navigates to the page URL and waits for page ready state.
   *
   * @returns {Promise<void>} A promise resolving when navigation and page ready checks complete.
   */
  public async navigate(): Promise<void> {
    const pageName = this.constructor.name;
    await StepRunner.run(`${pageName} - navigation`, async () => {
      await this.pageActions.gotoURL(this.pageUrl, pageName);
      await this.waitUtils.waitForPageLoad();
      await this.waitUtils.waitForPageReady(this.pageReadySelector);
    });
  }

  /**
   * Verifies that the page title matches the expected title pattern.
   *
   * @returns {Promise<void>} A promise resolving when title verification completes.
   */
  public async verifyPageLoaded(): Promise<void> {
    const pageName = this.constructor.name;
    await StepRunner.run(`${pageName} - title verification`, async () => {
      await this.expectUtils.expectPageToHaveTitle(
        this.pageTitle,
        `${pageName} title verification`,
        'Page title did not match expected value'
      );
    });
  }

  /**
   * Reloads the active page and waits for page ready state.
   *
   * @returns {Promise<void>} A promise resolving when reload and page ready checks complete.
   */
  public async reload(): Promise<void> {
    await this.pageActions.reloadPage();
    await this.waitUtils.waitForPageLoad();
    await this.waitUtils.waitForPageReady(this.pageReadySelector);
  }
}
