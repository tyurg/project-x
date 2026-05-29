import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { TasksPage } from './pages/TasksPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { HelpPage } from './pages/HelpPage.js';
import { UserService } from './services/UserService.js';
import { ModalDialog } from './components/ModalDialog.js';

function showLoadingIndicator() {
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = `
            <div style="background: #f0f8ff; padding: 1rem; text-align: center;">
                Загрузка профиля...
            </div>
        `;
    }
}

async function preloadUserProfile() {
    if (UserService.getSavedUser()) return;
    showLoadingIndicator();
    try {
        await UserService.loadNewUser();
    } catch (error) {
        console.error('Ошибка при загрузке профиля из API:', error);
        await ModalDialog.showInfo('Не удалось загрузить профиль с сервера. Используем локальные данные.', 'Ошибка');
        UserService.getFallbackUser();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await preloadUserProfile();
    const currentPage = window.location.pathname.split('/').pop();
    switch (currentPage) {
        case 'profile.html':
            new ProfilePage().init();
            break;
        case 'tasks.html':
            new TasksPage().init();
            break;
        case 'help.html':
            new HelpPage().init();
            break;
        default:
            const header = new Header('header-container');
            header.init();
            const footer = new Footer('footer-container');
            footer.init();
            break;
    }
});