import { BasePage } from './BasePage.js';
import { TasksFilter } from '../components/TasksFilter.js';
import { TasksListView } from '../components/TasksListView.js';
import { TasksModal } from '../components/TasksModal.js';
import { ModalDialog } from '../components/ModalDialog.js';
import { API_BASE_URL } from '../data/Constants.js';
import { UserService } from '../services/UserService.js';

export class TasksPage extends BasePage {
    constructor() {
        super();
        this.tasks = [];
        this.filteredTasks = [];
        this.filter = null;
        this.listView = null;
        this.searchInput = null;
        this.priorityFilter = null;
        this.statusFilter = null;
        this.sortSelect = null;

        window.addEventListener('userChanged', () => this.handleUserChange());
    }

    init() {
        super.init();
        this.render();
        this.loadTasks();
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

        const listContainer = document.createElement('div');
        listContainer.className = 'tasks-list';
        container.appendChild(listContainer);

        this.listView = new TasksListView(
            listContainer,
            (task, completed) => this.onTaskCheckboxChange(task, completed),
            (task) => this.openEditModal(task),
            (task) => this.onTaskDelete(task)
        );

        const addBtn = document.createElement('button');
        addBtn.className = 'add-task-button';
        addBtn.textContent = '+ Добавить задачу';
        addBtn.addEventListener('click', () => this.openAddModal());

        const deleteCompletedBtn = document.createElement('button');
        deleteCompletedBtn.className = 'delete-completed-button';
        deleteCompletedBtn.textContent = 'Удалить выполненные задачи';
        deleteCompletedBtn.addEventListener('click', () => this.deleteCompletedTasks());

        container.appendChild(addBtn);
        container.appendChild(deleteCompletedBtn);
        wrapper.appendChild(container);
    }

    createFilterPanel() {
        // ... (без изменений, как было в оригинале)
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
        searchGroup.append(searchLabel, this.searchInput);
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
        priorityGroup.append(priorityLabel, this.priorityFilter);
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
        statusGroup.append(statusLabel, this.statusFilter);
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
        sortGroup.append(sortLabel, this.sortSelect);
        panel.appendChild(sortGroup);

        return panel;
    }

    applyFiltersAndSort() {
        if (!this.filter) this.filter = new TasksFilter(this.tasks);
        else this.filter.setTasks(this.tasks);
        this.filteredTasks = this.filter.filterAndSort({
            searchText: this.searchInput?.value || '',
            priority: this.priorityFilter?.value || 'all',
            status: this.statusFilter?.value || 'all',
            sortType: this.sortSelect?.value || 'deadline_asc'
        });
        this.renderTasksList();
    }

    renderTasksList() {
        if (!this.listView) return;
        this.listView.renderTasks(this.filteredTasks, this.tasks.length);
        this.listView.updateDeadlineIndicators(this.filteredTasks);
    }

    async onTaskCheckboxChange(task, completed) {
        const token = UserService.getToken();
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ...task, completed })
            });
            if (!response.ok) throw new Error('Failed to update');
            const updated = await response.json();
            const index = this.tasks.findIndex(t => t.id === updated.id);
            if (index !== -1) this.tasks[index] = updated;
            this.applyFiltersAndSort();
        } catch (err) {
            console.error(err);
            await ModalDialog.showInfo('Ошибка обновления задачи', 'Ошибка');
        }
    }

    async onTaskDelete(task) {
        const token = UserService.getToken();
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete');
            this.tasks = this.tasks.filter(t => t.id !== task.id);
            this.applyFiltersAndSort();
        } catch (err) {
            console.error(err);
            await ModalDialog.showInfo('Ошибка удаления задачи', 'Ошибка');
        }
    }

    async deleteCompletedTasks() {
        const completedTasks = this.tasks.filter(task => task.completed);
        const count = completedTasks.length;
        if (count === 0) {
            ModalDialog.showInfo('Нет завершённых задач для удаления');
            return;
        }
        const adjective = this.getDeclensionForms(count, 'завершённую', 'завершённые', 'завершённых');
        const noun = this.getDeclensionForms(count, 'задачу', 'задачи', 'задач');
        const message = `Вы уверены, что хотите удалить ${count} ${adjective} ${noun}?`;
        const confirmed = await ModalDialog.showConfirm(message);
        if (!confirmed) return;

        // 1. Находим DOM-элементы завершённых задач
        const taskElements = document.querySelectorAll('.out-task');
        const completedElements = Array.from(taskElements).filter(el => {
            // Ищем задачу по id или по тексту заголовка – лучше по id
            const taskId = parseInt(el.getAttribute('data-task-id'));
            return completedTasks.some(task => task.id === taskId);
        });

        // Если по какой-то причине не нашли элементы, удаляем без анимации
        if (completedElements.length === 0) {
            await this._deleteCompletedTasksFromServer(completedTasks);
            return;
        }

        // 2. Добавляем анимацию
        let animationsCompleted = 0;
        const onAnimationEnd = () => {
            animationsCompleted++;
            if (animationsCompleted === completedElements.length) {
                // 3. После анимации удаляем с сервера
                this._deleteCompletedTasksFromServer(completedTasks);
            }
        };

        completedElements.forEach(el => {
            el.addEventListener('transitionend', onAnimationEnd, { once: true });
            el.classList.add('removing');
        });

        // Fallback на случай, если transitionend не сработает (например, нет перехода)
        setTimeout(() => {
            if (animationsCompleted !== completedElements.length) {
                this._deleteCompletedTasksFromServer(completedTasks);
            }
        }, 250);
    }

    // Выносим логику удаления в отдельный метод, чтобы не дублировать
    async _deleteCompletedTasksFromServer(completedTasks) {
        const token = UserService.getToken();
        if (!token) return;
        for (const task of completedTasks) {
            await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
        this.tasks = this.tasks.filter(task => !task.completed);
        this.applyFiltersAndSort();
    }

    getDeclensionForms(number, oneForm, twoForm, fiveForm) {
        const n = Math.abs(number) % 100;
        if (n >= 11 && n <= 19) return fiveForm;
        const lastDigit = n % 10;
        if (lastDigit === 1) return oneForm;
        if (lastDigit >= 2 && lastDigit <= 4) return twoForm;
        return fiveForm;
    }

    openAddModal() {
        const modal = new TasksModal((result) => this.saveTaskFromModal(result));
        modal.show(null);
    }

    openEditModal(task) {
        const taskData = { ...task, editingIndex: task.id };
        const modal = new TasksModal((result) => this.saveTaskFromModal(result));
        modal.show(taskData);
    }

    async saveTaskFromModal(result) {
        const { title, description, priority, deadline, category, completed, editingIndex } = result;
        const token = UserService.getToken();
        if (!token) return;
        try {
            if (editingIndex) {
                const response = await fetch(`${API_BASE_URL}/tasks/${editingIndex}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, description, priority, deadline, category, completed })
                });
                if (!response.ok) throw new Error('Update failed');
                const updated = await response.json();
                const index = this.tasks.findIndex(t => t.id === updated.id);
                if (index !== -1) this.tasks[index] = updated;
            } else {
                const response = await fetch(`${API_BASE_URL}/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, description, priority, deadline, category, completed })
                });
                if (!response.ok) throw new Error('Create failed');
                const newTask = await response.json();
                this.tasks.push(newTask);
            }
            this.applyFiltersAndSort();
        } catch (err) {
            console.error(err);
            await ModalDialog.showInfo('Ошибка сохранения задачи', 'Ошибка');
        }
    }

    async loadTasks() {
        const token = UserService.getToken();
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to load tasks');
            this.tasks = await response.json();
            this.applyFiltersAndSort();
        } catch (err) {
            console.error(err);
            this.tasks = [];
            this.applyFiltersAndSort();
        }
    }

    handleUserChange() {
        this.loadTasks();
    }
}