// API Functions for fetching news

// Fetch top headlines
async function fetchTopHeadlines(category = '', country = CONFIG.DEFAULT_COUNTRY) {
    try {
        const categoryParam = category ? `&category=${category}` : '';
        const url = `${CONFIG.BACKEND_URL}/api/news?country=${country}${categoryParam}&pageSize=${CONFIG.DEFAULT_PAGE_SIZE}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'ok') {
            return data.articles;
        } else {
            console.error('API Error:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error fetching headlines:', error);
        return getMockArticles(); // Fallback to mock data
    }
}

// Search news
async function searchNews(query) {
    try {
        // Search by using technology category as default, as backend currently supports top-headlines
        // For full search functionality, extend the backend /api/news endpoint to support search parameter
        const url = `${CONFIG.BACKEND_URL}/api/news?pageSize=${CONFIG.DEFAULT_PAGE_SIZE}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'ok') {
            // Filter articles on the frontend based on search query
            return data.articles.filter(article => 
                article.title.toLowerCase().includes(query.toLowerCase()) ||
                article.description?.toLowerCase().includes(query.toLowerCase())
            );
        } else {
            console.error('API Error:', data.message);
            return [];
        }
    } catch (error) {
        console.error('Error searching news:', error);
        return [];
    }
}

// Fetch news by category
async function fetchNewsByCategory(category) {
    return await fetchTopHeadlines(category);
}

// Format time ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

// Format full date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Get article ID from URL
function getArticleIdFromUrl(url) {
    // Create a simple hash from URL for article identification
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

// Store article data
function storeArticleData(article) {
    const id = getArticleIdFromUrl(article.url);
    localStorage.setItem(`article_${id}`, JSON.stringify(article));
    return id;
}

// Get article data
function getArticleData(id) {
    const data = localStorage.getItem(`article_${id}`);
    return data ? JSON.parse(data) : null;
}

// Get default image if article has no image
function getDefaultImage() {
    return 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&h=400&fit=crop';
}

// Mock data for development/fallback
function getMockArticles() {
    return [
        {
            title: 'Major Tech Company Announces AI Breakthrough',
            description: 'Revolutionary developments in artificial intelligence promise to reshape multiple industries...',
            url: 'https://example.com/article1',
            urlToImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop',
            publishedAt: new Date().toISOString(),
            source: { name: 'Tech News' },
            content: 'Full article content would go here...'
        },
        {
            title: 'Global Markets React to Economic Policy Changes',
            description: 'Major financial centers respond to new regulations affecting international trade...',
            url: 'https://example.com/article2',
            urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop',
            publishedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            source: { name: 'Business Daily' },
            content: 'Full article content would go here...'
        },
        {
            title: 'New Study Reveals Climate Impact on Ocean Currents',
            description: 'Research indicates significant changes in global weather patterns...',
            url: 'https://example.com/article3',
            urlToImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop',
            publishedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
            source: { name: 'Science Today' },
            content: 'Full article content would go here...'
        },
        {
            title: 'Healthcare Innovation Transforms Patient Care',
            description: 'New medical technology offers unprecedented treatment options...',
            url: 'https://example.com/article4',
            urlToImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=400&fit=crop',
            publishedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
            source: { name: 'Health Watch' },
            content: 'Full article content would go here...'
        },
        {
            title: 'Sports Championship Finals Set Record Viewership',
            description: 'Historic game draws millions of viewers worldwide...',
            url: 'https://example.com/article5',
            urlToImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop',
            publishedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            source: { name: 'Sports Network' },
            content: 'Full article content would go here...'
        }
    ];
}

// Bookmarks functionality
function getBookmarks() {
    const bookmarks = localStorage.getItem(CONFIG.STORAGE_KEYS.BOOKMARKS);
    return bookmarks ? JSON.parse(bookmarks) : [];
}

function addBookmark(article) {
    const bookmarks = getBookmarks();
    const id = getArticleIdFromUrl(article.url);
    
    if (!bookmarks.find(b => b.id === id)) {
        bookmarks.push({
            id,
            title: article.title,
            url: article.url,
            savedAt: new Date().toISOString()
        });
        localStorage.setItem(CONFIG.STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
        return true;
    }
    return false;
}

function removeBookmark(articleId) {
    const bookmarks = getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== articleId);
    localStorage.setItem(CONFIG.STORAGE_KEYS.BOOKMARKS, JSON.stringify(filtered));
}

function isBookmarked(articleUrl) {
    const bookmarks = getBookmarks();
    const id = getArticleIdFromUrl(articleUrl);
    return bookmarks.some(b => b.id === id);
}