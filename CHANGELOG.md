# Changelog

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

