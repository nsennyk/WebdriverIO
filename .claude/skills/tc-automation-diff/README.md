# tc-automation-diff

A Claude Code Skill that compares a manual test case against the WebdriverIO spec that's
supposed to automate it, and reports what's missing or inconsistent between them.

## What it does

Given two inputs — a manual test case (numbered steps + expected results) and a `.spec.js`
file — it reads both, matches manual steps to automation code by what each step actually *does*
(not by literal wording), and produces a markdown report with:

- a summary count (steps fully covered / missing / inconsistent / extra),
- a step-by-step table with a file:line pointer into the spec for each matched step,
- a written explanation of every mismatch it found,
- a list of anything the automation does that the manual TC never mentions.

It is **read-only** — it never edits the manual TC or the spec file. It only reports.

## Inputs

1. **A manual test case.** Any reasonable Step/Expected format works — a markdown table, a plain
   numbered list, or this repo's canonical template:

   ```markdown
   ## Verification steps
   | # | Step | Expected |
   |---|------|----------|
   | 1 | <action> | <observable outcome> |
   ```

   Give it as a file path (e.g. `manual-test-cases/valid-login.md`) or paste it inline.

2. **A WebdriverIO spec file path**, e.g. `test/specs/login.spec.js`. If that file contains more
   than one `it()` scenario, the skill will ask which one corresponds to the manual TC you gave
   it — it won't guess.

## Output

A single markdown report (see `SKILL.md` for the exact template), structured so the interesting
part — the mismatches — is impossible to miss even in a long report:

```
# TC vs. Automation Diff — <manual TC> vs. <spec file>

## Summary
2 of 3 manual steps fully covered · 0 missing · 1 inconsistent · 0 extra in automation

## Step-by-step comparison
| # | Manual step | Manual expected | Automation evidence | Status |
|---|---|---|---|---|
| 1 | ... | ... | login.spec.js:14 | ✅ MATCH |
| 2 | ... | ... | login.spec.js:15 | ⚠️ MISMATCH |

## Mismatches (detail)
...

## Extra in automation (not in the manual TC)
...
```

## How to run it

From a Claude Code session in this repo:

```
Compare manual-test-cases/valid-login.md against test/specs/login.spec.js
```

or invoke it by name if your Claude Code setup lists it as a slash command:

```
/tc-automation-diff manual-test-cases/valid-login.md test/specs/login.spec.js
```

Either phrasing is enough for the skill's trigger description to match; it will ask for
whichever input is missing.

### Getting an HTML report instead of markdown

The default output is markdown. If you'd rather have a web page, just ask for one:

```
Compare manual-test-cases/valid-login.md against test/specs/login.spec.js — give me an HTML report
```

Same content, same MATCH/MISMATCH/MISSING verdicts, rendered as a standalone `.html` file with
color-coded badges (green/yellow/red) and dark-mode support, using the shared stylesheet at
`part3-validation/assets/report.css`. See `part3-validation/index.html` and the `*-report.html`
files next to it for worked examples of the HTML layout.

## Assumptions

- You already know which manual TC corresponds to which spec file — this skill compares a pair
  you hand it; it doesn't search the repo to discover the pairing itself.
- The manual TC has explicit, concrete Expected values (real UI text/state), not placeholders —
  see `TEST_PLAN.md`/the manual TCs in `manual-test-cases/` in this repo for the format assumed.
- A spec file with multiple `it()` blocks is compared one scenario at a time.

## Limitations

- **Static analysis, not test execution.** The skill reads code; it doesn't run it. An assertion
  that's checking the *right kind* of thing (e.g. an error-message text) but against a value
  that will actually be wrong at runtime won't be caught here — running the suite (Part 1's
  `npm test`) is what catches that.
- **Semantic matching, not string matching.** It matches steps by intent, which means genuinely
  vague manual steps (no clear action or no clear expected result) will be reported as
  ambiguous rather than force-matched — that's intentional, not a bug.
- **No repo-wide search.** It only looks at the two files/inputs you give it.
- Extra automation coverage beyond the manual TC is reported as informational by default, not as
  a defect — flip that judgment call yourself if your process treats untracked coverage as a
  problem.

## Validation

See `part3-validation/` in this repo for real runs of this skill against Part 1's own
manual-TC/automation pairs, including one pair with a deliberately introduced mismatch that the
skill correctly flags.
