// Dropdown & Sidebar Handler
export function initDropdowns() {
    // ===== CURRENCY DROPDOWN =====
    const currencyBtn = document.getElementById('btnSgd');
    const currencyDropdown = document.getElementById('currencyDropdown');
    const currencyText = currencyBtn?.querySelector('.currency-text');
    const currencyOptions = document.querySelectorAll('.currency-option');
    const currencySearch = document.getElementById('currencySearch');

    // Handle currency selection
    currencyOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const currency = option.getAttribute('data-currency');
            const symbol = option.getAttribute('data-symbol');
            
            // Update button text
            if (currencyText) {
                currencyText.textContent = currency;
            }
            
            // Update active state
            currencyOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Close dropdown
            if (currencyDropdown) {
                currencyDropdown.classList.remove('active');
            }
            
            console.log(`Currency changed to: ${currency} (${symbol})`);
        });
    });

    // Currency search functionality
    if (currencySearch) {
        currencySearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            currencyOptions.forEach(option => {
                const currency = option.getAttribute('data-currency').toLowerCase();
                const name = option.querySelector('.currency-name').textContent.toLowerCase();
                
                if (currency.includes(searchTerm) || name.includes(searchTerm)) {
                    option.style.display = 'flex';
                } else {
                    option.style.display = 'none';
                }
            });
        });
    }

    // Toggle currency dropdown on click
    if (currencyBtn && currencyDropdown) {
        currencyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currencyDropdown.classList.toggle('active');
            
            // Close other dropdowns
            const helpDropdown = document.getElementById('helpDropdown');
            if (helpDropdown) {
                helpDropdown.classList.remove('active');
            }
        });
    }

    // ===== HELP DROPDOWN =====
    const helpBtn = document.querySelector('.btn-help');
    const helpDropdown = document.getElementById('helpDropdown');

    if (helpBtn && helpDropdown) {
        helpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            helpDropdown.classList.toggle('active');
            
            // Close currency dropdown
            if (currencyDropdown) {
                currencyDropdown.classList.remove('active');
            }
        });
    }

    // ===== RECENTLY VIEWED SIDEBAR =====
    const recentlyViewedBtn = document.getElementById('btnRecentlyViewed');
    const recentlyViewedSidebar = document.getElementById('recentlyViewedSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarClose = document.getElementById('sidebarClose');

    function openRecentlyViewed() {
        if (recentlyViewedSidebar) {
            recentlyViewedSidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeRecentlyViewed() {
        if (recentlyViewedSidebar) {
            recentlyViewedSidebar.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (recentlyViewedBtn) {
        recentlyViewedBtn.addEventListener('click', openRecentlyViewed);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeRecentlyViewed);
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeRecentlyViewed);
    }

    // Close sidebar on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && recentlyViewedSidebar?.classList.contains('active')) {
            closeRecentlyViewed();
        }
    });

    // ===== SUB HEADER DROPDOWNS =====
    const subHeaderDropdowns = document.querySelectorAll('.sub-header-dropdown');
    
    // Handle hover for sub-header dropdowns (they work on hover by CSS)
    // But we can add click for mobile
    subHeaderDropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.sub-header-btn');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (btn && menu) {
            // On mobile, toggle on click
            btn.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const isActive = menu.classList.contains('active');
                    
                    // Close all dropdowns
                    document.querySelectorAll('.sub-header-dropdown .dropdown-menu').forEach(m => {
                        m.classList.remove('active');
                    });
                    
                    // Toggle current
                    if (!isActive) {
                        menu.classList.add('active');
                    }
                }
            });
        }
    });

    // ===== CLICK OUTSIDE TO CLOSE =====
    document.addEventListener('click', (e) => {
        // Close currency dropdown
        if (currencyDropdown && !currencyDropdown.contains(e.target) && !currencyBtn?.contains(e.target)) {
            currencyDropdown.classList.remove('active');
        }
        
        // Close help dropdown
        if (helpDropdown && !helpDropdown.contains(e.target) && !helpBtn?.contains(e.target)) {
            helpDropdown.classList.remove('active');
        }
        
        // Close mobile sub-header dropdowns
        if (window.innerWidth <= 768) {
            const clickedDropdown = e.target.closest('.sub-header-dropdown');
            if (!clickedDropdown) {
                document.querySelectorAll('.sub-header-dropdown .dropdown-menu.active').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        }
    });

    // ===== RECENTLY VIEWED ITEMS CLICK =====
    const recentlyViewedItems = document.querySelectorAll('.recently-viewed-item');
    
    recentlyViewedItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('h4').textContent;
            console.log(`Clicked on: ${title}`);
            // Here you would navigate to the item page
            // window.location.href = `/item/${itemId}`;
        });
    });

    // ===== HANDLE WINDOW RESIZE =====
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Remove mobile-only active classes on desktop
            if (window.innerWidth > 768) {
                document.querySelectorAll('.sub-header-dropdown .dropdown-menu.active').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        }, 250);
    });

    console.log('✅ Dropdowns initialized');
}

// Enhanced Currency Toggle (backwards compatible with existing code)
export function initEnhancedCurrencyToggle() {
    const currencyBtn = document.getElementById('btnSgd');
    const currencyText = currencyBtn?.querySelector('.currency-text');
    
    if (!currencyBtn || !currencyText) return;

    // Set initial currency from localStorage or default to USD
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
    currencyText.textContent = savedCurrency;

    // Update active state on load
    const activeOption = document.querySelector(`[data-currency="${savedCurrency}"]`);
    if (activeOption) {
        activeOption.classList.add('active');
    }

    // Save currency preference
    document.querySelectorAll('.currency-option').forEach(option => {
        option.addEventListener('click', () => {
            const currency = option.getAttribute('data-currency');
            localStorage.setItem('selectedCurrency', currency);
            
            // Emit custom event for currency change
            window.dispatchEvent(new CustomEvent('currencyChanged', {
                detail: {
                    currency: currency,
                    symbol: option.getAttribute('data-symbol')
                }
            }));
        });
    });

    console.log('✅ Enhanced currency toggle initialized');
}

