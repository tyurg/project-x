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
            // Добавление новой задачи
            if (e.target.classList.contains('add-task-button')) {
                let newTask = taskWrapper.cloneNode(true);
                const input = newTask.querySelector('input');
                if (input) input.value = '';
                
                // Сбрасываем состояние чекбокса у новой задачи
                const checkbox = newTask.querySelector('.task-checkbox');
                if (checkbox) checkbox.checked = false;
                
                // Убираем класс completed у новой задачи
                newTask.classList.remove('completed');
                
                listTasks.insertBefore(newTask, e.target);
                
                // Сохраняем задачи в localStorage
                this.saveTasks();
            }
            
            // Удаление задачи
            else if (e.target.classList.contains('delete-task-button')) {
                const taskToRemove = e.target.closest('.out-task');
                if (taskToRemove && listTasks.contains(taskToRemove)) {
                    listTasks.removeChild(taskToRemove);
                    // Сохраняем задачи в localStorage
                    this.saveTasks();
                }
            }
            
            // Отметка задачи как выполненной/невыполненной
            else if (e.target.classList.contains('task-checkbox')) {
                const taskItem = e.target.closest('.out-task');
                if (taskItem) {
                    if (e.target.checked) {
                        taskItem.classList.add('completed');
                    } else {
                        taskItem.classList.remove('completed');
                    }
                    // Сохраняем задачи в localStorage
                    this.saveTasks();
                }
            }
            
            // Изменение текста задачи
            else if (e.target.classList.contains('task-input')) {
                this.saveTasks();
            }
        };
        
        listTasks.addEventListener('click', this.handleClick);
        
        // Добавляем обработчик изменения текста в полях ввода
        const inputs = listTasks.querySelectorAll('.task-input');
        inputs.forEach(input => {
            input.removeEventListener('change', this.handleInputChange);
            input.addEventListener('change', this.handleInputChange = () => this.saveTasks());
        });
        
        // Загружаем сохраненные задачи
        this.loadTasks();
    }
    
    // Сохранение задач в localStorage
    saveTasks() {
        const listTasks = document.querySelector('#wrapper > div');
        if (!listTasks) return;
        
        const tasks = [];
        const taskItems = listTasks.querySelectorAll('.out-task:not(#template .out-task)');
        
        taskItems.forEach(task => {
            const input = task.querySelector('.task-input');
            const checkbox = task.querySelector('.task-checkbox');
            if (input) {
                tasks.push({
                    text: input.value,
                    completed: checkbox ? checkbox.checked : false
                });
            }
        });
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        console.log('Задачи сохранены');
    }
    
    // Загрузка задач из localStorage
    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (!savedTasks) return;
        
        const tasks = JSON.parse(savedTasks);
        const listTasks = document.querySelector('#wrapper > div');
        const taskWrapper = document.querySelector('#template > div');
        
        if (!listTasks || !taskWrapper) return;
        
        // Очищаем текущие задачи (сохраняем только кнопку добавления)
        const addButton = listTasks.querySelector('.add-task-button');
        listTasks.innerHTML = '';
        
        // Восстанавливаем задачи
        tasks.forEach(task => {
            let newTask = taskWrapper.cloneNode(true);
            const input = newTask.querySelector('.task-input');
            const checkbox = newTask.querySelector('.task-checkbox');
            
            if (input) input.value = task.text;
            if (checkbox) checkbox.checked = task.completed;
            
            if (task.completed) {
                newTask.classList.add('completed');
            }
            
            listTasks.appendChild(newTask);
        });
        
        // Добавляем кнопку "Добавить задачу" обратно
        const newAddButton = document.createElement('span');
        newAddButton.className = 'add-task-button';
        newAddButton.textContent = 'Добавить задачу';
        listTasks.appendChild(newAddButton);
        
        console.log('Задачи загружены');
    }
}