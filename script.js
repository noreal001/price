document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phone');
    const submitBtn = document.getElementById('submitBtn');
    const loginForm = document.getElementById('loginForm');

    // Theme Switcher Logic
    const themeBtns = document.querySelectorAll('.theme-btn');
    const body = document.body;
    const particlesContainer = document.getElementById('particles');
    let particleInterval;

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'minimal';
    setTheme(savedTheme);

    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setTheme(theme);
        });
    });

    function setTheme(theme) {
        // Update body class
        body.className = ''; // Clear all themes
        if (theme !== 'minimal') {
            body.classList.add(`theme-${theme}`);
        }

        // Update buttons
        themeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });

        // Save preferences
        localStorage.setItem('theme', theme);

        // Handle Particles
        clearInterval(particleInterval);
        particlesContainer.innerHTML = ''; // Clear existing

        if (theme === 'winter') {
            startParticles('snowflake', 200);
        } else if (theme === 'ocean') {
            startParticles('bubble', 400);
        } else if (theme === 'cyberpunk') {
            // Maybe some glitch effect later? 
            // For now, clean or specific CSS background handles it
        }
    }

    function startParticles(type, delay) {
        const createParticle = () => {
            const el = document.createElement('div');
            el.classList.add(type);
            el.style.left = Math.random() * 100 + 'vw';
            el.style.opacity = Math.random();
            el.style.fontSize = (Math.random() * 10 + 10) + 'px';

            if (type === 'bubble') {
                el.style.width = (Math.random() * 20 + 10) + 'px';
                el.style.height = el.style.width;
            } else {
                el.innerHTML = '❄';
            }

            const duration = Math.random() * 5 + 5;
            el.style.animationDuration = duration + 's';

            particlesContainer.appendChild(el);

            // Cleanup
            setTimeout(() => {
                el.remove();
            }, duration * 1000);
        };

        particleInterval = setInterval(createParticle, delay);
        createParticle(); // Immediate start
    }

    // Phone Masking Logic (Existing)
    const maskOptions = {
        mask: '+7 (000) 000-00-00',
        lazy: false
    };

    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        let formattedValue = '';

        if (!value) {
            phoneInput.value = '';
            validateForm();
            return;
        }

        if (['7', '8'].includes(value[0])) {
            value = value.substring(1);
        }

        value = value.substring(0, 10);

        if (value.length > 0) formattedValue += '+7 (' + value.substring(0, 3);
        if (value.length >= 3) formattedValue += ') ' + value.substring(3, 6);
        if (value.length >= 6) formattedValue += '-' + value.substring(6, 8);
        if (value.length >= 8) formattedValue += '-' + value.substring(8, 10);

        e.target.value = formattedValue;
        validateForm();
    });

    phoneInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && phoneInput.value.length <= 4) {
            e.preventDefault();
            phoneInput.value = '';
            validateForm();
        }
    });

    function validateForm() {
        const value = phoneInput.value.replace(/\D/g, '');
        const isValid = value.length === 11;

        submitBtn.disabled = !isValid;
        if (isValid) {
            submitBtn.classList.add('pulse');
        } else {
            submitBtn.classList.remove('pulse');
        }
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Вход...';

        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Успешно!';
            submitBtn.style.background = 'var(--success-color)';
            setTimeout(() => {
                alert('Успешный вход! Переход в личный кабинет...');
                submitBtn.innerHTML = btnContent;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 500);
        }, 1500);
    });

    // Social Login Interaction
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            alert(`Вход через ${btn.title} в разработке`);
        });
    });
});
