export class UserService {
    static async fetchUser() {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
            return JSON.parse(saved);
        }
        return this.loadNewUser();
    }

    static async refreshUser() {
        localStorage.removeItem('tasks');
        const newUser = await this.loadNewUser();
        window.dispatchEvent(new CustomEvent('userChanged', { detail: newUser }));
        return newUser;
    }

    static async loadNewUser() {
        try {
            const response = await fetch('https://randomuser.me/api/');
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
            localStorage.setItem('userProfile', JSON.stringify(userData));
            return userData;
        } catch (error) {
            const fallback = {
                id: 'guest',
                name: 'Гость',
                email: 'guest@example.com',
                avatar: 'https://via.placeholder.com/150',
                location: 'Не указано'
            };
            localStorage.setItem('userProfile', JSON.stringify(fallback));
            return fallback;
        }
    }

    static getSavedUser() {
        const saved = localStorage.getItem('userProfile');
        return saved ? JSON.parse(saved) : null;
    }
}