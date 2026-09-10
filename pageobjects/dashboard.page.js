const Page = require('./page');
const { base: TIMEOUTS } = require('./constants/timeouts');

/**
 * Logged-in storefront: login state, account navigation, and product search.
 */
class DashboardPage extends Page {
  get profileIcon() {
    return $('.profile-btn-main-page img');
  }

  get profileLink() {
    return $('a[href="/profile"]');
  }

  get accountDropdown() {
    return $('.profile-menu-dropdown');
  }

  get searchInput() {
    return $('.header-input-main-page');
  }

  get searchSuggestions() {
    return $$('.search-tag');
  }

  /**
   * True once logged in - the header icon swaps from the anonymous user_mp.svg to
   * user_isauth.svg, which is more robust than matching the button text (that becomes the
   * user's real name once logged in).
   */
  async isLoggedIn() {
    const iconSrc = await this.profileIcon.getAttribute('src');
    return (iconSrc || '').includes('user_isauth');
  }

  /** Opens the account dropdown via the header button, then navigates to the profile page. */
  async openProfile() {
    await this.headerAuthButton.click();
    await this.profileLink.waitForClickable();
    await this.profileLink.click();
    await browser.waitUntil(async () => (await browser.getUrl()).includes('/profile'), {
      timeout: TIMEOUTS.DEFAULT_TIMEOUT,
      timeoutMsg: 'navigation to /profile never happened',
    });
  }

  /** Types a search term and waits for the suggestions dropdown to show at least one tag. */
  async searchFor({ term }) {
    await this.typeText({ element: this.searchInput, text: term });
    // the dropdown shows a static "Рекомендації" list the instant the field is focused, then
    // (on its own, backend-debounced timing) swaps in real matches - too timing-dependent to
    // assert relevance against reliably, so just wait for *a* tag to show up. The live re-render
    // can also make the $$() query itself land mid-swap, so retry on any failure here too.
    await browser.waitUntil(
      async () => {
        try {
          return (await this.searchSuggestions).length > 0;
        } catch {
          return false;
        }
      },
      {
        timeout: TIMEOUTS.SEARCH_SUGGESTIONS_TIMEOUT,
        timeoutMsg: `no search suggestions appeared for "${term}"`,
      },
    );
  }
}

module.exports = new DashboardPage();
