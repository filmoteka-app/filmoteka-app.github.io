const IFRAME_SRC = (filmId) => `https://ddbb.lol/?id=${filmId}&n=0`;

const API_KEYS = [
    '5bd42146-7679-4016-b124-f278ca89ea1b',
    '16ce9175-1b36-42a3-be22-9397bb20bdd0',
    '8e4b3214-1071-45b5-9e67-e31e97a6b1ec',
    'c1a6a8db-e613-41bb-a103-b624b3204787'
];

const API_ENDPOINTS = {
    SEARCH: 'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword',
    TOP: 'https://kinopoiskapiunofficial.tech/api/v2.2/films/top',
    SIMILAR: filmId => `https://kinopoiskapiunofficial.tech/api/v2.2/films/${filmId}/similars`,
    DETAILS: filmId => `https://kinopoiskapiunofficial.tech/api/v2.2/films/${filmId}`
};

const ROUTES = {
    HOME: '/',
    SEARCH: '/search',
    MOVIE: '/movie',
    HISTORY: '/history',
    SIMILAR: '/similar'
};

const CONFIG = {
    HISTORY: {
        STORAGE_KEY: 'filmoteka_history',
        MAX_SIZE: 10
    },
    PAGINATION: {
        FILMS_PER_PAGE: 6,
        TOTAL_FILMS: 250
    },
    API: {
        RETRY_ATTEMPTS: API_KEYS.length,
        TIMEOUT: 10000
    },
    SIMILAR: {
        MAX_FILMS: 10
    }
};

const TEXTS = {
    APP: {
        TITLE: 'Фильмотека',
        SUBTITLE: 'Фильмотека — это стриминговый сервис, позволяющий смотреть любимые фильмы и сериалы в любое время и в любом месте',
        PLACEHOLDER: 'Найти фильм или сериал...',
        SEARCH_BTN: 'Поиск',
        BACK_BTN: 'На главную',
        HISTORY_BTN: 'История',
        HISTORY_BTN_CLEAR: 'Очистить',
        PAGINATION_INFO: 'progress-bar',
        FOOTER_TITLE: 'Фильмотека 2025 (AI experiment)',
        FOOTER_TEXT: 'Данный проект является некоммерческим экспериментом, созданным в образовательных целях при помощи AI инструментов. Все материалы предоставляются через открытые API и агрегаторы видеосервисов.',
        FOOTER_CREDIT: 'Assembled by <a href="https://free-gen.github.io" target="_blank" class="footer__link">FREEGEN</a>'
    },
    NAV: {
        RECOMMENDATIONS_TITLE: 'Рекомендации',
        RECOMMENDATIONS_SUBTITLE: 'Лучшие фильмы всех времен',
        SEARCH_RESULTS_TITLE: 'Результаты поиска',
        SEARCH_RESULTS_SUBTITLE: q => `По запросу: "${q}"`,
        SIMILAR_TITLE: t => t,
        SIMILAR_SUBTITLE: 'Похожие фильмы:',
        HISTORY_TITLE: 'История просмотров',
        HISTORY_SUBTITLE: 'Фильмы и сериалы, которые вы смотрели'
    },
    ERRORS: {
        SEARCH: 'Ошибка поиска.<br>Превышен суточный лимит API-запросов.',
        RECOMMENDATIONS_LOAD: 'Ошибка при загрузке рекомендаций.<br>Превышен суточный лимит API-запросов.',
        SIMILAR_LOAD: 'Ошибка при загрузке похожих фильмов.<br>Превышен суточный лимит API-запросов.',
        NOT_FOUND: 'Ничего не найдено',
        SIMILAR_NOT_FOUND: 'Похожие фильмы не найдены',
        HISTORY_EMPTY: 'История просмотров пуста',
        API_UNAVAILABLE: 'Все API-ключи недоступны'
    },
    BUTTONS: {
        SIMILAR: 'Похожие',
        WATCH: 'Смотреть',
        CLEAR_HISTORY: 'Очистить историю'
    },
    META: {
        FILM: 'Фильм',
        SERIES: 'Сериал'
    },
    RATING_LABEL: 'Рейтинг:'
};

export { IFRAME_SRC, API_KEYS, TEXTS, API_ENDPOINTS, CONFIG, ROUTES };