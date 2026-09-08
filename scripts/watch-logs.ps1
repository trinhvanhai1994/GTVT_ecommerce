# Follow flow logs. Usage:
#   powershell -File scripts\watch-logs.ps1
#   powershell -File scripts\watch-logs.ps1 -Service GATEWAY
#   powershell -File scripts\watch-logs.ps1 -Service ORDER-SERVICE

param(
  [string]$Service = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $root "logs"
if (-not (Test-Path $logDir)) {
  Write-Host "Chua co thu muc logs. Chay start-local.ps1 roi goi API truoc."
  exit 1
}

Write-Host "Log folder: $logDir"
Get-ChildItem $logDir -Filter "*.log" | ForEach-Object { Write-Host " - $($_.Name)  $($_.Length) bytes" }

if ($Service) {
  $file = Join-Path $logDir "$Service.log"
  if (-not (Test-Path $file)) {
    Write-Host "Khong thay $file"
    exit 1
  }
  Write-Host "Follow $file  (Ctrl+C de thoat)"
  Get-Content $file -Wait -Tail 80
  exit 0
}

$gw = Join-Path $logDir "GATEWAY.log"
if (Test-Path $gw) {
  Write-Host "Follow GATEWAY.log  (Ctrl+C). Service khac: -Service ORDER-SERVICE"
  Get-Content $gw -Wait -Tail 80
} else {
  Write-Host "Chua co GATEWAY.log. Restart backend: powershell -File scripts\start-local.ps1"
  Write-Host "Roi goi API qua http://localhost:8080"
}
