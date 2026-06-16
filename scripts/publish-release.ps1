#Requires -Version 5.1
<#
.SYNOPSIS
  Publish Grokden Windows installers to GitHub Releases.

.DESCRIPTION
  Requires GitHub CLI (gh) and an authenticated session:
    gh auth login

  Run after a successful release build:
    npm run tauri build
    .\scripts\verify-release.ps1
    .\scripts\publish-release.ps1

  Optional parameters:
    -Tag v0.1.0
    -Title "Grokden 0.1.0"
    -Draft
    -Prerelease
#>
[CmdletBinding()]
param(
    [string]$Tag = "v0.1.0",
    [string]$Title = "Grokden 0.1.0",
    [switch]$Draft,
    [switch]$Prerelease
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$Nsis = Join-Path $RepoRoot 'src-tauri\target\release\bundle\nsis\Grokden_0.1.0_x64-setup.exe'
$Msi = Join-Path $RepoRoot 'src-tauri\target\release\bundle\msi\Grokden_0.1.0_x64_en-US.msi'

function Require-File {
    param([string]$Path, [string]$Hint)
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Missing file: $Path. $Hint"
    }
}

Require-File -Path $Nsis -Hint 'Run: npm run tauri build'
Require-File -Path $Msi -Hint 'Run: npm run tauri build'

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'GitHub CLI (gh) is not installed. Install with: winget install GitHub.cli'
}

$auth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    throw @"
Not logged in to GitHub. Run once:
  gh auth login
Choose: GitHub.com -> HTTPS -> Login with a web browser
"@
}

function Get-Sha256([string]$Path) {
    (Get-FileHash -Path $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

$nsisHash = Get-Sha256 $Nsis
$msiHash = Get-Sha256 $Msi

$notes = @"
Grokden 0.1.0 — Windows desktop workspace for Grok CLI.

## Requirements

Install Grok CLI before using Grokden:

**Windows (PowerShell):**
```
irm https://x.ai/cli/install.ps1 | iex
```

**macOS / Linux:**
```
curl -fsSL https://x.ai/cli/install.sh | bash
```

Grokden also needs the Microsoft Edge WebView2 runtime. The installers below install it automatically if it is missing (internet required during setup).

## Downloads

| File | Use |
|------|-----|
| Grokden_0.1.0_x64-setup.exe | Recommended for most users (NSIS setup wizard) |
| Grokden_0.1.0_x64_en-US.msi | For IT / enterprise deployment (Windows Installer) |

## SHA-256 checksums

- NSIS: ``$nsisHash``
- MSI: ``$msiHash``

## After install

1. Launch Grokden from the Start menu.
2. Open a folder.
3. Use **Launch Grok CLI** or **Parallel Agents** from the top bar.
"@

$args = @(
    'release', 'create', $Tag,
    $Nsis,
    $Msi,
    '--title', $Title,
    '--notes', $notes
)

if ($Draft) { $args += '--draft' }
if ($Prerelease) { $args += '--prerelease' }

Write-Host "Publishing $Tag to GitHub Releases..." -ForegroundColor Cyan
& gh @args
if ($LASTEXITCODE -ne 0) {
    throw "gh release create failed with exit code $LASTEXITCODE"
}

Write-Host ''
Write-Host "Release published: https://github.com/TheBugHunter999/AetherForge/releases/tag/$Tag" -ForegroundColor Green