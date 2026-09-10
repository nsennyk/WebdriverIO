# Login with valid credentials

## Description
Verifies that a registered user can log in from the header login form using a correct phone
number and password.

## Pre-conditions
- User is logged out.
- The account has a known-valid phone number and password.

## Verification steps

| # | Step | Expected |
|---|------|----------|
| 1 | Open the login form from the header and submit it with a valid phone number and password | The login modal closes and the header shows the logged-in account icon |
| 2 | Check the login form after a successful submission | No validation error message is displayed |

## Related automation
`test/specs/login.spec.js` — `it('should log in with valid credentials')`
