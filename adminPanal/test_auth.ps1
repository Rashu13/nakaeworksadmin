$body = '{"email":"admin@test.com","password":"admin123"}'
try {
    $response = Invoke-RestMethod -Uri 'http://localhost:5001/api/auth/login' -Method POST -Body $body -ContentType 'application/json'
    Write-Host "=== LOGIN RESPONSE ==="
    Write-Host ($response | ConvertTo-Json -Depth 5)
    
    $token = $response.token
    Write-Host "`n=== JWT TOKEN ==="
    Write-Host $token
    
    # Decode JWT payload
    $parts = $token.Split('.')
    $payload = $parts[1]
    # Add padding
    $mod = $payload.Length % 4
    if ($mod -gt 0) { $payload += ('=' * (4 - $mod)) }
    $decoded = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payload))
    Write-Host "`n=== DECODED JWT PAYLOAD ==="
    Write-Host $decoded
    
    # Test admin endpoint
    Write-Host "`n=== TESTING ADMIN DASHBOARD ==="
    $headers = @{ Authorization = "Bearer $token" }
    $adminResponse = Invoke-WebRequest -Uri 'http://localhost:5001/api/admin/dashboard' -Headers $headers -Method GET -UseBasicParsing
    Write-Host "Status: $($adminResponse.StatusCode)"
    Write-Host $adminResponse.Content.Substring(0, [Math]::Min(500, $adminResponse.Content.Length))
} catch {
    Write-Host "ERROR: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode) ($($_.Exception.Response.StatusCode.value__))"
    }
}
