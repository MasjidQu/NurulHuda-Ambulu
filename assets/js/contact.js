// Initialize app - using shared functions from app.js
document.addEventListener('DOMContentLoaded', function() {
    // loadSiteInfo() and updateContactInfo() are handled by app.js
    // Update page title for contact after site info loads
    setTimeout(() => {
        const siteName = document.querySelector('.logo h1')?.textContent.replace('🕌 ', '');
        if (siteName) {
            document.title = `Kontak - ${siteName}`;
        }
    }, 500);
    
    initMobileMenu();
    initContactForm();
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

// Initialize contact form
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
        submitBtn.disabled = true;
        
        try {
            // In a real implementation, you would send this to your backend
            // For now, we'll just show a success message
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            
            // Show success message
            showNotification('Pesan berhasil dikirim! Kami akan menghubungi Anda segera.', 'success');
            
            // Reset form
            form.reset();
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('Terjadi kesalahan. Silakan coba lagi nanti.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Show notification
function showNotification(message, type) {
    // Remove existing notification if any
    const existing = document.querySelector('.contact-notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `contact-notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}
