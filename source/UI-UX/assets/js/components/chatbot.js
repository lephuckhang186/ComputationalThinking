/* Chatbot Recommendations */

const recommendations = {
    mountain: [
        {
            name: 'Dalat',
            image: 'https://peacetour.com.vn/Upload/TourInformation/7b48c34c-7453-45d9-8587-52e0acbf8660/du-lich-hoa-binh-Lam-Vien-quang-truong.jpg',
            description: 'Fresh air, thousands of flowers and cool climate all year round.',
            rating: '4.8'
        },
        {
            name: 'Sapa',
            image: 'https://sapatoursfromhanoi.com/wp-content/uploads/2017/01/Sapa-Vietnam-Overview.jpg',
            description: 'Majestic terraced fields, diverse Northwest mountain culture.',
            rating: '4.7'
        }
    ],
    ocean: [
        {
            name: 'Phu Quoc',
            image: 'https://file3.qdnd.vn/data/images/0/2022/08/25/tuanson/4.jpg?dpi=150&quality=100&w=870',
            description: 'Beautiful beaches, crystal clear water, romantic sunset.',
            rating: '4.9'
        }
    ]
};

export function initChatbot() {
    const chatOptions = document.querySelectorAll('.chat-options button[data-choice]');
    const recommendationCards = document.getElementById('recommendationCards');

    if (!recommendationCards) return;

    chatOptions.forEach(button => {
        button.addEventListener('click', (e) => {
            const choice = e.target.getAttribute('data-choice');
            
            // Hide buttons after selection
            chatOptions.forEach(btn => {
                btn.style.display = 'none';
            });

            // Show recommendations
            showRecommendations(choice, recommendationCards);
        });
    });
}

function showRecommendations(choice, container) {
    const items = recommendations[choice];
    if (!items || items.length === 0) return;

    // Clear previous recommendations
    container.innerHTML = '';

    // Create cards container
    const cardsWrapper = document.createElement('div');
    cardsWrapper.className = 'recommendation-cards-wrapper';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" loading="lazy">
            <h4>${item.name}</h4>
            <p>${item.description}</p>
            <p class="rating">⭐ ${item.rating}</p>
            <button class="btn-secondary">View Details</button>
        `;

        cardsWrapper.appendChild(card);
    });

    // Add reset button
    const resetButton = document.createElement('button');
    resetButton.className = 'reset-choice-btn';
    resetButton.textContent = '🔄 Choose again';
    resetButton.addEventListener('click', () => {
        resetChatbot();
    });

    container.appendChild(cardsWrapper);
    container.appendChild(resetButton);
}

function resetChatbot() {
    const chatOptions = document.querySelectorAll('.chat-options button[data-choice]');
    const recommendationCards = document.getElementById('recommendationCards');
    
    // Show buttons again
    chatOptions.forEach(btn => {
        btn.style.display = 'inline-block';
    });
    
    // Clear recommendations
    if (recommendationCards) {
        recommendationCards.innerHTML = '';
    }
}

