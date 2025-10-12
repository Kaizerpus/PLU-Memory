// Firebase konfiguration för PLU Memory Game
// ⚠️ VIKTIGT: Ersätt värdena nedan med dina egna från Firebase Console
// Se FIREBASE-SETUP.md för detaljerade instruktioner

const firebaseConfig = {
 apiKey: "AIzaSyBomzD9K7HgrR2A5vHBl6O_ovKMQS4tISE",
  authDomain: "plu-memory.firebaseapp.com",
  projectId: "plu-memory",
  storageBucket: "plu-memory.firebasestorage.app",
  messagingSenderId: "688682728129",
  appId: "1:688682728129:web:35286ebe42844f98303240",
  measurementId: "G-2XHS3S9BMJ"
};

// Firebase-moduler som laddas från CDN
let firebase = null;
let db = null;
let auth = null;
let currentUser = null;

// 🔥 Firebase Manager - Hanterar all Firebase-funktionalitet
class FirebaseManager {
    constructor() {
        this.isInitialized = false;
        this.isOnline = navigator.onLine;
        this.pendingWrites = [];
        this.retryCount = 0;
        this.maxRetries = 3;
        this.persistenceEnabled = false;
        this.authListenerSet = false;
        this.userRole = 'user'; // 'user', 'moderator', 'admin'
        this.isAdmin = false;
        this.isModerator = false;
        
        // Lyssna på nätverksstatus
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    async initialize() {
        try {
            // Kontrollera om redan initialiserat
            if (this.isInitialized) {
                console.log('🔄 Firebase redan initialiserat');
                return true;
            }
            
            console.log('🔥 Startar Firebase-initialisering...');
            
            // Kontrollera om Firebase config är konfigurerad
            if (firebaseConfig.apiKey === "DIN_API_KEY_HÄR") {
                console.log('⚠️ Firebase inte konfigurerad - använder offline-läge');
                return false;
            }

            console.log('📋 Firebase config verkar konfigurerad:', {
                projectId: firebaseConfig.projectId,
                authDomain: firebaseConfig.authDomain
            });

            // Kontrollera om Firebase redan är laddat
            if (!window.firebase) {
                console.log('📦 Laddar Firebase scripts från CDN...');
                await this.loadFirebaseScripts();
                console.log('✅ Firebase scripts laddade');
            } else {
                console.log('♻️ Firebase scripts redan laddade');
            }
            
            // Initiera Firebase (bara om inte redan gjort)
            firebase = window.firebase;
            if (!firebase) {
                throw new Error('Firebase kunde inte laddas från CDN');
            }
            
            // Kontrollera om Firebase app redan är initialiserad
            if (firebase.apps.length === 0) {
                console.log('🚀 Initialiserar Firebase med config...');
                firebase.initializeApp(firebaseConfig);
                console.log('✅ Firebase app initialiserad');
            } else {
                console.log('♻️ Firebase app redan initialiserad');
            }
            
            // Sätt upp Firestore och Auth
            console.log('🗃️ Sätter upp Firestore...');
            db = firebase.firestore();
            console.log('✅ Firestore konfigurerad');
            
            console.log('🔐 Sätter upp Authentication...');
            auth = firebase.auth();
            console.log('✅ Auth konfigurerad');
            
            // Aktivera offline-stöd (bara en gång)
            if (!this.persistenceEnabled) {
                console.log('💾 Aktiverar offline persistence...');
                db.enablePersistence({ synchronizeTabs: true })
                    .then(() => {
                        console.log('✅ Offline persistence aktiverat');
                        this.persistenceEnabled = true;
                    })
                    .catch(err => {
                        console.log('⚠️ Offline persistence kunde inte aktiveras:', err.message);
                        // Detta är OK, fortsätt ändå
                    });
            }
            
            // Lyssna på autentiseringsförändringar (bara en gång)
            if (!this.authListenerSet) {
                console.log('👂 Sätter upp auth state listener...');
                auth.onAuthStateChanged(async user => {
                    currentUser = user;
                    console.log('👤 Auth state ändrad:', user ? `Inloggad som ${user.displayName}` : 'Ej inloggad');
                    
                    if (user) {
                        await this.checkUserRole(user);
                    }
                    
                    this.handleAuthStateChange(user);
                });
                this.authListenerSet = true;
            }

            this.isInitialized = true;
            console.log('🎉 Firebase fullständigt initialiserat!');
            return true;
            
        } catch (error) {
            console.error('❌ Firebase init misslyckades:', error);
            console.error('📍 Fel detaljer:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            return false;
        }
    }

    async loadFirebaseScripts() {
        const scripts = [
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js',
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js'
        ];

        for (const src of scripts) {
            console.log(`📥 Laddar: ${src}`);
            try {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = () => {
                        console.log(`✅ Laddad: ${src}`);
                        resolve();
                    };
                    script.onerror = (error) => {
                        console.error(`❌ Kunde inte ladda: ${src}`, error);
                        reject(new Error(`Failed to load script: ${src}`));
                    };
                    document.head.appendChild(script);
                });
            } catch (error) {
                console.error(`💥 Script-laddning misslyckades för ${src}:`, error);
                throw error;
            }
        }
        
        console.log('🔍 Kontrollerar att Firebase är tillgängligt...');
        if (typeof window.firebase === 'undefined') {
            throw new Error('Firebase inte tillgängligt efter script-laddning');
        }
        console.log('✅ Firebase globalt objekt bekräftat');
    }

    handleAuthStateChange(user) {
        if (user) {
            console.log('👤 Användare inloggad:', user.displayName);
            this.syncUserData();
            this.checkUserRole(user);
            this.updateUI(true);
        } else {
            console.log('👤 Användare utloggad');
            this.updateUI(false);
        }
    }

    async signInWithGoogle() {
        console.log('🔐 Startar Google Sign-In process...');
        
        if (!this.isInitialized) {
            console.error('❌ Firebase inte initialiserat');
            if (window.showToast) {
                window.showToast('Firebase inte initialiserat. Försök igen senare.', 'error');
            }
            return false;
        }
        
        if (!auth) {
            console.error('❌ Firebase Auth inte tillgängligt');
            if (window.showToast) {
                window.showToast('Authentication inte tillgängligt.', 'error');
            }
            return false;
        }
        
        try {
            console.log('🏗️ Skapar Google Auth Provider...');
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            console.log('🪟 Öppnar Google Sign-In popup...');
            const result = await auth.signInWithPopup(provider);
            
            console.log('✅ Google Sign-In framgångsrik:', {
                user: result.user.displayName,
                email: result.user.email,
                uid: result.user.uid
            });
            
            if (window.showToast) {
                window.showToast(`Välkommen ${result.user.displayName}! 👋`, 'success');
            }
            
            // Triggera en synkronisering av användardata
            setTimeout(() => {
                this.syncUserData();
            }, 1000);
            
            return true;
            
        } catch (error) {
            console.error('❌ Google Sign-In misslyckades:', {
                code: error.code,
                message: error.message,
                fullError: error
            });
            
            let userMessage = 'Inloggning misslyckades. ';
            
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    userMessage += 'Popup stängdes av användaren.';
                    console.log('ℹ️ Användaren stängde popup-fönstret');
                    break;
                case 'auth/popup-blocked':
                    userMessage += 'Popup blockerades av webbläsaren. Tillåt popups för denna sida.';
                    console.log('🚫 Popup blockerades av webbläsaren');
                    break;
                case 'auth/unauthorized-domain':
                    userMessage += 'Domänen är inte auktoriserad. Kontakta administratören.';
                    console.log('🚫 Unauthorized domain - lägg till i Firebase Console');
                    break;
                case 'auth/operation-not-allowed':
                    userMessage += 'Google Sign-In inte aktiverat. Kontakta administratören.';
                    console.log('🚫 Google Sign-In inte aktiverat i Firebase Console');
                    break;
                default:
                    userMessage += `Fel: ${error.message}`;
            }
            
            if (window.showToast) {
                window.showToast(userMessage, 'error');
            }
            return false;
        }
    }

    async signOut() {
        if (!this.isInitialized || !currentUser) return;
        
        try {
            await auth.signOut();
            window.showToast('Du är nu utloggad', 'info');
            
        } catch (error) {
            console.error('❌ Utloggning misslyckades:', error);
        }
    }

    // Apple Sign-In
    async signInWithApple() {
        console.log('🍎 Startar Apple Sign-In process...');
        
        if (!this.isInitialized) {
            console.error('❌ Firebase inte initialiserat');
            if (window.showToast) {
                window.showToast('Firebase inte initialiserat. Försök igen senare.', 'error');
            }
            return false;
        }
        
        try {
            const provider = new firebase.auth.OAuthProvider('apple.com');
            provider.setCustomParameters({ locale: 'sv' });
            provider.addScope('email');
            provider.addScope('name');
            
            console.log('🪟 Öppnar Apple Sign-In popup...');
            const result = await auth.signInWithPopup(provider);
            
            console.log('✅ Apple Sign-In framgångsrik:', {
                user: result.user.displayName || result.user.email,
                email: result.user.email,
                uid: result.user.uid
            });
            
            if (window.showToast) {
                const displayName = result.user.displayName || result.user.email?.split('@')[0] || 'Apple-användare';
                window.showToast(`Välkommen ${displayName}! 🍎`, 'success');
            }
            
            setTimeout(() => {
                this.syncUserData();
            }, 1000);
            
            return true;
            
        } catch (error) {
            console.error('❌ Apple Sign-In misslyckades:', error);
            
            let userMessage = 'Apple-inloggning misslyckades. ';
            
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    userMessage += 'Popup stängdes av användaren.';
                    break;
                case 'auth/popup-blocked':
                    userMessage += 'Popup blockerades av webbläsaren.';
                    break;
                case 'auth/operation-not-allowed':
                    userMessage += 'Apple Sign-In inte aktiverat.';
                    break;
                default:
                    userMessage += `Fel: ${error.message}`;
            }
            
            if (window.showToast) {
                window.showToast(userMessage, 'error');
            }
            return false;
        }
    }

    // Email/Password Sign-In
    async signInWithEmail(email, password) {
        console.log('📧 Startar Email Sign-In process...');
        
        if (!this.isInitialized) {
            console.error('❌ Firebase inte initialiserat');
            return false;
        }
        
        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            
            console.log('✅ Email Sign-In framgångsrik:', {
                user: result.user.email,
                uid: result.user.uid
            });
            
            if (window.showToast) {
                const displayName = result.user.displayName || result.user.email?.split('@')[0] || 'E-post-användare';
                window.showToast(`Välkommen ${displayName}! 📧`, 'success');
            }
            
            setTimeout(() => {
                this.syncUserData();
            }, 1000);
            
            return true;
            
        } catch (error) {
            console.error('❌ Email Sign-In misslyckades:', error);
            
            let userMessage = 'E-post-inloggning misslyckades. ';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    userMessage += 'Ingen användare hittades med denna e-post.';
                    break;
                case 'auth/wrong-password':
                    userMessage += 'Fel lösenord.';
                    break;
                case 'auth/invalid-email':
                    userMessage += 'Ogiltig e-postadress.';
                    break;
                case 'auth/user-disabled':
                    userMessage += 'Kontot är inaktiverat.';
                    break;
                default:
                    userMessage += `Fel: ${error.message}`;
            }
            
            if (window.showToast) {
                window.showToast(userMessage, 'error');
            }
            return false;
        }
    }

    // Email/Password Registration
    async registerWithEmail(email, password) {
        console.log('📧 Startar Email Registration process...');
        
        if (!this.isInitialized) {
            console.error('❌ Firebase inte initialiserat');
            return false;
        }
        
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            
            console.log('✅ Email Registration framgångsrik:', {
                user: result.user.email,
                uid: result.user.uid
            });
            
            if (window.showToast) {
                window.showToast('Konto skapat! Välkommen! 🎉', 'success');
            }
            
            setTimeout(() => {
                this.syncUserData();
            }, 1000);
            
            return true;
            
        } catch (error) {
            console.error('❌ Email Registration misslyckades:', error);
            
            let userMessage = 'Registrering misslyckades. ';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    userMessage += 'E-postadressen används redan.';
                    break;
                case 'auth/invalid-email':
                    userMessage += 'Ogiltig e-postadress.';
                    break;
                case 'auth/weak-password':
                    userMessage += 'Lösenordet är för svagt.';
                    break;
                default:
                    userMessage += `Fel: ${error.message}`;
            }
            
            if (window.showToast) {
                window.showToast(userMessage, 'error');
            }
            return false;
        }
    }

    // Password Reset
    async resetPassword(email) {
        console.log('🔑 Startar Password Reset process...');
        
        if (!this.isInitialized) {
            console.error('❌ Firebase inte initialiserat');
            return false;
        }
        
        try {
            await auth.sendPasswordResetEmail(email);
            
            console.log('✅ Password Reset email skickat');
            
            if (window.showToast) {
                window.showToast('Återställningslänk skickad till din e-post! 📧', 'success');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Password Reset misslyckades:', error);
            
            let userMessage = 'Lösenordsåterställning misslyckades. ';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    userMessage += 'Ingen användare hittades med denna e-post.';
                    break;
                case 'auth/invalid-email':
                    userMessage += 'Ogiltig e-postadress.';
                    break;
                default:
                    userMessage += `Fel: ${error.message}`;
            }
            
            if (window.showToast) {
                window.showToast(userMessage, 'error');
            }
            return false;
        }
    }

    async saveUserData(userData) {
        if (!this.isInitialized || !currentUser) {
            console.log('🚫 Kan inte spara - Firebase inte initialiserat eller användare inte inloggad');
            // Spara lokalt om offline eller inte inloggad
            this.saveLocalBackup(userData);
            return;
        }

        try {
            console.log('💾 Sparar användardata till Firebase:', userData);
            
            const userDoc = db.collection('users').doc(currentUser.uid);
            const saveData = {
                ...userData,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                displayName: currentUser.displayName,
                email: currentUser.email
            };

            if (this.isOnline) {
                await userDoc.set(saveData, { merge: true });
                console.log('✅ Data sparad till Firebase framgångsrikt');
                
                // Verifiera att datan sparades
                const doc = await userDoc.get();
                if (doc.exists) {
                    console.log('🔍 Verifierad sparad data:', doc.data());
                }
            } else {
                console.log('📡 Offline - lägger till i kö för senare synk');
                // Lägg till i kö för senare synk
                this.pendingWrites.push({ doc: userDoc, data: saveData });
                this.saveLocalBackup(userData);
            }
            
        } catch (error) {
            console.error('❌ Kunde inte spara till Firebase:', error);
            this.saveLocalBackup(userData);
        }
    }

    async loadUserData() {
        if (!this.isInitialized || !currentUser) {
            return this.loadLocalBackup();
        }

        try {
            const userDoc = await db.collection('users').doc(currentUser.uid).get();
            
            if (userDoc.exists) {
                const cloudData = userDoc.data();
                const localData = this.loadLocalBackup();
                
                // Slå samman lokal och cloud-data (cloud vinner vid konflikter)
                const mergedData = this.mergeUserData(localData, cloudData);
                console.log('☁️ Data laddad från Firebase');
                return mergedData;
            } else {
                // Första gången - använd lokal data
                const localData = this.loadLocalBackup();
                if (localData && Object.keys(localData).length > 0) {
                    await this.saveUserData(localData);
                }
                return localData;
            }
            
        } catch (error) {
            console.error('❌ Kunde inte ladda från Firebase:', error);
            return this.loadLocalBackup();
        }
    }

    saveLocalBackup(userData) {
        try {
            localStorage.setItem('firebase-backup', JSON.stringify({
                ...userData,
                lastSaved: Date.now()
            }));
        } catch (error) {
            console.error('❌ Kunde inte spara lokal backup:', error);
        }
    }

    loadLocalBackup() {
        try {
            const backup = localStorage.getItem('firebase-backup');
            return backup ? JSON.parse(backup) : null;
        } catch (error) {
            console.error('❌ Kunde inte ladda lokal backup:', error);
            return null;
        }
    }

    mergeUserData(localData, cloudData) {
        if (!localData) return cloudData;
        if (!cloudData) return localData;

        // Använd den senast uppdaterade versionen för varje fält
        return {
            ...localData,
            ...cloudData,
            // Behåll högsta värden för statistik
            gameData: {
                totalGamesPlayed: Math.max(
                    localData.gameData?.totalGamesPlayed || 0,
                    cloudData.gameData?.totalGamesPlayed || 0
                ),
                totalCorrectAnswers: Math.max(
                    localData.gameData?.totalCorrectAnswers || 0,
                    cloudData.gameData?.totalCorrectAnswers || 0
                ),
                bestScore: Math.max(
                    localData.gameData?.bestScore || 0,
                    cloudData.gameData?.bestScore || 0
                ),
                bestStreak: Math.max(
                    localData.gameData?.bestStreak || 0,
                    cloudData.gameData?.bestStreak || 0
                ),
                totalPlayTime: Math.max(
                    localData.gameData?.totalPlayTime || 0,
                    cloudData.gameData?.totalPlayTime || 0
                )
            },
            // Slå samman achievements
            achievements: {
                ...localData.achievements,
                ...cloudData.achievements
            }
        };
    }

    async syncUserData() {
        if (!this.isInitialized || !currentUser) return;

        try {
            // Ladda nuvarande data från molnet
            const cloudData = await this.loadUserData();
            
            // Samla nuvarande speldata
            const currentData = window.dataManager ? window.dataManager.collectGameData() : {};
            
            // Slå samman och spara
            const mergedData = this.mergeUserData(currentData, cloudData);
            await this.saveUserData(mergedData);
            
            // Uppdatera lokal data med sammanslagen version
            if (window.dataManager) {
                window.dataManager.restoreFromData(mergedData);
            }
            
        } catch (error) {
            console.error('❌ Synkronisering misslyckades:', error);
        }
    }

    async syncPendingData() {
        if (!this.isOnline || this.pendingWrites.length === 0) return;

        console.log(`🔄 Synkar ${this.pendingWrites.length} väntande skrivningar...`);
        
        const writes = [...this.pendingWrites];
        this.pendingWrites = [];

        for (const write of writes) {
            try {
                await write.doc.set(write.data, { merge: true });
            } catch (error) {
                console.error('❌ Synk misslyckades:', error);
                // Lägg tillbaka i kön
                this.pendingWrites.push(write);
            }
        }

        if (this.pendingWrites.length === 0) {
            console.log('✅ Alla väntande skrivningar synkade');
        }
    }

    updateUI(isSignedIn) {
        const signInBtn = document.getElementById('googleSignIn');
        const signOutBtn = document.getElementById('signOut');
        const userInfo = document.getElementById('userInfo');
        const userInfoMenu = document.getElementById('userInfoMenu');

        if (signInBtn) signInBtn.style.display = isSignedIn ? 'none' : 'block';
        if (signOutBtn) signOutBtn.style.display = isSignedIn ? 'block' : 'none';
        
        // Update profile page userInfo (if it exists)
        if (userInfo && currentUser) {
            userInfo.innerHTML = `
                <div class="user-profile">
                    <img src="${currentUser.photoURL}" alt="Profil" class="profile-img">
                    <span>Inloggad som ${currentUser.displayName}</span>
                </div>
            `;
        } else if (userInfo) {
            userInfo.innerHTML = '<span>Inte inloggad - data sparas lokalt</span>';
        }
        
        // Update profile auth section userInfoMenu 
        if (userInfoMenu && currentUser) {
            userInfoMenu.innerHTML = `
                <div class="user-profile">
                    <img src="${currentUser.photoURL}" alt="Profil" class="profile-img">
                    <span>Inloggad som ${currentUser.displayName}</span>
                </div>
            `;
        } else if (userInfoMenu) {
            userInfoMenu.innerHTML = '<span>Inte inloggad - data sparas lokalt</span>';
        }
    }

    // Achievements system
    async unlockAchievement(achievementId, achievementData) {
        const userData = await this.loadUserData() || {};
        
        if (!userData.achievements) userData.achievements = {};
        
        if (!userData.achievements[achievementId]) {
            userData.achievements[achievementId] = {
                ...achievementData,
                unlockedAt: Date.now(),
                dateString: new Date().toLocaleDateString('sv-SE')
            };
            
            await this.saveUserData(userData);
            
            // Visa achievement notification
            this.showAchievementUnlocked(achievementData);
            
            console.log(`🏆 Achievement unlocked: ${achievementData.name}`);
        }
    }

    showAchievementUnlocked(achievement) {
        const modal = document.createElement('div');
        modal.className = 'modal show achievement-modal';
        modal.innerHTML = `
            <div class="modal-content achievement-content">
                <div class="achievement-header">
                    <h2>🏆 Achievement Unlocked!</h2>
                </div>
                <div class="achievement-body">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                    <div class="achievement-points">+${achievement.points} poäng</div>
                </div>
                <div class="achievement-footer">
                    <button class="btn btn-primary close-achievement">Awesome!</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Auto-close efter 5 sekunder
        setTimeout(() => modal.remove(), 5000);
        
        modal.querySelector('.close-achievement').onclick = () => modal.remove();
        modal.onclick = (e) => e.target === modal && modal.remove();
    }

    // Leaderboard funktioner
    async getLeaderboard(limit = 10) {
        if (!this.isInitialized) {
            console.log('🚫 Firebase inte initialiserat för leaderboard');
            return [];
        }

        try {
            console.log('🔍 Hämtar leaderboard från Firebase...');
            
            // Vi kan inte kombinera where + orderBy på olika fält i Firestore
            // Så vi hämtar alla användare och filtrerar i JavaScript istället
            const snapshot = await db.collection('users')
                .orderBy('gameData.bestScore', 'desc')
                .limit(50) // Hämta fler för att kompensera för filtrering
                .get();

            console.log('📊 Firebase query result:', {
                size: snapshot.size,
                docs: snapshot.docs.length
            });

            const results = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log('👤 User data:', {
                    id: doc.id,
                    displayName: data.displayName,
                    bestScore: data.gameData?.bestScore,
                    totalGamesPlayed: data.gameData?.totalGamesPlayed
                });
                
                return {
                    id: doc.id,
                    displayName: data.displayName,
                    bestScore: data.gameData?.bestScore || 0,
                    totalGamesPlayed: data.gameData?.totalGamesPlayed || 0,
                    bestScoreDetails: data.gameData?.bestScoreDetails || null
                };
            }).filter(user => {
                // Filtrera i JavaScript istället för Firestore query
                const isValid = user.bestScore > 0 && user.totalGamesPlayed > 0;
                if (!isValid) {
                    console.log('🚫 Filtrerar bort användare:', user);
                }
                return isValid;
            }).slice(0, limit); // Ta bara de första X efter filtrering

            console.log('✅ Slutgiltiga leaderboard resultat:', results);
            return results;
            
        } catch (error) {
            console.error('❌ Kunde inte ladda leaderboard:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            return [];
        }
    }

    // 🔐 ROLLSYSTEM - Admin & Moderator funktioner
    async checkUserRole(user) {
        if (!this.isInitialized || !user) return;

        try {
            // Kontrollera om användaren har en roll i databasen
            const roleDoc = await db.collection('userRoles').doc(user.uid).get();
            
            if (roleDoc.exists) {
                const roleData = roleDoc.data();
                this.userRole = roleData.role || 'user';
                this.isAdmin = this.userRole === 'admin';
                this.isModerator = this.userRole === 'moderator' || this.isAdmin;
                
                console.log('👑 Användarroll laddad:', {
                    role: this.userRole,
                    isAdmin: this.isAdmin,
                    isModerator: this.isModerator
                });
            } else {
                // Första gången för denna användare - ge user-roll
                await this.setUserRole(user.uid, 'user');
                this.userRole = 'user';
                this.isAdmin = false;
                this.isModerator = false;
                
                console.log('👤 Ny användare - satt som user');
            }
            
            // Uppdatera UI baserat på roll
            this.updateRoleUI();
            
        } catch (error) {
            console.error('❌ Kunde inte kontrollera användarroll:', error);
            // Fallback till user
            this.userRole = 'user';
            this.isAdmin = false;
            this.isModerator = false;
        }
    }

    async setUserRole(userId, newRole) {
        if (!this.isInitialized) return false;
        
        // Första användaren blir automatiskt admin, annars kräv admin-rättigheter
        const isFirstUser = !currentUser && newRole === 'user';
        if (!isFirstUser && !this.isAdmin && newRole !== 'user') {
            console.error('❌ Endast admin kan sätta moderator/admin roller');
            if (window.showToast) {
                window.showToast('Endast admin kan sätta roller', 'error');
            }
            return false;
        }

        try {
            const roleData = {
                role: newRole,
                setBy: currentUser?.uid || 'system',
                setByName: currentUser?.displayName || 'System',
                setAt: firebase.firestore.FieldValue.serverTimestamp(),
                userId: userId
            };

            await db.collection('userRoles').doc(userId).set(roleData, { merge: true });
            
            // Logga rolländringen (om inte första användaren)
            if (currentUser) {
                await db.collection('roleChanges').add({
                    targetUserId: userId,
                    newRole: newRole,
                    changedBy: currentUser.uid,
                    changedByName: currentUser.displayName,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            console.log(`✅ Användarroll uppdaterad: ${userId} → ${newRole}`);
            
            if (window.showToast) {
                window.showToast(`Användarroll uppdaterad till ${newRole}`, 'success');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Kunde inte sätta användarroll:', error);
            if (window.showToast) {
                window.showToast('Kunde inte uppdatera roll', 'error');
            }
            return false;
        }
    }

    async getAllUsers() {
        if (!this.isInitialized || !this.isModerator) return [];

        try {
            // Hämta bara rolldata - inte användardata från users-kollektionen
            // eftersom säkerhetsreglerna blockerar det
            const rolesSnapshot = await db.collection('userRoles').get();
            const authUsersSnapshot = await db.collection('users').get();
            
            const allUsers = [];
            
            // Kombinera data från båda kollektionerna
            rolesSnapshot.docs.forEach(roleDoc => {
                const roleData = roleDoc.data();
                const userId = roleDoc.id;
                
                // Hitta motsvarande användardata
                const userDoc = authUsersSnapshot.docs.find(doc => doc.id === userId);
                const userData = userDoc ? userDoc.data() : {};
                
                allUsers.push({
                    uid: userId,
                    displayName: userData.displayName || roleData.setByName || 'Okänd användare',
                    email: userData.email || 'Ingen e-post',
                    lastActive: userData.lastUpdated || roleData.setAt,
                    gameStats: userData.gameData || {},
                    role: roleData.role || 'user',
                    isCurrentUser: userId === currentUser.uid,
                    photoURL: userData.photoURL || null
                });
            });
            
            // Sortera: admin först, sedan moderator, sedan user
            return allUsers.sort((a, b) => {
                const roleOrder = { admin: 3, moderator: 2, user: 1 };
                return roleOrder[b.role] - roleOrder[a.role];
            });
            
        } catch (error) {
            console.error('❌ Kunde inte hämta användarlista:', error);
            
            // Fallback - försök bara hämta roller
            try {
                const rolesSnapshot = await db.collection('userRoles').get();
                const basicUsers = rolesSnapshot.docs.map(doc => ({
                    uid: doc.id,
                    displayName: doc.data().setByName || 'Användare',
                    email: 'Ej tillgänglig',
                    role: doc.data().role || 'user',
                    isCurrentUser: doc.id === currentUser.uid,
                    photoURL: null,
                    lastActive: doc.data().setAt,
                    gameStats: {}
                }));
                
                console.log('⚠️ Använder grundläggande användardata');
                return basicUsers.sort((a, b) => {
                    const roleOrder = { admin: 3, moderator: 2, user: 1 };
                    return roleOrder[b.role] - roleOrder[a.role];
                });
                
            } catch (fallbackError) {
                console.error('❌ Även fallback misslyckades:', fallbackError);
                return [];
            }
        }
    }

    async promoteToModerator(userId, userName) {
        if (!this.isAdmin) {
            if (window.showToast) {
                window.showToast('Endast admin kan sätta moderatorer', 'error');
            }
            return false;
        }
        
        const success = await this.setUserRole(userId, 'moderator');
        if (success && window.showToast) {
            window.showToast(`${userName} är nu moderator! 👑`, 'success');
        }
        return success;
    }

    async demoteUser(userId, userName) {
        if (!this.isAdmin) {
            if (window.showToast) {
                window.showToast('Endast admin kan ta bort roller', 'error');
            }
            return false;
        }
        
        const success = await this.setUserRole(userId, 'user');
        if (success && window.showToast) {
            window.showToast(`${userName} är nu vanlig användare`, 'info');
        }
        return success;
    }

    updateRoleUI() {
        // Uppdatera UI baserat på användarens roll
        const adminElements = document.querySelectorAll('.admin-only');
        const moderatorElements = document.querySelectorAll('.moderator-only');
        
        adminElements.forEach(el => {
            el.style.display = this.isAdmin ? 'block' : 'none';
        });
        
        moderatorElements.forEach(el => {
            el.style.display = this.isModerator ? 'block' : 'none';
        });
        
        // Lägg till rollbadge i användarinfo
        const userInfo = document.getElementById('userInfo');
        const userInfoMenu = document.getElementById('userInfoMenu');
        
        if (userInfo && currentUser) {
            const roleEmoji = this.isAdmin ? '👑' : this.isModerator ? '🛡️' : '👤';
            const roleText = this.isAdmin ? 'Admin' : this.isModerator ? 'Moderator' : 'Användare';
            
            userInfo.innerHTML = `
                <div class="user-profile">
                    <img src="${currentUser.photoURL}" alt="Profil" class="profile-img">
                    <span>Inloggad som ${currentUser.displayName}</span>
                    <span class="role-badge ${this.userRole}">${roleEmoji} ${roleText}</span>
                </div>
            `;
        }
        
        if (userInfoMenu && currentUser) {
            const roleEmoji = this.isAdmin ? '👑' : this.isModerator ? '🛡️' : '👤';
            const roleText = this.isAdmin ? 'Admin' : this.isModerator ? 'Moderator' : 'Användare';
            userInfoMenu.innerHTML = `
                <div class="user-profile">
                    <img src="${currentUser.photoURL}" alt="Profil" class="profile-img">
                    <span>Inloggad som ${currentUser.displayName}</span>
                    <span class="role-badge ${this.userRole}">${roleEmoji} ${roleText}</span>
                </div>
            `;
        }
    }
    
    // Getter methods for user information
    get currentUser() {
        return currentUser;
    }
    
    get currentUserName() {
        return currentUser?.displayName || 'Anonym';
    }
    
    get currentUserEmail() {
        return currentUser?.email || '';
    }
}

// Initiera Firebase Manager globalt
window.firebaseManager = new FirebaseManager();

// Auto-initiera när sidan laddas
document.addEventListener('DOMContentLoaded', async () => {
    await window.firebaseManager.initialize();
    
    // Lägg till event listeners för autentiseringsknapparna
    setupAuthButtons();
});

// Setup authentication button event listeners
function setupAuthButtons() {
    // Main auth buttons
    const loginBtn = document.getElementById('loginButton');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            openAuthProviderModal();
        });
    }
    
    const registerBtn = document.getElementById('registerButton');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            openEmailAuth('signup');
        });
    }
    
    // Sign Out
    const signOutBtn = document.getElementById('signOut');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            await window.firebaseManager.signOut();
        });
    }
}

// Provider selection modal functions
function openAuthProviderModal() {
    const modal = document.getElementById('authProviderModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authProviderModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Provider functions called from modal
async function signInWithGoogle() {
    closeAuthModal();
    await window.firebaseManager.signInWithGoogle();
}

async function signInWithApple() {
    closeAuthModal();
    await window.firebaseManager.signInWithApple();
}

function openEmailAuth(mode = 'signin') {
    closeAuthModal();
    const modal = document.getElementById('emailAuthModal');
    if (modal) {
        modal.classList.remove('hidden');
        showEmailTab(mode);
        const focusInput = mode === 'signup' ? 'signup-email' : 'signin-email';
        document.getElementById(focusInput)?.focus();
    }
}

// E-post autentisering modala funktioner
function openEmailModal() {
    const modal = document.getElementById('emailAuthModal');
    if (modal) {
        modal.classList.remove('hidden');
        showEmailTab('signin');
        document.getElementById('signin-email')?.focus();
    }
}

function closeEmailModal() {
    const modal = document.getElementById('emailAuthModal');
    if (modal) {
        modal.classList.add('hidden');
        clearEmailForms();
        hideEmailMessage();
    }
}

function showEmailTab(tab) {
    // Hide all forms
    document.querySelectorAll('.email-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected form and activate tab
    if (tab === 'signin') {
        document.getElementById('signin-form')?.classList.add('active');
        document.getElementById('signin-tab')?.classList.add('active');
        document.getElementById('signin-email')?.focus();
    } else if (tab === 'signup') {
        document.getElementById('signup-form')?.classList.add('active');
        document.getElementById('signup-tab')?.classList.add('active');
        document.getElementById('signup-email')?.focus();
    }
    
    hideEmailMessage();
}

function showForgotPassword() {
    // Hide all forms
    document.querySelectorAll('.email-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show forgot password form
    document.getElementById('forgot-form')?.classList.add('active');
    document.getElementById('forgot-email')?.focus();
    
    hideEmailMessage();
}

function clearEmailForms() {
    document.querySelectorAll('.email-form input').forEach(input => {
        input.value = '';
    });
}

function showEmailMessage(message, type = 'info') {
    const messageDiv = document.getElementById('email-auth-messages');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `auth-messages show ${type}`;
    }
}

function hideEmailMessage() {
    const messageDiv = document.getElementById('email-auth-messages');
    if (messageDiv) {
        messageDiv.className = 'auth-messages';
    }
}

async function handleEmailSignIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('signin-email')?.value;
    const password = document.getElementById('signin-password')?.value;
    
    if (!email || !password) {
        showEmailMessage('Vänligen fyll i alla fält.', 'error');
        return;
    }
    
    showEmailMessage('Loggar in...', 'info');
    
    const success = await window.firebaseManager.signInWithEmail(email, password);
    if (success) {
        closeEmailModal();
    } else {
        // Error message already shown by firebaseManager
    }
}

async function handleEmailSignUp(event) {
    event.preventDefault();
    
    const email = document.getElementById('signup-email')?.value;
    const password = document.getElementById('signup-password')?.value;
    const confirm = document.getElementById('signup-confirm')?.value;
    
    if (!email || !password || !confirm) {
        showEmailMessage('Vänligen fyll i alla fält.', 'error');
        return;
    }
    
    if (password !== confirm) {
        showEmailMessage('Lösenorden matchar inte.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showEmailMessage('Lösenordet måste vara minst 6 tecken.', 'error');
        return;
    }
    
    showEmailMessage('Skapar konto...', 'info');
    
    const success = await window.firebaseManager.registerWithEmail(email, password);
    if (success) {
        closeEmailModal();
    } else {
        // Error message already shown by firebaseManager
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgot-email')?.value;
    
    if (!email) {
        showEmailMessage('Vänligen ange din e-postadress.', 'error');
        return;
    }
    
    showEmailMessage('Skickar återställningslänk...', 'info');
    
    const success = await window.firebaseManager.resetPassword(email);
    if (success) {
        showEmailMessage('Återställningslänk skickad! Kontrollera din e-post.', 'success');
        setTimeout(() => {
            showEmailTab('signin');
        }, 3000);
    } else {
        // Error message already shown by firebaseManager
    }
}

// Keyboard navigation för modaler
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const authModal = document.getElementById('authProviderModal');
        const emailModal = document.getElementById('emailAuthModal');
        
        if (authModal && !authModal.classList.contains('hidden')) {
            closeAuthModal();
        } else if (emailModal && !emailModal.classList.contains('hidden')) {
            closeEmailModal();
        }
    }
});

// Close modals when clicking outside
document.addEventListener('click', (event) => {
    const authModal = document.getElementById('authProviderModal');
    const emailModal = document.getElementById('emailAuthModal');
    
    if (authModal && !authModal.classList.contains('hidden')) {
        if (event.target === authModal || event.target.classList.contains('modal-overlay')) {
            closeAuthModal();
        }
    }
    
    if (emailModal && !emailModal.classList.contains('hidden')) {
        if (event.target === emailModal || event.target.classList.contains('modal-overlay')) {
            closeEmailModal();
        }
    }
});
