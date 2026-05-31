export class ModalDialog {
    static escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, (m) => {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    static showInfo(message, title = 'Сообщение') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-content">
                    <h3>${this.escapeHtml(title)}</h3>
                    <p>${this.escapeHtml(message)}</p>
                    <div class="modal-buttons center">
                        <button class="modal-btn save" id="info-ok">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            const okBtn = overlay.querySelector('#info-ok');
            const cleanup = () => {
                overlay.remove();
                resolve();
            };
            okBtn.addEventListener('click', cleanup);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) cleanup();
            });
        });
    }

    static showConfirm(message, title = 'Подтверждение') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-content">
                    <h3>${this.escapeHtml(title)}</h3>
                    <p>${this.escapeHtml(message)}</p>
                    <div class="modal-buttons center">
                        <button class="modal-btn save" id="confirm-yes">Да</button>
                        <button class="modal-btn cancel confirm-cancel" id="confirm-no">Нет</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            const yesBtn = overlay.querySelector('#confirm-yes');
            const noBtn = overlay.querySelector('#confirm-no');
            const cleanup = (result) => {
                overlay.remove();
                resolve(result);
            };
            yesBtn.addEventListener('click', () => cleanup(true));
            noBtn.addEventListener('click', () => cleanup(false));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) cleanup(false);
            });
        });
    }
}