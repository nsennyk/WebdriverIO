# TC vs. Automation Diff — manual-test-cases/valid-login-BROKEN.md vs. test/specs/login.spec.js

**Automation scope:** `it('should log in with valid credentials')` (lines 17–23)

This is the deliberately mismatched pair for Part 3 validation. Step 2's Expected column was
changed to claim a redirect to `/profile` — something the real automation never checks.

## Summary
1 of 2 manual steps fully covered · 0 missing · 1 inconsistent · 0 extra in automation

## Step-by-step comparison

| # | Manual step | Manual expected | Automation evidence (file:line) | Status |
|---|---|---|---|---|
| 1 | Open the login form and submit with a valid phone number and password | Login modal closes and the header shows the logged-in account icon | `login.spec.js:18` (submit) + `login.spec.js:20` (`isLoggedIn() === true`) + `login.spec.js:21` (`phoneInput.isExisting() === false`) | ✅ MATCH |
| 2 | Check the page after a successful submission | **The user is redirected to the `/profile` page** | `login.spec.js:22` (`getErrorText() === null`) | ⚠️ MISMATCH |

## Mismatches (detail)

**Step 2 — different expected result.** The manual TC expects a navigation outcome (redirect to
`/profile`), but the automation's third assertion (`login.spec.js:22`) checks something
unrelated: that no validation error text is present (`getErrorText()` returns `null`). Two
separate problems, both worth flagging:

1. The assertion that occupies this position in the sequence does not verify what the manual
   step describes — an "is there an error" check is not evidence of "did we redirect".
2. There is no assertion anywhere in this `it()` block that reads `browser.getUrl()` or checks
   for `/profile` at all — a redirect check is entirely absent, not just differently expressed.

For reference, `test/specs/navigation.spec.js` *does* assert a redirect to `/profile` — but from
a different starting flow (clicking the account-menu profile link, not from submitting the
login form). If the intent really is "logging in redirects to `/profile`", that behavior isn't
automated anywhere yet; if the manual TC is simply wrong about what login does (which is the
case here — this project's login only closes the modal in place), the TC needs correcting
instead.

## Extra in automation (not in the manual TC)
None.
