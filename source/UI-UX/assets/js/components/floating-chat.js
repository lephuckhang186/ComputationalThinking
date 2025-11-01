/* Floating chat */

/**
 * Initialize floating chat button functionality
 */
export function initFloatingChat() {
    const floatingChat = document.getElementById('floatingChat');
    const chatbotPopup = document.getElementById('chatbotPopup');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotPopupBody = document.getElementById('chatbotPopupBody');
    const backToTopBtn = document.getElementById('backToTop');

    if (!floatingChat || !chatbotPopup) return;

    // Function to open popup
    const openPopup = () => {
        chatbotPopup.classList.add('active');
        floatingChat.classList.add('hidden');
        if (backToTopBtn) {
            backToTopBtn.classList.add('chat-open');
        }
        chatbotInput.focus();
    };

    // Function to close popup
    const closePopup = () => {
        // Add closing animation
        chatbotPopup.classList.add('closing');
        chatbotPopup.classList.remove('active');
        
        // Wait for closing animation to complete before hiding
        setTimeout(() => {
            chatbotPopup.classList.remove('closing');
            
            // Show chatbot icon with animation
            floatingChat.classList.remove('hidden');
            floatingChat.classList.add('showing');
            
            // Remove showing class after animation completes
            setTimeout(() => {
                floatingChat.classList.remove('showing');
            }, 400);
            
            if (backToTopBtn) {
                backToTopBtn.classList.remove('chat-open');
            }
        }, 250); // Match the closing animation duration
    };

    // Open popup
    floatingChat.addEventListener('click', openPopup);

    // Close popup
    chatbotClose.addEventListener('click', closePopup);

    // Close on outside click
    chatbotPopup.addEventListener('click', (e) => {
        if (e.target === chatbotPopup) {
            closePopup();
        }
    });

    // Send message
    const sendMessage = () => {
        const message = chatbotInput.value.trim();
        if (!message) return;

        // Add user message
        const userWrapper = document.createElement('div');
        userWrapper.className = 'user-msg-wrapper';
        userWrapper.innerHTML = `
            <div class="user-msg">${message}</div>
            <img src="https://i.pravatar.cc/40" alt="User" class="user-avatar">
        `;
        chatbotPopupBody.appendChild(userWrapper);

        // Clear input
        chatbotInput.value = '';

        // Scroll to bottom
        chatbotPopupBody.scrollTop = chatbotPopupBody.scrollHeight;

        // Simulate bot response
        setTimeout(() => {
            const botWrapper = document.createElement('div');
            botWrapper.className = 'bot-msg-wrapper';
            botWrapper.innerHTML = `
                <img src="assets/img/Screenshot 2025-10-28 224509.png" alt="Zenjourney AI" class="bot-avatar">
                <div class="bot-msg">Cảm ơn bạn đã nhắn tin! Tôi sẽ giúp bạn tìm chuyến đi phù hợp nhất. 🌿</div>
            `;
            chatbotPopupBody.appendChild(botWrapper);
            chatbotPopupBody.scrollTop = chatbotPopupBody.scrollHeight;
        }, 500);
    };

    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

