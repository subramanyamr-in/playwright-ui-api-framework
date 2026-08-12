/**
 * Selectors and locator strategies for the Login / Sign-In page.
 */
export const LoginPageLocators = {
  EMAIL_INPUT: 'input[name="email"]',
  PASSWORD_INPUT: 'input[name="password"]',
  LOGIN_BUTTON: 'button[type="submit"]',
  FORGOT_PASSWORD_LINK_TEXT: 'Forgot password?',
  SIGN_UP_LINK_TEXT: 'Sign up',
  ERROR_ALERT: '[role="alert"], .mantine-Notification-root',
  CREATE_ACCOUNT_TEXT: 'Create your account',
  USER_PROFILE_TEXT: 'Subramanyam Reddy',
} as const;
