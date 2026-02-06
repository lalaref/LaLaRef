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
        enabled: true // FIBA 官方球證新聞
    },
    
    // NewsData.io - News API (需要註冊獲取 API Key)
    newsDataIO: {
        baseUrl: 'https://newsdata.io/api/1/news',
        apiKey: 'pub_f1c16ce168d24cd8b4d2ef5fa1fb77a3', // 請替換為你的 API Key
        enabled: true // 設為 true 當你有 API Key
    },
    
    // MediaStack - Alternative News API
    mediaStack: {
        baseUrl: 'http://api.mediastack.com/v1/news',
        apiKey: '3d736bd774445a89c54668019eb7799d', // 請替換為你的 API Key
        enabled: true // 設為 true 當你有 API Key
    }
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
