# Implementation Plan: Auto-fetch-on-startup toggle

**Branch**: `002-auto-fetch-toggle` | **Date**: 2026-08-23 | **Spec**: `specs/002-auto-fetch-toggle/spec.md`

**Input**: Feature specification from `specs/002-auto-fetch-toggle/spec.md`

## Summary

Add a persisted boolean setting, `autoFetchOnStart` (default `true`), and
gate the existing unconditional `void this.deploy();` startup call in
`onload()` behind it. Expose the setting as a new `.addToggle()` control
in `SplinterDeployerSettingTab`. The command-palette "Deploy now" command
and the settings "Deploy now" button both keep calling `deploy()`
unconditionally — no change to either.

## Technical Context

**Language/Version**: TypeScript, compiled via esbuild (see `esbuild.config.mjs`)

**Primary Dependencies**: `obsidian` (Plugin/Setting/PluginSettingTab API), `fflate` (unaffected by this change)

**Storage**: Obsidian's built-in per-plugin `loadData()`/`saveData()` JSON persistence (vault-local `data.json`) — no new storage layer

**Testing**: No existing automated test suite in this repo; verification is `npm run build` (typecheck + bundle) plus manual reasoning about the two entry points that must stay unconditional

**Target Platform**: Obsidian desktop plugin (`isDesktopOnly: true` per `manifest.json`)

**Project Type**: Single-file plugin (`main.ts`) — no separate app layers

**Performance Goals**: N/A — a settings/control-flow change with no perf-sensitive path

**Constraints**: Must not change the shape or behavior of the `deploy()` method itself, or of the two manual trigger paths (command, button)

**Scale/Scope**: One new settings field, one new UI control, one conditional wrapping an existing call — no new files needed in `main.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Never Deletes** — N/A to this change; `deploy()`'s vault-write logic is untouched. PASS
- **II. Every Phase Reports** — N/A; no new phases added to `deploy()`. When the toggle suppresses the startup call, that's a deliberate no-op, not a failure, so no `Notice` is expected or needed for the suppressed case. PASS
- **III. Auth Is Required** — Unaffected; `deploy()`'s own `repo`/`token` validation is unchanged and still runs identically on both manual and (enabled) automatic paths. PASS
- **IV. Minimal, Explicit Settings Surface** — The new toggle is visible, named, described, and persisted through the existing `settings`/`saveSettings()` object, consistent with the other two fields. PASS
- **V. User-Controlled Automation** — This principle is the direct motivation for the feature: it gates the one automatic (non-user-triggered) behavior the plugin has, while explicitly exempting the two manual triggers. PASS

No violations; Complexity Tracking is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/002-auto-fetch-toggle/
├── plan.md              # This file
├── spec.md              # Feature specification
└── tasks.md             # Task breakdown
```

No `research.md`, `data-model.md`, `quickstart.md`, or `contracts/` are
needed — there are no unresolved unknowns to research, no multi-entity
data model beyond one boolean field, and no external contract/API
surface introduced.

### Source Code (repository root)

```text
main.ts   # SplinterDeployerSettings interface, DEFAULT_SETTINGS,
          # SplinterDeployerPlugin.onload(), SplinterDeployerSettingTab.display()
```

**Structure Decision**: Single-project layout (already in place). This
plugin is intentionally a single `main.ts` file with no `src/` tree; the
feature adds to that same file rather than introducing new structure.

## Complexity Tracking

*No constitution violations — this section is intentionally empty.*
