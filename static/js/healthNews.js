// for health news in landing page
document.addEventListener('DOMContentLoaded', () => {
    const healthNewsApp = new HealthNews('https://medkorea.onrender.com/api/health-news');
    healthNewsApp.init();
});

class HealthNews {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.currentIndex = 0;
        this.displayedArticles = [];
        this.articles = [];
        this.count = 4;
    }

    init() {
        this.fetchArticles()
            .then(data => {
                if (Array.isArray(data)) {
                    this.articles = data;
                } else if (data.articles) {
                    this.articles = data.articles;
                } else {
                    console.error('No articles found or data is not in expected format:', data);
                }
                this.displayArticles();
            })
            .catch(error => console.error('Error fetching health news:', error));
    }

    async fetchArticles() {
        const response = await fetch(this.apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }

    displayArticles() {
        const newsContainer = document.querySelector('.health-news-articles');
        let articlesToShow = [];

        while (articlesToShow.length < this.count && this.currentIndex < this.articles.length) {
            const article = this.articles[this.currentIndex];
            this.currentIndex++;

            if (!article.title.includes("Removed") && !this.displayedArticles.some(a => a.dataset.url === article.url)) {
                const articleDiv = this.createArticleElement(article);
                articlesToShow.push(article);
                this.displayedArticles.push(articleDiv);
                newsContainer.appendChild(articleDiv);
            }
        }

        this.updateButtons();
    }

    createArticleElement(article) {
        const articleDiv = document.createElement('li');
        articleDiv.classList.add('article');
    
        const imageContent = article.urlToImage
            ? `<div class="article-img">
                <img src="${article.urlToImage}" alt="Article Image" class="headline-img"/>
            </div>`
            : '';
    
        articleDiv.classList.toggle('article-no-img', !article.urlToImage);
    
        const truncateText = (text, maxLength) => {
            return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
        };
    
        // responsible for headlines
        const calculateMaxLength = () => {
            const screenWidth = window.innerWidth;
            if (screenWidth > 1200) return 200; // desktop
            if (screenWidth > 768) return 65;  // tablet
            // return 50; // mobile
        };
    
        const maxLength = calculateMaxLength();
    
        articleDiv.innerHTML = `
            ${imageContent}
            <div class="article-txt">
                <h3 class="headline">${truncateText(article.title, maxLength)}</h3>
                <p class="summary">${article.description || 'No description available.'}</p>
                <p><small>Published at: ${new Date(article.publishedAt).toLocaleString()}</small></p>
            </div>
        `;
    
        const imgElement = articleDiv.querySelector('.headline-img');
        if (imgElement) {
            imgElement.addEventListener('click', () => this.openModal(article));
        }
    
        articleDiv.querySelector('.headline').addEventListener('click', () => this.openModal(article));
    
        // update the headline
        window.addEventListener('resize', () => {
            const newMaxLength = calculateMaxLength();
            const headlineElement = articleDiv.querySelector('.headline');
            headlineElement.textContent = truncateText(article.title, newMaxLength);
        });
    
        return articleDiv;
    }

    openModal(article) {
        document.getElementById('modalTitle').textContent = article.title;
        document.getElementById('modalDescription').textContent = article.description || 'No description available.';
        document.getElementById('modalPublishedAt').textContent = `Published at: ${new Date(article.publishedAt).toLocaleString()}`;

        const modalImage = document.getElementById('modalImage');
        if (article.urlToImage) {
            modalImage.src = article.urlToImage;
            modalImage.style.display = 'block';
        } else {
            modalImage.style.display = 'none';
        }

        document.getElementById('myModal').style.display = 'block';

        this.setupModalClose();
    }

    setupModalClose() {
        const modal = document.getElementById('myModal');
        const closeModal = document.querySelector('.modal .close');

        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    updateButtons() {
        this.clearButtons();
        const btns = this.getOrCreateButtonsContainer();

        if (this.currentIndex < this.articles.length) {
            this.createReadMoreButton(btns);
        }

        if (this.displayedArticles.length > this.count) {
            this.createReadLessButton(btns);
        }

        this.updateButtonAlignment();
    }

    clearButtons() {
        const existingReadMoreBtn = document.querySelector('.read-more-Btn');
        const existingReadLessBtn = document.querySelector('.read-less-Btn');
        if (existingReadMoreBtn) existingReadMoreBtn.remove();
        if (existingReadLessBtn) existingReadLessBtn.remove();
    }

    getOrCreateButtonsContainer() {
        let btns = document.querySelector('.btns');
        if (!btns) {
            btns = document.createElement('div');
            btns.className = 'btns';
            const healthNews = document.querySelector('.health-news');
            healthNews.appendChild(btns);
        }
        return btns;
    }

    createReadMoreButton(container) {
        const readMoreBtn = document.createElement('button');
        readMoreBtn.textContent = 'Read More';
        readMoreBtn.classList.add('read-more-Btn');
        container.appendChild(readMoreBtn);

        readMoreBtn.addEventListener('click', () => {
            this.displayArticles();
        });
    }

    createReadLessButton(container) {
        const readLessBtn = document.createElement('button');
        readLessBtn.textContent = 'Read Less';
        readLessBtn.classList.add('read-less-Btn');
        container.appendChild(readLessBtn);

        readLessBtn.addEventListener('click', () => {
            const articlesToHide = this.displayedArticles.slice(-this.count);

            articlesToHide.forEach(article => {
                if (article instanceof HTMLElement) {
                    article.remove();
                } else {
                    console.warn("The item is not a DOM element:", article);
                }
            });

            this.displayedArticles = this.displayedArticles.slice(0, -this.count);
            this.currentIndex -= this.count;

            if (this.currentIndex <= this.count) {
                readLessBtn.remove();
            }

            this.updateButtons();
        });
    }

    updateButtonAlignment() {
        const hasReadMore = document.querySelector('.read-more-Btn') !== null;
        const hasReadLess = document.querySelector('.read-less-Btn') !== null;
        const btns = document.querySelector('.btns');

        if (hasReadMore && hasReadLess) {
            btns.style.justifyContent = 'space-between';
        } else {
            btns.style.justifyContent = 'center';
        }
    }
}
