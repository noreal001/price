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

// QUALITY LEVELS (Battery Logic)
// Cycle: Q2 -> Q1 -> TOP -> Q2...
const QUALITY_LEVELS = [
    { label: "Q2", icon: "fa-battery-half", mult: 1.2, color: "q-mid" },           // Standard Mid (Orange/Yellow)
    { label: "Q1", icon: "fa-battery-three-quarters", mult: 1.3, color: "q-mid-high" }, // High Mid (Lime Green)
    { label: "TOP", icon: "fa-battery-full", mult: 1.4, color: "q-top" }           // Top (Green Glow)
];


window.switchCategory = function (cat, btn) {
    try {
        currentCategory = cat;
        document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        renderProducts();
    } catch (e) {
        console.error("Error switching category:", e);
    }
};

// --- FACTORY LOGIC ---
const FACTORIES = ['Luzi', 'Eps', 'Seluz'];
window.setFactory = function (rowId, factory) {
    const row = document.getElementById(`row-${rowId}`);
    if (!row) return;
    row.querySelectorAll('.factory-option').forEach(el => el.classList.remove('active'));
    const target = row.querySelector(`.factory-option[data-val="${factory}"]`);
    if (target) target.classList.add('active');
};

function createFactoryControl(id) {
    return `
    <div class="factory-switch">
        ${FACTORIES.map(f => `
            <div class="factory-option ${f === 'Luzi' ? 'active' : ''}" 
                 data-val="${f}" 
                 onclick="setFactory(${id}, '${f}')">${f}</div>
        `).join('')}
    </div>`;
}

// --- BOTTLE LOGIC ---
window.initBottleEvents = function (rowId) {
    const bottle = document.getElementById(`bottle-${rowId}`);
    if (!bottle) return;

    const updateFill = (e) => {
        const rect = bottle.getBoundingClientRect();
        let clientY = e.clientY;
        if (e.touches && e.touches[0]) clientY = e.touches[0].clientY;

        let height = rect.bottom - clientY;
        if (height < 0) height = 0;
        if (height > rect.height) height = rect.height;

        let percentage = (height / rect.height);

        let vol = Math.round(percentage * 5000);
        if (vol < 30) vol = 30;
        vol = Math.round(vol / 50) * 50;

        const fillEl = bottle.querySelector('.bottle-liquid');
        fillEl.style.height = `${(vol / 5000) * 100}%`;

        const label = document.getElementById(`vol-label-${rowId}`);
        if (label) label.innerText = (vol >= 1000) ? (vol / 1000).toFixed(1) + 'kg' : vol + 'g';

        updatePrice(rowId, bottle, vol);
    };

    bottle.addEventListener('mousedown', (e) => {
        updateFill(e);
        const onMove = (mv) => updateFill(mv);
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });

    bottle.addEventListener('touchstart', (e) => {
        // e.preventDefault(); // Might block scrolling on mobile if covering large area
        updateFill(e);
        const onMove = (mv) => { mv.preventDefault(); updateFill(mv); }; // Prevent scroll ONLY when dragging bottle
        const onEnd = () => {
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
        };
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
    });
};

function createBottleControl(id) {
    return `
    <div class="bottle-wrapper">
        <div class="bottle-container" id="bottle-${id}">
            <div class="bottle-liquid" style="height: 5%;"></div>
            <div class="bottle-glass"></div>
        </div>
        <div class="bottle-label" id="vol-label-${id}">30g</div>
    </div>
    `;
}

function createQualityButton(productId) {
    const q = QUALITY_LEVELS[0];
    return `
        <button class="quality-btn ${q.color}" 
                onclick="toggleQuality(${productId}, this)" 
                data-q-index="0"
                title="Change Quality">
            <i class="fa-solid ${q.icon} quality-icon"></i>
            <span class="quality-label">${q.label}</span>
        </button>
    `;
}

window.toggleQuality = function (id, btn) {
    let currentIndex = parseInt(btn.getAttribute('data-q-index'));
    let nextIndex = (currentIndex + 1) % QUALITY_LEVELS.length;
    const nextQ = QUALITY_LEVELS[nextIndex];

    btn.setAttribute('data-q-index', nextIndex);
    btn.className = `quality-btn ${nextQ.color}`;
    btn.querySelector('.quality-icon').className = `fa-solid ${nextQ.icon} quality-icon`;
    btn.querySelector('.quality-label').innerText = nextQ.label;

    updatePrice(id, btn);
};

function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) {
        console.error("Table body not found!");
        return;
    }
    tbody.innerHTML = '';

    let data = [];
    try {
        if (currentCategory === 'oils') data = typeof catalogOils !== 'undefined' ? catalogOils : [];
        else if (currentCategory === 'bottles') data = typeof catalogBottles !== 'undefined' ? catalogBottles : [];
        else if (currentCategory === 'perfume') data = typeof catalogPerfume !== 'undefined' ? catalogPerfume : [];
    } catch (e) {
        console.error("Error accessing catalog data:", e);
        return;
    }

    data.forEach(product => {
        const tr = document.createElement('tr');
        tr.id = `row-${product.id}`;

        let nameHtml = `<div class="p-name">${product.name}</div>`;

        // Factory (replacing Brand)
        let factoryHtml = '';
        if (currentCategory === 'oils' || currentCategory === 'perfume') {
            factoryHtml = createFactoryControl(product.id);
        } else {
            factoryHtml = `<span style="color:#666;">-</span>`;
        }

        // Quality
        let qualHtml = '';
        if (currentCategory === 'bottles') {
            qualHtml = `<span style="font-size:0.9rem; color:#999; display:flex; gap:5px; align-items:center;">
                            <i class="fa-solid fa-box"></i> Std
                        </span><input type="hidden" class="quality-data-hidden" value="1">`;
        } else {
            qualHtml = createQualityButton(product.id);
        }

        // Volume
        let volHtml = '';
        if (currentCategory === 'bottles') {
            volHtml = `
             <div class="volume-control">
                <input type="range" class="volume-slider" min="10" max="1000" step="10" value="50" 
                           oninput="handleVolumeInput(this, ${product.id})">
                <span class="volume-label" id="vol-label-${product.id}">50 pcs</span>
            </div>`;
        } else {
            volHtml = createBottleControl(product.id);
        }

        tr.innerHTML = `
            <td class="product-name-cell">${nameHtml}</td>
            <td>${factoryHtml}</td>
            <td>${qualHtml}</td>
            <td><span class="cost-tag" id="cost-${product.id}">...</span></td>
            <td style="min-width: 80px;">${volHtml}</td>
            <td><span class="price-tag" id="price-${product.id}">...</span></td>
            <td>
                <button class="btn-primary btn-small" onclick="addToCart('${product.name}')">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);

        if (currentCategory !== 'bottles') {
            initBottleEvents(product.id);
            setTimeout(() => {
                const b = document.getElementById(`bottle-${product.id}`);
                if (b) updatePrice(product.id, b, 30);
            }, 0);
        } else {
            handleVolumeInput(tr.querySelector('.volume-slider'), product.id);
        }
    });
}

window.handleVolumeInput = function (slider, id) {
    let val = parseInt(slider.value);
    if (val > 100) val = Math.round(val / 50) * 50;
    const label = document.getElementById(`vol-label-${id}`);
    label.innerText = val + ' pcs';
    updatePrice(id, slider, val);
};

window.updatePrice = function (id, sourceElement, overrideVol) {
    const row = document.getElementById(`row-${id}`);
    if (!row) return;

    let qualityMult = 1;
    const qBtn = row.querySelector('.quality-btn');
    if (qBtn) {
        const idx = parseInt(qBtn.getAttribute('data-q-index'));
        qualityMult = QUALITY_LEVELS[idx].mult;
    } else {
        const qInput = row.querySelector('.quality-data-hidden');
        if (qInput) qualityMult = parseFloat(qInput.value);
    }

    let vol = overrideVol;

    let product;
    if (currentCategory === 'oils') product = catalogOils.find(p => p.id === id);
    else if (currentCategory === 'bottles') product = catalogBottles.find(p => p.id === id);
    else if (currentCategory === 'perfume') product = catalogPerfume.find(p => p.id === id);

    if (!product) return;

    let costPerUnit = 0;
    let finalSum = 0;

    if (currentCategory === 'bottles') {
        costPerUnit = product.basePrice;
        finalSum = costPerUnit * vol;
    } else {
        // Oils: Cost per 1g
        let costPerGram = (product.basePrice / 10) * qualityMult;
        costPerUnit = costPerGram;
        finalSum = Math.round(costPerGram * vol);
    }

    // Update Cost Cell
    const costTag = row.querySelector('.cost-tag');
    if (costTag) {
        let displayCost = costPerUnit.toFixed(1);
        if (displayCost.endsWith('.0')) displayCost = parseInt(displayCost);
        costTag.innerText = displayCost + ' ₽';
    }

    // Update Sum Cell
    const priceTag = row.querySelector('.price-tag');
    if (priceTag) priceTag.innerText = `₽ ${finalSum.toLocaleString()}`;
};


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
// ... user login functions omitted for brevity but presumed same ...
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

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    checkSession();
    initDynamicLogo();

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
