// API Configuration
const CONFIG = {
    // Backend API endpoint
    BACKEND_URL: 'http://localhost:5000',
    
    // Default settings
    DEFAULT_COUNTRY: 'us',
    DEFAULT_PAGE_SIZE: 20,
    
    // Countries
    COUNTRIES: [
        { code: 'us', name: 'United States', flag: '🇺🇸' },
        { code: 'za', name: 'South Africa', flag: '🇿🇦' }
    ],
    
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

// Verify backend is configured
console.log('📡 Frontend configured to use backend at:', CONFIG.BACKEND_URL);