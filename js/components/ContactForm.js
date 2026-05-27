export class ContactForm {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.form = null;
        this.today = new Date().toISOString().split('T')[0];
    }

    render() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Контейнер "${this.containerId}" не найден!`);
            return;
        }

        this.container.innerHTML = `
            <div class="contact-section">
                <h2>Свяжитесь со мной</h2>
                <p class="contact-description">Если появились вопросы по работе сайта (возможные ошибки) - оставьте свои данные и я свяжусь с вами</p>
                <form class="contact-form" id="contact-form">
                    <div class="form-group">
                        <label for="fio">ФИО (только буквы)</label>
                        <input type="text" id="fio" name="fio" placeholder="Иванов Иван Иванович" required>
                    </div>
                    <div class="form-group">
                        <label for="desired-date">Желаемая дата связи</label>
                        <input type="date" id="desired-date" name="desired-date" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">Номер телефона</label>
                        <input type="tel" id="phone" name="phone" placeholder="+7 (___) ___-__-__" required>
                    </div>
                    <div class="form-group">
                        <label for="photo-upload">Загрузить фотографию</label>
                        <input type="file" id="photo-upload" name="photo-upload" accept="image/*">
                    </div>
                    <div class="form-group">
                        <label for="message">Сообщение (необязательно)</label>
                        <textarea id="message" name="message" rows="4" placeholder="Ваше сообщение"></textarea>
                    </div>
                    <button type="submit" class="submit-btn">Отправить</button>
                </form>
            </div>
        `;

        this.cacheElements();
        this.initValidation();
    }

    cacheElements() {
        this.form = document.getElementById('contact-form');
        this.fioInput = document.getElementById('fio');
        this.phoneInput = document.getElementById('phone');
        this.dateInput = document.getElementById('desired-date');
        this.photoInput = document.getElementById('photo-upload');
        this.messageInput = document.getElementById('message');
        if (this.dateInput) this.dateInput.min = this.today;
    }

    initValidation() {
        this.validateFIO();
        this.validatePhone();
        this.validateDate();
        this.validatePhoto();
        this.handleSubmit();
    }

    validateFIO() {
        if (!this.fioInput) return;
        this.fioInput.maxLength = 50;

        this.fioInput.addEventListener('beforeinput', (e) => {
            if (e.data && !/^[а-яА-ЯёЁa-zA-Z\s\-']+$/.test(e.data)) {
                e.preventDefault();
            }
        });

        this.fioInput.addEventListener('blur', () => {
            const val = this.fioInput.value.trim();
            if (!val) {
                this.fioInput.setCustomValidity('Введите ФИО');
                this.fioInput.style.borderColor = 'red';
            } else if (val.length < 3) {
                this.fioInput.setCustomValidity('Минимум 3 символа');
                this.fioInput.style.borderColor = 'red';
            } else {
                this.fioInput.setCustomValidity('');
                this.fioInput.style.borderColor = '#aaa';
            }
        });

        this.fioInput.addEventListener('focus', () => {
            this.fioInput.setCustomValidity('');
            this.fioInput.style.borderColor = '#aaa';
        });
    }

    validatePhone() {
        if (!this.phoneInput) return;

        this.phoneInput.addEventListener('beforeinput', (e) => {
            if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') return;
            if (e.data && !/^\d$/.test(e.data)) {
                e.preventDefault();
                return;
            }
            const currentDigits = this.phoneInput.value.replace(/\D/g, '');
            if (currentDigits.length >= 11) e.preventDefault();
        });

        this.phoneInput.addEventListener('input', () => {
            const digits = this.phoneInput.value.replace(/\D/g, '');
            if (!digits) {
                this.phoneInput.style.borderColor = '#aaa';
                return;
            }
            if (digits[0] !== '7' && digits[0] !== '8') {
                this.phoneInput.style.borderColor = 'red';
                return;
            }
            if (digits.length < 11) this.phoneInput.style.borderColor = 'orange';
            else this.phoneInput.style.borderColor = 'green';
        });

        this.phoneInput.addEventListener('blur', () => {
            let digits = this.phoneInput.value.replace(/\D/g, '');
            if (!digits) {
                this.phoneInput.setCustomValidity('');
                this.phoneInput.style.borderColor = '#aaa';
                return;
            }
            if (digits[0] === '8') digits = '7' + digits.slice(1);
            if (digits[0] !== '7') digits = '7' + digits;

            if (digits.length !== 11) {
                this.phoneInput.setCustomValidity('Номер должен содержать ровно 11 цифр');
                this.phoneInput.style.borderColor = 'red';
                return;
            }

            const formatted = '+' + digits[0] + ' (' + digits.slice(1, 4) + ') ' + digits.slice(4, 7) + '-' + digits.slice(7, 9) + '-' + digits.slice(9, 11);
            this.phoneInput.value = formatted;
            this.phoneInput.setCustomValidity('');
            this.phoneInput.style.borderColor = 'green';
        });

        this.phoneInput.addEventListener('focus', () => {
            this.phoneInput.setCustomValidity('');
            this.phoneInput.style.borderColor = '#aaa';
        });
    }

    validateDate() {
        if (!this.dateInput) return;
        this.dateInput.addEventListener('change', () => {
            const selected = new Date(this.dateInput.value);
            const current = new Date(this.today);
            if (selected < current) {
                this.dateInput.setCustomValidity('Дата не может быть раньше текущей');
                this.dateInput.style.borderColor = 'red';
            } else {
                this.dateInput.setCustomValidity('');
                this.dateInput.style.borderColor = '#aaa';
            }
        });
    }

    validatePhoto() {
        if (!this.photoInput) return;
        this.photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                alert('Пожалуйста, выберите файл изображения.');
                this.photoInput.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('Размер файла не должен превышать 5 МБ.');
                this.photoInput.value = '';
                return;
            }
        });
    }

    handleSubmit() {
        if (!this.form) return;
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            let errors = [];

            if (this.fioInput) {
                const val = this.fioInput.value.trim();
                if (!val) errors.push('Введите ФИО');
                else if (val.length < 3) errors.push('ФИО слишком короткое (минимум 3 символа)');
            }

            if (this.phoneInput) {
                let digits = this.phoneInput.value.replace(/\D/g, '');
                if (digits.startsWith('8')) digits = '7' + digits.slice(1);
                if (digits.length > 0 && !digits.startsWith('7')) digits = '7' + digits;
                if (digits.length !== 11) errors.push('Некорректный номер: нужно ровно 11 цифр');
            }

            if (this.dateInput && this.dateInput.value) {
                const selected = new Date(this.dateInput.value);
                const current = new Date(this.today);
                selected.setHours(0, 0, 0, 0);
                current.setHours(0, 0, 0, 0);
                if (selected < current) errors.push('Дата не может быть раньше сегодняшней');
            }

            if (errors.length > 0) {
                alert('Исправьте ошибки:\n\n' + errors.join('\n'));
                return;
            }

            alert('Форма успешно отправлена!');
            this.form.reset();
        });
    }
}