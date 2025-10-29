/* Carousel */

/**
 * Initialize hero carousel functionality
 */
export function initCarousel() {
    const items = document.querySelectorAll('.coverflow-item');
    if (items.length === 0) return;

    let currentIndex = 0;
    let isAnimating = false;
    let autoplayInterval = null;

    /**
     * Update carousel positions and styles
     */
    function updateCoverflow() {
        if (isAnimating) return;
        isAnimating = true;

        items.forEach((item, index) => {
            // Calculate position relative to current index
            let position = index - currentIndex;

            // Handle wrapping for infinite loop
            if (position > items.length / 2) {
                position = position - items.length;
            } else if (position < -items.length / 2) {
                position = position + items.length;
            }

            // Smooth horizontal slide effect
            const translateX = position * 100; // 100% of viewport width

            // Smooth fade transition
            let opacity;
            if (position === 0) {
                opacity = 1;
            } else if (Math.abs(position) === 1) {
                opacity = 0.3; // Images entering/exiting
            } else {
                opacity = 0;
            }

            item.style.transform = `translateX(${translateX}%)`;
            item.style.opacity = opacity;
            item.style.zIndex = position === 0 ? 10 : (position < 0 ? 5 : 1);

            item.classList.toggle('active', position === 0);
        });

        setTimeout(() => {
            isAnimating = false;
        }, 1000);
    }

    /**
     * Navigate carousel in given direction
     * @param {number} direction - -1 for previous, 1 for next
     */
    function navigate(direction) {
        if (isAnimating) return;

        currentIndex = currentIndex + direction;

        if (currentIndex < 0) {
            currentIndex = items.length - 1;
        } else if (currentIndex >= items.length) {
            currentIndex = 0;
        }

        updateCoverflow();
    }

    /**
     * Start automatic carousel rotation
     */
    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(() => {
            navigate(1);
        }, 4000);
    }

    /**
     * Stop automatic carousel rotation
     */
    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }

    // Click on items to navigate
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            if (index !== currentIndex && !isAnimating) {
                currentIndex = index;
                updateCoverflow();
                startAutoplay();
            }
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            navigate(-1);
            startAutoplay();
        } else if (e.key === 'ArrowRight') {
            navigate(1);
            startAutoplay();
        }
    });

    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            navigate(1);
            startAutoplay();
        }
        if (touchEndX > touchStartX + 50) {
            navigate(-1);
            startAutoplay();
        }
    }

    // Initialize carousel
    updateCoverflow();
    startAutoplay();
}

