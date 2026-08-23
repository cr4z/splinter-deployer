# Feature Specification: Auto-fetch-on-startup toggle

**Feature Branch**: `002-auto-fetch-toggle`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "Add a settings toggle that gates whether Splinter Deployer auto-fetches on Obsidian startup, while keeping the manual Deploy now command and button working regardless of the toggle state."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Disable automatic startup deploys (Priority: P1)

A vault owner wants to control exactly when Splinter Deployer contacts
GitHub and writes files into their vault. Today it always runs on every
Obsidian startup with no way to opt out short of removing the plugin.
They open the plugin's settings tab, turn off "Auto-fetch on startup",
and from then on Obsidian starts without the plugin making any network
call or vault write on its own — the plugin stays silent until they
explicitly deploy.

**Why this priority**: This is the entire feature. Without it, there is
no way to keep the plugin installed and configured while opting out of
automatic startup behavior.

**Independent Test**: With the toggle off, restart Obsidian (or reload
the plugin) and confirm no deploy `Notice` appears and no network request
fires. Fully testable on its own.

**Acceptance Scenarios**:

1. **Given** the toggle is off, **When** Obsidian starts and the plugin
   loads, **Then** `deploy()` is not invoked automatically — no `Notice`
   appears and no GitHub request is made until the user acts.
2. **Given** the toggle is on (the default), **When** Obsidian starts and
   the plugin loads, **Then** `deploy()` runs automatically exactly as it
   does today.

---

### User Story 2 - Manual deploy always available (Priority: P1)

Regardless of the toggle's state, the vault owner must still be able to
trigger a deploy on demand — via the command palette ("Deploy now") or
the "Deploy now" button in settings — for example right after editing
`repo`/`token`, or to pull a fresh nightly build without restarting
Obsidian.

**Why this priority**: Turning off automatic startup deploys must not
remove the only other way to deploy. This is a hard invariant of the
feature, not an enhancement to it.

**Independent Test**: With the toggle off, run the "Deploy now" command
(or click the settings button) and confirm a deploy runs exactly as
before, with the same success/failure `Notice`s.

**Acceptance Scenarios**:

1. **Given** the toggle is off, **When** the user runs the "Deploy now"
   command or clicks the "Deploy now" button, **Then** `deploy()` runs
   normally, unaffected by the toggle.
2. **Given** the toggle is on, **When** the user runs "Deploy now"
   manually, **Then** it still runs normally (no double-guarding).

---

### Edge Cases

- Existing installs upgrading to this version have no stored value for
  the new setting — it must default to **on**, so their current
  auto-fetch-every-startup behavior is unchanged until they explicitly
  turn it off.
- Toggling the setting off mid-session does not stop a deploy already in
  flight; it only affects the *next* startup's automatic call.
- The toggle has no effect on, and does not appear in, the `repo`/`token`
  validation path inside `deploy()` — an invalid/missing `repo` or
  `token` still produces the same "set repo and PAT" `Notice` whether
  deploy was triggered automatically or manually.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The plugin MUST persist a boolean "auto-fetch on startup"
  setting alongside the existing `repo`/`token` settings, defaulting to
  `true` for both new and pre-existing installs.
- **FR-002**: The settings tab MUST expose this setting as a toggle
  control, with a name and description explaining that it gates only the
  startup auto-deploy and that manual deploy stays available regardless.
- **FR-003**: On plugin load, the automatic startup deploy call MUST run
  only when this setting is `true`.
- **FR-004**: The "Deploy now" command (command palette) MUST invoke
  `deploy()` unconditionally, independent of this setting.
- **FR-005**: The "Deploy now" button in settings MUST invoke `deploy()`
  unconditionally, independent of this setting.
- **FR-006**: Changing the toggle MUST persist immediately via the
  plugin's existing settings-save mechanism, matching the pattern used by
  the `repo`/`token` fields.

### Key Entities

- **Plugin settings**: Existing persisted object (`repo: string`,
  `token: string`), gaining one new field
  (`autoFetchOnStart: boolean`, default `true`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With the toggle off, zero automatic `deploy()` invocations
  occur across any number of plugin loads/Obsidian restarts.
- **SC-002**: With the toggle off, a manual "Deploy now" (command or
  button) still completes a full deploy, identical in behavior to before
  this feature existed.
- **SC-003**: An existing vault upgrading the plugin sees no behavior
  change until it explicitly turns the toggle off — the setting defaults
  to preserving current behavior.

## Assumptions

- "Auto-fetch on startup" refers specifically to the unconditional
  `deploy()` call currently made in `onload()`; no other timer- or
  event-based auto-fetch exists in the plugin today.
- No new UI beyond a single toggle control is needed — the feature is a
  gate on existing behavior, not a new deploy trigger or schedule.
- This is a client-side-only preference; it is not synced or shared
  beyond the vault's local plugin data.
