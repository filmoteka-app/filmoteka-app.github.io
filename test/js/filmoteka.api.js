import { USE_DEBUG_DATA, API_KEYS, CORS_PROXIES, DEBUG_BASE, API_ENDPOINTS, TEXTS } from './filmoteka.constants.js';

class FilmotekaAPI {
    constructor() {
        this.currentApiKeyIndex = 0;
    }

    async safeFetch(url) {
        let usedReserve = false;

        for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
            const key = API_KEYS[this.currentApiKeyIndex];
            try {
                const response = await fetch(url, {
                    headers: {
                        'X-API-KEY': key,
                        'Content-Type': 'application/json'
                    }
                });

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

    async getIframeUrl(filmId) {
        if (USE_DEBUG_DATA) {
            return `https://example.com/embed/movie/${filmId}`;
        }

        const playerUrl = API_ENDPOINTS.PLAYER(filmId);

        for (const proxy of CORS_PROXIES) {
            try {
                const proxyUrl = proxy + encodeURIComponent(playerUrl);
                const response = await fetch(proxyUrl);
                
                if (!response.ok) continue;
                
                const data = await response.json();
                
                const collapsSource = data.find(item => item.source === "Collaps");
                if (collapsSource && collapsSource.iframeUrl) {
                    return collapsSource.iframeUrl;
                }
                
                const firstValidSource = data.find(item => item.iframeUrl);
                if (firstValidSource && firstValidSource.iframeUrl) {
                    return firstValidSource.iframeUrl;
                }
                
            } catch (error) {
                continue;
            }
        }
        
        throw new Error('Не удалось получить ссылку для просмотра');
    }

    async makeRequest(endpoint, params = '') {
        const url = typeof endpoint === 'function' ? endpoint(params) : `${endpoint}${params}`;
        return this.safeFetch(url);
    }

    getDebugMovies(prefix, count, startId) {
        return Array.from({ length: count }, (_, i) => ({
            ...DEBUG_BASE,
            kinopoiskId: startId + i,
            nameRu: `${DEBUG_BASE.nameRu} — ${prefix} #${i + 1}`
        }));
    }

    async searchMovies(query) {
        if (USE_DEBUG_DATA) {
            return this.getDebugMovies('Поиск', 20, 100000);
        }

        try {
            const res = await this.makeRequest(
                API_ENDPOINTS.SEARCH,
                `?keyword=${encodeURIComponent(query)}&page=1`
            );
            const data = await res.json();
            return data.films.slice(0, 10);
        } catch (error) {
            throw error;
        }
    }

    async getTopRatedMovies(page = 1) {
        if (USE_DEBUG_DATA) {
            return this.getDebugMovies('Рекомендации', 20, 200000);
        }

        try {
            const res = await this.makeRequest(
                API_ENDPOINTS.TOP,
                `?type=TOP_250_BEST_FILMS&page=${page}`
            );
            const data = await res.json();
            return data.films;
        } catch (error) {
            throw error;
        }
    }

    async getSimilarMovies(filmId) {
        if (USE_DEBUG_DATA) {
            return this.getDebugMovies('Похожие', 20, 300000);
        }

        try {
            const res = await this.makeRequest(API_ENDPOINTS.SIMILAR, filmId);
            const data = await res.json();
            return data.items || [];
        } catch (error) {
            throw error;
        }
    }

    async getMovieDetails(filmId) {
        if (USE_DEBUG_DATA) {
            return {
                ...DEBUG_BASE,
                kinopoiskId: filmId,
                nameRu: `${DEBUG_BASE.nameRu} — Детали #${filmId}`
            };
        }

        try {
            const res = await this.makeRequest(API_ENDPOINTS.DETAILS, filmId);
            return await res.json();
        } catch (error) {
            throw error;
        }
    }
}

export default FilmotekaAPI;