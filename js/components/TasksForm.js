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
        
        this.handleClick = (e) => {

            if (e.target.classList.contains('add-task-button')) {
                let newTask = taskWrapper.cloneNode(true);

                const input = newTask.querySelector('input');
                if (input) input.value = '';
                listTasks.insertBefore(newTask, e.target);
            }

            else if (e.target.classList.contains('delete-task-button')) {
                const taskToRemove = e.target.closest('.out-task');
                if (taskToRemove && listTasks.contains(taskToRemove)) {
                    listTasks.removeChild(taskToRemove);
                }
            }
        };

        listTasks.addEventListener('click', this.handleClick);
    }
}