import { UserService } from '../services/UserService.js';
import { VALIDATION_MESSAGES } from '../data/Constants.js';

export class RegisterPage {
    constructor() {
        this.form = null;
        this.nameInput = null;
        this.emailInput = null;
        this.passwordInput = null;
        this.submitBtn = null;
        this.nameError = null;
        this.emailError = null;
        this.passwordError = null;
        this.errors = { name: '', email: '', password: '' };
    }

    init() {
        this.cacheElements();
        this.initValidation();
        this.attachEvents();
        this.updateSubmitButton();
    }

    cacheElements() {
        this.form = document.getElementById('register-form');
        this.nameInput = document.getElementById('name');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.submitBtn = document.getElementById('register-submit');
        this.nameError = document.getElementById('name-error');
        this.emailError = document.getElementById('email-error');
        this.passwordError = document.getElementById('password-error');
    }

    initValidation() {
        this.nameInput.addEventListener('input', () => this.validateName());
        this.nameInput.addEventListener('blur', () => this.validateName(true));
        this.emailInput.addEventListener('input', () => this.validateEmail());
        this.emailInput.addEventListener('blur', () => this.validateEmail(true));
        this.passwordInput.addEventListener('input', () => this.validatePassword());
        this.passwordInput.addEventListener('blur', () => this.validatePassword(true));
    }

    validateName(showError = true) {
        const name = this.nameInput.value.trim();
        let error = '';
        if (!name) {
            error = VALIDATION_MESSAGES.NAME_REQUIRED;
        }
        this.errors.name = error;
        if (showError) {
            this.nameError.textContent = error;
            this.nameError.style.display = error ? 'block' : 'none';
            this.nameInput.style.borderColor = error ? '#da5959' : '#b6c5d3';
        } else {
            this.nameError.style.display = 'none';
            this.nameInput.style.borderColor = '#b6c5d3';
        }
        this.updateSubmitButton();
        return !error;
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

            const isNameValid = this.validateName(true);
            const isEmailValid = this.validateEmail(true);
            const isPasswordValid = this.validatePassword(true);

            if (!isNameValid || !isEmailValid || !isPasswordValid) {
                return;
            }

            const name = this.nameInput.value.trim();
            const email = this.emailInput.value.trim();
            const password = this.passwordInput.value;
            try {
                await UserService.register(email, password, name, '', 'Не указано');
                window.location.href = 'tasks.html';
            } catch (err) {
                alert(err.message);
            }
        });
    }
}