// LaLaRef Basketball News Aggregator
// 方案 A: 混合新聞聚合

// API Configuration
const API_CONFIG = {
    // TheSportsDB - Free Basketball API
    theSportsDB: {
        baseUrl: 'https://www.thesportsdb.com/api/v1/json/3',
        endpoints: {
            events: '/eventsseason.php',
            news: '/eventsnext.php'
        }
    },
    
    // FIBA Referee News (Official)
    fibaReferee: {
        newsUrl: 'https://refereeing.fiba.basketball/en/fiba-world/news',
        rssProxy: 'https://api.rss2json.com/v1/api.json?rss_url=', // Free RSS to JSON converter
        enabled: true // FIBA 官方球證新聞
    },
    
    // NewsData.io - News API (需要註冊獲取 API Key)
    newsDataIO: {
        baseUrl: 'https://newsdata.io/api/1/news',
        apiKey: 'pub_f1c16ce168d24cd8b4d2ef5fa1fb77a3', // 請替換為你的 API Key
        enabled: true // 設為 true 當你有 API Key
    },
    
    
};

// Sample/Mock Data for demonstration
const MOCK_DATA = {
    international: [
        {
            title: 'FIBA 籃球世界盃 2027 主辦城市公布',
            excerpt: 'FIBA 國際籃球總會宣布 2027 年籃球世界盃的主辦城市名單，亞洲區將有多個城市參與協辦...',
            category: '國際賽事',
            date: '2026-02-05',
            source: 'FIBA',
            url: 'https://www.fiba.basketball/en/news',
            image: '🏆'
        },
        {
            title: 'NBA 全明星賽週末精彩回顧',
            excerpt: 'NBA 全明星賽週末圓滿結束，東區明星隊以 211-186 擊敗西區明星隊，創下全明星賽得分新紀錄...',
            category: 'NBA',
            date: '2026-02-04',
            source: 'NBA',
            url: 'https://www.nba.com',
            image: '⭐'
        },
        {
            title: '歐洲籃球聯賽季後賽名額爭奪戰白熱化',
            excerpt: '歐洲籃球聯賽進入賽季最後階段，多支球隊為爭奪季後賽席位展開激烈競爭...',
            category: '歐洲聯賽',
            date: '2026-02-03',
            source: 'EuroLeague',
            url: 'https://www.euroleague.net',
            image: '🏀'
        }
    ],
    hongkong: [
        {
            title: '香港甲組籃球聯賽季後賽賽程公布',
            excerpt: '2025-26 賽季香港甲組籃球聯賽常規賽即將結束，季後賽賽程已經確定，首輪比賽將於下月展開...',
            category: '甲組聯賽',
            date: '2026-02-06',
            source: 'HKBA',
            url: 'https://www.fiba.basketball/en/news',
            image: '🏆'
        },
        {
            title: '學界籃球精英賽圓滿結束',
            excerpt: '香港學界體育聯會主辦的學界籃球精英賽於上週末圓滿結束，多間學校展現出色的籃球技術...',
            category: '學界籃球',
            date: '2026-02-05',
            source: 'HKSSF',
            url: 'http://sportsentry.hkssf.org.hk/',
            image: '🎓'
        },
        {
            title: '香港籃球代表隊備戰亞洲盃外圍賽',
            excerpt: '香港男子籃球代表隊正積極備戰即將到來的亞洲盃外圍賽，教練團隊已公布集訓名單...',
            category: '香港代表隊',
            date: '2026-02-04',
            source: 'HKBA',
            url: 'https://www.fiba.basketball/en/news',
            image: '🇭🇰'
        },
        {
            title: '大專籃球聯賽決賽週精彩對決',
            excerpt: '友邦大專籃球賽進入決賽週，各大院校精英球員將在灣仔修頓室內場館一決高下...',
            category: '大專籃球',
            date: '2026-02-03',
            source: 'CUSFHK',
            url: 'https://www.fiba.basketball/en/news',
            image: '🎓'
        }
    ],
    referee: [
        {
            title: 'FIBA 球證執照系統 2025-27 週期正式啟動',
            excerpt: 'FIBA 球證營運部門公布了 2025-27 週期的區域化手冊，為 FIBA 球證提供執照、區域行政標準和現代比賽所需的數位工具的全面指南...',
            category: 'FIBA 球證',
            date: '2026-01-15',
            source: 'FIBA Refereeing',
            url: 'https://refereeing.fiba.basketball/en/fiba-world/news',
            image: '👨‍⚖️'
        },
        {
            title: '籃球規則更新：2026 年 FIBA 規則修訂重點',
            excerpt: '作為專業球證，我們需要了解 FIBA 最新的規則修訂。本文將詳細解析 2026 年規則變更的重點...',
            category: '規則解析',
            date: '2026-02-01',
            source: 'LaLaRef',
            url: 'https://www.lalaref.com/service.html',
            image: '📖'
        },
        {
            title: 'FIBA 球證培訓：精英教練團隊的執法哲學',
            excerpt: 'FIBA 2+ 級球證教練團隊分享他們的執法哲學和培訓方法，確保國際賽事的最高執法標準...',
            category: 'FIBA 球證',
            date: '2026-01-28',
            source: 'FIBA Refereeing',
            url: 'https://refereeing.fiba.basketball/en/fiba-world/news',
            image: '🎓'
        },
        {
            title: '困難判罰分析：Champions League 十六強賽事回顧',
            excerpt: 'FIBA 專家每週分析籃球冠軍聯賽的所有比賽，公布一些困難判罰案例及其解釋，提高對球證決定的理解和透明度...',
            category: '判罰分析',
            date: '2026-02-05',
            source: 'FIBA Refereeing',
            url: 'https://refereeing.fiba.basketball/en/news/tough-calls-round-of-16-week-2',
            image: '⚖️'
        },
        {
            title: '如何成為一名優秀的籃球裁判',
            excerpt: '從學界認可資格到執法經驗累積，分享成為專業籃球球證的心路歷程和實用建議...',
            category: '球證心得',
            date: '2026-01-28',
            source: 'LaLaRef',
            url: 'https://www.lalaref.com/service.html',
            image: '👨‍⚖️'
        },
        {
            title: 'FIBA 球證執照 2025-27：全球 1149 名球證獲批',
            excerpt: '2025-27 週期共有來自 162 個國家協會的 1149 名球證和記錄台人員獲得批准，反映了持續的穩定性和廣泛的國際代表性...',
            category: 'FIBA 球證',
            date: '2026-01-20',
            source: 'FIBA',
            url: 'https://about.fiba.basketball/en/news/fibas-game-officials-licensing-cycle-2025-27-reflects-ongoing-stability',
            image: '🌍'
        },
        {
            title: '三人籃球球證培訓：3x3 執法要點',
            excerpt: '3x3 籃球的快節奏和獨特規則要求球證具備特殊技能。本文探討三人籃球執法的關鍵要點和常見挑戰...',
            category: '3x3 籃球',
            date: '2026-01-25',
            source: 'LaLaRef',
            url: 'https://www.lalaref.com/service.html',
            image: '🏀'
        },
        {
            title: '球證體能訓練：如何保持最佳狀態',
            excerpt: '專業球證需要出色的體能才能在整場比賽中保持專注和準確。分享球證專用的體能訓練計劃和營養建議...',
            category: '球證訓練',
            date: '2026-01-22',
            source: 'LaLaRef',
            url: 'https://www.lalaref.com/service.html',
            image: '💪'
        },
        {
            title: '學界籃球執法經驗分享：與年輕球員溝通的藝術',
            excerpt: '在學界比賽中執法需要特別的溝通技巧。分享如何與年輕球員、教練和家長建立良好關係的實戰經驗...',
            category: '學界執法',
            date: '2026-01-18',
            source: 'LaLaRef',
            url: 'https://www.lalaref.com/service.html',
            image: '🎓'
        },
        {
            title: 'NBA 球證培訓營：頂級聯賽的執法標準',
            excerpt: 'NBA 球證培訓營揭示了世界頂級籃球聯賽的執法標準和評估體系，為有志成為職業球證的人提供寶貴見解...',
            category: '職業聯賽',
            date: '2026-01-16',
            source: 'NBA Officials',
            url: 'https://official.nba.com',
            image: '🏆'
        },
        {
            title: '判罰一致性：建立可靠的執法標準',
            excerpt: '判罰一致性是優秀球證的標誌。探討如何在不同比賽情境下保持一致的判罰標準，建立球員和教練的信任...',
            category: '執法技巧',
            date: '2026-01-14',
            source: 'LaLaRef',
            url: 'https://www.lalaref.com/service.html',
            image: '⚖️'
        },
        {
            title: '球證心理素質：壓力下的決策能力',
            excerpt: '在關鍵時刻做出正確判罰需要強大的心理素質。分享球證如何培養抗壓能力和保持冷靜的心理訓練方法...',
            category: '心理訓練',
            date: '2026-01-12',
            source: 'LaLaRef',
            url: 'https://www.lalaref.com/service.html',
            image: '🧠'
        },
        {
            title: '女子籃球執法：性別平等與機會',
            excerpt: 'FIBA 致力於推動女性球證在國際賽事中的參與。探討女子籃球執法的發展趨勢和性別平等倡議...',
            category: 'FIBA 球證',
            date: '2026-01-10',
            source: 'FIBA Refereeing',
            url: 'https://refereeing.fiba.basketball/en/fiba-world/news',
            image: '👩‍⚖️'
        },
        {
            title: '技術犯規判罰指南：何時該吹哨',
            excerpt: '技術犯規的判罰需要準確把握尺度。詳細解析各種技術犯規情境，幫助球證做出正確判斷...',
            category: '規則解析',
            date: '2026-01-08',
            source: 'LaLaRef',
            url: 'https://www.lalaref.com/service.html',
            image: '🚨'
        },
        {
            title: '球證團隊合作：三人組的默契配合',
            excerpt: '現代籃球比賽由三名球證共同執法。探討如何建立有效的團隊溝通和分工協作機制...',
            category: '團隊合作',
            date: '2026-01-06',
            source: 'LaLaRef',
            url: 'https://www.lalaref.com/service.html',
            image: '🤝'
        },
        {
            title: 'VAR 技術在籃球中的應用：即時重播系統',
            excerpt: '即時重播系統（IRS）如何改變籃球執法。了解技術輔助判罰的使用時機和操作流程...',
            category: '科技執法',
            date: '2026-01-04',
            source: 'FIBA Refereeing',
            url: 'https://refereeing.fiba.basketball/en/fiba-world/news',
            image: '📹'
        },
        {
            title: '青少年籃球執法：培養下一代球證',
            excerpt: '青少年球證培訓計劃的重要性。分享如何指導年輕球證發展技能和建立信心的經驗...',
            category: '球證培訓',
            date: '2026-01-02',
            source: 'LaLaRef',
            url: 'https://www.lalaref.com/service.html',
            image: '🌱'
        },
        {
            title: '國際賽事執法經驗：文化差異與適應',
            excerpt: '在國際賽事中執法需要理解不同的籃球文化和比賽風格。分享跨文化執法的挑戰和應對策略...',
            category: '國際賽事',
            date: '2025-12-30',
            source: 'LaLaRef',
            url: 'https://www.lalaref.com/service.html',
            image: '🌏'
        },
        {
            title: '球證職業發展：從業餘到職業的晉升之路',
            excerpt: '規劃球證職業生涯的完整指南。從地區聯賽到國際賽事，了解每個階段的要求和晉升標準...',
            category: '職業發展',
            date: '2025-12-28',
            source: 'LaLaRef',
            url: 'https://www.lalaref.com/service.html',
            image: '📈'
        },
        {
            title: '比賽前準備：球證的賽前檢查清單',
            excerpt: '充分的賽前準備是成功執法的基礎。提供完整的賽前檢查清單，確保每場比賽都能順利進行...',
            category: '執法技巧',
            date: '2025-12-26',
            source: 'LaLaRef',
            url: 'https://www.lalaref.com/service.html',
            image: '✅'
        }
    ]
};

// State Management
let currentFilter = 'all';
let newsData = {
    international: [],
    hongkong: [],
    referee: []
};

// Pagination State
const ITEMS_PER_PAGE = 6; // Initial items to show
const ITEMS_PER_LOAD = 6; // Items to load when clicking "Load More"
let displayedItems = {
    international: ITEMS_PER_PAGE,
    hongkong: ITEMS_PER_PAGE,
    referee: ITEMS_PER_PAGE
};

// API Pagination Tokens (for APIs that support pagination)
let nextPageTokens = {
    international: null,
    hongkong: null,
    referee: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    loadAllNews();
});

// Filter Tabs
function initializeFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Get category
            const category = tab.dataset.category;
            currentFilter = category;
            
            // Filter news
            filterNews(category);
        });
    });
}

function filterNews(category) {
    const sections = document.querySelectorAll('.news-section');
    
    if (category === 'all') {
        sections.forEach(section => section.style.display = 'block');
    } else {
        sections.forEach(section => {
            const sectionId = section.id;
            if (sectionId.includes(category)) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }
}

// Load All News
async function loadAllNews() {
    // Load mock data first for demonstration
    loadMockData();
    
    // Load FIBA RSS feed (free, no API key needed)
    await loadFIBARSS();
    
    // Try to load real data if APIs are configured
    if (API_CONFIG.newsDataIO.enabled) {
        await loadNewsDataIO();
    }
    
    if (API_CONFIG.mediaStack.enabled) {
        await loadMediaStack();
    }
    
    // Load TheSportsDB data (free, no API key needed)
    await loadTheSportsDB();
}

// Load FIBA RSS Feed
async function loadFIBARSS() {
    if (!API_CONFIG.fibaReferee.enabled) {
        console.log('FIBA RSS feed disabled');
        return;
    }
    
    try {
        // Use RSS2JSON free service to convert RSS to JSON
        // FIBA doesn't have a public RSS feed, so we'll use a workaround
        // For now, we'll add more Mock data based on real FIBA sources
        console.log('FIBA RSS: Using curated content from official sources');
        
        // In a real implementation, you would fetch from an RSS feed like:
        // const response = await fetch(`${API_CONFIG.fibaReferee.rssProxy}${encodeURIComponent(rssFeedUrl)}`);
        // const data = await response.json();
        
        // For now, the expanded Mock data serves this purpose
        
    } catch (error) {
        console.error('Error loading FIBA RSS:', error);
    }
}

// Load Mock Data
function loadMockData() {
    newsData.international = MOCK_DATA.international;
    newsData.hongkong = MOCK_DATA.hongkong;
    newsData.referee = MOCK_DATA.referee;
    
    renderNews('international', newsData.international);
    renderNews('hongkong', newsData.hongkong);
    renderNews('referee', newsData.referee);
}

// Load from TheSportsDB (Free API)
async function loadTheSportsDB() {
    try {
        // TheSportsDB provides basketball league data
        // Note: This is a simplified example. You may need to adjust based on actual API response
        const response = await fetch(`${API_CONFIG.theSportsDB.baseUrl}/eventsnextleague.php?id=4387`);
        
        if (!response.ok) {
            console.log('TheSportsDB API not available, using mock data');
            return;
        }
        
        const data = await response.json();
        
        if (data.events && data.events.length > 0) {
            // Transform TheSportsDB data to our format
            const transformedNews = data.events.slice(0, 5).map(event => ({
                title: event.strEvent || 'Basketball Event',
                excerpt: `${event.strHomeTeam} vs ${event.strAwayTeam} - ${event.strLeague}`,
                category: event.strLeague || 'Basketball',
                date: event.dateEvent || new Date().toISOString().split('T')[0],
                source: 'TheSportsDB',
                url: event.strVideo || '#',
                image: '🏀'
            }));
            
            // Add to international news
            newsData.international = [...transformedNews, ...newsData.international];
            renderNews('international', newsData.international);
        }
    } catch (error) {
        console.error('Error loading TheSportsDB:', error);
    }
}

// Load from NewsData.io
async function loadNewsDataIO() {
    if (!API_CONFIG.newsDataIO.apiKey || API_CONFIG.newsDataIO.apiKey === 'YOUR_API_KEY_HERE') {
        console.log('NewsData.io API key not configured');
        return;
    }
    
    try {
        // Load Hong Kong sports news (broader search)
        const hkParams = new URLSearchParams({
            apikey: API_CONFIG.newsDataIO.apiKey,
            country: 'hk',
            category: 'sports',
            language: 'zh,en'
        });
        
        const hkResponse = await fetch(`${API_CONFIG.newsDataIO.baseUrl}?${hkParams}`);
        const hkData = await hkResponse.json();
        
        console.log('NewsData.io HK response:', hkData);
        
        if (hkData.results && hkData.results.length > 0) {
            // Filter for basketball-related news
            const basketballNews = hkData.results.filter(article => {
                const text = (article.title + ' ' + (article.description || '')).toLowerCase();
                return text.includes('basketball') || text.includes('籃球') || 
                       text.includes('nba') || text.includes('甲組') || 
                       text.includes('學界') || text.includes('hkba') ||
                       text.includes('球證');
            });
            
            const transformedNews = basketballNews.map(article => ({
                title: article.title,
                excerpt: article.description || article.content?.substring(0, 150) + '...',
                category: '香港新聞',
                date: article.pubDate?.split(' ')[0] || new Date().toISOString().split('T')[0],
                source: article.source_id || 'News',
                url: article.link,
                image: '📰'
            }));
            
            if (transformedNews.length > 0) {
                newsData.hongkong = [...transformedNews, ...newsData.hongkong];
                renderNews('hongkong', newsData.hongkong);
                console.log(`Loaded ${transformedNews.length} Hong Kong basketball articles`);
            }
        }
        
        // Load international basketball news (no country filter for more results)
        const intParams = new URLSearchParams({
            apikey: API_CONFIG.newsDataIO.apiKey,
            category: 'sports',
            q: 'NBA OR basketball',
            language: 'en'
        });
        
        const intResponse = await fetch(`${API_CONFIG.newsDataIO.baseUrl}?${intParams}`);
        const intData = await intResponse.json();
        
        console.log('NewsData.io International response:', intData);
        
        if (intData.results && intData.results.length > 0) {
            const transformedIntNews = intData.results.slice(0, 10).map(article => ({
                title: article.title,
                excerpt: article.description || article.content?.substring(0, 150) + '...',
                category: '國際籃球',
                date: article.pubDate?.split(' ')[0] || new Date().toISOString().split('T')[0],
                source: article.source_id || 'News',
                url: article.link,
                image: '🏀'
            }));
            
            newsData.international = [...transformedIntNews, ...newsData.international];
            renderNews('international', newsData.international);
            console.log(`Loaded ${transformedIntNews.length} international basketball articles`);
        }
        
        // Load referee-related news (broader search)
        const refParams = new URLSearchParams({
            apikey: API_CONFIG.newsDataIO.apiKey,
            category: 'sports',
            q: 'referee OR official',
            language: 'en'
        });
        
        const refResponse = await fetch(`${API_CONFIG.newsDataIO.baseUrl}?${refParams}`);
        const refData = await refResponse.json();
        
        console.log('NewsData.io Referee response:', refData);
        
        if (refData.results && refData.results.length > 0) {
            // Filter for basketball referee news
            const refNews = refData.results.filter(article => {
                const text = (article.title + ' ' + (article.description || '')).toLowerCase();
                return text.includes('basketball') || text.includes('nba') || 
                       text.includes('fiba') || text.includes('referee') ||
                       text.includes('球證');
            });
            
            const transformedRefNews = refNews.slice(0, 10).map(article => ({
                title: article.title,
                excerpt: article.description || article.content?.substring(0, 150) + '...',
                category: '球證新聞',
                date: article.pubDate?.split(' ')[0] || new Date().toISOString().split('T')[0],
                source: article.source_id || 'News',
                url: article.link,
                image: '👨‍⚖️'
            }));
            
            if (transformedRefNews.length > 0) {
                newsData.referee = [...transformedRefNews, ...newsData.referee];
                renderNews('referee', newsData.referee);
                console.log(`Loaded ${transformedRefNews.length} referee articles`);
            }
        }
    } catch (error) {
        console.error('Error loading NewsData.io:', error);
    }
}

// Load from MediaStack
async function loadMediaStack() {
    if (!API_CONFIG.mediaStack.apiKey || API_CONFIG.mediaStack.apiKey === 'YOUR_API_KEY_HERE') {
        console.log('MediaStack API key not configured');
        return;
    }
    
    try {
        // Load Hong Kong basketball news
        const hkParams = new URLSearchParams({
            access_key: API_CONFIG.mediaStack.apiKey,
            countries: 'hk',
            categories: 'sports',
            keywords: 'basketball,籃球',
            languages: 'zh,en',
            limit: 10
        });
        
        const hkResponse = await fetch(`${API_CONFIG.mediaStack.baseUrl}?${hkParams}`);
        const hkData = await hkResponse.json();
        
        if (hkData.data && hkData.data.length > 0) {
            const transformedNews = hkData.data.map(article => ({
                title: article.title,
                excerpt: article.description || article.content?.substring(0, 150) + '...',
                category: '香港新聞',
                date: article.published_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                source: article.source || 'News',
                url: article.url,
                image: '📰'
            }));
            
            newsData.hongkong = [...transformedNews, ...newsData.hongkong];
            renderNews('hongkong', newsData.hongkong);
        }
        
        // Load referee-related news
        const refParams = new URLSearchParams({
            access_key: API_CONFIG.mediaStack.apiKey,
            categories: 'sports',
            keywords: 'basketball referee,籃球球證,籃球裁判,FIBA referee',
            languages: 'zh,en',
            limit: 10
        });
        
        const refResponse = await fetch(`${API_CONFIG.mediaStack.baseUrl}?${refParams}`);
        const refData = await refResponse.json();
        
        if (refData.data && refData.data.length > 0) {
            const transformedRefNews = refData.data.map(article => ({
                title: article.title,
                excerpt: article.description || article.content?.substring(0, 150) + '...',
                category: '球證新聞',
                date: article.published_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                source: article.source || 'News',
                url: article.url,
                image: '👨‍⚖️'
            }));
            
            newsData.referee = [...transformedRefNews, ...newsData.referee];
            renderNews('referee', newsData.referee);
        }
    } catch (error) {
        console.error('Error loading MediaStack:', error);
    }
}

// Render News
function renderNews(category, articles, append = false) {
    const gridId = `${category}-grid`;
    const grid = document.getElementById(gridId);
    
    if (!grid) return;
    
    if (articles.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>暫無新聞</h3>
                <p>目前沒有${getCategoryName(category)}新聞</p>
            </div>
        `;
        return;
    }
    
    // Get items to display based on current pagination state
    const itemsToShow = articles.slice(0, displayedItems[category]);
    const hasMore = articles.length > displayedItems[category];
    
    // Render news cards
    const newsCards = itemsToShow.map(article => createNewsCard(article)).join('');
    
    // Add Load More button if there are more items
    const loadMoreButton = hasMore ? `
        <div class="load-more-container">
            <button class="load-more-btn" onclick="loadMoreNews('${category}')">
                <span class="load-more-icon">📰</span>
                <span class="load-more-text">查看更多</span>
                <span class="load-more-count">(還有 ${articles.length - displayedItems[category]} 篇)</span>
            </button>
        </div>
    ` : '';
    
    grid.innerHTML = newsCards + loadMoreButton;
}

// Load More News Function
function loadMoreNews(category) {
    // Increase displayed items
    displayedItems[category] += ITEMS_PER_LOAD;
    
    // Re-render with more items
    renderNews(category, newsData[category]);
    
    // Smooth scroll to the newly loaded content
    const grid = document.getElementById(`${category}-grid`);
    if (grid) {
        const newItems = grid.querySelectorAll('.news-card');
        if (newItems.length > 0) {
            // Scroll to the first newly loaded item
            const scrollTarget = newItems[Math.max(0, newItems.length - ITEMS_PER_LOAD)];
            scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// Create News Card HTML
function createNewsCard(article) {
    const formattedDate = formatDate(article.date);
    
    return `
        <a href="${article.url}" class="news-card" target="_blank" rel="noopener noreferrer">
            <div class="news-image">${article.image}</div>
            <div class="news-content">
                <span class="news-category">${article.category}</span>
                <h3 class="news-title">${article.title}</h3>
                <p class="news-excerpt">${article.excerpt}</p>
                <div class="news-meta">
                    <span class="news-date">
                        📅 ${formattedDate}
                    </span>
                    <span class="news-source">${article.source}</span>
                </div>
            </div>
        </a>
    `;
}

// Helper Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays === 2) return '前天';
    if (diffDays <= 7) return `${diffDays} 天前`;
    
    return date.toLocaleDateString('zh-HK', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function getCategoryName(category) {
    const names = {
        international: '國際籃球',
        hongkong: '香港籃球',
        referee: '球證專欄'
    };
    return names[category] || category;
}

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadAllNews, renderNews };
}
