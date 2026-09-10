---
name: tc-automation-diff
description: Compares a manual test case (steps + expected results) against a WebdriverIO spec file and reports missing steps, mismatched expected results/order, assertions that don't match the manual outcome, and extra automation not present in the manual case. Triggers on "compare this TC to this spec", "check this test against the manual case", "does this automation match this TC", "diff <manual TC> against <spec file>".
version: 1.0.0
---

# Manual TC vs. automation diff

Given a manual test case and a WebdriverIO spec file that's supposed to automate it, produce a
structured coverage/mismatch report. **Read-only** — never edit either input file.

## Inputs

1. **Manual test case** — a numbered Step/Expected list (a markdown table, a plain numbered
   list, or the canonical template below). Accept it inline or as a file path. Ask for it if
   neither is given.
2. **WebdriverIO spec file** — a path to a `.spec.js` file. If it contains more than one
   `describe`/`it()` scenario, ask which `it()` block corresponds to this manual TC — don't guess
   when there's more than one plausible match.

## How to read each side

### Manual TC → an ordered list of (step, expected) pairs

- One entry per row/numbered item, in the order given.
- Pre-conditions are context, not steps — don't turn a "user is logged out" bullet into a step
  unless it describes an action with an observable outcome.

### Automation → an ordered list of (action, assertion) groups

- Walk the target `it()` block top to bottom.
- An **action** does something: `.click()`, `.setValue()`, `browser.keys()`, `browser.url()`, or
  a page-object method that performs an action.
- An **assertion** checks something: an `expect(...)` call, or a page-object query whose return
  value is immediately asserted.
- A page-object method call counts as whatever it *does* — open its source if the name alone
  doesn't make the action/assertion split obvious (e.g. `LoginPage.login()` is an action that
  itself waits for a result; `DashboardPage.isLoggedIn()` is a query, meaningless until something
  asserts on its return value).
- Group consecutive actions with no assertion between them together with the assertion(s) that
  follow — that group is what one automation "step" maps to.

## Matching steps across the two sides

Match by **what the step actually does**, not by wording:

- A manual step "Enter valid credentials and submit" matches an automation group that types into
  a phone/password field and clicks submit — even if the automation does it via one page-object
  method call.
- Don't require literal text overlap. Do require the same real-world action and the same
  observable outcome.
- If one manual step maps to *part* of a single automation assertion (one `expect` covers two
  manual expected-results at once), say so explicitly rather than forcing a fake 1:1 split.

## What to flag

1. **Missing steps** — a manual step with no corresponding action/assertion anywhere in the spec.
2. **Inconsistencies:**
   - *Different expected result* — the automation's assertion checks something that doesn't
     match the manual TC's Expected column (wrong text, wrong boolean, wrong count, wrong state).
   - *Different order* — the automation performs the matched actions in a different sequence
     than the manual steps list them.
   - *Assertion doesn't match the manual outcome* — the manual step implies a check the
     automation's assertion doesn't actually verify (e.g. manual says "error message shown",
     automation only checks `isLoggedIn() === false` and never reads the error text).
   - *Extra automation not in the manual TC* — the spec does/asserts something the manual TC
     never mentions. Flag as informational by default (may be reasonable extra coverage) —
     escalate to a real finding only if it changes what the test's pass/fail actually means.
3. Report a step as fully matched only when **both** the action and its expected result line up.

## Output format

```
# TC vs. Automation Diff — <manual TC title/file> vs. <spec file path>

## Summary
<N> of <M> manual steps fully covered · <X> missing · <Y> inconsistent · <Z> extra in automation

## Step-by-step comparison

| # | Manual step | Manual expected | Automation evidence (file:line) | Status |
|---|-------------|------------------|----------------------------------|--------|
| 1 | ...         | ...              | `spec.js:12` or "none"           | ✅ MATCH / ⚠️ MISMATCH / ❌ MISSING |

## Mismatches (detail)
For every ⚠️/❌ row above: the concrete discrepancy — what the manual TC expects vs. what the
automation actually does/asserts — with a file:line reference.

## Extra in automation (not in the manual TC)
- <file:line> — <what it does> (informational, unless it changes the test's pass/fail meaning)
```

Use exactly `✅ MATCH` / `⚠️ MISMATCH` / `❌ MISSING` — no substitute wording, even under time
pressure re-typing the table.

## HTML output

Markdown is the default. If asked for an HTML report (e.g. "give me an HTML version", "render
this as a web page"), produce the same content — same sections, same step table, same wording —
as a standalone `.html` file instead of markdown:

- Use the shared stylesheet at `part3-validation/assets/report.css` (`<link rel="stylesheet"
  href="assets/report.css">` from a file in `part3-validation/`, adjust the relative path
  otherwise) rather than inventing new styles per report.
- Render each status as a `<span class="badge badge-match">✅ MATCH</span>` /
  `badge-mismatch` / `badge-missing` — the stylesheet defines the green/yellow/red colors and
  its dark-mode variants via `prefers-color-scheme`. Don't hardcode colors inline.
- See `part3-validation/*-report.html` and `part3-validation/index.html` for the concrete
  structure (header with breadcrumb + scope note, summary line, comparison table, mismatch-detail
  blocks, extra-in-automation list, footer) — match that markup rather than starting from
  scratch.
- If more than one report exists for a project, link back to (or generate) an `index.html` that
  lists every report so they're navigable as a set, not just standalone files.

## Assumptions

- The manual TC and the spec file are already known to correspond to each other — this skill
  does not search a project to find which spec implements which TC.
- One spec file may hold multiple `it()` blocks; run this once per manual-TC/scenario pair, not
  once per file, when a file has more than one scenario.

## Limitations

- Matching is semantic, not exact-string — for a genuinely ambiguous manual step (vague action,
  no clear expected result), state the ambiguity rather than forcing a confident match.
- This is a static read of both artifacts, not a test execution — it can't catch a runtime
  mismatch where an assertion is syntactically checking the right *kind* of thing but against a
  value that will actually be wrong once the test runs.
- If the spec file doesn't exist/isn't readable, or the manual TC has no explicit Expected
  values, stop and say so rather than guessing.
