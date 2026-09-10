# Test Plan — flagman.ua

## Site under test

[flagman.ua](https://flagman.ua/) — a live storefront (fishing/outdoor equipment). Tested
surfaces: the header login form, the account/profile flow, and product search — chosen because
they're present on every page, don't require placing a real order, and exercise a real
authenticated session.

## Approach

- WebdriverIO + Mocha, Page Object Model (`pageobjects/`: `Page` base class,
  `LoginPage`, `DashboardPage`).
- Chrome, one browser session per spec file.
- Credentials and environment values come from `.env` (see `.env.example`), never hardcoded.
- Every wait is conditional (`waitForDisplayed`/`waitForClickable`/`waitUntil`) — no fixed
  `pause()` — because this is a live third-party site with real network/render latency that
  varies run to run.

## Scenarios

| # | Scenario | Category | Why it matters |
|---|----------|----------|-----------------|
| 1 | Log in with valid credentials | Happy path | The core flow everything else depends on — if this breaks, the account is unusable. |
| 2 | Log in with an invalid password | Negative scenario | Confirms the app rejects bad credentials with a clear, correct error rather than silently failing or logging in anyway. |
| 3 | Submit the login form with both fields empty | Form validation | Confirms client-side validation actually blocks a no-op submission, distinct from the wrong-password case (different, specific error message). |
| 4 | Search for a product term and see the suggestions dropdown | Happy path (feature) | Search is the primary way users find products; verifies the as-you-type suggestion mechanism actually responds to input. |
| 5 | Navigate from the account menu to the profile page | Navigation flow | Verifies the authenticated header's dropdown menu actually routes correctly to a real sub-page, not just that it renders. |

## Assertion strategy

Every test checks **multiple, independent aspects of the outcome**, not one boolean:

- **Scenario 1 (valid login):** logged-in state (header icon), login modal actually closed, no
  validation error left showing.
- **Scenario 2 (invalid password):** the specific error message text, logged-out state, login
  form still present (didn't silently navigate away).
- **Scenario 3 (empty fields):** the specific error message text (distinct from scenario 2's),
  logged-out state, login form still present.
- **Scenario 4 (search):** at least one suggestion renders, it's actually visible (not just in
  the DOM), and its text is non-empty.
- **Scenario 5 (navigation):** URL changed to `/profile`, page `<title>` confirms the right page
  loaded, and the account dropdown menu closed after navigating (not left open/stuck).

## Out of scope

- Checkout/payment flow (would require placing a real order on a live site).
- Any test requiring irreversible account changes (email change, account deletion).
- Full results-page navigation from search (the results overlay intercepts real clicks in a way
  that doesn't reflect genuine user interaction reliably — see `README.md` notes); the
  suggestions dropdown already proves the search mechanism works.

## Known site quirks affecting test design

- The login form's phone field uses an input mask that requires real keystrokes
  (`browser.keys()`), not `setValue()`.
- The header markup differs between the homepage and `/profile` — scenario 5's assertions were
  chosen to hold on the destination page, not assumed from the homepage's DOM.
- The native "Allow notifications?" Chrome prompt is blocked at the browser-capabilities level
  (`wdio.conf.js`) so it can never steal focus mid-test.
