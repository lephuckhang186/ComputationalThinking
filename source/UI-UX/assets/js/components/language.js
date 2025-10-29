/* ==========================================
   LANGUAGE SWITCHER
   ========================================== */

/**
 * Initialize language switcher functionality
 */
export function initLanguageSwitcher() {
    const topBarLangBtn = document.getElementById('topBarLangBtn');
    const topBarLangDropdown = document.getElementById('topBarLangDropdown');
    const topBarLangOptions = document.querySelectorAll('.top-bar-lang-option');

    if (!topBarLangBtn || !topBarLangDropdown) return;

    // Toggle dropdown on button click
    topBarLangBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = topBarLangDropdown.style.display === 'block';
        topBarLangDropdown.style.display = isVisible ? 'none' : 'block';
        topBarLangBtn.classList.toggle('active', !isVisible);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        topBarLangDropdown.style.display = 'none';
        topBarLangBtn.classList.remove('active');
    });

    // Prevent dropdown from closing when clicking inside it
    topBarLangDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Handle language option selection
    topBarLangOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            const text = option.querySelector('span').textContent;

            // Update button text
            topBarLangBtn.querySelector('.lang-text').textContent = text;

            // Store language preference
            localStorage.setItem('preferred-language', lang);

            // Close dropdown
            topBarLangDropdown.style.display = 'none';
            topBarLangBtn.classList.remove('active');
        });
    });
}

