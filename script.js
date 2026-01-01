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

// Order Milestones with dynamic slogans
const ORDER_MILESTONES = [
    {
        threshold: 0,
        emoji: "🛒",
        color: '#999',
        slogans: [
            "Начните добавлять товары",
            "Соберите свой первый заказ",
            "Время создать что-то особенное",
            "Ваша корзина ждет",
            "Первый шаг к успеху",
            "Начните с малого",
            "Добавьте первый товар",
            "Ваш заказ начинается здесь",
            "Создайте уникальный набор",
            "Выберите лучшее для себя"
        ]
    },
    {
        threshold: 7000,
        emoji: "✅",
        color: '#34c759',
        slogans: [
            "Минимальный заказ собран!",
            "Отличное начало!",
            "Вы на верном пути",
            "Первая цель достигнута",
            "Так держать!",
            "Уже можно оформлять",
            "Минималка пройдена",
            "Хороший старт",
            "Продолжайте в том же духе",
            "База собрана, двигаемся дальше"
        ]
    },
    {
        threshold: 25000,
        emoji: "📦",
        color: '#007aff',
        slogans: [
            "Средний заказ — отличное начало!",
            "Вы знаете толк в качестве",
            "Солидный выбор",
            "Уверенный подход",
            "Заказ растет",
            "Профессиональный уровень",
            "Вы на правильном пути",
            "Хороший объем",
            "Качественная подборка",
            "Средний чек взят",
            "Это уже серьёзно",
            "Растём дальше",
            "Оптимальный размер",
            "Баланс найден",
            "Продуманный заказ"
        ]
    },
    {
        threshold: 50000,
        emoji: "🎯",
        color: '#5856d6',
        slogans: [
            "Хороший заказ!",
            "Вы точно знаете, что хотите",
            "Впечатляющий выбор",
            "Серьёзный подход к делу",
            "50К — солидная цифра",
            "Уверенный рост",
            "Масштаб впечатляет",
            "Стратег и профи",
            "Крупная партия",
            "Достойный объем",
            "Вы нацелены на результат",
            "Амбициозный заказ",
            "Размах растёт",
            "Мощная заявка",
            "Серьезные намерения",
            "Уровень повышается",
            "Вы знаете цену качеству",
            "Полсотни — только начало"
        ]
    },
    {
        threshold: 100000,
        emoji: "🌟",
        color: '#ff9500',
        slogans: [
            "Отличный заказ!",
            "100К — вы профессионал",
            "Шестизначная сумма!",
            "Масштабное мышление",
            "Вы играете по-крупному",
            "Серьёзный игрок на рынке",
            "Впечатляющий масштаб",
            "Сотка взята",
            "Элитный уровень",
            "Вы знаете, как работать",
            "Крупный формат",
            "Стратегический заказ",
            "Профессиональный размах",
            "Большие цели",
            "Уверенная сотня",
            "Мастер своего дела",
            "Амбиции оправданы",
            "100К — новая планка",
            "Лига профессионалов",
            "Серьёзный уровень"
        ]
    },
    {
        threshold: 500000,
        emoji: "🔥",
        color: '#ff2d55',
        slogans: [
            "Крупный заказ — вы профи!",
            "Полмиллиона! Невероятно",
            "Вы на вершине",
            "Огромный масштаб",
            "Элита рынка",
            "Топовый заказчик",
            "Это уже бизнес",
            "500К — уровень мастера",
            "Вы задаёте тренды",
            "Мастер-класс",
            "Легенда в деле",
            "Крупнейший формат",
            "Полумиллионник",
            "Гигантский заказ",
            "Вы в высшей лиге",
            "Миллион близко",
            "Феноменальный объем",
            "Профи экстра-класса",
            "Титановый уровень",
            "Безграничные амбиции",
            "Рекорды близко",
            "Вы создаёте историю",
            "Впечатляющая мощь",
            "Огонь в глазах",
            "Монстр заказов"
        ]
    },
    {
        threshold: 1000000,
        emoji: "💎",
        color: '#af52de',
        slogans: [
            "Превосходный заказ!",
            "МИЛЛИОН! Вы легенда",
            "Бриллиантовый уровень",
            "Это просто космос",
            "Вы — икона стиля",
            "Семизначная сумма!",
            "Элита элит",
            "Недосягаемая высота",
            "Миллионер заказов",
            "Вы переписали правила",
            "Исторический момент",
            "Грандиозный масштаб",
            "Вершина мастерства",
            "Магия миллиона",
            "Бескомпромиссное качество",
            "Премиум класс",
            "Вы — эталон",
            "Невероятное достижение",
            "Платиновый статус",
            "Миллион причин гордиться",
            "Безупречный выбор",
            "Премиальный заказ",
            "Вы изменили игру",
            "Абсолютный рекорд",
            "Diamondный уровень",
            "Непревзойдённый результат",
            "Легендарный статус",
            "Вы — само совершенство",
            "Миллионный рубеж взят",
            "Феноменальное достижение"
        ]
    },
    {
        threshold: 2000000,
        emoji: "👑",
        color: '#ffd60a',
        slogans: [
            "Грандиозный заказ!",
            "ДВА МИЛЛИОНА! Вы — лидер",
            "Высший уровень",
            "Абсолютное первенство",
            "Вы покорили Олимп",
            "Космический масштаб",
            "Недостижимая высота",
            "Глобальный заказ",
            "Вы — легенда навсегда",
            "Историческое событие",
            "Грандиозная победа",
            "Непостижимый уровень",
            "Вы создали империю",
            "Лидерство за вами",
            "Абсолютное господство",
            "Вы переписали историю",
            "Масштабный размах",
            "Величие воплощенное",
            "Вершина вершин",
            "Бесконечное превосходство",
            "Золотой пьедестал",
            "Вы — само величие",
            "Непревзойдённая мощь",
            "Лидерство на рынке",
            "Максимальный статус",
            "Вечная слава",
            "Абсолютный триумф",
            "Легенда эпохи",
            "Вы — сама суть успеха",
            "Бескрайнее величие",
            "Вершина успеха",
            "Вы достигли невозможного",
            "Небывалый успех",
            "Золотая эра",
            "Вы — воплощение мечты",
            "Безграничное могущество",
            "Вершина всех вершин",
            "Вы переросли все рамки",
            "Абсолютная легенда",
            "Два миллиона — новая реальность",
            "Вы изменили мир",
            "Непостижимое превосходство",
            "Весь рынок ваш",
            "Вы — сама история",
            "Бесконечный триумф",
            "Золотой век наступил",
            "Вы превзошли всех",
            "Мировое признание",
            "Вечная легенда",
            "Абсолютный лидер"
        ]
    }
];

// Memory for slogans to prevent repeats
const sloganQueues = {};

function getOrderMilestone(total) {
    for (let i = ORDER_MILESTONES.length - 1; i >= 0; i--) {
        if (total >= ORDER_MILESTONES[i].threshold) {
            return ORDER_MILESTONES[i];
        }
    }
    return ORDER_MILESTONES[0];
}

function getRandomSlogan(milestone) {
    const key = milestone.threshold.toString();
    if (!sloganQueues[key] || sloganQueues[key].length === 0) {
        sloganQueues[key] = [...milestone.slogans];
        for (let i = sloganQueues[key].length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sloganQueues[key][i], sloganQueues[key][j]] = [sloganQueues[key][j], sloganQueues[key][i]];
        }
    }
    return sloganQueues[key].pop();
}

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

        // Get current milestone
        const currentMilestone = getOrderMilestone(total);

        // SINGLE SCALE: 0 to 2,000,000
        const MAX_SCALE = 2000000;
        let pct = (total / MAX_SCALE) * 100;
        if (pct > 100) pct = 100;

        fill.style.width = `${pct}%`;
        fill.style.background = currentMilestone.color;

        // Target display & Remaining logic
        const nextMilestone = ORDER_MILESTONES.find(m => m.threshold > total);

        if (total < 7000) {
            let remaining = 7000 - total;
            hint.innerText = `Еще ${remaining.toLocaleString()} ₽ до минимального заказа`;
        } else if (nextMilestone) {
            let remaining = nextMilestone.threshold - total;
            hint.innerText = `${currentMilestone.emoji} ${getRandomSlogan(currentMilestone)} • Еще ${remaining.toLocaleString()} ₽ до уровня ${nextMilestone.threshold.toLocaleString()} ₽`;
        } else {
            hint.innerText = `${currentMilestone.emoji} ${getRandomSlogan(currentMilestone)}`;
        }

        if (nextMilestone) {
            targetEl.innerText = `${nextMilestone.threshold.toLocaleString()} ₽`;
            targetEl.style.display = 'block';
        } else {
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
        total += item.totalPrice * (item.quantity || 1);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div class="p-name">${item.name}</div></td>
            <td>${item.factory !== '-' ? item.factory + ' / ' : ''}${item.quality} / ${item.volume}${item.unit}</td>
            <td>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button class="btn-primary btn-small" style="min-width:24px; padding:2px 6px; font-size:0.85rem;" onclick="changeQuantity(${i}, -1)">−</button>
                    <span style="min-width:30px; text-align:center; font-weight:700;">${item.quantity || 1}</span>
                    <button class="btn-primary btn-small" style="min-width:24px; padding:2px 6px; font-size:0.85rem;" onclick="changeQuantity(${i}, 1)">+</button>
                </div>
            </td>
            <td style="font-weight:700;">${(item.totalPrice * (item.quantity || 1)).toLocaleString()} ₽</td>
            <td><button class="btn-primary btn-small" style="min-width:26px; width:26px; padding:4px; opacity:0.5; font-size:0.8rem;" onclick="removeFromCart(${i})"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
    totalEl.innerText = `${total.toLocaleString()} ₽`;
};

window.changeQuantity = function (index, delta) {
    if (!cart[index].quantity) cart[index].quantity = 1;
    cart[index].quantity += delta;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    updateCartUI();
    renderCartView();
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
    { id: 'theme-winter', icon: 'fa-snowflake', label: 'Winter' }
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
