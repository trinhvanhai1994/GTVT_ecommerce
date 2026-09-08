$ErrorActionPreference = "Stop"
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
New-Item -ItemType Directory -Force -Path "$root\logs" | Out-Null

docker compose up -d rabbitmq
powershell -File "$root\scripts\init-postgres.ps1"

mvn -q -DskipTests package

function Start-Jar([string]$dir) {
  $jar = Get-ChildItem "$root\$dir\target\*.jar" | Where-Object { $_.Name -notlike '*original*' } | Select-Object -First 1
  if (-not $jar) { throw "Missing jar for $dir" }
  Write-Host "starting $dir $($jar.Name)"
  Start-Process -FilePath "$env:JAVA_HOME\bin\java.exe" -ArgumentList @("-DEUREKA_ENABLED=true", "-jar", $jar.FullName) -WorkingDirectory $root -WindowStyle Minimized
}

function Wait-Healthy([int]$port, [int]$tries = 30) {
  for ($i = 0; $i -lt $tries; $i++) {
    try {
      $h = Invoke-RestMethod "http://127.0.0.1:$port/actuator/health" -TimeoutSec 2
      if ($h.status -eq "UP") { Write-Host "UP $port"; return }
    } catch { Start-Sleep -Seconds 2 }
  }
  throw "Port $port did not become healthy"
}

$env:EUREKA_ENABLED = "true"

Start-Jar "eureka-server"
Wait-Healthy 8761
Start-Jar "admin-server"
Wait-Healthy 8088

$modules = @(
  "gateway",
  "auth-service",
  "product-service",
  "cart-service",
  "inventory-service",
  "payment-service",
  "notification-service",
  "order-service"
)
foreach ($dir in $modules) { Start-Jar $dir }

Write-Host "Waiting for services..."
foreach ($port in @(8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087)) {
  Wait-Healthy $port
}
Write-Host "Backend is up"
Write-Host "Flow logs UI: http://localhost:8088/flow"
Write-Host "Spring Boot Admin: http://localhost:8088"
