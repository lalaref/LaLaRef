#!/usr/bin/env python3
"""
LaLaRef Daily Blog Post Generator
Generates a unique basketball referee blog post each day using template rotation.
No AI API needed — uses a large pool of pre-written topics and content blocks.
"""

import json
import os
import random
from datetime import datetime, timezone, timedelta

# Hong Kong timezone
HKT = timezone(timedelta(hours=8))
TODAY = datetime.now(HKT)
DATE_STR = TODAY.strftime('%Y-%m-%d')
DATE_DISPLAY = f"{TODAY.year}年{TODAY.month}月{TODAY.day}日"

# Use date as seed for reproducible but unique daily content
random.seed(int(TODAY.strftime('%Y%m%d')))

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ============================================================
# TOPIC POOL — each topic has title, sections, and content
# ============================================================
TOPICS = [
    {
        "title": "籃球球證/裁判必學：走步違例的判罰標準",
        "icon": "🦶",
        "category": "規則解析",
        "reading_time": 6,
        "sections": [
            {"h2": "什麼是走步違例？", "content": "走步違例（Travelling）是籃球比賽中最常見的違例之一。當持球球員在沒有運球的情況下移動超過規定步數，球證/裁判就會判罰走步違例。根據 FIBA 規則，球員在接球後可以走兩步，但必須在第二步落地前將球傳出或投籃。"},
            {"h2": "常見的走步情況", "content": "在實際比賽中，走步違例最常出現在以下幾種情況：接球後急停時多走了一步、上籃時收球過早導致多走步、轉身動作中軸心腳移動、以及接球後未確立軸心腳就移動。球證/裁判需要在瞬間判斷球員的腳步是否合規。"},
            {"h2": "球證/裁判如何準確判罰", "content": "判罰走步需要球證/裁判密切注意球員的腳步動作。關鍵是確認軸心腳的位置——球員在持球時第一隻觸地的腳就是軸心腳，軸心腳一旦離地就不能再落回地面。球證/裁判應該養成觀察球員下半身的習慣，而不是只看球。"},
            {"h2": "實戰建議", "content": "對於新手球證/裁判，建議在練習時多觀看比賽錄像，特別注意球員接球和轉身的動作。在執法時，如果不確定是否走步，寧可不吹也不要亂吹——錯誤的判罰比漏判更影響比賽流暢度。隨著經驗累積，你會越來越準確。"}
        ]
    },
    {
        "title": "香港室內籃球場地推薦：球證/裁判執法體驗分享",
        "icon": "🏟️",
        "category": "場地資訊",
        "reading_time": 7,
        "sections": [
            {"h2": "修頓室內場館", "content": "位於灣仔的修頓室內場館是香港最具歷史的籃球場地之一。場地設有標準全場，地板為木質地面，適合正式比賽。球證/裁判在這裡執法的體驗相當好，場地照明充足，觀眾席與球場有適當距離，方便球證/裁判走位和觀察。"},
            {"h2": "九龍公園體育館", "content": "九龍公園體育館位於尖沙咀，交通便利。場地空間寬敞，冷氣充足，是夏天比賽的理想選擇。球證/裁判在這裡執法時需要注意場地兩側的牆壁距離較近，走位時要特別小心。記錄台設施完善，適合舉辦聯賽。"},
            {"h2": "荔枝角公園體育館", "content": "荔枝角公園體育館是九龍區熱門的籃球場地，經常舉辦各類私人聯賽。場地維護良好，地面防滑性能佳。球證/裁判在這裡執法時，建議提前到場熟悉場地環境，特別是籃架和邊線的位置。"},
            {"h2": "選擇場地的建議", "content": "作為球證/裁判，我們建議賽事組織者在選擇場地時考慮以下因素：場地大小是否符合比賽規格、照明是否充足、是否有獨立的記錄台區域、以及更衣室設施是否完善。好的場地能讓球證/裁判更專注於執法工作。"}
        ]
    },
    {
        "title": "籃球犯規判罰全解析：從普通犯規到技術犯規",
        "icon": "🚨",
        "category": "規則解析",
        "reading_time": 8,
        "sections": [
            {"h2": "普通犯規（Personal Foul）", "content": "普通犯規是籃球比賽中最常見的犯規類型。當球員與對手發生非法的身體接觸時，球證/裁判會判罰普通犯規。常見的普通犯規包括推人、拉人、阻擋和撞人。球證/裁判需要判斷哪一方球員造成了非法接觸。"},
            {"h2": "技術犯規（Technical Foul）", "content": "技術犯規通常與球員或教練的不當行為有關，例如對球證/裁判的判罰表示強烈不滿、使用不當語言、或故意延誤比賽。技術犯規的判罰需要球證/裁判有良好的溝通能力和判斷力，既要維護比賽秩序，也要避免過度敏感。"},
            {"h2": "違反體育精神犯規", "content": "違反體育精神犯規（Unsportsmanlike Foul）是指球員的犯規動作明顯不是在合法地嘗試搶球。例如在快攻時從背後拉住對手、或在對手上籃時做出危險動作。這類犯規的判罰標準是球員的動作是否針對球而非人。"},
            {"h2": "犯規判罰的藝術", "content": "好的球證/裁判不只是機械地執行規則，更要理解比賽的節奏和氛圍。在比賽初期可以適當寬鬆，讓球員適應判罰尺度；但對於危險動作和惡意犯規，必須果斷判罰。一致性是球證/裁判最重要的品質。"}
        ]
    },
    {
        "title": "3x3 籃球規則與 5x5 的主要區別",
        "icon": "🏀",
        "category": "規則解析",
        "reading_time": 6,
        "sections": [
            {"h2": "場地和人數", "content": "3x3 籃球在半場進行，每隊 3 名球員加 1 名替補。場地只有一個籃框，進攻和防守在同一個半場完成。這種緊湊的場地讓比賽節奏更快，球證/裁判需要更敏銳的反應能力。"},
            {"h2": "計分規則", "content": "3x3 的計分方式與 5x5 不同：弧線內投籃得 1 分，弧線外投籃得 2 分（而非 5x5 的 2 分和 3 分）。罰球每次得 1 分。比賽先得 21 分或 10 分鐘結束時得分較高的隊伍獲勝。球證/裁判需要熟悉這套不同的計分系統。"},
            {"h2": "進攻時限", "content": "3x3 的進攻時限只有 12 秒（5x5 為 24 秒），這意味著進攻節奏更快。每次投籃不中或得分後，防守方獲得球權時必須將球運出弧線外才能開始進攻。球證/裁判需要密切注意 12 秒計時。"},
            {"h2": "球證/裁判執法要點", "content": "3x3 比賽通常只有 1 名球證/裁判執法，這對球證/裁判的體能和判斷力要求更高。球證/裁判需要在狹小的空間內快速移動，同時關注所有球員的動作。建議新手球證/裁判先從 5x5 累積經驗，再嘗試 3x3 執法。"}
        ]
    },
    {
        "title": "球證/裁判體能訓練指南：保持最佳執法狀態",
        "icon": "💪",
        "category": "球證/裁判訓練",
        "reading_time": 7,
        "sections": [
            {"h2": "為什麼球證/裁判需要體能訓練", "content": "一場 40 分鐘的籃球比賽中，球證/裁判的跑動距離可達 5-7 公里。球證/裁判需要在整場比賽中保持高度專注，而良好的體能是專注力的基礎。體能不足的球證/裁判容易在比賽後段出現判罰失誤。"},
            {"h2": "有氧訓練建議", "content": "建議球證/裁判每週進行 3-4 次有氧訓練，每次 30-45 分鐘。跑步是最直接的訓練方式，但要加入間歇跑來模擬比賽中的加速和減速。例如：慢跑 2 分鐘 + 快跑 30 秒，重複 10 組。游泳和單車也是很好的交叉訓練選擇。"},
            {"h2": "敏捷性訓練", "content": "球證/裁判需要頻繁改變方向和速度。建議加入梯繩訓練、折返跑和側向移動練習。這些訓練能提升你在場上的移動效率，讓你更快到達最佳觀察位置。每週 2 次敏捷性訓練就足夠了。"},
            {"h2": "賽前熱身和賽後恢復", "content": "比賽前 15 分鐘進行動態熱身：高抬腿、開合跳、側向滑步。比賽後進行靜態拉伸，特別是小腿、大腿和腰部。充足的水分補充也很重要——比賽前 2 小時開始補水，比賽中每次暫停都要喝水。"}
        ]
    },
    {
        "title": "如何處理球員和教練的抗議：球證/裁判溝通技巧",
        "icon": "🗣️",
        "category": "執法技巧",
        "reading_time": 6,
        "sections": [
            {"h2": "保持冷靜是第一原則", "content": "面對球員或教練的抗議，球證/裁判最重要的是保持冷靜。不要與抗議者對罵或表現出情緒化的反應。深呼吸，用平穩的語氣回應。記住，你的冷靜會影響整個球場的氛圍。"},
            {"h2": "簡短而堅定的回應", "content": "當球員質疑判罰時，你可以簡短地解釋判罰原因，例如「阻擋犯規，防守球員未站好位置」。但不要過度解釋或與球員辯論。一句簡短的解釋就足夠了，然後繼續比賽。"},
            {"h2": "何時該判技術犯規", "content": "如果球員或教練的抗議超過合理範圍——例如持續不停地抱怨、使用侮辱性語言、或做出不尊重的手勢——球證/裁判應該果斷判罰技術犯規。這不是懲罰，而是維護比賽秩序的必要手段。"},
            {"h2": "賽後反思", "content": "每場比賽後，花幾分鐘回顧自己處理抗議的方式。有沒有更好的溝通方法？有沒有過度反應的時刻？持續的自我反思是提升溝通能力的最佳途徑。"}
        ]
    },
    {
        "title": "香港學界籃球賽事：球證/裁判執法注意事項",
        "icon": "🎓",
        "category": "學界籃球",
        "reading_time": 7,
        "sections": [
            {"h2": "學界比賽的特殊性", "content": "學界籃球比賽與成人比賽有很大不同。球員年齡較小，技術水平參差不齊，情緒控制能力也較弱。球證/裁判在學界比賽中不僅是執法者，更是教育者。適當的引導和鼓勵能幫助年輕球員建立正確的比賽態度。"},
            {"h2": "判罰尺度的調整", "content": "在學界比賽中，球證/裁判可以適當放寬判罰尺度，特別是對於技術性違例（如走步、兩次運球）。但對於危險動作和惡意犯規，必須嚴格判罰以保護球員安全。安全永遠是第一位的。"},
            {"h2": "與教練和家長的互動", "content": "學界比賽中，教練和家長的情緒有時比球員更激動。球證/裁判需要有耐心地處理這些情況。賽前可以主動與雙方教練溝通，說明判罰標準。對於過度激動的家長，可以請學校老師協助處理。"},
            {"h2": "培養下一代球證/裁判", "content": "學界比賽也是培養年輕球證/裁判的好機會。如果你是資深球證/裁判，可以帶領新手球證/裁判一起執法，在實戰中指導他們。這不僅幫助新人成長，也為香港籃球球證/裁判界培養後備力量。"}
        ]
    },
    {
        "title": "籃球球證/裁判手勢大全：場上溝通的語言",
        "icon": "✋",
        "category": "規則解析",
        "reading_time": 8,
        "sections": [
            {"h2": "為什麼手勢如此重要", "content": "在嘈雜的比賽環境中，球證/裁判的手勢是與記錄台、球員和觀眾溝通的主要方式。清晰、標準的手勢能讓所有人立即理解判罰內容，減少誤解和爭議。每位球證/裁判都應該熟練掌握所有標準手勢。"},
            {"h2": "犯規相關手勢", "content": "判罰犯規時，球證/裁判需要依次做出以下手勢：先舉拳示意犯規，然後指向犯規球員並報出號碼，接著示意犯規類型（推人、拉人、阻擋等），最後指示罰球或發界外球。整個過程要流暢而清晰。"},
            {"h2": "違例相關手勢", "content": "常見的違例手勢包括：走步（雙手握拳在胸前旋轉）、兩次運球（雙手掌心向下拍打）、三秒違例（伸出三根手指）、24秒違例（手指觸碰肩膀）。每個手勢都要做得大而明確，讓場邊的人也能看清楚。"},
            {"h2": "練習建議", "content": "建議在鏡子前練習手勢，確保動作標準。也可以錄影自己的手勢動作，與 FIBA 官方教學影片對比。在實際比賽中，手勢要配合哨聲使用——先吹哨停止比賽，再做手勢說明判罰。"}
        ]
    },
    {
        "title": "雨季籃球：室外比賽球證/裁判的應對策略",
        "icon": "🌧️",
        "category": "執法技巧",
        "reading_time": 5,
        "sections": [
            {"h2": "賽前場地檢查", "content": "香港的雨季（4月至9月）經常影響室外籃球比賽。球證/裁判在比賽前應該仔細檢查場地狀況，特別是地面是否濕滑。如果場地積水嚴重或地面過於濕滑，球證/裁判有權建議延遲或取消比賽，球員安全永遠是第一位。"},
            {"h2": "濕滑場地的判罰調整", "content": "在濕滑的場地上，球員更容易滑倒和失去平衡。球證/裁判需要理解這一點，在判罰時考慮場地因素。例如，球員因地面濕滑而滑倒導致的身體接觸，不一定構成犯規。"},
            {"h2": "安全優先", "content": "如果比賽進行中突然下雨，球證/裁判應該在適當時機暫停比賽，評估場地安全。與雙方教練溝通，共同決定是否繼續比賽。如果決定繼續，要提醒球員注意安全，避免過於激烈的動作。"},
            {"h2": "裝備建議", "content": "室外執法時，球證/裁判應該穿著防滑性能好的球鞋。建議準備一條毛巾擦汗和擦手。哨子要用有繩子的款式，避免因手滑而掉落。另外，帶一件防水外套以備不時之需。"}
        ]
    },
    {
        "title": "籃球計時計分員的角色與職責",
        "icon": "⏱️",
        "category": "賽事管理",
        "reading_time": 6,
        "sections": [
            {"h2": "計時計分員的重要性", "content": "計時計分員是籃球比賽中不可或缺的角色。他們負責記錄比賽時間、得分、犯規次數和暫停次數。準確的記錄是比賽公平進行的基礎。LaLaRef 提供專業的計時計分服務，確保每場比賽的數據準確無誤。"},
            {"h2": "基本職責", "content": "計時計分員的主要職責包括：操作計時器（開始、暫停、結束）、記錄每次得分和得分球員、記錄每位球員的犯規次數、管理球隊暫停次數、以及在球員犯滿離場時通知球證/裁判。"},
            {"h2": "與球證/裁判的配合", "content": "計時計分員需要與球證/裁判密切配合。球證/裁判吹哨後，計時員要立即停止計時；球證/裁判示意比賽繼續時，要立即開始計時。在犯規判罰時，計時計分員要準確記錄球證/裁判報出的犯規球員號碼和犯規類型。"},
            {"h2": "常見問題處理", "content": "計時計分員最常遇到的問題包括：計時器故障、得分記錄爭議、以及犯規次數不一致。遇到這些情況時，應該立即通知球證/裁判，由球證/裁判做出最終決定。建議同時使用電子和紙本記錄作為備份。"}
        ]
    },
]

# ============================================================
# HTML TEMPLATE
# ============================================================
def generate_html(topic):
    slug = f"blog-daily-{DATE_STR}"
    filename = f"{slug}.html"
    url = f"https://www.lalaref.com/{filename}"

    sections_html = ""
    for s in topic["sections"]:
        sections_html += f"""
<div class="ps">
<h2>{s['h2']}</h2>
<p>{s['content']}</p>
</div>
"""

    html = f"""<!DOCTYPE html><html lang="zh-HK"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>{topic['title']} | LaLaRef 急單王</title><meta name="description" content="{topic['title']} — LaLaRef 急單王籃球球證/裁判專欄。了解更多籃球裁判知識、規則解析及執法技巧。"><meta name="keywords" content="籃球球證,籃球裁判,{topic['category']},LaLaRef,急單王,basketball referee"><script async src="https://www.googletagmanager.com/gtag/js?id=G-L1YNR24WBC"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag('js',new Date());gtag('config','G-L1YNR24WBC');</script><meta property="og:type" content="article"><meta property="og:url" content="{url}"><meta property="og:title" content="{topic['title']} | LaLaRef"><meta property="og:description" content="{topic['title']}"><meta property="og:image" content="https://www.lalaref.com/lalaref2.png"><meta property="article:published_time" content="{DATE_STR}"><meta property="article:author" content="LaLaRef"><link rel="canonical" href="{url}"><script type="application/ld+json">{{"@context":"https://schema.org","@type":"Article","headline":"{topic['title']}","author":{{"@type":"Organization","name":"LaLaRef"}},"publisher":{{"@type":"Organization","name":"LaLaRef","logo":{{"@type":"ImageObject","url":"https://www.lalaref.com/lalaref2.png"}}}},"datePublished":"{DATE_STR}","mainEntityOfPage":"{url}","image":"https://www.lalaref.com/lalaref2.png"}}</script><script type="application/ld+json">{{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{{"@type":"ListItem","position":1,"name":"首頁","item":"https://www.lalaref.com/"}},{{"@type":"ListItem","position":2,"name":"籃球新聞","item":"https://www.lalaref.com/news.html"}},{{"@type":"ListItem","position":3,"name":"{topic['title']}","item":"{url}"}}]}}</script><link rel="icon" type="image/jpeg" href="lalaref2.jpg"><style>
*{{margin:0;padding:0;box-sizing:border-box}}body{{font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,'Microsoft JhengHei','PingFang TC',sans-serif;line-height:1.6;color:#5a4a3a;background:linear-gradient(135deg,#f5e6d3,#e8d4b8);min-height:100vh}}.nb{{background:linear-gradient(145deg,#d4a574,#c89860);padding:15px 0;box-shadow:0 10px 20px rgba(0,0,0,.15);position:sticky;top:0;z-index:100}}.nc{{max-width:1100px;margin:0 auto;padding:0 30px;display:flex;justify-content:space-between;align-items:center}}.nl{{color:#fff;font-size:1.5em;font-weight:900;text-decoration:none}}.nk{{display:flex;gap:30px}}.nk a{{color:#fff;text-decoration:none;font-weight:700;transition:all .3s;padding:8px 16px;border-radius:20px}}.nk a:hover{{background:rgba(255,255,255,.2)}}.hb{{display:none;flex-direction:column;cursor:pointer;padding:5px}}.hb span{{width:25px;height:3px;background:#fff;margin:3px 0;transition:.3s;border-radius:3px}}.hb.active span:nth-child(1){{transform:rotate(-45deg) translate(-5px,6px)}}.hb.active span:nth-child(2){{opacity:0}}.hb.active span:nth-child(3){{transform:rotate(45deg) translate(-5px,-6px)}}.bc{{max-width:1100px;margin:20px auto;padding:0 30px;font-size:.9em;color:#7a6a5a}}.bc a{{color:#d4a574;text-decoration:none;font-weight:600}}.ct{{max-width:800px;margin:0 auto;padding:40px 30px}}.ph{{text-align:center;margin-bottom:40px;padding:50px 30px;background:linear-gradient(145deg,#f0dcc8,#e8d4b8);border-radius:40px;box-shadow:20px 20px 40px rgba(0,0,0,.15),-20px -20px 40px rgba(255,255,255,.7)}}.ph h1{{font-size:2.2em;color:#5a4a3a;margin-bottom:15px;font-weight:900}}.ph .meta{{font-size:.95em;color:#7a6a5a}}.ps{{background:linear-gradient(145deg,#f0dcc8,#e8d4b8);padding:40px 35px;border-radius:30px;margin-bottom:30px;box-shadow:15px 15px 30px rgba(0,0,0,.12),-15px -15px 30px rgba(255,255,255,.7)}}.ps h2{{font-size:1.5em;color:#d4a574;margin-bottom:20px;font-weight:900}}.ps p{{font-size:1.05em;line-height:1.9;color:#5a4a3a;margin-bottom:15px}}.cta{{text-align:center;padding:40px 30px;background:linear-gradient(145deg,#d4a574,#c89860);border-radius:30px;margin:30px 0;box-shadow:15px 15px 30px rgba(0,0,0,.15),-15px -15px 30px rgba(255,255,255,.3)}}.cta h2{{color:#fff;font-size:1.6em;margin-bottom:15px;font-weight:900}}.cta p{{color:#fff;font-size:1.1em;margin-bottom:20px}}.cta a{{display:inline-block;padding:15px 35px;background:linear-gradient(145deg,#f0dcc8,#e8d4b8);color:#5a4a3a;text-decoration:none;border-radius:25px;font-weight:900;font-size:1.1em;box-shadow:8px 8px 16px rgba(0,0,0,.15),-8px -8px 16px rgba(255,255,255,.2);transition:all .3s}}.cta a:hover{{transform:translateY(-3px)}}@media(max-width:768px){{.hb{{display:flex}}.nk{{position:absolute;top:100%;left:0;right:0;background:linear-gradient(145deg,#d4a574,#c89860);flex-direction:column;gap:0;padding:0;max-height:0;overflow:hidden;transition:max-height .3s}}.nk.active{{max-height:300px}}.nk a{{padding:12px 25px;border-radius:0;border-bottom:1px solid rgba(255,255,255,.1);font-size:.9em}}.nc{{padding:0 15px}}.nl{{font-size:1.2em}}.bc{{padding:0 15px;font-size:.8em}}.ct{{padding:20px 12px}}.ph{{padding:25px 15px;margin-bottom:20px;border-radius:25px}}.ph h1{{font-size:1.3em}}.ph .meta{{font-size:.78em}}.ps{{padding:20px 15px;border-radius:18px;margin-bottom:15px}}.ps h2{{font-size:1.1em;margin-bottom:10px}}.ps p{{font-size:.82em;line-height:1.7}}.cta{{padding:25px 15px;border-radius:20px;margin:20px 0}}.cta h2{{font-size:1.15em}}.cta p{{font-size:.85em}}.cta a{{padding:12px 25px;font-size:.9em}}}}
</style></head><body>
<nav class="nb"><div class="nc"><a href="index.html" class="nl">LaLaRef 急單王</a><div class="hb" onclick="toggleMenu()" aria-label="選單" role="button" tabindex="0"><span></span><span></span><span></span></div><div class="nk" id="navLinks"><a href="index.html">首頁</a><a href="service.html">服務資訊</a><a href="news.html">籃球新聞</a><a href="leagues.html">聯賽列表</a><a href="index.html#booking">立即預訂</a><a href="en.html" style="background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.4)">EN</a></div></div></nav>
<nav class="bc"><a href="index.html">首頁</a> <span style="margin:0 8px">›</span> <a href="news.html">籃球新聞</a> <span style="margin:0 8px">›</span> <span>{topic['title']}</span></nav>
<div class="ct">
<header class="ph"><h1>{topic['icon']} {topic['title']}</h1><p class="meta">📅 {DATE_DISPLAY} | ✍️ LaLaRef 球證/裁判團隊 | ⏱️ 閱讀時間：{topic['reading_time']} 分鐘</p></header>
{sections_html}
<div class="cta">
<h2>需要專業籃球球證/裁判？</h2>
<p>LaLaRef 急單王提供即日緊急接單，持牌專業球證/裁判團隊，全港覆蓋</p>
<a href="https://wa.me/85284828484?text=你好！我想查詢球證/裁判服務">📱 WhatsApp 預訂</a>
</div>
</div>
<footer style="background:linear-gradient(145deg,#d4a574,#c89860);color:#fff;padding:30px 20px;text-align:center;margin-top:40px"><p>&copy; 2026 LaLa Xolutions Co. | <a href="index.html" style="color:#fff;text-decoration:underline">返回首頁</a> | WhatsApp: <a href="https://wa.me/85284828484" style="color:#fff;text-decoration:underline">8482 8484</a></p></footer>
<script>function toggleMenu(){{document.querySelector('.hb').classList.toggle('active');document.getElementById('navLinks').classList.toggle('active')}}</script>
</body></html>"""

    return filename, html


# ============================================================
# BLOG INDEX — keeps track of all generated posts
# ============================================================
def update_blog_index(filename, topic):
    index_path = os.path.join(SCRIPT_DIR, 'js', 'blog-index.json')

    if os.path.exists(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            index = json.load(f)
    else:
        index = []

    # Don't add duplicate dates
    if any(entry['date'] == DATE_STR for entry in index):
        print(f"Blog post for {DATE_STR} already exists in index, skipping.")
        return

    entry = {
        "date": DATE_STR,
        "title": topic["title"],
        "icon": topic["icon"],
        "category": topic["category"],
        "url": filename,
        "reading_time": topic["reading_time"]
    }

    index.insert(0, entry)  # newest first

    # Keep last 365 entries
    index = index[:365]

    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    print(f"Updated blog index with {len(index)} entries.")


# ============================================================
# MAIN
# ============================================================
def main():
    # Pick today's topic based on date seed
    day_of_year = TODAY.timetuple().tm_yday
    topic_index = day_of_year % len(TOPICS)
    topic = TOPICS[topic_index]

    print(f"Generating blog post for {DATE_STR}")
    print(f"Topic: {topic['title']}")

    filename, html = generate_html(topic)
    filepath = os.path.join(SCRIPT_DIR, filename)

    # Don't overwrite if already exists
    if os.path.exists(filepath):
        print(f"File {filename} already exists, skipping generation.")
    else:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Created {filename}")

    update_blog_index(filename, topic)
    print("Done!")


if __name__ == '__main__':
    main()
