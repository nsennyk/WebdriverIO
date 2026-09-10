# Login with valid credentials (DELIBERATELY BROKEN — for Part 3 validation)

This is a deliberately mismatched copy of `valid-login.md`, created to prove `tc-automation-diff`
actually catches a real discrepancy. **Step 2's Expected column was changed** from "No validation
error message is displayed" to a claim the automation never checks: a redirect to `/profile`.
`login.spec.js` never navigates anywhere — it only closes the modal in place. See
`part3-validation/valid-login-BROKEN-report.md` for the skill's output against this file.

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
| 2 | Check the page after a successful submission | The user is redirected to the `/profile` page |

## Related automation
`test/specs/login.spec.js` — `it('should log in with valid credentials')`
