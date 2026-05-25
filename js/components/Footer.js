
export class Footer {
    constructor(containerId = 'footer-container') {
        this.container = document.getElementById(containerId);
    }

    render() {
        return `
            <footer class="site-footer">
                <div class="footer-copyright">
                    <p>&copy; ${new Date().getFullYear()} Все права защищены</p>
                </div>
            </footer>
        `;
    }

    init() {
        if (this.container) {
            this.container.innerHTML = this.render();
            console.log('Футер загружен');
        }
    }
}