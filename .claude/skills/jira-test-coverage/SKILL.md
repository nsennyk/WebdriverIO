---
name: jira-test-coverage
description: Given a Jira ticket ID, fetch the ticket (task or test case), analyze what's already automated in this project for that logic, produce a coverage table, draft a new test case in the canonical template, then write a WebdriverIO spec with 1:1 step coverage of the new TC. Triggers on phrases like "check coverage for <ID>", "write a TC for <ID>", "automate ticket <ID>", or a bare Jira ticket ID paired with "test this" / "cover this".
version: 1.0.0
---

# Jira ticket → coverage analysis → TC → automation

Turns a single Jira ticket into: (1) a coverage table against what this project already
automates, (2) a canonical-format test case, (3) a WebdriverIO spec that covers that TC's steps
one-to-one. Four phases, in order — don't skip ahead to writing code before the TC is drafted.

## Inputs to gather

Ask once, up front, for whatever isn't already given:

1. **Jira ticket ID** (required).
2. **Target spec folder** (optional) — if the project has grown beyond a flat `test/specs/`,
   ask which area this ticket belongs to. Default: infer from the ticket's own content.

## Phase 0: fetch the ticket

Prefer in this order:

1. **`acli` (Atlassian CLI)** if installed: `acli jira workitem view <ID> --json`
2. **REST API via curl** if `JIRA_API_TOKEN` + `JIRA_EMAIL` + `JIRA_BASE_URL` env vars are set:
   ```
   curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
     "$JIRA_BASE_URL/rest/api/3/issue/<ID>?fields=summary,description,issuetype,attachment"
   ```
3. If neither is available, stop and ask the user to paste the ticket's title, description, and
   acceptance criteria directly.

`description` may come back as ADF JSON (API v3) — extract the plain text, don't dump the JSON.

**Determine the issue type** from `issuetype`:
- **Task/Story/Bug** → there is no existing step list. Everything in Phase 1 comes from the
  ticket's description/AC (and, if genuinely needed, a live look at the app).
- **Test Case** (or a Task whose description is already a step list) → treat its steps as a
  *starting anchor*, not a requirements source — see Phase 1.

## Phase 1: requirements verification

⭐ Never draft a TC step straight from an old/existing step list without checking it against the
actual current requirement first. Thin tickets and stale test cases are the norm, not the
exception.

**Mandatory sources, in this order:**
1. The ticket itself — description, AC, attachments, linked docs. Open any reachable linked doc.
2. If the ticket says "works like `<other flow>`" — find that flow in this project (spec +
   page-object) and read it end-to-end. Treat it as scaffolding, not a 1:1 mirror: labels and
   exact UI text routinely differ, so verify against the real UI, not the peer's method names.
3. Existing partial coverage for this ticket's scope — grep `test/specs/` and `pageobjects/` for
   related keywords/selectors before assuming nothing exists.
4. Live inspection of the running app/site when the ticket doesn't fully specify behavior (exact
   button text, what shows/hides, edge cases) — observe it directly rather than guessing.

**Post this block before drafting anything:**
```
## Requirements verification
- Ticket: <ID> — <1-line state, e.g. "has 5-step AC" / "thin, description only" / "is itself a TC">
- Linked docs: <fetched / "none linked">
- Peer flow in code: <file(s) read, or "n/a">
- Existing repo coverage: <grep results — what's already wired>
- Open questions: <anything the ticket doesn't specify — ask before drafting, don't guess>
```
If a source is unreachable and the ticket is too thin to proceed, **stop and ask** rather than
inventing steps.

## Phase 2: coverage analysis

Break the verified requirement into discrete, checkable steps (independent of whether a TC
already exists for it). For each step, check this project's actual code — never conclude a
status from a filename or method name alone:

- Open the relevant file(s) under `test/specs/` and read the real `it()` blocks.
- Open the page-object methods those `it()` blocks call — a step can be covered inside a helper
  that a title alone doesn't reveal.
- Grep for related selectors/constants across `pageobjects/` before concluding "nothing exists" —
  it may already be wired for a different flow.

**Status vocabulary** (use exactly these, don't substitute):
- `EXISTS` — a running `it()` tests exactly this step's logic.
- `PARTIAL` — some but not all of the step is covered, OR a mechanism exists but isn't assembled
  into this specific flow yet. (Don't downgrade this to `TODO` just because the one distinguishing
  assertion is missing — if *any* related code runs, it's `PARTIAL`.)
- `REFACTOR` — code exists but tests different logic than required, or is disabled
  (`it.skip`/`xit`/`describe.skip`) — note the line and why.
- `TODO` — no running code at all for this step.

**Output — a compact table, evidence before conclusion:**
```
| # | Requirement (short) | Code evidence (file:line, or "none") | Status |
```
Keep prose conclusions (what's missing, what needs adding) tight and below the table, not mixed
into it.

## Phase 3: draft the new TC

Use this exact canonical format. Resolve every code constant/selector to its real UI-visible
value first — a manual tester with no repo access must be able to follow every row without
asking "what is this?".

```markdown
# <Title>

## Description
2-3 sentences: what this covers, and (if replacing/consolidating something) what it replaces.

## Test User
(Only include this section if the project actually has more than one login/role. Omit it
entirely for a single-user flow rather than inventing roles that don't exist.)

## Pre-conditions
- <bullet list — real preconditions, e.g. "logged out", "an account with valid credentials exists">

## Verification steps

| # | Step | Expected |
|---|------|----------|
| 1 | <UI action, in plain language> | <UI-visible outcome> |

## Acceptance Criteria
- Spec file(s) to create/touch
- Page-object methods/selectors needed (new ones only — reuse what exists)
- Pass criteria

## Related ticket
<ID>
```

**Forbidden in Step/Expected cells:** method names, constant identifiers, selector strings,
`=== '...'` comparisons — anything that isn't literally what a human sees on screen. Resolve the
real value first (open the page object/constants file, find the actual label/URL/text), then
write that.

**No extra "Notes" section.** Caveats, open questions, or staleness flags belong in the
conversation, not the TC body — the sections above are the complete template.

## Phase 4: write the automation

Once the TC is drafted (and approved, if the user wants to review first):

- One `it()` per TC step, in the same order and count — no more, no fewer.
- Reuse existing page-object methods/selectors before adding new ones; add new ones only where
  this TC genuinely needs something not yet exposed.
- New page-object methods take **named parameters** (`login({ phone, password })`, not
  positional args).
- No fixed `pause()` — conditional waits only (`waitForDisplayed`, `waitForClickable`,
  `waitUntil`), matched to what the next step actually depends on.
- Check how existing specs title their `describe()` block (ticket ID included or not) and match
  that convention — don't invent a new one.
- Run the new spec and confirm it passes before reporting done. If it doesn't, fix it — don't
  hand back a red test as "done."

## Output format

Present, in this order, in one response per phase (don't skip phases even if a later one seems
obvious):
1. Requirements verification block (Phase 1).
2. Coverage table (Phase 2).
3. The new TC in canonical format (Phase 3).
4. Automation summary: files added/changed, and the actual test-run result (Phase 4).

## Gotchas

- Don't shortcut analysis by citing a "similar" earlier ticket — re-check the actual code every
  time, even for an apparent near-duplicate.
- An old test case (if this ticket *is* one) is a starting anchor, not a requirements source —
  Phase 1 always runs, even when Phase 0 finds a full step list already.
- Don't add a "Test User" / role-matrix section this project doesn't need — that's a pattern for
  multi-role projects, not a default to cargo-cult in.
- A green coverage table is not the same as a closed gap — Phase 2 identifies gaps, Phase 4
  closes them. Don't conflate the two.
