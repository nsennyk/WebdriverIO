# TC vs. Automation Diff — manual-test-cases/valid-login.md vs. test/specs/login.spec.js

**Automation scope:** `it('should log in with valid credentials')` (lines 17–23)

## Summary
2 of 2 manual steps fully covered · 0 missing · 0 inconsistent · 0 extra in automation

## Step-by-step comparison

| # | Manual step | Manual expected | Automation evidence (file:line) | Status |
|---|---|---|---|---|
| 1 | Open the login form and submit with a valid phone number and password | Login modal closes and the header shows the logged-in account icon | `login.spec.js:18` (submit) + `login.spec.js:20` (`isLoggedIn() === true`) + `login.spec.js:21` (`phoneInput.isExisting() === false`) | ✅ MATCH |
| 2 | Check the login form after a successful submission | No validation error message is displayed | `login.spec.js:22` (`getErrorText() === null`) | ✅ MATCH |

## Mismatches (detail)
None.

## Extra in automation (not in the manual TC)
None — every assertion in the `it()` block maps to a manual step.
