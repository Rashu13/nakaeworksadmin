# NakaeWorks - Start Both Backend & Frontend
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NakaeWorks Dev Server Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend (.NET API) in background
Write-Host "[1/2] Starting Backend (dotnet run)..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "dotnet" -ArgumentList "run","--launch-profile","http" -WorkingDirectory "$PSScriptRoot\backend_net\NakaeWorks.Backend" -PassThru -NoNewWindow
Write-Host "  Backend started (PID: $($backend.Id)) -> http://localhost:5001" -ForegroundColor Green

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start Frontend (Vite) in background  
Write-Host "[2/2] Starting Frontend (npm run dev)..." -ForegroundColor Yellow
$frontend = Start-Process -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory "$PSScriptRoot\adminPanal" -PassThru -NoNewWindow
Write-Host "  Frontend started (PID: $($frontend.Id)) -> http://localhost:5173" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Both servers are running!" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5001" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Press Ctrl+C to stop both..." -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Wait for either to exit, then cleanup both
try {
    while (!$backend.HasExited -and !$frontend.HasExited) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`nShutting down..." -ForegroundColor Red
    if (!$backend.HasExited) { Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue }
    if (!$frontend.HasExited) { Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue }
    Write-Host "Both servers stopped." -ForegroundColor Yellow
}
