import { Logger } from '@logger/Logger.js';
import type {
  BrowserContext,
  Frame,
  FrameLocator,
  Locator,
  Page,
  Response,
} from '@playwright/test';

/**
 * Instance-based Page & Context Management class for Playwright test execution.
 *
 * Provides controlled access to page state, browser navigation, tab/window switching,
 * frame interactions, screenshots, dialog handling, and session cleanup.
 */
export class PageActions {
  private page: Page;
  private context: BrowserContext;
  private storedPage: Page | null = null;

  /**
   * Constructs a new PageActions instance.
   *
   * @param page - Active Playwright Page object.
   * @param context - Active Playwright BrowserContext object.
   */
  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
    Logger.debug(`PageActions instance created`);
  }

  /**
   * Returns the current active Playwright Page object.
   *
   * @returns Active Playwright Page.
   * @throws Error if the page has already been closed.
   */
  public getPage(): Page {
    if (typeof this.page.isClosed === 'function' && this.page.isClosed()) {
      throw new Error('Cannot access the page: the Playwright page has already been closed.');
    }
    return this.page;
  }

  /**
   * Replaces the current active page reference with a new Page instance.
   *
   * @param pageInstance - Target Playwright Page instance.
   * @throws Error if the provided page has already been closed.
   */
  public setPage(pageInstance: Page): void {
    if (typeof pageInstance.isClosed === 'function' && pageInstance.isClosed()) {
      throw new Error('Cannot set the page: the provided Playwright page has already been closed.');
    }
    Logger.debug(`Switching to page: ${pageInstance.url()}`);
    this.page = pageInstance;
  }

  /**
   * Returns the current BrowserContext object.
   *
   * @returns Active Playwright BrowserContext.
   */
  public getContext(): BrowserContext {
    return this.context;
  }

  /**
   * Replaces the current BrowserContext reference.
   *
   * @param contextInstance - Target BrowserContext object.
   */
  public setContext(contextInstance: BrowserContext): void {
    this.context = contextInstance;
  }

  /**
   * Total number of open pages within the current BrowserContext.
   *
   * @returns Number of open pages.
   */
  public get pageCount(): number {
    return this.context.pages().length;
  }

  /**
   * Navigates the active page to a specified URL with diagnostic logging.
   *
   * @param url - Destination web URL string.
   * @param description - Human-readable description of navigation target.
   * @returns Promise resolving when navigation completes.
   * @throws Error if page is closed or navigation fails.
   */
  public async gotoURL(url: string, description: string): Promise<void> {
    try {
      Logger.info(`Navigating to ${description}: ${url}`);
      if (typeof this.page.isClosed === 'function' && this.page.isClosed()) {
        throw new Error(
          'Cannot navigate to the provided URL because the Playwright page has already been closed.'
        );
      }
      await this.page.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });
    } catch (error) {
      Logger.error(`Failed to navigate to ${description}: ${error}`);
      throw new Error(`Failed to navigate to the URL:${description} Error: ${error}`);
    }
  }

  /**
   * Reloads the active page.
   *
   * @returns Promise resolving when reload completes.
   */
  public async reloadPage(): Promise<void> {
    Logger.info('Reloading page');
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  /**
   * Navigates back to the previous page in history.
   *
   * @returns Promise resolving when navigation completes.
   */
  public async goBack(): Promise<void> {
    Logger.info('Navigating back');
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
  }

  /**
   * Navigates forward to the next page in history.
   *
   * @returns Promise resolving when navigation completes.
   */
  public async goForward(): Promise<void> {
    Logger.info('Navigating forward');
    await this.page.goForward({ waitUntil: 'domcontentloaded' });
  }

  /**
   * Retrieves the current URL string of the active page.
   *
   * @returns Promise resolving to active page URL.
   */
  public async getCurrentUrl(): Promise<string> {
    Logger.info('Getting current page URL');
    return this.getPage().url();
  }

  /**
   * Retrieves the current page title string.
   *
   * @returns Promise resolving to page title.
   */
  public async getTitle(): Promise<string> {
    Logger.info('Getting page title');
    return await this.getPage().title();
  }

  /**
   * Retrieves the full HTML content string of the active page.
   *
   * @returns Promise resolving to HTML markup.
   */
  public async getPageContent(): Promise<string> {
    Logger.info('Getting page content');
    return await this.getPage().content();
  }

  /**
   * Waits for the active page URL to match the supplied pattern.
   *
   * @param urlPattern - Target URL string or RegExp pattern.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when URL matches.
   */
  public async waitForNavigation(
    urlPattern: string | RegExp,
    timeout: number = 30000
  ): Promise<void> {
    Logger.info(`Waiting for navigation to: ${urlPattern}`);
    await this.page.waitForURL(urlPattern, { timeout });
  }

  /**
   * Waits for page to reach a specific load state.
   *
   * @param state - Target load state ('domcontentloaded' | 'load' | 'networkidle').
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving when state is reached.
   */
  public async waitForLoadState(
    state: 'domcontentloaded' | 'load' | 'networkidle' = 'networkidle',
    timeout: number = 30000
  ): Promise<void> {
    Logger.info(`Waiting for page load state: ${state}`);
    await this.getPage().waitForLoadState(state, { timeout });
  }

  /**
   * Waits for a matching API response URL or regular expression.
   *
   * @param urlOrRegExp - Target URL string or RegExp.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving to Playwright Response object.
   */
  public async waitForResponse(
    urlOrRegExp: string | RegExp,
    timeout: number = 30000
  ): Promise<Response> {
    Logger.info(`Waiting for response matching: ${urlOrRegExp}`);
    return await this.getPage().waitForResponse(urlOrRegExp, { timeout });
  }

  /**
   * Resizes the active page viewport dimensions.
   *
   * @param width - Viewport width in pixels.
   * @param height - Viewport height in pixels.
   * @returns Promise resolving when viewport is resized.
   */
  public async resizePage(width: number, height: number): Promise<void> {
    Logger.info(`Resizing page to ${width}x${height}`);
    await this.getPage().setViewportSize({ width, height });
  }

  /**
   * Opens a new page in the current BrowserContext.
   *
   * @returns Promise resolving to newly opened Page object.
   */
  public async openNewPage(): Promise<Page> {
    Logger.info('Opening new page');
    return await this.context.newPage();
  }

  /**
   * Switches active page reference to an opened page by its 1-based index.
   *
   * @param winNum - 1-based page window index.
   * @returns Promise resolving when focus switches.
   * @throws Error if target window index does not exist within timeout.
   */
  public async switchPage(winNum: number): Promise<void> {
    const timeout = 10000;
    const startTime = Date.now();

    Logger.info(`Switching to page ${winNum}`);

    while (this.pageCount < winNum && Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (this.pageCount < winNum) {
      throw new Error(
        `Page ${winNum} not found after ${timeout}ms. Current pages: ${this.pageCount}`
      );
    }

    const pageInstance = this.context.pages()[winNum - 1];
    if (!pageInstance) {
      throw new Error(`Page ${winNum} not found in browser context`);
    }
    await pageInstance.waitForLoadState('domcontentloaded');
    this.setPage(pageInstance);

    Logger.info(`Switched to page ${winNum}: ${pageInstance.url()}`);
  }

  /**
   * Clicks an element that opens a new page and switches focus to it.
   *
   * @param selector - Selector for element opening the new tab/window.
   * @returns Promise resolving when new page is focused.
   */
  public async switchPageAction(selector: string): Promise<void> {
    this.storedPage = this.page;
    Logger.info(`Clicking element to open new page: ${selector}`);

    const [newPage] = await Promise.all([
      this.context.waitForEvent('page'),
      this.page.locator(selector).click(),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    this.setPage(newPage);
    Logger.info(`Switched to new page: ${newPage.url()}`);
  }

  /**
   * Switches focus back to stored parent page or the default first context page.
   *
   * @returns Promise resolving when focus returns to default page.
   */
  public async switchToDefaultPage(): Promise<void> {
    Logger.info('Switching to default page');

    if (this.storedPage) {
      await this.storedPage.bringToFront();
      this.setPage(this.storedPage);
      this.storedPage = null;
      return;
    }

    const defaultPage = this.context.pages()[0];
    if (defaultPage) {
      await defaultPage.bringToFront();
      this.setPage(defaultPage);
    }
  }

  /**
   * Closes active page or a specific page by 1-based index.
   *
   * @param winNum - Optional 1-based page window index.
   * @returns Promise resolving when page is closed.
   */
  public async closePage(winNum?: number): Promise<void> {
    Logger.info(winNum ? `Closing page ${winNum}` : 'Closing active page');
    if (!winNum) {
      await this.page?.close();
      return;
    }

    const totalPages = this.pageCount;
    const pageToClose = this.context.pages()[winNum - 1];

    await pageToClose?.close();

    if (totalPages > 1) {
      await this.switchToDefaultPage();
    }
  }

  /**
   * Returns a FrameLocator for performing operations inside an iframe.
   *
   * @param selector - Selector for target iframe element.
   * @returns Playwright FrameLocator instance.
   * @throws Error if page is closed.
   */
  public getFrameLocator(selector: string): FrameLocator {
    Logger.info(`Getting frame locator: ${selector}`);
    if (typeof this.page.isClosed === 'function' && this.page.isClosed()) {
      throw new Error('Cannot get frame locator: the Playwright page has already been closed.');
    }
    return this.getPage().frameLocator(selector);
  }

  /**
   * Returns a Frame object matching specified frame name or URL pattern.
   *
   * @param frameSelector - Frame name string or options matching name/url.
   * @returns Matching Playwright Frame object or null if not found.
   */
  public getFrame(frameSelector: string | { name?: string; url?: string | RegExp }): Frame | null {
    Logger.info(
      `Getting frame: ${typeof frameSelector === 'string' ? frameSelector : JSON.stringify(frameSelector)}`
    );
    if (typeof this.page.isClosed === 'function' && this.page.isClosed()) {
      throw new Error('Cannot get frame: the Playwright page has already been closed.');
    }
    return this.getPage().frame(frameSelector);
  }

  /**
   * Switches active page reference to specified iframe content frame.
   *
   * Stores parent page to enable returning via `switchToDefaultPage()`.
   *
   * @param selector - Selector for target iframe element.
   * @returns Promise resolving when frame focus completes.
   * @throws Error if iframe is detached or content is inaccessible.
   */
  public async switchToFrameAsPage(selector: string): Promise<void> {
    Logger.info(`Switching to iframe: ${selector}`);
    const iframeLocator: Locator = this.getPage().locator(selector);
    await iframeLocator.waitFor({ state: 'attached', timeout: 10000 });

    const iframeHandle = await iframeLocator.elementHandle();
    const iframeContent = await iframeHandle?.contentFrame();

    if (!iframeContent) {
      throw new Error(`Could not get iframe content for selector: ${selector}`);
    }

    if (iframeContent.isDetached()) {
      throw new Error(`Target iframe is detached for selector: ${selector}`);
    }

    this.storedPage = this.page;
    this.page = iframeContent as unknown as Page;
  }

  /**
   * Clears cookies and local/session storage for the active session.
   *
   * @returns Promise resolving when session data is cleared.
   */
  public async clearSession(): Promise<void> {
    Logger.info('Clearing session cookies and storage');
    await this.context.clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Pauses active test execution for interactive debugging.
   *
   * @returns Promise resolving when debugging session resumes.
   */
  public async pauseExecution(): Promise<void> {
    Logger.warn('Test execution paused');
    // eslint-disable-next-line playwright/no-page-pause
    await this.page?.pause();
  }

  /**
   * Captures a screenshot of the active page.
   *
   * @param path - Optional file save path string.
   * @param fullPage - If true, captures full scrollable page (defaults to true).
   * @returns Promise resolving to screenshot image Buffer.
   */
  public async takeScreenshot(path?: string, fullPage: boolean = true): Promise<Buffer> {
    Logger.info(path ? `Taking screenshot: ${path}` : 'Taking screenshot');
    return await this.getPage().screenshot({
      ...(path ? { path } : {}),
      fullPage,
      type: 'png',
    });
  }

  /**
   * Captures a screenshot of a specific DOM element.
   *
   * @param selector - Selector for target DOM element.
   * @param path - Optional file save path string.
   * @returns Promise resolving to element screenshot image Buffer.
   */
  public async takeElementScreenshot(selector: string, path?: string): Promise<Buffer> {
    Logger.info(
      path
        ? `Taking element screenshot of ${selector}: ${path}`
        : `Taking element screenshot of ${selector}`
    );
    return await this.getPage()
      .locator(selector)
      .screenshot(path ? { path } : {});
  }

  /**
   * Auto-handles the next browser dialog (alert, confirm, prompt).
   *
   * @param action - Action to perform ('accept' | 'dismiss').
   * @param promptText - Optional text to submit with prompt.
   */
  public handleDialog(action: 'accept' | 'dismiss' = 'accept', promptText?: string): void {
    Logger.info(
      `Setting up dialog handler action: ${action}${promptText ? ` with prompt text: ${promptText}` : ''}`
    );
    this.getPage().once('dialog', async (dialog) => {
      if (action === 'accept') {
        await dialog.accept(promptText);
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Registers a browser console message listener callback.
   *
   * @param callback - Function receiving console message object.
   */
  public onConsole(callback: (msg: any) => void): void {
    Logger.info('Registering browser console listener');
    this.getPage().on('console', callback);
  }

  /**
   * Waits for a browser console message matching text or pattern.
   *
   * @param pattern - Expected console message string or RegExp.
   * @param timeout - Maximum timeout in milliseconds (defaults to 30000ms).
   * @returns Promise resolving to matched console message text.
   */
  public async waitForConsoleMessage(
    pattern: string | RegExp,
    timeout: number = 30000
  ): Promise<string> {
    Logger.info(`Waiting for console message matching: ${pattern}`);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timed out after ${timeout}ms waiting for console message: ${pattern}`));
      }, timeout);

      const handler = (msg: any) => {
        const text = msg.text();
        const matches = typeof pattern === 'string' ? text.includes(pattern) : pattern.test(text);
        if (matches) {
          clearTimeout(timer);
          this.getPage().off('console', handler);
          resolve(text);
        }
      };

      this.getPage().on('console', handler);
    });
  }

  /**
   * Scrolls to the bottom of the page.
   *
   * @returns Promise resolving when scroll completes.
   */
  public async scrollToBottom(): Promise<void> {
    Logger.info('Scrolling to bottom of page');
    await this.getPage().evaluate('window.scrollTo(0, document.body.scrollHeight)');
  }

  /**
   * Scrolls to the top of the page.
   *
   * @returns Promise resolving when scroll completes.
   */
  public async scrollToTop(): Promise<void> {
    Logger.info('Scrolling to top of page');
    await this.getPage().evaluate('window.scrollTo(0, 0)');
  }

  /**
   * Scrolls page by a relative horizontal and vertical pixel offset.
   *
   * @param x - Horizontal offset in pixels.
   * @param y - Vertical offset in pixels.
   * @returns Promise resolving when scroll completes.
   */
  public async scrollBy(x: number, y: number): Promise<void> {
    Logger.info(`Scrolling page by offset X:${x}, Y:${y}`);
    await this.getPage().evaluate(
      ([xOffset, yOffset]) => {
        (globalThis as unknown as { scrollBy: (x: number, y: number) => void }).scrollBy(
          xOffset!,
          yOffset!
        );
      },
      [x, y] as [number, number]
    );
  }

  /**
   * Retrieves an item from browser localStorage by key.
   *
   * @param key - LocalStorage item key name.
   * @returns Promise resolving to item value or null if absent.
   */
  public async getLocalStorageItem(key: string): Promise<string | null> {
    Logger.info(`Getting localStorage item: ${key}`);
    return await this.getPage().evaluate((k) => {
      return (
        globalThis as unknown as { localStorage: { getItem: (k: string) => string | null } }
      ).localStorage.getItem(k);
    }, key);
  }

  /**
   * Sets an item in browser localStorage by key and value.
   *
   * @param key - LocalStorage item key name.
   * @param value - String value to store.
   * @returns Promise resolving when item is set.
   */
  public async setLocalStorageItem(key: string, value: string): Promise<void> {
    Logger.info(`Setting localStorage item: ${key}`);
    await this.getPage().evaluate(
      ([k, v]) => {
        (
          globalThis as unknown as { localStorage: { setItem: (k: string, v: string) => void } }
        ).localStorage.setItem(k!, v!);
      },
      [key, value] as [string, string]
    );
  }
}
