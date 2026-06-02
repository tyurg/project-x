import { UserService } from '../services/UserService.js';
import { VALIDATION_MESSAGES } from '../data/Constants.js';

export class LoginPage {
    constructor() {
        this.form = null;
        this.emailInput = null;
        this.passwordInput = null;
        this.submitBtn = null;
        this.emailError = null;
        this.passwordError = null;
        this.errors = { email: '', password: '' };
    }

    init() {
        this.cacheElements();
        this.initValidation();
        this.attachEvents();
        this.updateSubmitButton();
    }

    cacheElements() {
        this.form = document.getElementById('login-form');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.submitBtn = document.getElementById('login-submit');
        this.emailError = document.getElementById('email-error');
        this.passwordError = document.getElementById('password-error');
    }

    initValidation() {
        this.emailInput.addEventListener('input', () => this.validateEmail());
        this.emailInput.addEventListener('blur', () => this.validateEmail(true));
        this.passwordInput.addEventListener('input', () => this.validatePassword());
        this.passwordInput.addEventListener('blur', () => this.validatePassword(true));
    }

    validateEmail(showError = true) {
        const email = this.emailInput.value.trim();
        let error = '';
        if (!email) {
            error = VALIDATION_MESSAGES.EMAIL_REQUIRED;
        } else {
            const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
            if (!emailRegex.test(email)) {
                error = VALIDATION_MESSAGES.EMAIL_INVALID;
            }
        }
        this.errors.email = error;
        if (showError) {
            this.emailError.textContent = error;
            this.emailError.style.display = error ? 'block' : 'none';
            this.emailInput.style.borderColor = error ? '#da5959' : '#b6c5d3';
        } else {
            this.emailError.style.display = 'none';
            this.emailInput.style.borderColor = '#b6c5d3';
        }
        this.updateSubmitButton();
        return !error;
    }

    validatePassword(showError = true) {
        const password = this.passwordInput.value;
        let error = '';
        if (!password) {
            error = VALIDATION_MESSAGES.PASSWORD_REQUIRED;
        } else if (password.length < 6) {
            error = VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
        }
        this.errors.password = error;
        if (showError) {
            this.passwordError.textContent = error;
            this.passwordError.style.display = error ? 'block' : 'none';
            this.passwordInput.style.borderColor = error ? '#da5959' : '#b6c5d3';
        } else {
            this.passwordError.style.display = 'none';
            this.passwordInput.style.borderColor = '#b6c5d3';
        }
        this.updateSubmitButton();
        return !error;
    }

    updateSubmitButton() {
        const hasErrors = Object.values(this.errors).some(e => e !== '');
        this.submitBtn.disabled = hasErrors;
        this.submitBtn.style.opacity = hasErrors ? '0.5' : '1';
        this.submitBtn.style.cursor = hasErrors ? 'not-allowed' : 'pointer';
    }

    attachEvents() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const isEmailValid = this.validateEmail(true);
            const isPasswordValid = this.validatePassword(true);

            if (!isEmailValid || !isPasswordValid) {
                return;
            }

            const email = this.emailInput.value.trim();
            const password = this.passwordInput.value;
            try {
                await UserService.login(email, password);
                window.location.href = 'tasks.html';
            } catch (err) {
                // Показываем ошибку от сервера в отдельном блоке (можно добавить)
                alert(err.message); // или создать общий div для ошибок
            }
        });
    }
}