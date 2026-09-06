# Implementation Plan: Configurable release tag / branch

**Branch**: `003-release-branch-field` | **Date**: 2026-09-06 | **Spec**: `specs/003-release-branch-field/spec.md`

## Summary

Add a `branch: string` setting (default `'nightly'`) and use it in place
of the two hardcoded `'nightly'` literals in `deploy()`: the release-tag
URL and the expected zip asset name. No other behavior changes.

## Technical Context

Same as `specs/002-auto-fetch-toggle/plan.md` (TypeScript/esbuild, single
`main.ts`, no test suite — verified via `npm run build`).

## Constitution Check

- **I. Never Deletes** — unaffected. PASS
- **II. Every Phase Reports** — the lookup-failure `Notice` now names the
  configured tag instead of a hardcoded "nightly", improving clarity.
  PASS
- **III. Auth Is Required** — unaffected. PASS
- **IV. Minimal, Explicit Settings Surface** — one new visible, described,
  persisted text field, same pattern as `repo`/`token`. PASS
- **V. User-Controlled Automation** — N/A, no new automatic behavior. PASS

No violations.

## Source Code

```text
main.ts   # SplinterDeployerSettings, DEFAULT_SETTINGS, deploy(),
          # SplinterDeployerSettingTab.display()
```
