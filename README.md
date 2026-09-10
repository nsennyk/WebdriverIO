# webdriverio-aqa-course

WebdriverIO UI automation practice project — logs into and searches
[flagman.ua](https://flagman.ua/) (a real storefront, used here for learning purposes only).

## Stack

- [WebdriverIO](https://webdriver.io/) v9 (`@wdio/cli`, local runner)
- Mocha test framework
- Page Object Model (`pageobjects/`)
- Chrome, driver auto-managed by WebdriverIO/Selenium Manager

## Setup

```bash
npm install
cp .env.example .env   # fill in real BASE_URL / credentials — .env is gitignored
npm test                # headed
npm run test:headless   # headless (CI-friendly)
```

## Structure

```
pageobjects/
  page.js               # base page: shared header element, open(), isDisplayed(), typeText()
  login.page.js          # login form: open modal, phone + password, submit, read validation error
  dashboard.page.js      # logged-in storefront: login state, logout, product search
  constants/
    timeouts.js            # named wait timeouts
    testData.js            # search terms etc.
test/specs/
  login.spec.js          # invalid login / valid login
  search.spec.js         # search-suggestion dropdown
wdio.conf.js
```

## Notes

- Credentials are read from environment variables (`VALID_PHONE`, `VALID_PASSWORD`,
  `INVALID_PASSWORD`) via `.env` + `dotenv`, not hardcoded in source.
- Selectors were verified live against the site's current (Vue/Nuxt) markup and live directly
  on each page object, next to the elements they identify.
- The login form's phone field uses an input-mask directive that doesn't reliably react to
  WebdriverIO's `setValue()` (fast clear+insert can race the mask's own JS, or land before it's
  wired up). `Page.typeText()` sends real keystrokes via `browser.keys()` instead, which the mask
  actually listens for.
- `wdio.conf.js` blocks the native "Allow notifications?" Chrome prompt via `chromeOptions.prefs`
  — it's outside the DOM (no selector can dismiss it) and steals OS-level focus from whatever
  field is being typed into at the time.
- `LoginPage.login()` waits for the submit to actually resolve (modal closes, or a validation
  error appears) before returning — without that, callers checking login state race the async
  response and read stale UI.
- Product search asserts against the as-you-type suggestions dropdown (`.search-tag`), not exact
  relevance-matching or the full results page: the dropdown starts out showing a static
  "Рекомендації" (recommendations) list and swaps in real matches on the backend's own debounced
  timing, and clicking through to the results page goes via an overlay that intercepts real
  clicks. The dropdown showing up at all already proves search works; asserting its exact
  contents would just make the test flaky.

## Conventions

- Page object methods take **named parameters** (`login({ phone, password })`, `searchFor({ term })`),
  not positional args.
- Selectors live directly on the page object that owns them (as getters); an element shared
  across pages (the header auth button) lives once on the base `Page`, not duplicated. Timeouts
  live in `constants/timeouts.js`, test data (e.g. search terms) in `constants/testData.js` — no
  magic numbers/strings scattered through page objects or specs.
- No fixed `pause()` anywhere — every wait is conditional (`waitForDisplayed`, `waitForClickable`,
  `waitUntil`) on the actual thing the next step depends on.
- Each test asserts multiple, distinct outcomes (state + a visible-chrome/error check), not a
  single `expect`.
