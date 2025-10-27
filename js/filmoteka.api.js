import { API_KEYS, API_ENDPOINTS, TEXTS, CONFIG } from './filmoteka.constants.js';

class FilmotekaAPI {
    constructor() {
        this.currentApiKeyIndex = 0;
    }

    async safeFetch(url) {
        let usedReserve = false;

        for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
            const key = API_KEYS[this.currentApiKeyIndex];
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(url, {
                    headers: {
                        'X-API-KEY': key,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    if (usedReserve) {
                        console.info(`Резервный API-ключ ${key} успешно использован.`);
                    }
                    return response;
                }

                console.warn(`API-ключ ${key} недоступен (HTTP ${response.status}). Переключаемся на резервный...`);
                usedReserve = true;
                this.switchApiKey();
                continue;
            } catch (err) {
                clearTimeout(timeoutId);
                console.error(`Ошибка при использовании ключа ${key}:`, err);
                usedReserve = true;
                this.switchApiKey();
            }
        }

        throw new Error(TEXTS.ERRORS.API_UNAVAILABLE);
    }

    switchApiKey() {
        this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % API_KEYS.length;
    }

    handleApiError(error, context) {
        console.error(`${context} error:`, error);
        throw error;
    }

    async makeRequest(endpoint, params = '') {
        const url = typeof endpoint === 'function' ? endpoint(params) : `${endpoint}${params}`;
        return this.safeFetch(url);
    }

    async searchMovies(query) {
        try {
            const res = await this.makeRequest(
                API_ENDPOINTS.SEARCH,
                `?keyword=${encodeURIComponent(query)}&page=1`
            );
            const data = await res.json();
            return data.films.slice(0, 10);
        } catch (error) {
            this.handleApiError(error, 'SEARCH');
        }
    }

    async getFeaturedMovies() {
        try {
            const allFilms = [];
            let page = 1;
            let hasMorePages = true;

            while (hasMorePages && page <= 13) {
                const res = await this.makeRequest(
                    API_ENDPOINTS.TOP,
                    `?type=TOP_250_BEST_FILMS&page=${page}`
                );
                const data = await res.json();
                
                if (!data.films || data.films.length === 0) {
                    hasMorePages = false;
                    break;
                }

                const filmsWithPosition = data.films.map((film, index) => ({
                    ...film,
                    position: ((page - 1) * 20) + index + 1
                }));

                allFilms.push(...filmsWithPosition);
                
                if (data.films.length < 20) {
                    hasMorePages = false;
                }
                
                page++;
                
                if (hasMorePages) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            return allFilms;
            
        } catch (error) {
            this.handleApiError(error, 'ALL_TOP_FILMS');
        }
    }

    async getSimilarMovies(filmId) {
        try {
            const res = await this.makeRequest(API_ENDPOINTS.SIMILAR, filmId);
            const data = await res.json();
            return data.items || [];
        } catch (error) {
            this.handleApiError(error, 'SIMILAR_FILMS');
        }
    }

    async getMovieDetails(filmId) {
        try {
            const res = await this.makeRequest(API_ENDPOINTS.DETAILS, filmId);
            return await res.json();
        } catch (error) {
            this.handleApiError(error, 'FILM_DETAILS');
        }
    }
}

export default FilmotekaAPI;