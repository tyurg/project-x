export const NAVIGATION_LINKS = [
    { title: "Профиль", href: "./profile.html" },
    { title: "Задачи", href: "./tasks.html" },
    { title: "Помощь", href: "./help.html" }
];

export const TASK_CATEGORIES = {
    work: "Работа",
    study: "Учёба",
    home: "Дом",
    other: "Прочее"
};

export const TASK_PRIORITIES = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий"
};

export const STORAGE_KEYS = {
    TASKS: "tasks",
    USER_PROFILE: "userProfile"
};

export const VALIDATION_MESSAGES = {
    TITLE_REQUIRED: "Название обязательно",
    DEADLINE_PAST: "Дедлайн не может быть в прошлом",
    FIO_REQUIRED: "Введите ФИО",
    FIO_MIN_LENGTH: "Минимум 3 символа",
    FIO_INVALID_CHARS: "Только буквы, пробелы, дефис, апостроф",
    PHONE_INVALID: "Номер должен содержать ровно 11 цифр",
    PHONE_REQUIRED: "Введите номер телефона",
    DATE_REQUIRED: "Выберите дату",
    DATE_INVALID: "Дата не может быть раньше сегодняшней",
    PHOTO_TYPE: "Файл должен быть изображением",
    PHOTO_SIZE: "Размер не более 5 МБ"
};

export const DEADLINE_WARNING_HOURS = 24;

export const API_BASE_URL = "https://randomuser.me/api/";