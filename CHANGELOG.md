# Changelog
## [1.1.1] - 2026-01-02

### ✨ Features

-  inject Tailwind, FormGear CSS and Montserrat font in HTML preview (e01db3d)

### 🐛 Bug Fixes

- fix(form-gear): update form-gear asset (aa83336)
-  add sandbox and tabindex to preview iframe for focus isolation (5fbfd0f)
-  resolve transition warning and add Montserrat font to preview (3441044)

### 📚 Documentation

-  update changelog for 1.1.0 (5f94aee)

### 🔧 Chores

-  bump version to 1.1.1 (4eaf8f4)

### 📝 Other Changes

- Merge pull request #11 from IPDS-59/hotfix/1.1.1 (0363f10)

## [1.1.0] - 2026-01-01

### ✨ Features

-  integrate shadcn-vue with AlertDialog for better UX (9620fa2)
-  display app version in toolbar (dc9436d)
-  migrate dialogs to shadcn-vue and improve UX (01f9e6f)
-  add syntax highlighting to expression builder (64e2781)
-  convert HTML editor to click-to-open pattern (e0b2045)

### 🐛 Bug Fixes

-  prevent input focus loss when editing validation rules (6ad536d)
-  make toolbar responsive and hide actions in preview mode (c8491c8)
-  add responsive layout with mobile tap-to-place (8ba1aef)
-  improve dialog dark mode contrast (5a52c5f)
-  show plain HTML text in sidebar instead of rendered preview (900a3a2)

### 📚 Documentation

-  update changelog for 1.0.0 (ee0eba8)

### 🔧 Chores

-  bump version to 1.1.0 for next development cycle (6a4310a)
-  update form-gear assets (d3dc177)
-  update form-gear assets (362fd84)
-  update form-gear assets (a856eb6)

### 📝 Other Changes

- Merge pull request #4 from IPDS-59/chore/bump-next-version (e28cd1a)
- Merge pull request #5 from IPDS-59/chore/back-merge-1.0.0 (c30311f)
- Merge pull request #6 from IPDS-59/fix/validation-input-focus (9a1f8a6)
- Merge pull request #7 from IPDS-59/fix/responsive-toolbar (99fd903)
- Merge pull request #8 from IPDS-59/release/1.1.0 (81fa4a9)


All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-12-31

### ✨ Features

-  initial FormGear Builder implementation (ab70abd)

### 🐛 Bug Fixes

- fix(ci): add permissions for PR comments in sanity-check (f78a5fd)
-  resolve TypeScript build errors (e8eb685)
-  add contents write permission to housekeeping workflow (b552c50)
-  use PAT token for housekeeping workflow (76d5fff)
-  use PAT token for release workflow (c63a53a)
-  revert housekeeping to use secrets inherit (7df687e)
-  use correct secret names for workflows (886ead3)

### 📚 Documentation

-  add live demo URL to README (aeb37d0)

### 👷 CI

-  add banua-coder-workflow GitHub Actions (fb3d688)
-  add Netlify deployment workflows (99f9eab)
-  add build output verification step (0811ee1)
-  remove preview workflow in favor of Netlify integration (bed437c)

### 🔧 Chores

-  add .netlify to gitignore (3256da6)

### 📝 Other Changes

- Merge pull request #1 from IPDS-59/feature/add-ci-workflows (5de791b)
- Merge pull request #2 from IPDS-59/fix/housekeeping-workflow-permissions (7e39bb8)
- Merge pull request #3 from IPDS-59/release/1.0.0 (c328b39)

