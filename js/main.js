

import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { Tasks } from './pages/Tasks.js';
import { Profile } from './pages/Profile.js';
import { Help } from './pages/Help.js';
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    switch (currentPage) {
        case 'tasks.html':
            new Tasks().init();
            break;

        case 'profile.html':
            new Profile().init();
            break;

        case 'help.html':
            new Help().init();
            break;

        default:
            const header = new Header('header-container');
            header.init();
            const footer = new Footer('footer-container');
            footer.init();
            break;
    }
});