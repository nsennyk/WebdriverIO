const { base: TIMEOUTS } = require('./constants/timeouts');

/**
 * Base page — shared helpers and shared UI elements common to every page object.
 */
class Page {
  /**
   * The header's login/profile button - present on every page, shared between LoginPage
   * (click to open the login form) and DashboardPage (click to open the account/logout menu,
   * or read its icon to tell whether anyone is logged in).
   */
  get headerAuthButton() {
    return $('.profile-btn-main-page');
  }

  /** Navigates to a path relative to baseUrl. */
  open({ path = '/' } = {}) {
    return browser.url(path);
  }

  /**
   * Resolves whether an element is displayed within `timeout`, without throwing if it never
   * appears - for state checks where "not there" is a valid, expected outcome.
   */
  async isDisplayed({ selector, timeout = TIMEOUTS.DEFAULT_TIMEOUT }) {
    const el = await $(selector);
    try {
      await el.waitForDisplayed({ timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reactive/masked inputs (e.g. the login form's phone-mask directive) don't reliably react to
   * setValue()'s fast clear+insert - it can land before the field's JS is even wired up, or get
   * silently swallowed by the mask. Real keystrokes via browser.keys() fire the native events
   * those directives listen for, so use this for any field backed by such behaviour.
   */
  async typeText({ element, text }) {
    await element.waitForClickable();
    await element.click();
    await browser.keys(text.split(''));
  }
}

module.exports = Page;
