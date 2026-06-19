#Requires -Version 5.1
<#
.SYNOPSIS
  Upload Grokden Tauri signing credentials to GitHub Actions secrets (one-time setup).

.DESCRIPTION
  Reads the local key from OneDrive TauriKey and sets:
    TAURI_SIGNING_PRIVATE_KEY
    TAURI_SIGNING_PRIVATE_KEY_PASSWORD

  Prerequisites:
    gh auth login
    Settings -> Actions -> Workflow permissions -> Read and write

.EXAMPLE
  .\scripts\setup-github-secrets.ps1
  .\scripts\setup-github-secrets.ps1 -KeyDir "C:\Users\int_v\OneDrive\Desktop\TauriKey"
#>
[CmdletBinding()]
param(
    [string]$KeyDir = "C:\Users\int_v\OneDrive\Desktop\TauriKey",
    [string]$Repo = "TheBugHunter999/Grokden"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$KeyPath = Join-Path $KeyDir 'grokden.key'
$PasswordPath = Join-Path $KeyDir '.key-password.txt'
$PubPath = Join-Path $KeyDir 'grokden.key.pub'

foreach ($path in @($KeyPath, $PasswordPath, $PubPath)) {
    if (-not (Test-Path -LiteralPath $path)) {
        throw "Missing required file: $path"
    }
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'Install GitHub CLI: winget install GitHub.cli'
}

gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'Run: gh auth login'
}

$key = (Get-Content -LiteralPath $KeyPath -Raw).Trim()
$password = (Get-Content -LiteralPath $PasswordPath -Raw).Trim()
$pub = (Get-Content -LiteralPath $PubPath -Raw).Trim()

Write-Host "Setting GitHub Actions secrets on $Repo ..." -ForegroundColor Cyan
$key | gh secret set TAURI_SIGNING_PRIVATE_KEY --repo $Repo
$password | gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD --repo $Repo

Write-Host ''
Write-Host 'Secrets configured.' -ForegroundColor Green
Write-Host 'Public key (must match src-tauri/tauri.conf.json plugins.updater.pubkey):' -ForegroundColor Yellow
Write-Host $pub
Write-Host ''
Write-Host 'Next steps:' -ForegroundColor Cyan
Write-Host '  1. Confirm Workflow permissions: Read and write (Settings -> Actions -> General)'
Write-Host '  2. Release via Actions -> Release Grokden -> Run workflow'
Write-Host '     OR: git tag v0.3.0 && git push origin v0.3.0'