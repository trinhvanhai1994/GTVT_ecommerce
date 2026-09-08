$ErrorActionPreference = "Stop"
$base = "http://localhost:8080"

function Login($email) {
  $body = @{ email = $email; password = "Password123" } | ConvertTo-Json
  $res = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType "application/json" -Body $body
  return $res.data.accessToken
}

function AuthHeaders($token) {
  return @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
}

Write-Host "== Health =="
Invoke-RestMethod "$base/actuator/health" | ConvertTo-Json -Compress

Write-Host "== Ensure stock =="
$admin = AuthHeaders (Login "admin@example.com")
try {
  Invoke-RestMethod -Method Put -Uri "$base/api/inventory/1" -Headers $admin -Body (@{ availableQuantity = 50 } | ConvertTo-Json) | Out-Null
} catch {
  Write-Host "warn: could not upsert inventory 1"
}

Write-Host "== Golden Path =="
$token = Login "customer@example.com"
$h = AuthHeaders $token

$invBefore = Invoke-RestMethod "$base/api/inventory/1" -Headers (AuthHeaders (Login "admin@example.com"))
$availBefore = $invBefore.data.availableQuantity
Write-Host "inventory product 1 available before=$availBefore"

Invoke-RestMethod -Method Delete -Uri "$base/api/cart" -Headers $h | Out-Null
$add = @{ productId = 1; quantity = 1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$base/api/cart/items" -Headers $h -Body $add | Out-Null

$checkout = @{
  shippingName = "E2E Customer"
  shippingPhone = "0900000000"
  shippingAddress = "Ha Noi"
  paymentMethod = "MOCK_CARD"
  simulatePaymentFailure = $false
} | ConvertTo-Json
$order = Invoke-RestMethod -Method Post -Uri "$base/api/orders" -Headers $h -Body $checkout
Write-Host "golden order id=$($order.data.id) status=$($order.data.status) payment=$($order.data.payment.status)"
if ($order.data.status -ne "CONFIRMED") { throw "Golden path expected CONFIRMED" }

Start-Sleep -Seconds 2
$invAfter = Invoke-RestMethod "$base/api/inventory/1" -Headers (AuthHeaders (Login "admin@example.com"))
Write-Host "inventory after success available=$($invAfter.data.availableQuantity) reserved=$($invAfter.data.reservedQuantity)"
if ($invAfter.data.availableQuantity -ge $availBefore) { throw "Expected available stock to decrease" }

$got = Invoke-RestMethod "$base/api/orders/$($order.data.id)" -Headers $h
if ($got.data.status -ne "CONFIRMED") { throw "Order fetch mismatch" }

Write-Host "== Failure Path =="
$availMid = $invAfter.data.availableQuantity
Invoke-RestMethod -Method Delete -Uri "$base/api/cart" -Headers $h | Out-Null
Invoke-RestMethod -Method Post -Uri "$base/api/cart/items" -Headers $h -Body $add | Out-Null
$failBody = @{
  shippingName = "E2E Fail"
  shippingPhone = "0900000000"
  shippingAddress = "Ha Noi"
  paymentMethod = "MOCK_CARD"
  simulatePaymentFailure = $true
} | ConvertTo-Json
$failed = Invoke-RestMethod -Method Post -Uri "$base/api/orders" -Headers $h -Body $failBody
Write-Host "failure order id=$($failed.data.id) status=$($failed.data.status)"
if ($failed.data.status -ne "PAYMENT_FAILED") { throw "Failure path expected PAYMENT_FAILED" }

Start-Sleep -Seconds 2
$invFail = Invoke-RestMethod "$base/api/inventory/1" -Headers (AuthHeaders (Login "admin@example.com"))
Write-Host "inventory after failure available=$($invFail.data.availableQuantity) reserved=$($invFail.data.reservedQuantity)"
if ($invFail.data.availableQuantity -ne $availMid) { throw "Expected inventory compensation (available restored to $availMid)" }

Write-Host "GOLDEN_PATH=PASS FAILURE_PATH=PASS"
