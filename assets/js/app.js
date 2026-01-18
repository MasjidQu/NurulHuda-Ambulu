// API Configuration
const API_BASE_URL = "https://api_masjid.stellardigitalinnovations.com";
const SITE_ID = "143f5dd6-aa43-4b7c-bcdf-2d091301b69c";
const LOCATION_ID = "e4a6222cdb5b34375400904f03d8e6a5"; // Default location ID for prayer schedule
const ADDRESS = "Ambulu - Jember";
const TELP = "+62 812 9000 0276";
const EMAIL = "info@masjidnurulhuda.com";
const MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3947.599691112011!2d113.60700500000002!3d-8.342512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd69b6517e45ae3%3A0x829f0a64dafd48f8!2sMasjid%20Nurul%20Huda!5e0!3m2!1sid!2sid!4v1768552572045!5m2!1sid!2sid";

// Infaq Configuration
const QRIS_IMAGE = "https://via.placeholder.com/400x400?text=QRIS+Masjid"; // Replace with actual QRIS image URL
const BANK_ACCOUNTS = [
  {
    bank: "Bank BCA",
    accountNumber: "1234567890",
    accountName: "Masjid Nurul Huda",
    icon: "fab fa-university",
  },
  {
    bank: "Bank Mandiri",
    accountNumber: "0987654321",
    accountName: "Masjid Nurul Huda",
    icon: "fab fa-university",
  },
  {
    bank: "Bank BRI",
    accountNumber: "1122334455",
    accountName: "Masjid Nurul Huda",
    icon: "fab fa-university",
  },
];

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  loadSiteInfo();
  loadPosts();
  initMobileMenu();
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

  // Toggle menu on hamburger click
  menuToggle?.addEventListener('click', function() {
    if (nav?.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu on close button click
  menuClose?.addEventListener('click', closeMenu);

  // Close menu on overlay click
  menuOverlay?.addEventListener('click', closeMenu);

  // Close menu when clicking a nav link
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && nav?.classList.contains('active')) {
      closeMenu();
    }
  });

  // Close menu on window resize if open
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && nav?.classList.contains('active')) {
      closeMenu();
    }
  });
}

// Load site information
async function loadSiteInfo() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/site?site_id=${SITE_ID}`
    );
    const result = await response.json();

    if (result.data) {
      const site = result.data;

      // Update page title
      if (site.name) {
        document.title = `${site.name} - Beranda`;
        const logo = document.querySelector(".logo h1");
        if (logo) {
          logo.textContent = `🕌 ${site.name}`;
        }
      }

      // Update location in top bar
      const locationName = document.getElementById("locationName");
      const footerLocation = document.getElementById("footerLocation");
      if (site.lokasi) {
        const locationText = site.prov
          ? `${site.lokasi} - ${site.prov}`
          : site.lokasi;
        if (locationName) {
          locationName.textContent = locationText;
        }
        if (footerLocation) {
          footerLocation.textContent = locationText;
        }
      } else if (site.domain) {
        const locationText = site.domain.toUpperCase();
        if (locationName) {
          locationName.textContent = locationText;
        }
        if (footerLocation) {
          footerLocation.textContent = locationText;
        }
      }

      // Update current day and time
      updateCurrentDayTime();

      // Load prayer schedule if id_lokasi is available
      if (site.id_lokasi) {
        loadPrayerSchedule(site.id_lokasi);
      }
    }

    // Update contact info from variables after site info is loaded
    updateContactInfo();
  } catch (error) {
    console.error("Error loading site info:", error);
  }
}
//perbaiki jadwal waktu sholat, munculkan juga lognya untuk troubleshooting. harusnya dia
// Update current day and time
function updateCurrentDayTime() {
  const currentDayTime = document.getElementById("currentDayTime");
  if (!currentDayTime) return;

  const now = new Date();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const day = days[now.getDay()];
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  currentDayTime.textContent = `${day} - ${hours}:${minutes}`;

  // Update every minute
  setInterval(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    currentDayTime.textContent = `${day} - ${hours}:${minutes}`;
  }, 60000);
}

// Load prayer schedule from myquran.com API
async function loadPrayerSchedule(idLokasi) {
  try {
    // Use new endpoint format: /v3/sholat/jadwal/{id}/today
    const url = `https://api.myquran.com/v3/sholat/jadwal/${idLokasi}/today?tz=Asia%2FJakarta`;
    const response = await fetch(url);
    const result = await response.json();

    if (result.status && result.data && result.data.jadwal) {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

      // Get jadwal for today
      const jadwalHariIni = result.data.jadwal[todayStr];

      if (jadwalHariIni) {
        updatePrayerTimes(jadwalHariIni, result.data);
      } else {
        // If today's date not found, try to get the first available date
        const dates = Object.keys(result.data.jadwal);
        if (dates.length > 0) {
          const firstDate = dates[0];
          updatePrayerTimes(result.data.jadwal[firstDate], result.data);
        } else {
          throw new Error("No prayer schedule data available");
        }
      }
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error loading prayer schedule:", error);
    const prayerTime = document.getElementById("prayerTime");
    if (prayerTime) {
      prayerTime.innerHTML =
        '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Gagal memuat jadwal sholat. Silakan coba lagi nanti.</p>';
    }
  }
}

// Update prayer times in the UI
function updatePrayerTimes(jadwal, siteData) {
  const prayers = [
    { name: "Subuh", time: jadwal.subuh, icon: "🌙" },
    { name: "Dzuhur", time: jadwal.dzuhur, icon: "☀️" },
    { name: "Ashar", time: jadwal.ashar, icon: "🌤️" },
    { name: "Maghrib", time: jadwal.maghrib, icon: "🌅" },
    { name: "Isya", time: jadwal.isya, icon: "🌙" },
  ];

  // Update compact prayer times in top bar
  const prayerTimesText = document.getElementById("prayerTimesText");
  if (prayerTimesText) {
    const compactTimes = prayers.map((p) => `${p.name}: ${p.time}`).join(" | ");
    prayerTimesText.textContent = compactTimes;
  }

  // Update detailed prayer grid
  const prayerGrid = document.getElementById("prayerGrid");
  if (!prayerGrid) return;

  prayerGrid.innerHTML = "";

  prayers.forEach(({ name, time, icon }) => {
    const prayerItem = document.createElement("div");
    prayerItem.className = "prayer-item";
    prayerItem.innerHTML = `
            <div class="prayer-icon">${icon}</div>
            <div class="prayer-info">
                <span class="prayer-name">${name}</span>
                <span class="prayer-time-value">${time}</span>
            </div>
        `;
    prayerGrid.appendChild(prayerItem);
  });

  // Update location info if available
  const prayerTimeSection = document.getElementById("prayerTime");
  if (prayerTimeSection && siteData) {
    const h3 = prayerTimeSection.querySelector("h3");
    if (h3 && siteData.kabko) {
      const locationText = siteData.prov
        ? `${siteData.kabko}, ${siteData.prov}`
        : siteData.kabko;
      h3.innerHTML = `Jadwal Sholat Hari Ini <span class="prayer-location">(${locationText})</span>`;
    }
  }
}

// Load posts from API
async function loadPosts() {
  const articlesGrid = document.getElementById("articlesGrid");
  if (!articlesGrid) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/posts?site_id=${SITE_ID}&limit=6`
    );
    const result = await response.json();

    if (result.data && result.data.length > 0) {
      displayPosts(result.data);
    } else {
      articlesGrid.innerHTML =
        '<div class="loading">Belum ada artikel tersedia.</div>';
    }
  } catch (error) {
    console.error("Error loading posts:", error);
    articlesGrid.innerHTML =
      '<div class="loading">Gagal memuat artikel. Silakan coba lagi nanti.</div>';
  }
}

// Display posts in the grid
function displayPosts(posts) {
  const articlesGrid = document.getElementById("articlesGrid");
  if (!articlesGrid) return;

  articlesGrid.innerHTML = "";

  posts.forEach((post) => {
    const articleCard = document.createElement("div");
    articleCard.className = "article-card";
    articleCard.onclick = () => {
      // Navigate to post detail page
      window.location.href = `post.html?slug=${post.slug}&site_id=${SITE_ID}`;
    };

    // Format date
    const publishedDate = post.published_at
      ? new Date(post.published_at).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date(post.created_at).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    // Get excerpt or create from content
    let excerpt = post.excerpt || "";
    if (!excerpt && post.content) {
      // Strip HTML tags and get first 150 characters
      const textContent = post.content.replace(/<[^>]*>/g, "");
      excerpt = textContent.substring(0, 150);
      if (textContent.length > 150) {
        excerpt += "...";
      }
    }

    articleCard.innerHTML = `
            <div class="article-card-content">
                <h4 class="article-title">${post.title}</h4>
                <p class="article-excerpt">${excerpt}</p>
                <div class="article-meta">
                    <span class="article-author">👤 ${
                      post.author ? post.author.username : "Admin"
                    }</span>
                    <div>
                        <span class="article-date">📅 ${publishedDate}</span>
                        <span class="article-views" style="margin-left: 12px;">
                            👁️ ${post.view_count || 0}
                        </span>
                    </div>
                </div>
            </div>
        `;

    articlesGrid.appendChild(articleCard);
  });
}

// Update contact info from variables - can be used by all pages
function updateContactInfo() {
  // Update phone numbers in header buttons
  const headerPhoneBtn = document.querySelector(".header-contact-btn");
  if (headerPhoneBtn && typeof TELP !== "undefined") {
    headerPhoneBtn.innerHTML = `<i class="fas fa-phone"></i> ${TELP}`;
    headerPhoneBtn.href = `tel:${TELP.replace(/\s/g, "")}`;
  }

  // Update phone in contact cards
  const contactPhoneCards = document.querySelectorAll(".contact-card");
  contactPhoneCards.forEach((card) => {
    const h3 = card.querySelector("h3");
    if (h3 && h3.textContent === "Telepon" && typeof TELP !== "undefined") {
      const p = card.querySelector("p");
      if (p && !p.querySelector("a")) {
        p.textContent = TELP;
      }
      const link = card.querySelector('a[href^="tel:"]');
      if (link) {
        link.href = `tel:${TELP.replace(/\s/g, "")}`;
      }
    }
  });

  // Update email in contact cards
  contactPhoneCards.forEach((card) => {
    const h3 = card.querySelector("h3");
    if (h3 && h3.textContent === "Email" && typeof EMAIL !== "undefined") {
      const p = card.querySelector("p");
      if (p && !p.querySelector("a")) {
        p.textContent = EMAIL;
      }
      const link = card.querySelector('a[href^="mailto:"]');
      if (link) {
        link.href = `mailto:${EMAIL}`;
        if (link.textContent.includes("@")) {
          link.textContent = EMAIL;
        }
      }
    }
  });

  // Update address in contact cards and footer
  if (typeof ADDRESS !== "undefined") {
    // Contact card address
    contactPhoneCards.forEach((card) => {
      const h3 = card.querySelector("h3");
      if (h3 && h3.textContent === "Alamat") {
        const p = card.querySelector("p");
        if (p && p.id !== "contactAddress") {
          p.textContent = ADDRESS;
        }
      }
    });

    // Contact address element
    const contactAddress = document.getElementById("contactAddress");
    if (contactAddress) {
      contactAddress.textContent = ADDRESS;
    }

    // Footer location
    const footerLocation = document.getElementById("footerLocation");
    if (footerLocation) {
      footerLocation.textContent = ADDRESS;
    }
  }

  // Update email in footer
  const footerEmails = document.querySelectorAll(".footer-section p");
  footerEmails.forEach((p) => {
    if (p.textContent.includes("@") && typeof EMAIL !== "undefined") {
      const icon = p.querySelector("i");
      if (icon && icon.classList.contains("fa-envelope")) {
        p.innerHTML = `<i class="fas fa-envelope"></i> ${EMAIL}`;
      }
    }
  });

  // Update phone in footer
  footerEmails.forEach((p) => {
    if (p.textContent.includes("+62") && typeof TELP !== "undefined") {
      const icon = p.querySelector("i");
      if (icon && icon.classList.contains("fa-phone")) {
        p.innerHTML = `<i class="fas fa-phone"></i> ${TELP}`;
      }
    }
  });

  // Update map iframe (only main map, not footer)
  if (typeof MAP_URL !== "undefined") {
    const mapFrame = document.getElementById('mapFrame');
    if (mapFrame) {
      mapFrame.src = MAP_URL;
    }
  }

  // Update WhatsApp link
  const whatsappLink = document.querySelector(
    ".social-link-card.whatsapp .social-link-info p"
  );
  if (whatsappLink && typeof TELP !== "undefined") {
    whatsappLink.textContent = TELP;
  }
}
