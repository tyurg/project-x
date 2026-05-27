import { TasksFilter } from './TasksFilter.js';

export class TasksForm {
    constructor() {
        this.tasks = [];
        this.filteredTasks = [];
        this.listContainer = null;
        this.modal = null;
        this.filter = null;
        this.editingTaskIndex = null;

        this.searchInput = null;
        this.priorityFilter = null;
        this.statusFilter = null;
        this.sortSelect = null;

        window.addEventListener('userChanged', () => {
            this.handleUserChange();
        });

        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.render());
        } else {
            this.render();
        }
    }

    handleUserChange() {
        this.tasks = [];
        this.saveToLocalStorage();
        this.applyFiltersAndSort();
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

        const filterPanel = this.createFilterPanel();
        container.appendChild(filterPanel);

        this.listContainer = document.createElement('div');
        this.listContainer.className = 'tasks-list';
        container.appendChild(this.listContainer);

        const addBtn = document.createElement('button');
        addBtn.className = 'add-task-button';
        addBtn.textContent = '+ Добавить задачу';
        addBtn.addEventListener('click', () => this.openAddModal());
        container.appendChild(addBtn);

        const deleteCompletedBtn = document.createElement('button');
        deleteCompletedBtn.className = 'delete-completed-button';
        deleteCompletedBtn.textContent = 'Удалить выполненные задачи';
        deleteCompletedBtn.addEventListener('click', () => this.deleteCompletedTasks());
        container.appendChild(deleteCompletedBtn);

        wrapper.appendChild(container);
        this.loadTasks();
    }

    deleteCompletedTasks() {
        const completedTasks = this.tasks.filter(task => task.completed);
        if (completedTasks.length === 0) {
            alert('Нет выполненных задач для удаления');
            return;
        }
        if (confirm(`Вы уверены, что хотите удалить ${completedTasks.length} выполненных задач?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveToLocalStorage();
            this.applyFiltersAndSort();
        }
    }

    createFilterPanel() {
        const panel = document.createElement('div');
        panel.className = 'filter-panel';

        const searchGroup = document.createElement('div');
        searchGroup.className = 'filter-group';
        const searchLabel = document.createElement('label');
        searchLabel.textContent = 'Поиск:';
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.placeholder = 'Название, описание, категория...';
        this.searchInput.className = 'filter-input';
        this.searchInput.addEventListener('input', () => this.applyFiltersAndSort());
        searchGroup.appendChild(searchLabel);
        searchGroup.appendChild(this.searchInput);
        panel.appendChild(searchGroup);

        const priorityGroup = document.createElement('div');
        priorityGroup.className = 'filter-group';
        const priorityLabel = document.createElement('label');
        priorityLabel.textContent = 'Приоритет:';
        this.priorityFilter = document.createElement('select');
        this.priorityFilter.className = 'filter-select';
        this.priorityFilter.innerHTML = `
            <option value="all">Все</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
        `;
        this.priorityFilter.addEventListener('change', () => this.applyFiltersAndSort());
        priorityGroup.appendChild(priorityLabel);
        priorityGroup.appendChild(this.priorityFilter);
        panel.appendChild(priorityGroup);

        const statusGroup = document.createElement('div');
        statusGroup.className = 'filter-group';
        const statusLabel = document.createElement('label');
        statusLabel.textContent = 'Статус:';
        this.statusFilter = document.createElement('select');
        this.statusFilter.className = 'filter-select';
        this.statusFilter.innerHTML = `
            <option value="all">Все</option>
            <option value="active">Активные</option>
            <option value="completed">Завершённые</option>
        `;
        this.statusFilter.addEventListener('change', () => this.applyFiltersAndSort());
        statusGroup.appendChild(statusLabel);
        statusGroup.appendChild(this.statusFilter);
        panel.appendChild(statusGroup);

        const sortGroup = document.createElement('div');
        sortGroup.className = 'filter-group';
        const sortLabel = document.createElement('label');
        sortLabel.textContent = 'Сортировать:';
        this.sortSelect = document.createElement('select');
        this.sortSelect.className = 'filter-select';
        this.sortSelect.innerHTML = `
            <option value="deadline_asc">По дедлайну (сначала ближайшие)</option>
            <option value="priority_desc">По приоритету (сначала важные)</option>
            <option value="date_desc">По дате добавления (сначала новые)</option>
        `;
        this.sortSelect.addEventListener('change', () => this.applyFiltersAndSort());
        sortGroup.appendChild(sortLabel);
        sortGroup.appendChild(this.sortSelect);
        panel.appendChild(sortGroup);

        return panel;
    }

    applyFiltersAndSort() {
        if (!this.filter) {
            this.filter = new TasksFilter(this.tasks);
        } else {
            this.filter.setTasks(this.tasks);
        }

        this.filteredTasks = this.filter.filterAndSort({
            searchText: this.searchInput?.value || '',
            priority: this.priorityFilter?.value || 'all',
            status: this.statusFilter?.value || 'all',
            sortType: this.sortSelect?.value || 'deadline_asc'
        });

        this.renderTasksList();
    }

    renderTasksList() {
        if (!this.listContainer) return;
        this.listContainer.innerHTML = '';
        this.filteredTasks.forEach((task, idx) => {
            const taskDiv = this.createTaskElement(task, idx);
            this.listContainer.appendChild(taskDiv);
        });
        this.updateDeadlineIndicators();
    }

    createTaskElement(task, displayIndex) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'out-task';
        if (task.completed) taskDiv.classList.add('completed');

        const header = document.createElement('div');
        header.className = 'task-header';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            this.saveToLocalStorage();
            this.applyFiltersAndSort();
            this.updateDeadlineIndicators();
        });

        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.textContent = task.title;

        const editBtn = document.createElement('span');
        editBtn.className = 'edit-task-button';
        editBtn.textContent = '✎';
        editBtn.title = 'Редактировать задачу';
        editBtn.addEventListener('click', () => this.openEditModal(task, displayIndex));

        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-task-button';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', () => {
            const originalIndex = this.tasks.findIndex(t => t.createdAt === task.createdAt);
            if (originalIndex !== -1) this.tasks.splice(originalIndex, 1);
            this.saveToLocalStorage();
            this.applyFiltersAndSort();
        });

        header.appendChild(checkbox);
        header.appendChild(titleSpan);
        header.appendChild(editBtn);
        header.appendChild(deleteBtn);

        const details = document.createElement('div');
        details.className = 'task-details';

        const priorityItem = this.createDetailItem('Приоритет:', 'span',
            task.priority === 'low' ? 'Низкий' : task.priority === 'medium' ? 'Средний' : 'Высокий');
        const deadlineItem = this.createDetailItem('Дедлайн:', 'span',
            task.deadline ? new Date(task.deadline).toLocaleString() : 'не указан');
        const categoryItem = this.createDetailItem('Категория:', 'span',
            task.category === 'work' ? 'Работа' : task.category === 'study' ? 'Учёба' : 'Дом');
        if (task.description) {
            const descItem = this.createDetailItem('Описание:', 'span', task.description);
            details.appendChild(descItem);
        }

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
        const now = new Date();
        const tasksElements = this.listContainer.querySelectorAll('.out-task');
        tasksElements.forEach((taskEl, idx) => {
            const task = this.filteredTasks[idx];
            if (!task || task.completed) {
                taskEl.classList.remove('deadline-safe', 'deadline-warning', 'deadline-danger');
                return;
            }
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

    openAddModal() {
        this.editingTaskIndex = null;
        this.showModal(null);
    }

    openEditModal(task, filteredIndex) {
        const originalIndex = this.tasks.findIndex(t => t.createdAt === task.createdAt);
        if (originalIndex === -1) return;
        this.editingTaskIndex = originalIndex;
        this.showModal(this.tasks[originalIndex]);
    }

    showModal(taskData) {
        if (this.modal) this.modal.remove();

        const isEdit = taskData !== null;

        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';
        this.modal.innerHTML = `
            <div class="modal-content">
                <h3>${isEdit ? 'Редактировать задачу' : 'Новая задача'}</h3>
                <div class="form-group">
                    <label>Название *</label>
                    <input type="text" id="modal-title" class="modal-input" placeholder="Введите название" value="${this.escapeHtml(isEdit ? taskData.title : '')}">
                    <div class="error-message" data-for="title"></div>
                </div>
                <div class="form-group">
                    <label>Описание (необязательно)</label>
                    <textarea id="modal-description" class="modal-input" rows="3" placeholder="Введите описание">${this.escapeHtml(isEdit ? taskData.description || '' : '')}</textarea>
                </div>
                <div class="form-group">
                    <label>Приоритет</label>
                    <select id="modal-priority" class="modal-select">
                        <option value="low" ${isEdit && taskData.priority === 'low' ? 'selected' : ''}>Низкий</option>
                        <option value="medium" ${isEdit && taskData.priority === 'medium' ? 'selected' : ''}>Средний</option>
                        <option value="high" ${isEdit && taskData.priority === 'high' ? 'selected' : ''}>Высокий</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Дедлайн</label>
                    <input type="datetime-local" id="modal-deadline" class="modal-input" value="${isEdit && taskData.deadline ? taskData.deadline : ''}">
                    <div class="error-message" data-for="deadline"></div>
                </div>
                <div class="form-group">
                    <label>Категория</label>
                    <select id="modal-category" class="modal-select">
                        <option value="work" ${isEdit && taskData.category === 'work' ? 'selected' : ''}>Работа</option>
                        <option value="study" ${isEdit && taskData.category === 'study' ? 'selected' : ''}>Учёба</option>
                        <option value="home" ${isEdit && taskData.category === 'home' ? 'selected' : ''}>Дом</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="modal-completed" ${isEdit && taskData.completed ? 'checked' : ''}> Выполнено
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
        saveBtn.addEventListener('click', () => this.saveTaskFromModal());
        cancelBtn.addEventListener('click', () => this.modal.remove());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.modal.remove();
        });
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    saveTaskFromModal() {
        const titleInput = this.modal.querySelector('#modal-title');
        const descriptionInput = this.modal.querySelector('#modal-description');
        const prioritySelect = this.modal.querySelector('#modal-priority');
        const deadlineInput = this.modal.querySelector('#modal-deadline');
        const categorySelect = this.modal.querySelector('#modal-category');
        const completedCheckbox = this.modal.querySelector('#modal-completed');

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const priority = prioritySelect.value;
        const deadlineValue = deadlineInput.value;
        const category = categorySelect.value;
        const completed = completedCheckbox.checked;

        let isValid = true;

        if (!title) {
            this.showModalError('title', 'Название обязательно');
            titleInput.classList.add('error');
            isValid = false;
        } else {
            this.clearModalError('title');
            titleInput.classList.remove('error');
        }

        if (deadlineValue) {
            const deadlineDate = new Date(deadlineValue);
            const now = new Date();
            now.setSeconds(0, 0);
            deadlineDate.setSeconds(0, 0);
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

        const taskData = {
            title,
            description,
            priority,
            deadline: deadlineValue,
            category,
            completed,
            createdAt: null
        };

        if (this.editingTaskIndex !== null) {
            taskData.createdAt = this.tasks[this.editingTaskIndex].createdAt;
            this.tasks[this.editingTaskIndex] = taskData;
        } else {
            taskData.createdAt = Date.now();
            this.tasks.push(taskData);
        }

        this.saveToLocalStorage();
        this.applyFiltersAndSort();
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

    saveToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem('tasks');
        if (saved) {
            this.tasks = JSON.parse(saved);
            this.tasks.forEach((task, idx) => {
                if (!task.createdAt) task.createdAt = Date.now() - idx * 1000;
                if (!task.description) task.description = '';
            });
        } else {
            this.tasks = [];
        }
        this.applyFiltersAndSort();
    }
}