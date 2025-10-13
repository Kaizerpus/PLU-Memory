// Firebase konfiguration fÃ¶r PLU Memory Game
// âš ï¸ VIKTIGT: ErsÃ¤tt vÃ¤rdena nedan med dina egna frÃ¥n Firebase Console
// Se FIREBASE-SETUP.md fÃ¶r detaljerade instruktioner

const firebaseConfig = {
 apiKey: "AIzaSyBomzD9K7HgrR2A5vHBl6O_ovKMQS4tISE",
  authDomain: "plu-memory.firebaseapp.com",
  projectId: "plu-memory",
  storageBucket: "plu-memory.firebasestorage.app",
  messagingSenderId: "688682728129",
  appId: "1:688682728129:web:35286ebe42844f98303240",
  measurementId: "G-2XHS3S9BMJ"
};

// Firebase-moduler som laddas frÃ¥n CDN
let firebase = null;
let db = null;
let auth = null;
let storage = null;
let currentUser = null;

// ðŸ”¥ Firebase Manager - Hanterar all Firebase-funktionalitet
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
        this.lastAuthStateChange = 0; // Throttle auth state changes
        
        // Lyssna pÃ¥ nÃ¤tverksstatus
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
                console.log('ðŸ”„ Firebase redan initialiserat');
                return true;
            }
            
            console.log('ðŸ”¥ Startar Firebase-initialisering...');
            
            // Kontrollera om Firebase config Ã¤r konfigurerad
            if (firebaseConfig.apiKey === "DIN_API_KEY_HÃ„R") {
                console.log('âš ï¸ Firebase inte konfigurerad - anvÃ¤nder offline-lÃ¤ge');
                return false;
            }

            console.log('ðŸ“‹ Firebase config verkar konfigurerad:', {
                projectId: firebaseConfig.projectId,
                authDomain: firebaseConfig.authDomain
            });

            // Kontrollera om Firebase redan Ã¤r laddat
            if (!window.firebase) {
                console.log('ðŸ“¦ Laddar Firebase scripts frÃ¥n CDN...');
                await this.loadFirebaseScripts();
                console.log('âœ… Firebase scripts laddade');
            } else {
                console.log('â™»ï¸ Firebase scripts redan laddade');
            }
            
            // Initiera Firebase (bara om inte redan gjort)
            firebase = window.firebase;
            if (!firebase) {
                throw new Error('Firebase kunde inte laddas frÃ¥n CDN');
            }
            
            // Kontrollera om Firebase app redan Ã¤r initialiserad
            if (firebase.apps.length === 0) {
                console.log('ðŸš€ Initialiserar Firebase med config...');
                firebase.initializeApp(firebaseConfig);
                console.log('âœ… Firebase app initialiserad');
            } else {
                console.log('â™»ï¸ Firebase app redan initialiserad');
            }
            
            // SÃ¤tt upp Firestore och Auth
            console.log('ðŸ—ƒï¸ SÃ¤tter upp Firestore...');
            db = firebase.firestore();
            console.log('âœ… Firestore konfigurerad');
            

            console.log('📦 Sätter upp Storage...');
            storage = firebase.storage();
            console.log('✅ Storage konfigurerad');
            
            console.log('ï¿½ðŸ” SÃ¤tter upp Authentication...');
            auth = firebase.auth();
            
            // Konfigurera auth persistence fÃ¶r att behÃ¥lla inloggning
            try {
                // FÃ¶rsÃ¶k med LOCAL persistence fÃ¶rst
                await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                console.log('âœ… Auth persistence konfigurerad (LOCAL)');
            } catch (error) {
                console.log('âš ï¸ LOCAL persistence misslyckades, fÃ¶rsÃ¶ker SESSION...', error.message);
                try {
                    await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
                    console.log('âœ… Auth persistence konfigurerad (SESSION)');
                } catch (sessionError) {
                    console.log('âš ï¸ Auth persistence kunde inte konfigureras:', sessionError.message);
                }
            }
            
            console.log('âœ… Auth konfigurerad');
            
            // Aktivera offline-stÃ¶d (bara en gÃ¥ng)
            if (!this.persistenceEnabled) {
                console.log('ðŸ’¾ Aktiverar offline persistence...');
                db.enablePersistence({ synchronizeTabs: true })
                    .then(() => {
                        console.log('âœ… Offline persistence aktiverat');
                        this.persistenceEnabled = true;
                    })
                    .catch(err => {
                        console.log('âš ï¸ Offline persistence kunde inte aktiveras:', err.message);
                        // Detta Ã¤r OK, fortsÃ¤tt Ã¤ndÃ¥
                    });
            }
            
            // Lyssna pÃ¥ autentiseringsfÃ¶rÃ¤ndringar (bara en gÃ¥ng)
            if (!this.authListenerSet) {
                console.log('ðŸ‘‚ SÃ¤tter upp auth state listener...');
                
                // Kontrollera redirect-resultat fÃ¶rst
                try {
                    const result = await auth.getRedirectResult();
                    if (result.user) {
                        console.log('âœ… Redirect-inloggning framgÃ¥ngsrik:', result.user.displayName);
                        if (window.showToast) {
                            window.showToast(`VÃ¤lkommen ${result.user.displayName}! ðŸ‘‹`, 'success');
                        }
                    }
                } catch (error) {
                    console.log('âš ï¸ Redirect-resultat fel:', error.message);
                }
                
                auth.onAuthStateChanged(async user => {
                    currentUser = user;
                    console.log('ðŸ‘¤ Auth state Ã¤ndrad:', user ? `Inloggad som ${user.displayName}` : 'Ej inloggad');
                    
                    if (user) {
                        await this.checkUserRole(user);
                    }
                    
                    this.handleAuthStateChange(user);
                });
                this.authListenerSet = true;
            }

            this.isInitialized = true;
            console.log('ðŸŽ‰ Firebase fullstÃ¤ndigt initialiserat!');
            console.log('âœ… Final status check:', {
                isInitialized: this.isInitialized,
                auth: !!auth,
                db: !!db,
                firebase: !!firebase
            });
            return true;
            
        } catch (error) {
            console.error('âŒ Firebase init misslyckades:', error);
            console.error('ðŸ“ Fel detaljer:', {
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
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-storage-compat.js',
            'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js'
        ];

        for (const src of scripts) {
            console.log(`ðŸ“¥ Laddar: ${src}`);
            try {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = () => {
                        console.log(`âœ… Laddad: ${src}`);
                        resolve();
                    };
                    script.onerror = (error) => {
                        console.error(`âŒ Kunde inte ladda: ${src}`, error);
                        reject(new Error(`Failed to load script: ${src}`));
                    };
                    document.head.appendChild(script);
                });
            } catch (error) {
                console.error(`ðŸ’¥ Script-laddning misslyckades fÃ¶r ${src}:`, error);
                throw error;
            }
        }
        
        console.log('ðŸ” Kontrollerar att Firebase Ã¤r tillgÃ¤ngligt...');
        if (typeof window.firebase === 'undefined') {
            throw new Error('Firebase inte tillgÃ¤ngligt efter script-laddning');
        }
        console.log('âœ… Firebase globalt objekt bekrÃ¤ftat');
    }

    // VÃ¤nta pÃ¥ att anvÃ¤ndaren ska Ã¥terstÃ¤llas vid reload
    async waitForAuthRestore() {
        return new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                unsubscribe();
                console.log('ðŸ”„ Auth state Ã¥terstÃ¤lld:', user ? 'Inloggad' : 'Ej inloggad');
                resolve(user);
            });
            
            // Timeout efter 3 sekunder
            setTimeout(() => {
                unsubscribe();
                console.log('â° Auth restore timeout');
                resolve(null);
            }, 3000);
        });
    }

    handleAuthStateChange(user) {
        const now = Date.now();
        // Throttle auth state changes till max en gÃ¥ng per sekund
        if (now - this.lastAuthStateChange < 1000) {
            console.log('ðŸš« Auth state change throttled');
            return;
        }
        this.lastAuthStateChange = now;
        
        if (user) {
            console.log('ðŸ‘¤ AnvÃ¤ndare inloggad:', user.displayName);
            this.syncUserData();
            this.checkUserRole(user);
            this.updateUI(true);
            
            // Uppdatera anvÃ¤ndarnamn i profilen om den Ã¤r Ã¶ppen
            if (window.updateProfileUserName) {
                setTimeout(() => {
                    window.updateProfileUserName();
                }, 200);
            }
        } else {
            console.log('ðŸ‘¤ AnvÃ¤ndare utloggad');
            this.updateUI(false);
            
            // Uppdatera anvÃ¤ndarnamn till "Anonym" om profilen Ã¤r Ã¶ppen
            if (window.updateProfileUserName) {
                setTimeout(() => {
                    window.updateProfileUserName();
                }, 200);
            }
        }
    }

    async signInWithGoogle() {
        console.log('ðŸ” Startar Google Sign-In process...');
        console.log('ðŸ” Kontrollerar Firebase status:', {
            isInitialized: this.isInitialized,
            auth: !!auth,
            firebase: !!firebase
        });
        
        if (!this.isInitialized) {
            console.error('âŒ Firebase inte initialiserat');
            console.log('ðŸ”„ FÃ¶rsÃ¶ker initiera Firebase nu...');
            const success = await this.initialize();
            if (!success) {
                if (window.showToast) {
                    window.showToast('Firebase kunde inte initialiseras. FÃ¶rsÃ¶k igen senare.', 'error');
                }
                return false;
            }
        }
        
        if (!auth) {
            console.error('âŒ Firebase Auth inte tillgÃ¤ngligt');
            if (window.showToast) {
                window.showToast('Authentication inte tillgÃ¤ngligt.', 'error');
            }
            return false;
        }
        
        try {
            console.log('ðŸ—ï¸ Skapar Google Auth Provider...');
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            // LÃ¤gg till custom parameters fÃ¶r bÃ¤ttre kompatibilitet
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            
            console.log('ðŸªŸ Ã–ppnar Google Sign-In popup...');
            let result;
            
            try {
                // FÃ¶rsÃ¶k med popup fÃ¶rst
                result = await auth.signInWithPopup(provider);
            } catch (popupError) {
                console.log('âš ï¸ Popup misslyckades:', popupError.code, popupError.message);
                
                if (popupError.code === 'auth/popup-blocked' || 
                    popupError.code === 'auth/popup-closed-by-user' ||
                    popupError.code === 'auth/cancelled-popup-request') {
                    // Fallback till redirect om popup blockeras
                    console.log('ðŸ”„ AnvÃ¤nder redirect istÃ¤llet fÃ¶r popup...');
                    await auth.signInWithRedirect(provider);
                    return true; // Redirect hanteras av Firebase
                } else {
                    throw popupError; // Kasta vidare andra fel
                }
            }
            
            console.log('âœ… Google Sign-In framgÃ¥ngsrik:', {
                user: result.user.displayName,
                email: result.user.email,
                uid: result.user.uid
            });
            
            if (window.showToast) {
                window.showToast(`VÃ¤lkommen ${result.user.displayName}! ðŸ‘‹`, 'success');
            }
            
            // Uppdatera profilnamn direkt
            setTimeout(() => {
                if (window.updateProfileUserName) {
                    window.updateProfileUserName();
                }
            }, 500);
            
            // Triggera en synkronisering av anvÃ¤ndardata
            setTimeout(() => {
                this.syncUserData();
            }, 1000);
            
            return true;
            
        } catch (error) {
            console.error('âŒ Google Sign-In misslyckades:', {
                code: error.code,
                message: error.message,
                fullError: error
            });
            
            let userMessage = 'Inloggning misslyckades. ';
            
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    userMessage += 'Popup stÃ¤ngdes av anvÃ¤ndaren.';
                    console.log('â„¹ï¸ AnvÃ¤ndaren stÃ¤ngde popup-fÃ¶nstret');
                    break;
                case 'auth/popup-blocked':
                    userMessage += 'Popup blockerades av webblÃ¤saren. TillÃ¥t popups fÃ¶r denna sida.';
                    console.log('ðŸš« Popup blockerades av webblÃ¤saren');
                    break;
                case 'auth/unauthorized-domain':
                    userMessage += 'DomÃ¤nen Ã¤r inte auktoriserad. Kontakta administratÃ¶ren.';
                    console.log('ðŸš« Unauthorized domain - lÃ¤gg till i Firebase Console');
                    break;
                case 'auth/operation-not-allowed':
                    userMessage += 'Google Sign-In inte aktiverat. Kontakta administratÃ¶ren.';
                    console.log('ðŸš« Google Sign-In inte aktiverat i Firebase Console');
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
            window.showToast('Du Ã¤r nu utloggad', 'info');
            
        } catch (error) {
            console.error('âŒ Utloggning misslyckades:', error);
        }
    }

    // Apple Sign-In
    async signInWithApple() {
        console.log('ðŸŽ Startar Apple Sign-In process...');
        
        if (!this.isInitialized) {
            console.error('âŒ Firebase inte initialiserat');
            if (window.showToast) {
                window.showToast('Firebase inte initialiserat. FÃ¶rsÃ¶k igen senare.', 'error');
            }
            return false;
        }
        
        try {
            const provider = new firebase.auth.OAuthProvider('apple.com');
            provider.setCustomParameters({ locale: 'sv' });
            provider.addScope('email');
            provider.addScope('name');
            
            console.log('ðŸªŸ Ã–ppnar Apple Sign-In popup...');
            const result = await auth.signInWithPopup(provider);
            
            console.log('âœ… Apple Sign-In framgÃ¥ngsrik:', {
                user: result.user.displayName || result.user.email,
                email: result.user.email,
                uid: result.user.uid
            });
            
            if (window.showToast) {
                const displayName = result.user.displayName || result.user.email?.split('@')[0] || 'Apple-anvÃ¤ndare';
                window.showToast(`VÃ¤lkommen ${displayName}! ðŸŽ`, 'success');
            }
            
            setTimeout(() => {
                this.syncUserData();
            }, 1000);
            
            return true;
            
        } catch (error) {
            console.error('âŒ Apple Sign-In misslyckades:', error);
            
            let userMessage = 'Apple-inloggning misslyckades. ';
            
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    userMessage += 'Popup stÃ¤ngdes av anvÃ¤ndaren.';
                    break;
                case 'auth/popup-blocked':
                    userMessage += 'Popup blockerades av webblÃ¤saren.';
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
        console.log('ðŸ“§ Startar Email Sign-In process...');
        
        if (!this.isInitialized) {
            console.error('âŒ Firebase inte initialiserat');
            return false;
        }
        
        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            
            console.log('âœ… Email Sign-In framgÃ¥ngsrik:', {
                user: result.user.email,
                uid: result.user.uid
            });
            
            if (window.showToast) {
                const displayName = result.user.displayName || result.user.email?.split('@')[0] || 'E-post-anvÃ¤ndare';
                window.showToast(`VÃ¤lkommen ${displayName}! ðŸ“§`, 'success');
            }
            
            setTimeout(() => {
                this.syncUserData();
            }, 1000);
            
            return true;
            
        } catch (error) {
            console.error('âŒ Email Sign-In misslyckades:', error);
            
            let userMessage = 'E-post-inloggning misslyckades. ';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    userMessage += 'Ingen anvÃ¤ndare hittades med denna e-post.';
                    break;
                case 'auth/wrong-password':
                    userMessage += 'Fel lÃ¶senord.';
                    break;
                case 'auth/invalid-email':
                    userMessage += 'Ogiltig e-postadress.';
                    break;
                case 'auth/user-disabled':
                    userMessage += 'Kontot Ã¤r inaktiverat.';
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
        console.log('ðŸ“§ Startar Email Registration process...');
        
        if (!this.isInitialized) {
            console.error('âŒ Firebase inte initialiserat');
            return false;
        }
        
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            
            console.log('âœ… Email Registration framgÃ¥ngsrik:', {
                user: result.user.email,
                uid: result.user.uid
            });
            
            if (window.showToast) {
                window.showToast('Konto skapat! VÃ¤lkommen! ðŸŽ‰', 'success');
            }
            
            setTimeout(() => {
                this.syncUserData();
            }, 1000);
            
            return true;
            
        } catch (error) {
            console.error('âŒ Email Registration misslyckades:', error);
            
            let userMessage = 'Registrering misslyckades. ';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    userMessage += 'E-postadressen anvÃ¤nds redan.';
                    break;
                case 'auth/invalid-email':
                    userMessage += 'Ogiltig e-postadress.';
                    break;
                case 'auth/weak-password':
                    userMessage += 'LÃ¶senordet Ã¤r fÃ¶r svagt.';
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
        console.log('ðŸ”‘ Startar Password Reset process...');
        
        if (!this.isInitialized) {
            console.error('âŒ Firebase inte initialiserat');
            return false;
        }
        
        try {
            await auth.sendPasswordResetEmail(email);
            
            console.log('âœ… Password Reset email skickat');
            
            if (window.showToast) {
                window.showToast('Ã…terstÃ¤llningslÃ¤nk skickad till din e-post! ðŸ“§', 'success');
            }
            
            return true;
            
        } catch (error) {
            console.error('âŒ Password Reset misslyckades:', error);
            
            let userMessage = 'LÃ¶senordsÃ¥terstÃ¤llning misslyckades. ';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    userMessage += 'Ingen anvÃ¤ndare hittades med denna e-post.';
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
            console.log('ðŸš« Kan inte spara - Firebase inte initialiserat eller anvÃ¤ndare inte inloggad');
            // Spara lokalt om offline eller inte inloggad
            this.saveLocalBackup(userData);
            return;
        }

        try {
            console.log('ðŸ’¾ Sparar anvÃ¤ndardata till Firebase:', userData);
            
            const userDoc = db.collection('users').doc(currentUser.uid);
            const saveData = {
                ...userData,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
                displayName: currentUser.displayName,
                email: currentUser.email
            };

            if (this.isOnline) {
                await userDoc.set(saveData, { merge: true });
                console.log('âœ… Data sparad till Firebase framgÃ¥ngsrikt');
                
                // Verifiera att datan sparades
                const doc = await userDoc.get();
                if (doc.exists) {
                    console.log('ðŸ” Verifierad sparad data:', doc.data());
                }
            } else {
                console.log('ðŸ“¡ Offline - lÃ¤gger till i kÃ¶ fÃ¶r senare synk');
                // LÃ¤gg till i kÃ¶ fÃ¶r senare synk
                this.pendingWrites.push({ doc: userDoc, data: saveData });
                this.saveLocalBackup(userData);
            }
            
        } catch (error) {
            console.error('âŒ Kunde inte spara till Firebase:', error);
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
                
                // SlÃ¥ samman lokal och cloud-data (cloud vinner vid konflikter)
                const mergedData = this.mergeUserData(localData, cloudData);
                console.log('â˜ï¸ Data laddad frÃ¥n Firebase');
                return mergedData;
            } else {
                // FÃ¶rsta gÃ¥ngen - anvÃ¤nd lokal data
                const localData = this.loadLocalBackup();
                if (localData && Object.keys(localData).length > 0) {
                    await this.saveUserData(localData);
                }
                return localData;
            }
            
        } catch (error) {
            console.error('âŒ Kunde inte ladda frÃ¥n Firebase:', error);
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
            console.error('âŒ Kunde inte spara lokal backup:', error);
        }
    }

    loadLocalBackup() {
        try {
            const backup = localStorage.getItem('firebase-backup');
            return backup ? JSON.parse(backup) : null;
        } catch (error) {
            console.error('âŒ Kunde inte ladda lokal backup:', error);
            return null;
        }
    }

    mergeUserData(localData, cloudData) {
        if (!localData) return cloudData;
        if (!cloudData) return localData;

        // AnvÃ¤nd den senast uppdaterade versionen fÃ¶r varje fÃ¤lt
        return {
            ...localData,
            ...cloudData,
            // BehÃ¥ll hÃ¶gsta vÃ¤rden fÃ¶r statistik
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
            // SlÃ¥ samman achievements
            achievements: {
                ...localData.achievements,
                ...cloudData.achievements
            }
        };
    }

    async syncUserData() {
        if (!this.isInitialized || !currentUser) return;

        try {
            // Ladda nuvarande data frÃ¥n molnet
            const cloudData = await this.loadUserData();
            
            // VÃ¤nta pÃ¥ att dataManager ska vara tillgÃ¤nglig
            let attempts = 0;
            while (!window.dataManager && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            // Samla nuvarande speldata
            const currentData = window.dataManager ? window.dataManager.collectGameData() : {};
            
            // SlÃ¥ samman och spara
            const mergedData = this.mergeUserData(currentData, cloudData);
            await this.saveUserData(mergedData);
            
            // Uppdatera lokal data med sammanslagen version
            if (window.dataManager && typeof window.dataManager.restoreFromData === 'function') {
                console.log('ðŸ”„ Ã…terstÃ¤ller data till DataManager...', mergedData);
                await window.dataManager.restoreFromData(mergedData);
            } else {
                console.warn('âš ï¸ DataManager eller restoreFromData metod inte tillgÃ¤nglig');
            }
            
        } catch (error) {
            console.error('âŒ Synkronisering misslyckades:', error);
        }
    }

    async syncPendingData() {
        if (!this.isOnline || this.pendingWrites.length === 0) return;

        console.log(`ðŸ”„ Synkar ${this.pendingWrites.length} vÃ¤ntande skrivningar...`);
        
        const writes = [...this.pendingWrites];
        this.pendingWrites = [];

        for (const write of writes) {
            try {
                await write.doc.set(write.data, { merge: true });
            } catch (error) {
                console.error('âŒ Synk misslyckades:', error);
                // LÃ¤gg tillbaka i kÃ¶n
                this.pendingWrites.push(write);
            }
        }

        if (this.pendingWrites.length === 0) {
            console.log('âœ… Alla vÃ¤ntande skrivningar synkade');
        }
    }

    updateUI(isSignedIn) {
        console.log('ðŸŽ¨ Uppdaterar UI - isSignedIn:', isSignedIn, 'currentUser:', !!currentUser);
        
        // FÃ¶rsÃ¶k uppdatera UI direkt och med en kort fÃ¶rdrÃ¶jning fÃ¶r sÃ¤kerhet
        this.doUpdateUI(isSignedIn);
        setTimeout(() => this.doUpdateUI(isSignedIn), 100);
    }
    
    doUpdateUI(isSignedIn) {
        const signInBtn = document.getElementById('googleSignIn');
        const signOutBtn = document.getElementById('signOut');
        const loginButton = document.getElementById('loginButton');
        const registerButton = document.getElementById('registerButton');
        const authButtons = document.getElementById('authButtons'); // Container for login/register buttons
        const signinHelp = document.getElementById('signin-help-profile'); // Help text
        const userInfo = document.getElementById('userInfo');
        const userInfoMenu = document.getElementById('userInfoMenu');
        
        console.log('ðŸ“ Element lookup results:', {
            signInBtn: !!signInBtn,
            signOutBtn: !!signOutBtn,
            loginButton: !!loginButton,
            registerButton: !!registerButton,
            authButtons: !!authButtons,
            signinHelp: !!signinHelp,
            userInfo: !!userInfo,
            userInfoMenu: !!userInfoMenu
        });

        if (signInBtn) {
            signInBtn.style.display = isSignedIn ? 'none' : 'block';
            console.log('ðŸ“ Google Sign In button:', isSignedIn ? 'hidden' : 'visible');
        }
        if (signOutBtn) {
            signOutBtn.style.display = isSignedIn ? 'block' : 'none';
            console.log('ðŸ“ Sign Out button:', isSignedIn ? 'visible' : 'hidden');
        }
        
        // Handle profile page auth buttons
        if (loginButton) {
            loginButton.style.display = isSignedIn ? 'none' : 'block';
            console.log('ðŸ“ Login button:', isSignedIn ? 'hidden' : 'visible');
        }
        if (registerButton) {
            registerButton.style.display = isSignedIn ? 'none' : 'block';
            console.log('ðŸ“ Register button:', isSignedIn ? 'hidden' : 'visible');
        }
        if (authButtons) {
            authButtons.style.display = isSignedIn ? 'none' : 'flex';
            console.log('ðŸ“ Auth buttons container:', isSignedIn ? 'hidden' : 'visible');
        }
        if (signinHelp) {
            signinHelp.style.display = isSignedIn ? 'none' : 'block';
            console.log('ðŸ“ Sign-in help text:', isSignedIn ? 'hidden' : 'visible');
        }
        
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
        
        // Uppdatera bara UI - visa inte profil automatiskt
        console.log('âœ… UI uppdaterad fÃ¶r auth state change');
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
            
            console.log(`ðŸ† Achievement unlocked: ${achievementData.name}`);
        }
    }

    showAchievementUnlocked(achievement) {
        const modal = document.createElement('div');
        modal.className = 'modal show achievement-modal';
        modal.innerHTML = `
            <div class="modal-content achievement-content">
                <div class="achievement-header">
                    <h2>ðŸ† Achievement Unlocked!</h2>
                </div>
                <div class="achievement-body">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                    <div class="achievement-points">+${achievement.points} poÃ¤ng</div>
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
            console.log('ðŸš« Firebase inte initialiserat fÃ¶r leaderboard');
            return [];
        }

        try {
            console.log('ðŸ” HÃ¤mtar leaderboard frÃ¥n Firebase...');
            
            // Vi kan inte kombinera where + orderBy pÃ¥ olika fÃ¤lt i Firestore
            // SÃ¥ vi hÃ¤mtar alla anvÃ¤ndare och filtrerar i JavaScript istÃ¤llet
            const snapshot = await db.collection('users')
                .orderBy('gameData.bestScore', 'desc')
                .limit(50) // HÃ¤mta fler fÃ¶r att kompensera fÃ¶r filtrering
                .get();

            console.log('ðŸ“Š Firebase query result:', {
                size: snapshot.size,
                docs: snapshot.docs.length
            });

            const results = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log('ðŸ‘¤ User data:', {
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
                // Filtrera i JavaScript istÃ¤llet fÃ¶r Firestore query
                const isValid = user.bestScore > 0 && user.totalGamesPlayed > 0;
                if (!isValid) {
                    console.log('ðŸš« Filtrerar bort anvÃ¤ndare:', user);
                }
                return isValid;
            }).slice(0, limit); // Ta bara de fÃ¶rsta X efter filtrering

            console.log('âœ… Slutgiltiga leaderboard resultat:', results);
            return results;
            
        } catch (error) {
            console.error('âŒ Kunde inte ladda leaderboard:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            
            // Hantera specifika fel tyst
            if (error.code === 'permission-denied') {
                console.log('â„¹ï¸ Leaderboard krÃ¤ver speciella rÃ¤ttigheter');
                return [];
            }
            
            // Hantera nÃ¤tverksfel (t.ex. ad-blockers)
            if (error.message && error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
                console.log('â„¹ï¸ NÃ¤tverksanrop blockerat (troligen av ad-blocker)');
                return [];
            }
            
            return [];
        }
    }

    // ï¿½ PRODUKTHANTERING - Admin & Moderator funktioner
    async loadProductsFromFirestore() {
        if (!this.isInitialized) {
            console.log('ðŸš« Firebase inte initialiserat fÃ¶r produktladdning');
            return null;
        }

        try {
            console.log('ðŸ“¦ Laddar produkter frÃ¥n Firestore...');
            const snapshot = await db.collection('products').get();
            
            if (snapshot.empty) {
                console.log('ðŸ“¦ Inga produkter i Firestore, anvÃ¤nder lokal JSON');
                return null;
            }

            const products = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                products.push({
                    id: doc.id,
                    ...data
                });
            });

            console.log(`âœ… Laddade ${products.length} produkter frÃ¥n Firestore`);
            return products;

        } catch (error) {
            console.error('âŒ Kunde inte ladda produkter frÃ¥n Firestore:', error);
            if (error.code === 'permission-denied') {
                console.log('â„¹ï¸ Produkter krÃ¤ver speciella rÃ¤ttigheter, anvÃ¤nder lokal JSON');
            }
            return null;
        }
    }

    async addProduct(productData) {
        if (!this.isInitialized) {
            console.log('ðŸš« Firebase inte initialiserat');
            return false;
        }

        if (!this.isModerator && !this.isAdmin) {
            console.log('ðŸš« BehÃ¶ver moderator-rÃ¤ttigheter fÃ¶r att lÃ¤gga till produkter');
            return false;
        }

        try {
            console.log('âž• LÃ¤gger till ny produkt:', productData);
            
            const docRef = await db.collection('products').add({
                ...productData,
                createdAt: Date.now(),
                createdBy: currentUser?.uid || 'unknown',
                modifiedAt: Date.now(),
                modifiedBy: currentUser?.uid || 'unknown'
            });

            console.log('âœ… Produkt tillagd med ID:', docRef.id);
            return docRef.id;

        } catch (error) {
            console.error('âŒ Kunde inte lÃ¤gga till produkt:', error);
            return false;
        }
    }

    async updateProduct(productId, updates) {
        if (!this.isInitialized) {
            console.log('ðŸš« Firebase inte initialiserat');
            return false;
        }

        if (!this.isModerator && !this.isAdmin) {
            console.log('ðŸš« BehÃ¶ver moderator-rÃ¤ttigheter fÃ¶r att uppdatera produkter');
            return false;
        }

        try {
            console.log('ðŸ“ Uppdaterar produkt:', productId, updates);
            
            await db.collection('products').doc(productId).update({
                ...updates,
                modifiedAt: Date.now(),
                modifiedBy: currentUser?.uid || 'unknown'
            });

            console.log('âœ… Produkt uppdaterad');
            return true;

        } catch (error) {
            console.error('âŒ Kunde inte uppdatera produkt:', error);
            return false;
        }
    }

    async deleteProduct(productId) {
        if (!this.isInitialized) {
            console.log('ðŸš« Firebase inte initialiserat');
            return false;
        }

        if (!this.isAdmin) {
            console.log('ðŸš« BehÃ¶ver admin-rÃ¤ttigheter fÃ¶r att ta bort produkter');
            return false;
        }

        try {
            console.log('ðŸ—‘ï¸ Tar bort produkt:', productId);
            await db.collection('products').doc(productId).delete();
            console.log('âœ… Produkt borttagen');
            return true;

        } catch (error) {
            console.error('âŒ Kunde inte ta bort produkt:', error);
            return false;
        }
    }

    async importProductsFromJSON(jsonData) {
        if (!this.isInitialized) {
            console.log('ðŸš« Firebase inte initialiserat');
            return false;
        }

        if (!this.isAdmin) {
            console.log('ðŸš« BehÃ¶ver admin-rÃ¤ttigheter fÃ¶r att importera produkter');
            return false;
        }

        try {
            console.log('ðŸ“¥ Importerar produkter frÃ¥n JSON...');
            let importCount = 0;

            for (const product of jsonData) {
                await db.collection('products').add({
                    ...product,
                    createdAt: Date.now(),
                    createdBy: currentUser?.uid || 'import',
                    modifiedAt: Date.now(),
                    modifiedBy: currentUser?.uid || 'import'
                });
                importCount++;
            }

            console.log(`âœ… Importerade ${importCount} produkter`);
            return importCount;

        } catch (error) {
            console.error('âŒ Kunde inte importera produkter:', error);
            return false;
        }
    }

    // ï¿½ðŸ” ROLLSYSTEM - Admin & Moderator funktioner
    async checkUserRole(user) {
        if (!this.isInitialized || !user) return;

        try {
            // Kontrollera om anvÃ¤ndaren har en roll i databasen
            const roleDoc = await db.collection('userRoles').doc(user.uid).get();
            
            if (roleDoc.exists) {
                const roleData = roleDoc.data();
                this.userRole = roleData.role || 'user';
                this.isAdmin = this.userRole === 'admin';
                this.isModerator = this.userRole === 'moderator' || this.isAdmin;
                
                console.log('ðŸ‘‘ AnvÃ¤ndarroll laddad:', {
                    role: this.userRole,
                    isAdmin: this.isAdmin,
                    isModerator: this.isModerator
                });
            } else {
                // FÃ¶rsta gÃ¥ngen fÃ¶r denna anvÃ¤ndare - ge user-roll
                await this.setUserRole(user.uid, 'user');
                this.userRole = 'user';
                this.isAdmin = false;
                this.isModerator = false;
                
                console.log('ðŸ‘¤ Ny anvÃ¤ndare - satt som user');
            }
            
            // Uppdatera UI baserat pÃ¥ roll
            this.updateRoleUI();
            
        } catch (error) {
            console.error('âŒ Kunde inte kontrollera anvÃ¤ndarroll:', error);
            // Fallback till user
            this.userRole = 'user';
            this.isAdmin = false;
            this.isModerator = false;
        }
    }

    async setUserRole(userId, newRole) {
        if (!this.isInitialized) return false;
        
        // FÃ¶rsta anvÃ¤ndaren blir automatiskt admin, annars krÃ¤v admin-rÃ¤ttigheter
        const isFirstUser = !currentUser && newRole === 'user';
        if (!isFirstUser && !this.isAdmin && newRole !== 'user') {
            console.error('âŒ Endast admin kan sÃ¤tta moderator/admin roller');
            if (window.showToast) {
                window.showToast('Endast admin kan sÃ¤tta roller', 'error');
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
            
            // Logga rollÃ¤ndringen (om inte fÃ¶rsta anvÃ¤ndaren)
            if (currentUser) {
                await db.collection('roleChanges').add({
                    targetUserId: userId,
                    newRole: newRole,
                    changedBy: currentUser.uid,
                    changedByName: currentUser.displayName,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            console.log(`âœ… AnvÃ¤ndarroll uppdaterad: ${userId} â†’ ${newRole}`);
            
            if (window.showToast) {
                window.showToast(`AnvÃ¤ndarroll uppdaterad till ${newRole}`, 'success');
            }
            
            return true;
            
        } catch (error) {
            console.error('âŒ Kunde inte sÃ¤tta anvÃ¤ndarroll:', error);
            if (window.showToast) {
                window.showToast('Kunde inte uppdatera roll', 'error');
            }
            return false;
        }
    }

    async getAllUsers() {
        if (!this.isInitialized || !this.isModerator) return [];

        try {
            // HÃ¤mta bara rolldata - inte anvÃ¤ndardata frÃ¥n users-kollektionen
            // eftersom sÃ¤kerhetsreglerna blockerar det
            const rolesSnapshot = await db.collection('userRoles').get();
            const authUsersSnapshot = await db.collection('users').get();
            
            const allUsers = [];
            
            // Kombinera data frÃ¥n bÃ¥da kollektionerna
            rolesSnapshot.docs.forEach(roleDoc => {
                const roleData = roleDoc.data();
                const userId = roleDoc.id;
                
                // Hitta motsvarande anvÃ¤ndardata
                const userDoc = authUsersSnapshot.docs.find(doc => doc.id === userId);
                const userData = userDoc ? userDoc.data() : {};
                
                allUsers.push({
                    uid: userId,
                    displayName: userData.displayName || roleData.setByName || 'OkÃ¤nd anvÃ¤ndare',
                    email: userData.email || 'Ingen e-post',
                    lastActive: userData.lastUpdated || roleData.setAt,
                    gameStats: userData.gameData || {},
                    role: roleData.role || 'user',
                    isCurrentUser: userId === currentUser.uid,
                    photoURL: userData.photoURL || null
                });
            });
            
            // Sortera: admin fÃ¶rst, sedan moderator, sedan user
            return allUsers.sort((a, b) => {
                const roleOrder = { admin: 3, moderator: 2, user: 1 };
                return roleOrder[b.role] - roleOrder[a.role];
            });
            
        } catch (error) {
            console.error('âŒ Kunde inte hÃ¤mta anvÃ¤ndarlista:', error);
            
            // Fallback - fÃ¶rsÃ¶k bara hÃ¤mta roller
            try {
                const rolesSnapshot = await db.collection('userRoles').get();
                const basicUsers = rolesSnapshot.docs.map(doc => ({
                    uid: doc.id,
                    displayName: doc.data().setByName || 'AnvÃ¤ndare',
                    email: 'Ej tillgÃ¤nglig',
                    role: doc.data().role || 'user',
                    isCurrentUser: doc.id === currentUser.uid,
                    photoURL: null,
                    lastActive: doc.data().setAt,
                    gameStats: {}
                }));
                
                console.log('âš ï¸ AnvÃ¤nder grundlÃ¤ggande anvÃ¤ndardata');
                return basicUsers.sort((a, b) => {
                    const roleOrder = { admin: 3, moderator: 2, user: 1 };
                    return roleOrder[b.role] - roleOrder[a.role];
                });
                
            } catch (fallbackError) {
                console.error('âŒ Ã„ven fallback misslyckades:', fallbackError);
                return [];
            }
        }
    }

    async promoteToModerator(userId, userName) {
        if (!this.isAdmin) {
            if (window.showToast) {
                window.showToast('Endast admin kan sÃ¤tta moderatorer', 'error');
            }
            return false;
        }
        
        const success = await this.setUserRole(userId, 'moderator');
        if (success && window.showToast) {
            window.showToast(`${userName} Ã¤r nu moderator! ðŸ‘‘`, 'success');
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
            window.showToast(`${userName} Ã¤r nu vanlig anvÃ¤ndare`, 'info');
        }
        return success;
    }

    updateRoleUI() {
        // Uppdatera UI baserat pÃ¥ anvÃ¤ndarens roll
        const adminElements = document.querySelectorAll('.admin-only');
        const moderatorElements = document.querySelectorAll('.moderator-only');
        
        adminElements.forEach(el => {
            el.style.display = this.isAdmin ? 'block' : 'none';
        });
        
        moderatorElements.forEach(el => {
            el.style.display = this.isModerator ? 'block' : 'none';
        });
        
        // LÃ¤gg till rollbadge i anvÃ¤ndarinfo
        const userInfo = document.getElementById('userInfo');
        const userInfoMenu = document.getElementById('userInfoMenu');
        
        if (userInfo && currentUser) {
            const roleEmoji = this.isAdmin ? 'ðŸ‘‘' : this.isModerator ? 'ðŸ›¡ï¸' : 'ðŸ‘¤';
            const roleText = this.isAdmin ? 'Admin' : this.isModerator ? 'Moderator' : 'AnvÃ¤ndare';
            
            userInfo.innerHTML = `
                <div class="user-profile">
                    <img src="${currentUser.photoURL}" alt="Profil" class="profile-img">
                    <span>Inloggad som ${currentUser.displayName}</span>
                    <span class="role-badge ${this.userRole}">${roleEmoji} ${roleText}</span>
                </div>
            `;
        }
        
        if (userInfoMenu && currentUser) {
            const roleEmoji = this.isAdmin ? 'ðŸ‘‘' : this.isModerator ? 'ðŸ›¡ï¸' : 'ðŸ‘¤';
            const roleText = this.isAdmin ? 'Admin' : this.isModerator ? 'Moderator' : 'AnvÃ¤ndare';
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

// Globala funktioner fÃ¶r UI-uppdatering
window.updateAuthUI = function() {
    if (window.firebaseManager) {
        const isSignedIn = !!window.firebaseManager.currentUser;
        console.log('ðŸ”„ Manuell auth UI uppdatering:', isSignedIn);
        window.firebaseManager.updateUI(isSignedIn);
    }
};

// Uppdatera bara anvÃ¤ndarnamnet i profilen (utan att bygga om hela profilen)
window.updateProfileUserName = function() {
    if (!window.firebaseManager) return;
    
    const playerName = window.firebaseManager.currentUserName;
    console.log('ðŸ‘¤ Uppdaterar profilnamn till:', playerName);
    
    // Uppdatera spelarnamn i profil header
    const playerInfoElement = document.querySelector('.player-info h3');
    if (playerInfoElement) {
        playerInfoElement.textContent = playerName;
        console.log('âœ… Profilnamn uppdaterat i header');
    }
    
    // Uppdatera anvÃ¤ndarinfo-sektioner
    const userInfo = document.getElementById('userInfo');
    const userInfoMenu = document.getElementById('userInfoMenu');
    const currentUser = window.firebaseManager.currentUser;
    
    if (userInfo && currentUser) {
        userInfo.innerHTML = `
            <div class="user-profile">
                <img src="${currentUser.photoURL}" alt="Profil" class="profile-img">
                <span>Inloggad som ${currentUser.displayName}</span>
            </div>
        `;
        console.log('âœ… userInfo uppdaterat');
    } else if (userInfo) {
        userInfo.innerHTML = '<span>Inte inloggad - data sparas lokalt</span>';
    }
    
    if (userInfoMenu && currentUser) {
        userInfoMenu.innerHTML = `
            <div class="user-profile">
                <img src="${currentUser.photoURL}" alt="Profil" class="profile-img">
                <span>Inloggad som ${currentUser.displayName}</span>
            </div>
        `;
        console.log('âœ… userInfoMenu uppdaterat');
    } else if (userInfoMenu) {
        userInfoMenu.innerHTML = '<span>Inte inloggad - data sparas lokalt</span>';
    }
};

// Bilduppladdningsfunktioner för FirebaseManager
FirebaseManager.prototype.uploadProductImage = async function(file, productName) {
    if (!this.isInitialized || !storage) {
        console.log('🚫 Firebase eller Storage inte initialiserat');
        return null;
    }

    if (!this.isModerator && !this.isAdmin) {
        console.log('🚫 Behöver moderator- eller admin-rättigheter för att ladda upp bilder');
        return null;
    }

    try {
        // Validera filtyp
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            console.error('❌ Ogiltigt filformat. Endast JPEG, PNG och WebP tillåtna');
            if (window.showToast) {
                window.showToast('Ogiltigt filformat. Endast JPEG, PNG och WebP tillåtna', 'error');
            }
            return null;
        }

        // Validera filstorlek (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            console.error('❌ Filen är för stor. Max 5MB tillåtna');
            if (window.showToast) {
                window.showToast('Filen är för stor. Maximalt 5MB tillåtna', 'error');
            }
            return null;
        }

        // Skapa unikt filnamn
        const timestamp = Date.now();
        const safeProductName = productName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const fileExtension = file.name.split('.').pop();
        const fileName = `product_images/${safeProductName}_${timestamp}.${fileExtension}`;

        console.log('📤 Laddar upp bild:', fileName);

        // Ladda upp till Firebase Storage
        const storageRef = storage.ref().child(fileName);
        const uploadTask = await storageRef.put(file);

        // Hämta download URL
        const downloadURL = await uploadTask.ref.getDownloadURL();
        
        console.log('✅ Bild uppladdad:', downloadURL);
        return downloadURL;

    } catch (error) {
        console.error('❌ Kunde inte ladda upp bild:', error);
        if (window.showToast) {
            window.showToast('Fel vid bilduppladdning', 'error');
        }
        return null;
    }
};

FirebaseManager.prototype.deleteProductImage = async function(imageUrl) {
    if (!this.isInitialized || !storage) {
        console.log('🚫 Firebase eller Storage inte initialiserat');
        return false;
    }

    if (!this.isAdmin) {
        console.log('🚫 Behöver admin-rättigheter för att ta bort bilder');
        return false;
    }

    try {
        // Extrahera filnamn från URL
        const storageRef = storage.refFromURL(imageUrl);
        await storageRef.delete();
        console.log('🗑️ Bild borttagen från Storage');
        return true;

    } catch (error) {
        console.error('❌ Kunde inte ta bort bild:', error);
        return false;
    }
};

// Initiera Firebase Manager globalt
window.FirebaseManager = FirebaseManager; // Exportera klassen ocksÃ¥
window.firebaseManager = new FirebaseManager();

// Setup authentication button event listeners
function setupAuthButtons() {
    console.log('ðŸ”— Setting up main auth buttons...');
    
    // Main auth buttons
    const loginBtn = document.getElementById('loginButton');
    if (loginBtn) {
        console.log('âœ… Login button found, adding event listener');
        loginBtn.addEventListener('click', () => {
            console.log('ðŸ‘† Login button clicked');
            openAuthProviderModal();
        });
    } else {
        console.log('âŒ Login button not found');
    }
    
    const registerBtn = document.getElementById('registerButton');
    if (registerBtn) {
        console.log('âœ… Register button found, adding event listener');
        registerBtn.addEventListener('click', () => {
            console.log('ðŸ‘† Register button clicked');
            openRegisterModal();
        });
    } else {
        console.log('âŒ Register button not found');
    }

// Make setupAuthButtons globally available
window.setupAuthButtons = setupAuthButtons;
    
    // Sign Out
    const signOutBtn = document.getElementById('signOut');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            await window.firebaseManager.signOut();
        });
    }
}

// Register modal functions
function openRegisterModal() {
    console.log('ðŸšª Opening register modal...');
    const modal = document.getElementById('registerModal');
    if (modal) {
        console.log('âœ… Register modal found, showing...');
        modal.classList.remove('hidden');
    } else {
        console.log('âŒ Register modal not found!');
    }
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Register functions called from register modal
async function registerWithGoogle() {
    console.log('ðŸ”— registerWithGoogle funktionen kallad');
    closeRegisterModal();
    
    // Wait for Firebase Manager if not available
    if (!window.firebaseManager) {
        console.log('â³ Firebase Manager inte tillgÃ¤ngligt Ã¤n, vÃ¤ntar...');
        for (let i = 0; i < 50; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (window.firebaseManager) break;
        }
    }
    
    if (!window.firebaseManager) {
        console.error('âŒ Firebase Manager inte tillgÃ¤ngligt efter vÃ¤ntan');
        if (window.showToast) window.showToast('Systemfel - Firebase inte laddat. FÃ¶rsÃ¶k igen.', 'error');
        return;
    }
    
    console.log('ðŸ”¥ Anropar firebaseManager.signInWithGoogle...');
    await window.firebaseManager.signInWithGoogle();
}

async function registerWithApple() {
    console.log('ðŸ”— registerWithApple funktionen kallad');
    closeRegisterModal();
    
    // Wait for Firebase Manager if not available
    if (!window.firebaseManager) {
        console.log('â³ Firebase Manager inte tillgÃ¤ngligt Ã¤n, vÃ¤ntar...');
        for (let i = 0; i < 50; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (window.firebaseManager) break;
        }
    }
    
    if (!window.firebaseManager) {
        console.error('âŒ Firebase Manager inte tillgÃ¤ngligt efter vÃ¤ntan');
        if (window.showToast) window.showToast('Systemfel - Firebase inte laddat. FÃ¶rsÃ¶k igen.', 'error');
        return;
    }
    
    console.log('ðŸ”¥ Anropar firebaseManager.signInWithApple...');
    await window.firebaseManager.signInWithApple();
}

function openEmailRegistration() {
    closeRegisterModal();
    const modal = document.getElementById('emailAuthModal');
    if (modal) {
        modal.classList.remove('hidden');
        showEmailTab('signup');
        document.getElementById('signup-email')?.focus();
    }
}

function switchToLogin() {
    closeRegisterModal();
    openAuthProviderModal();
}

// Provider selection modal functions
function openAuthProviderModal() {
    console.log('ðŸšª Opening auth provider modal...');
    const modal = document.getElementById('authProviderModal');
    if (modal) {
        console.log('âœ… Auth modal found, showing...');
        modal.classList.remove('hidden');
    } else {
        console.log('âŒ Auth modal not found!');
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
    console.log('ðŸ”— signInWithGoogle funktionen kallad');
    closeAuthModal();
    
    // Wait for Firebase Manager if not available
    if (!window.firebaseManager) {
        console.log('â³ Firebase Manager inte tillgÃ¤ngligt Ã¤n, vÃ¤ntar...');
        // Wait up to 5 seconds for Firebase to initialize
        for (let i = 0; i < 50; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (window.firebaseManager) break;
        }
    }
    
    if (!window.firebaseManager) {
        console.error('âŒ Firebase Manager inte tillgÃ¤ngligt efter vÃ¤ntan');
        if (window.showToast) window.showToast('Systemfel - Firebase inte laddat. FÃ¶rsÃ¶k igen.', 'error');
        return;
    }
    
    console.log('ðŸ”¥ Anropar firebaseManager.signInWithGoogle...');
    await window.firebaseManager.signInWithGoogle();
}

async function signInWithApple() {
    console.log('ðŸ”— signInWithApple funktionen kallad');
    closeAuthModal();
    
    // Wait for Firebase Manager if not available
    if (!window.firebaseManager) {
        console.log('â³ Firebase Manager inte tillgÃ¤ngligt Ã¤n, vÃ¤ntar...');
        for (let i = 0; i < 50; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (window.firebaseManager) break;
        }
    }
    
    if (!window.firebaseManager) {
        console.error('âŒ Firebase Manager inte tillgÃ¤ngligt efter vÃ¤ntan');
        if (window.showToast) window.showToast('Systemfel - Firebase inte laddat. FÃ¶rsÃ¶k igen.', 'error');
        return;
    }
    
    console.log('ðŸ”¥ Anropar firebaseManager.signInWithApple...');
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
        showEmailMessage('VÃ¤nligen fyll i alla fÃ¤lt.', 'error');
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
        showEmailMessage('VÃ¤nligen fyll i alla fÃ¤lt.', 'error');
        return;
    }
    
    if (password !== confirm) {
        showEmailMessage('LÃ¶senorden matchar inte.', 'error');
        return;
    }
    
    if (password.length < 6) {
        showEmailMessage('LÃ¶senordet mÃ¥ste vara minst 6 tecken.', 'error');
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
        showEmailMessage('VÃ¤nligen ange din e-postadress.', 'error');
        return;
    }
    
    showEmailMessage('Skickar Ã¥terstÃ¤llningslÃ¤nk...', 'info');
    
    const success = await window.firebaseManager.resetPassword(email);
    if (success) {
        showEmailMessage('Ã…terstÃ¤llningslÃ¤nk skickad! Kontrollera din e-post.', 'success');
        setTimeout(() => {
            showEmailTab('signin');
        }, 3000);
    } else {
        // Error message already shown by firebaseManager
    }
}

// Keyboard navigation fÃ¶r modaler
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const authModal = document.getElementById('authProviderModal');
        const emailModal = document.getElementById('emailAuthModal');
        const registerModal = document.getElementById('registerModal');
        
        if (registerModal && !registerModal.classList.contains('hidden')) {
            closeRegisterModal();
        } else if (authModal && !authModal.classList.contains('hidden')) {
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
    const registerModal = document.getElementById('registerModal');
    
    if (registerModal && !registerModal.classList.contains('hidden')) {
        if (event.target === registerModal || event.target.classList.contains('modal-overlay')) {
            closeRegisterModal();
        }
    }
    
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

// Modal button event listeners - setup after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('ðŸ”— Setting up modal event listeners...');
    
    // Google sign-in buttons  
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const googleRegisterBtn = document.getElementById('googleRegisterBtn');
    
    if (googleSignInBtn) {
        console.log('âœ… Google Sign-In button found, adding event listener');
        googleSignInBtn.addEventListener('click', (e) => {
            console.log('ðŸ‘† Google Sign-In button clicked');
            e.preventDefault();
            signInWithGoogle();
        });
    } else {
        console.log('âŒ Google Sign-In button not found');
    }
    
    if (googleRegisterBtn) {
        console.log('âœ… Google Register button found, adding event listener');
        googleRegisterBtn.addEventListener('click', (e) => {
            console.log('ðŸ‘† Google Register button clicked');
            e.preventDefault();
            registerWithGoogle();
        });
    } else {
        console.log('âŒ Google Register button not found');
    }
    
    // Apple sign-in buttons
    const appleSignInBtn = document.getElementById('appleSignInBtn');
    const appleRegisterBtn = document.getElementById('appleRegisterBtn');
    
    if (appleSignInBtn) {
        console.log('âœ… Apple Sign-In button found, adding event listener');
        appleSignInBtn.addEventListener('click', (e) => {
            console.log('ðŸ‘† Apple Sign-In button clicked');
            e.preventDefault();
            signInWithApple();
        });
    } else {
        console.log('âŒ Apple Sign-In button not found');
    }
    
    if (appleRegisterBtn) {
        console.log('âœ… Apple Register button found, adding event listener');
        appleRegisterBtn.addEventListener('click', (e) => {
            console.log('ðŸ‘† Apple Register button clicked');
            e.preventDefault();
            registerWithApple();
        });
    } else {
        console.log('âŒ Apple Register button not found');
    }
    
    console.log('ðŸ”— Modal event listeners setup complete');
});
