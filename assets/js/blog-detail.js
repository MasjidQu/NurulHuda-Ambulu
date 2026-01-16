// Blog Detail - Fetch and display article from API

// API Configuration
const API_BASE_URL = window.location.origin;
const SITE_ID = '143f5dd6-aa43-4b7c-bcdf-2d091301b69c';

// Get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        slug: params.get('slug') || getSlugFromPath(),
        postId: params.get('post_id'),
        siteId: params.get('site_id') || SITE_ID
    };
}

// Get slug from URL path (for clean URLs like /blog/judul-artikel)
function getSlugFromPath() {
    const path = window.location.pathname;
    const parts = path.split('/');
    const slug = parts[parts.length - 1];
    return slug !== 'blog-detail.html' ? slug : null;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    loadArticle();
    loadRecentPosts();
    setupShareButtons();
    setupCopyLink();
});

// Mobile Menu Functionality
function initMobileMenu() {
  const menuToggle = document.getElementById('mobileMenuToggle');
  const menuClose = document.getElementById('mobileMenuClose');
  const menuOverlay = document.getElementById('mobileMenuOverlay');
  const nav = document.getElementById('mainNav');
  const navLinks = nav ? nav.querySelectorAll('.nav-link') : [];

  function openMenu() {
    menuToggle?.classList.add('active');
    nav?.classList.add('active');
    menuOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuToggle?.classList.remove('active');
    nav?.classList.remove('active');
    menuOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  menuToggle?.addEventListener('click', function() {
    if (nav?.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menuClose?.addEventListener('click', closeMenu);
  menuOverlay?.addEventListener('click', closeMenu);
  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && nav?.classList.contains('active')) {
      closeMenu();
    }
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && nav?.classList.contains('active')) {
      closeMenu();
    }
  });
}

// Load article from API
async function loadArticle() {
    const params = getUrlParams();
    
    if (!params.slug && !params.postId) {
        showError('Parameter artikel tidak ditemukan');
        return;
    }

    showLoading(true);

    try {
        // Build API URL
        let apiUrl = `${API_BASE_URL}/api/posts/${params.slug || 'detail'}?site_id=${params.siteId}`;
        if (params.postId) {
            apiUrl += `&post_id=${params.postId}`;
        }

        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.data) {
            displayArticle(result.data);
            loadRelatedPosts(result.data.category_id, result.data.id);
        } else {
            showError('Artikel tidak ditemukan');
        }
    } catch (error) {
        console.error('Error loading article:', error);
        showError('Gagal memuat artikel. Silakan coba lagi.');
    }
}

// Display article content
function displayArticle(article) {
    showLoading(false);
    
    // Update page title and meta tags
    document.title = `${article.title} - Masjid Nurul Huda`;
    updateMetaTags(article);

    // Update hero section
    updateHeroSection(article);

    // Show article body
    const articleBody = document.getElementById('articleBody');
    articleBody.style.display = 'block';

    // Featured Image
    if (article.featured_image) {
        const featuredContainer = document.getElementById('featuredImageContainer');
        const featuredImage = document.getElementById('featuredImage');
        const imageCaption = document.getElementById('imageCaption');
        
        featuredContainer.style.display = 'block';
        featuredImage.src = article.featured_image;
        featuredImage.alt = article.title;
        
        if (article.image_caption) {
            imageCaption.textContent = article.image_caption;
            imageCaption.style.display = 'block';
        }
    }

    // Article content
    const articleText = document.getElementById('articleText');
    articleText.innerHTML = article.content || article.body || '<p>Konten tidak tersedia.</p>';

    // Tags
    if (article.tags && article.tags.length > 0) {
        const tagsContainer = document.getElementById('articleTags');
        const tagsList = document.getElementById('tagsList');
        
        tagsContainer.style.display = 'flex';
        tagsList.innerHTML = article.tags.map(tag => 
            `<a href="blog.html?tag=${encodeURIComponent(tag.slug || tag.name)}" class="tag-item">#${tag.name}</a>`
        ).join('');
    }

    // Update author info
    updateAuthorInfo(article);

    // Update share buttons
    updateShareButtons(article);

    // Navigation (prev/next articles)
    if (article.prev_post || article.next_post) {
        updateNavigation(article);
    }
}

// Update hero section
function updateHeroSection(article) {
    // Hero background image
    if (article.featured_image) {
        const heroImage = document.getElementById('heroImage');
        heroImage.style.backgroundImage = `url('${article.featured_image}')`;
    }

    // Breadcrumb
    const breadcrumbTitle = document.getElementById('breadcrumbTitle');
    breadcrumbTitle.textContent = truncateText(article.title, 30);

    // Category
    const categoryEl = document.getElementById('articleCategory');
    if (article.category) {
        categoryEl.innerHTML = `<i class="fas fa-folder-open"></i><span>${article.category.name || article.category}</span>`;
    }

    // Date
    const dateEl = document.getElementById('articleDate');
    const publishDate = article.published_at || article.created_at;
    dateEl.textContent = formatDate(publishDate);
    
    // Reading time
    const readingTimeEl = document.getElementById('readingTime');
    if (readingTimeEl) {
        readingTimeEl.textContent = estimateReadingTime(article.content || article.body);
    }

    // Title
    document.getElementById('articleTitle').textContent = article.title;

    // Author
    if (article.author) {
        document.getElementById('authorName').textContent = article.author.name || article.author;
        
        if (article.author.avatar) {
            const avatarEl = document.getElementById('authorAvatar');
            avatarEl.innerHTML = `<img src="${article.author.avatar}" alt="${article.author.name}">`;
        }
    }
}

// Update author box
function updateAuthorInfo(article) {
    if (article.author) {
        document.getElementById('authorBoxName').textContent = article.author.name || article.author;
        
        if (article.author.bio) {
            document.getElementById('authorBoxBio').textContent = article.author.bio;
        }
        
        if (article.author.avatar) {
            const avatarEl = document.getElementById('authorBoxAvatar');
            avatarEl.innerHTML = `<img src="${article.author.avatar}" alt="${article.author.name}">`;
        }
    }
}

// Update meta tags for SEO and social sharing
function updateMetaTags(article) {
    const description = article.excerpt || article.meta_description || truncateText(stripHtml(article.content || article.body), 160);
    
    document.getElementById('metaDescription').content = description;
    document.getElementById('ogTitle').content = article.title;
    document.getElementById('ogDescription').content = description;
    
    if (article.featured_image) {
        document.getElementById('ogImage').content = article.featured_image;
    }
}

// Update share buttons
function updateShareButtons(article) {
    const currentUrl = window.location.href;
    const title = encodeURIComponent(article.title);
    const url = encodeURIComponent(currentUrl);

    document.getElementById('shareFacebook').href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    document.getElementById('shareTwitter').href = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
    document.getElementById('shareWhatsapp').href = `https://wa.me/?text=${title}%20${url}`;
    document.getElementById('shareTelegram').href = `https://t.me/share/url?url=${url}&text=${title}`;
}

// Setup share button handlers
function setupShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn[target="_blank"]');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                window.open(href, '_blank', 'width=600,height=400');
            }
        });
    });
}

// Setup copy link button
function setupCopyLink() {
    const copyBtn = document.getElementById('copyLink');
    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast();
        }).catch(err => {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = window.location.href;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast();
        });
    });
}

// Show toast notification
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Update navigation (prev/next)
function updateNavigation(article) {
    if (article.prev_post) {
        const prevNav = document.getElementById('navPrev');
        prevNav.style.display = 'flex';
        prevNav.href = `blog-detail.html?slug=${article.prev_post.slug}&site_id=${SITE_ID}`;
        document.getElementById('prevTitle').textContent = article.prev_post.title;
    }

    if (article.next_post) {
        const nextNav = document.getElementById('navNext');
        nextNav.style.display = 'flex';
        nextNav.href = `blog-detail.html?slug=${article.next_post.slug}&site_id=${SITE_ID}`;
        document.getElementById('nextTitle').textContent = article.next_post.title;
    }
}

// Load related posts
async function loadRelatedPosts(categoryId, currentPostId) {
    const container = document.getElementById('relatedPosts');
    
    if (!categoryId) {
        container.innerHTML = '<p class="loading-small">Tidak ada artikel terkait</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/posts?site_id=${SITE_ID}&category_id=${categoryId}&limit=4`);
        const result = await response.json();

        if (result.data && result.data.length > 0) {
            // Filter out current post
            const relatedPosts = result.data.filter(post => post.id !== currentPostId).slice(0, 3);
            
            if (relatedPosts.length > 0) {
                container.innerHTML = relatedPosts.map(post => createPostItem(post, 'related')).join('');
            } else {
                container.innerHTML = '<p class="loading-small">Tidak ada artikel terkait</p>';
            }
        } else {
            container.innerHTML = '<p class="loading-small">Tidak ada artikel terkait</p>';
        }
    } catch (error) {
        console.error('Error loading related posts:', error);
        container.innerHTML = '<p class="loading-small">Gagal memuat artikel terkait</p>';
    }
}

// Load recent posts
async function loadRecentPosts() {
    const container = document.getElementById('recentPosts');

    try {
        const response = await fetch(`${API_BASE_URL}/api/posts?site_id=${SITE_ID}&limit=5&sort=published_at&order=desc`);
        const result = await response.json();

        if (result.data && result.data.length > 0) {
            container.innerHTML = result.data.map(post => createPostItem(post, 'recent')).join('');
        } else {
            container.innerHTML = '<p class="loading-small">Belum ada artikel</p>';
        }
    } catch (error) {
        console.error('Error loading recent posts:', error);
        container.innerHTML = '<p class="loading-small">Gagal memuat artikel terbaru</p>';
    }
}

// Create post item HTML
function createPostItem(post, type = 'recent') {
    const prefix = type === 'related' ? 'related' : 'recent';
    const imageHtml = post.featured_image 
        ? `<img src="${post.featured_image}" alt="${post.title}">`
        : `<i class="fas fa-newspaper"></i>`;
    const thumbClass = post.featured_image ? '' : 'no-image';
    
    return `
        <a href="blog-detail.html?slug=${post.slug}&site_id=${SITE_ID}" class="${prefix}-post-item">
            <div class="${prefix}-post-thumb ${thumbClass}">
                ${imageHtml}
            </div>
            <div class="${prefix}-post-info">
                <h4 class="${prefix}-post-title">${post.title}</h4>
                <span class="${prefix}-post-date">${formatDate(post.published_at || post.created_at)}</span>
            </div>
        </a>
    `;
}

// Show loading state
function showLoading(show) {
    const loading = document.getElementById('articleLoading');
    loading.style.display = show ? 'block' : 'none';
}

// Show error state
function showError(message) {
    showLoading(false);
    
    const errorEl = document.getElementById('articleError');
    const errorMsg = errorEl.querySelector('p');
    errorMsg.textContent = message;
    errorEl.style.display = 'block';

    // Update hero for error state
    document.getElementById('articleTitle').textContent = 'Artikel Tidak Ditemukan';
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    };
    
    return date.toLocaleDateString('id-ID', options);
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Reading time estimation
function estimateReadingTime(content) {
    if (!content) return '1 menit';
    const text = stripHtml(content);
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} menit`;
}
