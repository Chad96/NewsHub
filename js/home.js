// Homepage JavaScript

let currentArticles = [];
let currentCountry = CONFIG.DEFAULT_COUNTRY;

// Initialize homepage
async function initHomePage() {
    showLoading(true);
    
    // Initialize country selector
    initCountrySelector();
    
    // Load articles
    const articles = await fetchTopHeadlines('', currentCountry);
    currentArticles = articles;
    
    if (articles.length > 0) {
        displayFeaturedStory(articles[0]);
        displayHeadlines(articles.slice(1, 10));
        displayTrending(articles.slice(0, 5));
        displayCategoryGrid();
    }
    
    showLoading(false);
    
    // Setup event listeners
    setupEventListeners();
}

// Show/hide loading state
function showLoading(show) {
    const loading = document.getElementById('loading');
    const content = document.getElementById('content');
    const categoryGrid = document.getElementById('categoryGrid');
    
    if (loading && content && categoryGrid) {
        loading.style.display = show ? 'block' : 'none';
        content.style.display = show ? 'none' : 'grid';
        categoryGrid.style.display = show ? 'none' : 'block';
    }
}

// Display featured story
function displayFeaturedStory(article) {
    const container = document.getElementById('featuredStory');
    if (!container) return;
    
    const id = storeArticleData(article);
    
    container.innerHTML = `
        <img src="${article.urlToImage || getDefaultImage()}" alt="${article.title}">
        <div class="featured-content">
            <div class="trending-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                TRENDING
            </div>
            <h2>${article.title}</h2>
            <p>${article.description || 'Click to read the full story...'}</p>
            <div class="featured-meta">
                <span>${formatTimeAgo(article.publishedAt)}</span>
                <span class="category-badge">${article.source?.name || 'News'}</span>
            </div>
        </div>
    `;
    
    container.style.cursor = 'pointer';
    container.onclick = () => openArticle(id);
}

// Display headlines
function displayHeadlines(articles) {
    const container = document.getElementById('headlines');
    if (!container) return;
    
    container.innerHTML = articles.map(article => {
        const id = storeArticleData(article);
        return `
            <div class="headline-card" data-article-id="${id}">
                <img src="${article.urlToImage || getDefaultImage()}" alt="${article.title}">
                <div class="headline-content">
                    <h4>${article.title}</h4>
                    <div class="headline-meta">
                        <span>${formatTimeAgo(article.publishedAt)}</span>
                        <span class="source">${article.source?.name || 'News'}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    container.querySelectorAll('.headline-card').forEach(card => {
        card.onclick = () => openArticle(card.dataset.articleId);
    });
}

// Display trending topics
function displayTrending(articles) {
    const container = document.getElementById('trending');
    if (!container) return;
    
    container.innerHTML = articles.map((article, index) => {
        const id = storeArticleData(article);
        return `
            <div class="trending-item" data-article-id="${id}">
                <span class="trending-number">${index + 1}</span>
                <p>${article.title}</p>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    container.querySelectorAll('.trending-item').forEach(item => {
        item.onclick = () => openArticle(item.dataset.articleId);
    });
}

// Display category grid
function displayCategoryGrid() {
    const container = document.getElementById('categoryGrid');
    if (!container) return;
    
    // Categories are already in HTML, just ensure they're visible
    container.style.display = 'block';
}

// Initialize country selector
function initCountrySelector() {
    const selector = document.getElementById('countrySelector');
    if (!selector) return;
    
    selector.innerHTML = CONFIG.COUNTRIES.map(country => 
        `<option value="${country.code}" ${country.code === currentCountry ? 'selected' : ''}>
            ${country.flag} ${country.name}
        </option>`
    ).join('');
}

// Open article page
function openArticle(articleId) {
    window.location.href = `article.html?id=${articleId}`;
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
    
    // Country selector
    const countrySelector = document.getElementById('countrySelector');
    if (countrySelector) {
        countrySelector.addEventListener('change', async (e) => {
            currentCountry = e.target.value;
            console.log('Country changed to:', currentCountry);
            await loadCountryNews();
        });
    }
    
    // Category navigation
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            await loadCategory(category);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length > 2) {
                searchTimeout = setTimeout(async () => {
                    await performSearch(query);
                }, 500);
            } else if (query.length === 0) {
                // Reset to default view
                initHomePage();
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query.length > 2) {
                    performSearch(query);
                }
            }
        });
    }
}

// Load news for selected country
async function loadCountryNews() {
    console.log('Loading news for country:', currentCountry);
    showLoading(true);
    
    const articles = await fetchTopHeadlines('', currentCountry);
    console.log('Fetched articles:', articles.length);
    currentArticles = articles;
    
    if (articles.length > 0) {
        displayFeaturedStory(articles[0]);
        displayHeadlines(articles.slice(1, 10));
        displayTrending(articles.slice(0, 5));
    } else {
        console.log('No articles found for country:', currentCountry);
    }
    
    showLoading(false);
}

// Load category
async function loadCategory(category) {
    showLoading(true);
    
    const articles = await fetchNewsByCategory(category, currentCountry);
    
    if (articles.length > 0) {
        displayFeaturedStory(articles[0]);
        displayHeadlines(articles.slice(1, 10));
        displayTrending(articles.slice(0, 5));
    }
    
    showLoading(false);
}

// Perform search
async function performSearch(query) {
    showLoading(true);
    
    const articles = await searchNews(query);
    
    if (articles.length > 0) {
        displayFeaturedStory(articles[0]);
        displayHeadlines(articles.slice(1, 10));
        displayTrending(articles.slice(0, 5));
    } else {
        // Show no results message
        const headlines = document.getElementById('headlines');
        if (headlines) {
            headlines.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #6b7280;">
                    <p>No results found for "${query}"</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem;">Try different keywords</p>
                </div>
            `;
        }
    }
    
    showLoading(false);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomePage);
} else {
    initHomePage();
}