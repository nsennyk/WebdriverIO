# Product search shows suggestions while typing

## Description
Verifies that typing a product name into the header search field surfaces a suggestions
dropdown, confirming the search-as-you-type mechanism responds to input.

## Pre-conditions
- User is logged in.

## Verification steps

| # | Step | Expected |
|---|------|----------|
| 1 | Type a product search term (e.g. "палатка") into the header search field | A suggestions dropdown appears below the field with at least one item |
| 2 | Check the first item in the suggestions dropdown | The first suggestion is visible on screen |
| 3 | Check the text content of the first suggestion | The first suggestion has non-empty text |

## Related automation
`test/specs/search.spec.js` — `it('should show a suggestions dropdown when typing a search term')`
