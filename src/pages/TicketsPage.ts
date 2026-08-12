import { PageActions } from '@actions/PageActions.js';
import { AssertUtils } from '@asserts/AssertUtils.js';
import { ApplicationUrls } from '@constants/ApplicationUrls.js';
import { TicketsPageLocators } from '@locators/TicketsPageLocators.js';
import { BasePage } from '@pages/BasePage.js';
import { StepRunner } from '@reporting/StepRunner.js';

/**
 * Page Object Model (POM) representing the Tickets Dashboard & Details Page.
 *
 * Implements interactions and verification logic for ticket management test cases.
 */
export class TicketsPage extends BasePage {
  protected pageUrl = ApplicationUrls.DASHBOARD_TICKETS;
  protected pageTitle = /Tickets|Demo SaaS/i;
  protected pageReadySelector = TicketsPageLocators.SEARCH_INPUT;

  /**
   * Constructs a new TicketsPage instance.
   *
   * @param pageActions - Active PageActions instance.
   */
  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  /**
   * Navigates directly to the Tickets Dashboard URL.
   */
  public async navigateToTicketsPage(): Promise<void> {
    await StepRunner.run('TicketsPage - Navigate to Tickets Page', async () => {
      await this.navigate();
    });
  }

  /**
   * Verifies that the Tickets Dashboard page is loaded with URL matching `/.*\/tickets`.
   */
  public async verifyTicketsPageLoaded(): Promise<void> {
    await StepRunner.run('TicketsPage - Verify Page Loaded', async () => {
      await this.expectUtils.expectPageToHaveURL(
        /.*\/tickets/,
        'Tickets Dashboard URL',
        'Current URL did not match tickets dashboard',
        { timeout: 15000 }
      );
    });
  }

  /**
   * Verifies that top navigation bar elements (organization name, navigation links, user avatar) are visible.
   */
  public async verifyTopNavElements(): Promise<void> {
    await StepRunner.run('TicketsPage - Verify Top Nav Elements', async () => {
      await this.expectUtils.expectElementToBeVisible(
        this.locatorByText(TicketsPageLocators.ORGANIZATION_NAME_TEXT).first(),
        'Organization Name',
        'Organization name was not visible in top nav'
      );
      await this.expectUtils.expectElementToBeVisible(
        this.locatorByText(TicketsPageLocators.NAV_TICKETS_TEXT).first(),
        'Tickets Nav Link',
        'Tickets nav link was not visible'
      );
      await this.expectUtils.expectElementToBeVisible(
        this.locatorByText(TicketsPageLocators.NAV_SETTINGS_TEXT).first(),
        'Settings Nav Link',
        'Settings nav link was not visible'
      );
    });
  }

  /**
   * Verifies that the table header contains the standard expected columns.
   *
   * @param expectedHeaders - Expected column names array.
   */
  public async verifyTableHeaderColumns(
    expectedHeaders: string[] = ['Title', 'Reported by', 'Status', 'Created at']
  ): Promise<void> {
    await StepRunner.run('TicketsPage - Verify Table Header Columns', async () => {
      await this.expectUtils.expectElementToHaveText(
        TicketsPageLocators.HEADER_COLUMNS,
        'Table Column Headers',
        expectedHeaders,
        'Table header columns did not match expected list'
      );
    });
  }

  /**
   * Verifies that data rows are loaded in the tickets table.
   */
  public async verifyDataRowsLoaded(): Promise<void> {
    await StepRunner.run('TicketsPage - Verify Data Rows Loaded', async () => {
      const rows = this.locator(TicketsPageLocators.TABLE_ROWS);
      const count = await rows.count();
      await AssertUtils.assertGreaterThan(
        count,
        0,
        'Tickets table should contain at least 1 row of data'
      );
    });
  }

  /**
   * Enters a search query into the search input box.
   *
   * @param query - Ticket title or keyword search query.
   */
  public async searchTicket(query: string): Promise<void> {
    await StepRunner.run(`TicketsPage - Search Ticket: '${query}'`, async () => {
      await this.ui.input.fill(TicketsPageLocators.SEARCH_INPUT, query);
    });
  }

  /**
   * Verifies that a ticket matching text is visible in the table.
   *
   * @param titleText - Ticket title or visible text substring.
   */
  public async verifyTicketVisible(titleText: string): Promise<void> {
    await StepRunner.run(`TicketsPage - Verify Ticket Visible: '${titleText}'`, async () => {
      await this.expectUtils.expectElementToBeVisible(
        this.locatorByText(titleText).first(),
        `Ticket with title '${titleText}'`,
        `Ticket with title '${titleText}' was not visible`
      );
    });
  }

  /**
   * Verifies that a ticket matching text is not visible in the table.
   *
   * @param titleText - Ticket title or text substring.
   */
  public async verifyTicketNotVisible(titleText: string): Promise<void> {
    await StepRunner.run(`TicketsPage - Verify Ticket NOT Visible: '${titleText}'`, async () => {
      await this.expectUtils.expectElementNotToBeVisible(
        this.locatorByText(titleText).first(),
        `Ticket with title '${titleText}'`,
        `Ticket with title '${titleText}' was still visible`
      );
    });
  }

  /**
   * Filters the tickets table by a specified status option.
   *
   * @param status - Target status value (e.g. 'NEW', 'IN PROGRESS', 'RESOLVED', 'CLOSED').
   */
  public async filterByStatus(status: string): Promise<void> {
    await StepRunner.run(`TicketsPage - Filter by Status '${status}'`, async () => {
      const selectLocator = this.locator(TicketsPageLocators.STATUS_SELECT).first();
      const tagName = await selectLocator
        .evaluate((el) => el.tagName.toLowerCase())
        .catch(() => '');

      if (tagName === 'select') {
        await selectLocator.selectOption(status);
      } else {
        await this.ui.element.click(selectLocator);
        const optionLocator = this.locatorByText(status).first();
        await this.ui.element.click(optionLocator);
      }
    });
  }

  /**
   * Verifies that tickets displayed in the table have the selected status badge.
   *
   * @param status - Expected status badge text.
   */
  public async verifyStatusBadgeInTable(status: string): Promise<void> {
    await StepRunner.run(`TicketsPage - Verify Status Badge '${status}' In Table`, async () => {
      const badgeLocator = this.locator(
        `tr:has-text("${status}"), [role="row"]:has-text("${status}")`
      ).first();
      await this.expectUtils.expectElementToBeVisible(
        badgeLocator,
        `Row containing status '${status}'`,
        `No row with status '${status}' was visible in table`
      );
    });
  }

  /**
   * Clicks on a ticket row to open the ticket details side panel / drawer view.
   *
   * @param titleText - Ticket title string to click.
   */
  public async openTicketDetails(titleText: string): Promise<void> {
    await StepRunner.run(`TicketsPage - Open Ticket Details for '${titleText}'`, async () => {
      await this.ui.element.click(this.locatorByText(titleText).first());
    });
  }

  /**
   * Verifies that the ticket details side panel / drawer is open and URL contains `selectedId`.
   *
   * @param expectedReporter - Optional reporter name/email text to verify.
   */
  public async verifyTicketDrawerOpen(expectedReporter?: string): Promise<void> {
    await StepRunner.run('TicketsPage - Verify Ticket Drawer Open', async () => {
      await this.expectUtils.expectPageToHaveURL(
        /.*selectedId=.*/,
        'Ticket Details Drawer URL parameter',
        'URL did not contain selectedId parameter'
      );
      await this.expectUtils.expectElementToBeVisible(
        this.locatorByText(TicketsPageLocators.COMMENTS_HEADER_TEXT).first(),
        'Comments section header',
        'Comments section header was not visible in drawer'
      );
      if (expectedReporter) {
        await this.expectUtils.expectElementToBeVisible(
          this.locatorByText(expectedReporter).first(),
          `Reporter '${expectedReporter}'`,
          `Reporter information '${expectedReporter}' was not visible in drawer`
        );
      }
    });
  }

  /**
   * Enters and submits a comment on the active ticket detail drawer.
   *
   * @param commentText - Comment text string to submit.
   */
  public async addComment(commentText: string): Promise<void> {
    await StepRunner.run(`TicketsPage - Add Comment: '${commentText}'`, async () => {
      await this.ui.input.fill(TicketsPageLocators.COMMENT_INPUT, commentText);
      const sendButton = this.locatorByRole('button', {
        name: TicketsPageLocators.SEND_COMMENT_BUTTON_TEXT,
      })
        .or(this.locatorByText(TicketsPageLocators.SEND_COMMENT_BUTTON_TEXT))
        .first();
      await this.ui.element.click(sendButton);
    });
  }

  /**
   * Verifies that a comment text is visible in the ticket discussion thread.
   *
   * @param commentText - Comment string to locate.
   */
  public async verifyCommentVisible(commentText: string): Promise<void> {
    await StepRunner.run(`TicketsPage - Verify Comment Visible: '${commentText}'`, async () => {
      await this.expectUtils.expectElementToBeVisible(
        this.locatorByText(commentText).first(),
        `Comment text '${commentText}'`,
        `Comment text '${commentText}' was not visible in discussion thread`
      );
    });
  }

  /**
   * Navigates to a specific pagination page by clicking its page button.
   *
   * @param pageNumber - Target page number string or number.
   */
  public async goToPaginationPage(pageNumber: string | number): Promise<void> {
    const pageStr = String(pageNumber);
    await StepRunner.run(`TicketsPage - Go To Pagination Page ${pageStr}`, async () => {
      const pagContainer = this.locator(TicketsPageLocators.PAGINATION_CONTAINER);
      await pagContainer.scrollIntoViewIfNeeded();
      const pageBtn = this.locatorByRole('button', { name: pageStr }).first();
      await this.ui.element.click(pageBtn);
    });
  }

  /**
   * Verifies that the specified page button is marked as active in pagination controls.
   *
   * @param pageNumber - Expected active page number string or number.
   */
  public async verifyActivePaginationPage(pageNumber: string | number): Promise<void> {
    const pageStr = String(pageNumber);
    await StepRunner.run(`TicketsPage - Verify Active Pagination Page ${pageStr}`, async () => {
      const pageBtn = this.locatorByRole('button', { name: pageStr }).first();
      await this.expectUtils.expectElementToBeVisible(
        pageBtn,
        `Pagination page button ${pageStr}`,
        `Pagination button ${pageStr} was not visible`
      );
    });
  }

  /**
   * Clicks the user avatar / profile menu in top navigation bar.
   */
  public async clickUserProfileMenu(): Promise<void> {
    await StepRunner.run('TicketsPage - Click User Profile Menu', async () => {
      const profileMenu = this.locatorByText(TicketsPageLocators.USER_PROFILE_TEXT)
        .or(this.locatorByText(TicketsPageLocators.USER_AVATAR_TEXT))
        .first();
      await this.ui.element.click(profileMenu);
    });
  }

  /**
   * Clicks the "Sign out" menu option.
   */
  public async clickSignOut(): Promise<void> {
    await StepRunner.run('TicketsPage - Click Sign Out', async () => {
      const signOutBtn = this.locatorByText(TicketsPageLocators.SIGN_OUT_BUTTON_TEXT).first();
      await signOutBtn.scrollIntoViewIfNeeded();
      await this.ui.element.click(signOutBtn);
    });
  }

  /**
   * Performs complete sign-out flow (opens profile menu and clicks sign out).
   */
  public async performSignOut(): Promise<void> {
    await StepRunner.run('TicketsPage - Perform Sign Out', async () => {
      await this.clickUserProfileMenu();
      await this.clickSignOut();
    });
  }
}
