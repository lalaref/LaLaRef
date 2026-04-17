@echo off
chcp 65001 >nul
echo ========================================
echo Chinese Encoding Fix Script
echo ========================================
echo.
echo Starting fix process...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$PSDefaultParameterValues['*:Encoding'] = 'utf8'; $files = @('index.html', 'service.html', 'news.html', 'booking-admin.html', 'track-booking.html', '404.html', '500.html'); foreach ($file in $files) { if (Test-Path $file) { Write-Host \"Processing: $file\" -ForegroundColor Yellow; $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8); $utf8 = New-Object System.Text.UTF8Encoding $true; [System.IO.File]::WriteAllText($file, $content, $utf8); Write-Host \"  Fixed: $file\" -ForegroundColor Green } else { Write-Host \"  Not found: $file\" -ForegroundColor Red } }"

echo.
echo ========================================
echo Process Complete!
echo ========================================
echo.
echo All files have been re-saved with proper UTF-8 encoding.
echo Please check the files in your browser.
echo.
pause
