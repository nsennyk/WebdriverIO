# Part 3 — validating `tc-automation-diff`

Real runs of the `tc-automation-diff` skill (see `.claude/skills/tc-automation-diff/`) against
three of Part 1's own manual-TC/automation pairs, plus one deliberately mismatched pair to prove
the skill actually catches a discrepancy rather than rubber-stamping everything.

Every report below exists both as markdown (`*.md`, this directory) and as an HTML page with
the same content — see **[index.html](index.html)** for the browsable version (color-coded
MATCH/MISMATCH/MISSING badges, dark-mode support). The HTML pages share
`assets/report.css` and were converted directly from the markdown below.

## Clean pairs (skill reports full coverage, no mismatches)

| Manual TC | Automation | Report |
|---|---|---|
| `manual-test-cases/valid-login.md` | `test/specs/login.spec.js` → `should log in with valid credentials` | [valid-login-report.md](valid-login-report.md) |
| `manual-test-cases/invalid-login.md` | `test/specs/login.spec.js` → `should NOT log in with an invalid password` | [invalid-login-report.md](invalid-login-report.md) |
| `manual-test-cases/search-suggestions.md` | `test/specs/search.spec.js` → `should show a suggestions dropdown...` | [search-suggestions-report.md](search-suggestions-report.md) |

Each of these three came back **fully matched, zero mismatches** — expected, since the manual
TCs were written to describe exactly what the real automation does.

## Deliberately broken pair (proves the skill catches a real mismatch)

`manual-test-cases/valid-login-BROKEN.md` is a copy of `valid-login.md` with Step 2's Expected
column changed from "no error message is displayed" to "the user is redirected to `/profile`" —
a claim the real `login.spec.js` never checks (it only closes the modal in place; the actual
`/profile` redirect is a *different* flow, tested separately in `navigation.spec.js`).

Run against the **same, unmodified** `test/specs/login.spec.js`:

→ [valid-login-BROKEN-report.md](valid-login-BROKEN-report.md)

Result: **1 of 2 steps matched, 1 flagged as `⚠️ MISMATCH`**, with the report correctly
identifying both that the assertion at that position checks something unrelated, and that no
redirect check exists anywhere in the test at all. The skill did not silently pass this pair.

## What this demonstrates

- The skill doesn't just check "does a spec file exist for this TC" — it reads the actual
  assertions and compares what they verify against what the manual TC claims.
- A single-field edit to the manual TC (no code touched) was enough to flip the verdict from
  full coverage to a flagged mismatch, on the very same automation file.
