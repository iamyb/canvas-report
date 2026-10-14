# Start the canvas-report dev server (prints the URL and exits if already running)
# Usage: powershell -ExecutionPolicy Bypass -File scripts\start.ps1
$ErrorActionPreference = "Stop"

$Target = if ($env:CANVAS_REPORT_HOME) { $env:CANVAS_REPORT_HOME } else { Join-Path $env:USERPROFILE ".canvas-report" }
$Port = if ($env:PORT) { [int]$env:PORT } else { 5199 }

if (-not (Test-Path (Join-Path $Target "node_modules"))) {
  Write-Error "Not installed yet, run setup.ps1 first"
}

try {
  Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 "http://localhost:$Port/" | Out-Null
  Write-Host "[canvas-report] dev server already running: http://localhost:$Port/"
  exit 0
} catch { }

Write-Host "[canvas-report] starting dev server (port $Port)..."
# npm is a .cmd file and must be launched via cmd /c
$proc = Start-Process -FilePath "cmd" -ArgumentList "/c","npm","run","dev" -WorkingDirectory $Target `
  -RedirectStandardOutput "$env:TEMP\canvas-report-dev.log" -RedirectStandardError "$env:TEMP\canvas-report-dev.err.log" `
  -WindowStyle Hidden -PassThru

$ok = $false
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  try {
    Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 "http://localhost:$Port/" | Out-Null
    $ok = $true
    break
  } catch { }
}

if ($ok) {
  Write-Host "[canvas-report] ready: http://localhost:$Port/"
} else {
  Write-Error "dev server not ready within 30s, check the log: $env:TEMP\canvas-report-dev.log"
}
