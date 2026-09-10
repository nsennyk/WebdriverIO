const LoginPage = require('../../pageobjects/login.page');
const DashboardPage = require('../../pageobjects/dashboard.page');
const { base: TEST_DATA } = require('../../pageobjects/constants/testData');

describe('Product search', () => {
  before(async () => {
    await LoginPage.open();
    await LoginPage.login({ phone: process.env.VALID_PHONE, password: process.env.VALID_PASSWORD });
  });

  it('should show a suggestions dropdown when typing a search term', async () => {
    await DashboardPage.searchFor({ term: TEST_DATA.SEARCH_TERM_TENT });

    const suggestions = await DashboardPage.searchSuggestions;
    await expect(suggestions.length).toBeGreaterThan(0);
    await expect(await suggestions[0].isDisplayed()).toBe(true);
    await expect((await suggestions[0].getText()).length).toBeGreaterThan(0);
  });
});
