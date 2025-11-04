// Auth Modal Handler
import { registerUser, loginUser, setCurrentUser, getCurrentUser } from '../services/userService.js';
import { updateHeaderForAuth } from './user-menu.js';

export function initAuthModal() {
    const authModal = document.getElementById('authModal');
    const authModalOverlay = document.getElementById('authModalOverlay');
    const authModalClose = document.getElementById('authModalClose');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    const loginBtn = document.querySelector('.btn-login');
    const signupBtn = document.querySelector('.btn-signup');
    const switchFormBtns = document.querySelectorAll('.switch-form');
    
    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    // Password strength checker
    const signupPassword = document.getElementById('signupPassword');
    const passwordStrengthFill = document.getElementById('passwordStrengthFill');
    const passwordStrengthText = document.getElementById('passwordStrengthText');
    
    // Terms checkbox and submit button
    const agreeTerms = document.getElementById('agreeTerms');
    const signupSubmitBtn = document.getElementById('signupSubmitBtn');

    // Open modal with login form
    function openLoginModal() {
        authModal.classList.add('active');
        document.body.classList.add('modal-open');
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    }

    // Open modal with signup form
    function openSignupModal() {
        authModal.classList.add('active');
        document.body.classList.add('modal-open');
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }

    // Close modal
    function closeModal() {
        authModal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }

    // Event listeners for opening modal
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openLoginModal();
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openSignupModal();
        });
    }

    // Event listeners for closing modal
    if (authModalClose) {
        authModalClose.addEventListener('click', closeModal);
    }

    if (authModalOverlay) {
        authModalOverlay.addEventListener('click', closeModal);
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && authModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Switch between forms
    switchFormBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const formType = btn.getAttribute('data-form');
            
            if (formType === 'login') {
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
            } else if (formType === 'signup') {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
            }
        });
    });

    // Password toggle functionality
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            
            if (targetInput) {
                if (targetInput.type === 'password') {
                    targetInput.type = 'text';
                    toggle.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    `;
                } else {
                    targetInput.type = 'password';
                    toggle.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    `;
                }
            }
        });
    });

    // Password strength checker
    if (signupPassword) {
        signupPassword.addEventListener('input', () => {
            const password = signupPassword.value;
            const strength = checkPasswordStrength(password);
            
            // Reset classes
            passwordStrengthFill.classList.remove('weak', 'medium', 'strong');
            passwordStrengthText.classList.remove('weak', 'medium', 'strong');
            
            if (password.length === 0) {
                passwordStrengthFill.style.width = '0%';
                passwordStrengthText.textContent = 'Password strength';
            } else if (strength === 'weak') {
                passwordStrengthFill.classList.add('weak');
                passwordStrengthText.classList.add('weak');
                passwordStrengthText.textContent = 'Weak password';
            } else if (strength === 'medium') {
                passwordStrengthFill.classList.add('medium');
                passwordStrengthText.classList.add('medium');
                passwordStrengthText.textContent = 'Medium password';
            } else if (strength === 'strong') {
                passwordStrengthFill.classList.add('strong');
                passwordStrengthText.classList.add('strong');
                passwordStrengthText.textContent = 'Strong password';
            }
        });
    }

    // Check password strength
    function checkPasswordStrength(password) {
        let strength = 0;
        
        // Check length
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // Check for lowercase and uppercase
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        
        // Check for numbers
        if (/\d/.test(password)) strength++;
        
        // Check for special characters
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    }

    // Terms checkbox handler - enable/disable submit button
    if (agreeTerms && signupSubmitBtn) {
        // Function to update button state
        function updateSubmitButtonState() {
            if (agreeTerms.checked) {
                signupSubmitBtn.disabled = false;
            } else {
                signupSubmitBtn.disabled = true;
            }
        }

        // Initial state - button should be disabled
        updateSubmitButtonState();

        // Listen for checkbox changes
        agreeTerms.addEventListener('change', updateSubmitButtonState);
    }

    // Form submission handlers (prevent default for demo)
    const loginFormElement = loginForm?.querySelector('form');
    const signupFormElement = signupForm?.querySelector('form');

    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                const user = await loginUser(email, password);
                setCurrentUser(user);
                
                // Close modal
                closeModal();
                
                // Clear form
                loginFormElement.reset();
                
                // Update header UI
                updateHeaderForAuth();
                
                alert('Login successful! Welcome back!');
            } catch (error) {
                alert(error.message || 'Login failed. Please check your credentials.');
            }
        });
    }

    if (signupFormElement) {
        signupFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const firstName = document.getElementById('signupFirstName').value;
            const lastName = document.getElementById('signupLastName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // Validation
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (!agreeTerms) {
                alert('Please agree to the Terms of Service and Privacy Policy!');
                return;
            }
            
            try {
                const user = await registerUser(firstName, lastName, email, password);
                setCurrentUser(user);
                
                // Close modal
                closeModal();
                
                // Clear form
                signupFormElement.reset();
                
                // Reset password strength indicator
                if (passwordStrengthFill) {
                    passwordStrengthFill.style.width = '0%';
                    passwordStrengthText.textContent = 'Password strength';
                }
                
                // Update header UI
                updateHeaderForAuth();
                
                alert('Account created successfully! Welcome to Zenjourney!');
            } catch (error) {
                alert(error.message || 'Registration failed. Please try again.');
            }
        });
    }
}

