// API Configuration
const CONFIG = {
    // Get your API key from: https://newsapi.org/
    NEWS_API_KEY: '31a81f721af54fe1862d4072e5d341dc', // API key inserted
    NEWS_API_BASE_URL: 'https://newsapi.org/v2',
    
    // Default settings
    DEFAULT_COUNTRY: 'us',
    DEFAULT_PAGE_SIZE: 20,
    
    // Categories
    CATEGORIES: [
        'technology',
        'business',
        'politics',
        'science',
        'health',
        'sports'
    ],
    
    // AdSense Configuration
    ADSENSE_CLIENT_ID: 'ca-pub-XXXXXXXXXXXXXXXX', // Replace with your AdSense ID
    
    // Storage keys
    STORAGE_KEYS: {
        BOOKMARKS: 'newsapp_bookmarks',
        PREFERENCES: 'newsapp_preferences'
    }
};

// Check if API key is configured
if (CONFIG.NEWS_API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('⚠️ Please configure your News API key in js/config.js');
    console.info('Get your free API key at: https://newsapi.org/');
}