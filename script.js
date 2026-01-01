/* script.js */

// --- 1. BAHUR Dynamic Branding ---
const abstractIcons = [
    'fa-cube', 'fa-cubes', 'fa-shapes', 'fa-vector-square', 'fa-bezier-curve',
    'fa-infinity', 'fa-layer-group', 'fa-microchip', 'fa-atom', 'fa-dna',
    'fa-network-wired', 'fa-project-diagram', 'fa-chart-network', 'fa-draw-polygon',
    'fa-gem', 'fa-lightbulb', 'fa-meteor', 'fa-icicles', 'fa-fire-flame-curved',
    'fa-dragon', 'fa-ghost', 'fa-robot', 'fa-rocket', 'fa-satellite',
    'fa-satellite-dish', 'fa-sim-card', 'fa-solar-panel', 'fa-snowflake', 'fa-star-of-life',
    'fa-stroopwafel', 'fa-synagogue', 'fa-torii-gate', 'fa-vihara', 'fa-wind',
    'fa-yin-yang', 'fa-ankh', 'fa-archway', 'fa-asterisk', 'fa-bahai',
    'fa-ban', 'fa-bolt', 'fa-bomb', 'fa-book-quran', 'fa-brain',
    'fa-campground', 'fa-cannabis', 'fa-car-battery', 'fa-chess-knight', 'fa-cloud-moon',
    'fa-code', 'fa-code-branch', 'fa-compass-drafting', 'fa-computer-mouse', 'fa-dice-d20'
];

function initDynamicLogo() {
    const logoEl = document.getElementById('dynamicLogo') || document.getElementById('dynamicLogoSidebar');
    if (!logoEl) return;

    let index = 0;
    setInterval(() => {
        // Fade out
        logoEl.classList.add('fade-out');

        setTimeout(() => {
            // Change icon
            index = (index + 1) % abstractIcons.length;
            logoEl.className = `fa-solid ${abstractIcons[index]} dynamic-logo-icon brand-icon`;
            // Fade in
            logoEl.classList.remove('fade-out');
        }, 500); // Wait for fade out
    }, 5000); // Every 5 seconds
}


// --- 2. Product Logic (Smart Table) ---
const productsDB = [
    { id: 1, name: "Royal Oud", basePrice: 500 },
    { id: 2, name: "Musk Tahara", basePrice: 300 },
    { id: 3, name: "Black Afghan", basePrice: 600 },
    { id: 4, name: "Amber Wood", basePrice: 450 },
    { id: 5, name: "Molecule 02", basePrice: 400 },
    { id: 6, name: "Baccarat Rouge", basePrice: 700 },
    { id: 7, name: "Zam Zam", basePrice: 250 },
    { id: 8, name: "Sandalwood", basePrice: 350 },
];

const brands = ["Gulf Premium", "Swiss Arabian", "French Essence", "Local Blend"];
const qualities = ["Top (Pure)", "Premium", "Standard"];
const volumes = [
    { label: "3ml", multiplier: 1 },
    { label: "6ml", multiplier: 1.8 },
    { label: "12ml", multiplier: 3.2 },
    { label: "50ml", multiplier: 10 },
    { label: "100ml", multiplier: 18 }
];

function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    productsDB.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="product-name-cell">${product.name}</td>
            <td>
                <select class="custom-select" onchange="updatePrice(${product.id}, this)">
                    ${brands.map(b => `<option>${b}</option>`).join('')}
                </select>
            </td>
            <td>
                <select class="custom-select quality-select" onchange="updatePrice(${product.id}, this)">
                    ${qualities.map((q, i) => `<option value="${1 + (2 - i) * 0.2}">${q}</option>`).join('')}
                </select>
            </td>
            <td>
                <select class="custom-select volume-select" onchange="updatePrice(${product.id}, this)">
                    ${volumes.map(v => `<option value="${v.multiplier}">${v.label}</option>`).join('')}
                </select>
            </td>
            <td>
                <span class="price-tag" id="price-${product.id}">₽ ${product.basePrice}</span>
            </td>
            <td>
                <button class="btn-primary btn-small" onclick="addToCart('${product.name}')">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </td>
        `;
        // Initial price calcs hidden in attributes or defaults
        tbody.appendChild(tr);
        // Trigger initial calculation
        setTimeout(() => updatePrice(product.id, tr.querySelector('.volume-select')), 0);
    });
}

window.updatePrice = function (id, changedElement) {
    const row = changedElement.closest('tr');
    const qualityMult = parseFloat(row.querySelector('.quality-select').value);
    const volumeMult = parseFloat(row.querySelector('.volume-select').value);

    const product = productsDB.find(p => p.id === id);
    const finalPrice = Math.round(product.basePrice * qualityMult * volumeMult);

    row.querySelector('.price-tag').innerText = `₽ ${finalPrice}`;
};

window.addToCart = function (name) {
    alert(`Товар "${name}" добавлен в корзину!`);
};

window.switchView = function (viewName) {
    // Update menu
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    // Find the button that called this (rough match)
    const btns = document.querySelectorAll('.nav-item');
    btns.forEach(btn => {
        if (btn.onclick && btn.onclick.toString().includes(viewName)) btn.classList.add('active');
    });

    // Update Title
    const title = document.getElementById('pageTitle');

    // Hide all views
    document.getElementById('view-stats').style.display = 'none';
    document.getElementById('view-products').style.display = 'none';

    // Show selected
    if (viewName === 'stats') {
        document.getElementById('view-stats').style.display = 'grid'; // Grid for stats
        if (title) title.innerText = 'Главная';
    } else if (viewName === 'products') {
        document.getElementById('view-products').style.display = 'block';
        if (title) title.innerText = 'Каталог Товаров';
        renderProducts(); // Re-render to ensure fresh state
    }
}


// --- 3. Existing Theme & Login Logic ---

function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.body.className = themeName;
    startParticles(themeName);
    updateThemeButtons(themeName);
}

function updateThemeButtons(themeName) {
    const buttons = document.querySelectorAll('.theme-btn');
    buttons.forEach(btn => {
        if ((btn.onclick && btn.onclick.toString().includes(themeName)) ||
            (btn.dataset && btn.dataset.theme === themeName.replace('theme-', ''))) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'base';
    setTheme(savedTheme);
}

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

// Session
function checkSession() {
    const protectedRoutes = ['dashboard.html'];
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (protectedRoutes.includes(currentPage) && !isLoggedIn) window.location.href = 'index.html';
    if ((currentPage === 'index.html' || currentPage === '') && isLoggedIn) window.location.href = 'dashboard.html';
}

function loginUser(method) {
    console.log(`Logging in via ${method}...`);
    if (method === 'phone') {
        const btn = document.querySelector('.btn-primary');
        if (btn) { btn.innerText = 'Вход...'; btn.disabled = true; }
    }
    setTimeout(() => {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'dashboard.html';
    }, 1000);
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'index.html';
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    checkSession();
    initDynamicLogo(); // Start logo animation

    // Phone Input
    const phoneInput = document.getElementById('phone');
    const submitBtn = document.getElementById('submitBtn');
    if (phoneInput && submitBtn) {
        phoneInput.addEventListener('input', (e) => {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
            if (!x[2]) e.target.value = x[1] ? '+7 ' : '';
            else e.target.value = !x[3] ? `+7 (${x[2]}` : `+7 (${x[2]}) ${x[3]}` + (x[4] ? `-${x[4]}` : '') + (x[5] ? `-${x[5]}` : '');
            submitBtn.disabled = e.target.value.length < 18;
        });
        submitBtn.addEventListener('click', (e) => { e.preventDefault(); loginUser('phone'); });
    }

    // Buttons
    const socialBtns = document.querySelectorAll('.social-btn');
    if (socialBtns) socialBtns.forEach(btn => btn.addEventListener('click', () => loginUser('social')));

    const themeBtns = document.querySelectorAll('.theme-switcher .theme-btn');
    if (themeBtns) themeBtns.forEach(btn => btn.addEventListener('click', function () {
        const theme = this.dataset.theme;
        if (theme) setTheme(theme === 'minimal' ? 'base' : `theme-${theme}`);
    }));

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Initial Render if on dashboard
    if (document.getElementById('productsTableBody')) {
        renderProducts();
    }
});
