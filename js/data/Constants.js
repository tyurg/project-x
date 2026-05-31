export const NAVIGATION_LINKS = [
    { title: "Профиль", href: "./profile.html" },
    { title: "Задачи", href: "./index.html" },
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
    FIO_INVALID_CHARS: "ФИО должно состоять из русских букв",
    PHONE_REQUIRED: "Введите номер телефона",
    PHONE_INVALID: "Номер должен содержать ровно 11 цифр",
    PHONE_START_ERROR: "Номер должен начинаться c 8",
    DATE_REQUIRED: "Выберите дату",
    DATE_INVALID: "Дата не может быть раньше сегодняшней",
    PHOTO_TYPE: "Файл должен быть изображением",
    PHOTO_SIZE: "Размер не более 5 МБ"
};

export const DEADLINE_WARNING_HOURS = 24;

export const API_BASE_URL = "https://randomuser.me/api/";