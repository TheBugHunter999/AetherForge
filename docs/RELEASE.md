# Releasing Grokden

Production releases publish **signed** Windows NSIS + MSI installers and `latest.json` for the in-app updater.

## One-time setup

### 1. Signing keys (local)

Keys live outside the repo:

`C:\Users\int_v\OneDrive\Desktop\TauriKey\`

See that folder's `README.md` for details. The public key in `grokden.key.pub` must match `plugins.updater.pubkey` in `src-tauri/tauri.conf.json`.

### 2. GitHub Actions secrets

```powershell
gh auth login
.\scripts\setup-github-secrets.ps1
```

### 3. Workflow permissions

Repository **Settings → Actions → General → Workflow permissions → Read and write**.

## Automated release (recommended)

Bump `version` in `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml`, then:

```bash
git add -A
git commit -m "chore: release v0.3.0"
git tag v0.3.0
git push origin main
git push origin v0.3.0
```

Pushing a `v*.*.*` tag runs [.github/workflows/release.yml](../.github/workflows/release.yml): verify → signed `tauri build` → GitHub Release + `latest.json`.

Or use **Actions → Release Grokden → Run workflow** (optional draft/prerelease flags).

## Local release (manual)

```powershell
.\scripts\load-signing-env.ps1
npm run check
npm run test:layout
npm run tauri build
.\scripts\verify-release.ps1
.\scripts\publish-release.ps1
```

## Version policy

- **Stable:** `v0.3.0` — not marked prerelease
- **Beta:** use `workflow_dispatch` with **Prerelease** checked, or tag `v0.3.0-beta.1`

## Windows Authenticode (optional)

Tauri updater signing (minisign `.sig`) is configured above. **Authenticode** (SmartScreen-trusted `.exe`) requires a separate `.pfx` certificate and is not included in this repo.