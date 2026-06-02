import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { TasksPage } from './pages/TasksPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { HelpPage } from './pages/HelpPage.js';
import { UserService } from './services/UserService.js';

function hideLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) loader.style.display = 'none';
}

async function initApp() {
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['login.html', 'register.html'];
    if (publicPages.includes(currentPage)) {

        if (currentPage === 'login.html') {

        } else if (currentPage === 'register.html') {

        }
        hideLoader();
        return;
    }

    const token = UserService.getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const user = await UserService.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const header = new Header('header-container');
    header.init();
    const footer = new Footer('footer-container');
    footer.init();

    switch (currentPage) {
        case 'index.html':
            new ProfilePage().init();
            break;
        case 'tasks.html':
            new TasksPage().init();
            break;
        case 'help.html':
            new HelpPage().init();
            break;
        default:
            break;
    }
    hideLoader();
}

document.addEventListener('DOMContentLoaded', initApp);