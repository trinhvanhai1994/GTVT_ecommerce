param(
    [switch]$RestartOnly,
    [switch]$SkipMaven
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# Leftover containers from another Compose project (same container_name, different folder).
$named = @(
    "ecommerce-postgres",
    "ecommerce-rabbitmq",
    "ecommerce-eureka",
    "ecommerce-admin",
    "ecommerce-gateway",
    "ecommerce-auth",
    "ecommerce-product",
    "ecommerce-cart",
    "ecommerce-inventory",
    "ecommerce-order",
    "ecommerce-payment",
    "ecommerce-notification",
    "ecommerce-frontend"
)

$composeProject = $null
try {
    $composeProject = (docker compose config --format json | ConvertFrom-Json).name
} catch {
    $composeProject = "gtvt_ecommerce"
}

foreach ($name in $named) {
    docker inspect $name 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) { continue }
    $labelsJson = docker inspect $name --format "{{json .Config.Labels}}" 2>$null
    $owner = $null
    if ($labelsJson) {
        $owner = ($labelsJson | ConvertFrom-Json).'com.docker.compose.project'
    }
    if ($owner -eq $composeProject) { continue }
    Write-Host "Removing leftover container $name (was project='$owner'; this stack='$composeProject')"
    docker rm -f $name | Out-Null
}

if ($RestartOnly) {
    docker compose up -d
    if ($LASTEXITCODE -ne 0) { throw "docker compose up failed" }
} else {
    if (-not $SkipMaven) {
        Write-Host "Maven package (once, cache volume gtvt-ecommerce-m2)..."
        $src = ($root -replace "\\", "/")
        docker run --rm `
            -v "${src}:/src" `
            -v gtvt-ecommerce-m2:/root/.m2 `
            -w /src `
            maven:3.9.9-eclipse-temurin-21 `
            mvn -q -DskipTests package
        if ($LASTEXITCODE -ne 0) { throw "Maven package failed" }
    }
    docker compose up -d --build
    if ($LASTEXITCODE -ne 0) { throw "docker compose up failed" }
}

Write-Host ""
Write-Host "Storefront  http://localhost:5173"
Write-Host "Gateway     http://localhost:8080"
Write-Host "Eureka      http://localhost:8761"
Write-Host "Admin/flow  http://localhost:8088/flow"
Write-Host "RabbitMQ    http://localhost:15672  ecommerce/ecommerce"
Write-Host "Postgres    localhost:5432          postgres/123456"
Write-Host ""
Write-Host "Restart containers only:  .\scripts\deploy.ps1 -RestartOnly"
Write-Host "Rebuild images, skip Maven: .\scripts\deploy.ps1 -SkipMaven"
