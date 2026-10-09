param(
    [switch]$RestartOnly,
    [switch]$SkipMaven
)

$ErrorActionPreference = "Stop"
$scriptDir = $PSScriptRoot
$ops = Join-Path $scriptDir "ops-deploy.sh"

$bash = Get-Command bash -ErrorAction SilentlyContinue
if (-not $bash) {
    throw "bash not found. On Windows install Git Bash, or run: bash scripts/ops-deploy.sh full"
}

$argsList = @("full")
if ($RestartOnly) { $argsList += "--restart-only" }
if ($SkipMaven) { $argsList += "--skip-maven" }

& bash $ops @argsList
if ($LASTEXITCODE -ne 0) { throw "ops-deploy.sh failed with exit $LASTEXITCODE" }
