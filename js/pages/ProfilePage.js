import { BasePage } from './BasePage.js';
import { UserService } from '../services/UserService.js';
import { ModalDialog } from '../components/ModalDialog.js';
import { ProfileEditModal } from '../components/ProfileEditModal.js';

export class ProfilePage extends BasePage {
    constructor() {
        super();
        this.userData = null;
    }

    async init() {
        super.init();
        await this.loadAndRenderProfile();
    }

    async loadAndRenderProfile() {
        const container = document.querySelector('.container');
        if (!container) return;
        container.innerHTML = '<div class="loading-spinner">Загрузка профиля...</div>';
        let user = UserService.getSavedUser();
        if (!user) {
            try {
                user = await UserService.fetchUser();
            } catch (error) {
                console.error('Ошибка загрузки профиля:', error);
                user = UserService.getFallbackUser();
            }
        }
        this.userData = user;
        this.renderProfile(container);
    }

    renderProfile(container) {
        container.innerHTML = `
            <div class="profile-container">
                <div class="profile-card">
                    <img src="${this.userData.avatar}" alt="Avatar" class="profile-avatar">
                    <h2>${this.userData.name}</h2>
                    <p><strong>Email:</strong> ${this.userData.email}</p>
                    <p><strong>Местоположение:</strong> ${this.userData.location}</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                        <button id="edit-profile-btn" class="change-user-btn">Редактировать профиль</button>
                        <button id="change-user-btn" class="change-user-btn">Сменить пользователя</button>
                    </div>
                </div>
            </div>
        `;

        const editBtn = document.getElementById('edit-profile-btn');
        const changeBtn = document.getElementById('change-user-btn');

        if (editBtn) {
            editBtn.addEventListener('click', () => this.openEditModal());
        }

        if (changeBtn) {
            changeBtn.addEventListener('click', async () => {
                changeBtn.disabled = true;
                changeBtn.textContent = 'Загрузка...';
                try {
                    await UserService.refreshUser();
                } catch (error) {
                    await ModalDialog.showInfo('Не удалось загрузить профиль с сервера. Используем гостевой профиль.', 'Ошибка');
                }
                window.location.reload();
            });
        }
    }

    openEditModal() {
        if (!this.userData) return;
        const modal = new ProfileEditModal(this.userData, (updatedUser) => {
            this.userData = updatedUser;
            const container = document.querySelector('.container');
            if (container) this.renderProfile(container);
        });
        modal.show();
    }
}