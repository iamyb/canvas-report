# canvas-report global install (Windows PowerShell)
# Installs the runtime project into %USERPROFILE%\.canvas-report, keeping the workspace clean.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
$ErrorActionPreference = "Stop"

$SkillDir = Split-Path -Parent $PSScriptRoot
$Target = if ($env:CANVAS_REPORT_HOME) { $env:CANVAS_REPORT_HOME } else { Join-Path $env:USERPROFILE ".canvas-report" }

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "Node.js >= 18 is required, install it first: https://nodejs.org"
}

New-Item -ItemType Directory -Force -Path (Join-Path $Target "src\reports") | Out-Null
tar -xzf (Join-Path $SkillDir "scripts\canvas-report-assets.tar.gz") -C $Target

$needInstall = -not (Test-Path (Join-Path $Target "node_modules"))
if (-not $needInstall) {
  # version marker is newer than node_modules → skill was updated, dependencies may have changed
  $ver = Get-Item (Join-Path $Target ".canvas-version")
  $nm = Get-Item (Join-Path $Target "node_modules")
  if ($ver.LastWriteTime -gt $nm.LastWriteTime) { $needInstall = $true }
}

if ($needInstall) {
  Write-Host "[canvas-report] installing dependencies (npm ci)..."
  Push-Location $Target
  try { npm ci --no-audit --no-fund } finally { Pop-Location }
} else {
  Write-Host "[canvas-report] dependencies up to date, skipping install"
}

Write-Host "[canvas-report] ready: $Target"
Write-Host "[canvas-report] start: powershell -ExecutionPolicy Bypass -File `"$SkillDir\scripts\start.ps1`""
