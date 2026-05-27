import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { TasksPage } from './pages/TasksPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { HelpPage } from './pages/HelpPage.js';
import { UserService } from './services/UserService.js';

async function preloadUserProfile() {
    if (UserService.getSavedUser()) return;
    await UserService.fetchUser();
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