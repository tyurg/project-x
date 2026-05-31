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
        try {
            const newUser = await this.loadNewUser();
            window.dispatchEvent(new CustomEvent('userChanged', { detail: newUser }));
            return newUser;
        } catch (error) {
            console.error('Ошибка при обновлении пользователя:', error);
            const fallbackUser = this.getFallbackUser();
            window.dispatchEvent(new CustomEvent('userChanged', { detail: fallbackUser }));
            throw error;
        }
    }

    static async loadNewUser() {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
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
            console.error('Ошибка загрузки профиля из API:', error);
            throw error;
        }
    }

    static getFallbackUser() {
        const fallback = {
            id: 'guest',
            name: 'Гость',
            email: 'guest@example.com',
            avatar: 'img/avatar.svg',
            location: 'He указано'
        };
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(fallback));
        return fallback;
    }

    static getSavedUser() {
        const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        return saved ? JSON.parse(saved) : null;
    }

    static updateUser(updatedUser) {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent('userChanged', { detail: updatedUser }));
        return updatedUser;
    }
    static updateUser(updatedUser) {
        try {
            localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedUser));
            window.dispatchEvent(new CustomEvent('userChanged', { detail: updatedUser }));
            return updatedUser;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.error('Превышен лимит localStorage');
                throw e;
            }
            throw e;
        }
    }
}