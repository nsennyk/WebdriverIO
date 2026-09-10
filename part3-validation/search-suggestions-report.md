# TC vs. Automation Diff — manual-test-cases/search-suggestions.md vs. test/specs/search.spec.js

**Automation scope:** `it('should show a suggestions dropdown when typing a search term')` (lines 11–18)

Pre-condition note: the manual TC's "User is logged in" pre-condition is satisfied by the
spec's `before()` hook (`search.spec.js:6-8`), not by a numbered step — consistent with
`tc-automation-diff`'s rule that pre-conditions aren't steps.

## Summary
3 of 3 manual steps fully covered · 0 missing · 0 inconsistent · 0 extra in automation

## Step-by-step comparison

| # | Manual step | Manual expected | Automation evidence (file:line) | Status |
|---|---|---|---|---|
| 1 | Type a product search term into the header search field | A suggestions dropdown appears with at least one item | `search.spec.js:12` (`searchFor({ term })`) + `search.spec.js:15` (`suggestions.length > 0`) | ✅ MATCH |
| 2 | Check the first item in the suggestions dropdown | The first suggestion is visible on screen | `search.spec.js:16` (`suggestions[0].isDisplayed() === true`) | ✅ MATCH |
| 3 | Check the text content of the first suggestion | The first suggestion has non-empty text | `search.spec.js:17` (`suggestions[0].getText().length > 0`) | ✅ MATCH |

## Mismatches (detail)
None.

## Extra in automation (not in the manual TC)
None.
