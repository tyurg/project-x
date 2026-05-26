export class TasksForm {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        const listTasks = document.querySelector('#wrapper > div');
        const taskWrapper = document.querySelector('#template > div');

        if (!listTasks) {
            console.error('Элемент #wrapper > div не найден');
            return;
        }

        if (!taskWrapper) {
            console.error('Элемент #template > div не найден');
            return;
        }

        // Удаляем старые обработчики, чтобы избежать дублирования
        listTasks.removeEventListener('click', this.handleClick);
        listTasks.removeEventListener('change', this.handleChange);
        listTasks.removeEventListener('input', this.handleInput);

        // Обработчик кликов (добавление, удаление, переключение чекбокса)
        this.handleClick = (e) => {
            // Добавление новой задачи
            if (e.target.classList.contains('add-task-button')) {
                let newTask = taskWrapper.cloneNode(true);
                // Сброс значений
                const titleInput = newTask.querySelector('.task-title');
                if (titleInput) titleInput.value = '';
                const prioritySelect = newTask.querySelector('.task-priority');
                if (prioritySelect) prioritySelect.value = 'medium';
                const deadlineInput = newTask.querySelector('.task-deadline');
                if (deadlineInput) deadlineInput.value = '';
                const categorySelect = newTask.querySelector('.task-category');
                if (categorySelect) categorySelect.value = 'work';
                const checkbox = newTask.querySelector('.task-checkbox');
                if (checkbox) checkbox.checked = false;
                newTask.classList.remove('completed');

                listTasks.insertBefore(newTask, e.target);
                this.saveTasks();
            }
            // Удаление задачи
            else if (e.target.classList.contains('delete-task-button')) {
                const taskToRemove = e.target.closest('.out-task');
                if (taskToRemove && listTasks.contains(taskToRemove)) {
                    listTasks.removeChild(taskToRemove);
                    this.saveTasks();
                }
            }
            // Переключение состояния выполнения (чекбокс)
            else if (e.target.classList.contains('task-checkbox')) {
                const taskItem = e.target.closest('.out-task');
                if (taskItem) {
                    if (e.target.checked) {
                        taskItem.classList.add('completed');
                    } else {
                        taskItem.classList.remove('completed');
                    }
                    this.saveTasks();
                }
            }
        };

        // Обработчик изменений полей (select, datetime-local)
        this.handleChange = (e) => {
            if (e.target.classList.contains('task-priority') ||
                e.target.classList.contains('task-category') ||
                e.target.classList.contains('task-deadline')) {
                this.saveTasks();
            }
        };

        listTasks.addEventListener('click', this.handleClick);
        listTasks.addEventListener('change', this.handleChange);
        listTasks.addEventListener('input', this.handleInput);


        this.loadTasks();
    }

    saveTasks() {
        const listTasks = document.querySelector('#wrapper > div');
        if (!listTasks) return;

        const tasks = [];
        const taskItems = listTasks.querySelectorAll('.out-task:not(#template .out-task)');

        taskItems.forEach(task => {
            const title = task.querySelector('.task-title')?.value || '';
            const priority = task.querySelector('.task-priority')?.value || 'medium';
            const deadline = task.querySelector('.task-deadline')?.value || '';
            const category = task.querySelector('.task-category')?.value || 'work';
            const completed = task.querySelector('.task-checkbox')?.checked || false;

            tasks.push({
                title,
                priority,
                deadline,
                category,
                completed
            });
        });

        localStorage.setItem('tasks', JSON.stringify(tasks));
        console.log('Задачи сохранены');
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (!savedTasks) return;

        const tasks = JSON.parse(savedTasks);
        const listTasks = document.querySelector('#wrapper > div');
        const taskWrapper = document.querySelector('#template > div');

        if (!listTasks || !taskWrapper) return;

        // Сохраняем кнопку добавления, чтобы потом её вернуть
        const addButton = listTasks.querySelector('.add-task-button');
        listTasks.innerHTML = '';

        tasks.forEach(task => {
            let newTask = taskWrapper.cloneNode(true);

            const titleInput = newTask.querySelector('.task-title');
            if (titleInput) titleInput.value = task.title || '';

            const prioritySelect = newTask.querySelector('.task-priority');
            if (prioritySelect) prioritySelect.value = task.priority || 'medium';

            const deadlineInput = newTask.querySelector('.task-deadline');
            if (deadlineInput) deadlineInput.value = task.deadline || '';

            const categorySelect = newTask.querySelector('.task-category');
            if (categorySelect) categorySelect.value = task.category || 'work';

            const checkbox = newTask.querySelector('.task-checkbox');
            if (checkbox) checkbox.checked = task.completed || false;

            if (task.completed) {
                newTask.classList.add('completed');
            } else {
                newTask.classList.remove('completed');
            }

            listTasks.appendChild(newTask);
        });

        // Восстанавливаем кнопку добавления
        const newAddButton = document.createElement('span');
        newAddButton.className = 'add-task-button';
        newAddButton.textContent = '+ Добавить задачу';
        listTasks.appendChild(newAddButton);

        console.log('Задачи загружены');
    }
}