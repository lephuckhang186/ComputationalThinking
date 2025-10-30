/* Main sheet */

// Import utilities
import { initScrollFadeObserver } from './utils/observers.js';

// Import components
import { initLanguageSwitcher } from './components/language.js';
import { initCurrencyToggle } from './components/currency.js';
import { initScrollProgress, initBackToTop } from './components/scroll.js';
import { initCarousel } from './components/carousel.js';
import { initFloatingChat } from './components/floating-chat.js';
import { initAuthModal } from './components/auth-modal.js';
import { initDropdowns, initEnhancedCurrencyToggle } from './components/dropdowns.js';

/**
 * Initialize all application features
 */
function init() {
    // Observers
    initScrollFadeObserver();

    // UI Components
    initLanguageSwitcher();
    initCurrencyToggle();
    initScrollProgress();
    initBackToTop();
    initCarousel();
    initFloatingChat();
    initAuthModal();
    initDropdowns();
    initEnhancedCurrencyToggle();

    console.log('✅ Zenjourney initialized successfully!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

