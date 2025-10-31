/* Where to next? Scroll functionality */

export function initWhereToNext() {
    const scrollContainer = document.querySelector('.destinations-scroll');
    const scrollArrowRight = document.querySelector('.scroll-arrow-right');
    const scrollArrowLeft = document.querySelector('.scroll-arrow-left');

    if (!scrollContainer || !scrollArrowRight || !scrollArrowLeft) return;

    // Enable overflow for scrolling
    scrollContainer.style.overflowX = 'auto';

    const scrollAmount = () => {
        const cardWidth = scrollContainer.querySelector('.destination-card').offsetWidth;
        const gap = 24; // 1.5rem = 24px
        // Scroll 6 cards at once
        return (cardWidth + gap) * 6;
    };

    // Function to update arrow visibility
    const updateArrowVisibility = () => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
        const maxScroll = scrollWidth - clientWidth;
        const tolerance = 10;

        // Hide left arrow if at the beginning
        if (scrollLeft <= tolerance) {
            scrollArrowLeft.style.opacity = '0';
            scrollArrowLeft.style.pointerEvents = 'none';
        } else {
            scrollArrowLeft.style.opacity = '1';
            scrollArrowLeft.style.pointerEvents = 'auto';
        }

        // Hide right arrow if at the end
        if (scrollLeft >= maxScroll - tolerance) {
            scrollArrowRight.style.opacity = '0';
            scrollArrowRight.style.pointerEvents = 'none';
        } else {
            scrollArrowRight.style.opacity = '1';
            scrollArrowRight.style.pointerEvents = 'auto';
        }
    };

    // Scroll right
    scrollArrowRight.addEventListener('click', () => {
        const amount = scrollAmount();
        scrollContainer.scrollBy({
            left: amount,
            behavior: 'smooth'
        });
    });

    // Scroll left
    scrollArrowLeft.addEventListener('click', () => {
        const amount = scrollAmount();
        scrollContainer.scrollBy({
            left: -amount,
            behavior: 'smooth'
        });
    });

    // Update arrow visibility on scroll
    scrollContainer.addEventListener('scroll', updateArrowVisibility);

    // Initial check
    updateArrowVisibility();
}

