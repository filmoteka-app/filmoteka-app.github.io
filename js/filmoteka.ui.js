import { TEXTS, CONFIG, IFRAME_SRC } from './filmoteka.constants.js';

class FilmotekaUI {
    constructor(callbacks = {}) {
        this.onSimilarClick = callbacks.onSimilarClick;
        this.onWatchClick = callbacks.onWatchClick;
        this.initializeElements();
        this.applyTexts();
        this.filmFrameContainer = null;
        this.filmFrame = null;
    }

    initializeElements() {
        this.appTitle = this.queryElement('#appTitle');
        this.appSubtitle = this.queryElement('#appSubtitle');
        this.searchInput = this.queryElement('#searchInput');
        this.searchBtn = this.queryElement('#searchBtn');
        this.navigationTitle = this.queryElement('#navigationTitle');
        this.navigationSubtitle = this.queryElement('#navigationSubtitle');
        this.backBtn = this.queryElement('#backBtn');
        this.prevPageBtn = this.queryElement('#prevPage');
        this.nextPageBtn = this.queryElement('#nextPage');
        this.historyBtn = this.queryElement('#historyBtn');
        this.clearHistoryBtn = this.queryElement('#clearHistoryBtn');
        this.paginationInfo = this.queryElement('#paginationInfo');
        this.cardsContainer = this.queryElement('#cardsContainer');
        this.footerTitle = this.queryElement('#footerTitle');
        this.footerText = this.queryElement('#footerText');
        this.footerCredit = this.queryElement('#footerCredit');

        this.progressBar = this.createElement('div', 'pagination-progress');
        this.progressBar.innerHTML = `
            <div class="pagination-progress__track">
                <div class="pagination-progress__fill" id="progressFill"></div>
            </div>
        `;

        if (this.paginationInfo) {
            this.paginationInfo.innerHTML = '';
            this.paginationInfo.appendChild(this.progressBar);
            this.progressFill = this.paginationInfo.querySelector('#progressFill');
        }
    }

    queryElement(selector, required = false) {
        const element = document.querySelector(selector);
        if (required && !element) {
            console.warn(`Element not found: ${selector}`);
        }
        return element;
    }

    createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    }

    setElementVisibility(element, isVisible) {
        if (!element) return;
        element.classList.toggle('hidden', !isVisible);
    }

    applyTexts() {
        const t = TEXTS.APP;
        if (t?.TITLE) document.title = t.TITLE;
        if (this.appTitle) this.appTitle.textContent = t.TITLE;
        if (this.appSubtitle) this.appSubtitle.textContent = t.SUBTITLE;
        if (this.searchInput) this.searchInput.placeholder = t.PLACEHOLDER;
        
        if (this.searchBtn) {
            const existingText = this.searchBtn.querySelector('.btn-text');
            if (!existingText) {
                const textSpan = this.createElement('span', 'btn-text', t.SEARCH_BTN);
                this.searchBtn.appendChild(textSpan);
            } else {
                existingText.textContent = t.SEARCH_BTN;
            }
        }
        
        if (this.backBtn) {
            const existingText = this.backBtn.querySelector('.btn-text');
            if (!existingText) {
                const textSpan = this.createElement('span', 'btn-text', t.BACK_BTN);
                this.backBtn.appendChild(textSpan);
            } else {
                existingText.textContent = t.BACK_BTN;
            }
        }
        
        if (this.historyBtn) {
            const existingText = this.historyBtn.querySelector('.btn-text');
            if (!existingText) {
                const textSpan = this.createElement('span', 'btn-text', t.HISTORY_BTN);
                this.historyBtn.appendChild(textSpan);
            } else {
                existingText.textContent = t.HISTORY_BTN;
            }
        }
        
        if (this.clearHistoryBtn) {
            const existingText = this.clearHistoryBtn.querySelector('.btn-text');
            if (!existingText) {
                const textSpan = this.createElement('span', 'btn-text', t.HISTORY_BTN_CLEAR);
                this.clearHistoryBtn.appendChild(textSpan);
            } else {
                existingText.textContent = t.HISTORY_BTN_CLEAR;
            }
        }
        
        if (this.footerTitle) this.footerTitle.textContent = t.FOOTER_TITLE;
        if (this.footerText) this.footerText.textContent = t.FOOTER_TEXT;
        if (this.footerCredit) this.footerCredit.innerHTML = t.FOOTER_CREDIT;
    }

    displayMovies(films, options = {}) {
        if (!this.cardsContainer) return;
        
        this.cardsContainer.innerHTML = '';

        if (!Array.isArray(films) || !films.length) {
            return this.showError(TEXTS.ERRORS.NOT_FOUND);
        }

        const filmElements = films.map((film, index) => 
            this.createMovieItem(film, {
                showPosition: options.showPosition,
                position: (options.startPosition || 0) + index + 1
            })
        );

        this.cardsContainer.append(...filmElements);
    }

    createMovieItem(film, options = {}) {
        const id = film.kinopoiskId || film.filmId;
        const title = film.nameRu || film.nameEn || 'Без названия';
        const year = film.year || 'Неизвестно';
        const poster = film.posterUrlPreview || film.posterUrl || '';
        const type = ['TV_SERIES', 'MINI_SERIES', 'TV_SHOW'].includes(film.type)
            ? TEXTS.META.SERIES
            : TEXTS.META.FILM;
        const rating = this.formatRating(film.rating || film.ratingKinopoisk || film.ratingImdb);
        const position = film.position || options.position;

        const template = document.getElementById('filmCardTemplate').content.cloneNode(true);
        const img = template.querySelector('.movie-card__poster');
        const meta = template.querySelector('.movie-card__meta-item');
        const ratingEl = template.querySelector('.movie-card__rating');
        const ratingValue = template.querySelector('.movie-card__rating-value');
        const titleEl = template.querySelector('.movie-card__title');
        const yearEl = template.querySelector('.movie-card__year');
        const similarBtn = template.querySelector('.movie-card__similar-btn');
        const watchBtn = template.querySelector('.movie-card__watch-btn');

        // Установка постера
        if (img) {
            if (poster) {
                img.src = poster;
                img.alt = title;
                this.setElementVisibility(img, true);
            } else {
                this.setElementVisibility(img, false);
            }
        }

        // Мета-информация
        if (meta) {
            meta.textContent = `${type} • #${position}`;
        }

        // Рейтинг
        if (rating && ratingEl && ratingValue) {
            this.setElementVisibility(ratingEl, true);
            ratingEl.textContent = `${TEXTS.RATING_LABEL} `;
            ratingValue.textContent = rating;
            ratingValue.className = 'movie-card__rating-value';
            ratingValue.classList.add(`movie-card__rating--${this.getRatingColor(rating)}`);
            ratingEl.appendChild(ratingValue);
        }

        // Заголовок и год
        if (titleEl) titleEl.textContent = title;
        if (yearEl) {
            this.setElementVisibility(yearEl, year && year !== 'Неизвестно');
            if (yearEl.textContent = year && year !== 'Неизвестно' ? `${year} год` : '');
        }

        // Кнопки
        if (similarBtn) {
            similarBtn.textContent = TEXTS.BUTTONS.SIMILAR;
            similarBtn.onclick = () => this.onSimilarClick?.(id, title);
        }
        
        if (watchBtn) {
            watchBtn.textContent = TEXTS.BUTTONS.WATCH;
            watchBtn.onclick = () => this.onWatchClick?.(id, title, year);
        }

        return template;
    }

    getRatingColor(rating) {
        const value = parseFloat(rating);
        if (value < 3) return 'low';
        if (value < 6) return 'med';
        return 'high';
    }

    formatRating(rating) {
        const num = parseFloat(rating);
        return isNaN(num) ? null : num.toFixed(1);
    }

    showNavigation(title, subtitle, showBackButton = false) {
        if (this.navigationTitle) {
            this.navigationTitle.textContent = typeof title === 'function' ? title() : title;
        }
        if (this.navigationSubtitle) {
            this.navigationSubtitle.textContent = typeof subtitle === 'function' ? subtitle() : subtitle;
        }
        this.setElementVisibility(this.backBtn, showBackButton);
    }

    showPagination(show) {
        this.setElementVisibility(this.prevPageBtn, show);
        this.setElementVisibility(this.nextPageBtn, show);
        this.setElementVisibility(this.paginationInfo, show);
    }

    showHistoryButton(show) {
        this.setElementVisibility(this.historyBtn, show);
        this.setElementVisibility(this.clearHistoryBtn, !show);
    }

    showLoading() {
        if (!this.cardsContainer) return;
        this.cardsContainer.innerHTML = `
            <div class="message message--loading">
                <svg class="spinner" viewBox="0 0 50 50">
                    <circle class="spinner__path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
            </div>`;
    }

    showError(message) {
        if (!this.cardsContainer) return;
        this.cardsContainer.innerHTML = `
            <div class="message message--error">
                ${message}
            </div>`;
    }

    updatePagination(currentPage) {
        if (this.currentPageSpan) this.currentPageSpan.textContent = currentPage;
    }

    updateProgressBar(currentPage, maxPages) {
        if (!this.progressFill) return;
        
        const progress = (currentPage / maxPages) * 100;
        
        this.progressFill.style.width = `${progress}%`;
    }

    showMovieFrame(filmId) {
        if (!this.filmFrameContainer) {
            this.filmFrameContainer = document.querySelector('.movie-frame-container');
            this.filmFrame = document.querySelector('.movie-frame');
            this.cardsSection = document.querySelector('.cards');
        }

        if (!this.filmFrameContainer || !this.filmFrame) {
            console.error('Film frame elements not found');
            return;
        }

        this.filmFrame.src = IFRAME_SRC(filmId);
        this.setElementVisibility(this.filmFrameContainer, true);
        this.setElementVisibility(this.cardsSection, false);
    }

    hideMovieFrame() {
        if (this.filmFrameContainer) {
            this.setElementVisibility(this.filmFrameContainer, false);
        }
        this.setElementVisibility(this.cardsSection, true);
        if (this.filmFrame) this.filmFrame.src = '';
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

export default FilmotekaUI;