/* Floating chat */

/**
 * Initialize floating chat button functionality
 */
export function initFloatingChat() {
    const floatingChat = document.getElementById('floatingChat');
    if (!floatingChat) return;

    floatingChat.addEventListener('click', () => {
        // You can integrate with your chat service here
        alert('💬 Chat feature is under development! Please contact us via email: support@zenjourney.com');
    });
}

