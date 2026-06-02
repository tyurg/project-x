import { VALIDATION_MESSAGES, API_BASE_URL } from '../data/Constants.js';
import { ModalDialog } from './ModalDialog.js';
import { UserService } from '../services/UserService.js';

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
                <h2>Свяжитесь co мной</h2>
                <p class="contact-description">Если появились вопросы по работе сайта (возможные ошибки) - оставьте свои данные, и я свяжусь c вами</p>
                <form class="contact-form" id="contact-form">
                    <div class="form-group">
                        <label for="fio">ФИО</label>
                        <input type="text" id="fio" name="fio" placeholder="Иванов Иван Иванович" autocomplete="name" required>
                        <div class="field-error" id="fio-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="desired-date">Желаемая дата связи</label>
                        <input type="date" id="desired-date" name="desired-date" min="${this.today}" autocomplete="off" required>
                        <div class="field-error" id="date-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="phone">Номер телефона</label>
                        <input type="tel" id="phone" name="phone" placeholder="8 900 000 00 00" autocomplete="tel" required>
                        <div class="field-error" id="phone-error"></div>
                    </div>
                    <div class="form-group">
                        <label for="photo-upload">Загрузить фотографию</label>
                        <input type="file" id="photo-upload" name="photo" accept="image/*" autocomplete="off">
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
        this.fioInput.addEventListener('beforeinput', (e) => {
            if (e.data && /\d/.test(e.data)) {
                e.preventDefault();
            }
        });
        this.fioInput.addEventListener('blur', () => this.validateFIO(true));
        this.fioInput.addEventListener('input', () => this.validateFIO(false));

        this.phoneInput.addEventListener('beforeinput', (e) => {
            if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') return;
            if (e.data && !/^\d$/.test(e.data)) {
                e.preventDefault();
                return;
            }
            const currentDigits = this.getRawDigits();
            if (currentDigits.length >= 11 && e.data) {
                e.preventDefault();
            }
        });

        this.phoneInput.addEventListener('input', () => {
            let raw = this.getRawDigits();
            if (raw.length > 11) raw = raw.slice(0, 11);
            const formatted = this.formatPhoneNumber(raw);
            const cursorPos = this.phoneInput.selectionStart;
            const oldLength = this.phoneInput.value.length;
            this.phoneInput.value = formatted;
            const newLength = formatted.length;
            const delta = newLength - oldLength;
            const newCursor = Math.min(cursorPos + delta, newLength);
            this.phoneInput.setSelectionRange(newCursor, newCursor);
            this.validatePhone(true);
        });

        this.phoneInput.addEventListener('blur', () => {
            let raw = this.getRawDigits();
            if (raw.length > 11) raw = raw.slice(0, 11);
            const formatted = this.formatPhoneNumber(raw);
            this.phoneInput.value = formatted;
            this.validatePhone(true);
        });

        this.dateInput.addEventListener('change', () => this.validateDate());
        this.photoInput.addEventListener('change', () => this.validatePhoto());

        this.updateSubmitButton();
        this.handleSubmit();
    }

    getRawDigits() {
        return this.phoneInput.value.replace(/\D/g, '');
    }

    formatPhoneNumber(digits) {
        if (!digits) return '';
        const parts = [];
        if (digits.length >= 1) parts.push(digits.slice(0, 1));
        if (digits.length >= 4) parts.push(digits.slice(1, 4));
        else if (digits.length > 1) parts.push(digits.slice(1));
        if (digits.length >= 7) parts.push(digits.slice(4, 7));
        else if (digits.length > 4 && digits.length < 7) parts.push(digits.slice(4));
        if (digits.length >= 9) parts.push(digits.slice(7, 9));
        else if (digits.length > 7 && digits.length < 9) parts.push(digits.slice(7));
        if (digits.length >= 11) parts.push(digits.slice(9, 11));
        else if (digits.length > 9 && digits.length < 11) parts.push(digits.slice(9));
        return parts.join(' ');
    }

    validateFIO(showErrors = true) {
        const val = this.fioInput.value.trim();
        let error = '';
        if (!val) {
            error = VALIDATION_MESSAGES.FIO_REQUIRED;
        } else {
            const fioRegex = /^[а-яё]{1,}(?: [а-яё]{1,}){1,2}$/i;
            if (!fioRegex.test(val)) {
                error = VALIDATION_MESSAGES.FIO_INVALID_CHARS;
            }
        }

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
        const digits = this.getRawDigits();
        let error = '';
        if (digits.length === 0) {
            error = VALIDATION_MESSAGES.PHONE_REQUIRED;
        } else if (digits.length !== 11) {
            error = VALIDATION_MESSAGES.PHONE_INVALID;
        } else if (digits[0] !== '8') {
            error = VALIDATION_MESSAGES.PHONE_START_ERROR;
        }

        this.errors.phone = error;
        if (showErrors) {
            this.errorDivs.phone.textContent = error;
            this.errorDivs.phone.style.display = error ? 'block' : 'none';
            this.phoneInput.style.borderColor = error ? 'red' : '#aaa';
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
            if (!file.type.startsWith('image/')) {
                error = VALIDATION_MESSAGES.PHOTO_TYPE;
                ModalDialog.showInfo(VALIDATION_MESSAGES.PHOTO_TYPE, 'Ошибка');
                this.photoInput.value = '';
            } else if (file.size > 5 * 1024 * 1024) {
                error = VALIDATION_MESSAGES.PHOTO_SIZE;
                ModalDialog.showInfo(VALIDATION_MESSAGES.PHOTO_SIZE, 'Ошибка');
                this.photoInput.value = '';
            } else {
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
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const isFioValid = this.validateFIO(true);
            const isPhoneValid = this.validatePhone(true);
            const isDateValid = this.validateDate();
            const isPhotoValid = this.validatePhoto();

            if (isFioValid && isPhoneValid && isDateValid && isPhotoValid) {
                const token = UserService.getToken();
                if (!token) {
                    await ModalDialog.showInfo('Вы не авторизованы', 'Ошибка');
                    return;
                }

                const photoBase64 = this.photoPreview.querySelector('img')?.src || null;

                const payload = {
                    fio: this.fioInput.value.trim(),
                    phone: this.getRawDigits(),
                    desiredDate: this.dateInput.value,
                    message: this.messageInput.value,
                    photoBase64: photoBase64
                };

                try {
                    const response = await fetch(`${API_BASE_URL}/contacts`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(payload)
                    });
                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.error || 'Ошибка отправки');
                    }
                    await ModalDialog.showInfo('Форма успешно отправлена!', 'Успех');
                    this.form.reset();
                    this.photoPreview.innerHTML = '';
                    for (let key in this.errorDivs) {
                        this.errorDivs[key].textContent = '';
                        this.errorDivs[key].style.display = 'none';
                    }
                    this.updateSubmitButton();
                } catch (err) {
                    console.error(err);
                    await ModalDialog.showInfo(err.message || 'Ошибка сервера', 'Ошибка');
                }
            } else {
                await ModalDialog.showInfo('Исправьте ошибки в форме', 'Ошибка');
            }
        });
    }
}