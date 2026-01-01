/* script.js */

// --- 1. BAHUR Dynamic Branding ---
const abstractIcons = ['fa-cube', 'fa-cubes', 'fa-shapes', 'fa-layer-group', 'fa-gem', 'fa-atom', 'fa-microchip'];

function initDynamicLogo() {
    const logoEl = document.getElementById('dynamicLogoSidebar');
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
let currentBrandFilter = 'all';

// QUALITY LEVELS
const QUALITY_LEVELS = [
    { label: "Q2", icon: "fa-battery-half", mult: 1.2, color: "q-mid" },           // Red
    { label: "Q1", icon: "fa-battery-three-quarters", mult: 1.3, color: "q-mid-high" }, // Green
    { label: "TOP", icon: "fa-battery-full", mult: 1.4, color: "q-top" }           // Blue/Purple (Premium)
];

window.switchCategory = function (cat, btn) {
    currentCategory = cat;
    document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderProducts();
};

window.filterBrand = function (brand) {
    currentBrandFilter = brand;
    renderProducts();
};

// --- FACTORY CONTROL ---
const FACTORIES = ['Luzi', 'Eps', 'Seluz'];
window.setFactory = function (rowId, factory) {
    const row = document.getElementById(`row-${rowId}`);
    if (!row) return;
    row.querySelectorAll('.factory-option').forEach(el => el.classList.remove('active'));
    const target = row.querySelector(`.factory-option[data-val="${factory}"]`);
    if (target) target.classList.add('active');
};

function createFactoryControl(id) {
    return `<div class="factory-switch">
        ${FACTORIES.map(f => `<div class="factory-option ${f === 'Luzi' ? 'active' : ''}" data-val="${f}" onclick="setFactory(${id}, '${f}')">${f}</div>`).join('')}
    </div>`;
}

// --- BOTTLE & VOLUME CONTROL ---
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
        let percentage = height / rect.height;

        let vol = Math.round(percentage * 5000);
        if (vol < 30) vol = 30;
        vol = Math.round(vol / 50) * 50;

        bottle.querySelector('.bottle-liquid').style.height = `${(vol / 5000) * 100}%`;
        const label = document.getElementById(`vol-label-${rowId}`);
        if (label) label.innerText = (vol >= 1000) ? (vol / 1000).toFixed(1) + 'kg' : vol + 'g';
        updatePrice(rowId, bottle, vol);
    };

    bottle.addEventListener('mousedown', (e) => {
        updateFill(e);
        const onMove = (mv) => updateFill(mv);
        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
    });
    // Touch support omitted for brevity, but same logic
};

function createBottleControl(id) {
    return `<div class="bottle-wrapper">
        <div class="bottle-container" id="bottle-${id}">
            <div class="bottle-liquid" style="height: 5%;"></div>
            <div class="bottle-glass"></div>
        </div>
        <div class="bottle-label" id="vol-label-${id}">30g</div>
    </div>`;
}

window.handleVolumeInput = function (slider, id) {
    let val = parseInt(slider.value);
    const label = document.getElementById(`vol-label-${id}`);
    label.innerText = val + ' pcs';
    updatePrice(id, slider, val);
};

// --- QUALITY CONTROL ---
function createQualityButton(productId) {
    const q = QUALITY_LEVELS[0];
    return `<button class="quality-btn ${q.color}" onclick="toggleQuality(${productId}, this)" data-q-index="0">
            <i class="fa-solid ${q.icon} quality-icon"></i>
            <span class="quality-label">${q.label}</span>
        </button>`;
}

window.toggleQuality = function (id, btn) {
    let idx = parseInt(btn.getAttribute('data-q-index'));
    idx = (idx + 1) % QUALITY_LEVELS.length;
    const nextQ = QUALITY_LEVELS[idx];
    btn.setAttribute('data-q-index', idx);
    btn.className = `quality-btn ${nextQ.color}`;
    btn.querySelector('.quality-icon').className = `fa-solid ${nextQ.icon} quality-icon`;
    btn.querySelector('.quality-label').innerText = nextQ.label;
    updatePrice(id, btn);
};

// --- RENDER & PRICE ---
window.updatePrice = function (id, source, overrideVol) {
    const row = document.getElementById(`row-${id}`);
    if (!row) return;

    let qualityMult = 1;
    const qBtn = row.querySelector('.quality-btn');
    if (qBtn) {
        const idx = parseInt(qBtn.getAttribute('data-q-index'));
        qualityMult = QUALITY_LEVELS[idx].mult;
    }

    let vol = overrideVol;
    if (vol === undefined) {
        // Try to find vol from label if not passed
        const label = document.getElementById(`vol-label-${id}`);
        if (label) {
            let txt = label.innerText;
            vol = txt.includes('kg') ? parseFloat(txt) * 1000 : parseInt(txt);
        } else vol = 30;
    }

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
        let costPerGram = (product.basePrice / 10) * qualityMult;
        costPerUnit = costPerGram;
        finalSum = Math.round(costPerGram * vol);
    }

    const costTag = row.querySelector('.cost-tag');
    if (costTag) costTag.innerText = costPerUnit.toFixed(1).replace('.0', '') + ' ₽';
    const priceTag = row.querySelector('.price-tag');
    if (priceTag) priceTag.innerText = `₽ ${finalSum.toLocaleString()}`;
};

function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    let data = [];
    if (currentCategory === 'oils') data = typeof catalogOils !== 'undefined' ? catalogOils : [];
    else if (currentCategory === 'bottles') data = typeof catalogBottles !== 'undefined' ? catalogBottles : [];
    else if (currentCategory === 'perfume') data = typeof catalogPerfume !== 'undefined' ? catalogPerfume : [];

    // Filter
    if (currentBrandFilter !== 'all' && currentCategory === 'oils') {
        // Mock filter for demo
        // data = data.filter(...) 
    }

    data.forEach(product => {
        const tr = document.createElement('tr');
        tr.id = `row-${product.id}`;

        let factoryHtml = (currentCategory === 'oils' || currentCategory === 'perfume') ? createFactoryControl(product.id) : `<span style="color:#666;">-</span>`;
        let qualHtml = (currentCategory === 'bottles') ? `<span style="color:#999;">Std</span>` : createQualityButton(product.id);

        let volHtml = (currentCategory === 'bottles') ?
            `<div class="volume-control"><input type="range" class="volume-slider" min="10" max="1000" step="10" value="50" oninput="handleVolumeInput(this, ${product.id})"><span class="volume-label" id="vol-label-${product.id}">50 pcs</span></div>`
            : createBottleControl(product.id);

        tr.innerHTML = `
            <td class="product-name-cell"><div class="p-name">${product.name}</div></td>
            <td>${factoryHtml}</td>
            <td>${qualHtml}</td>
            <td><span class="cost-tag" id="cost-${product.id}">...</span></td>
            <td style="min-width: 80px;">${volHtml}</td>
            <td><span class="price-tag" id="price-${product.id}">...</span></td>
            <td>
                <button class="btn-primary btn-small" onclick="addToCart(${product.id})">
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


// --- CART SYSTEM ---
let cart = [];
const MIN_ORDER = 5000;

function updateCartUI() {
    // Bottom Bar
    const bar = document.getElementById('cartBar');
    const sumEl = document.getElementById('cartSum');
    const targetEl = document.getElementById('cartTarget');
    const fill = document.getElementById('cartProgress');
    const hint = document.getElementById('cartHint');
    const badge = document.getElementById('cartBadge');

    // Sidebar Counter
    const sbCount = document.getElementById('sidebar-cart-count');

    let total = cart.reduce((acc, item) => acc + item.totalPrice, 0);
    let count = cart.length;

    if (bar) {
        if (count > 0) bar.classList.add('visible');
        else bar.classList.remove('visible');

        sumEl.innerText = `${total.toLocaleString()} ₽`;

        // Russian pluralization
        let itemsText = 'товаров';
        if (count % 10 === 1 && count % 100 !== 11) itemsText = 'товар';
        else if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) itemsText = 'товара';
        badge.innerText = `${count} ${itemsText}`;

        let pct = (total / MIN_ORDER) * 100;
        if (pct > 100) pct = 100;
        fill.style.width = `${pct}%`;

        if (total < MIN_ORDER) {
            hint.innerText = `Еще ${(MIN_ORDER - total).toLocaleString()} ₽ до минимального заказа`;
            fill.style.background = '#ff9500';
            targetEl.style.display = 'block';
        } else {
            hint.innerText = 'Минимальный заказ собран! 🚀';
            fill.style.background = '#34c759';
            targetEl.style.display = 'none';
        }

        // Make cart bar clickable
        bar.style.cursor = 'pointer';
        bar.onclick = function () {
            switchView('cart');
        };
    }

    if (sbCount) {
        sbCount.innerText = count;
        sbCount.style.display = count > 0 ? 'inline-block' : 'none';
    }

    // If viewing cart, rerender table
    const cartView = document.getElementById('view-cart');
    if (cartView && cartView.style.display !== 'none') {
        renderCartView();
    }
}

window.addToCart = function (id) {
    const row = document.getElementById(`row-${id}`);
    if (!row) return;

    // 1. Get Product Base
    let product;
    if (currentCategory === 'oils') product = catalogOils.find(p => p.id === id);
    else if (currentCategory === 'bottles') product = catalogBottles.find(p => p.id === id);
    else if (currentCategory === 'perfume') product = catalogPerfume.find(p => p.id === id);
    if (!product) return;

    // 2. Get Config
    // Quality
    let qualityLabel = 'Std';
    let qualityMult = 1.0;
    const qBtn = row.querySelector('.quality-btn');
    if (qBtn) {
        const idx = parseInt(qBtn.getAttribute('data-q-index'));
        qualityMult = QUALITY_LEVELS[idx].mult;
        qualityLabel = QUALITY_LEVELS[idx].label;
    }

    // Factory
    let factory = '-';
    const activeFac = row.querySelector('.factory-option.active');
    if (activeFac) factory = activeFac.innerText;

    // Volume & Price
    // Read from UI tags for accuracy
    const costTag = row.querySelector('.cost-tag').innerText.replace(' ₽', '');
    const volLabel = document.getElementById(`vol-label-${id}`).innerText;
    // Vol parse
    let volume = 0;
    if (volLabel.includes('kg')) volume = parseFloat(volLabel) * 1000;
    else if (volLabel.includes('pcs')) volume = parseInt(volLabel);
    else volume = parseInt(volLabel);

    const priceTag = row.querySelector('.price-tag').innerText.replace('₽ ', '').replace(/\s/g, ''); // remove spaces
    let totalPrice = parseInt(priceTag);

    // Add
    cart.push({
        id: product.id,
        name: product.name,
        category: currentCategory,
        factory: factory,
        quality: qualityLabel,
        volume: volume,
        totalPrice: totalPrice,
        unit: (currentCategory === 'bottles') ? 'pcs' : 'g'
    });

    updateCartUI();

    // Anim
    const btn = row.querySelector('button.btn-primary');
    if (btn) {
        const h = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.style.background = 'var(--success-color)';
        setTimeout(() => { btn.innerHTML = h; btn.style.background = ''; }, 600);
    }
};

window.renderCartView = function () {
    const tbody = document.getElementById('cartTableBody');
    const totalEl = document.getElementById('cartViewTotal');
    tbody.innerHTML = '';

    let total = 0;
    cart.forEach((item, i) => {
        total += item.totalPrice;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div class="p-name">${item.name}</div></td>
            <td>${item.factory !== '-' ? item.factory + ' / ' : ''}${item.quality} / ${item.volume}${item.unit}</td>
            <td>1</td>
            <td style="font-weight:700;">${item.totalPrice.toLocaleString()} ₽</td>
            <td><button class="btn-primary btn-small" style="background:#ff3b30; min-width:30px; width:30px; padding:6px;" onclick="removeFromCart(${i})"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
    totalEl.innerText = `${total.toLocaleString()} ₽`;
};

window.removeFromCart = function (i) {
    cart.splice(i, 1);
    updateCartUI();
};
window.clearCart = function () {
    cart = [];
    updateCartUI();
};

window.switchView = function (view) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    // Find active btn
    const navs = document.querySelectorAll('.nav-item');
    for (let n of navs) {
        if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(view)) n.classList.add('active');
    }

    document.getElementById('view-products').style.display = 'none';
    document.getElementById('view-stats').style.display = 'none';
    document.getElementById('view-cart').style.display = 'none';

    const t = document.getElementById('pageTitle');

    if (view === 'products') {
        document.getElementById('view-products').style.display = 'block';
        if (t) t.innerText = 'Каталог';
        renderProducts();
    }
    else if (view === 'cart') {
        document.getElementById('view-cart').style.display = 'block';
        if (t) t.innerText = 'Корзина';
        renderCartView();
    }
    else if (view === 'stats') {
        document.getElementById('view-stats').style.display = 'grid';
        if (t) t.innerText = 'Статистика';
    }
};

// --- 3. Theme Logic (RESTORED CYCLE) ---
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

window.setTheme = function (themeName) {
    localStorage.setItem('theme', themeName);
    document.body.className = themeName;
    updateThemeIcon(themeName);
}

function updateThemeIcon(themeName) {
    const btns = document.querySelectorAll('.theme-toggle-btn');
    const themeObj = THEMES.find(t => t.id === themeName) || THEMES[0];
    btns.forEach(btn => {
        if (btn) btn.innerHTML = `<i class="fa-solid ${themeObj.icon}"></i>`;
    });
}

window.toggleTheme = function () {
    const currentTheme = localStorage.getItem('theme') || 'base';
    let currentIndex = THEMES.findIndex(t => t.id === currentTheme);
    if (currentIndex === -1) currentIndex = 0;
    const nextIndex = (currentIndex + 1) % THEMES.length;
    const nextTheme = THEMES[nextIndex].id;
    setTheme(nextTheme);
}

function loadTheme() {
    const t = localStorage.getItem('theme') || 'base';
    setTheme(t);
}

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    initDynamicLogo();
    if (document.getElementById('productsTableBody')) renderProducts();
});
