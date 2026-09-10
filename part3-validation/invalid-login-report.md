# TC vs. Automation Diff — manual-test-cases/invalid-login.md vs. test/specs/login.spec.js

**Automation scope:** `it('should NOT log in with an invalid password')` (lines 9–15)

## Summary
3 of 3 manual steps fully covered · 0 missing · 0 inconsistent · 0 extra in automation

## Step-by-step comparison

| # | Manual step | Manual expected | Automation evidence (file:line) | Status |
|---|---|---|---|---|
| 1 | Submit the login form with the account's real phone number and an incorrect password | An error message mentioning "Пароль" is displayed | `login.spec.js:10` (submit) + `login.spec.js:12` (`getErrorText()` → `toContain('Пароль')`) | ✅ MATCH |
| 2 | Check the account state after the rejected submission | The user remains logged out | `login.spec.js:13` (`isLoggedIn() === false`) | ✅ MATCH |
| 3 | Check the login form after the rejected submission | The phone number field is still visible on screen | `login.spec.js:14` (`phoneInput.isDisplayed() === true`) | ✅ MATCH |

## Mismatches (detail)
None.

## Extra in automation (not in the manual TC)
None.
