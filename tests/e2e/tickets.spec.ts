import { test } from '@fixtures/UiFixture.js';

const rawEmail = process.env['TEST_USER_EMAIL'] || 'reddysubramanyam24@gmail.com';
const validEmail =
  rawEmail === 'eddysubramanyam24@gmail.com' ? 'reddysubramanyam24@gmail.com' : rawEmail;
const validPassword = process.env['TEST_USER_PASSWORD'] || 'sUbbu#1234';

test.describe('Tickets Dashboard & Details Page E2E Tests', () => {
  test.beforeEach(async ({ loginPage, ticketsPage }) => {
    await loginPage.navigateToLoginPage();
    await loginPage.performLogin(validEmail, validPassword);
    await ticketsPage.verifyTicketsPageLoaded();
  });

  test('TC_TCK_001: Verify Tickets Table Layout & Header Columns', async ({ ticketsPage }) => {
    await ticketsPage.verifyTopNavElements();
    await ticketsPage.verifyTableHeaderColumns(['Title', 'Reported by', 'Status', 'Created at']);
    await ticketsPage.verifyDataRowsLoaded();
  });

  test('TC_TCK_002: Verify Search Ticket by Keyword/Title', async ({ ticketsPage }) => {
    await ticketsPage.searchTicket('Dark mode');
    await ticketsPage.verifyTicketVisible('Dark mode not working');
    await ticketsPage.verifyTicketNotVisible('Auto-logout occurring');
  });

  test('TC_TCK_003: Verify Ticket Status Filter Dropdown', async ({ ticketsPage }) => {
    await ticketsPage.filterByStatus('RESOLVED');
    await ticketsPage.verifyStatusBadgeInTable('RESOLVED');
  });

  test('TC_TCK_004: Verify Ticket Details Side Panel / Drawer View', async ({ ticketsPage }) => {
    await ticketsPage.openTicketDetails('Multi-step form validation issues');
    await ticketsPage.verifyTicketDrawerOpen();
  });

  test('TC_TCK_005: Verify Adding a Comment to a Selected Ticket', async ({ ticketsPage }) => {
    const commentText = `Automated test comment ${Date.now()}`;
    await ticketsPage.openTicketDetails('Multi-step form validation issues');
    await ticketsPage.verifyTicketDrawerOpen();
    await ticketsPage.addComment(commentText);
    await ticketsPage.verifyCommentVisible(commentText);
  });

  test('TC_TCK_006: Verify Pagination Controls (Next/Previous Page)', async ({ ticketsPage }) => {
    await ticketsPage.goToPaginationPage(2);
    await ticketsPage.verifyActivePaginationPage(2);
  });

  test('TC_TCK_007: Verify User Profile Menu & Sign Out Action', async ({
    loginPage,
    ticketsPage,
  }) => {
    await ticketsPage.performSignOut();
    await loginPage.verifyUrlRemainsSignIn();
  });
});
