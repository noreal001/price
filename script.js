/* script.js */

// --- 1. Theme Management ---
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.body.className = themeName; // Replaces current class
    startParticles(themeName);
    updateThemeButtons(themeName);
}

function updateThemeButtons(themeName) {
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
        // Simple logic for UI active state in switcher
        if (btn.onclick && btn.onclick.toString().includes(themeName)) {
            btn.classList.add('active');
        } else if (btn.dataset && btn.dataset.theme === themeName.replace('theme-', '')) {
            btn.classList.add('active'); // For index.html buttons
        } else if (themeName === 'base' && (btn.dataset.theme === 'minimal' || (btn.onclick && btn.onclick.toString().includes('base')))) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'base';
    // Safety check if user had ocean selected
    if (savedTheme === 'theme-ocean') {
        setTheme('base');
    } else {
        setTheme(savedTheme);
    }
}

// --- 2. Particles (Winter) ---
let particleInterval;

function startParticles(theme) {
    const container = document.getElementById('particles');
    if (!container) return;

    container.innerHTML = '';
    clearInterval(particleInterval);

    if (theme === 'theme-winter') {
        particleInterval = setInterval(() => createSnowflake(container), 200);
    }
}

function createSnowflake(container) {
    const flake = document.createElement('div');
    flake.classList.add('snowflake');
    flake.style.left = Math.random() * 100 + 'vw';
    flake.style.opacity = Math.random();
    flake.style.fontSize = (Math.random() * 10 + 10) + 'px';
    flake.style.animationDuration = (Math.random() * 3 + 2) + 's';
    const icon = document.createElement('i');
    icon.classList.add('fa-regular', 'fa-snowflake');
    flake.appendChild(icon);

    container.appendChild(flake);
    setTimeout(() => flake.remove(), 5000);
}


// --- 3. Login Logic (Mock Auth) ---

// Check session on page load
function checkSession() {
    const protectedRoutes = ['dashboard.html'];

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // If on dashboard but not logged in -> Go to Login
    if (protectedRoutes.includes(currentPage) && !isLoggedIn) {
        window.location.href = 'index.html';
    }

    // If on login but already logged in -> Go to Dashboard
    if ((currentPage === 'index.html' || currentPage === '') && isLoggedIn) {
        window.location.href = 'dashboard.html';
    }
}

function loginUser(method) {
    console.log(`Logging in via ${method}...`);

    if (method === 'phone') {
        const btn = document.querySelector('.btn-primary');
        if (btn) {
            btn.innerText = 'Вход...';
            btn.disabled = true;
        }
    }

    setTimeout(() => {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loginMethod', method);
        window.location.href = 'dashboard.html';
    }, 1000);
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}


// --- 4. Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    checkSession();

    // Phone Input Logic (Only on Index)
    const phoneInput = document.getElementById('phone');
    const submitBtn = document.getElementById('submitBtn');

    if (phoneInput && submitBtn) {
        phoneInput.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
            if (!x[2]) {
                e.target.value = x[1] ? '+7 ' : '';
            } else {
                e.target.value = !x[3] ? `+7 (${x[2]}` : `+7 (${x[2]}) ${x[3]}` + (x[4] ? `-${x[4]}` : '') + (x[5] ? `-${x[5]}` : '');
            }

            if (e.target.value.length >= 18) {
                submitBtn.disabled = false;
            } else {
                submitBtn.disabled = true;
            }
        });

        submitBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent form submit
            loginUser('phone');
        });
    }

    // Social Login Buttons (Only on Index)
    const socialBtns = document.querySelectorAll('.social-btn');
    if (socialBtns) {
        socialBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                let method = 'social';
                if (this.innerHTML.includes('google')) method = 'google';
                if (this.innerHTML.includes('apple')) method = 'apple';
                if (this.innerHTML.includes('telegram')) method = 'telegram';

                loginUser(method);
            });
        });
    }

    // Theme Switcher Buttons (Index)
    const themeBtns = document.querySelectorAll('.theme-switcher .theme-btn');
    if (themeBtns) {
        themeBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                const theme = this.dataset.theme;
                if (theme === 'minimal') setTheme('base');
                else if (theme === 'winter') setTheme('theme-winter');
                else if (theme === 'cyberpunk') setTheme('theme-cyberpunk');
            });
        });
    }

    // Logout Button (Only on Dashboard)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
