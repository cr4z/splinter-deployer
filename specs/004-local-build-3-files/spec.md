# Feature Specification: Ship all 3 plugin files on local build

**Feature Branch**: `004-local-build-3-files`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "Make npm run build copy the plugin's 3 files (manifest.json, main.js, styles.css) to a vault plugins directory defined in a gitignored .env."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build copies the full plugin, styles included (Priority: P1)

A developer runs `npm run build` locally with `OBSIDIAN_PLUGINS_DIR` set
in their `.env`. Today only `manifest.json` and `main.js` get copied into
their vault's plugin folder; if a `styles.css` exists it's silently left
behind. They want all three of Obsidian's standard plugin files copied
every time, so the vault's copy of the plugin is always complete.

**Why this priority**: This is the entire feature — the existing
env-var + gitignored-`.env` mechanism (`deploy-local.mjs`,
`.env.example`) already does everything else asked for.

**Independent Test**: With `OBSIDIAN_PLUGINS_DIR` set, run
`npm run build` and confirm `manifest.json`, `main.js`, and `styles.css`
all land in `<OBSIDIAN_PLUGINS_DIR>/splinter-deployer/`.

**Acceptance Scenarios**:

1. **Given** `OBSIDIAN_PLUGINS_DIR` is set and `styles.css` exists at the
   repo root, **When** `npm run build` runs, **Then** all three files are
   copied into the target plugin folder.
2. **Given** `OBSIDIAN_PLUGINS_DIR` is unset, **When** `npm run build`
   runs, **Then** behavior is unchanged — bundling still happens and the
   copy step is skipped entirely (existing behavior, untouched).

## Requirements *(mandatory)*

- **FR-001**: The repo MUST include a `styles.css` file (even if empty)
  so there is a third file for the copy step to pick up, matching
  Obsidian's standard plugin file set.
- **FR-002**: `deploy-local.mjs`'s copy step MUST include `styles.css`
  alongside the existing `manifest.json` and `main.js`.
- **FR-003**: The destination directory MUST continue to come from
  `OBSIDIAN_PLUGINS_DIR` in a gitignored `.env` file — this already
  exists (`.env` is in `.gitignore`, `.env.example` documents the key,
  `deploy-local.mjs` reads it) and is not changed by this feature.

## Success Criteria *(mandatory)*

- **SC-001**: After this change, a local `npm run build` with
  `OBSIDIAN_PLUGINS_DIR` set produces all 3 plugin files in the vault's
  plugin folder, not 2.

## Assumptions

- The personal vault path this was requested for is set in each
  developer's own local `.env`, never committed — consistent with the
  existing `.env`/`.env.example` split already in this repo.
