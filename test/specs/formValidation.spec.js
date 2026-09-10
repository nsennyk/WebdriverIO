const LoginPage = require('../../pageobjects/login.page');
const DashboardPage = require('../../pageobjects/dashboard.page');

describe('Login form validation', () => {
  beforeEach(async () => {
    await LoginPage.open();
  });

  it('should reject submitting the login form with empty fields', async () => {
    await LoginPage.login({ phone: '', password: '' });

    await expect(await LoginPage.getErrorText()).toBe('Телефон не вірний');
    await expect(await DashboardPage.isLoggedIn()).toBe(false);
    await expect(await LoginPage.phoneInput.isExisting()).toBe(true);
  });
});
