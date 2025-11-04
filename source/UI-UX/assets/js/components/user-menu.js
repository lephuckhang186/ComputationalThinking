// User Menu Component
// Handles user menu dropdown and authentication state

import { getCurrentUser, logoutUser, isLoggedIn } from '../services/userService.js';

const AVATAR_DEFAULT = 'assets/img/avatar.png';


/**
 * Update header based on authentication state
 */
export function updateHeaderForAuth() {
    const user = getCurrentUser();
    const loginBtn = document.querySelector('.btn-login');
    const signupBtn = document.querySelector('.btn-signup');
    const avatar = document.querySelector('.avatar');
    const userMenu = document.getElementById('userMenu');
    
    if (user) {
        // Hide login/signup buttons
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        
        // Show avatar with user image or generated from email
        if (avatar) {
            // Use user's avatar if available, otherwise generate from email
            avatar.src = user.avatar || `https://i.pravatar.cc/40?seed=${user.email}`;
            avatar.style.display = 'block';
            avatar.style.cursor = 'pointer';
        }
        
        // Show user menu
        if (userMenu) {
            userMenu.style.display = 'block';
        }
    } else {
        // Show login/signup buttons
        if (loginBtn) loginBtn.style.display = 'block';
        if (signupBtn) signupBtn.style.display = 'block';
        
        // Show default avatar
        if (avatar) {
            // Set default avatar, with fallback if image fails to load
            avatar.src = AVATAR_DEFAULT;
            avatar.onerror = function() {
                // If avatar.png doesn't exist, use a placeholder SVG
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTIwIDE0QzE3LjIzIDE0IDE1IDE2LjIzIDE1IDE5QzE1IDIxLjc3IDE3LjIzIDI0IDIwIDI0QzIyLjc3IDI0IDI1IDIxLjc3IDI1IDE5QzI1IDE2LjIzIDIyLjc3IDE0IDIwIDE0Wk0yMCAyNkMxNy42NyAyNiAxMiAyNy4zMyAxMiAzMEgxMkMyOCAyNyAzMy42NyAyNiAyMCAyNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
            };
            avatar.style.display = 'block';
            avatar.style.cursor = 'default';
        }
        
        // Hide user menu
        if (userMenu) {
            userMenu.style.display = 'none';
        }
    }
}

/**
 * Initialize user menu
 */
export function initUserMenu() {
    const avatar = document.querySelector('.avatar');
    const userMenu = document.getElementById('userMenu');
    const userMenuClose = document.getElementById('userMenuClose');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Click on avatar to toggle menu (only if logged in)
    if (avatar) {
        avatar.addEventListener('click', (e) => {
            e.stopPropagation();
            const user = getCurrentUser();
            if (user && isLoggedIn()) {
                if (userMenu) {
                    userMenu.classList.toggle('active');
                }
            }
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (userMenu && avatar && !userMenu.contains(e.target) && !avatar.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });
    
    // Close button
    if (userMenuClose) {
        userMenuClose.addEventListener('click', () => {
            if (userMenu) {
                userMenu.classList.remove('active');
            }
        });
    }
    
    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
            updateHeaderForAuth();
            
            // Close menu
            if (userMenu) {
                userMenu.classList.remove('active');
            }
            
            alert('You have been logged out successfully!');
        });
    }
    
    // Update UI on page load
    updateHeaderForAuth();
}

