import { BasePage } from './BasePage.js';
import { UserService } from '../services/UserService.js';
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
        this.userData = UserService.getSavedUser();
        if (!this.userData) {
            this.userData = await UserService.getCurrentUser();
        }
        this.renderProfile(container);
    }

    renderProfile(container) {
        if (!this.userData) {
            container.innerHTML = '<p>Ошибка загрузки профиля</p>';
            return;
        }
        container.innerHTML = `
            <div class="profile-container">
                <div class="profile-card">
                    <img src="${this.userData.avatar || 'img/avatar.svg'}" alt="Avatar" class="profile-avatar">
                    <h2>${this.userData.name}</h2>
                    <p><strong>Email:</strong> ${this.userData.email}</p>
                    <p><strong>Местоположение:</strong> ${this.userData.location || 'Не указано'}</p>
                    <div class="profile-button-group">
                        <button id="edit-profile-btn" class="change-user-btn">Редактировать профиль</button>
                    </div>
                </div>
            </div>
        `;

        const editBtn = document.getElementById('edit-profile-btn');

        if (editBtn) {
            editBtn.addEventListener('click', () => this.openEditModal());
        }
    }

    openEditModal() {
        if (!this.userData) return;
        const modal = new ProfileEditModal(this.userData, async (updatedUser) => {
            this.userData = updatedUser;
            const container = document.querySelector('.container');
            if (container) this.renderProfile(container);
        });
        modal.show();
    }
}