// Firebase konfiguration för PLU Memory Game
// Du behöver ersätta värdena nedan med dina egna från Firebase Console

const firebaseConfig = {
 apiKey: "AIzaSyD-your-actual-key-here",
  authDomain: "plu-memory-game.firebaseapp.com",
  projectId: "plu-memory-game",
  storageBucket: "plu-memory-game.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
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
            // Kontrollera om Firebase config är konfigurerad
            if (firebaseConfig.apiKey === "DIN_API_KEY_HÄR") {
                console.log('⚠️ Firebase inte konfigurerad - använder offline-läge');
                return false;
            }

            // Ladda Firebase från CDN
            await this.loadFirebaseScripts();
            
            // Initiera Firebase
            firebase = window.firebase;
            firebase.initializeApp(firebaseConfig);
            
            // Sätt upp Firestore och Auth
            db = firebase.firestore();
            auth = firebase.auth();
            
            // Aktivera offline-stöd
            db.enablePersistence({ synchronizeTabs: true })
                .catch(err => console.log('Offline persistence redan aktiverat'));
            
            // Lyssna på autentiseringsförändringar
            auth.onAuthStateChanged(user => {
                currentUser = user;
                this.handleAuthStateChange(user);
            });

            this.isInitialized = true;
            console.log('🔥 Firebase initialiserat');
            return true;
            
        } catch (error) {
            console.error('❌ Firebase init misslyckades:', error);
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
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    }

    handleAuthStateChange(user) {
        if (user) {
            console.log('👤 Användare inloggad:', user.displayName);
            this.syncUserData();
            this.updateUI(true);
        } else {
            console.log('👤 Användare utloggad');
            this.updateUI(false);
        }
    }

    async signInWithGoogle() {
        if (!this.isInitialized) return false;
        
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            const result = await auth.signInWithPopup(provider);
            window.showToast(`Välkommen ${result.user.displayName}! 👋`, 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Inloggning misslyckades:', error);
            window.showToast('Inloggning misslyckades. Försök igen.', 'error');
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

    async saveUserData(userData) {
        if (!this.isInitialized || !currentUser) {
            // Spara lokalt om offline eller inte inloggad
            this.saveLocalBackup(userData);
            return;
        }

        try {
            const userDoc = db.collection('users').doc(currentUser.uid);
            const saveData = {
                ...userData,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                displayName: currentUser.displayName,
                email: currentUser.email
            };

            if (this.isOnline) {
                await userDoc.set(saveData, { merge: true });
                console.log('💾 Data sparad till Firebase');
            } else {
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

        if (signInBtn) signInBtn.style.display = isSignedIn ? 'none' : 'block';
        if (signOutBtn) signOutBtn.style.display = isSignedIn ? 'block' : 'none';
        
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
        if (!this.isInitialized) return [];

        try {
            const snapshot = await db.collection('users')
                .orderBy('gameData.bestScore', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                displayName: doc.data().displayName,
                bestScore: doc.data().gameData?.bestScore || 0,
                totalGamesPlayed: doc.data().gameData?.totalGamesPlayed || 0
            }));
            
        } catch (error) {
            console.error('❌ Kunde inte ladda leaderboard:', error);
            return [];
        }
    }
}

// Initiera Firebase Manager globalt
window.firebaseManager = new FirebaseManager();

// Auto-initiera när sidan laddas
document.addEventListener('DOMContentLoaded', async () => {
    await window.firebaseManager.initialize();
});


export default window.firebaseManager;
