const LoginPage = require('../../pageobjects/login.page');
const DashboardPage = require('../../pageobjects/dashboard.page');

describe('Account navigation', () => {
  before(async () => {
    await LoginPage.open();
    await LoginPage.login({ phone: process.env.VALID_PHONE, password: process.env.VALID_PASSWORD });
  });

  it('should navigate to the profile page from the account dropdown', async () => {
    await DashboardPage.openProfile();

    await expect(await browser.getUrl()).toContain('/profile');
    await expect(await browser.getTitle()).toContain('Профіль');
    await expect(await DashboardPage.accountDropdown.isExisting()).toBe(false);
  });
});
