/* Observer */

/**
 * Initialize scroll fade animation for elements
 */
export function initScrollFadeObserver() {
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '-50px'
    });

    // Observe all scroll-fade elements
    const fadeElements = document.querySelectorAll('.scroll-fade');
    fadeElements.forEach(el => {
        el.classList.remove('visible');
        fadeObserver.observe(el);
    });
}

