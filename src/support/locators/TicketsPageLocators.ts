/**
 * Selectors and locator strategies for the Tickets Dashboard & Details page.
 */
export const TicketsPageLocators = {
  ORGANIZATION_NAME_TEXT: 'DemoOrganization',
  NAV_TICKETS_TEXT: 'Tickets',
  NAV_SETTINGS_TEXT: 'Settings',
  USER_AVATAR_TEXT: 'SR',
  USER_PROFILE_TEXT: 'Subramanyam Reddy',
  HEADER_COLUMNS: 'th, [role="columnheader"]',
  TABLE_ROWS: 'tbody tr, [role="row"]',
  SEARCH_INPUT: 'input[placeholder*="Search"]',
  STATUS_SELECT: 'select, [data-mantine-select], input[placeholder*="Status"]',
  COMMENT_INPUT: 'input[placeholder*="comment"], textarea[placeholder*="Add a comment"]',
  SEND_COMMENT_BUTTON_TEXT: 'Send',
  COMMENTS_HEADER_TEXT: 'Comments',
  PAGINATION_CONTAINER: '.mantine-Pagination-root, nav[aria-label="Pagination"]',
  SIGN_OUT_BUTTON_TEXT: 'Sign out',
} as const;
