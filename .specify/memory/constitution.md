# Splinter Deployer Constitution
<!-- Codifies the invariants already documented informally in specs/001-sync/spec.md -->

## Core Principles

### I. Never Deletes
The plugin's vault operations are limited to creating parent folders and
writing/overwriting files at the exact paths listed in the deployed
`config.json`. Nothing outside that set is ever touched, and no vault
content is ever removed by this plugin, under any settings combination.

### II. Every Phase Reports
Each phase of a deploy (auth/lookup, download, unzip, config parse,
per-file write) surfaces its own success or failure via Obsidian's
`Notice` API. A failure never fails silently and never hangs with no
visible feedback to the user.

### III. Auth Is Required
The source repository is, and will remain, private. There is no
unauthenticated fallback path; deploys always run through an
authenticated GitHub API request using the configured PAT.

### IV. Minimal, Explicit Settings Surface
The settings tab exposes only what a user must configure or control
directly — no hidden or implicit configuration. Every setting is visible,
named, described, and persisted through the plugin's own settings object;
nothing is inferred silently.

### V. User-Controlled Automation
Any behavior the plugin performs automatically and without an explicit
user action in the moment (e.g., running on Obsidian startup) MUST be
gated by a settings toggle the user can turn off. Manual, explicitly
user-triggered actions (a command palette entry, a settings button) are
exempt from this gate and must keep working regardless of automation
toggle state.

## Governance

This constitution supersedes ad hoc practice for this plugin. Amendments
require updating this file and noting the rationale in the amending PR.
All feature specs and plans should verify compliance with these
principles before implementation; deviations must be justified explicitly
in the plan's Complexity Tracking section.

**Version**: 1.0.0 | **Ratified**: 2026-08-23 | **Last Amended**: 2026-08-23
