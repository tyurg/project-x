import { NAVIGATION_LINKS } from '../data/Constants.js';
import { UserService } from '../services/UserService.js';

export class Header {
    constructor(containerId = 'header-container') {
        this.container = document.getElementById(containerId);
        this.userData = UserService.getSavedUser();

        const pathParts = window.location.pathname.split('/');
        this.currentPage = pathParts.pop() || 'tasks.html';
        if (!this.currentPage.endsWith('.html')) {
            this.currentPage = 'tasks.html';
        }

        window.addEventListener('userChanged', (e) => {
            this.userData = e.detail;
            this.updateUserInfo();
        });
    }

    render() {
        const navItemsHTML = NAVIGATION_LINKS.map(({ href, title }) => {
            const fileName = href.replace('./', '');
            const isActive = this.currentPage === fileName ? 'class="active"' : '';
            return `<li><a href="${fileName}" ${isActive}>${title}</a></li>`;
        }).join('');

        return `
            <nav class="main-nav">
                <div class="logo">
                    <a href="tasks.html">
                        <img src="img/logo.svg" alt="Логотип" width="auto" height="32">
                    </a>
                </div>
                <input type="checkbox" id="menu-toggle">
                <label for="menu-toggle" class="menu-icon">
                    <span></span><span></span><span></span>
                </label>
                <ul class="nav-list">${navItemsHTML}</ul>
                <div class="user-info-header">
                    ${this.userData ? `
                        <img src="${this.userData.avatar}" class="header-avatar" alt="avatar">
                        <span class="header-name">${this.userData.name}</span>
                        <button id="logout-btn" class="logout-button">Выйти</button>
                    ` : ''}
                </div>
            </nav>
        `;
    }

    updateUserInfo() {
        if (!this.container) return;
        const userDiv = this.container.querySelector('.user-info-header');
        if (userDiv && this.userData) {
            userDiv.innerHTML = `
                <img src="${this.userData.avatar}" class="header-avatar" alt="avatar">
                <span class="header-name">${this.userData.name}</span>
                <button id="logout-btn" class="logout-button">Выйти</button>
            `;
            const logoutBtn = this.container.querySelector('#logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    UserService.logout();
                });
            }
        }
    }

    init() {
        if (this.container) {
            this.container.innerHTML = this.render();
            const logoutBtn = this.container.querySelector('#logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    UserService.logout();
                });
            }
            const userInfo = this.container.querySelector('.user-info-header');
            if (userInfo) {
                userInfo.addEventListener('click', (e) => {
                    if (e.target.id !== 'logout-btn') {
                        window.location.href = 'index.html';
                    }
                });
            }
        }
    }
}