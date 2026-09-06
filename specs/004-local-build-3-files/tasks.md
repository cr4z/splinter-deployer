---
description: "Task list for shipping all 3 plugin files on local build"
---

# Tasks: Ship all 3 plugin files on local build

**Input**: `specs/004-local-build-3-files/spec.md`

- [x] T001 Add `styles.css` at the repo root (empty/placeholder — no
      styling exists yet)
- [x] T002 Add `styles.css` to the copied-files list in
      `deploy-local.mjs`
- [x] T003 Update `README.md`'s quickstart to mention all 3 copied files
- [x] T004 Verify locally: with `OBSIDIAN_PLUGINS_DIR` set in `.env`,
      `npm run build` copies `manifest.json` + `main.js` + `styles.css`
