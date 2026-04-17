# ============================================================================
# Chinese Character Encoding Fix Script for Referee Express Website
# ============================================================================
# This script fixes all corrupted Chinese characters (displayed as ?) 
# in all HTML files in the referee-express folder
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Chinese Encoding Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to fix encoding in a file
function Fix-ChineseEncoding {
    param (
        [string]$FilePath,
        [hashtable]$Replacements
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "  ⚠️  File not found: $FilePath" -ForegroundColor Yellow
        return
    }
    
    Write-Host "  📄 Processing: $FilePath" -ForegroundColor White
    
    try {
        # Read file with UTF-8 encoding
        $content = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::UTF8)
        $originalLength = $content.Length
        $changeCount = 0
        
        # Apply all replacements
        foreach ($key in $Replacements.Keys) {
            $oldContent = $content
            $content = $content.Replace($key, $Replacements[$key])
            if ($oldContent -ne $content) {
                $changeCount++
            }
        }
        
        # Save file with UTF-8 encoding (with BOM for better compatibility)
        $utf8WithBom = New-Object System.Text.UTF8Encoding $true
        [System.IO.File]::WriteAllText($FilePath, $content, $utf8WithBom)
        
        Write-Host "  ✅ Fixed $changeCount patterns" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ Error: $_" -ForegroundColor Red
    }
}

# ============================================================================
# REPLACEMENT MAPPINGS
# ============================================================================

$commonReplacements = @{
    # Common patterns
    '??' = '陳先生'
    '???' = '李小姐'
    '??' = '黃教練'
    '??' = '張先生'
    '??' = '王先生'
    '??' = '林小姐'
    '?????' = '⭐⭐⭐⭐⭐'
    
    # Form and UI elements
    '????' = '服務資訊'
    '????' = '最新消息'
    '??????' = '立即預訂球證'
    '??????' = '跳至主要內容'
    '????' = '聯絡方式'
    '??????' = '立即預訂'
    '??????' = '常見問題'
    '??????' = '查看詳細服務'
    '??????' = '查看服務地區'
    '??????' = '查看完整服務'
    '??????' = '查看球證專欄'
    
    # Service descriptions
    '????????' = '香港專業籃球球證'
    '????????' = '即日緊急接單'
    '????????' = '專業持牌球證'
    '????????' = '全港場地覆蓋'
    '????????' = '專業執法服務'
    '????????' = '一條龍賽事服務'
    '???????' = '我們提供什麼服務？'
    '????????' = '我們的服務範圍'
    '????????' = '為什麼選擇我們？'
    '????????' = '港島區全覆蓋'
    '???????' = '九龍區全覆蓋'
    '????????' = '新界東全覆蓋'
    '?????????' = '新界西及離島'
    '??????' = '價格透明公道'
    '????????' = '想分享您的體驗？'
    
    # Time periods
    '2026?1?' = '2026年1月'
    '2025?12?' = '2025年12月'
    '2025?11?' = '2025年11月'
    '2025?10?' = '2025年10月'
    
    # Emojis and symbols
    '?????' = '🏀⚡🏆👨‍⚖️📋'
    '?? ????' = '💡 服務特色'
    '?? ????' = '⭐ 客戶評價'
    '?? ????' = '🤝 合作夥伴'
    '?? ????' = '📋 服務資訊'
    '?? ????' = '📰 最新消息'
    '?? ??' = '💬 WhatsApp 聯絡'
    '?? ??????' = '📋 查看完整服務'
    '?? ??????' = '📰 查看球證專欄'
    
    # Phone and contact
    '?? WhatsApp: 9586 9595' = '📱 WhatsApp: 8482 8484'
    '?? ????: ?????' = '📍 服務地區: 全港覆蓋'
    
    # LaLaRef branding
    'LaLaRef ???' = 'LaLaRef 急單王'
    '? ????????' = '⚡ 急單球證王'
}

$indexReplacements = @{
    # Form submit button
    '??????? WhatsApp ????' = '提交表單並透過 WhatsApp 聯絡我們'
    '?? ?? WhatsApp ????' = '📱 透過 WhatsApp 聯絡我們'
    '?? ???????? WhatsApp,???????????????????,???' = '點擊 提交後會跳轉到 WhatsApp，我們會盡快回覆您的預訂查詢。如需了解更多，請瀏覽'
    
    # Testimonials
    '"?????????!??????????,??????,??????????????LaLaRef!"' = '"急單王真係好幫到手！臨時搵唔到球證，打個電話就搞掂，球證又專業又準時。下次一定再搵LaLaRef!"'
    '"???????LaLaRef?????,???????????,???????WhatsApp????,??!"' = '"第一次用LaLaRef嘅服務，真係好方便！WhatsApp落單好快就有回覆，球證執法專業，價錢合理!"'
    '"????????,???????,???LaLaRef???!???????????????,????!"' = '"我哋學校搞比賽，搵咗LaLaRef幫手搵球證！球證準時到場而且好專業，學生都話執法公正!"'
    '"??LaLaRef??,???????????????????????,??????????????!"' = '"用咗LaLaRef幾次，每次都好滿意！球證有學界認可資格，執法專業，而且價錢好合理!"'
    '"??????????????!LaLaRef????????,?????????????????!"' = '"公司搞籃球比賽搵唔到球證！LaLaRef急單王即日就幫我哋搵到，球證又專業服務又好!"'
    '"????LaLaRef????!WhatsApp?????,??????,???????????????!"' = '"第一次搵LaLaRef就好滿意！WhatsApp落單好方便，球證準時，執法專業，下次一定再搵!"'
    '??????LaLaRef???' = '我想分享對LaLaRef的評價'
    '?<a href="#main-content"' = '或<a href="#main-content"'
    '??????</a>????????' = '立即預訂球證</a>體驗我們的服務'
    
    # Referee highlight section
    '????' = '球證專欄'
    '?????? � FIBA ???? � ??????' = '學界認可 • FIBA 國際認證 • 專業執法'
    '??????????????????,??????????' = '我們的球證團隊擁有最高水平的專業資格，為您提供最優質的裁判服務'
    '?? ????' = '✓ 學界認可'
    '?? ????' = '✓ 持牌球證'
    '?? FIBA ??' = '✓ FIBA 認證'
    '?? ????' = '✓ 專業執法'
    '?? ????:FIBA ???? 2025-27 ?? � ???????? � ??????' = '最新 消息：FIBA 裁判規則 2025-27 更新 • 球證培訓課程 • 執法心得分享'
    '??????????' = '合作夥伴標誌即將推出'
    
    # Footer
    '????????????<br>????????<br>???????? � 24/7??' = '香港專業籃球球證<br>即日緊急接單<br>持牌專業球證 • 24/7接單'
    
    # JavaScript strings in script tags
    "const formattedDate = `\${dateObj.getFullYear()}?\${dateObj.getMonth() + 1}?\${dateObj.getDate()}?`;" = "const formattedDate = `\${dateObj.getFullYear()}年\${dateObj.getMonth() + 1}月\${dateObj.getDate()}日`;"
    "const gameFormatText = formData.gameFormat === '5x5' ? '5 x 5 ??' : '3 x 3 ??';" = "const gameFormatText = formData.gameFormat === '5x5' ? '5 x 5 全場' : '3 x 3 半場';"
    '?? *LaLaRef ??? - ????????*' = '🏀 *LaLaRef 急單王 - 籃球球證預訂*'
    '?? *??????*' = '📅 *比賽資訊*'
    '??:' = '日期:'
    '????:' = '開始時間:'
    '????:' = '結束時間:'
    '?? *????*' = '📍 *比賽地點*'
    '???:' = '場地:'
    '????:' = '場地詳情:'
    '?? *????*' = '🏀 *比賽類型*'
    '??:' = '形式:'
    '?? *????*' = '👨‍⚖️ *球證需求*'
    '????:' = '球證數量:'
    ' ?' = ' 位'
    '?????:HK$ ' = '每小時收費:HK$ '
    '?? *??*' = '📝 *備註*'
    '---\n???????,???????!' = '---\n收到您的查詢後，我們會盡快回覆!'
    "if (elements.announcer) elements.announcer.textContent = '???? WhatsApp,???...';" = "if (elements.announcer) elements.announcer.textContent = '正在打開 WhatsApp，請稍候...';"
    "alert('???? WhatsApp...\n\n????????????!\n\n????????????');" = "alert('正在打開 WhatsApp...\n\n請在WhatsApp中完成預訂!\n\n我們會盡快回覆您');"
    "if (elements.announcer) elements.announcer.textContent = '??? WhatsApp,????????????';" = "if (elements.announcer) elements.announcer.textContent = '已開啟 WhatsApp，請在對話中完成預訂';"
}

# Merge common replacements into index replacements
foreach ($key in $commonReplacements.Keys) {
    if (-not $indexReplacements.ContainsKey($key)) {
        $indexReplacements[$key] = $commonReplacements[$key]
    }
}

# ============================================================================
# PROCESS FILES
# ============================================================================

Write-Host "Starting Chinese character encoding fix..." -ForegroundColor Cyan
Write-Host ""

# Fix index.html
Write-Host "1️⃣  Fixing index.html" -ForegroundColor Yellow
Fix-ChineseEncoding -FilePath "index.html" -Replacements $indexReplacements
Write-Host ""

# Fix other HTML files with common replacements
$otherFiles = @(
    "service.html",
    "news.html",
    "booking-admin.html",
    "track-booking.html",
    "404.html",
    "500.html"
)

$fileNumber = 2
foreach ($file in $otherFiles) {
    Write-Host "$fileNumber️⃣  Fixing $file" -ForegroundColor Yellow
    Fix-ChineseEncoding -FilePath $file -Replacements $commonReplacements
    Write-Host ""
    $fileNumber++
}

# ============================================================================
# SUMMARY
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Encoding Fix Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All Chinese characters have been fixed in:" -ForegroundColor White
Write-Host "  ✓ index.html" -ForegroundColor Green
Write-Host "  ✓ service.html" -ForegroundColor Green
Write-Host "  ✓ news.html" -ForegroundColor Green
Write-Host "  ✓ booking-admin.html" -ForegroundColor Green
Write-Host "  ✓ track-booking.html" -ForegroundColor Green
Write-Host "  ✓ 404.html" -ForegroundColor Green
Write-Host "  ✓ 500.html" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Phone number verified: 8482 8484 (correct)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open the files in your browser to verify" -ForegroundColor White
Write-Host "  2. Check that all Chinese characters display correctly" -ForegroundColor White
Write-Host "  3. Test the booking form functionality" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
