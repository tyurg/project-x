import { TASK_PRIORITIES, TASK_CATEGORIES } from '../data/Constants.js';

export class TasksListView {
    constructor(container, onCheckboxChange, onEdit, onDelete) {
        this.container = container;
        this.onCheckboxChange = onCheckboxChange;
        this.onEdit = onEdit;
        this.onDelete = onDelete;
    }

    renderTasks(tasks, totalTasksCount) {
        this.container.innerHTML = '';
        
        if (tasks.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-tasks-message';
            
            if (totalTasksCount === 0) {
                emptyMessage.innerHTML = 'У вас пока нет задач';
            } else {
                emptyMessage.innerHTML = 'Задачи не найдены';
            }
            
            this.container.appendChild(emptyMessage);
            return;
        }

        tasks.forEach((task, idx) => {
            const taskEl = this.createTaskElement(task, idx);
            this.container.appendChild(taskEl);
        });
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
        checkbox.name = `task-completed-${task.createdAt || displayIndex}`;
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            if (this.onCheckboxChange) this.onCheckboxChange(task, checkbox.checked);
        });

        const titleSpan = document.createElement('span');
        titleSpan.className = 'task-title';
        titleSpan.textContent = task.title;

        const editBtn = document.createElement('span');
        editBtn.className = 'edit-task-button';
        editBtn.textContent = '✎';
        editBtn.title = 'Редактировать задачу';
        editBtn.addEventListener('click', () => {
            if (this.onEdit) this.onEdit(task);
        });

        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-task-button';
        deleteBtn.textContent = 'x';
        deleteBtn.addEventListener('click', () => {
            this.removeTaskWithAnimation(taskDiv, () => {
                if (this.onDelete) this.onDelete(task);
            });
        });

        header.appendChild(checkbox);
        header.appendChild(titleSpan);
        header.appendChild(editBtn);
        header.appendChild(deleteBtn);

        const details = document.createElement('div');
        details.className = 'task-details';

        const priorityItem = this.createDetailItem(
            'Приоритет:', 
            'span', 
            TASK_PRIORITIES[task.priority] || 'Неизвестно',
            `priority-value-${task.priority}`
        );
        const deadlineItem = this.createDetailItem('Дедлайн:', 'span',
            task.deadline ? new Date(task.deadline).toLocaleString() : 'не указан');
        const categoryItem = this.createDetailItem('Категория:', 'span',
            TASK_CATEGORIES[task.category] || 'Прочее');

        details.appendChild(priorityItem);
        details.appendChild(deadlineItem);
        details.appendChild(categoryItem);

        if (task.description) {
            const descItem = this.createDetailItem('Описание:', 'span', task.description);
            details.appendChild(descItem);
        }

        taskDiv.appendChild(header);
        taskDiv.appendChild(details);
        return taskDiv;
    }

    removeTaskWithAnimation(taskElement, callback) {
        taskElement.classList.add('removing');
        setTimeout(() => {
            if (callback) callback();
        }, 200);
    }

    createDetailItem(labelText, tag, value, extraClass = '') {
        const div = document.createElement('div');
        div.className = 'detail-item';
        const labelSpan = document.createElement('span');
        labelSpan.className = 'detail-label';
        labelSpan.textContent = labelText;
        const valSpan = document.createElement(tag);
        valSpan.className = 'detail-value';
        if (extraClass) {
            valSpan.classList.add(extraClass);
        }
        valSpan.textContent = value;
        div.appendChild(labelSpan);
        div.appendChild(valSpan);
        return div;
    }

    updateDeadlineIndicators(tasks) {
        const now = new Date();
        const taskElements = this.container.querySelectorAll('.out-task');
        taskElements.forEach((taskEl, idx) => {
            const task = tasks[idx];
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
}