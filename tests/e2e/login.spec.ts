import { test } from '@fixtures/UiFixture.js';

const validEmail = process.env['TEST_USER_EMAIL'] || 'reddysubramanyam24@gmail.com';
const validPassword = process.env['TEST_USER_PASSWORD'] || 'sUbbu#1234';

test.describe('Authentication Page E2E Tests', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigateToLoginPage();
    await loginPage.verifyLoginFormVisible();
  });

  test('TC_AUTH_001: Verify Successful Login with Valid Credentials', async ({ loginPage }) => {
    await loginPage.performLogin(validEmail, validPassword);
    await loginPage.verifyPostLoginDashboard('Subramanyam Reddy');
  });

  test('TC_AUTH_002: Verify Validation Error on Invalid Email Format', async ({ loginPage }) => {
    await loginPage.enterEmail('invalid-email-format');
    await loginPage.enterPassword(validPassword);
    await loginPage.clickLoginButton();
    await loginPage.verifyUrlRemainsSignIn();
  });

  test('TC_AUTH_003: Verify Error Message on Incorrect Password', async ({ loginPage }) => {
    await loginPage.enterEmail(validEmail);
    await loginPage.enterPassword('WrongPassword#999');
    await loginPage.clickLoginButton();
    await loginPage.verifyErrorMessageVisible();
    await loginPage.verifyUrlRemainsSignIn();
  });

  test('TC_AUTH_004: Verify Required Field Validations on Blank Submission', async ({
    loginPage,
  }) => {
    await loginPage.verifyInputFieldsAreEmpty();
    await loginPage.clickLoginButton();
    await loginPage.verifyUrlRemainsSignIn();
  });

  test('TC_AUTH_005: Verify "Forgot password?" Link Navigation', async ({ loginPage }) => {
    await loginPage.clickForgotPasswordLink();
    await loginPage.verifyResetPasswordPageUrl();
  });

  test('TC_AUTH_006: Verify Navigation to Sign-Up Page via Link', async ({ loginPage }) => {
    await loginPage.clickSignUpLink();
    await loginPage.verifySignUpPageLoaded();
  });

  test('TC_AUTH_007: Verify Password Field Masking & Security', async ({ loginPage }) => {
    await loginPage.verifyPasswordFieldType('password');
    await loginPage.enterPassword(validPassword);
  });
});
