const LoginPage = require('../../pageobjects/login.page');
const DashboardPage = require('../../pageobjects/dashboard.page');

describe('Login', () => {
  beforeEach(async () => {
    await LoginPage.open();
  });

  it('should NOT log in with an invalid password', async () => {
    await LoginPage.login({ phone: process.env.VALID_PHONE, password: process.env.INVALID_PASSWORD });

    await expect(await LoginPage.getErrorText()).toContain('Пароль');
    await expect(await DashboardPage.isLoggedIn()).toBe(false);
    await expect(await LoginPage.phoneInput.isDisplayed()).toBe(true);
  });

  it('should log in with valid credentials', async () => {
    await LoginPage.login({ phone: process.env.VALID_PHONE, password: process.env.VALID_PASSWORD });

    await expect(await DashboardPage.isLoggedIn()).toBe(true);
    await expect(await LoginPage.phoneInput.isExisting()).toBe(false);
    await expect(await LoginPage.getErrorText()).toBeNull();
  });
});
