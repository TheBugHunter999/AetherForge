#Requires -Version 5.1
<#
.SYNOPSIS
  Rename the local project folder from AetherForge to Grokden.

.DESCRIPTION
  Close Cursor and any terminals using this repo before running.
  Run from any location: powershell -File scripts\rename-to-grokden.ps1
#>
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$source = 'C:\AetherForge'
$target = 'C:\Grokden'

if (Test-Path -LiteralPath $target) {
    Write-Error "Target already exists: $target"
}

if (-not (Test-Path -LiteralPath $source)) {
    Write-Error "Source folder not found: $source"
}

Rename-Item -LiteralPath $source -NewName 'Grokden'
Write-Host "Renamed $source to $target"
Write-Host "Reopen the project in Cursor from $target"