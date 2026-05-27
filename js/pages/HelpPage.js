import { BasePage } from './BasePage.js';
import { ContactForm } from '../components/ContactForm.js';

export class HelpPage extends BasePage {
    constructor() {
        super();
        this.contactForm = null;
    }

    init() {
        super.init();
        this.renderHelpContent();
        this.initContactForm();
    }

    renderHelpContent() {
        const container = document.querySelector('.container');
        if (!container) {
            console.error('Контейнер .container не найден на странице Help');
            return;
        }

        container.innerHTML = `
            <div class="help-container">
                <div class="help-info">
                    <h2>Инструкция по эксплуатации сайта</h2>
                    <div class="help-section">
                        <h3>Управление задачами</h3>
                        <ul>
                            <li><strong>Добавление задачи:</strong> нажмите кнопку «+ Добавить задачу», заполните поля в модальном окне и сохраните.</li>
                            <li><strong>Редактирование:</strong> нажмите на значок карандаша (✎) у задачи, измените данные и сохраните.</li>
                            <li><strong>Выполнение:</strong> отметьте галочкой задачу, и она будет зачёркнута и перемещена в завершённые при фильтрации.</li>
                            <li><strong>Удаление:</strong> нажмите на крестик (×), чтобы удалить одну задачу, или используйте кнопку «Удалить выполненные задачи».</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h3>Фильтрация и сортировка</h3>
                        <ul>
                            <li><strong>Поиск:</strong> ищет по названию, описанию и категории (работа, учёба, дом, прочее).</li>
                            <li><strong>Приоритет:</strong> отображает только задачи выбранного приоритета.</li>
                            <li><strong>Статус:</strong> показывает все / активные / завершённые задачи.</li>
                            <li><strong>Сортировка:</strong> по дедлайну (сначала ближайшие), по приоритету (сначала важные) или по дате добавления.</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h3>Цветовая маркировка дедлайнов</h3>
                        <ul>
                            <li><span class="deadline-badge deadline-safe-demo"></span> Зелёная полоска – до дедлайна больше 24 часов.</li>
                            <li><span class="deadline-badge deadline-warning-demo"></span> Жёлтая полоска – до дедлайна менее 24 часов.</li>
                            <li><span class="deadline-badge deadline-danger-demo"></span> Красная полоска – дедлайн уже прошёл, задача просрочена.</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h3>Профиль пользователя</h3>
                        <ul>
                            <li>При первом запуске автоматически загружается случайный профиль с randomuser.me.</li>
                            <li>Вы можете сменить пользователя на странице «Профиль» – задачи при этом сбрасываются.</li>
                            <li>Кликните на аватар в шапке для быстрого перехода в профиль.</li>
                        </ul>
                    </div>
                </div>
                <div id="contact-form-container"></div>
            </div>
        `;
    }

    initContactForm() {
        const formContainer = document.getElementById('contact-form-container');
        if (formContainer) {
            this.contactForm = new ContactForm('contact-form-container');
            this.contactForm.render();
        } else {
            console.error('Контейнер contact-form-container не найден');
        }
    }
}