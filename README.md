# Splinter Deployer

Obsidian plugin. On every Obsidian startup (and via a "Deploy now" command/button), downloads the latest `nightly.zip` release from a private GitHub repo and writes its files into the current vault. See `specs/001-sync/spec.md` for the full behavior contract.

## Quickstart

1. `npm install`
2. `cp .env.example .env`, then set `OBSIDIAN_PLUGINS_DIR` to your vault's `.obsidian/plugins` folder.
3. `npm run build` — bundles the plugin to `main.js` **and** copies `manifest.json` + `main.js` into `OBSIDIAN_PLUGINS_DIR/splinter-deployer/` automatically. Re-run this after any code change.
4. In Obsidian: Settings → Community plugins → enable **Splinter Deployer**.
5. In the plugin's settings tab, set:
   - **Source repository**: `owner/repo` of the vault-codebase-style repo producing the nightly build.
   - **GitHub personal access token**: a fine-grained PAT scoped to `Contents: Read` on that repo only.
6. Click **Deploy now** (or just reload Obsidian) to trigger a sync.

`npm run dev` watches and rebuilds `main.js` on change but does **not** auto-copy — run `npm run build` once you're ready to reload the plugin in Obsidian.

If `OBSIDIAN_PLUGINS_DIR` isn't set in `.env`, `npm run build` still produces `main.js` and just skips the copy step (this is how CI / other machines build it).
