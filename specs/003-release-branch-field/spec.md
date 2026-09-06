# Feature Specification: Configurable release tag / branch

**Feature Branch**: `003-release-branch-field`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "Add a settings field so the user can specify which release tag/branch of the vault codebase repo to deploy from, instead of always fetching the nightly tag."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy from a non-default release (Priority: P1)

A vault owner is testing a feature branch of their vault-codebase repo,
which publishes its own tagged release (e.g. `feature-x`) alongside the
usual `nightly` tag. They enter that tag into a new settings field and
deploy — Splinter Deployer fetches `feature-x`'s release/asset instead of
`nightly`'s, with no other change to behavior.

**Why this priority**: This is the entire feature.

**Independent Test**: Set the field to a real alternate tag on the
configured repo, click "Deploy now", and confirm the files from that
release (not `nightly`) land in the vault.

**Acceptance Scenarios**:

1. **Given** the field is set to `nightly` (default) or left blank,
   **When** a deploy runs (auto or manual), **Then** behavior is
   byte-for-byte identical to before this feature.
2. **Given** the field is set to another existing tag, **When** a deploy
   runs, **Then** it fetches that tag's release and its `<tag>.zip` asset
   instead of `nightly`'s.
3. **Given** the field is set to a tag that doesn't exist on the repo,
   **When** a deploy runs, **Then** the existing lookup-failure `Notice`
   fires, now naming the configured tag.

### Edge Cases

- Existing installs have no stored value for this field — it must default
  to `nightly` so current behavior is unchanged until a user opts in.
- A blank/whitespace-only value falls back to `nightly` rather than
  producing an invalid API URL.

## Requirements *(mandatory)*

- **FR-001**: The plugin MUST persist a `branch` string setting,
  defaulting to `nightly`.
- **FR-002**: The settings tab MUST expose it as a text field, describing
  it as the release tag to deploy from.
- **FR-003**: `deploy()` MUST look up `releases/tags/<branch>` (falling
  back to `nightly` when blank) instead of the hardcoded `nightly` tag,
  and MUST look for a `<branch>.zip` asset on that release instead of the
  hardcoded `nightly.zip`.
- **FR-004**: All other deploy behavior (validation, download, unzip,
  config parsing, per-file write, reporting) is unchanged.

## Success Criteria *(mandatory)*

- **SC-001**: Default/blank field behaves identically to the previous
  hardcoded-`nightly` behavior.
- **SC-002**: A non-default tag value changes which release/asset is
  fetched, with no other change in behavior.

## Assumptions

- The source repo's build workflow names its release asset `<tag>.zip`
  for any tag it publishes, matching the existing `nightly` →
  `nightly.zip` convention — this is not verified here since it depends
  on that other repo's own release automation.
- "Branch" in the user's request maps to a GitHub *release tag* the other
  repo's workflow produces per branch, not to querying git branches
  directly — the GitHub Releases API is the only fetch mechanism this
  plugin uses.
