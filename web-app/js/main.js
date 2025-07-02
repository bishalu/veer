/* Main JavaScript for Golo Web App */

// Global app state
const GoloApp = {
    currentStep: 1,
    currentTab: 'goals',
    userProfile: {},
    audioRecorder: null,
    audioBlob: null,
    isRecording: false,
    forceMobileMode: false
};

// Check for mobile mode override
function checkMobileOverride() {
    const urlParams = new URLSearchParams(window.location.search);
    const mobileParam = urlParams.get('mobile');
    const desktopParam = urlParams.get('desktop');
    
    if (mobileParam === 'true' || mobileParam === '1') {
        GoloApp.forceMobileMode = true;
        document.body.classList.add('force-mobile');
    } else if (desktopParam === 'true' || desktopParam === '1') {
        GoloApp.forceMobileMode = false;
        document.body.classList.add('force-desktop');
    }
    
    // Check for hash-based override (for easier testing)
    if (window.location.hash === '#mobile') {
        GoloApp.forceMobileMode = true;
        document.body.classList.add('force-mobile');
    } else if (window.location.hash === '#desktop') {
        GoloApp.forceMobileMode = false;
        document.body.classList.add('force-desktop');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    checkMobileOverride(); // Check for mobile mode override first
    setupTabNavigation();
    setupEventListeners();
    loadUserData();
    addModeToggle(); // Add toggle for easy testing
    console.log('Golo app initialized', GoloApp.forceMobileMode ? '(Mobile Mode)' : '(Desktop Mode)');
}

// Add mode toggle for testing
function addModeToggle() {
    const toggle = document.createElement('div');
    toggle.className = 'mode-toggle';
    toggle.innerHTML = `
        <button onclick="toggleMobileMode()" class="mode-toggle-btn">
            ${GoloApp.forceMobileMode ? '🖥️ Switch to Desktop' : '📱 Switch to Mobile'}
        </button>
    `;
    document.body.appendChild(toggle);
}

function toggleMobileMode() {
    GoloApp.forceMobileMode = !GoloApp.forceMobileMode;
    
    // Update body classes
    document.body.classList.toggle('force-mobile', GoloApp.forceMobileMode);
    document.body.classList.toggle('force-desktop', !GoloApp.forceMobileMode);
    
    // Update toggle button
    const btn = document.querySelector('.mode-toggle-btn');
    btn.textContent = GoloApp.forceMobileMode ? '🖥️ Switch to Desktop' : '📱 Switch to Mobile';
    
    console.log('Mode switched to:', GoloApp.forceMobileMode ? 'Mobile' : 'Desktop');
    
    // Show notification
    showNotification(`Switched to ${GoloApp.forceMobileMode ? 'Mobile' : 'Desktop'} mode`, 'info');
}

// Tab Navigation
function setupTabNavigation() {
    // Desktop navigation
    const desktopNavItems = document.querySelectorAll('.nav-tab');
    // Mobile navigation  
    const mobileNavItems = document.querySelectorAll('.nav-item');
    
    // Handle desktop nav clicks
    desktopNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Handle mobile nav clicks
    mobileNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Detect if mobile (including forced mobile mode) and add haptic feedback
    const isMobile = GoloApp.forceMobileMode || window.innerWidth <= 767;
    if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate(50); // Subtle vibration on tab switch
    }

    // Update both desktop and mobile navigation states
    document.querySelectorAll('.nav-item, .nav-tab').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find and activate the correct tab in both navigation types
    const activeDesktopTab = document.querySelector(`.nav-tab[data-tab="${tabName}"]`);
    const activeMobileTab = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
    
    if (activeDesktopTab) {
        activeDesktopTab.classList.add('active');
    }
    
    if (activeMobileTab) {
        activeMobileTab.classList.add('active');
        
        // Add mobile-specific animation
        if (isMobile) {
            activeMobileTab.style.transform = 'scale(0.9)';
            setTimeout(() => {
                activeMobileTab.style.transform = '';
            }, 150);
        }
    }

    // Update content visibility with fade transition
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.opacity = '0';
        setTimeout(() => {
            content.classList.remove('active');
        }, 150);
    });
    
    setTimeout(() => {
        const newContent = document.getElementById(`${tabName}-tab`);
        if (newContent) {
            newContent.classList.add('active');
            newContent.style.opacity = '1';
        }
    }, 150);

    // Update app state
    GoloApp.currentTab = tabName;

    // Tab-specific initialization
    setTimeout(() => {
        if (tabName === 'chat') {
            initializeChat();
        } else if (tabName === 'goals') {
            initializeGoals();
        }
    }, 200);
}

// Setup global event listeners
function setupEventListeners() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + 1,2,3 for tab switching
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '3') {
            e.preventDefault();
            const tabMap = {'1': 'profile', '2': 'chat', '3': 'goals'};
            switchTab(tabMap[e.key]);
        }
    });

    // Handle logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Load user data from localStorage
function loadUserData() {
    const savedProfile = localStorage.getItem('goloUserProfile');
    if (savedProfile) {
        try {
            GoloApp.userProfile = JSON.parse(savedProfile);
            updateUserDisplay();
        } catch (e) {
            console.error('Error loading user profile:', e);
        }
    }
}

// Save user data to localStorage
function saveUserData() {
    try {
        localStorage.setItem('goloUserProfile', JSON.stringify(GoloApp.userProfile));
    } catch (e) {
        console.error('Error saving user profile:', e);
    }
}

// Update user display in header
function updateUserDisplay() {
    const userNameElement = document.querySelector('.user-name');
    if (GoloApp.userProfile.name) {
        userNameElement.textContent = GoloApp.userProfile.name;
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('goloUserProfile');
        GoloApp.userProfile = {};
        location.reload();
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;

    // Add to document
    document.body.appendChild(notification);

    // Handle close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('An error occurred. Please try again.', 'error');
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }

    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }

    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);