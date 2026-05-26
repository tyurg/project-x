import { BasePage } from './BasePage.js';
import { TasksForm } from '../components/TasksForm.js';

export class TasksPage extends BasePage {
    constructor() {
        super();
        this.tasksForm = null;
    }

    init() {
        super.init();
        this.tasksForm = new TasksForm();
    }
}