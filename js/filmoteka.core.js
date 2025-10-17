import FilmotekaAPI from './filmoteka.api.js';
import FilmotekaUI from './filmoteka.ui.js';
import { TEXTS, USE_DEBUG_DATA, CONFIG } from './filmoteka.constants.js';

class Filmoteka {
    constructor() {
        this.api = new FilmotekaAPI();
        this.ui = new FilmotekaUI({
            onSimilarClick: (id, title) => this.showSimilarMovies(id, title),
            onWatchClick: (id, title, year) => this.watchMovie(id, title, year)
        });
        
        this.currentPage = 1;
        this.history = this.loadHistory();
        this.isHistoryView = false;
        this.isWatching = false;
        
        this.bindEventHandlers();
        this.loadRecommendations();
    }

    bindEventHandlers() {
        const handlers = {
            '#searchBtn': () => this.searchMovies(),
            '#searchInput': (e) => e.key === 'Enter' && this.searchMovies(),
            '#backBtn': () => this.showRecommendations(),
            '#prevPage': () => this.previousPage(),
            '#nextPage': () => this.nextPage(),
            '#historyBtn': () => this.showHistory(),
            '#clearHistoryBtn': () => this.clearHistory()
        };

        Object.entries(handlers).forEach(([selector, handler]) => {
            const element = document.querySelector(selector);
            const event = selector === '#searchInput' ? 'keypress' : 'click';
            element?.addEventListener(event, handler);
        });
    }

    resetViewState(options = {}) {
        const { hideMovieFrame = true, scrollToTop = true } = options;
        
        if (hideMovieFrame && this.isWatching) {
            this.ui.hideMovieFrame();
        }
        
        if (scrollToTop) {
            this.ui.scrollToTop();
        }
        
        this.isHistoryView = false;
        this.isWatching = false;
    }

    loadHistory() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.HISTORY.STORAGE_KEY)) || [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem(CONFIG.HISTORY.STORAGE_KEY, JSON.stringify(this.history));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    addToHistory(filmId, title, year, posterUrl = '', rating = null, filmType = 'FILM') {
        const existingIndex = this.history.findIndex(item => item.id === filmId);
        
        if (existingIndex !== -1) {
            this.history.splice(existingIndex, 1);
        }
        
        this.history.unshift({
            id: filmId,
            title: title,
            year: year,
            posterUrl: posterUrl,
            rating: rating,
            type: filmType,
            timestamp: Date.now()
        });

        if (this.history.length > CONFIG.HISTORY.MAX_SIZE) {
            this.history = this.history.slice(0, CONFIG.HISTORY.MAX_SIZE);
        }

        this.saveHistory();
    }

    clearHistory() {
        if (confirm('Очистить всю историю просмотров?')) {
            this.history = [];
            this.saveHistory();
            if (this.isHistoryView) {
                this.showHistory();
            }
        }
    }

    showHistory() {
        this.resetViewState();
        this.isHistoryView = true;
        
        this.ui.showNavigation(
            TEXTS.NAV.HISTORY_TITLE,
            TEXTS.NAV.HISTORY_SUBTITLE,
            true
        );
        this.ui.showHistoryButton(false);
        this.ui.showPagination(false);

        if (!this.history.length) {
            this.ui.showError(TEXTS.ERRORS.HISTORY_EMPTY);
            return;
        }

        const historyMovies = this.history.map(item => ({
            kinopoiskId: item.id,
            nameRu: item.title,
            year: item.year,
            posterUrlPreview: item.posterUrl || '',
            rating: item.rating,
            ratingKinopoisk: item.rating,
            type: item.type || 'FILM'
        }));

        this.ui.displayMovies(historyMovies);
    }

    async searchMovies() {
        this.resetViewState();
        
        const query = this.ui.searchInput.value.trim();
        if (!query) return;
        
        this.ui.searchInput.value = '';
        this.ui.showNavigation(
            TEXTS.NAV.SEARCH_RESULTS_TITLE,
            TEXTS.NAV.SEARCH_RESULTS_SUBTITLE(query),
            true
        );
        this.ui.showHistoryButton(true);
        this.ui.showPagination(false);
        this.ui.showLoading();
        
        try {
            const films = await this.api.searchMovies(query);
            this.ui.displayMovies(films);
        } catch (error) {
            this.ui.showError(TEXTS.ERRORS.SEARCH);
        }
    }

    async loadRecommendations() {
        this.resetViewState({ scrollToTop: false });
        
        this.ui.showNavigation(
            TEXTS.NAV.RECOMMENDATIONS_TITLE,
            TEXTS.NAV.RECOMMENDATIONS_SUBTITLE
        );
        this.ui.showHistoryButton(true);
        
        if (USE_DEBUG_DATA) {
            const films = this.api.getDebugMovies('Рекомендации', 20, 200000);
            this.ui.displayMovies(films, {
                showPosition: true,
                startPosition: (this.currentPage - 1) * CONFIG.PAGINATION.FILMS_PER_PAGE
            });
            return;
        }
        
        this.ui.showLoading();
        
        try {
            const films = await this.api.getTopRatedMovies(this.currentPage);
            this.ui.displayMovies(films, {
                showPosition: true,
                startPosition: (this.currentPage - 1) * CONFIG.PAGINATION.FILMS_PER_PAGE
            });
            this.ui.updateProgressBar(this.currentPage);
            this.ui.showPagination(true);
        } catch (error) {
            this.ui.showError(TEXTS.ERRORS.RECOMMENDATIONS_LOAD);
        }
    }

    async showSimilarMovies(filmId, filmTitle) {
        this.resetViewState();
        
        this.ui.showNavigation(
            TEXTS.NAV.SIMILAR_TITLE(filmTitle),
            TEXTS.NAV.SIMILAR_SUBTITLE,
            true
        );
        this.ui.showHistoryButton(true);
        this.ui.showPagination(false);
        this.ui.showLoading();
        
        try {
            const similarMovies = await this.api.getSimilarMovies(filmId);
            
            if (similarMovies.length) {
                const filmsWithDetails = await Promise.all(
                    similarMovies.slice(0, CONFIG.SIMILAR.MAX_FILMS).map(async film => {
                        try {
                            return await this.api.getMovieDetails(film.filmId);
                        } catch {
                            return film;
                        }
                    })
                );
                this.ui.displayMovies(filmsWithDetails);
            } else {
                this.ui.showError(TEXTS.ERRORS.SIMILAR_NOT_FOUND);
            }
        } catch (error) {
            this.ui.showError(TEXTS.ERRORS.SIMILAR_LOAD);
        }
    }

    watchMovie(filmId, title, year) {
        if (!USE_DEBUG_DATA) {
            this.api.getMovieDetails(filmId).then(filmDetails => {
                this.addToHistory(
                    filmId, 
                    title, 
                    year,
                    filmDetails.posterUrlPreview || filmDetails.posterUrl || '',
                    filmDetails.ratingKinopoisk || filmDetails.ratingImdb || null,
                    filmDetails.type || 'FILM'
                );
            }).catch(() => {
                this.addToHistory(filmId, title, year);
            });
        } else {
            this.addToHistory(filmId, title, year);
        }

        if (USE_DEBUG_DATA) {
            alert('Тестовый режим');
            return;
        }

        this.isWatching = true;
        this.ui.scrollToTop();
        this.ui.showMovieFrame(filmId);
        
        this.ui.navigationTitle.textContent = title || 'Фильм';
        this.ui.navigationSubtitle.textContent = year ? `${year} год` : '';
        
        this.ui.setElementVisibility(this.ui.backBtn, true);
        this.ui.showPagination(false);
        this.ui.showHistoryButton(true);
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadRecommendations();
        }
    }

    nextPage() {
        const maxPages = Math.ceil(CONFIG.PAGINATION.TOTAL_FILMS / CONFIG.PAGINATION.FILMS_PER_PAGE);
        if (this.currentPage < maxPages) {
            this.currentPage++;
            this.loadRecommendations();
        }
    }

    showRecommendations() {
        this.resetViewState();
        this.currentPage = 1;
        this.ui.showHistoryButton(true);
        this.loadRecommendations();
    }
}

const filmoteka = new Filmoteka();

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/filmoteka/service-worker.js').catch(() => {});
// }


export default Filmoteka;
