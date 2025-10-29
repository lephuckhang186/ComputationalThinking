/* ==========================================
   CURRENCY SELECTOR (SGD BUTTON)
   ========================================== */

/**
 * Initialize SGD currency button toggle
 */
export function initCurrencyToggle() {
    const btnSgd = document.getElementById('btnSgd');

    if (!btnSgd) return;

    btnSgd.addEventListener('click', () => {
        btnSgd.classList.toggle('active');

        // You can add dropdown logic here later
        // For now, just toggle the arrow
    });
}

