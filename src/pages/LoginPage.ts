import { PageActions } from '@actions/PageActions.js';
import { AssertUtils } from '@asserts/AssertUtils.js';
import { ApplicationUrls } from '@constants/ApplicationUrls.js';
import { LoginPageLocators } from '@locators/LoginPageLocators.js';
import { BasePage } from '@pages/BasePage.js';
import { StepRunner } from '@reporting/StepRunner.js';

/**
 * Page Object Model (POM) representing the Sign-In / Login Page.
 *
 * Implements interactions and verification logic for user authentication test cases.
 */
export class LoginPage extends BasePage {
  protected pageUrl = ApplicationUrls.SIGN_IN;
  protected pageTitle = /Sign in/i;
  protected pageReadySelector = LoginPageLocators.EMAIL_INPUT;

  /**
   * Constructs a new LoginPage instance.
   *
   * @param pageActions - Active PageActions instance.
   */
  constructor(pageActions: PageActions) {
    super(pageActions);
  }

  /**
   * Navigates directly to the Sign-In page URL and waits for readiness.
   */
  public async navigateToLoginPage(): Promise<void> {
    await StepRunner.run('LoginPage - Navigate to Login Page', async () => {
      await this.navigate();
    });
  }

  /**
   * Enters the email address into the Email input field.
   *
   * @param email - Target email address string.
   */
  public async enterEmail(email: string): Promise<void> {
    await StepRunner.run(`LoginPage - Enter Email: ${email}`, async () => {
      await this.ui.input.fill(LoginPageLocators.EMAIL_INPUT, email);
    });
  }

  /**
   * Enters the password into the Password input field.
   *
   * @param password - Target password string.
   */
  public async enterPassword(password: string): Promise<void> {
    await StepRunner.run('LoginPage - Enter Password', async () => {
      await this.ui.input.fill(LoginPageLocators.PASSWORD_INPUT, password);
    });
  }

  /**
   * Clicks the "Log in" submit button.
   */
  public async clickLoginButton(): Promise<void> {
    await StepRunner.run('LoginPage - Click Log In Button', async () => {
      await this.ui.element.click(LoginPageLocators.LOGIN_BUTTON);
    });
  }

  /**
   * Performs complete login flow with provided credentials.
   *
   * @param email - Target email address string.
   * @param password - Target password string.
   */
  public async performLogin(email: string, password: string): Promise<void> {
    await StepRunner.run('LoginPage - Perform Login', async () => {
      await this.enterEmail(email);
      await this.enterPassword(password);
      await this.clickLoginButton();
      await this.expectUtils.expectPageToHaveURL(
        /.*\/tickets/,
        'Tickets dashboard after login',
        'Did not navigate to tickets dashboard after login',
        { timeout: 15000 }
      );
    });
  }

  /**
   * Clicks the "Forgot password?" navigation link.
   */
  public async clickForgotPasswordLink(): Promise<void> {
    await StepRunner.run('LoginPage - Click Forgot Password Link', async () => {
      const linkLocator = this.locatorByRole('link', {
        name: LoginPageLocators.FORGOT_PASSWORD_LINK_TEXT,
      });
      await this.ui.element.click(linkLocator);
    });
  }

  /**
   * Clicks the "Sign up" registration link.
   */
  public async clickSignUpLink(): Promise<void> {
    await StepRunner.run('LoginPage - Click Sign Up Link', async () => {
      const linkLocator = this.locatorByRole('link', {
        name: LoginPageLocators.SIGN_UP_LINK_TEXT,
      }).first();
      await this.ui.element.click(linkLocator);
    });
  }

  /**
   * Verifies that the login form elements (email input, password input, login button) are visible.
   */
  public async verifyLoginFormVisible(): Promise<void> {
    await StepRunner.run('LoginPage - Verify Login Form Visible', async () => {
      await this.expectUtils.expectElementToBeVisible(
        LoginPageLocators.EMAIL_INPUT,
        'Email input field',
        'Email input field was not visible'
      );
      await this.expectUtils.expectElementToBeVisible(
        LoginPageLocators.PASSWORD_INPUT,
        'Password input field',
        'Password input field was not visible'
      );
      await this.expectUtils.expectElementToBeVisible(
        LoginPageLocators.LOGIN_BUTTON,
        'Log in button',
        'Log in button was not visible'
      );
    });
  }

  /**
   * Verifies that user remains on the Sign-In page URL.
   */
  public async verifyUrlRemainsSignIn(): Promise<void> {
    await StepRunner.run('LoginPage - Verify URL Remains Sign-In', async () => {
      await this.expectUtils.expectPageToHaveURL(
        /.*\/sign-in/,
        'Sign-in page URL',
        'Current URL did not match sign-in page'
      );
    });
  }

  /**
   * Verifies successful redirection to the Tickets dashboard and user profile visibility.
   *
   * @param userName - Expected user name string (defaults to 'Subramanyam Reddy').
   */
  public async verifyPostLoginDashboard(
    userName: string = LoginPageLocators.USER_PROFILE_TEXT
  ): Promise<void> {
    await StepRunner.run('LoginPage - Verify Post-Login Dashboard', async () => {
      await this.expectUtils.expectPageToHaveURL(
        /.*\/tickets/,
        'Tickets dashboard URL',
        'URL did not match tickets dashboard'
      );
      await this.expectUtils.expectElementToBeVisible(
        this.locatorByText(userName),
        `User profile '${userName}'`,
        `User profile '${userName}' was not visible on post-login dashboard`
      );
    });
  }

  /**
   * Verifies that an authentication error alert or notification is displayed.
   */
  public async verifyErrorMessageVisible(): Promise<void> {
    await StepRunner.run('LoginPage - Verify Error Message Visible', async () => {
      await this.expectUtils.expectElementToBeVisible(
        LoginPageLocators.ERROR_ALERT,
        'Error alert notification',
        'Error alert notification was not visible'
      );
    });
  }

  /**
   * Verifies that the Email and Password input fields are empty.
   */
  public async verifyInputFieldsAreEmpty(): Promise<void> {
    await StepRunner.run('LoginPage - Verify Input Fields Are Empty', async () => {
      const emailValue = await this.ui.input.getValue(LoginPageLocators.EMAIL_INPUT);
      const passwordValue = await this.ui.input.getValue(LoginPageLocators.PASSWORD_INPUT);

      await AssertUtils.assertEquals(
        emailValue,
        '',
        'Email field should be empty before submission'
      );
      await AssertUtils.assertEquals(
        passwordValue,
        '',
        'Password field should be empty before submission'
      );
    });
  }

  /**
   * Verifies the `type` attribute of the Password input field.
   *
   * @param expectedType - Expected attribute type (defaults to 'password').
   */
  public async verifyPasswordFieldType(expectedType: string = 'password'): Promise<void> {
    await StepRunner.run(`LoginPage - Verify Password Field Type '${expectedType}'`, async () => {
      await this.expectUtils.expectElementToHaveAttributeValue(
        LoginPageLocators.PASSWORD_INPUT,
        'type',
        expectedType,
        `Password field attribute 'type' was not equal to '${expectedType}'`
      );
    });
  }

  /**
   * Verifies navigation to the Reset Password page URL.
   */
  public async verifyResetPasswordPageUrl(): Promise<void> {
    await StepRunner.run('LoginPage - Verify Reset Password Page URL', async () => {
      await this.expectUtils.expectPageToHaveURL(
        /.*\/reset-password/,
        'Reset Password page URL',
        'URL did not match reset password page'
      );
    });
  }

  /**
   * Verifies navigation to the Sign-Up page URL and presence of sign-up title.
   */
  public async verifySignUpPageLoaded(): Promise<void> {
    await StepRunner.run('LoginPage - Verify Sign-Up Page Loaded', async () => {
      await this.expectUtils.expectPageToHaveURL(
        /.*\/sign-up/,
        'Sign-Up page URL',
        'URL did not match sign-up page'
      );
      await this.expectUtils.expectElementToBeVisible(
        this.locatorByText(LoginPageLocators.CREATE_ACCOUNT_TEXT),
        'Create your account text',
        'Create your account heading was not visible on sign-up page'
      );
    });
  }
}
