import { BasePage } from './BasePage.js';
import { UserService } from '../services/UserService.js';

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

        let user = UserService.getSavedUser();
        if (!user) {
            container.innerHTML = '<div style="text-align: center;">Загрузка профиля...</div>';
            user = await UserService.fetchUser();
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
                    <p><strong>Location:</strong> ${this.userData.location}</p>
                    <button id="change-user-btn" class="change-user-btn">Сменить пользователя</button>
                </div>
            </div>
        `;

        const changeBtn = document.getElementById('change-user-btn');
        if (changeBtn) {
            changeBtn.addEventListener('click', async () => {
                changeBtn.disabled = true;
                changeBtn.textContent = 'Загрузка...';
                await UserService.refreshUser();
                window.location.reload();
            });
        }
    }
}