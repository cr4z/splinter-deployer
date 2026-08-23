---
description: "Task list for the auto-fetch-on-startup toggle feature"
---

# Tasks: Auto-fetch-on-startup toggle

**Input**: Design documents from `specs/002-auto-fetch-toggle/`

**Prerequisites**: plan.md, spec.md

**Tests**: No automated test suite exists in this repo; verification is
`npm run build` plus manual review of the two manual-trigger paths. No
test tasks are included.

## Phase 1: Foundational (Settings schema)

**Purpose**: Add the persisted field both user stories depend on

- [x] T001 Add `autoFetchOnStart: boolean` to the `SplinterDeployerSettings`
      interface in `main.ts`
- [x] T002 Default `autoFetchOnStart` to `true` in `DEFAULT_SETTINGS` in
      `main.ts` (preserves current behavior for existing installs, per
      spec Edge Cases)

**Checkpoint**: Settings schema carries the new field; existing
`loadSettings()`'s `Object.assign` merge already backfills it for
upgrading installs with no further change needed.

---

## Phase 2: User Story 1 - Disable automatic startup deploys (P1) 🎯 MVP

**Goal**: Startup `deploy()` only fires when the toggle is on

**Independent Test**: With the toggle off, reload the plugin and confirm
no deploy `Notice`/network call happens.

- [x] T003 [US1] In `SplinterDeployerPlugin.onload()` in `main.ts`, wrap
      the existing `void this.deploy();` call in
      `if (this.settings.autoFetchOnStart) { ... }`
- [x] T004 [US1] In `SplinterDeployerSettingTab.display()` in `main.ts`,
      add a new `Setting(...).addToggle(...)` control ("Auto-fetch on
      startup") using the same mutate-`this.plugin.settings`-then-
      `await this.plugin.saveSettings()` pattern as the existing
      `repo`/`token` fields, placed before the "Deploy now" button

**Checkpoint**: Toggling the setting off and reloading the plugin
suppresses the startup deploy; toggling it on restores current behavior.

---

## Phase 3: User Story 2 - Manual deploy always available (P1)

**Goal**: Confirm the two manual trigger paths are untouched and still
unconditional

**Independent Test**: With the toggle off, run "Deploy now" (command and
button) and confirm a full deploy still runs.

- [x] T005 [US2] Review `addCommand('deploy-now', ...)` in `onload()` and
      the "Deploy now" button's `onClick` in
      `SplinterDeployerSettingTab.display()` — confirm neither was
      touched by T003/T004 and both still call `deploy()`/
      `this.plugin.deploy()` unconditionally

**Checkpoint**: Both user stories independently verified.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [x] T006 [P] Update `specs/001-sync/spec.md`'s "What" section to note
      startup deploy is now conditional on the toggle (default on), and
      its "Settings UI" section to list the new toggle as a third field
- [x] T007 Run `npm run build` to confirm the change typechecks and
      bundles cleanly

---

## Dependencies & Execution Order

- Phase 1 (Foundational) blocks Phase 2 (T003/T004 reference the new
  field).
- Phase 2 and Phase 3 are both P1; Phase 3 is a review/verification pass
  over the same edit that satisfies Phase 2, so in practice they land in
  the same change rather than sequentially.
- Phase 4 depends on Phase 2 + 3 being complete.

## Notes

- [P] tasks touch different files and have no ordering dependency on
  other [P] tasks in the same phase.
- This feature is small enough that all tasks land in a single commit
  covering `main.ts` plus the doc update, rather than one commit per
  task.
