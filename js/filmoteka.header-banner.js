class FilmotekaHeaderBanner {
    constructor() {
        this.header = document.querySelector('.header');
        
        // Настройки отображения
        this.settings = {
            rotation: 20,     // градусы наклона каждой обложки
            scale: 1.4,       // масштаб каждой обложки
            gap: 80,          // отступ между постерами в px
            posterCount: 8    // количество отображаемых постеров
        };

        // Массив постеров
        this.posters = [
            'https://avatars.mds.yandex.net/get-kinopoisk-image/1600647/430042eb-ee69-4818-aed0-a312400a26bf/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/10900341/caf9f155-1a19-42f1-a0f3-9c8773e9083e/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/1599028/0b76b2a2-d1c7-4f04-a284-80ff7bb709a4/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/1599028/637271d5-61b4-4e46-ac83-6d07494c7645/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/1599028/4057c4b8-8208-4a04-b169-26b0661453e3/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/4303601/617303b7-cfa7-4273-bd1d-63974bf68927/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/4303601/e410c71f-baa1-4fe5-bb29-aedb4662f49b/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/1599028/3560b757-9b95-45ec-af8c-623972370f9d/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/4483445/1e2ed281-b1e8-4083-b721-3ece7afc1031/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/6201401/a2d5bcae-a1a9-442f-8195-f5373a5ba77f/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/6201401/ae3b699c-3db7-4196-a869-39b610bfe706/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/4716873/85b585ea-410f-4d1c-aaa5-8d242756c2a4/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/1599028/7c3460dc-344d-433f-8220-f18d86c8397d/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/4716873/0a07a903-9025-4aff-bf7c-46bbb175888c/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/6201401/772093e4-7f68-49aa-a805-d654693aee26/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/6201401/8662d92a-5881-4600-a7ae-549e6fd53b03/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/1599028/0fa5bf50-d5ad-446f-a599-b26d070c8b99/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/1704946/e9008e2f-433f-43b0-b9b8-2ea8e3fb6c9b/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/1704946/80eab631-346c-4c29-b14d-1fa1438158f9/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/1629390/9e9e2b2c-a3c1-462e-8d84-e6a19fbe5b9c/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/1946459/7ade06a8-4178-4386-9ee2-87fec5a172eb/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/1599028/73cf2ed0-fd52-47a2-9e26-74104360786a/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/4774061/cf1970bc-3f08-4e0e-a095-2fb57c3aa7c6/360',
            'https://avatars.mds.yandex.net/get-kinopoisk-image/1898899/27ed5c19-a045-49dd-8624-5f629c5d96e0/360'
        ];

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
        const posters = this.getRandomPosters(this.settings.posterCount);
        if (posters.length > 0) {
            await this.renderCollage(posters);
        } else {
            this.applyFallbackStyle();
        }
    }

    getRandomPosters(count) {
        // Перемешиваем массив и берем нужное количество
        const shuffled = [...this.posters].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    async renderCollage(posters) {
        const bannerContainer = document.createElement('div');
        bannerContainer.className = 'header__banner';
        
        const posterRow = document.createElement('div');
        posterRow.style.display = 'flex';
        posterRow.style.flexDirection = 'row';
        posterRow.style.alignItems = 'center';
        posterRow.style.justifyContent = 'center';
        posterRow.style.gap = `${this.settings.gap}px`;
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
            
            const img = document.createElement('img');
            img.src = posterUrl;
            img.alt = '';
            img.loading = 'eager';
            img.style.height = '100%';
            img.style.width = 'auto';
            img.style.display = 'block';
            img.style.objectFit = 'contain';
            
            // Применяем настройки трансформации
            posterItem.style.transform = `rotate(${this.settings.rotation}deg) scale(${this.settings.scale})`;
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
