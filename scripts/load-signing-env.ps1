#Requires -Version 5.1
<#
.SYNOPSIS
  Load Grokden Tauri updater signing environment variables.

.DESCRIPTION
  Dot-sources the local secrets file maintained outside the repo.
  See $env:USERPROFILE\.grok\skills\grokden-release\SKILL.md (local Grok skill).
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$OneDriveLoader = 'C:\Users\int_v\OneDrive\Desktop\TauriKey\grokden-tauri-signing.ps1'
$SecretsPath = Join-Path $env:USERPROFILE '.grok\secrets\grokden-tauri-signing.ps1'

if (Test-Path -LiteralPath $OneDriveLoader) {
    . $OneDriveLoader
}
elseif (Test-Path -LiteralPath $SecretsPath) {
    . $SecretsPath
}
else {
    throw @"
Missing signing secrets. Expected one of:
  $OneDriveLoader
  $SecretsPath
Run scripts/setup-github-secrets.ps1 after generating keys in OneDrive\Desktop\TauriKey
"@
}

if (-not $env:TAURI_SIGNING_PRIVATE_KEY -or -not $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD) {
    throw 'Signing env incomplete after loading secrets file.'
}

Write-Host 'Loaded Grokden Tauri signing environment.' -ForegroundColor Green