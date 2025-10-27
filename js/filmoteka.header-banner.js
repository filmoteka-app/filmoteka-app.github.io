import { API_KEYS, API_ENDPOINTS } from './filmoteka.constants.js';

class FilmotekaHeaderBanner {
    constructor() {
        this.apiKeys = API_KEYS;
        this.currentApiKeyIndex = 0;
        this.header = document.querySelector('.header');
        this.init();
    }

    async init() {
        try {
            await this.createBanner();
        } catch (error) {
            console.error('Error creating header banner:', error);
            this.applyFallbackStyle();
        }
    }

    async createBanner() {
        const posters = await this.getRandomPosters(4);
        if (posters.length > 0) {
            await this.renderCollage(posters);
        } else {
            this.applyFallbackStyle();
        }
    }

    async getRandomPosters(count) {
        try {
            const response = await this.safeFetch(`${API_ENDPOINTS.TOP}?type=TOP_250_BEST_FILMS&page=1`);
            const data = await response.json();
            
            if (!data.films || data.films.length === 0) {
                return [];
            }

            const shuffled = [...data.films].sort(() => 0.5 - Math.random());
            const selectedFilms = shuffled.slice(0, count);
            
            return selectedFilms
                .filter(film => film.posterUrlPreview || film.posterUrl)
                .map(film => film.posterUrlPreview || film.posterUrl);
                
        } catch (error) {
            console.error('Error fetching posters for header:', error);
            return [];
        }
    }

    async safeFetch(url) {
        for (let attempt = 0; attempt < this.apiKeys.length; attempt++) {
            const key = this.apiKeys[this.currentApiKeyIndex];
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response = await fetch(url, {
                    headers: {
                        'X-API-KEY': key,
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    return response;
                }

                this.switchApiKey();
            } catch (err) {
                this.switchApiKey();
            }
        }
        throw new Error('All API keys failed');
    }

    switchApiKey() {
        this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.apiKeys.length;
    }

    async renderCollage(posters) {
        const bannerContainer = document.createElement('div');
        bannerContainer.className = 'header__banner';
        
        const posterRow = document.createElement('div');
        posterRow.style.display = 'flex';
        posterRow.style.flexDirection = 'row';
        posterRow.style.alignItems = 'center';
        posterRow.style.justifyContent = 'center';
        posterRow.style.gap = '80px';
        posterRow.style.width = '100%';
        posterRow.style.height = '100%';
        posterRow.style.position = 'absolute';
        posterRow.style.top = '0';
        posterRow.style.left = '0';
        posterRow.style.opacity = '0';
        posterRow.style.transition = 'opacity 0.5s ease';
        
        await this.preloadImages(posters);
        
        posters.forEach((posterUrl, index) => {
            const posterItem = document.createElement('div');
            posterItem.style.flexShrink = '0';
            posterItem.style.height = '100%';
            posterItem.style.position = 'relative';
            posterItem.style.margin = '0 0px';
            
            const img = document.createElement('img');
            img.src = posterUrl;
            img.alt = '';
            img.loading = 'eager';
            img.style.height = '100%';
            img.style.width = 'auto';
            img.style.display = 'block';
            img.style.objectFit = 'contain';
            
            posterItem.style.transform = 'rotate(20deg) scale(1.4)';
            posterItem.style.transformOrigin = 'center';
            
            posterItem.appendChild(img);
            posterRow.appendChild(posterItem);
        });
        
        bannerContainer.appendChild(posterRow);
        
        if (this.header) {
            this.header.classList.add('header--with-banner');
            this.header.appendChild(bannerContainer);
            
            setTimeout(() => {
                posterRow.style.opacity = '1';
            }, 100);
        }
    }

    preloadImages(urls) {
        return new Promise((resolve) => {
            let loadedCount = 0;
            const totalCount = urls.length;
            
            if (totalCount === 0) {
                resolve();
                return;
            }
            
            urls.forEach(url => {
                const img = new Image();
                img.onload = () => {
                    loadedCount++;
                    if (loadedCount === totalCount) {
                        resolve();
                    }
                };
                img.onerror = () => {
                    loadedCount++;
                    if (loadedCount === totalCount) {
                        resolve();
                    }
                };
                img.src = url;
            });
        });
    }

    applyFallbackStyle() {
        if (this.header) {
            this.header.classList.add('header--fallback');
        }
    }
}

export default FilmotekaHeaderBanner;
