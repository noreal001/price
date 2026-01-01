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
        logoEl.classList.add('fade-out');
        setTimeout(() => {
            index = (index + 1) % abstractIcons.length;
            logoEl.className = `fa-solid ${abstractIcons[index]} dynamic-logo-icon brand-icon`;
            logoEl.classList.remove('fade-out');
        }, 500);
    }, 5000);
}


// --- 2. Product Logic & Categories ---
let currentCategory = 'oils';
let currentBrandFilter = 'All';

const qualities = ["Top (Pure)", "Premium", "Standard"];

// Category Switcher
window.switchCategory = function (cat, btn) {
    currentCategory = cat;
    currentBrandFilter = 'All'; // Reset filter when switching

    // UI Update
    document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
    // If inside wrapper, find btn ref might be tricky? No, btn passes 'this'
    // If button is wrapped, ensure we target it correctly.
    if (btn) btn.classList.add('active');

    renderProducts();
};

window.toggleBrandDropdown = function (btn, event) {
    // Only for oils, or if we want generic? The request was specifically for "Oils arrow".
    // switch category to oils first if not already
    if (currentCategory !== 'oils') switchCategory('oils', btn);

    const dropdown = document.getElementById('oilsDropdown');
    dropdown.classList.toggle('show');
    event.stopPropagation();
};

window.filterByBrand = function (brand) {
    currentBrandFilter = brand;
    renderProducts();
    // Close dropdown
    const dropdown = document.getElementById('oilsDropdown');
    dropdown.classList.remove('show');
};

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('oilsDropdown');
    if (dropdown && dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
    }
});

function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Select Data from data.js
    let data = [];
    if (currentCategory === 'oils') {
        data = catalogOils;
        if (currentBrandFilter !== 'All') {
            data = data.filter(p => p.brand === currentBrandFilter);
        }
    }
    else if (currentCategory === 'bottles') data = catalogBottles;
    else if (currentCategory === 'perfume') data = catalogPerfume;

    data.forEach(product => {
        const tr = document.createElement('tr');

        // Define controls
        let brandHtml = `<span style="color:var(--text-color);">${product.brand || '-'}</span>`;
        let qualHtml = `<select class="custom-select quality-select" onchange="updatePrice(${product.id}, this)">
                            ${qualities.map((q, i) => `<option value="${1 + (2 - i) * 0.2}">${q}</option>`).join('')}
                        </select>`;

        let min = 30, max = 5000, step = 5, val = 30;

        if (currentCategory === 'bottles') {
            min = 10; max = 1000; step = 10; val = 50;
            min = 10; // Override
            brandHtml = `<span style="font-size:0.9rem; color:#999;">-</span>`;
            qualHtml = `<span style="font-size:0.9rem; color:#999;">Standard</span><input type="hidden" class="quality-select" value="1">`;
        }

        tr.innerHTML = `
            <td class="product-name-cell">${product.name}</td>
            <td>${brandHtml}</td>
            <td>${qualHtml}</td>
            <td style="width: 200px;">
                <div class="volume-control">
                    <input type="range" class="volume-slider" min="${min}" max="${max}" step="${step}" value="${val}" 
                           oninput="handleVolumeInput(this, ${product.id})">
                    <span class="volume-label" id="vol-label-${product.id}">${val}</span>
                </div>
            </td>
            <td>
                <span class="price-tag" id="price-${product.id}">...</span>
            </td>
            <td>
                <button class="btn-primary btn-small" onclick="addToCart('${product.name}')">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
        // Init logic
        handleVolumeInput(tr.querySelector('.volume-slider'), product.id);
    });
}

// Logic: Smart Slider & Price
window.handleVolumeInput = function (slider, id) {
    let val = parseInt(slider.value);

    // Snapping Logic
    if (currentCategory !== 'bottles') {
        if (val > 500) val = Math.round(val / 500) * 500;
        if (val === 0) val = 30; // Min bound safety
    } else {
        if (val > 100) val = Math.round(val / 50) * 50;
    }

    // Label Logic
    const label = document.getElementById(`vol-label-${id}`);
    if (currentCategory === 'bottles') {
        label.innerText = val + ' pcs';
    } else {
        if (val >= 1000) label.innerText = (val / 1000).toFixed(1) + ' kg';
        else label.innerText = val + ' g';
    }

    updatePrice(id, slider, val);
};

window.updatePrice = function (id, sourceElement, overrideVol) {
    const row = sourceElement.closest('tr');
    const qualityEl = row.querySelector('.quality-select');
    const qualityMult = qualityEl ? parseFloat(qualityEl.value) : 1;

    let vol = overrideVol;
    if (vol === undefined) {
        const slider = row.querySelector('.volume-slider');
        vol = parseInt(slider.value);
        // Apply snap logic for recalc consistency
        if (currentCategory !== 'bottles' && vol > 500) vol = Math.round(vol / 500) * 500;
    }

    // Find Product in correct catalog
    let product;
    if (currentCategory === 'oils') product = catalogOils.find(p => p.id === id);
    else if (currentCategory === 'bottles') product = catalogBottles.find(p => p.id === id);
    else if (currentCategory === 'perfume') product = catalogPerfume.find(p => p.id === id); // Fix: use perfume catalog

    if (!product) return;

    // Price Formula
    let finalPrice = 0;
    if (currentCategory === 'bottles') {
        finalPrice = product.basePrice * vol;
    } else {
        finalPrice = Math.round(product.basePrice * (vol / 10) * qualityMult);
    }

    row.querySelector('.price-tag').innerText = `₽ ${finalPrice.toLocaleString()}`;
};

function populateDropdown() {
    const dropdown = document.getElementById('oilsDropdown');
    if (!dropdown) return;

    // Keep 'All' option
    dropdown.innerHTML = `<div class="dropdown-item" onclick="filterByBrand('All')">Все бренды</div>`;

    BRANDS_LIST.forEach(brand => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.innerText = brand;
        item.onclick = () => filterByBrand(brand);
        dropdown.appendChild(item);
    });
}

window.addToCart = function (name) { alert(`Товар "${name}" добавлен в корзину!`); };
window.switchView = function (viewName) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(btn => {
        if (btn.onclick && btn.onclick.toString().includes(viewName)) btn.classList.add('active');
    });

    const title = document.getElementById('pageTitle');
    document.getElementById('view-stats').style.display = 'none';
    document.getElementById('view-products').style.display = 'none';

    if (viewName === 'stats') {
        document.getElementById('view-stats').style.display = 'grid';
        if (title) title.innerText = 'Главная';
    } else if (viewName === 'products') {
        document.getElementById('view-products').style.display = 'block';
        if (title) title.innerText = 'Каталог';
        renderProducts();
    }
}


// --- 3. Theme Logic ---
const THEMES = [
    { id: 'base', icon: 'fa-sun', label: 'Minimal' },
    { id: 'theme-winter', icon: 'fa-snowflake', label: 'Winter' },
    { id: 'theme-cyberpunk', icon: 'fa-bolt', label: 'Cyberpunk' },
    { id: 'theme-blue', icon: 'fa-droplet', label: 'Blue' },
    { id: 'theme-purple', icon: 'fa-hat-wizard', label: 'Purple' },
    { id: 'theme-yellow', icon: 'fa-lightbulb', label: 'Yellow' },
    { id: 'theme-red', icon: 'fa-fire', label: 'Red' },
    { id: 'theme-orange', icon: 'fa-carrot', label: 'Orange' },
    { id: 'theme-lilac', icon: 'fa-heart', label: 'Lilac' },
    { id: 'theme-green', icon: 'fa-leaf', label: 'Green' }
];

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'base';
    const currentIndex = THEMES.findIndex(t => t.id === currentTheme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    const nextTheme = THEMES[nextIndex].id;
    setTheme(nextTheme);
}

function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.body.className = themeName;
    startParticles(themeName);
    updateThemeIcon(themeName);
}

function updateThemeIcon(themeName) {
    const btns = document.querySelectorAll('.theme-toggle-btn');
    const themeObj = THEMES.find(t => t.id === themeName) || THEMES[0];
    btns.forEach(btn => btn.innerHTML = `<i class="fa-solid ${themeObj.icon}"></i>`);
}

function loadTheme() { const savedTheme = localStorage.getItem('theme') || 'base'; setTheme(savedTheme); }
let particleInterval;
function startParticles(theme) {
    const container = document.getElementById('particles');
    if (!container) return;
    container.innerHTML = '';
    clearInterval(particleInterval);
    if (theme === 'theme-winter') particleInterval = setInterval(() => createSnowflake(container), 200);
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


// --- 4. Init ---
function checkSession() {
    const protectedRoutes = ['dashboard.html'];
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (protectedRoutes.includes(currentPage) && !isLoggedIn) window.location.href = 'index.html';
    if ((currentPage === 'index.html' || currentPage === '') && isLoggedIn) window.location.href = 'dashboard.html';
}
function loginUser(method) {
    if (method === 'phone') { const btn = document.querySelector('.btn-primary'); if (btn) { btn.innerText = 'Вход...'; btn.disabled = true; } }
    setTimeout(() => { localStorage.setItem('isLoggedIn', 'true'); window.location.href = 'dashboard.html'; }, 1000);
}
function logout() { localStorage.removeItem('isLoggedIn'); window.location.href = 'index.html'; }

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    checkSession();
    initDynamicLogo();
    populateDropdown(); // Fill brand list

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
    const socialBtns = document.querySelectorAll('.social-btn');
    if (socialBtns) socialBtns.forEach(btn => btn.addEventListener('click', () => loginUser('social')));
    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    if (themeToggleBtns) themeToggleBtns.forEach(btn => btn.addEventListener('click', toggleTheme));
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Init rendering for oils (active by default)
    if (document.getElementById('productsTableBody')) {
        renderProducts();
    }
});
