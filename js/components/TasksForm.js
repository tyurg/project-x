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

        listTasks.removeEventListener('click', this.handleClick);
        listTasks.removeEventListener('change', this.handleChange);
        listTasks.removeEventListener('input', this.handleInput);

        this.handleClick = (e) => {
            if (e.target.classList.contains('add-task-button')) {
                let newTask = taskWrapper.cloneNode(true);
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
                this.updateDeadlineIndicators();
            }
            else if (e.target.classList.contains('delete-task-button')) {
                const taskToRemove = e.target.closest('.out-task');
                if (taskToRemove && listTasks.contains(taskToRemove)) {
                    listTasks.removeChild(taskToRemove);
                    this.saveTasks();
                }
            }
            else if (e.target.classList.contains('task-checkbox')) {
                const taskItem = e.target.closest('.out-task');
                if (taskItem) {
                    if (e.target.checked) {
                        taskItem.classList.add('completed');
                    } else {
                        taskItem.classList.remove('completed');
                    }
                    this.saveTasks();
                    this.updateDeadlineIndicators();
                }
            }
        };

        this.handleChange = (e) => {
            if (e.target.classList.contains('task-priority') ||
                e.target.classList.contains('task-category') ||
                e.target.classList.contains('task-deadline')) {
                this.saveTasks();
                if (e.target.classList.contains('task-deadline')) {
                    this.updateDeadlineIndicators();
                }
            }
        };

        this.handleInput = (e) => {
            if (e.target.classList.contains('task-title')) {
                this.saveTasks();
            }
        };

        listTasks.addEventListener('click', this.handleClick);
        listTasks.addEventListener('change', this.handleChange);
        listTasks.addEventListener('input', this.handleInput);

        this.loadTasks();
    }

    updateDeadlineIndicators() {
        const tasks = document.querySelectorAll('#wrapper .out-task:not(#template .out-task)');
        const now = new Date();

        tasks.forEach(task => {
            const deadlineInput = task.querySelector('.task-deadline');
            const checkbox = task.querySelector('.task-checkbox');
            const isCompleted = checkbox ? checkbox.checked : false;

            task.classList.remove('deadline-safe', 'deadline-warning', 'deadline-danger');

            if (isCompleted) return;

            const deadlineValue = deadlineInput?.value;
            if (!deadlineValue) return;

            const deadlineDate = new Date(deadlineValue);
            if (isNaN(deadlineDate.getTime())) return;

            const diffMs = deadlineDate - now;
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffMs < 0) {
                task.classList.add('deadline-danger');
            } else if (diffHours <= 24) {
                task.classList.add('deadline-warning');
            } else {
                task.classList.add('deadline-safe');
            }
        });
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

        const newAddButton = document.createElement('span');
        newAddButton.className = 'add-task-button';
        newAddButton.textContent = '+ Добавить задачу';
        listTasks.appendChild(newAddButton);

        this.updateDeadlineIndicators();
        console.log('Задачи загружены');
    }
}