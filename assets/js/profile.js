// Initialize app - using shared functions from app.js
document.addEventListener('DOMContentLoaded', function() {
    // Load site info and update contact info will be handled by app.js
    // Just initialize tabs for this page
    initMobileMenu();
    initTabs();
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

// Initialize tabs
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}
