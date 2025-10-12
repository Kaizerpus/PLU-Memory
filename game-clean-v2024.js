// PLU Memory Game - Ultra Clean Version (Cache Busted)
console.log('🥕 PLU Memory Game startar - ny version...');

// 🌐 PWA and Offline Support
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    init() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('💾 PWA installable detected');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Check if already installed
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showToast('📱 Appen är nu installerad!', 'success');
        });

        // Check for standalone mode (already installed)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('📱 Running in standalone mode');
        }
    }

    showInstallButton() {
        if (this.isInstalled) return;

        const existingBtn = document.querySelector('.pwa-install-container');
        if (existingBtn) return;

        const installContainer = document.createElement('div');
        installContainer.className = 'pwa-install-container';
        installContainer.innerHTML = `
            <button class="pwa-install-btn" id="pwaInstallBtn">
                <span>📱</span>
                <span>Installera App</span>
            </button>
        `;

        document.body.appendChild(installContainer);

        const installBtn = document.getElementById('pwaInstallBtn');
        installBtn.addEventListener('click', () => this.installApp());

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (installContainer.parentNode) {
                installContainer.style.animation = 'fadeOut 0.5s forwards';
                setTimeout(() => installContainer.remove(), 500);
            }
        }, 10000);
    }

    hideInstallButton() {
        const installContainer = document.querySelector('.pwa-install-container');
        if (installContainer) {
            installContainer.remove();
        }
    }

    async installApp() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log(`👤 User choice: ${outcome}`);
        
        if (outcome === 'accepted') {
            this.showToast('📱 Installerar appen...', 'info');
        }
        
        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        }
    }
}

// Initialize PWA Manager
const pwaManager = new PWAManager();

// 🎨 Animation Manager för mjuka övergångar
class AnimationManager {
    constructor() {
        this.animationQueue = [];
        this.isAnimating = false;
    }

    // Lägg till animationsklass med automatisk cleanup
    addAnimation(element, animationClass, duration = 600) {
        if (!element) return Promise.resolve();
        
        return new Promise((resolve) => {
            element.classList.add(animationClass);
            
            setTimeout(() => {
                element.classList.remove(animationClass);
                resolve();
            }, duration);
        });
    }

    // Animera kort när det visas
    animateCardReveal(cardElement) {
        if (!cardElement) return Promise.resolve();
        
        return this.addAnimation(cardElement, 'reveal', 800);
    }

    // Animera framgångsrikt svar
    animateSuccess(element) {
        if (!element) return Promise.resolve();
        
        return this.addAnimation(element, 'success-animation', 600);
    }

    // Animera fel svar med shake
    animateError(element) {
        if (!element) return Promise.resolve();
        
        return this.addAnimation(element, 'error-animation', 500);
    }

    // Animera poängökning
    animateScoreIncrease(scoreElement) {
        if (!scoreElement) return Promise.resolve();
        
        const scoreIndicator = document.createElement('div');
        scoreIndicator.textContent = '+1';
        scoreIndicator.className = 'score-animation';
        scoreIndicator.style.cssText = `
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            color: #27ae60;
            font-weight: bold;
            font-size: 1.2rem;
            pointer-events: none;
            z-index: 1000;
        `;
        
        scoreElement.style.position = 'relative';
        scoreElement.appendChild(scoreIndicator);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                if (scoreIndicator.parentNode) {
                    scoreIndicator.remove();
                }
                resolve();
            }, 800);
        });
    }

    // Animera feedback-meddelanden
    animateFeedback(feedbackElement) {
        if (!feedbackElement) return Promise.resolve();
        
        return this.addAnimation(feedbackElement, 'feedback-slide-in', 400);
    }

    // Animera bildbyte med fade
    animateImageTransition(imageElement, newSrc) {
        if (!imageElement) return Promise.resolve();
        
        return new Promise((resolve) => {
            imageElement.style.opacity = '0';
            imageElement.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
                imageElement.src = newSrc;
                imageElement.onload = () => {
                    imageElement.classList.add('image-fade-in');
                    imageElement.style.opacity = '1';
                    imageElement.style.transform = 'scale(1)';
                    
                    setTimeout(() => {
                        imageElement.classList.remove('image-fade-in');
                        resolve();
                    }, 600);
                };
            }, 200);
        });
    }

    // Animera lägesövergång
    animateModeTransition(containerElement) {
        if (!containerElement) return Promise.resolve();
        
        return this.addAnimation(containerElement, 'mode-transition', 800);
    }

    // Lägg till hover-effekter för knappar
    addButtonHoverEffects() {
        document.querySelectorAll('button, .btn').forEach(button => {
            button.addEventListener('mouseenter', () => {
                if (!button.disabled) {
                    button.style.transform = 'translateY(-2px)';
                }
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });
            
            button.addEventListener('mousedown', () => {
                if (!button.disabled) {
                    button.style.transform = 'translateY(0) scale(0.98)';
                }
            });
            
            button.addEventListener('mouseup', () => {
                if (!button.disabled) {
                    button.style.transform = 'translateY(-2px) scale(1)';
                }
            });
        });
    }

    // Animera streak-räknare
    animateStreak(streakElement) {
        if (!streakElement) return Promise.resolve();
        
        return this.addAnimation(streakElement, 'streak-animation', 500);
    }

    // Konfetti-effekt för prestationer
    createConfetti(centerElement) {
        if (!centerElement) return;
        
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        const confettiCount = 30;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-particle';
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: ${centerElement.getBoundingClientRect().top + centerElement.offsetHeight / 2}px;
                left: ${centerElement.getBoundingClientRect().left + centerElement.offsetWidth / 2}px;
                z-index: 10000;
                pointer-events: none;
                border-radius: 50%;
            `;
            
            document.body.appendChild(confetti);
            
            // Slumpmässig riktning och hastighet
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const velocity = Math.random() * 100 + 50;
            const gravity = 0.5;
            
            let x = 0, y = 0, vx = Math.cos(angle) * velocity, vy = Math.sin(angle) * velocity;
            
            const animate = () => {
                x += vx * 0.02;
                y += vy * 0.02;
                vy += gravity;
                
                confetti.style.transform = `translate(${x}px, ${y}px) rotate(${x * 2}deg)`;
                confetti.style.opacity = Math.max(0, 1 - (y / 200));
                
                if (y < 200 && confetti.style.opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    confetti.remove();
                }
            };
            
            requestAnimationFrame(animate);
        }
    }
}

// Initiera Animation Manager
const animationManager = new AnimationManager();

// ♿ Avancerad Tillgänglighetsmanager
class AccessibilityManager {
    constructor() {
        this.isKeyboardUser = false;
        this.screenReaderActive = false;
        this.highContrastMode = false;
        this.textSize = 'normal';
        this.colorBlindMode = false;
        this.dyslexiaMode = false;
        this.announcements = [];
        this.keyboardShortcuts = new Map();
        this.init();
    }

    init() {
        this.detectKeyboardUser();
        this.detectScreenReader();
        this.setupKeyboardShortcuts();
        this.setupLiveRegions();
        this.setupFocusManagement();
        this.loadAccessibilityPreferences();
        console.log('♿ Tillgänglighetsmanager initialiserad');
    }

    // Upptäck tangentbordsanvändare
    detectKeyboardUser() {
        let hadMouseEvent = false;
        
        document.addEventListener('mousedown', () => {
            hadMouseEvent = true;
            document.body.classList.remove('keyboard-user');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !hadMouseEvent) {
                this.isKeyboardUser = true;
                document.body.classList.add('keyboard-user');
            }
        });
    }

    // Upptäck skärmläsare
    detectScreenReader() {
        const testElement = document.createElement('div');
        testElement.setAttribute('aria-hidden', 'true');
        testElement.style.position = 'absolute';
        testElement.style.left = '-10000px';
        testElement.textContent = 'Screen reader test';
        
        document.body.appendChild(testElement);
        
        setTimeout(() => {
            if (testElement.offsetParent === null) {
                this.screenReaderActive = true;
                this.announceToScreenReader('PLU Memory spel laddat. Använd Tab för att navigera.');
            }
            document.body.removeChild(testElement);
        }, 100);
    }

    // Skapa live regions för skärmläsare
    setupLiveRegions() {
        // Polite announcements (inte kritiska)
        const politeRegion = document.createElement('div');
        politeRegion.id = 'aria-live-polite';
        politeRegion.setAttribute('aria-live', 'polite');
        politeRegion.setAttribute('aria-atomic', 'true');
        politeRegion.className = 'sr-only';
        document.body.appendChild(politeRegion);

        // Assertive announcements (kritiska)
        const assertiveRegion = document.createElement('div');
        assertiveRegion.id = 'aria-live-assertive';
        assertiveRegion.setAttribute('aria-live', 'assertive');
        assertiveRegion.setAttribute('aria-atomic', 'true');
        assertiveRegion.className = 'sr-only';
        document.body.appendChild(assertiveRegion);
    }

    // Meddela till skärmläsare
    announceToScreenReader(message, priority = 'polite') {
        const regionId = priority === 'assertive' ? 'aria-live-assertive' : 'aria-live-polite';
        const region = document.getElementById(regionId);
        
        if (region) {
            region.textContent = '';
            setTimeout(() => {
                region.textContent = message;
            }, 100);
        }
    }

    // Kortkommandon
    setupKeyboardShortcuts() {
        this.keyboardShortcuts.set('Alt+H', () => this.showHelp());
        this.keyboardShortcuts.set('Alt+M', () => this.toggleHighContrast());
        this.keyboardShortcuts.set('Alt+T', () => this.cycleTextSize());
        this.keyboardShortcuts.set('Alt+S', () => this.skipToMainContent());
        this.keyboardShortcuts.set('Alt+R', () => this.repeatCurrentQuestion());
        this.keyboardShortcuts.set('Escape', () => this.returnToMenu());

        document.addEventListener('keydown', (e) => {
            const shortcut = this.getShortcutString(e);
            const action = this.keyboardShortcuts.get(shortcut);
            
            if (action) {
                e.preventDefault();
                action();
            }

            // Arrow key navigation
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                this.navigateWithArrows(e);
            }
        });
    }

    getShortcutString(event) {
        const parts = [];
        if (event.ctrlKey) parts.push('Ctrl');
        if (event.altKey) parts.push('Alt');
        if (event.shiftKey) parts.push('Shift');
        if (event.key !== 'Control' && event.key !== 'Alt' && event.key !== 'Shift') {
            parts.push(event.key);
        }
        return parts.join('+');
    }

    // Focus management
    setupFocusManagement() {
        this.focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        
        // Trap focus in modal dialogs
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal.show');
                if (modal) {
                    this.trapFocus(e, modal);
                }
            }
        });
    }

    trapFocus(event, container) {
        const focusableElements = container.querySelectorAll(this.focusableElements);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    // Hjälpfunktioner
    showHelp() {
        const helpText = `
PLU Memory Spel - Hjälp och Kortkommandon:

Grundläggande navigation:
- Tab: Nästa element
- Shift+Tab: Föregående element  
- Enter/Space: Aktivera knapp
- Escape: Tillbaka till menyn

Kortkommandon:
- Alt+H: Visa denna hjälp
- Alt+M: Växla högkontrast-läge
- Alt+T: Ändra textstorlek
- Alt+S: Hoppa till huvudinnehåll
- Alt+R: Upprepa nuvarande fråga

Spelkontroller:
- Skriv PLU-kod i inmatningsfältet
- Enter: Skicka svar
- Pil upp/ner: Navigera mellan element
        `.trim();

        this.announceToScreenReader(helpText, 'assertive');
        
        // Visa även visuell hjälp
        this.showVisualHelp(helpText);
    }

    showVisualHelp(helpText) {
        const existingHelp = document.getElementById('accessibility-help');
        if (existingHelp) {
            existingHelp.remove();
        }

        const helpModal = document.createElement('div');
        helpModal.id = 'accessibility-help';
        helpModal.className = 'modal show';
        helpModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Hjälp och Tillgänglighet</h2>
                    <button class="close-btn" aria-label="Stäng hjälp">&times;</button>
                </div>
                <div class="modal-body">
                    <pre style="white-space: pre-wrap; font-family: inherit;">${helpText}</pre>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary close-help">Stäng (Escape)</button>
                </div>
            </div>
        `;

        document.body.appendChild(helpModal);

        // Focus första elementet
        const closeBtn = helpModal.querySelector('.close-btn');
        closeBtn.focus();

        // Event listeners
        helpModal.querySelector('.close-btn').onclick = () => this.closeHelp();
        helpModal.querySelector('.close-help').onclick = () => this.closeHelp();
        
        helpModal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeHelp();
            }
        });
    }

    closeHelp() {
        const helpModal = document.getElementById('accessibility-help');
        if (helpModal) {
            helpModal.remove();
        }
    }

    // Växla högkontrast
    toggleHighContrast() {
        this.highContrastMode = !this.highContrastMode;
        document.body.classList.toggle('high-contrast-theme', this.highContrastMode);
        
        const message = this.highContrastMode ? 
            'Högkontrast-läge aktiverat' : 
            'Högkontrast-läge inaktiverat';
        
        this.announceToScreenReader(message);
        this.savePreferences();
    }

    // Växla textstorlek
    cycleTextSize() {
        const sizes = ['small', 'normal', 'large', 'extra-large'];
        const currentIndex = sizes.indexOf(this.textSize);
        this.textSize = sizes[(currentIndex + 1) % sizes.length];
        
        // Ta bort gamla klasser
        sizes.forEach(size => {
            document.body.classList.remove(`text-size-${size}`);
        });
        
        // Lägg till ny klass
        document.body.classList.add(`text-size-${this.textSize}`);
        
        const sizeNames = {
            'small': 'liten',
            'normal': 'normal', 
            'large': 'stor',
            'extra-large': 'extra stor'
        };
        
        this.announceToScreenReader(`Textstorlek ändrad till ${sizeNames[this.textSize]}`);
        this.savePreferences();
    }

    // Hoppa till huvudinnehåll
    skipToMainContent() {
        const mainContent = document.getElementById('main-content') || 
                           document.querySelector('main') ||
                           document.getElementById('game');
        
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView();
            this.announceToScreenReader('Hoppade till huvudinnehåll');
        }
    }

    // Upprepa nuvarande fråga
    repeatCurrentQuestion() {
        if (window.currentProduct) {
            const message = `Nuvarande fråga: Vad är PLU-koden för ${window.currentProduct.name}?`;
            this.announceToScreenReader(message, 'assertive');
        }
    }

    // Tillbaka till meny
    returnToMenu() {
        if (window.showMenu) {
            window.showMenu();
            this.announceToScreenReader('Tillbaka till huvudmenyn');
        }
    }

    // Pil-navigation
    navigateWithArrows(event) {
        const focusableElements = document.querySelectorAll(this.focusableElements);
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        
        if (currentIndex === -1) return;
        
        let nextIndex;
        if (event.key === 'ArrowDown') {
            nextIndex = (currentIndex + 1) % focusableElements.length;
        } else {
            nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
        }
        
        focusableElements[nextIndex].focus();
        event.preventDefault();
    }

    // Spara preferenser
    savePreferences() {
        const preferences = {
            highContrastMode: this.highContrastMode,
            textSize: this.textSize,
            colorBlindMode: this.colorBlindMode,
            dyslexiaMode: this.dyslexiaMode
        };
        
        localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));
    }

    // Ladda preferenser
    loadAccessibilityPreferences() {
        const stored = localStorage.getItem('accessibility-preferences');
        if (stored) {
            try {
                const preferences = JSON.parse(stored);
                
                if (preferences.highContrastMode) {
                    this.highContrastMode = true;
                    document.body.classList.add('high-contrast-theme');
                }
                
                if (preferences.textSize && preferences.textSize !== 'normal') {
                    this.textSize = preferences.textSize;
                    document.body.classList.add(`text-size-${this.textSize}`);
                }
                
                if (preferences.colorBlindMode) {
                    this.colorBlindMode = true;
                    document.body.classList.add('colorblind-friendly');
                }
                
                if (preferences.dyslexiaMode) {
                    this.dyslexiaMode = true;
                    document.body.classList.add('dyslexia-friendly');
                }
                
            } catch (e) {
                console.warn('Kunde inte ladda tillgänglighetspreferenser:', e);
            }
        }
    }

    // Meddela spelstatus
    announceGameStatus(isCorrect, productName, correctPLU, userAnswer) {
        let message;
        
        if (isCorrect) {
            message = `Rätt! PLU-koden för ${productName} är ${correctPLU}. Bra jobbat!`;
        } else {
            message = `Fel svar. Du skrev ${userAnswer}, men rätt PLU-kod för ${productName} är ${correctPLU}. Försök igen nästa gång!`;
        }
        
        this.announceToScreenReader(message, 'assertive');
    }

    // Meddela poänguppdatering
    announceScoreUpdate(newScore, totalQuestions) {
        const message = `Poäng uppdaterad. Du har nu ${newScore} av ${totalQuestions} rätt.`;
        this.announceToScreenReader(message);
    }

    // Förbättra input-tillgänglighet
    enhanceInputAccessibility(inputElement) {
        if (!inputElement) return;
        
        // Lägg till beskrivning
        inputElement.setAttribute('aria-describedby', 'plu-input-description');
        
        // Skapa beskrivning om den inte finns
        if (!document.getElementById('plu-input-description')) {
            const description = document.createElement('div');
            description.id = 'plu-input-description';
            description.className = 'sr-only';
            description.textContent = 'Ange en fyrsiffrig PLU-kod. Använd bara siffror.';
            inputElement.parentNode.appendChild(description);
        }
        
        // Live validation feedback
        inputElement.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.length === 4 && /^\d{4}$/.test(value)) {
                this.announceToScreenReader('Fyrsiffrig kod ifylld');
            }
        });
    }
}

// Initiera Accessibility Manager
const accessibilityManager = new AccessibilityManager();

// ⚡ Prestanda-optimeringsmanager
class PerformanceManager {
    constructor() {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            memoryUsage: 0,
            framesDropped: 0,
            cacheHits: 0,
            networkRequests: 0
        };
        this.observers = {};
        this.lazyComponents = new Map();
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
        this.init();
    }

    init() {
        this.measureLoadTime();
        this.setupPerformanceObserver();
        this.optimizeAnimations();
        this.setupLazyLoading();
        this.monitorMemoryUsage();
        this.setupResourceHints();
        console.log('⚡ PerformanceManager initialiserad');
    }

    // Mät laddningstid
    measureLoadTime() {
        const startTime = performance.now();
        
        if (document.readyState === 'complete') {
            this.calculateLoadTime(startTime);
        } else {
            window.addEventListener('load', () => {
                this.calculateLoadTime(startTime);
            });
        }
    }

    calculateLoadTime(startTime) {
        this.metrics.loadTime = performance.now() - startTime;
        console.log(`⏱️ Total laddningstid: ${this.metrics.loadTime.toFixed(2)}ms`);
        
        // Rapportera till analytics om tillgängligt
        if (window.gtag) {
            window.gtag('event', 'page_load_time', {
                value: Math.round(this.metrics.loadTime)
            });
        }
    }

    // Performance Observer för att övervaka prestanda
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Övervaka längre uppgifter (> 50ms)
            const longTaskObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.duration > 50) {
                        console.warn(`⚠️ Lång uppgift upptäckt: ${entry.duration.toFixed(2)}ms`);
                        this.optimizeLongTask(entry);
                    }
                });
            });
            longTaskObserver.observe({ entryTypes: ['longtask'] });

            // Övervaka layout shifts
            const layoutShiftObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.value > 0.1) {
                        console.warn(`⚠️ Layout shift upptäckt: ${entry.value}`);
                    }
                });
            });
            layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    // Optimera animationer för bättre prestanda
    optimizeAnimations() {
        // Använd CSS transforms istället för att ändra layout-properties
        this.setupHardwareAcceleration();
        
        // Begränsa animationer baserat på device capabilities
        if (this.isLowEndDevice()) {
            document.body.classList.add('reduced-animations');
            console.log('📱 Låg-prestanda enhet upptäckt, begränsar animationer');
        }
    }

    setupHardwareAcceleration() {
        const animatedElements = document.querySelectorAll('.product-card, .btn, button');
        animatedElements.forEach(element => {
            element.style.willChange = 'transform, opacity';
            element.style.transform = 'translateZ(0)'; // Force GPU layer
        });
    }

    isLowEndDevice() {
        // Detektera baserat på navigator.hardwareConcurrency och connection
        const cores = navigator.hardwareConcurrency || 2;
        const connection = navigator.connection;
        const slowConnection = connection && (
            connection.effectiveType === '2g' || 
            connection.effectiveType === 'slow-2g'
        );
        
        return cores <= 2 || slowConnection;
    }

    // Lazy loading för komponenter
    setupLazyLoading() {
        // Lazy load achievements, leaderboard, etc.
        this.registerLazyComponent('achievements', () => import('./components/achievements.js'));
        this.registerLazyComponent('leaderboard', () => import('./components/leaderboard.js'));
        
        // Intersection Observer för lazy loading
        if ('IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadLazyComponent(entry.target.dataset.component);
                        lazyObserver.unobserve(entry.target);
                    }
                });
            });

            // Observera lazy components
            document.querySelectorAll('[data-lazy-component]').forEach(el => {
                lazyObserver.observe(el);
            });
        }
    }

    registerLazyComponent(name, loader) {
        this.lazyComponents.set(name, {
            loader,
            loaded: false,
            loading: false
        });
    }

    async loadLazyComponent(name) {
        const component = this.lazyComponents.get(name);
        if (!component || component.loaded || component.loading) return;

        component.loading = true;
        try {
            const module = await component.loader();
            component.loaded = true;
            component.module = module;
            console.log(`✅ Lazy component '${name}' laddad`);
        } catch (error) {
            console.error(`❌ Kunde inte ladda component '${name}':`, error);
        } finally {
            component.loading = false;
        }
    }

    // Debounce för att begränsa funktionsanrop
    debounce(func, wait, key) {
        const existingTimer = this.debounceTimers.get(key);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        const timer = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, wait);

        this.debounceTimers.set(key, timer);
    }

    // Throttle för att begränsa funktionsanrop
    throttle(func, limit, key) {
        const existingTimer = this.throttleTimers.get(key);
        if (existingTimer) return;

        func();
        const timer = setTimeout(() => {
            this.throttleTimers.delete(key);
        }, limit);

        this.throttleTimers.set(key, timer);
    }

    // Övervaka minnesanvändning
    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.metrics.memoryUsage = memory.usedJSHeapSize;
                
                // Varna om hög minnesanvändning
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
                    console.warn('⚠️ Hög minnesanvändning upptäckt');
                    this.cleanupMemory();
                }
            }, 30000); // Kontrollera var 30:e sekund
        }
    }

    cleanupMemory() {
        // Rensa gamla event listeners
        this.cleanupEventListeners();
        
        // Rensa onödiga DOM-element
        this.cleanupDOMElements();
        
        // Force garbage collection i utvecklingsläge
        if (window.gc && typeof window.gc === 'function') {
            window.gc();
        }
        
        console.log('🧹 Minnesrensning utförd');
    }

    cleanupEventListeners() {
        // Rensa gamla toast notifications
        document.querySelectorAll('.toast:not(.show)').forEach(toast => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }

    cleanupDOMElements() {
        // Rensa gamla feedback-element
        const oldFeedback = document.querySelectorAll('.feedback:empty');
        oldFeedback.forEach(element => {
            if (element.parentNode && !element.hasAttribute('aria-live')) {
                element.parentNode.removeChild(element);
            }
        });
    }

    // Resource hints för snabbare laddning
    setupResourceHints() {
        // Preload kritiska resurser
        this.preloadCriticalResources();
        
        // Prefetch troliga nästa resurser
        this.prefetchLikelyResources();
    }

    preloadCriticalResources() {
        const criticalImages = ['images/morot.jpg', 'images/potatis.jpg'];
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    prefetchLikelyResources() {
        // Prefetch bilder som troligen kommer att användas
        const likelyImages = ['images/gurka.jpg', 'images/rodlok.jpg'];
        setTimeout(() => {
            likelyImages.forEach(src => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = src;
                document.head.appendChild(link);
            });
        }, 2000); // Vänta 2 sekunder efter laddning
    }

    // Optimera uppgifter som tar lång tid
    optimizeLongTask(entry) {
        // Bryt upp långa uppgifter med setTimeout
        if (entry.name.includes('javascript')) {
            console.log('💡 Förslag: Dela upp lång JavaScript-uppgift med setTimeout/requestIdleCallback');
        }
    }

    // Critical CSS inlining
    inlineCriticalCSS() {
        const criticalCSS = `
            /* Critical CSS för above-the-fold innehåll */
            .game-container { 
                max-width: 800px; 
                margin: 0 auto; 
                padding: 20px; 
            }
            .product-card { 
                background: white; 
                border-radius: 12px; 
                padding: 20px; 
                box-shadow: 0 4px 8px rgba(0,0,0,0.1); 
            }
            button { 
                background: #dc3545; 
                color: white; 
                border: none; 
                padding: 12px 24px; 
                border-radius: 8px; 
                cursor: pointer; 
            }
        `;

        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.insertBefore(style, document.head.firstChild);
    }

    // Rapportera prestanda-metrics
    reportMetrics() {
        const report = {
            loadTime: this.metrics.loadTime,
            memoryUsage: this.metrics.memoryUsage,
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: Date.now()
        };

        console.log('📊 Prestanda-rapport:', report);
        
        // Skicka till analytics/monitoring service
        if (window.performance && window.performance.mark) {
            window.performance.mark('performance-report');
        }

        return report;
    }

    // Starta prestanda-övervakning
    startMonitoring() {
        // Övervaka FPS
        let frames = 0;
        let lastTime = performance.now();

        const countFPS = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                if (fps < 30) {
                    console.warn(`⚠️ Låg FPS upptäckt: ${fps}fps`);
                }
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(countFPS);
        };

        requestAnimationFrame(countFPS);
    }
}

// Initiera Performance Manager
const performanceManager = new PerformanceManager();

// Global prestanda-optimerad toast function
window.showToast = (function() {
    let toastContainer = null;
    let toastQueue = [];
    let isProcessing = false;
    const maxToasts = 3;

    function createToastContainer() {
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(toastContainer);
        }
        return toastContainer;
    }

    function createToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 6px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            max-width: 300px;
            word-wrap: break-word;
            will-change: transform;
        `;
        toast.textContent = message;
        return toast;
    }

    function processToastQueue() {
        if (isProcessing || toastQueue.length === 0) return;
        
        isProcessing = true;
        const container = createToastContainer();
        
        // Begränsa antal samtidiga toasts
        while (container.children.length >= maxToasts && container.firstChild) {
            container.removeChild(container.firstChild);
        }

        const { message, type } = toastQueue.shift();
        const toast = createToast(message, type);
        
        container.appendChild(toast);

        // Animera in med requestAnimationFrame för bättre prestanda
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        // Auto-remove med cleanup
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        container.removeChild(toast);
                    }
                    isProcessing = false;
                    processToastQueue(); // Process next in queue
                }, 300);
            } else {
                isProcessing = false;
                processToastQueue();
            }
        }, 3000);
    }

    return function(message, type = 'info') {
        // Debounce samma meddelanden
        if (performanceManager) {
            performanceManager.debounce(() => {
                toastQueue.push({ message, type });
                processToastQueue();
            }, 200, `toast-${message}`);
        } else {
            toastQueue.push({ message, type });
            processToastQueue();
        }
    };
})();

// 💾 Export/Import Manager för speldata
class DataManager {
    constructor() {
        this.dataVersion = '1.0';
        this.supportedFormats = ['json', 'csv'];
        this.compressionEnabled = true;
        this.encryptionEnabled = false; // För framtida säkerhet
        this.init();
    }

    init() {
        this.setupExportButtons();
        this.setupImportHandlers();
        console.log('💾 DataManager initialiserad');
    }

    // Samla all speldata
    collectGameData() {
        const data = {
            version: this.dataVersion,
            timestamp: new Date().toISOString(),
            playerName: window.firebaseManager?.currentUserName || 'Anonym',
            gameData: {
                totalGamesPlayed: parseInt(localStorage.getItem('totalGamesPlayed') || '0'),
                totalCorrectAnswers: parseInt(localStorage.getItem('totalCorrectAnswers') || '0'),
                bestScore: parseInt(localStorage.getItem('bestScore') || '0'),
                bestScoreDetails: JSON.parse(localStorage.getItem('bestScoreDetails') || 'null'),
                totalPlayTime: parseInt(localStorage.getItem('totalPlayTime') || '0'),
                averageResponseTime: parseFloat(localStorage.getItem('averageResponseTime') || '0'),
                streakRecord: parseInt(localStorage.getItem('streakRecord') || '0')
            },
            highscores: this.getHighscores(),
            achievements: this.getAchievements(),
            settings: this.getSettings(),
            statistics: this.getDetailedStatistics(),
            preferences: this.getPreferences()
        };

        return data;
    }

    getHighscores() {
        try {
            return JSON.parse(localStorage.getItem('highscores') || '[]');
        } catch (e) {
            console.warn('Kunde inte ladda highscores:', e);
            return [];
        }
    }

    getAchievements() {
        try {
            const achievements = JSON.parse(localStorage.getItem('achievements') || '{}');
            return Object.entries(achievements).map(([key, achievement]) => ({
                id: key,
                name: achievement.name,
                description: achievement.description,
                unlocked: achievement.unlocked,
                unlockedAt: achievement.unlockedAt,
                icon: achievement.icon
            }));
        } catch (e) {
            console.warn('Kunde inte ladda achievements:', e);
            return [];
        }
    }

    getSettings() {
        return {
            theme: localStorage.getItem('theme') || 'light',
            soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
            animationsEnabled: localStorage.getItem('animationsEnabled') !== 'false',
            difficulty: localStorage.getItem('difficulty') || 'normal',
            language: localStorage.getItem('language') || 'sv'
        };
    }

    getDetailedStatistics() {
        return {
            gamesPerDay: JSON.parse(localStorage.getItem('gamesPerDay') || '{}'),
            productAccuracy: JSON.parse(localStorage.getItem('productAccuracy') || '{}'),
            timeSpentPerSession: JSON.parse(localStorage.getItem('timeSpentPerSession') || '[]'),
            improvementTrend: JSON.parse(localStorage.getItem('improvementTrend') || '[]'),
            categoryPerformance: JSON.parse(localStorage.getItem('categoryPerformance') || '{}')
        };
    }

    getPreferences() {
        try {
            return {
                accessibility: JSON.parse(localStorage.getItem('accessibility-preferences') || '{}'),
                gameOptions: JSON.parse(localStorage.getItem('gameOptions') || '{}'),
                uiPreferences: JSON.parse(localStorage.getItem('uiPreferences') || '{}')
            };
        } catch (e) {
            return {};
        }
    }

    // Exportera data till JSON
    exportToJSON() {
        try {
            const data = this.collectGameData();
            const jsonString = JSON.stringify(data, null, 2);
            
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const filename = `plu-memory-backup-${new Date().toISOString().split('T')[0]}.json`;
            this.downloadFile(url, filename);
            
            window.showToast('📁 Speldata exporterad som JSON', 'success');
            console.log('✅ Data exporterad till JSON');
            
        } catch (error) {
            console.error('❌ Export till JSON misslyckades:', error);
            window.showToast('❌ Export misslyckades', 'error');
        }
    }

    // Exportera data till CSV
    exportToCSV() {
        try {
            const data = this.collectGameData();
            const csvContent = this.convertToCSV(data);
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const filename = `plu-memory-stats-${new Date().toISOString().split('T')[0]}.csv`;
            this.downloadFile(url, filename);
            
            window.showToast('📊 Statistik exporterad som CSV', 'success');
            console.log('✅ Data exporterad till CSV');
            
        } catch (error) {
            console.error('❌ Export till CSV misslyckades:', error);
            window.showToast('❌ CSV export misslyckades', 'error');
        }
    }

    convertToCSV(data) {
        const rows = [];
        
        // Header
        rows.push(['Typ', 'Namn', 'Värde', 'Datum']);
        
        // Grundläggande speldata
        Object.entries(data.gameData).forEach(([key, value]) => {
            rows.push(['Speldata', this.translateKey(key), value, data.timestamp]);
        });
        
        // Highscores
        data.highscores.forEach((score, index) => {
            rows.push(['Highscore', `Plats ${index + 1}`, `${score.score}/${score.total} (${score.percentage}%)`, score.date]);
        });
        
        // Achievements
        data.achievements.forEach(achievement => {
            if (achievement.unlocked) {
                rows.push(['Achievement', achievement.name, 'Upplåst', achievement.unlockedAt || data.timestamp]);
            }
        });
        
        // Inställningar
        Object.entries(data.settings).forEach(([key, value]) => {
            rows.push(['Inställning', this.translateKey(key), value, data.timestamp]);
        });
        
        // Konvertera till CSV-format
        return rows.map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    translateKey(key) {
        const translations = {
            totalGamesPlayed: 'Totalt antal spel',
            totalCorrectAnswers: 'Totalt rätt svar',
            bestScore: 'Bästa poäng',
            totalPlayTime: 'Total speltid (min)',
            averageResponseTime: 'Genomsnittlig svarstid (ms)',
            streakRecord: 'Längsta streak',
            theme: 'Tema',
            soundEnabled: 'Ljud aktiverat',
            animationsEnabled: 'Animationer aktiverade',
            difficulty: 'Svårighetsgrad',
            language: 'Språk'
        };
        return translations[key] || key;
    }

    downloadFile(url, filename) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Importera data från fil
    async importFromFile(file) {
        try {
            if (!this.validateFileType(file)) {
                throw new Error('Ogiltigt filformat. Endast JSON-filer stöds.');
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                throw new Error('Filen är för stor. Maximal storlek är 10MB.');
            }

            const content = await this.readFile(file);
            const data = JSON.parse(content);
            
            if (!this.validateDataStructure(data)) {
                throw new Error('Ogiltigt dataformat i filen.');
            }

            const confirmation = await this.showImportConfirmation(data);
            if (!confirmation) {
                window.showToast('Import avbruten', 'info');
                return;
            }

            await this.mergeData(data);
            window.showToast('✅ Data importerad framgångsrikt!', 'success');
            
            // Uppdatera UI
            this.refreshUI();
            
        } catch (error) {
            console.error('❌ Import misslyckades:', error);
            window.showToast(`❌ Import misslyckades: ${error.message}`, 'error');
        }
    }

    validateFileType(file) {
        return file.type === 'application/json' || file.name.endsWith('.json');
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Kunde inte läsa filen'));
            reader.readAsText(file);
        });
    }

    validateDataStructure(data) {
        // Kontrollera att data har rätt struktur
        const requiredFields = ['version', 'timestamp', 'gameData'];
        return requiredFields.every(field => field in data);
    }

    async showImportConfirmation(data) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>🔄 Importera speldata</h2>
                        <button class="close-btn" aria-label="Stäng">&times;</button>
                    </div>
                    <div class="modal-body">
                        <h3>Fil information:</h3>
                        <ul>
                            <li><strong>Spelare:</strong> ${data.playerName || 'Okänd'}</li>
                            <li><strong>Export datum:</strong> ${new Date(data.timestamp).toLocaleDateString('sv-SE')}</li>
                            <li><strong>Antal spel:</strong> ${data.gameData?.totalGamesPlayed || 0}</li>
                            <li><strong>Bästa poäng:</strong> ${data.gameData?.bestScore || 0}</li>
                            <li><strong>Achievements:</strong> ${data.achievements?.filter(a => a.unlocked).length || 0} upplåsta</li>
                        </ul>
                        <div class="import-options">
                            <label>
                                <input type="checkbox" id="mergeHighscores" checked>
                                Slå samman highscores
                            </label>
                            <label>
                                <input type="checkbox" id="mergeAchievements" checked>
                                Slå samman achievements
                            </label>
                            <label>
                                <input type="checkbox" id="importSettings" checked>
                                Importera inställningar
                            </label>
                        </div>
                        <p class="warning">⚠️ Detta kommer att uppdatera din befintliga data.</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary cancel-import">Avbryt</button>
                        <button class="btn btn-primary confirm-import">Importera</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.close-btn').onclick = () => {
                modal.remove();
                resolve(false);
            };

            modal.querySelector('.cancel-import').onclick = () => {
                modal.remove();
                resolve(false);
            };

            modal.querySelector('.confirm-import').onclick = () => {
                const options = {
                    mergeHighscores: modal.querySelector('#mergeHighscores').checked,
                    mergeAchievements: modal.querySelector('#mergeAchievements').checked,
                    importSettings: modal.querySelector('#importSettings').checked
                };
                this.importOptions = options;
                modal.remove();
                resolve(true);
            };
        });
    }

    async mergeData(importedData) {
        const options = this.importOptions || {};

        // Slå samman speldata (alltid)
        this.mergeGameData(importedData.gameData);

        // Slå samman highscores om valt
        if (options.mergeHighscores && importedData.highscores) {
            this.mergeHighscores(importedData.highscores);
        }

        // Slå samman achievements om valt
        if (options.mergeAchievements && importedData.achievements) {
            this.mergeAchievements(importedData.achievements);
        }

        // Importera inställningar om valt
        if (options.importSettings && importedData.settings) {
            this.importSettings(importedData.settings);
        }

        // Spara import-historik
        this.saveImportHistory(importedData);
    }

    mergeGameData(importedGameData) {
        Object.entries(importedGameData).forEach(([key, value]) => {
            const currentValue = parseInt(localStorage.getItem(key) || '0');
            const newValue = key === 'bestScore' ? 
                Math.max(currentValue, value) : 
                currentValue + value;
            localStorage.setItem(key, newValue.toString());
        });
    }

    mergeHighscores(importedHighscores) {
        const currentHighscores = this.getHighscores();
        const merged = [...currentHighscores, ...importedHighscores]
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 10); // Behåll endast top 10

        localStorage.setItem('highscores', JSON.stringify(merged));
    }

    mergeAchievements(importedAchievements) {
        const currentAchievements = JSON.parse(localStorage.getItem('achievements') || '{}');
        
        importedAchievements.forEach(achievement => {
            if (achievement.unlocked) {
                currentAchievements[achievement.id] = {
                    ...achievement,
                    unlocked: true,
                    unlockedAt: achievement.unlockedAt || new Date().toISOString()
                };
            }
        });

        localStorage.setItem('achievements', JSON.stringify(currentAchievements));
    }

    importSettings(importedSettings) {
        Object.entries(importedSettings).forEach(([key, value]) => {
            localStorage.setItem(key, value.toString());
        });
    }

    saveImportHistory(importedData) {
        const history = JSON.parse(localStorage.getItem('importHistory') || '[]');
        history.push({
            timestamp: new Date().toISOString(),
            originalTimestamp: importedData.timestamp,
            playerName: importedData.playerName,
            dataVersion: importedData.version
        });
        
        // Behåll endast senaste 10 imports
        if (history.length > 10) {
            history.splice(0, history.length - 10);
        }
        
        localStorage.setItem('importHistory', JSON.stringify(history));
    }

    refreshUI() {
        // Uppdatera highscore display
        if (window.highscoreManager) {
            window.highscoreManager.displayHighscores();
        }

        // Uppdatera achievements display
        if (window.achievementsManager) {
            window.achievementsManager.displayAchievements();
        }

        // Uppdatera andra UI-element
        window.location.reload(); // Enkel lösning för att uppdatera allt
    }

    setupExportButtons() {
        // Lägg till export-knappar till profil-sektionen
        const profileSection = document.getElementById('profile');
        if (profileSection) {
            const exportSection = document.createElement('div');
            exportSection.className = 'export-section';
            exportSection.innerHTML = `
                <h3>📁 Exportera speldata</h3>
                <p>Säkerhetskopiera din speldata för att dela mellan enheter.</p>
                <div class="export-buttons">
                    <button type="button" class="btn btn-primary" id="exportJSON">
                        📄 Exportera JSON
                    </button>
                    <button type="button" class="btn btn-secondary" id="exportCSV">
                        📊 Exportera CSV
                    </button>
                    <button type="button" class="btn btn-outline" id="manualBackup">
                        💾 Skapa backup
                    </button>
                </div>
                <div class="backup-info">
                    <p>💡 <strong>Tips:</strong> Automatiska backups skapas var 24:e timme lokalt.</p>
                    <button type="button" class="btn-link" id="showBackupHistory">
                        📋 Visa backup-historik
                    </button>
                </div>
            `;
            profileSection.appendChild(exportSection);

            // Lägg till event listeners
            document.getElementById('exportJSON')?.addEventListener('click', () => this.exportToJSON());
            document.getElementById('exportCSV')?.addEventListener('click', () => this.exportToCSV());
            document.getElementById('manualBackup')?.addEventListener('click', () => {
                if (window.backupManager) {
                    window.backupManager.createManualBackup();
                }
            });
            document.getElementById('showBackupHistory')?.addEventListener('click', () => this.showBackupHistory());
        }
    }

    setupImportHandlers() {
        // Lägg till import-sektion
        const profileSection = document.getElementById('profile');
        if (profileSection) {
            const importSection = document.createElement('div');
            importSection.className = 'import-section';
            importSection.innerHTML = `
                <h3>📂 Importera speldata</h3>
                <p>Återställ speldata från en tidigare export.</p>
                <div class="import-area">
                    <input type="file" id="importFile" accept=".json" style="display: none;">
                    <button type="button" class="btn btn-outline" id="selectImportFile">
                        📁 Välj fil att importera
                    </button>
                    <div class="drop-zone" id="dropZone">
                        <p>🎯 Dra och släpp en JSON-fil här</p>
                    </div>
                </div>
            `;
            profileSection.appendChild(importSection);

            // Setup file input
            const fileInput = document.getElementById('importFile');
            const selectButton = document.getElementById('selectImportFile');
            const dropZone = document.getElementById('dropZone');

            selectButton?.addEventListener('click', () => fileInput?.click());
            fileInput?.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.importFromFile(e.target.files[0]);
                }
            });

            // Setup drag and drop
            if (dropZone) {
                dropZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropZone.classList.add('drag-over');
                });

                dropZone.addEventListener('dragleave', () => {
                    dropZone.classList.remove('drag-over');
                });

                dropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropZone.classList.remove('drag-over');
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        this.importFromFile(files[0]);
                    }
                });
            }
        }
    }
    
    showBackupHistory() {
        const backups = window.backupManager ? window.backupManager.getAvailableBackups() : [];
        
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📋 Backup-historik</h2>
                    <button class="close-btn" aria-label="Stäng">&times;</button>
                </div>
                <div class="modal-body">
                    ${backups.length > 0 ? `
                        <p>Automatiska backups som sparats lokalt:</p>
                        <div class="backup-list">
                            ${backups.map(backup => `
                                <div class="backup-item">
                                    <span class="backup-date">📁 ${backup.date}</span>
                                    <button class="btn-small restore-backup" data-key="${backup.key}">
                                        Återställ
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <div class="backup-actions">
                            <button class="btn btn-outline" id="exportBackupHistory">
                                📊 Exportera historik
                            </button>
                        </div>
                    ` : `
                        <p>Inga automatiska backups hittades.</p>
                        <p>Backups skapas automatiskt var 24:e timme när du spelar.</p>
                    `}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-history">Stäng</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.close-btn').onclick = () => modal.remove();
        modal.querySelector('.close-history').onclick = () => modal.remove();
        
        modal.querySelectorAll('.restore-backup').forEach(btn => {
            btn.addEventListener('click', async () => {
                const backupKey = btn.dataset.key;
                if (window.backupManager) {
                    await window.backupManager.restoreFromBackup(backupKey);
                    modal.remove();
                }
            });
        });

        const exportBtn = modal.querySelector('#exportBackupHistory');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                if (window.backupManager) {
                    window.backupManager.exportBackupHistory();
                }
            });
        }
    }
}

// Initiera Data Manager
const dataManager = new DataManager();
window.dataManager = dataManager;

// 🔄 Automatisk backup och synkronisering
class BackupManager {
    constructor() {
        this.autoBackupEnabled = true;
        this.backupInterval = 24 * 60 * 60 * 1000; // 24 timmar
        this.maxLocalBackups = 5;
        this.cloudSyncEnabled = false; // För framtida implementering
        this.init();
    }

    init() {
        this.setupAutoBackup();
        this.cleanOldBackups();
        // this.checkForDataRecovery(); // Inaktiverad - för irriterande popup
        console.log('🔄 BackupManager initialiserad');
    }

    setupAutoBackup() {
        // Kontrollera om det är dags för backup
        const lastBackup = localStorage.getItem('lastAutoBackup');
        const now = Date.now();
        
        if (!lastBackup || (now - parseInt(lastBackup)) > this.backupInterval) {
            this.performAutoBackup();
        }

        // Sätt upp regelbunden backup
        setInterval(() => {
            if (this.autoBackupEnabled) {
                this.performAutoBackup();
            }
        }, this.backupInterval);
    }

    async performAutoBackup() {
        try {
            const data = dataManager.collectGameData();
            const backupKey = `autoBackup_${Date.now()}`;
            
            // Spara lokalt (komprimerat)
            const compressedData = await this.compressData(data);
            localStorage.setItem(backupKey, compressedData);
            localStorage.setItem('lastAutoBackup', Date.now().toString());
            
            console.log('✅ Automatisk backup skapad');
            
            // Meddela användaren diskret (ingen popup)
            if (document.querySelector('.backup-indicator')) {
                document.querySelector('.backup-indicator').textContent = '💾 Backup skapad';
                setTimeout(() => {
                    const indicator = document.querySelector('.backup-indicator');
                    if (indicator) indicator.textContent = '';
                }, 3000);
            }
            
        } catch (error) {
            console.error('❌ Automatisk backup misslyckades:', error);
        }
    }

    async compressData(data) {
        // Enkel komprimering genom att ta bort onödig whitespace
        const jsonString = JSON.stringify(data);
        
        // I framtiden kan vi använda CompressionStream API
        if ('CompressionStream' in window) {
            try {
                const stream = new CompressionStream('gzip');
                const writer = stream.writable.getWriter();
                const reader = stream.readable.getReader();
                
                writer.write(new TextEncoder().encode(jsonString));
                writer.close();
                
                const chunks = [];
                let done = false;
                
                while (!done) {
                    const { value, done: streamDone } = await reader.read();
                    done = streamDone;
                    if (value) chunks.push(value);
                }
                
                return btoa(String.fromCharCode(...new Uint8Array(chunks.flat())));
            } catch (e) {
                // Fallback till base64 encoding
                return btoa(jsonString);
            }
        }
        
        return btoa(jsonString);
    }

    async decompressData(compressedData) {
        try {
            return JSON.parse(atob(compressedData));
        } catch (e) {
            console.error('Kunde inte dekomprimera data:', e);
            return null;
        }
    }

    cleanOldBackups() {
        // Hitta alla auto-backups
        const backupKeys = Object.keys(localStorage)
            .filter(key => key.startsWith('autoBackup_'))
            .sort()
            .reverse(); // Nyaste först

        // Ta bort gamla backups om vi har för många
        if (backupKeys.length > this.maxLocalBackups) {
            const toDelete = backupKeys.slice(this.maxLocalBackups);
            toDelete.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ Gammal backup borttagen: ${key}`);
            });
        }
    }

    async checkForDataRecovery() {
        // Funktion inaktiverad för att undvika irriterande popups
        console.log('Data recovery check disabled to prevent annoying popups');
        return;
    }

    getAvailableBackups() {
        return Object.keys(localStorage)
            .filter(key => key.startsWith('autoBackup_'))
            .map(key => ({
                key,
                timestamp: parseInt(key.replace('autoBackup_', '')),
                date: new Date(parseInt(key.replace('autoBackup_', ''))).toLocaleDateString('sv-SE')
            }))
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    async offerDataRecovery(backups) {
        const shouldRecover = await this.showRecoveryDialog(backups);
        if (shouldRecover) {
            const selectedBackup = backups[0]; // Senaste backup
            await this.restoreFromBackup(selectedBackup.key);
        }
    }

    async showRecoveryDialog(backups) {
        // Funktion inaktiverad för att undvika irriterande popups
        return false;
    }

    async restoreFromBackup(backupKey) {
        try {
            const compressedData = localStorage.getItem(backupKey);
            const data = await this.decompressData(compressedData);
            
            if (data && dataManager.validateDataStructure(data)) {
                await dataManager.mergeData(data);
                window.showToast('✅ Data återställd från backup!', 'success');
                dataManager.refreshUI();
            } else {
                throw new Error('Ogiltig backup-data');
            }
        } catch (error) {
            console.error('❌ Återställning misslyckades:', error);
            window.showToast('❌ Kunde inte återställa backup', 'error');
        }
    }

    // Manuell backup
    createManualBackup() {
        try {
            const data = dataManager.collectGameData();
            const timestamp = Date.now();
            const filename = `plu-memory-manual-backup-${new Date(timestamp).toISOString().split('T')[0]}.json`;
            
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            dataManager.downloadFile(url, filename);
            window.showToast('📁 Manuell backup skapad', 'success');
            
        } catch (error) {
            console.error('❌ Manuell backup misslyckades:', error);
            window.showToast('❌ Backup misslyckades', 'error');
        }
    }

    // Visa backup-status i UI
    addBackupIndicator() {
        const header = document.querySelector('header');
        if (header && !document.querySelector('.backup-indicator')) {
            const indicator = document.createElement('div');
            indicator.className = 'backup-indicator';
            indicator.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                font-size: 0.8rem;
                color: var(--text-secondary);
                opacity: 0.7;
            `;
            header.style.position = 'relative';
            header.appendChild(indicator);
        }
    }

    // Framtida: Cloud sync funktionalitet
    async setupCloudSync() {
        // Placeholder för framtida cloud sync (Google Drive, OneDrive, etc.)
        if (this.cloudSyncEnabled) {
            console.log('🌐 Cloud sync kommer i framtida version');
        }
    }

    // Export backup-historik
    exportBackupHistory() {
        const backups = this.getAvailableBackups();
        const historyData = {
            backups: backups.map(backup => ({
                date: backup.date,
                timestamp: backup.timestamp,
                size: localStorage.getItem(backup.key)?.length || 0
            })),
            totalBackups: backups.length,
            oldestBackup: backups[backups.length - 1]?.date,
            newestBackup: backups[0]?.date
        };

        const jsonString = JSON.stringify(historyData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const filename = `plu-memory-backup-history-${new Date().toISOString().split('T')[0]}.json`;
        dataManager.downloadFile(url, filename);
    }
}

// Initiera Backup Manager
const backupManager = new BackupManager();
window.backupManager = backupManager;

// Embedded product data - alla 21 produkter från JSON-filen
const products = [
    // Grönsaker
    { name: "Morot", plu: "4562", image: "images/morot.jpg", category: "grönsaker", difficulty: "vanlig" },
    { name: "Potatis", plu: "4782", image: "images/potatis.jpg", category: "grönsaker", difficulty: "vanlig" },
    { name: "Röd lök", plu: "4086", image: "images/rodlok.jpg", category: "grönsaker", difficulty: "vanlig" },
    { name: "Gurka", plu: "4595", image: "images/gurka.jpg", category: "grönsaker", difficulty: "vanlig" },
    
    // Bröd
    { name: "Donut", plu: "2001", image: "images/donut.jpg", category: "bröd", difficulty: "vanlig" },
    { name: "Blåbärs Muffin", plu: "2002", image: "images/blabars_muffin.jpg", category: "bröd", difficulty: "medel" },
    { name: "Choklad Muffin", plu: "2003", image: "images/choklad_muffin.jpg", category: "bröd", difficulty: "medel" },
    { name: "Kanelknut", plu: "2004", image: "images/kanelknut.jpg", category: "bröd", difficulty: "ovanlig" },
    { name: "Kardemummaknut", plu: "2005", image: "images/kardemummaknut.jpg", category: "bröd", difficulty: "ovanlig" },
    { name: "Pistageknot", plu: "2006", image: "images/pistageknot.jpg", category: "bröd", difficulty: "ovanlig" },
    { name: "Toscabulle", plu: "2007", image: "images/toscabulle.jpg", category: "bröd", difficulty: "medel" },
    
    // Snacks
    { name: "Lösgodis", plu: "3001", image: "images/lossgodis.jpg", category: "snacks", difficulty: "vanlig" },
    { name: "Naturgodis", plu: "3002", image: "images/naturgodis.jpg", category: "snacks", difficulty: "medel" },
    { name: "Lösgodis Personal", plu: "3003", image: "images/lossgodis_personal.jpg", category: "snacks", difficulty: "ovanlig" },
    
    // Bakverk
    { name: "Prinsesstårta", plu: "4001", image: "images/prinsesstarta.jpg", category: "bakverk", difficulty: "medel" },
    { name: "Napoleonbakelse", plu: "4002", image: "images/napoleonbakelse.jpg", category: "bakverk", difficulty: "ovanlig" },
    { name: "Lyxbiskvi", plu: "4003", image: "images/lyxbiskvi.jpg", category: "bakverk", difficulty: "ovanlig" },
    
    // Söndagsbröd
    { name: "Ostfralla", plu: "5001", image: "images/ostfralla.jpg", category: "söndagsbröd", difficulty: "medel" },
    { name: "Balder", plu: "5002", image: "images/balder.jpg", category: "söndagsbröd", difficulty: "ovanlig" },
    { name: "Tor", plu: "5003", image: "images/tor.jpg", category: "söndagsbröd", difficulty: "ovanlig" },
    { name: "Kanelbulle", plu: "5004", image: "images/kanelbulle.jpg", category: "söndagsbröd", difficulty: "vanlig" }
];

// Game state
let currentProduct = null;
let score = 0;
let gamesPlayed = 0;
let correctAnswers = 0;
let gameProducts = []; // Produkter för aktuellt spel
let currentQuestionIndex = 0;
let totalQuestions = 4; // Kommer att uppdateras baserat på användarens val

// Highscore Manager Class
class HighscoreManager {
    constructor() {
        this.highscores = [];
        this.loadHighscores();
    }

    loadHighscores() {
        try {
            const saved = localStorage.getItem('pluGameHighscores');
            if (saved) {
                this.highscores = JSON.parse(saved);
            }
        } catch (error) {
            console.log('Kunde inte ladda highscores:', error);
            this.highscores = [];
        }
    }

    saveHighscores() {
        try {
            localStorage.setItem('pluGameHighscores', JSON.stringify(this.highscores));
        } catch (error) {
            console.log('Kunde inte spara highscores:', error);
        }
    }

    addScore(playerName, score, totalQuestions, percentage, categories, difficulty) {
        const newScore = {
            name: playerName,
            score: score,
            totalQuestions: totalQuestions,
            percentage: percentage,
            categories: categories,
            difficulty: difficulty,
            date: new Date().toLocaleDateString('sv-SE'),
            timestamp: Date.now()
        };

        this.highscores.push(newScore);
        
        // Sortera efter procent (högst först), sedan efter antal rätt
        this.highscores.sort((a, b) => {
            if (b.percentage !== a.percentage) {
                return b.percentage - a.percentage;
            }
            return b.score - a.score;
        });

        // Behåll bara top 10
        this.highscores = this.highscores.slice(0, 10);
        
        this.saveHighscores();
        
        // Returnera placeringen (1-indexerad)
        const placement = this.highscores.findIndex(score => score.timestamp === newScore.timestamp) + 1;
        return placement;
    }

    getTopScores(limit = 10) {
        return this.highscores.slice(0, limit);
    }

    isTopScore(percentage, score) {
        if (this.highscores.length < 10) return true;
        
        const worstTopScore = this.highscores[this.highscores.length - 1];
        return percentage > worstTopScore.percentage || 
               (percentage === worstTopScore.percentage && score > worstTopScore.score);
    }
}

// Funktion för att räkna tillgängliga produkter baserat på filter
function getFilteredProductCount() {
    let filteredProducts = [...products];
    
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    
    if (categoryFilter && categoryFilter.value !== 'alla') {
        filteredProducts = filteredProducts.filter(product => 
            product.category === categoryFilter.value
        );
    }
    
    if (difficultyFilter && difficultyFilter.value !== 'alla') {
        filteredProducts = filteredProducts.filter(product => 
            product.difficulty === difficultyFilter.value
        );
    }
    
    return filteredProducts.length;
}

// Funktion för att uppdatera antal-filtret baserat på tillgängliga produkter
function updateCountFilter() {
    const countFilter = document.getElementById('countFilter');
    if (!countFilter) {
        console.log('Count filter element not found, skipping update');
        return;
    }
    
    const availableProducts = getFilteredProductCount();
    const currentValue = countFilter.value;
    
    // Spara nuvarande värde om det fortfarande är giltigt
    let newValue = currentValue;
    
    // Rensa alla alternativ
    countFilter.innerHTML = '';
    
    // Lägg till alternativ baserat på tillgängliga produkter
    const options = [5, 10, 15, 21];
    let hasValidOption = false;
    
    for (const option of options) {
        if (option <= availableProducts) {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = `${option} produkter`;
            countFilter.appendChild(optionElement);
            hasValidOption = true;
        }
    }
    
    // Lägg alltid till "Alla produkter" alternativ
    const allOption = document.createElement('option');
    allOption.value = 'alla';
    allOption.textContent = `Alla produkter (${availableProducts})`;
    countFilter.appendChild(allOption);
    
    // Återställ värdet om det fortfarande är giltigt
    if (newValue === 'alla' || (parseInt(newValue) <= availableProducts && hasValidOption)) {
        countFilter.value = newValue;
    } else {
        // Om det tidigare värdet inte längre är giltigt, välj det största tillgängliga
        const validOptions = Array.from(countFilter.options).map(opt => opt.value);
        if (validOptions.includes('21') && availableProducts >= 21) {
            countFilter.value = '21';
        } else if (validOptions.includes('15') && availableProducts >= 15) {
            countFilter.value = '15';
        } else if (validOptions.includes('10') && availableProducts >= 10) {
            countFilter.value = '10';
        } else if (validOptions.includes('5') && availableProducts >= 5) {
            countFilter.value = '5';
        } else {
            countFilter.value = 'alla';
        }
    }
    
    console.log(`Antal-filter uppdaterat: ${availableProducts} produkter tillgängliga, valt: ${countFilter.value}`);
}

// Accessibility Preferences Class
class AccessibilityPreferences {
    constructor() {
        this.preferences = {
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            screenReader: false,
            keyboardNav: false
        };
        this.loadPreferences();
    }

    loadPreferences() {
        try {
            const saved = localStorage.getItem('accessibilityPreferences');
            if (saved) {
                this.preferences = { ...this.preferences, ...JSON.parse(saved) };
            }
            this.applyPreferences();
        } catch (error) {
            console.log('Kunde inte ladda accessibility preferences:', error);
        }
    }

    savePreferences() {
        try {
            localStorage.setItem('accessibilityPreferences', JSON.stringify(this.preferences));
        } catch (error) {
            console.log('Kunde inte spara accessibility preferences:', error);
        }
    }

    updatePreference(key, value) {
        this.preferences[key] = value;
        this.savePreferences();
        this.applyPreferences();
    }

    applyPreferences() {
        const body = document.body;
        
        // Apply data attributes for CSS targeting
        Object.keys(this.preferences).forEach(key => {
            body.setAttribute(`data-${key.toLowerCase().replace(/([A-Z])/g, '-$1')}`, 
                             this.preferences[key] ? 'true' : 'false');
        });
    }

    init() {
        console.log('AccessibilityPreferences initialiserad');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Setup accessibility control listeners
        const controls = {
            'high-contrast-toggle': 'highContrast',
            'large-text-toggle': 'largeText',
            'reduced-motion-toggle': 'reducedMotion',
            'screen-reader-toggle': 'screenReader',
            'keyboard-nav-toggle': 'keyboardNav'
        };

        Object.entries(controls).forEach(([id, prefKey]) => {
            const element = document.getElementById(id);
            if (element) {
                element.checked = this.preferences[prefKey];
                element.addEventListener('change', (e) => {
                    this.updatePreference(prefKey, e.target.checked);
                });
            }
        });
    }
}

// Achievements Manager
class AchievementsManager {
    constructor() {
        this.achievements = {
            // Grundläggande achievements
            firstCorrect: { unlocked: false, name: "Första rätta!", description: "Svarade rätt första gången", icon: "🎯" },
            tenCorrect: { unlocked: false, name: "PLU-expert", description: "10 rätta svar totalt", icon: "🏆" },
            perfectRound: { unlocked: false, name: "Perfekt runda", description: "Alla rätt i en runda", icon: "💯" },
            
            // Nya prestations-achievements
            allCorrect: { unlocked: false, name: "Felfri mästare", description: "100% rätt på minst 5 frågor", icon: "👑" },
            hardestLevel: { unlocked: false, name: "Ovanlig expert", description: "Klara alla ovanliga produkter", icon: "💎" },
            speedster: { unlocked: false, name: "Snabbtänkare", description: "Genomsnittlig svarstid under 3 sekunder", icon: "⚡" },
            
            // Kategori-achievements
            vegetableMaster: { unlocked: false, name: "Grönsaksguru", description: "Alla grönsaker rätt i en runda", icon: "🥕" },
            breadExpert: { unlocked: false, name: "Brödmästare", description: "Alla bröd rätt i en runda", icon: "🍞" },
            snackKing: { unlocked: false, name: "Snackskung", description: "Alla snacks rätt i en runda", icon: "🍿" },
            bakingGenius: { unlocked: false, name: "Bakgenius", description: "Alla bakverk rätt i en runda", icon: "🧁" },
            sundayBreadPro: { unlocked: false, name: "Söndagsbrödsproffs", description: "Alla söndagsbröd rätt i en runda", icon: "🥖" },
            
            // Sekvens-achievements
            streak5: { unlocked: false, name: "5 i rad", description: "5 rätta svar i följd", icon: "🔥" },
            streak10: { unlocked: false, name: "10 i rad", description: "10 rätta svar i följd", icon: "🔥🔥" },
            comeback: { unlocked: false, name: "Comeback", description: "Från 0% till 100% i samma spel", icon: "📈" },
            
            // Volym-achievements
            fiftyCorrect: { unlocked: false, name: "Halvsekel", description: "50 rätta svar totalt", icon: "⭐" },
            hundredCorrect: { unlocked: false, name: "Århundrade", description: "100 rätta svar totalt", icon: "🌟" },
            
            // Special achievements
            allAchievements: { unlocked: false, name: "Kompletionist", description: "Lås upp alla andra achievements", icon: "🏅" },
            nightOwl: { unlocked: false, name: "Nattugglä", description: "Spela mellan 22:00 och 06:00", icon: "🦉" },
            perfectWeek: { unlocked: false, name: "Perfekt vecka", description: "Spela 7 dagar i rad", icon: "📅" }
        };
        
        this.stats = {
            totalCorrect: 0,
            totalQuestions: 0,
            currentStreak: 0,
            bestStreak: 0,
            gameStartTime: null,
            responseTimes: [],
            playDates: [],
            categoryPerfects: {}
        };
        
        this.loadData();
    }

    loadData() {
        try {
            const savedAchievements = localStorage.getItem('pluGameAchievements');
            const savedStats = localStorage.getItem('pluGameStats');
            
            if (savedAchievements) {
                this.achievements = { ...this.achievements, ...JSON.parse(savedAchievements) };
            }
            
            if (savedStats) {
                this.stats = { ...this.stats, ...JSON.parse(savedStats) };
            }
        } catch (error) {
            console.log('Kunde inte ladda achievements data:', error);
        }
    }

    saveData() {
        try {
            localStorage.setItem('pluGameAchievements', JSON.stringify(this.achievements));
            localStorage.setItem('pluGameStats', JSON.stringify(this.stats));
        } catch (error) {
            console.log('Kunde inte spara achievements data:', error);
        }
    }

    startGame() {
        this.stats.gameStartTime = Date.now();
        this.stats.responseTimes = [];
        
        // Kolla night owl achievement
        const hour = new Date().getHours();
        if ((hour >= 22 || hour <= 6) && !this.achievements.nightOwl.unlocked) {
            this.unlockAchievement('nightOwl');
        }
        
        // Kolla perfect week achievement
        const today = new Date().toDateString();
        if (!this.stats.playDates.includes(today)) {
            this.stats.playDates.push(today);
            // Behåll bara senaste 7 dagarna
            this.stats.playDates = this.stats.playDates.slice(-7);
        }
        
        if (this.stats.playDates.length >= 7 && !this.achievements.perfectWeek.unlocked) {
            this.unlockAchievement('perfectWeek');
        }
    }

    onCorrectAnswer(responseTime = null) {
        this.stats.totalCorrect++;
        this.stats.totalQuestions++;
        this.stats.currentStreak++;
        
        if (responseTime) {
            this.stats.responseTimes.push(responseTime);
        }
        
        // Update best streak
        if (this.stats.currentStreak > this.stats.bestStreak) {
            this.stats.bestStreak = this.stats.currentStreak;
        }
        
        // Check achievements
        this.checkBasicAchievements();
        this.checkStreakAchievements();
        this.saveData();
    }

    onIncorrectAnswer() {
        this.stats.totalQuestions++;
        this.stats.currentStreak = 0;
        this.saveData();
    }

    onGameEnd(gameData) {
        const { score, totalQuestions, categories, difficulty, products } = gameData;
        const percentage = Math.round((score / totalQuestions) * 100);
        
        // Perfect round achievement
        if (percentage === 100 && totalQuestions >= 3 && !this.achievements.perfectRound.unlocked) {
            this.unlockAchievement('perfectRound');
        }
        
        // All correct achievement (100% med minst 5 frågor)
        if (percentage === 100 && totalQuestions >= 5 && !this.achievements.allCorrect.unlocked) {
            this.unlockAchievement('allCorrect');
        }
        
        // Speedster achievement
        if (this.stats.responseTimes.length > 0) {
            const avgTime = this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length;
            if (avgTime < 3000 && totalQuestions >= 5 && !this.achievements.speedster.unlocked) {
                this.unlockAchievement('speedster');
            }
        }
        
        // Category achievements
        this.checkCategoryAchievements(categories, percentage, products);
        
        // Hardest level achievement
        if (difficulty === 'ovanlig' && percentage === 100 && totalQuestions >= 3 && !this.achievements.hardestLevel.unlocked) {
            this.unlockAchievement('hardestLevel');
        }
        
        // Check if all achievements unlocked
        this.checkAllAchievements();
        
        this.saveData();
    }

    checkBasicAchievements() {
        if (!this.achievements.firstCorrect.unlocked && this.stats.totalCorrect >= 1) {
            this.unlockAchievement('firstCorrect');
        }
        
        if (!this.achievements.tenCorrect.unlocked && this.stats.totalCorrect >= 10) {
            this.unlockAchievement('tenCorrect');
        }
        
        if (!this.achievements.fiftyCorrect.unlocked && this.stats.totalCorrect >= 50) {
            this.unlockAchievement('fiftyCorrect');
        }
        
        if (!this.achievements.hundredCorrect.unlocked && this.stats.totalCorrect >= 100) {
            this.unlockAchievement('hundredCorrect');
        }
    }

    checkStreakAchievements() {
        if (!this.achievements.streak5.unlocked && this.stats.currentStreak >= 5) {
            this.unlockAchievement('streak5');
        }
        
        if (!this.achievements.streak10.unlocked && this.stats.currentStreak >= 10) {
            this.unlockAchievement('streak10');
        }
    }

    checkCategoryAchievements(category, percentage, products) {
        if (percentage === 100 && products && products.length > 0) {
            const categoryMap = {
                'grönsaker': 'vegetableMaster',
                'bröd': 'breadExpert', 
                'snacks': 'snackKing',
                'bakverk': 'bakingGenius',
                'söndagsbröd': 'sundayBreadPro'
            };
            
            if (category !== 'alla' && categoryMap[category] && !this.achievements[categoryMap[category]].unlocked) {
                this.unlockAchievement(categoryMap[category]);
            }
        }
    }

    checkAllAchievements() {
        const totalAchievements = Object.keys(this.achievements).length - 1; // Minus allAchievements itself
        const unlockedCount = Object.values(this.achievements).filter(a => a.unlocked).length;
        
        if (unlockedCount >= totalAchievements && !this.achievements.allAchievements.unlocked) {
            this.unlockAchievement('allAchievements');
        }
    }

    unlockAchievement(type) {
        if (this.achievements[type] && !this.achievements[type].unlocked) {
            this.achievements[type].unlocked = true;
            this.showAchievementNotification(type);
            this.saveData();
            
            // Play achievement sound
            if (window.soundManager) {
                window.soundManager.playAchievement();
            }
        }
    }

    showAchievementNotification(type) {
        const achievement = this.achievements[type];
        if (achievement) {
            console.log(`🏆 Achievement unlocked: ${achievement.icon} ${achievement.name} - ${achievement.description}`);
            
            // Visa visuell notification
            this.displayAchievementToast(achievement);
        }
    }

    displayAchievementToast(achievement) {
        // Skapa toast notification
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <div class="achievement-title">🏆 Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animera in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Ta bort efter 4 sekunder
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 4000);
    }

    getUnlockedAchievements() {
        return Object.entries(this.achievements)
            .filter(([key, achievement]) => achievement.unlocked)
            .map(([key, achievement]) => ({ key, ...achievement }));
    }

    getProgress() {
        const total = Object.keys(this.achievements).length;
        const unlocked = this.getUnlockedAchievements().length;
        return { unlocked, total, percentage: Math.round((unlocked / total) * 100) };
    }
}

// Sound Management
class SoundManager {
    constructor() {
        this.enabled = this.getStoredSetting();
        this.audioContext = null;
        this.sounds = {};
        this.init();
    }

    init() {
        this.createAudioContext();
        this.generateSounds();
        this.setupSoundToggle();
    }

    getStoredSetting() {
        const stored = localStorage.getItem('pluGameSound');
        return stored !== null ? stored === 'true' : true; // Default to enabled
    }

    setSoundEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('pluGameSound', enabled.toString());
        this.updateToggleButton();
    }

    createAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('Web Audio API not supported:', error);
            this.audioContext = null;
        }
    }

    generateSounds() {
        if (!this.audioContext) return;

        // Generate different sound effects using Web Audio API
        this.sounds = {
            correct: this.createSound([523.25, 659.25, 783.99], 0.3), // C5, E5, G5 major chord
            incorrect: this.createSound([220, 185, 155], 0.5), // A3, F#3, D#3 minor chord
            click: this.createSound([800], 0.1), // Simple click
            achievement: this.createSound([523.25, 659.25, 783.99, 1046.5], 0.8), // Achievement fanfare
            gameStart: this.createSound([392, 523.25, 659.25], 0.4), // Game start
            gameEnd: this.createSound([523.25, 493.88, 440, 392], 0.6), // Game end sequence
            firstPlace: this.createSound([523.25, 659.25, 783.99, 1046.5, 1318.5, 1568], 1.2) // Epic first place fanfare
        };
    }

    createSound(frequencies, duration) {
        if (!this.audioContext) return null;

        return () => {
            if (!this.enabled || !this.audioContext) return;

            try {
                // Resume audio context if suspended (required by browsers)
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }

                const gainNode = this.audioContext.createGain();
                gainNode.connect(this.audioContext.destination);
                
                // Set volume and fade out
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

                frequencies.forEach((freq, index) => {
                    const oscillator = this.audioContext.createOscillator();
                    oscillator.connect(gainNode);
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    
                    // Use different wave types for variety
                    if (frequencies.length > 4) {
                        // For longer melodies like first place fanfare, use sine wave
                        oscillator.type = 'sine';
                    } else {
                        oscillator.type = 'sine';
                    }
                    
                    const startTime = this.audioContext.currentTime + (index * 0.15);
                    const noteLength = Math.min(0.4, duration / frequencies.length * 1.5);
                    const endTime = startTime + noteLength;
                    
                    oscillator.start(startTime);
                    oscillator.stop(endTime);
                });

            } catch (error) {
                console.log('Error playing sound:', error);
            }
        };
    }

    setupSoundToggle() {
        const soundToggleBtn = document.getElementById('soundToggleBtn');
        if (soundToggleBtn) {
            soundToggleBtn.onclick = () => {
                this.setSoundEnabled(!this.enabled);
                // Don't play click sound for sound toggle itself to avoid confusion
            };
            this.updateToggleButton();
        }
    }

    updateToggleButton() {
        const soundToggleBtn = document.getElementById('soundToggleBtn');
        if (soundToggleBtn) {
            soundToggleBtn.textContent = this.enabled ? '🔊 Ljud: På' : '🔇 Ljud: Av';
            soundToggleBtn.setAttribute('aria-pressed', this.enabled.toString());
        }
    }

    playSound(soundName) {
        if (this.enabled && this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    // Convenience methods
    playCorrect() { this.playSound('correct'); }
    playIncorrect() { this.playSound('incorrect'); }
    playClick() { this.playSound('click'); }
    playAchievement() { this.playSound('achievement'); }
    playGameStart() { this.playSound('gameStart'); }
    playGameEnd() { this.playSound('gameEnd'); }
    playFirstPlace() { this.playSound('firstPlace'); }
}

// Theme Management
class ThemeManager {
    constructor() {
        this.theme = this.getStoredTheme() || this.getSystemTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.theme);
        this.setupThemeToggle();
        this.watchSystemTheme();
    }

    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    getStoredTheme() {
        return localStorage.getItem('pluGameTheme');
    }

    setTheme(theme) {
        this.theme = theme;
        localStorage.setItem('pluGameTheme', theme);
        this.applyTheme(theme);
        this.updateToggleButton();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.className = theme === 'dark' ? 'dark-theme' : '';
    }

    updateToggleButton() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            const isDark = this.theme === 'dark';
            darkModeToggle.textContent = isDark ? '☀️ Ljust tema' : '🌙 Mörkt tema';
            darkModeToggle.setAttribute('aria-pressed', isDark.toString());
        }
    }

    setupThemeToggle() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.onclick = () => {
                this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
            };
            this.updateToggleButton();
        }
    }

    watchSystemTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                // Bara ändra automatiskt om användaren inte har satt en preferens
                if (!this.getStoredTheme()) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    toggleTheme() {
        this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
    }
}

// Game Functions
function getRandomProduct() {
    // Om det är ett nytt spel, skapa en lista med blandade produkter
    if (currentQuestionIndex === 0) {
        // Använd filtrering baserat på kategorier och svårighetsgrad
        let filteredProducts = [...products];
        
        // Hämta filter-värden om de finns
        const categoryFilter = document.getElementById('categoryFilter');
        const difficultyFilter = document.getElementById('difficultyFilter');
        
        if (categoryFilter && categoryFilter.value !== 'alla') {
            filteredProducts = filteredProducts.filter(product => 
                product.category === categoryFilter.value
            );
        }
        
        if (difficultyFilter && difficultyFilter.value !== 'alla') {
            filteredProducts = filteredProducts.filter(product => 
                product.difficulty === difficultyFilter.value
            );
        }
        
        // Om inga produkter matchar filtret, använd alla produkter
        if (filteredProducts.length === 0) {
            console.log('Inga produkter matchar filtret, använder alla produkter');
            filteredProducts = [...products];
        }
        
        console.log(`Använder ${filteredProducts.length} produkter efter filtrering`);
        
        // Sätt totalQuestions baserat på tillgängliga filtrerade produkter
        const countFilter = document.getElementById('countFilter');
        if (countFilter) {
            const selectedCount = countFilter.value;
            if (selectedCount === 'alla') {
                totalQuestions = filteredProducts.length; // Alla filtrerade produkter
            } else {
                totalQuestions = Math.min(parseInt(selectedCount), filteredProducts.length);
            }
        } else {
            totalQuestions = Math.min(10, filteredProducts.length); // Fallback
        }
        
        console.log(`Spel kommer ha ${totalQuestions} frågor (av ${filteredProducts.length} tillgängliga produkter)`);
        
        gameProducts = [...filteredProducts]; // Skapa en kopia av den filtrerade listan
        
        // Blanda produkterna
        for (let i = gameProducts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameProducts[i], gameProducts[j]] = [gameProducts[j], gameProducts[i]];
        }
        
        // ENDAST upprepa produkter om användaren specifikt valt fler än vad som finns
        // OCH om de valt "alla" eller ett specifikt antal som är större än tillgängliga
        if (totalQuestions > filteredProducts.length) {
            console.log(`Användaren vill ha ${totalQuestions} frågor men bara ${filteredProducts.length} produkter finns - upprepning krävs`);
            while (gameProducts.length < totalQuestions) {
                // Lägg till fler kopior av produkterna och blanda igen
                const moreCopies = [...filteredProducts];
                for (let i = moreCopies.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [moreCopies[i], moreCopies[j]] = [moreCopies[j], moreCopies[i]];
                }
                gameProducts = gameProducts.concat(moreCopies);
            }
        }
        
        // Begränsa till exakt antal frågor som ska spelas
        gameProducts = gameProducts.slice(0, totalQuestions);
        
        console.log('Spelprodukterlista skapad:', gameProducts.length, 'produkter för', totalQuestions, 'frågor');
    }
    
    // Returnera nästa produkt i listan
    return gameProducts[currentQuestionIndex];
}

function startNewQuestion() {
    // Kolla om spelet ska avslutas
    if (currentQuestionIndex >= totalQuestions) {
        endGame();
        return;
    }
    
    currentProduct = getRandomProduct();
    
    // Set question start time for achievement tracking
    window.questionStartTime = Date.now();
    
    // Check if we're in simple mode or menu mode
    let productImage = document.getElementById('product-image');
    let productName = document.getElementById('product-name');
    let pluInput = document.getElementById('plu-input');
    let feedback = document.getElementById('feedback');
    let submitButton = document.getElementById('submit-answer');
    
    // If elements don't exist, we're in menu mode - create them in the game div
    if (!productImage) {
        const gameDiv = document.getElementById('game');
        if (gameDiv) {
            gameDiv.innerHTML = `
                <div class="question-container">
                    <div class="progress-info">Fråga ${currentQuestionIndex + 1} av ${totalQuestions}</div>
                    <img id="product-image" src="" alt="" class="product-image">
                    <h2 id="product-name">Laddar...</h2>
                    <p>Vad är PLU-koden för denna produkt?</p>
                </div>
                <div class="input-container">
                    <label for="plu-input" class="sr-only">Ange PLU-kod</label>
                    <input 
                        type="text" 
                        id="plu-input" 
                        placeholder="Ange PLU-kod (4 siffror)"
                        maxlength="4"
                        pattern="[0-9]{4}"
                        aria-describedby="feedback"
                    >
                    <button id="submit-answer" type="button">Skicka svar</button>
                </div>
                <div id="feedback" aria-live="assertive" class="feedback"></div>
            `;
            
            // Re-get the elements after creating them
            productImage = document.getElementById('product-image');
            productName = document.getElementById('product-name');
            pluInput = document.getElementById('plu-input');
            feedback = document.getElementById('feedback');
            submitButton = document.getElementById('submit-answer');
            
            // Setup event listeners for the new elements
            if (submitButton) {
                submitButton.onclick = checkAnswer;
            }
            
            if (pluInput) {
                pluInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        checkAnswer();
                    }
                });
                
                // Enhance accessibility for input
                if (accessibilityManager) {
                    accessibilityManager.enhanceInputAccessibility(pluInput);
                }
            }
        }
    } else {
        // Update progress info if it exists
        const progressInfo = document.querySelector('.progress-info');
        if (progressInfo) {
            progressInfo.textContent = `Fråga ${currentQuestionIndex + 1} av ${totalQuestions}`;
        }
    }
    
    if (productImage && currentProduct) {
        // Use optimized image loading
        if (window.imageOptimizer) {
            productImage.classList.add('vegetable-image', 'lazy-image');
            productImage.alt = currentProduct.name;
            window.imageOptimizer.setupImageForGame(productImage, currentProduct.image);
        } else {
            // Fallback for browsers without image optimization
            productImage.src = currentProduct.image;
            productImage.alt = currentProduct.name;
            productImage.classList.add('vegetable-image');
        }
        
        // Animera bildövergång
        animationManager.animateImageTransition(productImage, currentProduct.image);
    }
    
    if (productName && currentProduct) {
        productName.textContent = currentProduct.name;
    }
    
    if (pluInput) {
        pluInput.value = '';
        pluInput.focus();
    }
    
    if (feedback) {
        feedback.textContent = '';
        feedback.className = '';
    }
    
    // Announce new question to screen reader
    if (accessibilityManager && currentProduct) {
        const questionText = `Fråga ${currentQuestionIndex + 1} av ${totalQuestions}. Vad är PLU-koden för ${currentProduct.name}?`;
        setTimeout(() => {
            accessibilityManager.announceToScreenReader(questionText);
        }, 1000); // Delay to allow image loading
    }
    
    // Animera kort-reveal för ny fråga
    const questionContainer = document.querySelector('.question-container');
    if (questionContainer) {
        animationManager.animateCardReveal(questionContainer);
    }
    
    // Animera hela spelområdet för smooth övergång
    const gameArea = document.getElementById('game-area') || document.getElementById('game');
    if (gameArea) {
        animationManager.animateModeTransition(gameArea);
    }
}

function checkAnswer() {
    const pluInput = document.getElementById('plu-input');
    const feedback = document.getElementById('feedback');
    
    if (!pluInput || !currentProduct) {
        console.log('Missing input element or current product');
        return;
    }
    
    const userAnswer = pluInput.value.trim();
    const isCorrect = userAnswer === currentProduct.plu;
    
    if (feedback && window.feedbackManager) {
        // Generate detailed feedback
        const feedbackData = window.feedbackManager.generateDetailedFeedback(
            isCorrect, 
            userAnswer, 
            currentProduct.plu, 
            currentProduct.name
        );
        
        // Display enhanced feedback
        window.feedbackManager.displayFeedback(feedbackData, feedback);
        
        // Announce to screen reader
        if (accessibilityManager) {
            accessibilityManager.announceGameStatus(isCorrect, currentProduct.name, currentProduct.plu, userAnswer);
        }
        
        if (isCorrect) {
            score++;
            correctAnswers++;
            
            // Play correct sound
            if (window.soundManager) {
                window.soundManager.playCorrect();
            }
            
            // Check achievements
            if (window.achievementsManager) {
                const responseTime = Date.now() - (window.questionStartTime || Date.now());
                window.achievementsManager.onCorrectAnswer(responseTime);
            }
        } else {
            // Play incorrect sound
            if (window.soundManager) {
                window.soundManager.playIncorrect();
            }
            
            // Check achievements for incorrect answer
            if (window.achievementsManager) {
                window.achievementsManager.onIncorrectAnswer();
            }
        }
    } else {
        // Fallback to simple feedback if FeedbackManager not available
        if (feedback) {
            if (isCorrect) {
                feedback.textContent = `Rätt! PLU-koden för ${currentProduct.name} är ${currentProduct.plu}`;
                feedback.className = 'correct';
                score++;
                correctAnswers++;
            } else {
                feedback.textContent = `Fel! Rätt PLU-kod för ${currentProduct.name} är ${currentProduct.plu}`;
                feedback.className = 'incorrect';
            }
        }
    }
    
    updateScore();
    
    // Lägg till animationer baserat på svar
    const gameArea = document.getElementById('game-area') || document.getElementById('game');
    const productImage = document.querySelector('.product-image');
    const feedbackElement = document.getElementById('feedback');
    
    if (isCorrect) {
        // Animera framgång
        if (gameArea) animationManager.animateSuccess(gameArea);
        if (productImage) animationManager.animateSuccess(productImage);
        
        // Animera poängökning
        const scoreElement = document.querySelector('.score');
        if (scoreElement) animationManager.animateScoreIncrease(scoreElement);
        
        // Konfetti för speciella prestationer
        if (score > 0 && score % 5 === 0) {
            setTimeout(() => {
                animationManager.createConfetti(gameArea || document.body);
            }, 300);
        }
    } else {
        // Animera fel svar
        if (gameArea) animationManager.animateError(gameArea);
        if (pluInput) animationManager.animateError(pluInput);
    }
    
    // Animera feedback-meddelandet
    if (feedbackElement) {
        setTimeout(() => {
            animationManager.animateFeedback(feedbackElement);
        }, 100);
    }
    
    // Räkna upp frågeindexet
    currentQuestionIndex++;
    
    // Längre väntetid för att användaren ska hinna läsa feedback (4 sekunder istället för 2)
    setTimeout(() => {
        startNewQuestion();
    }, 4000);
}

function endGame() {
    const gameDiv = document.getElementById('game');
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Hämta spelarnamn från Firebase-användare
    const playerName = window.firebaseManager?.currentUserName || 'Anonym';
    
    // Hämta filter-information för highscore
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const categories = categoryFilter ? categoryFilter.value : 'alla';
    const difficulty = difficultyFilter ? difficultyFilter.value : 'alla';
    
    // Check achievements at game end
    if (window.achievementsManager) {
        window.achievementsManager.onGameEnd({
            score: score,
            totalQuestions: totalQuestions,
            categories: categories,
            difficulty: difficulty,
            products: gameProducts
        });
    }
    
    // Play game end sound
    if (window.soundManager) {
        window.soundManager.playGameEnd();
    }
    
    // Spara till topplistan
    if (window.highscoreManager) {
        const placement = window.highscoreManager.addScore(
            playerName, score, totalQuestions, percentage, categories, difficulty
        );
        
        // Kolla om det är en top 3 placering för special animation
        let specialMessage = '';
        let animationClass = '';
        
        if (placement === 1) {
            specialMessage = '🥇 NYTT REKORD! Du är #1 på topplistan!';
            animationClass = 'gold-celebration';
            
            // Spela episk första plats-fanfar
            if (window.soundManager) {
                setTimeout(() => {
                    window.soundManager.playFirstPlace();
                }, 500); // Kort delay för att inte kollidera med game end sound
            }
            
            // Lägg till extra konfetti-effekt efter 1 sekund
            setTimeout(() => {
                if (gameDiv) {
                    const existingCelebration = gameDiv.querySelector('.gold-celebration');
                    if (existingCelebration) {
                        existingCelebration.classList.add('extra-celebration');
                    }
                }
            }, 1000);
            
        } else if (placement === 2) {
            specialMessage = '🥈 SILVER! Du är #2 på topplistan!';
            animationClass = 'silver-celebration';
        } else if (placement === 3) {
            specialMessage = '🥉 BRONS! Du är #3 på topplistan!';
            animationClass = 'bronze-celebration';
        } else if (placement <= 10) {
            specialMessage = `🏆 Topplista! Du är #${placement} på topplistan!`;
            animationClass = 'top-ten-celebration';
        }
        
        if (gameDiv) {
            gameDiv.innerHTML = `
                <div class="game-complete ${animationClass}">
                    <h2>🎉 Spelet klart!</h2>
                    <div class="final-score">
                        <p>Du fick <strong>${score} av ${totalQuestions}</strong> rätt!</p>
                        <p class="percentage-score"><strong>${percentage}%</strong> rätt!</p>
                    </div>
                    ${specialMessage ? `<div class="special-achievement">${specialMessage}</div>` : ''}
                    <div class="performance-message">
                        ${percentage >= 75 ? '🌟 Fantastiskt! Du kan dina PLU-koder!' : 
                          percentage >= 50 ? '👍 Bra jobbat! Fortsätt träna!' : 
                          '💪 Träning ger färdighet! Prova igen!'}
                    </div>
                </div>
            `;
        }
    } else {
        // Fallback om highscore manager inte finns
        if (gameDiv) {
            gameDiv.innerHTML = `
                <div class="game-complete">
                    <h2>🎉 Spelet klart!</h2>
                    <div class="final-score">
                        <p>Du fick <strong>${score} av ${totalQuestions}</strong> rätt!</p>
                        <p><strong>${percentage}%</strong> rätt!</p>
                    </div>
                    <div class="performance-message">
                        ${percentage === 100 ? '👑 Perfekt! Du är en PLU-mästare!' :
                          percentage >= 75 ? '🌟 Fantastiskt! Du kan dina PLU-koder!' : 
                          percentage >= 50 ? '👍 Bra jobbat! Fortsätt träna!' : 
                          '💪 Träning ger färdighet! Prova igen!'}
                    </div>
                </div>
            `;
        }
    }
    
    // Visa game buttons för att spela igen eller gå tillbaka till meny
    const gameButtons = document.getElementById('gameButtons');
    if (gameButtons) {
        gameButtons.classList.remove('hidden');
    }
    
    console.log('Spelet avslutat. Resultat:', score, 'av', totalQuestions);
}

function updateScore() {
    // Throttle score updates för bättre prestanda
    if (performanceManager) {
        performanceManager.throttle(() => {
            updateScoreInternal();
        }, 100, 'score-update');
    } else {
        updateScoreInternal();
    }
}

function updateScoreInternal() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = `Poäng: ${score}`;
        
        // Announce score update to screen reader (but not too frequently)
        if (accessibilityManager && score > 0) {
            clearTimeout(window.scoreUpdateTimeout);
            window.scoreUpdateTimeout = setTimeout(() => {
                accessibilityManager.announceScoreUpdate(score, totalQuestions);
            }, 500);
        }
    }
}

// Initialize when DOM is loaded
function initGame() {
    console.log('Initialiserar PLU Memory Game...');
    
    // Load accessibility preferences
    loadAccessibilityPreferences();
    
    // Initialize accessibility
    if (typeof AccessibilityPreferences !== 'undefined') {
        window.accessibilityPreferences = new AccessibilityPreferences();
        window.accessibilityPreferences.init();
        console.log('✅ Accessibility preferences initialiserad');
    }
    
    // Initialize achievements
    if (typeof AchievementsManager !== 'undefined') {
        window.achievementsManager = new AchievementsManager();
        console.log('✅ Achievements manager initialiserad');
    }
    
    // Initialize highscore manager
    if (typeof HighscoreManager !== 'undefined') {
        window.highscoreManager = new HighscoreManager();
        console.log('✅ Highscore manager initialiserad');
    }
    
    // Initialize theme manager
    if (typeof ThemeManager !== 'undefined') {
        window.themeManager = new ThemeManager();
        console.log('✅ Theme manager initialiserad');
    }
    
    // Initialize sound manager
    if (typeof SoundManager !== 'undefined') {
        window.soundManager = new SoundManager();
        console.log('✅ Sound manager initialiserad');
    }
    
    // Setup game event listeners
    const submitButton = document.getElementById('submit-answer');
    const pluInput = document.getElementById('plu-input');
    
    if (submitButton) {
        submitButton.onclick = checkAnswer;
    }
    
    if (pluInput) {
        pluInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
    }
    
    // Setup menu button listeners
    setupMenuButtons();
    
    // Setup filter event listeners
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', updateCountFilter);
    }
    
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', updateCountFilter);
    }
    
    // Initial update of count filter
    updateCountFilter();
    
    // Extra säkerhet - uppdatera igen efter en kort stund
    setTimeout(updateCountFilter, 100);
    
    // Initialize animations
    if (animationManager) {
        animationManager.addButtonHoverEffects();
        console.log('✅ Animation manager initialiserad');
    }
    
    // Initialize performance monitoring
    if (performanceManager) {
        performanceManager.startMonitoring();
        performanceManager.inlineCriticalCSS();
        console.log('✅ Performance manager initialiserad');
        
        // Debounce resize events för bättre prestanda
        window.addEventListener('resize', () => {
            performanceManager.debounce(() => {
                // Handle resize optimally
                if (window.animationManager) {
                    window.animationManager.addButtonHoverEffects();
                }
            }, 250, 'window-resize');
        });
    }
    
    // Initialize backup indicator
    if (backupManager) {
        backupManager.addBackupIndicator();
        console.log('✅ Backup manager initialiserad');
    }
    
    // Setup accessibility control buttons
    setupAccessibilityControls();
    
    // Defer non-critical initialization
    requestIdleCallback(() => {
        // Ladda mindre viktiga funktioner när browsern är idle
        initNonCriticalFeatures();
    });
    
    // Start first question only if we're in simple mode
    if (document.getElementById('startBtn')) {
        // We have the full menu, so don't auto-start
        showMenu();
    } else {
        // Simple mode, auto-start the game
        startNewQuestion();
        updateScore();
    }
    
    console.log('✅ PLU Memory Game är redo! (Optimerad för prestanda)');
}

// Setup accessibility control buttons
function setupAccessibilityControls() {
    const toggleHighContrast = document.getElementById('toggleHighContrast');
    const cycleTextSize = document.getElementById('cycleTextSize');
    const showKeyboardHelp = document.getElementById('showKeyboardHelp');
    
    if (toggleHighContrast && accessibilityManager) {
        toggleHighContrast.addEventListener('click', () => {
            accessibilityManager.toggleHighContrast();
            // Update button state
            toggleHighContrast.setAttribute('aria-pressed', 
                accessibilityManager.highContrastMode ? 'true' : 'false');
        });
        
        // Set initial state
        toggleHighContrast.setAttribute('aria-pressed', 
            accessibilityManager.highContrastMode ? 'true' : 'false');
    }
    
    if (cycleTextSize && accessibilityManager) {
        cycleTextSize.addEventListener('click', () => {
            accessibilityManager.cycleTextSize();
        });
    }
    
    if (showKeyboardHelp && accessibilityManager) {
        showKeyboardHelp.addEventListener('click', () => {
            accessibilityManager.showHelp();
        });
    }
    
    console.log('✅ Tillgänglighetskontroller konfigurerade');
}

// Initiera mindre kritiska funktioner när browsern är idle
function initNonCriticalFeatures() {
    // Preload bilder för framtida användning
    if (performanceManager) {
        performanceManager.prefetchLikelyResources();
    }
    
    // Initiera extra ljudeffekter (ej kritiska)
    initExtraSounds();
    
    // Sätt upp advanced tracking
    setupAdvancedAnalytics();
    
    console.log('✅ Icke-kritiska funktioner initialiserade');
}

function initExtraSounds() {
    // Lägg till extra ljudeffekter med låg prioritet
    if (window.soundManager) {
        // Förladda bakgrundsljud
        const extraSounds = ['achievement.mp3', 'streak.mp3'];
        extraSounds.forEach(sound => {
            // Endast ladda om tillgängligt
            try {
                window.soundManager.preloadSound(sound);
            } catch (e) {
                // Ignorera fel - inte kritiskt
            }
        });
    }
}

function setupAdvancedAnalytics() {
    // Sätt upp avancerad prestanda-tracking
    if (performanceManager && 'PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'navigation') {
                        console.log('📊 Navigation timing:', entry.duration);
                    }
                });
            });
            observer.observe({ entryTypes: ['navigation'] });
        } catch (e) {
            // Browser stöder inte detta
        }
    }
}

// Menu Functions
function showMenu() {
    console.log('Visar huvudmeny');
    hideAllSections();
    showSection('menuButtons');
    hideSection('gameModeSection');
    hideSection('filterSection');
}

function showGameModeFromMenu() {
    console.log('Visar spellägesval från meny');
    
    hideSection('menuButtons');
    showSection('gameModeSection');
    hideSection('filterSection');
}

function showGameModeSelection() {
    console.log('Visar spellägesval');
    
    showGameModeFromMenu();
}

function showFilterSection(gameMode) {
    console.log(`Visar filtreringsalternativ för spelläge: ${gameMode}`);
    
    // Store selected game mode for later use
    window.selectedGameMode = gameMode;
    
    hideSection('gameModeSection');
    showSection('filterSection');
    
    // Update filter section title based on game mode
    const filterTitle = document.getElementById('game-settings-heading');
    if (filterTitle) {
        const gameModeNames = {
            'classic': 'Klassiskt läge',
            'time': 'Tidsutmaning',
            'reverse': 'Omvänt läge', 
            'practice': 'Övningsläge'
        };
        filterTitle.textContent = `🎯 ${gameModeNames[gameMode] || 'Spel'} - Välj vad du vill träna på:`;
    }
}

function hideAllSections() {
    const sections = ['game-area', 'gameButtons', 'leaderboard', 'achievements', 'profile', 'accessibility', 'gameModeSection', 'filterSection'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
    
    // Clear game content
    const gameDiv = document.getElementById('game');
    if (gameDiv) {
        gameDiv.innerHTML = '';
    }
    
    const scoreDiv = document.getElementById('score');
    if (scoreDiv) {
        scoreDiv.textContent = '';
    }
}

function showSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.classList.remove('hidden');
    }
}

function hideSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.classList.add('hidden');
    }
}

function showLeaderboard() {
    console.log('Visar topplista');
    hideAllSections();
    hideSection('filterSection');
    hideSection('menuButtons');
    showSection('leaderboard');
    
    // Hämta och visa globala topplistan från Firebase
    const leaderboardList = document.getElementById('leaderboardList');
    if (leaderboardList) {
        leaderboardList.innerHTML = '<p>⏳ Laddar global topplista...</p>';
        
        if (window.firebaseManager && window.firebaseManager.isInitialized) {
            console.log('🔍 Begär global topplista från Firebase...');
            // Hämta global topplista från Firebase
            window.firebaseManager.getLeaderboard(10).then(globalScores => {
                console.log('📊 Mottagna topplista resultat:', globalScores);
                
                if (globalScores.length === 0) {
                    leaderboardList.innerHTML = '<p>🏆 Inga resultat än. Bli först på topplistan!</p>';
                } else {
                    let html = '<div class="leaderboard-header"><h3>🏆 Global Topplista</h3><p>De 10 bästa resultaten från alla spelare</p></div>';
                    html += '<ol class="highscore-list global-leaderboard">';
                    
                    globalScores.forEach((entry, index) => {
                        const rank = index + 1;
                        let rankIcon = '';
                        let rankClass = '';
                        
                        if (rank === 1) {
                            rankIcon = '🥇';
                            rankClass = 'rank-gold';
                        } else if (rank === 2) {
                            rankIcon = '🥈';
                            rankClass = 'rank-silver';
                        } else if (rank === 3) {
                            rankIcon = '🥉';
                            rankClass = 'rank-bronze';
                        } else {
                            rankIcon = `#${rank}`;
                            rankClass = 'rank-normal';
                        }
                        
                        // Visa information om det bästa resultatet
                        let gameInfo = '';
                        if (entry.bestScoreDetails) {
                            const details = entry.bestScoreDetails;
                            const categoryText = details.categories === 'alla' ? 'Alla kategorier' : 
                                details.categories.charAt(0).toUpperCase() + details.categories.slice(1);
                            const difficultyText = details.difficulty === 'alla' ? 'Alla nivåer' : 
                                details.difficulty.charAt(0).toUpperCase() + details.difficulty.slice(1);
                            
                            gameInfo = `(${details.score}/${details.totalQuestions} ${categoryText})`;
                        } else {
                            // Fallback för användare utan detaljerad data
                            const estimatedProducts = Math.round(entry.totalGamesPlayed * 8); // Ungefär 8 produkter per spel i snitt
                            gameInfo = `(~${estimatedProducts} produkter tränade)`;
                        }
                        
                        html += `
                            <li class="highscore-entry ${rankClass}">
                                <div class="rank">${rankIcon}</div>
                                <div class="player-info">
                                    <div class="player-name">${entry.displayName || 'Anonym spelare'}</div>
                                    <div class="score-details">
                                        <span class="percentage">${entry.bestScore}%</span>
                                        <span class="games-played">${gameInfo}</span>
                                    </div>
                                </div>
                            </li>
                        `;
                    });
                    
                    html += '</ol>';
                    leaderboardList.innerHTML = html;
                }
            }).catch(error => {
                console.error('❌ Fel vid hämtning av global topplista:', error);
                // Fallback till lokal topplista om Firebase misslyckas
                showLocalLeaderboard(leaderboardList);
            });
        } else {
            // Fallback till lokal topplista om Firebase inte är tillgängligt
            showLocalLeaderboard(leaderboardList);
        }
    }
}

function showLocalLeaderboard(leaderboardList) {
    console.log('Visar lokal topplista som fallback');
    if (window.highscoreManager) {
        const topScores = window.highscoreManager.getTopScores(10);
        
        if (topScores.length === 0) {
            leaderboardList.innerHTML = '<p>📊 Inga lokala resultat än. Spela ditt första spel!</p>';
        } else {
            let html = '<div class="leaderboard-header"><h3>📊 Lokal Topplista</h3><p>Dina bästa resultat (ingen internetuppkoppling)</p></div>';
            html += '<ol class="highscore-list local-leaderboard">';
            
            topScores.forEach((score, index) => {
                const rank = index + 1;
                let rankIcon = '';
                let rankClass = '';
                
                if (rank === 1) {
                    rankIcon = '🥇';
                    rankClass = 'rank-gold';
                } else if (rank === 2) {
                    rankIcon = '🥈';
                    rankClass = 'rank-silver';
                } else if (rank === 3) {
                    rankIcon = '🥉';
                    rankClass = 'rank-bronze';
                } else {
                    rankIcon = `#${rank}`;
                    rankClass = 'rank-normal';
                }
                
                const categoryText = score.categories === 'alla' ? 'Alla kategorier' : 
                    score.categories.charAt(0).toUpperCase() + score.categories.slice(1);
                const difficultyText = score.difficulty === 'alla' ? 'Alla nivåer' : 
                    score.difficulty.charAt(0).toUpperCase() + score.difficulty.slice(1);
                
                html += `
                    <li class="highscore-entry ${rankClass}">
                        <div class="rank">${rankIcon}</div>
                        <div class="player-info">
                            <div class="player-name">${score.name}</div>
                            <div class="score-details">
                                <span class="percentage">${score.percentage}%</span>
                                <span class="score-fraction">(${score.score}/${score.totalQuestions})</span>
                            </div>
                            <div class="game-info">
                                <span class="category">${categoryText}</span> • 
                                <span class="difficulty">${difficultyText}</span> • 
                                <span class="date">${score.date}</span>
                            </div>
                        </div>
                    </li>
                `;
            });
            
            html += '</ol>';
            leaderboardList.innerHTML = html;
        }
    } else {
        leaderboardList.innerHTML = '<p>❌ Topplistan kunde inte laddas.</p>';
    }
}

function showAchievements() {
    console.log('Visar achievements');
    hideAllSections();
    hideSection('filterSection');
    hideSection('menuButtons');
    showSection('achievements');
    
    // Display real achievements
    const achievementsList = document.getElementById('achievementsList');
    const achievementsSummary = document.getElementById('achievementsSummary');
    
    if (window.achievementsManager) {
        const progress = window.achievementsManager.getProgress();
        
        if (achievementsSummary) {
            achievementsSummary.innerHTML = `
                <div class="achievements-progress">
                    <div class="progress-circle" style="--progress: ${progress.percentage * 3.6}deg;">
                        <div class="progress-text">${progress.percentage}%</div>
                    </div>
                    <h3>Achievements Progress</h3>
                    <p><strong>${progress.unlocked} av ${progress.total}</strong> achievements upplåsta</p>
                </div>
            `;
        }
        
        if (achievementsList) {
            const achievements = Object.entries(window.achievementsManager.achievements);
            let html = '<div class="achievements-grid">';
            
            achievements.forEach(([key, achievement]) => {
                const isUnlocked = achievement.unlocked;
                html += `
                    <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                        <div class="achievement-header">
                            <div class="achievement-icon-large">${achievement.icon}</div>
                            <div class="achievement-info">
                                <h3>${achievement.name}</h3>
                                <p>${achievement.description}</p>
                            </div>
                        </div>
                        <div class="achievement-status ${isUnlocked ? 'unlocked' : 'locked'}">
                            ${isUnlocked ? '🏆 Upplåst!' : '🔒 Låst'}
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            achievementsList.innerHTML = html;
        }
    } else {
        if (achievementsSummary) {
            achievementsSummary.innerHTML = '<p>Achievements kunde inte laddas.</p>';
        }
        if (achievementsList) {
            achievementsList.innerHTML = '<p>Achievements system inte tillgängligt.</p>';
        }
    }
}

function showProfile() {
    console.log('Visar profil');
    hideAllSections();
    hideSection('filterSection');
    hideSection('menuButtons');
    showSection('profile');
    
    // Display real profile and statistics
    const profileContent = document.getElementById('profileContent');
    const playerStats = document.getElementById('playerStats');
    const profileStats = document.getElementById('profileStats');
    
    if (profileContent && window.achievementsManager && window.highscoreManager) {
        // Hämta spelarnamn från Firebase-användare
        const playerName = window.firebaseManager?.currentUserName || 'Anonym';
        
        // Hämta achievements statistik
        const achievementsStats = window.achievementsManager.stats;
        const achievementsProgress = window.achievementsManager.getProgress();
        
        // Hämta topplista statistik
        const topScores = window.highscoreManager.getTopScores(5);
        const playerScores = topScores.filter(score => score.name === playerName);
        
        // Beräkna statistik
        const accuracy = achievementsStats.totalQuestions > 0 ? 
            Math.round((achievementsStats.totalCorrect / achievementsStats.totalQuestions) * 100) : 0;
        
        const avgResponseTime = achievementsStats.responseTimes.length > 0 ?
            Math.round(achievementsStats.responseTimes.reduce((a, b) => a + b, 0) / achievementsStats.responseTimes.length / 1000 * 10) / 10 : 0;
        
        // User info HTML (goes to playerStats) - Left column with profile + auth buttons, right column with stats
        let userInfoHtml = `
            <div class="profile-layout-container">
                <div class="profile-left-column">
                    <div class="profile-header">
                        <div class="player-avatar">👤</div>
                        <div class="player-info">
                            <h3>${playerName}</h3>
                            <p class="player-title">${getPlayerTitle(achievementsProgress.unlocked, accuracy)}</p>
                        </div>
                    </div>
                    
                    <!-- Auth buttons directly under profile in left column -->
                    <div id="authButtonsSection" class="auth-buttons-section auth-buttons-left">
                        <!-- Login/Register buttons (shown when not logged in) -->
                        <div id="authButtons" class="auth-buttons-container">
                            <button id="loginButton" type="button" class="btn btn-primary auth-btn-profile">
                                🔐 Logga in
                            </button>
                            <button id="registerButton" type="button" class="btn btn-success auth-btn-profile">
                                ➕ Skapa konto
                            </button>
                        </div>
                        
                        <!-- Logout button (shown when logged in) -->
                        <button id="signOut" type="button" class="btn btn-secondary logout-btn" style="display: none;">
                            🚪 Logga ut
                        </button>
                        
                        <div id="signin-help-profile" class="help-text">
                            Logga in för att synka dina resultat mellan enheter och se leaderboard
                        </div>
                    </div>
                </div>
                
                <div class="profile-right-column">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">🎯</div>
                            <div class="stat-content">
                                <div class="stat-value">${achievementsStats.totalCorrect}</div>
                                <div class="stat-label">Totalt rätt</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-content">
                                <div class="stat-value">${accuracy}%</div>
                                <div class="stat-label">Träffsäkerhet</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">⚡</div>
                            <div class="stat-content">
                                <div class="stat-value">${avgResponseTime}s</div>
                                <div class="stat-label">Genomsnittlig tid</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">🔥</div>
                            <div class="stat-content">
                                <div class="stat-value">${achievementsStats.bestStreak}</div>
                                <div class="stat-label">Bästa serie</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">🏆</div>
                            <div class="stat-content">
                                <div class="stat-value">${achievementsProgress.unlocked}</div>
                                <div class="stat-label">Achievements</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">📅</div>
                            <div class="stat-content">
                                <div class="stat-value">${achievementsStats.playDates.length}</div>
                                <div class="stat-label">Dagar spelade</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // No additional stats sections - keeping only the 6 stat cards
        let statsHtml = '';
        
        // Set content for both sections
        playerStats.innerHTML = userInfoHtml;
        if (profileStats) profileStats.innerHTML = statsHtml;
        
    } else {
        // Fallback om managers inte finns
        if (playerStats) {
            playerStats.innerHTML = `
                <div class="profile-placeholder">
                    <p>📊 Spelarstatistik kommer att visas här efter att du spelat några spel.</p>
                    <p>💡 Starta ditt första spel för att börja samla statistik!</p>
                </div>
            `;
        }
        if (profileStats) {
            profileStats.innerHTML = '';
        }
    }
}

// Hjälpfunktioner för profilen
function getPlayerTitle(achievementsCount, accuracy) {
    if (achievementsCount >= 15) return "🏆 PLU-Mästare";
    if (achievementsCount >= 10) return "⭐ PLU-Expert";
    if (achievementsCount >= 5) return "🎯 PLU-Specialist";
    if (accuracy >= 80) return "🎪 Träffsäker spelare";
    if (accuracy >= 60) return "📚 PLU-Student";
    return "🌱 Nybörjare";
}

function getRecentAchievements() {
    if (!window.achievementsManager) return '<p>Inga achievements än.</p>';
    
    const unlockedAchievements = window.achievementsManager.getUnlockedAchievements();
    if (unlockedAchievements.length === 0) {
        return '<p>Inga achievements upplåsta än.</p>';
    }
    
    // Visa de 3 senaste (simulerat eftersom vi inte har timestamp)
    const recentAchievements = unlockedAchievements.slice(-3).reverse();
    
    return recentAchievements.map(achievement => `
        <div class="mini-achievement">
            <span class="achievement-icon">${achievement.icon}</span>
            <span class="achievement-name">${achievement.name}</span>
        </div>
    `).join('');
}

// Reset all statistics function
function resetAllStats() {
    try {
        // Clear localStorage
        localStorage.removeItem('pluGameAchievements');
        localStorage.removeItem('pluGameStats');
        localStorage.removeItem('pluGameHighscores');
        localStorage.removeItem('accessibilityPreferences');
        
        // Reset managers
        if (window.achievementsManager) {
            window.achievementsManager = new AchievementsManager();
        }
        
        if (window.highscoreManager) {
            window.highscoreManager = new HighscoreManager();
        }
        
        // Reset game state
        score = 0;
        correctAnswers = 0;
        gamesPlayed = 0;
        currentQuestionIndex = 0;
        gameProducts = [];
        
        console.log('All statistics reset successfully');
        alert('✅ All statistik har nollställts!');
        
    } catch (error) {
        console.error('Error resetting stats:', error);
        alert('❌ Det uppstod ett fel vid nollställning av statistik.');
    }
}

function showAccessibility() {
    console.log('Visar tillgänglighet');
    hideAllSections();
    hideSection('filterSection');
    hideSection('menuButtons');
    showSection('accessibility');
    
    // Initialize accessibility settings
    initializeAccessibilitySettings();
}

function initializeAccessibilitySettings() {
    // High contrast toggle
    const highContrastToggle = document.getElementById('highContrastToggle');
    if (highContrastToggle) {
        // Load saved setting
        const savedHighContrast = localStorage.getItem('pluGameHighContrast') === 'true';
        highContrastToggle.checked = savedHighContrast;
        updateHighContrast(savedHighContrast);
        
        highContrastToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            updateHighContrast(enabled);
            localStorage.setItem('pluGameHighContrast', enabled.toString());
            
            // Play click sound
            if (window.soundManager) {
                window.soundManager.playClick();
            }
        });
    }
    
    // Large buttons toggle
    const largeButtonsToggle = document.getElementById('largeButtonsToggle');
    if (largeButtonsToggle) {
        const savedLargeText = localStorage.getItem('pluGameLargeText') === 'true';
        largeButtonsToggle.checked = savedLargeText;
        updateLargeText(savedLargeText);
        
        largeButtonsToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            updateLargeText(enabled);
            localStorage.setItem('pluGameLargeText', enabled.toString());
            
            if (window.soundManager) {
                window.soundManager.playClick();
            }
        });
    }
    
    // Reduced motion toggle
    const reducedMotionToggle = document.getElementById('reducedMotionToggle');
    if (reducedMotionToggle) {
        const savedReducedMotion = localStorage.getItem('pluGameReducedMotion') === 'true';
        reducedMotionToggle.checked = savedReducedMotion;
        updateReducedMotion(savedReducedMotion);
        
        reducedMotionToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            updateReducedMotion(enabled);
            localStorage.setItem('pluGameReducedMotion', enabled.toString());
            
            if (window.soundManager) {
                window.soundManager.playClick();
            }
        });
    }
}

function updateHighContrast(enabled) {
    const body = document.body;
    if (enabled) {
        body.setAttribute('data-high-contrast', 'true');
        body.classList.add('high-contrast');
    } else {
        body.removeAttribute('data-high-contrast');
        body.classList.remove('high-contrast');
    }
}

function updateLargeText(enabled) {
    const body = document.body;
    if (enabled) {
        body.classList.add('large-text');
    } else {
        body.classList.remove('large-text');
    }
}

function updateReducedMotion(enabled) {
    const body = document.body;
    if (enabled) {
        body.setAttribute('data-reduced-motion', 'true');
        body.classList.add('reduced-motion');
    } else {
        body.removeAttribute('data-reduced-motion');
        body.classList.remove('reduced-motion');
    }
}

function loadAccessibilityPreferences() {
    // Load and apply saved accessibility settings
    const savedHighContrast = localStorage.getItem('pluGameHighContrast') === 'true';
    const savedLargeText = localStorage.getItem('pluGameLargeText') === 'true';
    const savedReducedMotion = localStorage.getItem('pluGameReducedMotion') === 'true';
    
    updateHighContrast(savedHighContrast);
    updateLargeText(savedLargeText);
    updateReducedMotion(savedReducedMotion);
    
    console.log('✅ Accessibility preferences loaded:', {
        highContrast: savedHighContrast,
        largeText: savedLargeText,
        reducedMotion: savedReducedMotion
    });
}

function startGame() {
    console.log('Startar spel från meny');
    
    // Reset feedback manager for new game
    if (window.feedbackManager) {
        window.feedbackManager.reset();
    }
    
    // Start achievement tracking
    if (window.achievementsManager) {
        window.achievementsManager.startGame();
    }
    
    // Play game start sound
    if (window.soundManager) {
        window.soundManager.playGameStart();
    }
    
    console.log('Startar spel...');
    
    // Hide menu sections and show game
    hideSection('filterSection');
    hideSection('menuButtons');
    hideAllSections();
    showSection('game-area');
    
    // Reset game state
    score = 0;
    correctAnswers = 0;
    currentQuestionIndex = 0;
    gameProducts = [];
    
    // Start the game
    startNewQuestion();
    updateScore();
}

function setupMenuButtons() {
    // Main menu buttons
    const startBtn = document.getElementById('startBtn');
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const achievementsBtn = document.getElementById('achievementsBtn');
    const profileBtn = document.getElementById('profileBtn');
    const accessibilityBtn = document.getElementById('accessibilityBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const soundToggleBtn = document.getElementById('soundToggleBtn');
    
    // Helper function to add click sound to buttons
    function addClickSound(element, callback) {
        if (element) {
            element.onclick = (e) => {
                if (window.soundManager) {
                    window.soundManager.playClick();
                }
                if (callback) callback(e);
            };
        }
    }
    
    if (startBtn) addClickSound(startBtn, showGameModeSelection);
    if (leaderboardBtn) addClickSound(leaderboardBtn, showLeaderboard);
    if (achievementsBtn) addClickSound(achievementsBtn, showAchievements);
    if (profileBtn) addClickSound(profileBtn, showProfile);
    if (accessibilityBtn) addClickSound(accessibilityBtn, showAccessibility);
    
    // Gamemode buttons
    const classicModeBtn = document.getElementById('classicModeBtn');
    const timeModeBtn = document.getElementById('timeModeBtn');
    const reverseModeBtn = document.getElementById('reverseModeBtn');
    const practiceModeBtn = document.getElementById('practiceModeBtn');
    const backToMenuFromGameModeTopBtn = document.getElementById('backToMenuFromGameModeTop');
    
    if (classicModeBtn) addClickSound(classicModeBtn, () => showFilterSection('classic'));
    if (timeModeBtn) addClickSound(timeModeBtn, () => showFilterSection('time'));
    if (reverseModeBtn) addClickSound(reverseModeBtn, () => showFilterSection('reverse'));
    if (practiceModeBtn) addClickSound(practiceModeBtn, () => showFilterSection('practice'));
    if (backToMenuFromGameModeTopBtn) addClickSound(backToMenuFromGameModeTopBtn, showMenu);
    
    // Filter section buttons
    const backToGameModeFromFilterBtn = document.getElementById('backToGameModeFromFilter');
    const startGameWithSettingsBtn = document.getElementById('startGameWithSettings');
    
    if (backToGameModeFromFilterBtn) addClickSound(backToGameModeFromFilterBtn, showGameModeSelection);
    if (startGameWithSettingsBtn) addClickSound(startGameWithSettingsBtn, startGame);
    
    // Note: Dark mode toggle is now handled by ThemeManager
    
    if (soundToggleBtn) {
        soundToggleBtn.onclick = () => {
            // Toggle sound (placeholder)
            const isOn = soundToggleBtn.textContent.includes('På');
            soundToggleBtn.textContent = isOn ? '🔇 Ljud: Av' : '🔊 Ljud: På';
            soundToggleBtn.setAttribute('aria-pressed', (!isOn).toString());
        };
    }
    
    // Back to menu buttons
    const backButtons = [
        'backToMenuFromLeaderboard',
        'backToMenuFromAchievements', 
        'backToMenuFromProfile',
        'backToMenuFromAccessibility'
    ];
    
    backButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            addClickSound(button, showMenu);
        }
    });
    
    // Profile specific buttons
    const resetStatsBtn = document.getElementById('resetStatsBtn');
    if (resetStatsBtn) {
        addClickSound(resetStatsBtn, () => {
            if (confirm('⚠️ Är du säker på att du vill nollställa all statistik? Detta kan inte ångras!')) {
                resetAllStats();
                showProfile(); // Refresh profile view
            }
        });
    }
    
    // Game control buttons
    const restartBtn = document.getElementById('restartBtn');
    const backToMenuBtn = document.getElementById('backToMenuBtn');
    
    if (restartBtn) {
        addClickSound(restartBtn, () => {
            score = 0;
            correctAnswers = 0;
            currentQuestionIndex = 0;
            gameProducts = [];
            hideSection('gameButtons');
            startNewQuestion();
            updateScore();
        });
    }
    
    if (backToMenuBtn) {
        addClickSound(backToMenuBtn, () => {
            hideSection('gameButtons');
            showMenu();
        });
    }
}

// Start when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

// Enhanced Feedback Manager
class FeedbackManager {
    constructor() {
        this.consecutiveWrong = 0;
        this.hintLevel = 0;
        this.feedbackHistory = [];
        this.encouragementMessages = [
            "Fortsätt så! Du lär dig snabbt! 🌟",
            "Bra jobbat! Varje försök gör dig bättre! 💪",
            "Utmärkt! Du kommer ihåg PLU-koderna! 🎯",
            "Fantastiskt! Du blir en riktig PLU-expert! 🏆",
            "Perfekt! Du behärskar detta allt bättre! ⭐"
        ];
        this.wrongAnswerTips = {
            "4595": "💡 Tips: Gurka är en vanlig grönsak - tänk 45xx-serien!",
            "4562": "💡 Tips: Morot har orange färg - kom ihåg 4562!",
            "4782": "💡 Tips: Potatis är en grundgrönsak - 4782 börjar med 47!",
            "4086": "💡 Tips: Rödlök har lila färg - 4086 slutar på 86!"
        };
    }

    generateDetailedFeedback(isCorrect, userAnswer, correctAnswer, productName) {
        const feedback = {
            message: '',
            type: isCorrect ? 'correct' : 'incorrect',
            showHint: false,
            encouragement: '',
            explanation: ''
        };

        if (isCorrect) {
            this.consecutiveWrong = 0;
            this.hintLevel = 0;
            
            // Correct answer feedback
            feedback.message = `🎉 Rätt! PLU-koden för ${productName} är ${correctAnswer}`;
            feedback.encouragement = this.getRandomEncouragement();
            feedback.explanation = this.getProductExplanation(productName, correctAnswer);
            
            // Track correct answers for streaks
            this.feedbackHistory.push({ correct: true, product: productName });
            
        } else {
            this.consecutiveWrong++;
            this.feedbackHistory.push({ correct: false, product: productName, userAnswer, correctAnswer });
            
            // Wrong answer feedback with progressive help
            feedback.message = `❌ Fel svar! Rätt PLU-kod för ${productName} är ${correctAnswer}`;
            
            if (userAnswer === '') {
                feedback.message = `⚠️ Du glömde ange en PLU-kod! Rätt kod för ${productName} är ${correctAnswer}`;
            } else if (userAnswer.length < 4) {
                feedback.message = `⚠️ PLU-koder har 4 siffror! Du skrev "${userAnswer}", rätt är ${correctAnswer}`;
            } else if (this.isCloseAnswer(userAnswer, correctAnswer)) {
                feedback.message = `😊 Nära! Du skrev ${userAnswer}, rätt är ${correctAnswer} för ${productName}`;
            }
            
            // Add hints based on consecutive wrong answers
            if (this.consecutiveWrong >= 2) {
                feedback.showHint = true;
                feedback.explanation = this.getHintForProduct(correctAnswer, productName);
            }
            
            // Add encouragement after multiple wrong answers
            if (this.consecutiveWrong >= 3) {
                feedback.encouragement = "Ge inte upp! 💪 Varje fel är ett steg närmare att lära sig!";
            }
        }

        return feedback;
    }

    getProductExplanation(productName, pluCode) {
        const explanations = {
            "Gurka": `Gurka (${pluCode}) är en vanlig grönsak som används i sallader och som snacks.`,
            "Morot": `Morot (${pluCode}) är rik på vitamin A och perfekt för både råkost och matlagning.`,
            "Potatis": `Potatis (${pluCode}) är en basvaror som är viktig i många maträtter.`,
            "Röd lök": `Rödlök (${pluCode}) ger både färg och smak till matlagning och används ofta i sallader.`
        };
        return explanations[productName] || `${productName} (${pluCode}) är en viktig produkt att känna igen.`;
    }

    getHintForProduct(pluCode, productName) {
        const baseHints = this.wrongAnswerTips[pluCode];
        if (baseHints) return baseHints;
        
        // Fallback hints based on PLU patterns
        if (pluCode.startsWith('45')) {
            return "💡 Tips: Denna PLU börjar med 45 - tänk på grönsaker!";
        } else if (pluCode.startsWith('47')) {
            return "💡 Tips: Denna PLU börjar med 47 - rotfrukter!";
        } else if (pluCode.startsWith('40')) {
            return "💡 Tips: Denna PLU börjar med 40 - lökar och kryddor!";
        }
        
        return `💡 Tips: Kom ihåg att ${productName} har PLU-kod ${pluCode}`;
    }

    isCloseAnswer(userAnswer, correctAnswer) {
        if (userAnswer.length !== correctAnswer.length) return false;
        
        let differences = 0;
        for (let i = 0; i < userAnswer.length; i++) {
            if (userAnswer[i] !== correctAnswer[i]) {
                differences++;
            }
        }
        
        return differences === 1; // Only one digit different
    }

    getRandomEncouragement() {
        return this.encouragementMessages[Math.floor(Math.random() * this.encouragementMessages.length)];
    }

    getStreakBonus() {
        const recentCorrect = this.feedbackHistory.slice(-5).filter(h => h.correct).length;
        if (recentCorrect >= 5) {
            return "🔥 Fantastisk! Du har 5 rätt i rad! Du är på väg att bli en PLU-mästare!";
        } else if (recentCorrect >= 3) {
            return "⚡ Bra streak! Du har flera rätt i rad!";
        }
        return '';
    }

    displayFeedback(feedbackData, feedbackElement) {
        if (!feedbackElement) return;

        feedbackElement.className = `feedback ${feedbackData.type}`;
        
        let feedbackHTML = `
            <div class="feedback-main">
                <strong>${feedbackData.message}</strong>
            </div>
        `;

        if (feedbackData.explanation) {
            feedbackHTML += `
                <div class="feedback-explanation">
                    ${feedbackData.explanation}
                </div>
            `;
        }

        if (feedbackData.encouragement) {
            feedbackHTML += `
                <div class="feedback-encouragement">
                    ${feedbackData.encouragement}
                </div>
            `;
        }

        const streakBonus = this.getStreakBonus();
        if (streakBonus && feedbackData.type === 'correct') {
            feedbackHTML += `
                <div class="feedback-streak">
                    ${streakBonus}
                </div>
            `;
        }

        feedbackElement.innerHTML = feedbackHTML;

        // Add animation
        feedbackElement.style.opacity = '0';
        feedbackElement.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            feedbackElement.style.transition = 'all 0.3s ease';
            feedbackElement.style.opacity = '1';
            feedbackElement.style.transform = 'translateY(0)';
        }, 50);
    }

    reset() {
        this.consecutiveWrong = 0;
        this.hintLevel = 0;
        this.feedbackHistory = [];
    }

    getStats() {
        const total = this.feedbackHistory.length;
        const correct = this.feedbackHistory.filter(h => h.correct).length;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        
        return {
            totalAnswers: total,
            correctAnswers: correct,
            accuracy: `${accuracy}%`,
            consecutiveWrong: this.consecutiveWrong
        };
    }
}

// Image Optimization Manager
class ImageOptimizer {
    constructor() {
        this.imageCache = new Map();
        this.webpSupported = null;
        this.lazyLoadObserver = null;
        this.setupImageOptimization();
    }

    async setupImageOptimization() {
        // Check WebP support
        this.webpSupported = await this.checkWebPSupport();
        console.log('🖼️ WebP support:', this.webpSupported ? 'Yes' : 'No');

        // Setup lazy loading
        this.setupLazyLoading();
        
        // Preload critical images
        this.preloadCriticalImages();
    }

    checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.lazyLoadObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
        }
    }

    async loadImage(img) {
        const src = img.dataset.src || img.src;
        
        if (!src) return;

        try {
            // Show loading state immediately
            this.showImagePlaceholder(img);
            
            // Get optimized image source
            const optimizedSrc = await this.getOptimizedImageSrc(src);
            
            // Create new image for preloading
            const newImg = new Image();
            
            // Setup load handlers
            newImg.onload = () => {
                // Smooth transition from placeholder to image
                img.src = optimizedSrc;
                img.classList.remove('loading');
                img.classList.add('loaded');
                
                // Cache for future use
                this.imageCache.set(src, optimizedSrc);
                
                // Optional: Trigger achievement for fast loading
                if (window.achievementsManager && Date.now() - img.loadStartTime < 500) {
                    window.achievementsManager.checkImageLoadingAchievement();
                }
            };
            
            newImg.onerror = () => {
                // Fallback to original image
                img.src = src;
                img.classList.remove('loading');
                img.classList.add('error');
                console.warn('Bildladdning misslyckades, använder fallback:', src);
            };
            
            // Record load start time for performance tracking
            img.loadStartTime = Date.now();
            
            // Start loading
            newImg.src = optimizedSrc;
            
        } catch (error) {
            console.warn('Bildladdning misslyckades:', error);
            img.src = src;
            img.classList.remove('loading');
            img.classList.add('error');
        }
    }

    showImagePlaceholder(img) {
        img.classList.add('loading');
        img.classList.remove('loaded', 'error');
        
        // Set a low-quality placeholder while loading
        if (!img.src || img.src === '') {
            // Create a small base64 placeholder
            const placeholder = this.createImagePlaceholder(img.offsetWidth || 300, img.offsetHeight || 300);
            img.src = placeholder;
        }
    }

    createImagePlaceholder(width, height) {
        // Create a minimal SVG placeholder
        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
                <rect width="100%" height="100%" fill="#f8f9fa"/>
                <g opacity="0.3">
                    <circle cx="${width/2}" cy="${height/2-10}" r="15" fill="#dee2e6"/>
                    <rect x="${width/2-10}" y="${height/2+10}" width="20" height="2" fill="#dee2e6"/>
                </g>
            </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    async getOptimizedImageSrc(originalSrc) {
        // Check cache first
        if (this.imageCache.has(originalSrc)) {
            return this.imageCache.get(originalSrc);
        }

        // For WebP support, try WebP version first
        if (this.webpSupported && originalSrc.endsWith('.jpg')) {
            const webpSrc = originalSrc.replace('.jpg', '.webp');
            
            // Check if WebP version exists
            try {
                await this.checkImageExists(webpSrc);
                return webpSrc;
            } catch {
                // WebP doesn't exist, use original
                return originalSrc;
            }
        }

        return originalSrc;
    }

    checkImageExists(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => reject(new Error('Image not found'));
            img.src = src;
        });
    }

    preloadCriticalImages() {
        // Preload the first few product images that are likely to be shown
        const criticalImages = [
            'images/gurka.jpg',
            'images/morot.jpg',
            'images/potatis.jpg'
        ];

        criticalImages.forEach(async (src) => {
            try {
                const optimizedSrc = await this.getOptimizedImageSrc(src);
                const img = new Image();
                img.onload = () => {
                    this.imageCache.set(src, optimizedSrc);
                    console.log('🚀 Preloaded:', src);
                };
                img.src = optimizedSrc;
            } catch (error) {
                console.warn('Kunde inte förladda bild:', src);
            }
        });
    }

    // Method to optimize image display in game
    setupImageForGame(imgElement, src) {
        if (!imgElement || !src) return;
        
        // Add loading class immediately
        imgElement.classList.add('vegetable-image', 'loading');
        imgElement.alt = 'Laddar produktbild...';
        
        // Use Intersection Observer for lazy loading if available
        if (this.lazyLoadObserver) {
            imgElement.dataset.src = src;
            this.lazyLoadObserver.observe(imgElement);
        } else {
            // Fallback: load immediately
            imgElement.dataset.src = src;
            this.loadImage(imgElement);
        }
    }

    // Performance monitoring
    getImageLoadingStats() {
        const totalImages = this.imageCache.size;
        const cacheHitRate = totalImages > 0 ? (this.imageCache.size / totalImages * 100).toFixed(1) : 0;
        
        return {
            totalCachedImages: totalImages,
            cacheHitRate: `${cacheHitRate}%`,
            webpSupported: this.webpSupported
        };
    }
}

// Mobile Touch Enhancement Class
class TouchEnhancer {
    constructor() {
        this.startX = null;
        this.startY = null;
        this.minSwipeDistance = 50;
        this.maxSwipeTime = 300;
        this.startTime = null;
        this.setupTouchHandlers();
    }

    setupTouchHandlers() {
        // Add touch event listeners for swipe gestures
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        
        // Enhance button touch feedback
        this.enhanceButtonTouchFeedback();
        
        // Add iOS-style momentum scrolling
        document.body.style.webkitOverflowScrolling = 'touch';
        
        console.log('📱 Touch enhancements aktiverade');
    }

    handleTouchStart(e) {
        if (e.touches.length === 1) {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
            this.startTime = Date.now();
        }
    }

    handleTouchMove(e) {
        // Prevent pull-to-refresh on mobile
        if (e.touches.length === 1 && window.scrollY === 0) {
            const deltaY = e.touches[0].clientY - this.startY;
            if (deltaY > 0) {
                e.preventDefault();
            }
        }
    }

    handleTouchEnd(e) {
        if (!this.startX || !this.startY || !this.startTime) return;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaTime = Date.now() - this.startTime;

        const deltaX = endX - this.startX;
        const deltaY = endY - this.startY;

        // Check if it's a swipe (fast enough and long enough)
        if (deltaTime <= this.maxSwipeTime) {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            // Only handle horizontal swipes (left/right)
            if (absX >= this.minSwipeDistance && absX > absY) {
                if (deltaX > 0) {
                    this.handleSwipeRight();
                } else {
                    this.handleSwipeLeft();
                }
            }
            // Vertical swipes are now disabled for better mobile experience
        }

        this.startX = null;
        this.startY = null;
        this.startTime = null;
    }

    handleSwipeLeft() {
        // Swipe left - next question
        const gameSection = document.getElementById('gameSection');
        if (gameSection && !gameSection.hidden) {
            const submitBtn = document.getElementById('submitAnswer');
            if (submitBtn && submitBtn.style.display !== 'none') {
                // If in game and submit button visible, trigger next question
                console.log('⬅️ Swipe left: Nästa fråga');
                if (window.checkAnswer) window.checkAnswer();
            }
        }
    }

    handleSwipeRight() {
        // Swipe right - back to menu or previous
        const gameSection = document.getElementById('gameSection');
        if (gameSection && !gameSection.hidden) {
            console.log('➡️ Swipe right: Tillbaka till meny');
            if (window.showMenu) window.showMenu();
        }
    }

    enhanceButtonTouchFeedback() {
        // Add touch feedback to all buttons
        const buttons = document.querySelectorAll('button, .touch-target');
        
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
                this.style.opacity = '0.8';
            }, { passive: true });
            
            button.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = '';
                    this.style.opacity = '';
                }, 100);
            }, { passive: true });
            
            button.addEventListener('touchcancel', function() {
                this.style.transform = '';
                this.style.opacity = '';
            }, { passive: true });
        });
    }
}

// Responsive Layout Manager
class ResponsiveManager {
    constructor() {
        this.setupResponsiveFeatures();
        this.setupOrientationHandling();
    }

    setupResponsiveFeatures() {
        // Add responsive classes based on screen size
        this.updateResponsiveClasses();
        window.addEventListener('resize', () => {
            this.updateResponsiveClasses();
        });
    }

    updateResponsiveClasses() {
        const body = document.body;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Remove existing classes
        body.classList.remove('mobile', 'tablet', 'desktop', 'landscape', 'portrait');

        // Add size classes
        if (width < 768) {
            body.classList.add('mobile');
        } else if (width < 1024) {
            body.classList.add('tablet');
        } else {
            body.classList.add('desktop');
        }

        // Add orientation classes
        if (width > height) {
            body.classList.add('landscape');
        } else {
            body.classList.add('portrait');
        }

        // Apply specific mobile optimizations
        if (width < 768) {
            this.applyMobileOptimizations();
        }
    }

    setupOrientationHandling() {
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateResponsiveClasses();
                this.handleOrientationChange();
            }, 100);
        });
    }

    handleOrientationChange() {
        // Refresh input focus to prevent iOS keyboard issues
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
            activeElement.blur();
            setTimeout(() => {
                activeElement.focus();
            }, 300);
        }
    }

    applyMobileOptimizations() {
        // Ensure proper zoom prevention
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
            );
        }

        // Add mobile-specific styles
        document.body.style.fontSize = Math.max(16, window.innerWidth * 0.04) + 'px';
    }
}

// Initialize mobile enhancements on touch devices
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    window.touchEnhancer = new TouchEnhancer();
    console.log('📱 Touch enhancer initialiserad');
}

// Initialize responsive manager
window.responsiveManager = new ResponsiveManager();
console.log('📱 Responsive manager initialiserad');

// Initialize image optimizer
window.imageOptimizer = new ImageOptimizer();
console.log('🖼️ Image optimizer initialiserad');

// Initialize feedback manager
window.feedbackManager = new FeedbackManager();
console.log('💡 Feedback manager initialiserad');

// 🔥 Firebase Integration Setup
document.addEventListener('DOMContentLoaded', async () => {
    // Setup Firebase event listeners efter DOM är laddat
    setupFirebaseEventListeners();
    
    // Vänta lite för att Firebase ska initiera
    setTimeout(async () => {
        if (window.firebaseManager && window.firebaseManager.isInitialized) {
            console.log('🔥 Firebase integrerat med spelet');
            await syncGameDataWithFirebase();
        }
    }, 1000);
});

function setupFirebaseEventListeners() {
    // Google Sign In button
    const signInBtn = document.getElementById('googleSignIn');
    if (signInBtn) {
        signInBtn.addEventListener('click', async () => {
            if (window.firebaseManager) {
                const success = await window.firebaseManager.signInWithGoogle();
                if (success) {
                    await syncGameDataWithFirebase();
                }
            }
        });
    }
    
    // Sign Out button
    const signOutBtn = document.getElementById('signOut');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            if (window.firebaseManager) {
                await window.firebaseManager.signOut();
            }
        });
    }
}

async function syncGameDataWithFirebase() {
    if (!window.firebaseManager || !window.dataManager) return;
    
    try {
        // Samla nuvarande speldata
        const currentData = window.dataManager.collectGameData();
        
        // Synka med Firebase
        await window.firebaseManager.syncUserData();
        
        console.log('🔄 Speldata synkat med Firebase');
    } catch (error) {
        console.error('❌ Firebase sync misslyckades:', error);
    }
}

// Achievements system integration
const achievements = {
    firstWin: {
        id: 'firstWin',
        name: 'Första segern!',
        description: 'Svara rätt på din första PLU-kod',
        icon: '🎯',
        points: 50
    },
    perfectRound: {
        id: 'perfectRound',
        name: 'Perfekt runda',
        description: 'Svara rätt på alla 10 frågor i en runda',
        icon: '💯',
        points: 200
    },
    speedDemon: {
        id: 'speedDemon',
        name: 'Hastighetsdjävul',
        description: 'Svara rätt under 2 sekunder',
        icon: '⚡',
        points: 100
    },
    streakMaster: {
        id: 'streakMaster',
        name: 'Streakmaster',
        description: 'Få en streak på 20 rätta svar',
        icon: '🔥',
        points: 300
    },
    vegetableExpert: {
        id: 'vegetableExpert',
        name: 'Grönsakssexpert',
        description: 'Lär dig alla grönsakers PLU-koder',
        icon: '🥕',
        points: 150
    },
    marathonPlayer: {
        id: 'marathonPlayer',
        name: 'Maratonspelare',
        description: 'Spela i 30 minuter utan uppehåll',
        icon: '🏃‍♂️',
        points: 250
    }
};

// Kolla achievements när spelet uppdateras
const originalEndGame = endGame;
endGame = async function() {
    const result = originalEndGame.apply(this, arguments);
    
    // Kolla achievements
    await checkAchievements();
    
    return result;
};

async function checkAchievements() {
    if (!window.firebaseManager) return;
    
    const stats = JSON.parse(localStorage.getItem('gameStats') || '{}');
    const streak = parseInt(localStorage.getItem('currentStreak') || '0');
    
    // Spara spelets resultat till Firebase
    const percentage = Math.round((score / totalQuestions) * 100);
    const currentBestScore = parseInt(localStorage.getItem('bestScore') || '0');
    
    // Hämta filter-information för bästa resultat-detaljer
    const categoryFilter = document.getElementById('categoryFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    const categories = categoryFilter ? categoryFilter.value : 'alla';
    const difficulty = difficultyFilter ? difficultyFilter.value : 'alla';
    
    // Uppdatera lokal bestScore om detta resultat är bättre
    if (percentage > currentBestScore) {
        localStorage.setItem('bestScore', percentage.toString());
        
        // Spara detaljer om det bästa resultatet
        const bestScoreDetails = {
            score: score,
            totalQuestions: totalQuestions,
            percentage: percentage,
            categories: categories,
            difficulty: difficulty,
            date: new Date().toLocaleDateString('sv-SE'),
            timestamp: Date.now()
        };
        localStorage.setItem('bestScoreDetails', JSON.stringify(bestScoreDetails));
        
        console.log('🏆 Nytt personligt rekord:', percentage + '%');
    }
    
    // Spara till Firebase (inkluderar automatisk uppdatering av bestScore)
    if (window.dataManager) {
        const gameData = window.dataManager.collectGameData();
        await window.firebaseManager.saveUserData(gameData);
        console.log('💾 Speldata sparad till Firebase:', gameData);
    }
    
    // Första seger
    if (stats.totalCorrectAnswers >= 1) {
        await window.firebaseManager.unlockAchievement('firstWin', achievements.firstWin);
    }
    
    // Perfekt runda (10/10)
    if (score === products.length) {
        await window.firebaseManager.unlockAchievement('perfectRound', achievements.perfectRound);
    }
    
    // Streak master
    if (streak >= 20) {
        await window.firebaseManager.unlockAchievement('streakMaster', achievements.streakMaster);
    }
    
    // Speed demon (kolla senaste svarstid)
    const lastAnswerTime = parseFloat(localStorage.getItem('lastAnswerTime') || '999');
    if (lastAnswerTime < 2) {
        await window.firebaseManager.unlockAchievement('speedDemon', achievements.speedDemon);
    }
    
    // Spara uppdaterad data till Firebase
    if (window.dataManager) {
        const gameData = window.dataManager.collectGameData();
        await window.firebaseManager.saveUserData(gameData);
    }
}

// Lägg till leaderboard till profilen
async function displayLeaderboard() {
    if (!window.firebaseManager || !window.firebaseManager.isInitialized) return;
    
    const leaderboard = await window.firebaseManager.getLeaderboard(10);
    
    if (leaderboard.length === 0) return;
    
    const profileContent = document.getElementById('profileContent');
    if (!profileContent) return;
    
    // Skapa leaderboard sektion
    let leaderboardSection = document.getElementById('leaderboardSection');
    if (!leaderboardSection) {
        leaderboardSection = document.createElement('div');
        leaderboardSection.id = 'leaderboardSection';
        leaderboardSection.className = 'leaderboard-section';
        profileContent.appendChild(leaderboardSection);
    }
    
    leaderboardSection.innerHTML = `
        <h3>🏆 Topplista</h3>
        <div class="leaderboard-list">
            ${leaderboard.map((player, index) => `
                <div class="leaderboard-item ${player.id === (window.firebaseManager.currentUser?.uid || '') ? 'current-user' : ''}">
                    <span class="leaderboard-rank">#${index + 1}</span>
                    <span class="leaderboard-name">${player.displayName}</span>
                    <span class="leaderboard-score">${player.bestScore}p</span>
                </div>
            `).join('')}
        </div>
    `;
}

// Uppdatera leaderboard när profilen öppnas
const originalShowProfile = showProfile;
showProfile = async function() {
    const result = originalShowProfile.apply(this, arguments);
    
    // Visa leaderboard efter en kort fördröjning
    setTimeout(displayLeaderboard, 500);
    
    return result;
};

console.log('🎮 Ultra Clean Script laddad klart - v2024 + Mobile Enhanced + Firebase');

// 👑 ADMIN PANEL FUNKTIONALITET
class AdminPanel {
    constructor() {
        this.isOpen = false;
        this.users = [];
        this.init();
    }

    init() {
        // Lägg till event listeners för admin-panel
        document.addEventListener('DOMContentLoaded', () => {
            const adminBtn = document.getElementById('adminBtn');
            const backBtn = document.getElementById('backToMenuFromAdmin');
            const refreshBtn = document.getElementById('refreshUserList');

            if (adminBtn) {
                adminBtn.addEventListener('click', () => this.showAdminPanel());
            }
            
            if (backBtn) {
                backBtn.addEventListener('click', () => this.hideAdminPanel());
            }
            
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => this.loadUsers());
            }
        });
    }

    async showAdminPanel() {
        if (!window.firebaseManager || !window.firebaseManager.isAdmin) {
            showToast('Endast administratörer kan öppna admin-panelen', 'error');
            return;
        }

        hideAllSections();
        document.getElementById('adminPanel').classList.remove('hidden');
        this.isOpen = true;
        
        await this.loadUsers();
        
        // Första användaren blir automatiskt admin
        await this.checkFirstUser();
    }

    hideAdminPanel() {
        document.getElementById('adminPanel').classList.add('hidden');
        showMenuSection();
        this.isOpen = false;
    }

    async checkFirstUser() {
        if (!window.firebaseManager || !window.firebaseManager.isInitialized) return;

        try {
            // Kontrollera om det finns några admins
            const rolesSnapshot = await window.firebase.firestore()
                .collection('userRoles')
                .where('role', '==', 'admin')
                .get();

            if (rolesSnapshot.empty && window.firebase.auth().currentUser) {
                // Ingen admin finns - gör nuvarande användare till admin
                const currentUser = window.firebase.auth().currentUser;
                await window.firebaseManager.setUserRole(currentUser.uid, 'admin');
                
                // Uppdatera lokala variabler
                window.firebaseManager.userRole = 'admin';
                window.firebaseManager.isAdmin = true;
                window.firebaseManager.isModerator = true;
                window.firebaseManager.updateRoleUI();
                
                showToast(`Grattis! Du är nu administratör för PLU Memory! 👑`, 'success');
                console.log('👑 Första användaren blev admin');
            }
        } catch (error) {
            console.error('❌ Kunde inte kontrollera första användare:', error);
        }
    }

    async loadUsers() {
        if (!window.firebaseManager || !window.firebaseManager.isModerator) return;

        const userList = document.getElementById('userList');
        if (!userList) return;

        userList.innerHTML = '<p>Laddar användare...</p>';

        try {
            this.users = await window.firebaseManager.getAllUsers();
            this.renderUserList();
            this.updateStats();
        } catch (error) {
            console.error('❌ Kunde inte ladda användare:', error);
            userList.innerHTML = '<p>Fel vid laddning av användare</p>';
        }
    }

    renderUserList() {
        const userList = document.getElementById('userList');
        if (!userList || !this.users.length) {
            userList.innerHTML = '<p>Inga användare hittades</p>';
            return;
        }

        userList.innerHTML = this.users.map(user => `
            <div class="user-item" data-user-id="${user.uid}">
                <div class="user-info">
                    <img src="${user.photoURL || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👤</text></svg>'}" 
                         alt="Avatar" class="user-avatar">
                    <div class="user-details">
                        <div class="user-name">
                            ${user.displayName}
                            ${user.isCurrentUser ? ' (Du)' : ''}
                        </div>
                        <div class="user-email">${user.email}</div>
                    </div>
                    <span class="role-badge ${user.role}">
                        ${user.role === 'admin' ? '👑' : user.role === 'moderator' ? '🛡️' : '👤'} 
                        ${user.role.toUpperCase()}
                    </span>
                </div>
                <div class="user-actions">
                    ${this.getUserActionButtons(user)}
                </div>
            </div>
        `).join('');

        // Lägg till event listeners för knappar
        this.attachUserActionListeners();
    }

    getUserActionButtons(user) {
        if (!window.firebaseManager.isAdmin || user.isCurrentUser) {
            return '<span style="color: #999;">-</span>';
        }

        const buttons = [];
        
        if (user.role === 'user') {
            buttons.push(`
                <button class="role-btn promote" data-action="promote" data-user-id="${user.uid}" data-user-name="${user.displayName}">
                    🛡️ Gör till moderator
                </button>
            `);
        }
        
        if (user.role === 'moderator') {
            buttons.push(`
                <button class="role-btn demote" data-action="demote" data-user-id="${user.uid}" data-user-name="${user.displayName}">
                    👤 Ta bort moderator
                </button>
            `);
        }
        
        return buttons.join('');
    }

    attachUserActionListeners() {
        const buttons = document.querySelectorAll('.role-btn[data-action]');
        buttons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const action = e.target.dataset.action;
                const userId = e.target.dataset.userId;
                const userName = e.target.dataset.userName;
                
                if (action === 'promote') {
                    await this.promoteUser(userId, userName);
                } else if (action === 'demote') {
                    await this.demoteUser(userId, userName);
                }
            });
        });
    }

    async promoteUser(userId, userName) {
        if (!confirm(`Vill du verkligen göra ${userName} till moderator?`)) return;
        
        const success = await window.firebaseManager.promoteToModerator(userId, userName);
        if (success) {
            await this.loadUsers(); // Uppdatera listan
        }
    }

    async demoteUser(userId, userName) {
        if (!confirm(`Vill du verkligen ta bort moderator-rollen från ${userName}?`)) return;
        
        const success = await window.firebaseManager.demoteUser(userId, userName);
        if (success) {
            await this.loadUsers(); // Uppdatera listan
        }
    }

    updateStats() {
        const stats = {
            total: this.users.length,
            admins: this.users.filter(u => u.role === 'admin').length,
            moderators: this.users.filter(u => u.role === 'moderator').length,
            users: this.users.filter(u => u.role === 'user').length
        };

        const totalUsers = document.getElementById('totalUsers');
        const totalAdmins = document.getElementById('totalAdmins');
        const totalModerators = document.getElementById('totalModerators');

        if (totalUsers) totalUsers.textContent = stats.total;
        if (totalAdmins) totalAdmins.textContent = stats.admins;
        if (totalModerators) totalModerators.textContent = stats.moderators;
    }
}

// Initiera admin-panel
window.adminPanel = new AdminPanel();

console.log('👑 Admin Panel initierat - rollsystem aktivt');

// 📱 MOBILOPTIMERING - Hantera nya inställningsstrukturen
document.addEventListener('DOMContentLoaded', () => {
    // Synka tema-inställningar mellan huvudknapp och inställningspanel
    const darkModeMain = document.getElementById('darkModeToggle');
    const darkModeAccessibility = document.getElementById('darkModeToggleAccessibility');
    
    // Synka ljud-inställningar
    const soundMain = document.getElementById('soundToggleBtn');
    const soundAccessibility = document.getElementById('soundToggleAccessibility');
    
    // Tema-synkronisering
    if (darkModeMain && darkModeAccessibility) {
        // Synka tillstånd från huvudknapp till inställningar
        const syncThemeToAccessibility = () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            darkModeAccessibility.checked = isDark;
        };
        
        // Synka från inställningar till huvudknapp
        darkModeAccessibility.addEventListener('change', () => {
            if (darkModeMain.onclick) {
                darkModeMain.onclick();
            }
            // Uppdatera state efter kort fördröjning
            setTimeout(syncThemeToAccessibility, 100);
        });
        
        // Initial synk
        syncThemeToAccessibility();
        
        // Synka när tema ändras via huvudknapp
        const originalThemeClick = darkModeMain.onclick;
        darkModeMain.onclick = () => {
            if (originalThemeClick) originalThemeClick();
            setTimeout(syncThemeToAccessibility, 100);
        };
    }
    
    // Ljud-synkronisering
    if (soundMain && soundAccessibility) {
        const syncSoundToAccessibility = () => {
            const isSoundOn = soundMain.textContent.includes('På');
            soundAccessibility.checked = isSoundOn;
        };
        
        soundAccessibility.addEventListener('change', () => {
            if (soundMain.onclick) {
                soundMain.onclick();
            }
            setTimeout(syncSoundToAccessibility, 100);
        });
        
        // Initial synk
        syncSoundToAccessibility();
        
        // Synka när ljud ändras via huvudknapp
        const originalSoundClick = soundMain.onclick;
        soundMain.onclick = () => {
            if (originalSoundClick) originalSoundClick();
            setTimeout(syncSoundToAccessibility, 100);
        };
    }
    
    // Förbättra touch-hantering på mobil
    if ('ontouchstart' in window) {
        // Lägg till touch-optimering för alla knappar
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            }, { passive: true });
            
            button.addEventListener('touchend', function() {
                this.style.transform = '';
            }, { passive: true });
            
            button.addEventListener('touchcancel', function() {
                this.style.transform = '';
            }, { passive: true });
        });
        
        // Förhindra dubbeltryck-zoom på viktiga element
        const preventZoom = (e) => {
            if (e.touches && e.touches.length > 1) {
                e.preventDefault();
            }
        };
        
        document.addEventListener('touchstart', preventZoom, { passive: false });
    }
});

console.log('📱 Mobiloptimering aktiverad - förbättrad touch-upplevelse');
console.log('🔥 Firebase achievements och leaderboard aktiverat');