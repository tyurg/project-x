import { NAVIGATION_LINKS } from '../data/constants.js';

export class Header {
    constructor(containerId = 'header-container') {
        this.container = document.getElementById(containerId);
        this.userData = null;

        const pathParts = window.location.pathname.split('/');
        this.currentPage = pathParts.pop() || 'tasks.html';
        if (!this.currentPage.endsWith('.html')) {
            this.currentPage = 'tasks.html';
        }

        this.loadUserData();

        window.addEventListener('userChanged', (e) => {
            this.userData = e.detail;
            this.updateUserInfo();
        });
    }

    loadUserData() {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
            this.userData = JSON.parse(saved);
        }
    }

    render() {
        const isGitHubPages = window.location.hostname.includes('github.io');
        const repoName = isGitHubPages ? `/${window.location.pathname.split('/')[1]}/` : '/';

        const navItemsHTML = NAVIGATION_LINKS.map(({ href, title, target = '_self' }) => {
            const fileName = href.replace('./', '');
            const correctHref = `${repoName}${fileName}`;
            const isActive = this.currentPage === fileName ? 'class="active"' : '';
            const targetAttr = target === '_blank' ? 'target="_blank"' : '';
            return `<li><a href="${correctHref}" ${targetAttr} ${isActive}>${title}</a></li>`;
        }).join('');

        return `
            <nav class="main-nav">
                <input type="checkbox" id="menu-toggle">
                <label for="menu-toggle" class="menu-icon">
                    <span></span><span></span><span></span>
                </label>
                <ul class="nav-list">${navItemsHTML}</ul>
                <div class="user-info-header">
                    ${this.userData ? `
                        <img src="${this.userData.avatar}" class="header-avatar" alt="avatar">
                        <span class="header-name">${this.userData.name}</span>
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
            `;
        }
    }

    init() {
        if (this.container) {
            this.container.innerHTML = this.render();

            const userInfo = this.container.querySelector('.user-info-header');
            if (userInfo) {
                userInfo.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isGitHubPages = window.location.hostname.includes('github.io');
                    const repoName = isGitHubPages ? `/${window.location.pathname.split('/')[1]}/` : '/';
                    window.location.href = `${repoName}profile.html`;
                });
            }
        }
    }
}