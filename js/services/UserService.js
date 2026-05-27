import { STORAGE_KEYS, API_BASE_URL } from '../data/Constants.js';

export class UserService {
    static async fetchUser() {
        const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        if (saved) {
            return JSON.parse(saved);
        }
        return this.loadNewUser();
    }

    static async refreshUser() {
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        const newUser = await this.loadNewUser();
        window.dispatchEvent(new CustomEvent('userChanged', { detail: newUser }));
        return newUser;
    }

    static async loadNewUser() {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Ошибка загрузки профиля');
            const data = await response.json();
            const user = data.results[0];
            const userData = {
                id: user.login.uuid,
                name: `${user.name.first} ${user.name.last}`,
                email: user.email,
                avatar: user.picture.large,
                location: `${user.location.city}, ${user.location.country}`
            };
            localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userData));
            return userData;
        } catch (error) {
            const fallback = {
                id: 'guest',
                name: 'Гость',
                email: 'guest@example.com',
                avatar: 'https://via.placeholder.com/150',
                location: 'Не указано'
            };
            localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(fallback));
            return fallback;
        }
    }

    static getSavedUser() {
        const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        return saved ? JSON.parse(saved) : null;
    }
}