// GitHub Image Gallery för PLU Memory Game
// 🖼️ Visar befintliga bilder från GitHub-repot för enkel bildväljning

class GitHubImageGallery {
    constructor() {
        this.repoOwner = 'Kaizerpus';
        this.repoName = 'PLU-Memory';
        this.imageFolder = 'images';
        this.imageCache = new Map();
        this.isLoading = false;
    }

    // 📂 Hämta alla bilder från GitHub-repot
    async fetchRepoImages() {
        if (this.isLoading) return [];
        
        this.isLoading = true;
        console.log('🔍 Hämtar bilder från GitHub-repot...');

        try {
            // Använd GitHub API för att hämta innehållet i images-mappen
            const apiUrl = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${this.imageFolder}`;
            
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                console.warn('⚠️ Kunde inte hämta från GitHub API, använder cache');
                return this.getFallbackImages();
            }

            const files = await response.json();
            
            // Filtrera bara bildfiler
            const imageFiles = files.filter(file => {
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
                const isFile = file.type === 'file';
                return isImage && isFile;
            });

            console.log(`✅ Hittade ${imageFiles.length} bilder i GitHub-repot`);

            // Konvertera till användbart format
            const images = imageFiles.map(file => ({
                name: file.name,
                path: file.path,
                url: file.download_url,
                rawUrl: `https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/main/${file.path}`,
                size: file.size,
                displayName: this.getDisplayName(file.name)
            }));

            // Cacha resultatet
            this.imageCache.set('repoImages', images);
            this.imageCache.set('lastFetch', Date.now());

            return images;

        } catch (error) {
            console.error('❌ Fel vid hämtning av GitHub-bilder:', error);
            return this.getFallbackImages();
        } finally {
            this.isLoading = false;
        }
    }

    // 🎯 Skapa läsbart namn från filnamn
    getDisplayName(filename) {
        // Ta bort filändelse och ersätt - och _ med mellanslag
        let name = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
        name = name.replace(/[-_]/g, ' ');
        
        // Kapitalisera första bokstaven i varje ord
        name = name.replace(/\b\w/g, letter => letter.toUpperCase());
        
        return name;
    }

    // 🔄 Fallback-bilder om GitHub API inte fungerar
    getFallbackImages() {
        console.log('📦 Använder fallback-bildlista');
        
        // Lista över kända bilder i repot (uppdatera denna manuellt vid behov)
        const knownImages = [
            'apple.jpg', 'banana.jpg', 'orange.jpg', 'tomato.jpg', 'carrot.jpg',
            'potato.jpg', 'onion.jpg', 'lettuce.jpg', 'cucumber.jpg', 'pepper.jpg',
            'broccoli.jpg', 'spinach.jpg', 'mushroom.jpg', 'garlic.jpg', 'lemon.jpg',
            'lime.jpg', 'avocado.jpg', 'strawberry.jpg', 'blueberry.jpg', 'grape.jpg'
        ];

        return knownImages.map(filename => ({
            name: filename,
            path: `${this.imageFolder}/${filename}`,
            url: `https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/main/${this.imageFolder}/${filename}`,
            rawUrl: `https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/main/${this.imageFolder}/${filename}`,
            size: 0,
            displayName: this.getDisplayName(filename)
        }));
    }

    // 🖼️ Visa bildgalleri-modal
    async showImageGallery(currentImageUrl = '', onImageSelect = null) {
        console.log('🖼️ Öppnar bildgalleri...');

        // Visa loading medan vi hämtar bilder
        this.showLoadingModal();

        // Hämta bilder från GitHub
        const images = await this.fetchRepoImages();

        // Stäng loading och visa galleri
        this.closeLoadingModal();
        this.showGalleryModal(images, currentImageUrl, onImageSelect);
    }

    showLoadingModal() {
        const modal = document.createElement('div');
        modal.id = 'imageGalleryLoading';
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="text-align: center; padding: 40px;">
                <h2>🔍 Hämtar bilder från GitHub...</h2>
                <div class="loading-spinner" style="
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 20px auto;
                "></div>
                <p>Detta kan ta några sekunder...</p>
            </div>
        `;

        // Lägg till CSS för spinner
        if (!document.querySelector('#spinnerCSS')) {
            const style = document.createElement('style');
            style.id = 'spinnerCSS';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);
    }

    closeLoadingModal() {
        const modal = document.getElementById('imageGalleryLoading');
        if (modal) {
            modal.remove();
        }
    }

    showGalleryModal(images, currentImageUrl, onImageSelect) {
        const modal = document.createElement('div');
        modal.id = 'imageGalleryModal';
        modal.className = 'modal show image-gallery-modal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; max-height: 80vh;">
                <div class="modal-header">
                    <h2>🖼️ Välj bild från GitHub-repot</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
                    ${images.length === 0 ? `
                        <div style="text-align: center; padding: 40px;">
                            <p>📂 Inga bilder hittades i GitHub-repot</p>
                            <p>Lägg till bilder i <code>images/</code>-mappen och commit till GitHub</p>
                        </div>
                    ` : `
                        <div class="search-box" style="margin-bottom: 20px;">
                            <input type="text" id="imageSearch" placeholder="🔍 Sök bilder..." 
                                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        
                        <div class="image-grid" id="imageGrid" style="
                            display: grid;
                            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                            gap: 15px;
                            padding: 10px;
                        ">
                            ${images.map(image => `
                                <div class="image-item" data-name="${image.displayName.toLowerCase()}" 
                                     data-filename="${image.name.toLowerCase()}"
                                     style="border: 2px solid ${currentImageUrl === image.rawUrl ? '#28a745' : '#ddd'}; 
                                            border-radius: 8px; overflow: hidden; cursor: pointer; transition: all 0.3s;">
                                    <img src="${image.rawUrl}" alt="${image.displayName}" 
                                         style="width: 100%; height: 120px; object-fit: cover;"
                                         onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"150\\" height=\\"120\\"><rect width=\\"100%\\" height=\\"100%\\" fill=\\"#f0f0f0\\"/><text x=\\"50%\\" y=\\"50%\\" text-anchor=\\"middle\\" dy=\\".3em\\" fill=\\"#999\\">Bild ej tillgänglig</text></svg>'">
                                    <div style="padding: 8px; background: white;">
                                        <div style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">${image.displayName}</div>
                                        <div style="font-size: 10px; color: #666;">${image.name}</div>
                                        ${image.size > 0 ? `<div style="font-size: 10px; color: #999;">${(image.size / 1024).toFixed(1)} KB</div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
                <div class="modal-footer" style="text-align: center; padding: 15px; border-top: 1px solid #eee;">
                    <button onclick="this.closest('.modal').remove()" class="btn btn-secondary">Avbryt</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Lägg till event listeners
        this.setupGalleryEvents(modal, images, onImageSelect);
    }

    setupGalleryEvents(modal, images, onImageSelect) {
        // Sökfunktion
        const searchInput = modal.querySelector('#imageSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const items = modal.querySelectorAll('.image-item');
                
                items.forEach(item => {
                    const name = item.dataset.name;
                    const filename = item.dataset.filename;
                    const matches = name.includes(query) || filename.includes(query);
                    item.style.display = matches ? 'block' : 'none';
                });
            });
        }

        // Klick på bild
        const imageItems = modal.querySelectorAll('.image-item');
        imageItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const image = images[index];
                
                // Markera vald bild
                imageItems.forEach(i => i.style.borderColor = '#ddd');
                item.style.borderColor = '#28a745';
                
                // Anropa callback om det finns
                if (onImageSelect) {
                    onImageSelect(image);
                }
                
                // Stäng modal efter kort delay
                setTimeout(() => {
                    modal.remove();
                }, 300);
            });

            // Hover-effekt
            item.addEventListener('mouseenter', () => {
                if (item.style.borderColor !== 'rgb(40, 167, 69)') { // Om inte redan vald
                    item.style.borderColor = '#007bff';
                    item.style.transform = 'scale(1.05)';
                }
            });

            item.addEventListener('mouseleave', () => {
                if (item.style.borderColor !== 'rgb(40, 167, 69)') { // Om inte redan vald
                    item.style.borderColor = '#ddd';
                    item.style.transform = 'scale(1)';
                }
            });
        });

        // Stäng vid klick utanför
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Stäng med Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    // 🔄 Uppdatera cache (anropa när nya bilder läggs till i GitHub)
    async refreshCache() {
        console.log('🔄 Uppdaterar bildcache...');
        this.imageCache.clear();
        return await this.fetchRepoImages();
    }

    // 📊 Hämta cache-statistik
    getCacheInfo() {
        const lastFetch = this.imageCache.get('lastFetch');
        const images = this.imageCache.get('repoImages') || [];
        
        return {
            imageCount: images.length,
            lastFetch: lastFetch ? new Date(lastFetch).toLocaleString('sv-SE') : 'Aldrig',
            cacheAge: lastFetch ? Date.now() - lastFetch : 0
        };
    }
}

// Gör tillgänglig globalt
window.GitHubImageGallery = GitHubImageGallery;
window.githubImageGallery = new GitHubImageGallery();

// Hjälpfunktion för att öppna galleriet (används av produktdialog)
window.openImageGallery = function(currentImageUrl = '', onImageSelect = null) {
    return window.githubImageGallery.showImageGallery(currentImageUrl, onImageSelect);
};