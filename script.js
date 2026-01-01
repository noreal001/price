document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('phone');
    const submitBtn = document.getElementById('submitBtn');
    const loginForm = document.getElementById('loginForm');

    // Phone Masking Logic
    const maskOptions = {
        mask: '+7 (000) 000-00-00',
        lazy: false
    };

    // Simple custom masking implementation to avoid external dependencies for now
    // or we can use a simple regex approach for formatting
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

        // Limit length
        value = value.substring(0, 10);

        if (value.length > 0) formattedValue += '+7 (' + value.substring(0, 3);
        if (value.length >= 3) formattedValue += ') ' + value.substring(3, 6);
        if (value.length >= 6) formattedValue += '-' + value.substring(6, 8);
        if (value.length >= 8) formattedValue += '-' + value.substring(8, 10);

        e.target.value = formattedValue;
        validateForm();
    });

    // Handle backspace better
    phoneInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && phoneInput.value.length <= 4) {
            e.preventDefault();
            phoneInput.value = '';
            validateForm();
        }
    });

    function validateForm() {
        const value = phoneInput.value.replace(/\D/g, '');
        // 11 digits including country code (7 + 10 digits)
        const isValid = value.length === 11;

        submitBtn.disabled = !isValid;
        if (isValid) {
            submitBtn.classList.add('pulse');
        } else {
            submitBtn.classList.remove('pulse');
        }
    }

    // Handle Form Submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btnContent = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Вход...';

        // Simulate API call
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Успешно!';
            submitBtn.style.background = 'var(--success-color)';

            setTimeout(() => {
                alert('Успешный вход! Переход в личный кабинет...');
                // Reset for demo
                submitBtn.innerHTML = btnContent;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 500);
        }, 1500);
    });

    // Social Login Interaction
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.title;
            alert(`Вход через ${provider} в разработке`);
        });
    });
});
