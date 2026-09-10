# Login with an invalid password

## Description
Verifies that the login form rejects a correct phone number paired with a wrong password, with
a clear error and without granting access.

## Pre-conditions
- User is logged out.
- The account's real phone number is known; the password used is intentionally wrong.

## Verification steps

| # | Step | Expected |
|---|------|----------|
| 1 | Open the login form and submit it with the account's real phone number and an incorrect password | An error message mentioning "Пароль" (password) is displayed |
| 2 | Check the account state after the rejected submission | The user remains logged out |
| 3 | Check the login form after the rejected submission | The phone number field is still visible on screen |

## Related automation
`test/specs/login.spec.js` — `it('should NOT log in with an invalid password')`
