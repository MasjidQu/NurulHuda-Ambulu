// Initialize app - using shared functions from app.js
document.addEventListener('DOMContentLoaded', function() {
    // loadSiteInfo() and updateContactInfo() are handled by app.js
    // Update page title for infaq after site info loads
    setTimeout(() => {
        const siteName = document.querySelector('.logo h1')?.textContent.replace('🕌 ', '');
        if (siteName) {
            document.title = `Infaq - ${siteName}`;
        }
    }, 500);
    
    initMobileMenu();
    loadQRIS();
    loadBankAccounts();
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

// Load QRIS image
function loadQRIS() {
    const qrisImage = document.getElementById('qrisImage');
    if (!qrisImage) return;
    
    // Check if image already has a valid src from HTML
    const currentSrc = qrisImage.getAttribute('src');
    const hasValidSrc = currentSrc && currentSrc.trim() !== '' && !currentSrc.includes('placeholder');
    
    // Only set from JS if HTML doesn't have a valid src
    if (!hasValidSrc && typeof QRIS_IMAGE !== 'undefined') {
        qrisImage.src = QRIS_IMAGE;
    }
    
    // Set error handler for fallback
    qrisImage.onerror = function() {
        // Try QRIS_IMAGE from JS first if available and different from current
        if (typeof QRIS_IMAGE !== 'undefined' && this.src !== QRIS_IMAGE) {
            this.src = QRIS_IMAGE;
        } else {
            // Final fallback
            this.src = 'https://placehold.co/600x600';
        }
    };
}

// Download QRIS function
function downloadQRIS() {
    const qrisImage = document.getElementById('qrisImage');
    const imageUrl = qrisImage?.src || (typeof QRIS_IMAGE !== 'undefined' ? QRIS_IMAGE : null);
    
    if (!imageUrl) {
        showNotification('Gambar QRIS tidak tersedia', 'error');
        return;
    }
    
    // Create a temporary link to download the image
    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'QRIS-Masjid-Nurul-Huda.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            showNotification('QRIS berhasil didownload!', 'success');
        })
        .catch(error => {
            console.error('Download error:', error);
            // Fallback: open image in new tab
            window.open(imageUrl, '_blank');
            showNotification('Silakan simpan gambar secara manual', 'info');
        });
}

// Load bank accounts
function loadBankAccounts() {
    const bankAccountsGrid = document.getElementById('bankAccountsGrid');
    if (!bankAccountsGrid || typeof BANK_ACCOUNTS === 'undefined') return;
    
    bankAccountsGrid.innerHTML = '';
    
    BANK_ACCOUNTS.forEach((account, index) => {
        const accountCard = document.createElement('div');
        accountCard.className = 'bank-account-card';
        
        accountCard.innerHTML = `
            <div class="bank-header">
                <div class="bank-icon">
                    <i class="${account.icon}"></i>
                </div>
                <div class="bank-name">
                    <h3>${account.bank}</h3>
                    <p>Rekening Masjid</p>
                </div>
            </div>
            <div class="account-details">
                <div class="account-number">
                    <div class="account-number-label">Nomor Rekening</div>
                    <div class="account-number-value">
                        <span>${account.accountNumber}</span>
                        <button class="copy-btn" onclick="copyAccountNumber('${account.accountNumber}', ${index})" title="Salin nomor rekening">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                <div class="account-name">
                    <div class="account-name-label">Atas Nama</div>
                    <div>${account.accountName}</div>
                </div>
            </div>
        `;
        
        bankAccountsGrid.appendChild(accountCard);
    });
}

// Copy account number
function copyAccountNumber(accountNumber, index) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(accountNumber).then(() => {
            showNotification(`Nomor rekening ${accountNumber} berhasil disalin!`, 'success');
        }).catch(() => {
            showNotification('Gagal menyalin nomor rekening', 'error');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = accountNumber;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification(`Nomor rekening ${accountNumber} berhasil disalin!`, 'success');
        } catch (err) {
            showNotification('Gagal menyalin nomor rekening', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// Show notification
function showNotification(message, type) {
    // Remove existing notification if any
    const existing = document.querySelector('.infaq-notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `infaq-notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
