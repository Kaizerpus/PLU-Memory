# Firebase Setup Guide för PLU Memory Game 🔥

## Steg 1: Skapa Firebase-projekt

### 1.1 Gå till Firebase Console
1. Besök [Firebase Console](https://console.firebase.google.com/)
2. Logga in med ditt Google-konto
3. Klicka på "Create a project" (Skapa ett projekt)

### 1.2 Konfigurera projektet
1. **Projektnamn**: `plu-memory-game` (eller valfritt namn)
2. **Google Analytics**: Välj "Enable Google Analytics" (rekommenderat)
3. **Analytics account**: Använd befintligt eller skapa nytt
4. Klicka "Create project"

## Steg 2: Konfigurera Authentication

### 2.1 Aktivera Google Sign-In
1. I Firebase Console, gå till "Authentication"
2. Klicka på "Get started"
3. Gå till fliken "Sign-in method"
4. Klicka på "Google" i listan
5. Aktivera "Enable"
6. Lägg till din e-post som "Project support email"
7. Klicka "Save"

### 2.2 Lägg till din domän
1. Scrolla ner till "Authorized domains"
2. Lägg till din GitHub Pages URL: `dittanvändarnamn.github.io`
3. Lägg även till `localhost` för lokal testning

## Steg 3: Konfigurera Firestore Database

### 3.1 Skapa databas
1. Gå till "Firestore Database" i menyn
2. Klicka "Create database"
3. Välj "Start in test mode" (för nu)
4. Välj region: `europe-west3 (Frankfurt)` (närmast Sverige)
5. Klicka "Done"

### 3.2 Säkerställ regler (för produktion)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Användare kan bara läsa/skriva sin egen data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Steg 4: Hämta konfiguration

### 4.1 Lägg till Webb-app
1. I Firebase Console, klicka på inställnings-ikonen ⚙️
2. Välj "Project settings"
3. Scrolla ner till "Your apps"
4. Klicka på webb-ikonen `</>`
5. **App nickname**: `PLU Memory Web`
6. **Hosting**: Kryssa INTE i denna (vi använder GitHub Pages)
7. Klicka "Register app"

### 4.2 Kopiera konfiguration
Du får något liknande detta:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-example-key-here",
  authDomain: "plu-memory-game.firebaseapp.com",
  projectId: "plu-memory-game",
  storageBucket: "plu-memory-game.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

## Steg 5: Uppdatera din kod

### 5.1 Ersätt konfiguration
1. Öppna `firebase-config.js`
2. Ersätt värdena i `firebaseConfig` objektet med dina egna värden från Firebase Console
3. Ta bort kommentaren `// Du behöver ersätta värdena nedan...`

**Innan:**
```javascript
const firebaseConfig = {
  apiKey: "DIN_API_KEY_HÄR",
  authDomain: "ditt-projekt.firebaseapp.com",
  // ... etc
};
```

**Efter:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-your-actual-key-here",
  authDomain: "plu-memory-game.firebaseapp.com",
  projectId: "plu-memory-game",
  storageBucket: "plu-memory-game.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};
```

## Steg 6: Testa lokalt (valfritt)

Om du vill testa innan du laddar upp till GitHub Pages:

### 6.1 Starta lokal server
```bash
# Med Python
python -m http.server 8000

# Med Node.js
npx http-server -p 8000

# Med PHP
php -S localhost:8000
```

### 6.2 Lägg till localhost i Firebase
1. Gå tillbaka till Firebase Console
2. Authentication → Sign-in method
3. Scrolla ner till "Authorized domains"
4. Lägg till `localhost`

## Steg 7: Ladda upp till GitHub Pages

1. Följ instruktionerna i `DEPLOY.md`
2. Efter deployment, testa funktionaliteten:
   - Klicka "Logga in med Google"
   - Spela några rundor
   - Kontrollera att achievements visas
   - Kolla leaderboard i profilen

## Funktioner som aktiveras

När Firebase är konfigurerat får du:

### 🔐 Autentisering
- Logga in med Google-konto
- Säker användaridentifiering
- Automatisk utloggning vid behov

### ☁️ Cloud-synkronisering
- Speldata sparas i molnet
- Automatisk synk mellan enheter
- Offline-support med automatisk synk

### 🏆 Achievements System
- **Första segern** - Svara rätt första gången
- **Perfekt runda** - 10/10 rätt i en runda  
- **Hastighetsdjävul** - Svara under 2 sekunder
- **Streakmaster** - 20 rätta i rad
- **Grönsakssexpert** - Lär dig alla grönsaker
- **Maratonspelare** - Spela i 30 minuter

### 📊 Leaderboard
- Se toppresultat från alla spelare
- Jämför din prestanda
- Uppdateras i realtid

### 🔄 Databackup
- Automatisk säkerhetskopiering till molnet
- Återställning vid dataförlust
- Versionering av speldata

## Felsökning

### Problem: "Firebase inte konfigurerad"
- Kontrollera att du ersatt alla värden i `firebaseConfig`
- Se till att inget värde fortfarande är "DIN_API_KEY_HÄR"

### Problem: "Sign-in fungerar inte"
- Kontrollera att din domän är tillagd i "Authorized domains"
- För GitHub Pages: `dittanvändarnamn.github.io`

### Problem: "Kan inte spara data"
- Kontrollera Firestore-reglerna
- Se till att Authentication är aktiverat
- Kolla nätverksanslutning

### Problem: "Achievements visas inte"
- Kontrollera JavaScript-konsolen för fel
- Se till att användaren är inloggad
- Verifiera att Firestore-data sparas korrekt

## Kostnader

Firebase erbjuder generösa gratistjänster:

- **Authentication**: 50,000 aktiva användare/månad (gratis)
- **Firestore**: 1 GiB lagring + 50,000 läsningar/dag (gratis)
- **Hosting**: Ingår inte (vi använder GitHub Pages istället)

För ett ICA-träningsspel räcker detta mer än väl! 🎮

## Support

Om du stöter på problem:
1. Kolla Firebase Console för felmeddelanden
2. Använd webbläsarens Developer Tools (F12) → Console
3. Läs Firebase-dokumentationen: [firebase.google.com/docs](https://firebase.google.com/docs)

---

🔥 Din Firebase-integration är nu redo! Spelare kan logga in, samla achievements och tävla på leaderboard! 🏆