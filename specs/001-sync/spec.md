# Sync

## What

On every Obsidian startup, and on demand via the "Deploy now" command/settings button, Splinter Deployer downloads the latest nightly build of a configured private GitHub repo and writes it into the current vault. It is a second, redundant deployment path alongside that repo's own manual `npm run build` — neither depends on the other.

## Settings UI

Exactly two fields, plus one button, under a single plugin settings tab:

- **Source repository** — plain text, `owner/repo` (e.g. `cr4z/vault-codebase`).
- **GitHub personal access token** — password-style text field. A fine-grained PAT scoped to `Contents: Read` on that one repo only.
- **Deploy now** — a button that runs the same deploy routine used automatically on startup.

## Behavior

1. Validate both settings are present; notify and stop if not.
2. Look up the repo's `nightly`-tagged release via the authenticated GitHub REST API and find its `nightly.zip` asset.
3. Download that asset's binary contents via the same authenticated API.
4. Unzip in memory; read `config.json` and every file it references.
5. For each `config.json` entry, create any missing parent folders and write the file to its vault-relative destination path, creating it if absent or overwriting it if present.
6. Report a summary via Obsidian's `Notice` API, and a distinct failure `Notice` (plus console detail) for anything that didn't deploy.

## Invariants

- **Never deletes.** The only vault operations performed are folder creation and file write/overwrite at the exact paths `config.json` lists. Nothing outside that set is ever touched, and nothing is ever removed.
- **Every phase reports.** Auth/lookup, download, unzip, config parse, and per-file write each surface their own success or failure via `Notice` — a failure never fails silently or hangs with no visible feedback.
- **Auth is required.** The source repo is and will remain private; there is no unauthenticated fallback path.
