import { STORAGE_KEYS, API_BASE_URL } from '../data/Constants.js';

export class UserService {
    static async login(email, password) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }
        const { token, user } = await response.json();
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
        return user;
    }

    static async register(email, password, name, avatar, location) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, avatar, location })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }
        const { token, user } = await response.json();
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
        return user;
    }

    static logout() {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        window.location.href = 'login.html';
    }

    static getToken() {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    static getSavedUser() {
        const user = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        return user ? JSON.parse(user) : null;
    }

    static async getCurrentUser() {
        const token = this.getToken();
        if (!token) return null;
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    this.logout();
                }
                return null;
            }
            const user = await response.json();
            localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
            return user;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    static async updateUser(updatedUser) {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent('userChanged', { detail: updatedUser }));
        return updatedUser;
    }

    static async updateUserOnServer(updatedUser) {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedUser)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Update failed');
    }
    const user = await response.json();
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('userChanged', { detail: user }));
    return user;
    }
}