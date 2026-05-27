export class ContactForm {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.form = null;
        this.today = new Date().toISOString().split('T')[0];
        this.errors = {
            fio: '',
            phone: '',
            date: '',
            photo: ''
        };
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
                <p class="contact-description">Если появились вопросы по работе сайта (возможные ошибки) - оставьте свои данные, и я свяжусь с вами</p>
                <form class="contact-form" id="contact-form">
                    <div class="form-group">
                        <label for="fio">ФИО (только буквы)</label>
                        <input type="text" id="fio" name="fio" placeholder="Иванов Иван Иванович" maxlength="50" required>
                        <div class="field-error" id="fio-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="desired-date">Желаемая дата связи</label>
                        <input type="date" id="desired-date" name="desired-date" min="${this.today}" required>
                        <div class="field-error" id="date-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="phone">Номер телефона</label>
                        <input type="tel" id="phone" name="phone" placeholder="+7 (___) ___-__-__" required>
                        <div class="field-error" id="phone-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="photo-upload">Загрузить фотографию</label>
                        <input type="file" id="photo-upload" name="photo-upload" accept="image/*">
                        <div id="photo-preview" class="photo-preview"></div>
                        <div class="field-error" id="photo-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="message">Сообщение (необязательно)</label>
                        <textarea id="message" name="message" rows="4" placeholder="Ваше сообщение"></textarea>
                    </div>
                    <button type="submit" class="submit-btn" id="contact-submit">Отправить</button>
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
        this.photoPreview = document.getElementById('photo-preview');
        this.submitBtn = document.getElementById('contact-submit');
        this.errorDivs = {
            fio: document.getElementById('fio-error'),
            phone: document.getElementById('phone-error'),
            date: document.getElementById('date-error'),
            photo: document.getElementById('photo-error')
        };
    }

    initValidation() {
        // Валидация на blur и input
        this.fioInput.addEventListener('blur', () => this.validateFIO(true));
        this.fioInput.addEventListener('input', () => this.validateFIO(false));

        this.phoneInput.addEventListener('blur', () => this.validatePhone(true));
        this.phoneInput.addEventListener('input', () => this.validatePhone(false));

        this.dateInput.addEventListener('change', () => this.validateDate());
        this.photoInput.addEventListener('change', () => this.validatePhoto());

        // Блокировка кнопки при загрузке
        this.updateSubmitButton();
    }

    validateFIO(showErrors = true) {
        const val = this.fioInput.value.trim();
        let error = '';
        if (!val) error = 'Введите ФИО';
        else if (val.length < 3) error = 'Минимум 3 символа';
        else if (!/^[а-яА-ЯёЁa-zA-Z\s\-']+$/.test(val)) error = 'Только буквы, пробелы, дефис, апостроф';

        this.errors.fio = error;
        if (showErrors) {
            this.errorDivs.fio.textContent = error;
            this.errorDivs.fio.style.display = error ? 'block' : 'none';
            this.fioInput.style.borderColor = error ? 'red' : '#aaa';
        } else {
            // скрываем ошибку, пока пользователь печатает
            this.errorDivs.fio.style.display = 'none';
            this.fioInput.style.borderColor = '#aaa';
        }
        this.updateSubmitButton();
        return !error;
    }

    validatePhone(showErrors = true) {
        let digits = this.phoneInput.value.replace(/\D/g, '');
        let error = '';
        if (digits.length > 0) {
            if (digits[0] === '8') digits = '7' + digits.slice(1);
            if (digits[0] !== '7') digits = '7' + digits;
            if (digits.length !== 11) error = 'Номер должен содержать ровно 11 цифр';
        } else {
            // поле обязательно – если пусто, ошибка
            error = 'Введите номер телефона';
        }

        this.errors.phone = error;
        if (showErrors) {
            this.errorDivs.phone.textContent = error;
            this.errorDivs.phone.style.display = error ? 'block' : 'none';
            this.phoneInput.style.borderColor = error ? 'red' : (digits.length === 11 ? 'green' : '#aaa');
        } else {
            this.errorDivs.phone.style.display = 'none';
            this.phoneInput.style.borderColor = '#aaa';
        }
        this.updateSubmitButton();
        return !error;
    }

    validateDate() {
        const val = this.dateInput.value;
        let error = '';
        if (!val) error = 'Выберите дату';
        else {
            const selected = new Date(val);
            const current = new Date(this.today);
            if (selected < current) error = 'Дата не может быть раньше сегодняшней';
        }
        this.errors.date = error;
        this.errorDivs.date.textContent = error;
        this.errorDivs.date.style.display = error ? 'block' : 'none';
        this.dateInput.style.borderColor = error ? 'red' : '#aaa';
        this.updateSubmitButton();
        return !error;
    }

    validatePhoto() {
        const file = this.photoInput.files[0];
        let error = '';
        if (file) {
            if (!file.type.startsWith('image/')) error = 'Файл должен быть изображением';
            else if (file.size > 5 * 1024 * 1024) error = 'Размер не более 5 МБ';
            else {
                // Превью
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.photoPreview.innerHTML = `<img src="${e.target.result}" alt="Предпросмотр">`;
                };
                reader.readAsDataURL(file);
            }
        } else {
            this.photoPreview.innerHTML = '';
        }
        this.errors.photo = error;
        this.errorDivs.photo.textContent = error;
        this.errorDivs.photo.style.display = error ? 'block' : 'none';
        this.photoInput.style.borderColor = error ? 'red' : '#aaa';
        this.updateSubmitButton();
        return !error;
    }

    updateSubmitButton() {
        const hasErrors = Object.values(this.errors).some(e => e !== '');
        this.submitBtn.disabled = hasErrors;
        this.submitBtn.style.opacity = hasErrors ? '0.5' : '1';
        this.submitBtn.style.cursor = hasErrors ? 'not-allowed' : 'pointer';
    }

    handleSubmit() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();

            // принудительно проверяем все поля с отображением ошибок
            const isFioValid = this.validateFIO(true);
            const isPhoneValid = this.validatePhone(true);
            const isDateValid = this.validateDate();
            const isPhotoValid = this.validatePhoto();

            if (isFioValid && isPhoneValid && isDateValid && isPhotoValid) {
                alert('Форма успешно отправлена!');
                this.form.reset();
                this.photoPreview.innerHTML = '';
                // Очистить ошибки
                for (let key in this.errorDivs) {
                    this.errorDivs[key].textContent = '';
                    this.errorDivs[key].style.display = 'none';
                }
                this.updateSubmitButton();
            } else {
                alert('Исправьте ошибки в форме');
            }
        });
    }
}