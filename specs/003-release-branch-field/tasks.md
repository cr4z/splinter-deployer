---
description: "Task list for the configurable release tag / branch field"
---

# Tasks: Configurable release tag / branch

**Input**: `specs/003-release-branch-field/{spec,plan}.md`

- [x] T001 Add `branch: string` to `SplinterDeployerSettings` and default
      it to `'nightly'` in `DEFAULT_SETTINGS` in `main.ts`
- [x] T002 In `deploy()` in `main.ts`, replace the two hardcoded
      `'nightly'` literals (release-tag lookup URL, expected zip asset
      name) with the configured `branch` (falling back to `'nightly'`
      when blank), and update the related `Notice` text to name the tag
- [x] T003 Add a "Release / branch" text field to
      `SplinterDeployerSettingTab.display()`, same pattern as the
      existing `repo`/`token` fields
- [x] T004 Update `specs/001-sync/spec.md` to describe the new field and
      the now-configurable release tag
- [x] T005 Run `npm run build` to confirm it typechecks and bundles
