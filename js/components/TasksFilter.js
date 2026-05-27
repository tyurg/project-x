export class TasksFilter {
    constructor(tasks = []) {
        this.tasks = tasks;
    }

    setTasks(tasks) {
        this.tasks = tasks;
    }

    filterAndSort({ searchText, priority, status, sortType }) {
        let result = [...this.tasks];

        if (searchText && searchText.trim()) {
            const lowerSearch = searchText.toLowerCase();
            result = result.filter(task => {
                const categoryText = task.category === 'work' ? 'работа' :
                                     task.category === 'study' ? 'учёба' : 'дом';
                return (task.title && task.title.toLowerCase().includes(lowerSearch)) ||
                       (task.description && task.description.toLowerCase().includes(lowerSearch)) ||
                       categoryText.includes(lowerSearch);
            });
        }

        if (priority && priority !== 'all') {
            result = result.filter(task => task.priority === priority);
        }

        if (status === 'active') {
            result = result.filter(task => !task.completed);
        } else if (status === 'completed') {
            result = result.filter(task => task.completed);
        }

        switch (sortType) {
            case 'deadline_asc':
                result.sort((a, b) => {
                    if (!a.deadline && !b.deadline) return 0;
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                });
                break;
            case 'priority_desc':
                const order = { high: 3, medium: 2, low: 1 };
                result.sort((a, b) => order[b.priority] - order[a.priority]);
                break;
            case 'date_desc':
                result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                break;
            default:
                break;
        }

        return result;
    }
}