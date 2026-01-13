// Article Page JavaScript

let currentArticle = null;

// Initialize article page
async function initArticlePage() {
    // Get article ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    if (!articleId) {
        window.location.href = 'index.html';
        return;
    }
    
    // Load article data
    currentArticle = getArticleData(articleId);
    
    if (!currentArticle) {
        window.location.href = 'index.html';
        return;
    }
    
    // Display article
    displayArticleHeader();
    displayArticleContent();
    
    // Load related articles
    await loadRelatedArticles();
    
    // Setup event listeners
    setupArticleEventListeners();
}

// Display article header
function displayArticleHeader() {
    const article = currentArticle;
    
    // Update page title
    document.title = `${article.title} - NewsHub`;
    document.getElementById('pageTitle').textContent = `${article.title} - NewsHub`;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = article.description || article.title;
    
    // Display header content
    const categoryEl = document.getElementById('articleCategory');
    const titleEl = document.getElementById('articleTitle');
    const dateEl = document.getElementById('articleDate');
    const imageEl = document.getElementById('articleImage');
    
    if (categoryEl) categoryEl.textContent = article.source?.name || 'News';
    if (titleEl) titleEl.textContent = article.title;
    if (dateEl) dateEl.textContent = formatDate(article.publishedAt);
    if (imageEl) {
        imageEl.src = article.urlToImage || getDefaultImage();
        imageEl.alt = article.title;
    }
}

// Display article content
function displayArticleContent() {
    const article = currentArticle;
    
    // Update summary
    const summaryEl = document.getElementById('articleSummary');
    if (summaryEl) {
        summaryEl.textContent = article.description || 
            'This article provides comprehensive coverage of the latest developments in this story.';
    }
    
    // Update main content
    const contentEl = document.getElementById('articleContent');
    if (contentEl) {
        // If article has content, display it
        if (article.content) {
            // Clean up the content (News API truncates at [+chars])
            let content = article.content.replace(/\[\+\d+\s+chars\]$/, '');
            
            // Split into paragraphs
            const paragraphs = content.split('\n\n').filter(p => p.trim());
            
            contentEl.innerHTML = paragraphs.map(p => 
                `<p>${p.trim()}</p>`
            ).join('');
        } else {
            // Fallback content
            contentEl.innerHTML = `
                <p>This article provides detailed information about ${article.title.toLowerCase()}.</p>
                <p>For the full story, please visit the original source.</p>
                <p><a href="${article.url}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">Read the full article at ${article.source?.name}</a></p>
            `;
        }
    }
}

// Load related articles
async function loadRelatedArticles() {
    const article = currentArticle;
    
    // Get related articles (same source or category)
    const articles = await fetchTopHeadlines();
    
    // Filter out current article and get 3 related ones
    const related = articles
        .filter(a => a.url !== article.url)
        .slice(0, 3);
    
    displayRelatedArticles(related);
    displayMoreArticles(articles.slice(0, 4));
}

// Display related articles
function displayRelatedArticles(articles) {
    const container = document.getElementById('relatedArticles');
    if (!container) return;
    
    container.innerHTML = articles.map(article => {
        const id = storeArticleData(article);
        return `
            <a href="article.html?id=${id}" class="related-item">
                <img src="${article.urlToImage || getDefaultImage()}" alt="${article.title}">
                <div>
                    <h4>${article.title}</h4>
                    <p>${formatTimeAgo(article.publishedAt)}</p>
                </div>
            </a>
        `;
    }).join('');
}

// Display more articles from category
function displayMoreArticles(articles) {
    const container = document.getElementById('moreArticles');
    const categoryEl = document.getElementById('moreCategory');
    
    if (!container) return;
    
    if (categoryEl && currentArticle.source) {
        categoryEl.textContent = currentArticle.source.name;
    }
    
    container.innerHTML = articles.map(article => {
        const id = storeArticleData(article);
        return `
            <a href="article.html?id=${id}" class="more-item">
                <h4>${article.title}</h4>
                <p>${formatTimeAgo(article.publishedAt)}</p>
            </a>
        `;
    }).join('');
}

// Setup event listeners
function setupArticleEventListeners() {
    // Share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareArticle);
    }
    
    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        updateSaveButton();
        saveBtn.addEventListener('click', toggleBookmark);
    }
    
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
    
    // Category links
    document.querySelectorAll('[data-category]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            window.location.href = `index.html?category=${category}`;
        });
    });
}

// Share article
function shareArticle() {
    const article = currentArticle;
    
    if (navigator.share) {
        navigator.share({
            title: article.title,
            text: article.description,
            url: window.location.href
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: copy URL to clipboard
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Copy failed:', err);
            // Manual fallback
            prompt('Copy this link:', url);
        });
    }
}

// Toggle bookmark
function toggleBookmark() {
    const article = currentArticle;
    const articleId = getArticleIdFromUrl(article.url);
    
    if (isBookmarked(article.url)) {
        removeBookmark(articleId);
        alert('Article removed from bookmarks');
    } else {
        addBookmark(article);
        alert('Article saved to bookmarks');
    }
    
    updateSaveButton();
}

// Update save button state
function updateSaveButton() {
    const saveBtn = document.getElementById('saveBtn');
    if (!saveBtn || !currentArticle) return;
    
    if (isBookmarked(currentArticle.url)) {
        saveBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            Saved
        `;
        saveBtn.style.background = '#2563eb';
        saveBtn.style.color = 'white';
    } else {
        saveBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            Save
        `;
        saveBtn.style.background = '#f3f4f6';
        saveBtn.style.color = 'inherit';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArticlePage);
} else {
    initArticlePage();
}