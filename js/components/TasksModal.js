import { TASK_CATEGORIES, TASK_PRIORITIES, VALIDATION_MESSAGES } from '../data/Constants.js';

export class TasksModal {
    constructor(onSave) {
        this.modal = null;
        this.onSave = onSave;
        this.editingTaskIndex = null;
    }

    show(taskData = null) {
        if (this.modal) this.modal.remove();
        this.editingTaskIndex = taskData ? taskData.editingIndex : null;
        const isEdit = taskData !== null;

        // Опции категорий
        let categoriesOptions = '';
        for (const [value, label] of Object.entries(TASK_CATEGORIES)) {
            const selected = (isEdit && taskData.category === value) ? 'selected' : '';
            categoriesOptions += `<option value="${value}" ${selected}>${label}</option>`;
        }

        // Опции приоритетов
        let prioritiesOptions = '';
        for (const [value, label] of Object.entries(TASK_PRIORITIES)) {
            const selected = (isEdit && taskData.priority === value) ? 'selected' : '';
            prioritiesOptions += `<option value="${value}" ${selected}>${label}</option>`;
        }

        // Формируем атрибут min для поля дедлайн (всегда – текущее время)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const deadlineMinAttr = `min="${year}-${month}-${day}T${hours}:${minutes}"`;

        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';
        this.modal.innerHTML = `
            <div class="modal-content">
                <h3>${isEdit ? 'Редактировать задачу' : 'Новая задача'}</h3>
                <div class="form-group">
                    <label>Название *</label>
                    <input type="text" id="modal-title" class="modal-input" placeholder="Введите название" value="${this.escapeHtml(isEdit ? taskData.title : '')}" maxlength="100" autocomplete="off">
                    <div class="error-message" data-for="title"></div>
                </div>
                <div class="form-group">
                    <label>Описание (необязательно)</label>
                    <textarea id="modal-description" class="modal-input" rows="3" placeholder="Введите описание" maxlength="500" autocomplete="off">${this.escapeHtml(isEdit ? taskData.description || '' : '')}</textarea>
                </div>
                <div class="form-group">
                    <label>Приоритет</label>
                    <select id="modal-priority" class="modal-select" autocomplete="off">
                        ${prioritiesOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Дедлайн</label>
                    <input type="datetime-local" id="modal-deadline" class="modal-input" value="${isEdit && taskData.deadline ? taskData.deadline : ''}" ${deadlineMinAttr} autocomplete="off">
                    <div class="error-message" data-for="deadline"></div>
                </div>
                <div class="form-group">
                    <label>Категория</label>
                    <select id="modal-category" class="modal-select" autocomplete="off">
                        ${categoriesOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="modal-completed" class="modal-checkbox" ${isEdit && taskData.completed ? 'checked' : ''} autocomplete="off"> Выполнено
                    </label>
                </div>
                <div class="modal-buttons">
                    <button id="modal-save" class="modal-btn save">Сохранить</button>
                    <button id="modal-cancel" class="modal-btn cancel">Отмена</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        const saveBtn = this.modal.querySelector('#modal-save');
        const cancelBtn = this.modal.querySelector('#modal-cancel');
        const titleField = this.modal.querySelector('#modal-title');
        const deadlineField = this.modal.querySelector('#modal-deadline');

        const validateModal = () => {
            const title = titleField?.value.trim() || '';
            const deadlineValue = deadlineField?.value || '';
            let isValid = true;
            if (!title) isValid = false;
            if (deadlineValue) {
                const deadlineDate = new Date(deadlineValue);
                const now = new Date();
                now.setSeconds(0, 0);
                deadlineDate.setSeconds(0, 0);
                if (deadlineDate < now) isValid = false;
            }
            if (saveBtn) saveBtn.disabled = !isValid;
        };

        if (titleField) {
            titleField.addEventListener('input', validateModal);
            titleField.addEventListener('blur', () => {
                const title = titleField.value.trim();
                const errorDiv = this.modal.querySelector('.error-message[data-for="title"]');
                if (!title) {
                    errorDiv.textContent = VALIDATION_MESSAGES.TITLE_REQUIRED;
                    errorDiv.classList.add('visible');
                    titleField.classList.add('error');
                } else {
                    errorDiv.textContent = '';
                    errorDiv.classList.remove('visible');
                    titleField.classList.remove('error');
                }
                validateModal();
            });
        }

        if (deadlineField) {
            deadlineField.addEventListener('change', () => {
                const deadlineValue = deadlineField.value;
                const errorDiv = this.modal.querySelector('.error-message[data-for="deadline"]');
                if (deadlineValue) {
                    const deadlineDate = new Date(deadlineValue);
                    const now = new Date();
                    now.setSeconds(0, 0);
                    deadlineDate.setSeconds(0, 0);
                    if (deadlineDate < now) {
                        errorDiv.textContent = VALIDATION_MESSAGES.DEADLINE_PAST;
                        errorDiv.classList.add('visible');
                        deadlineField.classList.add('error');
                    } else {
                        errorDiv.textContent = '';
                        errorDiv.classList.remove('visible');
                        deadlineField.classList.remove('error');
                    }
                } else {
                    errorDiv.textContent = '';
                    errorDiv.classList.remove('visible');
                    deadlineField.classList.remove('error');
                }
                validateModal();
            });
        }

        validateModal();

        saveBtn.addEventListener('click', () => {
            const title = titleField?.value.trim();
            const description = this.modal.querySelector('#modal-description')?.value.trim() || '';
            const priority = this.modal.querySelector('#modal-priority')?.value;
            const deadline = deadlineField?.value || '';
            const category = this.modal.querySelector('#modal-category')?.value;
            const completed = this.modal.querySelector('#modal-completed')?.checked || false;

            let isValid = true;
            if (!title) isValid = false;
            if (deadline) {
                const deadlineDate = new Date(deadline);
                const now = new Date();
                now.setSeconds(0, 0);
                deadlineDate.setSeconds(0, 0);
                if (deadlineDate < now) isValid = false;
            }
            if (isValid && this.onSave) {
                this.onSave({
                    title,
                    description,
                    priority,
                    deadline,
                    category,
                    completed,
                    editingIndex: this.editingTaskIndex
                });
                this.modal.remove();
            } else {
                alert('Исправьте ошибки в форме');
            }
        });

        cancelBtn.addEventListener('click', () => this.modal.remove());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.modal.remove();
        });
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, (m) => {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
}