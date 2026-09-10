const Page = require('./page');
const { base: TIMEOUTS } = require('./constants/timeouts');

/**
 * Login page: opens the header's login form, submits phone + password, and reports the
 * validation error (if any). Path is '/' - same as the base Page default, so open() isn't
 * overridden here.
 */
class LoginPage extends Page {
  get phoneInput() {
    return $('#phone');
  }

  get passwordInput() {
    return $('input[type="password"]');
  }

  get submitButton() {
    return $('button.form-btn');
  }

  get errorText() {
    return $('.error-text');
  }

  /** Opens the login form via the header button and waits for it to render. */
  async openLoginForm() {
    await this.headerAuthButton.waitForClickable();
    await this.headerAuthButton.click();
    await this.phoneInput.waitForDisplayed();
  }

  /** Opens the login form and submits the given credentials. */
  async login({ phone, password }) {
    await this.openLoginForm();
    await this.typeText({ element: this.phoneInput, text: phone });
    await this.typeText({ element: this.passwordInput, text: password });
    await this.submitButton.waitForClickable();
    await this.submitButton.click();
    await this.waitForLoginResult();
  }

  /**
   * Waits until submit actually resolves one way or the other - either the modal closes
   * (success) or a validation error appears (failure). Without this, callers checking
   * login state right after login() race the async response and read stale UI.
   */
  async waitForLoginResult() {
    await browser.waitUntil(
      async () => {
        const modalClosed = !(await this.phoneInput.isExisting());
        const hasError = await this.errorText.isDisplayed().catch(() => false);
        return modalClosed || hasError;
      },
      {
        timeout: TIMEOUTS.LOGIN_STATE_TIMEOUT,
        timeoutMsg: 'login form neither closed nor showed a validation error after submit',
      },
    );
  }

  /** @returns {Promise<string|null>} the validation message, or null if none appeared */
  async getErrorText() {
    try {
      await this.errorText.waitForDisplayed({ timeout: TIMEOUTS.LOGIN_STATE_TIMEOUT });
      return await this.errorText.getText();
    } catch {
      return null;
    }
  }
}

module.exports = new LoginPage();
