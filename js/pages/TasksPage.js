import { BasePage } from './BasePage.js';
import { TasksFilter } from '../components/TasksFilter.js';
import { TasksListView } from '../components/TasksListView.js';
import { TasksModal } from '../components/TasksModal.js';
import { ModalDialog } from '../components/ModalDialog.js';
import { STORAGE_KEYS } from '../data/Constants.js';

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
        deleteCompletedBtn.textContent = 'Удалить завершённые задачи';
        deleteCompletedBtn.addEventListener('click', () => this.deleteCompletedTasks());

        container.appendChild(addBtn);
        container.appendChild(deleteCompletedBtn);
        wrapper.appendChild(container);
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

    onTaskCheckboxChange(task, completed) {
        const originalTask = this.tasks.find(t => t.createdAt === task.createdAt);
        if (originalTask) originalTask.completed = completed;
        this.saveToLocalStorage();
        this.applyFiltersAndSort();
    }

    onTaskDelete(task) {
        const index = this.tasks.findIndex(t => t.createdAt === task.createdAt);
        if (index !== -1) this.tasks.splice(index, 1);
        this.saveToLocalStorage();
        this.applyFiltersAndSort();
    }

    deleteCompletedTasks() {
        const completedTasks = this.tasks.filter(task => task.completed);
        const count = completedTasks.length;
        if (count === 0) {
            ModalDialog.showInfo('Нет завершённых задач для удаления');
            return;
        }
        const adjective = this.getDeclensionForms(count, 'завершённую', 'завершённые', 'завершённых');
        const noun = this.getDeclensionForms(count, 'задачу', 'задачи', 'задач');
        const message = `Вы уверены, что хотите удалить ${count} ${adjective} ${noun}?`;
        ModalDialog.showConfirm(message).then((confirmed) => {
            if (confirmed) {
                this.tasks = this.tasks.filter(task => !task.completed);
                this.saveToLocalStorage();
                this.applyFiltersAndSort();
            }
        });
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
        const originalIndex = this.tasks.findIndex(t => t.createdAt === task.createdAt);
        if (originalIndex === -1) return;
        const taskData = { ...this.tasks[originalIndex], editingIndex: originalIndex };
        const modal = new TasksModal((result) => this.saveTaskFromModal(result));
        modal.show(taskData);
    }

    saveTaskFromModal(result) {
        const { title, description, priority, deadline, category, completed, editingIndex } = result;
        const taskData = {
            title, description, priority, deadline, category, completed,
            createdAt: null
        };
        if (editingIndex !== null && this.tasks[editingIndex]) {
            taskData.createdAt = this.tasks[editingIndex].createdAt;
            this.tasks[editingIndex] = taskData;
        } else {
            taskData.createdAt = Date.now();
            this.tasks.push(taskData);
        }
        this.saveToLocalStorage();
        this.applyFiltersAndSort();
    }

    saveToLocalStorage() {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
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

    handleUserChange() {
        this.tasks = [];
        this.saveToLocalStorage();
        this.applyFiltersAndSort();
    }
}