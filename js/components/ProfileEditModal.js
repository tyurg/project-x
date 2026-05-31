import { ModalDialog } from './ModalDialog.js';
import { UserService } from '../services/UserService.js';

export class ProfileEditModal {
    constructor(userData, onSave) {
        this.userData = userData;
        this.onSave = onSave;
        this.modal = null;
        this.newAvatarBase64 = null;
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, (m) => {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    compressImage(file, targetMaxSize = 400, quality = 0.85) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    if (width > height && width > targetMaxSize) {
                        height = (height * targetMaxSize) / width;
                        width = targetMaxSize;
                    } else if (height > targetMaxSize) {
                        width = (width * targetMaxSize) / height;
                        height = targetMaxSize;
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressed = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressed);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    show() {
        if (this.modal) this.modal.remove();

        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';
        this.modal.innerHTML = `
            <div class="modal-content" style="max-width: 450px;">
                <h3>Редактирование профиля</h3>
                <div class="form-group">
                    <label for="edit-name">Имя *</label>
                    <input type="text" id="edit-name" class="modal-input" value="${this.escapeHtml(this.userData.name)}" maxlength="100" autocomplete="off">
                    <div class="error-message" data-for="name" style="display:none;"></div>
                </div>
                <div class="form-group">
                    <label for="edit-email">Email *</label>
                    <input type="email" id="edit-email" class="modal-input" value="${this.escapeHtml(this.userData.email)}" maxlength="100" autocomplete="off">
                    <div class="error-message" data-for="email" style="display:none;"></div>
                </div>
                <div class="form-group">
                    <label for="edit-location">Местоположение</label>
                    <input type="text" id="edit-location" class="modal-input" value="${this.escapeHtml(this.userData.location)}" maxlength="100" autocomplete="off">
                </div>
                <div class="form-group">
                    <label for="edit-avatar">Аватар (изображение)</label>
                    <input type="file" id="edit-avatar" accept="image/*" autocomplete="off">
                    <div id="avatar-preview" class="photo-preview" style="margin-top: 0.5rem; width: 100px; height: 100px; border-radius: 50%; overflow: hidden;">
                        <img src="${this.userData.avatar}" alt="Предпросмотр" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="error-message" data-for="avatar" style="display:none;"></div>
                </div>
                <div class="modal-buttons">
                    <button id="profile-save" class="modal-btn save">Сохранить</button>
                    <button id="profile-cancel" class="modal-btn cancel">Отмена</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);

        const nameInput = this.modal.querySelector('#edit-name');
        const emailInput = this.modal.querySelector('#edit-email');
        const locationInput = this.modal.querySelector('#edit-location');
        const avatarInput = this.modal.querySelector('#edit-avatar');
        const avatarPreview = this.modal.querySelector('#avatar-preview');
        const saveBtn = this.modal.querySelector('#profile-save');
        const cancelBtn = this.modal.querySelector('#profile-cancel');

        const nameError = this.modal.querySelector('.error-message[data-for="name"]');
        const emailError = this.modal.querySelector('.error-message[data-for="email"]');
        const avatarError = this.modal.querySelector('.error-message[data-for="avatar"]');

        const validateForm = () => {
            let isValid = true;
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();

            if (!name) {
                nameError.textContent = 'Имя обязательно';
                nameError.style.display = 'block';
                nameInput.classList.add('error');
                isValid = false;
            } else {
                nameError.style.display = 'none';
                nameInput.classList.remove('error');
            }

            const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
            if (!email) {
                emailError.textContent = 'Email обязателен';
                emailError.style.display = 'block';
                emailInput.classList.add('error');
                isValid = false;
            } else if (!emailRegex.test(email)) {
                emailError.textContent = 'Введите корректный email';
                emailError.style.display = 'block';
                emailInput.classList.add('error');
                isValid = false;
            } else {
                emailError.style.display = 'none';
                emailInput.classList.remove('error');
            }

            saveBtn.disabled = !isValid;
            saveBtn.style.opacity = isValid ? '1' : '0.5';
            saveBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
        };

        nameInput.addEventListener('input', validateForm);
        emailInput.addEventListener('input', validateForm);

        avatarInput.addEventListener('change', async () => {
            const file = avatarInput.files[0];
            avatarError.style.display = 'none';
            if (file) {
                if (!file.type.startsWith('image/')) {
                    avatarError.textContent = 'Файл должен быть изображением';
                    avatarError.style.display = 'block';
                    avatarInput.value = '';
                    return;
                }
                if (file.size > 5 * 1024 * 1024) {
                    avatarError.textContent = 'Размер не более 5 МБ';
                    avatarError.style.display = 'block';
                    avatarInput.value = '';
                    return;
                }

                try {
                    // Если файл уже маленький (менее 200 КБ) — не сжимаем
                    let finalBase64;
                    if (file.size <= 200 * 1024) {
                        const reader = new FileReader();
                        finalBase64 = await new Promise((resolve, reject) => {
                            reader.onload = (e) => resolve(e.target.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        });
                    } else {
                        finalBase64 = await this.compressImage(file, 400, 0.85);
                    }
                    this.newAvatarBase64 = finalBase64;
                    avatarPreview.innerHTML = `<img src="${finalBase64}" alt="Предпросмотр" style="width: 100%; height: 100%; object-fit: cover;">`;
                } catch (err) {
                    console.error('Ошибка при обработке изображения:', err);
                    avatarError.textContent = 'Не удалось обработать изображение';
                    avatarError.style.display = 'block';
                    avatarInput.value = '';
                }
            } else {
                this.newAvatarBase64 = null;
                avatarPreview.innerHTML = `<img src="${this.userData.avatar}" alt="Предпросмотр" style="width: 100%; height: 100%; object-fit: cover;">`;
            }
        });

        saveBtn.addEventListener('click', async () => {
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const location = locationInput.value.trim();

            if (!name || !email) {
                await ModalDialog.showInfo('Заполните обязательные поля', 'Ошибка');
                return;
            }

            const updatedUser = {
                ...this.userData,
                name: name,
                email: email,
                location: location || 'Не указано'
            };

            if (this.newAvatarBase64) {
                // Дополнительная проверка размера строки (не более 500 КБ)
                if (this.newAvatarBase64.length > 500 * 1024) {
                    await ModalDialog.showInfo('Изображение слишком большое после сжатия. Попробуйте другое изображение.', 'Ошибка');
                    return;
                }
                updatedUser.avatar = this.newAvatarBase64;
            }

            try {
                UserService.updateUser(updatedUser);
                this.modal.remove();
                if (this.onSave) this.onSave(updatedUser);
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    await ModalDialog.showInfo('Слишком много данных в хранилище. Удалите часть задач или выберите аватар меньшего размера.', 'Ошибка');
                } else {
                    console.error(e);
                    await ModalDialog.showInfo('Произошла ошибка при сохранении', 'Ошибка');
                }
            }
        });

        cancelBtn.addEventListener('click', () => this.modal.remove());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.modal.remove();
        });

        validateForm();
    }
}