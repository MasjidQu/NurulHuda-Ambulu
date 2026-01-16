// Blog-specific variables
let currentPage = 1;
let currentYear = null;
let currentMonth = null;
let allPosts = [];
let displayedPosts = [];
const postsPerPage = 10;

// Initialize app - using shared functions from app.js
document.addEventListener("DOMContentLoaded", function () {
  // loadSiteInfo() and updateContactInfo() are handled by app.js
  // Update page title for blog after site info loads
  setTimeout(() => {
    const siteName = document
      .querySelector(".logo h1")
      ?.textContent.replace("🕌 ", "");
    if (siteName) {
      document.title = `Blog - ${siteName}`;
    }
  }, 500);

  initMobileMenu();
  loadArchiveNavigation();
  loadPosts();
  loadRecentPosts();
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

// Load archive navigation
async function loadArchiveNavigation() {
  const archiveNav = document.getElementById("archiveNav");
  if (!archiveNav) return;

  try {
    // Get years
    const yearsResponse = await fetch(
      `${API_BASE_URL}/api/posts/archive/years?site_id=${SITE_ID}`
    );
    const yearsResult = await yearsResponse.json();

    if (!yearsResult.data || yearsResult.data.length === 0) {
      archiveNav.innerHTML = '<p class="empty-archive">Belum ada artikel</p>';
      return;
    }

    // Get posts for last 12 months (default)
    const postsResponse = await fetch(
      `${API_BASE_URL}/api/posts/archive?site_id=${SITE_ID}`
    );
    const postsResult = await postsResponse.json();

    if (postsResult.data) {
      allPosts = postsResult.data;
      buildArchiveNavigation(yearsResult.data, postsResult.data);
    }
  } catch (error) {
    console.error("Error loading archive:", error);
    archiveNav.innerHTML = '<p class="error">Gagal memuat arsip</p>';
  }
}

// Build archive navigation from posts
function buildArchiveNavigation(years, posts) {
  const archiveNav = document.getElementById("archiveNav");
  if (!archiveNav) return;

  // Group posts by year and month
  const archive = {};
  const currentDate = new Date();
  const currentYearNum = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth() + 1;

  posts.forEach((post) => {
    if (!post.published_at) return;
    const date = new Date(post.published_at);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (!archive[year]) {
      archive[year] = {};
    }
    if (!archive[year][month]) {
      archive[year][month] = [];
    }
    archive[year][month].push(post);
  });

  // Build HTML
  let html = "";
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  years.forEach((year) => {
    const yearNum = parseInt(year);
    const isCurrentYear = yearNum === currentYearNum;
    const hasMonths =
      archive[yearNum] && Object.keys(archive[yearNum]).length > 0;

    html += `
            <div class="archive-year">
                <div class="archive-year-header" onclick="toggleYear(${yearNum})">
                    <i class="fas fa-chevron-${
                      isCurrentYear ? "down" : "right"
                    }"></i>
                    <span class="year-label">${yearNum}</span>
                    <span class="year-count">${
                      hasMonths ? `(${getYearPostCount(archive[yearNum])})` : ""
                    }</span>
                </div>
                <div class="archive-months" style="display: ${
                  isCurrentYear ? "block" : "none"
                };" id="year-${yearNum}">
        `;

    if (hasMonths) {
      // Sort months descending
      const months = Object.keys(archive[yearNum])
        .map((m) => parseInt(m))
        .sort((a, b) => b - a);

      months.forEach((month) => {
        const isCurrentMonth = isCurrentYear && month === currentMonthNum;
        const monthPosts = archive[yearNum][month];

        html += `
                    <div class="archive-month">
                        <div class="archive-month-header" onclick="toggleMonth(${yearNum}, ${month})">
                            <i class="fas fa-chevron-${
                              isCurrentMonth ? "down" : "right"
                            }"></i>
                            <span class="month-label">${
                              monthNames[month - 1]
                            }</span>
                            <span class="month-count">(${
                              monthPosts.length
                            })</span>
                        </div>
                        <ul class="archive-posts" style="display: ${
                          isCurrentMonth ? "block" : "none"
                        };" id="month-${yearNum}-${month}">
                `;

        monthPosts.forEach((post) => {
          const date = new Date(post.published_at);
          const day = date.getDate();
          html += `
                        <li>
                            <a href="post.html?slug=${post.slug}&site_id=${SITE_ID}">
                                <span class="post-day">${day}</span>
                                <span class="post-title">${post.title}</span>
                            </a>
                        </li>
                    `;
        });

        html += `
                        </ul>
                    </div>
                `;
      });
    } else {
      // Placeholder for years not in current data (will be loaded on demand)
      html += '<div class="loading-year" style="display: none;"></div>';
    }

    html += `
                </div>
            </div>
        `;
  });

  archiveNav.innerHTML = html;
}

function getYearPostCount(yearData) {
  if (!yearData) return 0;
  let count = 0;
  Object.values(yearData).forEach((monthPosts) => {
    count += monthPosts.length;
  });
  return count;
}

async function toggleYear(year) {
  const monthsDiv = document.getElementById(`year-${year}`);
  const header = event.currentTarget;
  const icon = header.querySelector("i");

  if (monthsDiv.style.display === "none" || monthsDiv.style.display === "") {
    // Check if year data needs to be loaded
    const hasContent = monthsDiv.querySelector(".archive-month") !== null;
    if (!hasContent && monthsDiv.innerHTML.trim() !== "") {
      monthsDiv.innerHTML =
        '<div class="loading-year"><i class="fas fa-spinner fa-spin"></i> Memuat...</div>';
      await loadYearArchive(year);
    }
    monthsDiv.style.display = "block";
    icon.classList.remove("fa-chevron-right");
    icon.classList.add("fa-chevron-down");
  } else {
    monthsDiv.style.display = "none";
    icon.classList.remove("fa-chevron-down");
    icon.classList.add("fa-chevron-right");
  }
}

function toggleMonth(year, month) {
  const postsList = document.getElementById(`month-${year}-${month}`);
  const header = event.currentTarget;
  const icon = header.querySelector("i");

  if (postsList.style.display === "none" || postsList.style.display === "") {
    postsList.style.display = "block";
    icon.classList.remove("fa-chevron-right");
    icon.classList.add("fa-chevron-down");
  } else {
    postsList.style.display = "none";
    icon.classList.remove("fa-chevron-down");
    icon.classList.add("fa-chevron-right");
  }
}

// Load posts for blog page
async function loadPosts(year = null, month = null) {
  const blogPosts = document.getElementById("blogPosts");
  if (!blogPosts) return;

  try {
    let url = `${API_BASE_URL}/api/posts/archive?site_id=${SITE_ID}`;
    if (year) {
      url += `&year=${year}`;
      if (month) {
        url += `&month=${month}`;
      }
    }

    const response = await fetch(url);
    const result = await response.json();

    if (result.data && result.data.length > 0) {
      allPosts = result.data;
      displayedPosts = [];
      currentPage = 1;
      displayPosts();
    } else {
      blogPosts.innerHTML =
        '<div class="empty-state"><i class="fas fa-inbox"></i><p>Belum ada artikel tersedia.</p></div>';
    }
  } catch (error) {
    console.error("Error loading posts:", error);
    blogPosts.innerHTML =
      '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>Gagal memuat artikel. Silakan coba lagi nanti.</p></div>';
  }
}

// Display posts with pagination
function displayPosts() {
  const blogPostsGrid = document.getElementById("blogPostsGrid");
  if (!blogPostsGrid) return;

  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const postsToShow = allPosts.slice(startIndex, endIndex);

  if (currentPage === 1) {
    blogPostsGrid.innerHTML = "";
  }

  postsToShow.forEach((post) => {
    displayedPosts.push(post);
    const postCard = createPostCard(post);
    blogPostsGrid.appendChild(postCard);
  });

  // Show/hide load more button
  const pagination = document.getElementById("pagination");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (endIndex < allPosts.length) {
    pagination.style.display = "block";
    loadMoreBtn.style.display = "block";
  } else {
    pagination.style.display = "none";
  }
}

function loadMorePosts() {
  currentPage++;
  displayPosts();
}

// Generate gradient-based placeholder (no external service needed)
// Creates beautiful gradients based on post title
function generateGradientPlaceholder(title) {
  // Create a hash from title for consistent colors
  const hash = title.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Generate colors in teal/green range (Islamic theme)
  const hue1 = 160 + (Math.abs(hash) % 40); // 160-200 (teal range)
  const hue2 = hue1 + 20;
  const sat1 = 60 + (Math.abs(hash) % 20); // 60-80%
  const sat2 = sat1 + 10;
  const light1 = 40 + (Math.abs(hash) % 15); // 40-55%
  const light2 = light1 - 10;

  return `linear-gradient(135deg, 
    hsl(${hue1}, ${sat1}%, ${light1}%) 0%, 
    hsl(${hue2}, ${sat2}%, ${light2}%) 50%,
    hsl(${hue1 + 10}, ${sat1 - 5}%, ${light1 - 5}%) 100%)`;
}

function createPostCard(post) {
  const card = document.createElement("article");
  card.className = "blog-post-card";
  card.onclick = () => {
    window.location.href = `post.html?slug=${post.slug}&site_id=${SITE_ID}`;
  };

  const publishedDate = post.published_at
    ? new Date(post.published_at)
    : new Date(post.created_at);

  const dateStr = publishedDate
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  // Check if post has featured image or cover image
  // API might return featured_image_url or we need to construct it from featured_image_id
  const hasImage =
    post.featured_image_url || post.cover_image_url || post.featured_image_id;
  let imageUrl = post.featured_image_url || post.cover_image_url;

  // If we have featured_image_id but no URL, construct URL (assuming media endpoint)
  if (!imageUrl && post.featured_image_id) {
    imageUrl = `${API_BASE_URL}/uploads/${post.featured_image_id}`;
  }

  // Create image HTML
  let imageHTML = "";
  if (hasImage && imageUrl) {
    imageHTML = `
      <div class="blog-post-image">
        <img src="${imageUrl}" alt="${post.title}" 
          onerror="this.onerror=null; this.parentElement.classList.add('no-image'); this.style.display='none'; 
          const placeholder = document.createElement('div');
          placeholder.className = 'image-placeholder';
          placeholder.innerHTML = '<i class=\\'fas fa-newspaper\\'></i><span>Artikel</span>';
          this.parentElement.appendChild(placeholder);" />
      </div>
    `;
  } else {
    // No image - use beautiful gradient placeholder
    const gradient = generateGradientPlaceholder(post.title);
    imageHTML = `
      <div class="blog-post-image no-image" style="background: ${gradient};">
        <div class="image-placeholder">
          <i class="fas fa-newspaper"></i>
          <span>Artikel</span>
        </div>
      </div>
    `;
  }

  card.innerHTML = `
    ${imageHTML}
    <div class="blog-post-content">
      <h3 class="blog-post-title">${post.title}</h3>
      <div class="blog-post-date">${dateStr}</div>
    </div>
  `;

  return card;
}

// Load recent posts for sidebar
async function loadRecentPosts() {
  const recentPosts = document.getElementById("recentPosts");
  if (!recentPosts) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/posts?site_id=${SITE_ID}&limit=5`
    );
    const result = await response.json();

    if (result.data && result.data.length > 0) {
      recentPosts.innerHTML = "";
      result.data.forEach((post) => {
        const recentItem = createRecentPostItem(post);
        recentPosts.appendChild(recentItem);
      });
    } else {
      recentPosts.innerHTML = '<p class="empty-state">Belum ada postingan</p>';
    }
  } catch (error) {
    console.error("Error loading recent posts:", error);
    recentPosts.innerHTML = '<p class="error-state">Gagal memuat postingan</p>';
  }
}

function createRecentPostItem(post) {
  const item = document.createElement("a");
  item.className = "recent-post-item";
  item.href = `post.html?slug=${post.slug}&site_id=${SITE_ID}`;

  const publishedDate = post.published_at
    ? new Date(post.published_at)
    : new Date(post.created_at);

  const dateStr = publishedDate.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Check if post has featured image
  const hasImage =
    post.featured_image_url || post.cover_image_url || post.featured_image_id;
  let imageUrl = post.featured_image_url || post.cover_image_url;

  // If we have featured_image_id but no URL, construct URL
  if (!imageUrl && post.featured_image_id) {
    imageUrl = `${API_BASE_URL}/uploads/${post.featured_image_id}`;
  }

  let thumbHTML = "";
  if (hasImage && imageUrl) {
    thumbHTML = `
      <div class="recent-post-thumb">
        <img src="${imageUrl}" alt="${post.title}" 
          onerror="this.onerror=null; this.parentElement.classList.add('no-image'); this.style.display='none'; 
          const icon = document.createElement('i');
          icon.className = 'fas fa-newspaper';
          this.parentElement.appendChild(icon);" />
      </div>
    `;
  } else {
    const gradient = generateGradientPlaceholder(post.title);
    thumbHTML = `
      <div class="recent-post-thumb no-image" style="background: ${gradient};">
        <i class="fas fa-newspaper"></i>
      </div>
    `;
  }

  item.innerHTML = `
    ${thumbHTML}
    <div class="recent-post-info">
      <div class="recent-post-title">${post.title}</div>
      <div class="recent-post-date">${dateStr}</div>
    </div>
  `;

  return item;
}

// Load archive for specific year (lazy loading)
async function loadYearArchive(year) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/posts/archive?site_id=${SITE_ID}&year=${year}`
    );
    const result = await response.json();

    if (result.data && result.data.length > 0) {
      // Update the specific year in archive navigation
      updateYearArchive(year, result.data);
    } else {
      const monthsDiv = document.getElementById(`year-${year}`);
      if (monthsDiv) {
        monthsDiv.innerHTML =
          '<p class="empty-archive">Tidak ada artikel di tahun ini</p>';
      }
    }
  } catch (error) {
    console.error("Error loading year archive:", error);
    const monthsDiv = document.getElementById(`year-${year}`);
    if (monthsDiv) {
      monthsDiv.innerHTML = '<p class="error-archive">Gagal memuat data</p>';
    }
  }
}

// Update archive for specific year
function updateYearArchive(year, posts) {
  const monthsDiv = document.getElementById(`year-${year}`);
  if (!monthsDiv) return;

  if (posts.length === 0) {
    monthsDiv.innerHTML =
      '<p class="empty-archive">Tidak ada artikel di tahun ini</p>';
    return;
  }

  // Group posts by month
  const archive = {};
  posts.forEach((post) => {
    if (!post.published_at) return;
    const date = new Date(post.published_at);
    const month = date.getMonth() + 1;
    if (!archive[month]) {
      archive[month] = [];
    }
    archive[month].push(post);
  });

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const currentDate = new Date();
  const currentYearNum = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth() + 1;
  const isCurrentYear = year === currentYearNum;

  let html = "";
  const months = Object.keys(archive)
    .map((m) => parseInt(m))
    .sort((a, b) => b - a);

  months.forEach((month) => {
    const isCurrentMonth = isCurrentYear && month === currentMonthNum;
    const monthPosts = archive[month];

    html += `
            <div class="archive-month">
                <div class="archive-month-header" onclick="toggleMonth(${year}, ${month})">
                    <i class="fas fa-chevron-${
                      isCurrentMonth ? "down" : "right"
                    }"></i>
                    <span class="month-label">${monthNames[month - 1]}</span>
                    <span class="month-count">(${monthPosts.length})</span>
                </div>
                <ul class="archive-posts" style="display: ${
                  isCurrentMonth ? "block" : "none"
                };" id="month-${year}-${month}">
        `;

    monthPosts.forEach((post) => {
      const date = new Date(post.published_at);
      const day = date.getDate();
      html += `
                <li>
                    <a href="post.html?slug=${post.slug}&site_id=${SITE_ID}">
                        <span class="post-day">${day}</span>
                        <span class="post-title">${post.title}</span>
                    </a>
                </li>
            `;
    });

    html += `
                </ul>
            </div>
        `;
  });

  monthsDiv.innerHTML = html;

  // Update year count in header
  const yearHeader = monthsDiv
    .closest(".archive-year")
    .querySelector(".archive-year-header");
  const yearCount = yearHeader.querySelector(".year-count");
  if (yearCount) {
    yearCount.textContent = `(${posts.length})`;
  }
}
