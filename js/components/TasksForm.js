export class TasksForm {
    constructor() {
        this.tasks = [];
        this.listContainer = null;
        this.modal = null;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.render());
        } else {
            this.render();
        }
    }

    render() {
        const wrapper = document.getElementById('wrapper');
        if (!wrapper) return;

        wrapper.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'tasks-container';

        const title = document.createElement('h3');
        title.textContent = 'Задачи';
        container.appendChild(title);

        this.listContainer = document.createElement('div');
        this.listContainer.className = 'tasks-list';
        container.appendChild(this.listContainer);

        const addBtn = document.createElement('button');
        addBtn.className = 'add-task-button';
        addBtn.textContent = '+ Добавить задачу';
        addBtn.addEventListener('click', () => this.openAddModal());
        container.appendChild(addBtn);

        wrapper.appendChild(container);
        this.loadTasks();
    }

    openAddModal() {
        if (this.modal) this.modal.remove();
        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';
        this.modal.innerHTML = `
            <div class="modal-content">
                <h3>Новая задача</h3>
                <div class="form-group">
                    <label>Название *</label>
                    <input type="text" id="modal-title" class="modal-input" placeholder="Введите название">
                    <div class="error-message" data-for="title"></div>
                </div>
                <div class="form-group">
                    <label>Приоритет</label>
                    <select id="modal-priority" class="modal-select">
                        <option value="low">Низкий</option>
                        <option value="medium" selected>Средний</option>
                        <option value="high">Высокий</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Дедлайн</label>
                    <input type="datetime-local" id="modal-deadline" class="modal-input">
                    <div class="error-message" data-for="deadline"></div>
                </div>
                <div class="form-group">
                    <label>Категория</label>
                    <select id="modal-category" class="modal-select">
                        <option value="work">Работа</option>
                        <option value="study">Учёба</option>
                        <option value="home">Дом</option>
                    </select>
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

        saveBtn.addEventListener('click', () => this.saveNewTask());
        cancelBtn.addEventListener('click', () => this.modal.remove());

        // Закрытие по клику на оверлей
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.modal.remove();
        });
    }

    saveNewTask() {
        const titleInput = this.modal.querySelector('#modal-title');
        const prioritySelect = this.modal.querySelector('#modal-priority');
        const deadlineInput = this.modal.querySelector('#modal-deadline');
        const categorySelect = this.modal.querySelector('#modal-category');

        const title = titleInput.value.trim();
        const priority = prioritySelect.value;
        const deadline = deadlineInput.value;
        const category = categorySelect.value;

        let isValid = true;

        // Валидация названия
        if (!title) {
            this.showModalError('title', 'Название обязательно');
            titleInput.classList.add('error');
            isValid = false;
        } else {
            this.clearModalError('title');
            titleInput.classList.remove('error');
        }

        // Валидация дедлайна
        if (deadline) {
            const now = new Date();
            const deadlineDate = new Date(deadline);
            if (deadlineDate < now) {
                this.showModalError('deadline', 'Дедлайн не может быть в прошлом');
                deadlineInput.classList.add('error');
                isValid = false;
            } else {
                this.clearModalError('deadline');
                deadlineInput.classList.remove('error');
            }
        } else {
            this.clearModalError('deadline');
            deadlineInput.classList.remove('error');
        }

        if (!isValid) return;

        // Создание задачи
        const newTask = {
            title,
            priority,
            deadline,
            category,
            completed: false
        };
        this.tasks.push(newTask);
        this.saveToLocalStorage();
        this.renderTasksList();
        this.modal.remove();
    }

    showModalError(field, message) {
        const errorDiv = this.modal.querySelector(`.error-message[data-for="${field}"]`);
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('visible');
        }
    }

    clearModalError(field) {
        const errorDiv = this.modal.querySelector(`.error-message[data-for="${field}"]`);
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.classList.remove('visible');
        }
    }

    renderTasksList() {
        this.listContainer.innerHTML = '';
        this.tasks.forEach((task, index) => {
            const taskDiv = this.createTaskElement(task, index);
            this.listContainer.appendChild(taskDiv);
        });
        this.updateDeadlineIndicators();
    }

    createTaskElement(task, index) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'out-task';
        if (task.completed) taskDiv.classList.add('completed');

        // Header
        const header = document.createElement('div');
        header.className = 'task-header';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            if (task.completed) taskDiv.classList.add('completed');
            else taskDiv.classList.remove('completed');
            this.saveToLocalStorage();
            this.updateDeadlineIndicators();
        });

        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.textContent = task.title;

        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-task-button';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', () => {
            this.tasks.splice(index, 1);
            this.saveToLocalStorage();
            this.renderTasksList();
        });

        header.appendChild(checkbox);
        header.appendChild(titleSpan);
        header.appendChild(deleteBtn);

        // Details
        const details = document.createElement('div');
        details.className = 'task-details';

        const priorityItem = this.createDetailItem('Приоритет:', 'span', task.priority === 'low' ? 'Низкий' : task.priority === 'medium' ? 'Средний' : 'Высокий');
        const deadlineItem = this.createDetailItem('Дедлайн:', 'span', task.deadline ? new Date(task.deadline).toLocaleString() : 'не указан');
        const categoryItem = this.createDetailItem('Категория:', 'span', task.category === 'work' ? 'Работа' : task.category === 'study' ? 'Учёба' : 'Дом');

        details.appendChild(priorityItem);
        details.appendChild(deadlineItem);
        details.appendChild(categoryItem);

        taskDiv.appendChild(header);
        taskDiv.appendChild(details);
        return taskDiv;
    }

    createDetailItem(labelText, tag, value) {
        const div = document.createElement('div');
        div.className = 'detail-item';
        const label = document.createElement('label');
        label.className = 'detail-label';
        label.textContent = labelText;
        const valSpan = document.createElement(tag);
        valSpan.className = 'detail-value';
        valSpan.textContent = value;
        div.appendChild(label);
        div.appendChild(valSpan);
        return div;
    }

    updateDeadlineIndicators() {
        const tasksElements = this.listContainer.querySelectorAll('.out-task');
        const now = new Date();

        tasksElements.forEach((taskEl, idx) => {
            const task = this.tasks[idx];
            if (!task || task.completed) return;

            taskEl.classList.remove('deadline-safe', 'deadline-warning', 'deadline-danger');
            if (!task.deadline) return;

            const deadlineDate = new Date(task.deadline);
            if (isNaN(deadlineDate.getTime())) return;

            const diffMs = deadlineDate - now;
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffMs < 0) taskEl.classList.add('deadline-danger');
            else if (diffHours <= 24) taskEl.classList.add('deadline-warning');
            else taskEl.classList.add('deadline-safe');
        });
    }

    saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('tasks');
        if (saved) {
            this.tasks = JSON.parse(saved);
        } else {
            this.tasks = [];
        }
        this.renderTasksList();
    }
}