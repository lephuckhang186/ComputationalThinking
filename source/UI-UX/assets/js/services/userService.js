// User Account Service
// Handles user registration, login, and data persistence

/**
 * Simple password hashing function (SHA-256)
 * In production, use bcrypt or similar
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Verify password against hash
 */
async function verifyPassword(password, hash) {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}

/**
 * Load user accounts from localStorage first, then UserAccount.json as fallback
 */
async function loadUserAccounts() {
    // Priority 1: Check localStorage first (this is where we save new accounts)
    const stored = localStorage.getItem('userAccounts');
    if (stored) {
        try {
            const parsedData = JSON.parse(stored);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                console.log('Loaded accounts from localStorage:', parsedData.length);
                return parsedData;
            }
        } catch (e) {
            console.error('Error parsing stored accounts:', e);
        }
    }

    // Priority 2: Fallback to UserAccount.json file (if localStorage is empty)
    try {
        const response = await fetch('UserAccount.json');
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                // Save to localStorage for future use
                localStorage.setItem('userAccounts', JSON.stringify(data));
                console.log('Loaded accounts from UserAccount.json:', data.length);
                return data;
            }
        }
    } catch (error) {
        console.log('Could not load from UserAccount.json');
    }
    
    // Return empty array if nothing found
    return [];
}

/**
 * Save user accounts to localStorage
 */
async function saveUserAccounts(accounts) {
    // Save to localStorage (primary storage for browser)
    localStorage.setItem('userAccounts', JSON.stringify(accounts));
    console.log('Saved accounts to localStorage:', accounts.length);
    
    // Note: Browser cannot directly write to UserAccount.json file
    // Data is stored in localStorage. To export to file, use exportUserAccounts()
}

/**
 * Export accounts to downloadable JSON file
 */
function exportUserAccounts(accounts) {
    const dataStr = JSON.stringify(accounts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'UserAccount.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Register a new user
 */
export async function registerUser(firstName, lastName, email, password) {
    const accounts = await loadUserAccounts();
    
    // Check if email already exists
    if (accounts.find(acc => acc.email === email)) {
        throw new Error('Email already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user account
    const newUser = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        avatar: null // Can be set later
    };
    
    accounts.push(newUser);
    await saveUserAccounts(accounts);
    
    console.log('User registered successfully:', { email, id: newUser.id });
    
    // Return user without password
    const { password: _, ...userData } = newUser;
    return userData;
}

/**
 * Login user
 */
export async function loginUser(email, password) {
    const accounts = await loadUserAccounts();
    
    console.log('Attempting login for:', email);
    console.log('Available accounts:', accounts.length);
    
    const user = accounts.find(acc => acc.email === email);
    if (!user) {
        console.error('User not found:', email);
        throw new Error('Invalid email or password');
    }
    
    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
        console.error('Password mismatch for:', email);
        throw new Error('Invalid email or password');
    }
    
    console.log('Login successful for:', email);
    
    // Return user data (without password)
    const { password: _, ...userData } = user;
    return userData;
}

/**
 * Get current logged in user from session
 */
export function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

/**
 * Set current logged in user
 */
export function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Logout user
 */
export function logoutUser() {
    sessionStorage.removeItem('currentUser');
}

/**
 * Check if user is logged in
 */
export function isLoggedIn() {
    return getCurrentUser() !== null;
}

