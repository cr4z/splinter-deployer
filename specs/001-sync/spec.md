# Sync

## What

On every Obsidian startup — if auto-fetch on startup is enabled (default on) — and on demand via the "Deploy now" command/settings button regardless of that setting, Splinter Deployer downloads the latest nightly build of a configured private GitHub repo and writes it into the current vault. It is a second, redundant deployment path alongside that repo's own manual `npm run build` — neither depends on the other.

## Settings UI

Three fields, plus one button, under a single plugin settings tab:

- **Source repository** — plain text, `owner/repo` (e.g. `cr4z/vault-codebase`).
- **GitHub personal access token** — password-style text field. A fine-grained PAT scoped to `Contents: Read` on that one repo only.
- **Auto-fetch on startup** — toggle, default on. Gates only the automatic deploy on Obsidian startup; has no effect on manual deploys.
- **Deploy now** — a button that runs the same deploy routine used automatically on startup, unconditionally regardless of the toggle above.

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
