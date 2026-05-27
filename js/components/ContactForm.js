import { VALIDATION_MESSAGES } from '../data/Constants.js';

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
                        <input type="text" id="fio" name="fio" placeholder="Иванов Иван Иванович" maxlength="50" autocomplete="name" required>
                        <div class="field-error" id="fio-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="desired-date">Желаемая дата связи</label>
                        <input type="date" id="desired-date" name="desired-date" min="${this.today}" autocomplete="off" required>
                        <div class="field-error" id="date-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="phone">Номер телефона</label>
                        <input type="tel" id="phone" name="phone" placeholder="+7 (___) ___-__-__" autocomplete="tel" required>
                        <div class="field-error" id="phone-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="photo-upload">Загрузить фотографию</label>
                        <input type="file" id="photo-upload" name="photo-upload" accept="image/*" autocomplete="off">
                        <div id="photo-preview" class="photo-preview"></div>
                        <div class="field-error" id="photo-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="message">Сообщение (необязательно)</label>
                        <textarea id="message" name="message" rows="4" placeholder="Ваше сообщение" autocomplete="off"></textarea>
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
        this.fioInput.addEventListener('blur', () => this.validateFIO(true));
        this.fioInput.addEventListener('input', () => this.validateFIO(false));

        this.phoneInput.addEventListener('blur', () => this.validatePhone(true));
        this.phoneInput.addEventListener('input', () => this.validatePhone(false));

        this.dateInput.addEventListener('change', () => this.validateDate());
        this.photoInput.addEventListener('change', () => this.validatePhoto());

        this.updateSubmitButton();
        this.handleSubmit();
    }

    validateFIO(showErrors = true) {
        const val = this.fioInput.value.trim();
        let error = '';
        if (!val) error = VALIDATION_MESSAGES.FIO_REQUIRED;
        else if (val.length < 3) error = VALIDATION_MESSAGES.FIO_MIN_LENGTH;
        else if (!/^[а-яА-ЯёЁa-zA-Z\s\-']+$/.test(val)) error = VALIDATION_MESSAGES.FIO_INVALID_CHARS;

        this.errors.fio = error;
        if (showErrors) {
            this.errorDivs.fio.textContent = error;
            this.errorDivs.fio.style.display = error ? 'block' : 'none';
            this.fioInput.style.borderColor = error ? 'red' : '#aaa';
        } else {
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
            if (digits.length !== 11) error = VALIDATION_MESSAGES.PHONE_INVALID;
        } else {
            error = VALIDATION_MESSAGES.PHONE_REQUIRED;
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
        if (!val) error = VALIDATION_MESSAGES.DATE_REQUIRED;
        else {
            const selected = new Date(val);
            const current = new Date(this.today);
            if (selected < current) error = VALIDATION_MESSAGES.DATE_INVALID;
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
            if (!file.type.startsWith('image/')) error = VALIDATION_MESSAGES.PHOTO_TYPE;
            else if (file.size > 5 * 1024 * 1024) error = VALIDATION_MESSAGES.PHOTO_SIZE;
            else {
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

    showNotification(message, type = 'success') {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    handleSubmit() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();

            const isFioValid = this.validateFIO(true);
            const isPhoneValid = this.validatePhone(true);
            const isDateValid = this.validateDate();
            const isPhotoValid = this.validatePhoto();

            if (isFioValid && isPhoneValid && isDateValid && isPhotoValid) {
                this.showNotification('Форма успешно отправлена!', 'success');
                this.form.reset();
                this.photoPreview.innerHTML = '';
                for (let key in this.errorDivs) {
                    this.errorDivs[key].textContent = '';
                    this.errorDivs[key].style.display = 'none';
                }
                this.updateSubmitButton();
            } else {
                this.showNotification('Исправьте ошибки в форме', 'error');
            }
        });
    }
}