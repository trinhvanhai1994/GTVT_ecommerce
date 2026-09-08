$ErrorActionPreference = "Stop"

$psql = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$env:PGPASSWORD = "123456"
$hostName = "localhost"
$port = "5432"
$user = "postgres"

$databases = @(
    "auth_db",
    "product_db",
    "cart_db",
    "inventory_db",
    "order_db",
    "payment_db",
    "notification_db"
)

foreach ($database in $databases) {
    $exists = & $psql -h $hostName -p $port -U $user -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$database'"
    if ($exists -eq "1") {
        Write-Host "exists  $database"
        continue
    }
    & $psql -h $hostName -p $port -U $user -d postgres -c "CREATE DATABASE $database"
    if ($LASTEXITCODE -ne 0) {
        throw "Cannot create $database. Check postgres / 123456 at ${hostName}:${port}"
    }
    Write-Host "created $database"
}
