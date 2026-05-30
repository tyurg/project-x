export class Footer {
    constructor(containerId = 'footer-container') {
        this.container = document.getElementById(containerId);
    }

    render() {
        return `
            <footer class="site-footer">
                <div class="footer-copyright">
                    <strong>&copy; ${new Date().getFullYear()} Bce права защищены</strong>
                </div>
            </footer>
        `;
    }

    init() {
        if (this.container) {
            this.container.innerHTML = this.render();
        }
    }
}