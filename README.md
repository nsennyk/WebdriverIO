# WebdriverIO-aqa

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

## Implementation Walkthrough

This section documents the reasoning and sequence behind the implementation. The goal was not
only to make the tests pass, but to leave a small project that shows how manual scenarios can be
turned into maintainable UI automation and then checked for coverage.

### 1. Choosing the scope

I selected the login, validation, navigation, and product-search flows on `flagman.ua`. These
flows cover different kinds of end-to-end behavior: successful and unsuccessful authentication,
form validation, navigation to another page, and an asynchronous search interaction. Before
writing the specs, I wrote `TEST_PLAN.md` so that the intended behavior was defined separately
from the implementation.

### 2. Designing the tests

The five scenarios were implemented with WebdriverIO and Mocha. I used the Page Object Model to
keep selectors and browser interactions close to the page that owns them, while keeping the spec
files focused on business-level scenarios. Shared waits, test data, and common interactions were
also extracted so the tests do not depend on arbitrary `pause()` calls or scattered magic values.

Each test contains multiple meaningful assertions. Depending on the scenario, the assertions
check a combination of URL, page title, visible text, authentication state, error state, or the
presence of search suggestions. This makes a test verify the complete outcome instead of merely
proving that one element exists.

### 3. Handling real application behavior

While checking the flows against the live site, I adjusted the implementation to match the
application rather than idealized assumptions. The phone input uses a mask, so ordinary
`setValue()` was not consistently processed; the shared typing helper sends real key events
instead. Login waits for either the modal to close or a validation error to appear, which avoids
asserting against stale UI. The search test checks the debounced suggestion dropdown instead of
hard-coding a fragile result list, and the navigation test asserts the actual `/profile` page
markup rather than selectors that only exist on the homepage.

### 4. Building the comparison skill

For Part 2, I created the `tc-automation-diff` Claude Skill. It receives a manual test case and
the corresponding WebdriverIO file, then compares the manual steps and expected results with the
actions and assertions expressed in the automation. Its report separates missing manual steps,
inconsistent expectations or ordering, and extra automation behavior. The skill's README
documents the input format, output structure, invocation examples, and limitations such as the
fact that the comparison is based on the meaning expressed in the files and cannot observe
runtime behavior by itself.

### 5. Validating the skill

For Part 3, I prepared manual test cases for several Part 1 scenarios and ran the skill against
each matching automation file. The clean pairs demonstrate that the intended coverage is
recognized. I then copied the valid-login manual case and deliberately changed its expected
result to require a redirect to `/profile`, while leaving the automation unchanged. The generated
`valid-login-BROKEN-report` flags that expectation as uncovered, demonstrating that the skill can
detect a real discrepancy instead of approving every pair.

### 6. What this demonstrates

The final structure connects three layers of quality work: a written test plan explains the
intended coverage, WebdriverIO verifies the behavior in a browser, and the Claude Skill checks
whether the automation still represents the manual cases. Keeping those artifacts together makes
the project easier to review and gives future changes a clear reference point.

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
