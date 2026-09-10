# webdriverio-aqa

WebdriverIO UI automation practice project — logs into and searches
[flagman.ua](https://flagman.ua/) (a real storefront, used here for learning purposes only).

## Assignment map

| Part | What | Where | Start here to review |
|---|---|---|---|
| 1 | Test plan + 5 WebdriverIO tests (POM, multi-assertion) | `TEST_PLAN.md`, `pageobjects/`, `test/specs/` | `npm test` — all 5 pass; then skim `TEST_PLAN.md` for the "why" behind each spec |
| 2 | Claude Skill: manual TC vs. automation diff | `.claude/skills/tc-automation-diff/` (`SKILL.md` + `README.md`) | `.claude/skills/tc-automation-diff/README.md` — what it does, inputs/output, how to invoke it (markdown or HTML) |
| 3 | Real runs of the Part 2 skill against Part 1's TCs, incl. one deliberate mismatch | `manual-test-cases/`, `part3-validation/` | **`part3-validation/index.html`** (open in a browser) — browsable, color-coded version of every report below |

### Reviewing Part 3 specifically

- `part3-validation/index.html` is the fastest way in: it links every report and summarizes the
  verdicts (3 clean pairs, all ✅; one deliberately broken pair, flagged ⚠️).
- The interesting one is **`valid-login-BROKEN-report.html`** (or its `.md` twin) — it's the
  proof that the skill doesn't rubber-stamp everything. `manual-test-cases/valid-login-BROKEN.md`
  is a copy of `valid-login.md` with one Expected column changed to a claim the real automation
  never checks (a redirect to `/profile`); the skill's own run against the *unmodified*
  `login.spec.js` catches it and explains exactly why.
- Every report exists as both `.md` (source) and `.html` (rendered, shares
  `part3-validation/assets/report.css`, supports dark mode) — same content either way, pick
  whichever is easier to read.

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
TEST_PLAN.md             # scenarios covered and why, written before Part 1's specs
pageobjects/
  page.js                 # base page: shared header element, open(), isDisplayed(), typeText()
  login.page.js           # login form: open modal, phone + password, submit, read validation error
  dashboard.page.js       # logged-in storefront: login state, profile navigation, product search
  constants/
    timeouts.js             # named wait timeouts
    testData.js              # search terms etc.
test/specs/
  login.spec.js           # invalid login / valid login
  formValidation.spec.js  # empty-field submission
  navigation.spec.js      # account dropdown → profile page
  search.spec.js          # search-suggestion dropdown
.claude/skills/
  jira-test-coverage/      # Jira-ticket-driven coverage analysis + TC + automation (side project, unrelated to Part 2)
  tc-automation-diff/       # Part 2: manual TC vs. automation discrepancy checker (SKILL.md + README.md)
manual-test-cases/         # Part 3: manual TCs for 3 of the specs above, incl. one deliberately broken copy
part3-validation/          # Part 3: the diff skill's actual output against each pair, + summary
  *.md                       # markdown reports (source)
  *.html + index.html        # same reports rendered as browsable HTML, shared assets/report.css
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
- Submitting the login form with both fields empty produces the same error text as an actually
  wrong phone number ("Телефон не вірний") — the site validates the phone field first regardless
  of which field is empty. `formValidation.spec.js` asserts that exact message.
- `/profile` uses a different header component than the homepage — `.profile-btn-main-page`
  (and its icon) don't exist there at all. `navigation.spec.js` asserts against what's actually
  on that page (URL + `<title>`), not homepage-only markup.

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
