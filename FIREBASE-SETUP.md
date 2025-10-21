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

### 2.2 Aktivera E-post/Lösenord Sign-In
1. I "Sign-in method", klicka på "Email/Password"
2. Aktivera "Enable" för första alternativet (Email/Password)
3. Du kan också aktivera "Email link (passwordless sign-in)" om du vill
4. Klicka "Save"

### 2.3 Aktivera Apple Sign-In (valfritt)
1. I "Sign-in method", klicka på "Apple"
2. Aktivera "Enable"
3. **Service ID**: Lämna tom för webbanvändning
4. **Apple Team ID**: Behövs bara för iOS/macOS appar
5. **Private Key ID**: Behövs bara för iOS/macOS appar
6. **Private Key**: Behövs bara för iOS/macOS appar
7. Klicka "Save"

**OBS:** Apple Sign-In fungerar bäst på Safari och iOS-enheter. På andra webbläsare kan den visa ett popup-fönster.

### 2.4 Lägg till din domän
1. Scrolla ner till "Authorized domains"
2. Lägg till din GitHub Pages URL: `dittanvändarnamn.github.io`
3. Lägg även till `localhost` för lokal testning

### 2.5 Konfigurera e-postmallar (valfritt)
För e-post/lösenord-autentisering kan du anpassa e-postmallarna:
1. Gå till "Authentication" → "Templates"
2. Anpassa "Password reset", "Email address verification" etc.
3. Ändra språk till svenska om du vill

## Steg 3: Konfigurera Firestore Database

### 3.1 Skapa databas
1. Gå till "Firestore Database" i menyn
2. Klicka "Create database"
3. Välj "Start in test mode" (för nu)
4. Välj region: `europe-west3 (Frankfurt)` (närmast Sverige)
5. Klicka "Done"

### 3.2 Konfigurera Firestore-regler (viktigt!)
1. Gå till "Firestore Database" → "Rules" i Firebase Console
2. Ersätt standardreglerna med följande:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Användare kan bara läsa/skriva sin egen data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Produkter - alla kan läsa, bara moderatorer/admins kan skriva
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && (
        getUserRole(request.auth.uid) == 'admin' || 
        getUserRole(request.auth.uid) == 'moderator'
      );
    }
    
    // Användarroller - bara admins kan hantera
    match /userRoles/{userId} {
      allow read: if request.auth != null && (
        request.auth.uid == userId ||
        getUserRole(request.auth.uid) == 'admin' ||
        getUserRole(request.auth.uid) == 'moderator'
      );
      allow write: if request.auth != null && (
        getUserRole(request.auth.uid) == 'admin'
      );
    }
    
    // Rolländringar - bara admins kan logga
    match /roleChanges/{changeId} {
      allow read: if request.auth != null && getUserRole(request.auth.uid) == 'admin';
      allow write: if request.auth != null && getUserRole(request.auth.uid) == 'admin';
    }
    
    // Helper-funktion för att hämta användarroll
    function getUserRole(uid) {
      return get(/databases/$(database)/documents/userRoles/$(uid)).data.role;
    }
  }
}
```

## Steg 4: Konfigurera Firebase Storage

### 4.1 Aktivera Storage
1. Gå till "Storage" i Firebase Console-menyn
2. Klicka "Get started"
3. Välj "Start in test mode" (vi ändrar reglerna senare)
4. **VIKTIGT - Välj gratis region för Storage:**
   - **us-central1 (Iowa)** - REKOMMENDERAD för gratis Storage
   - us-west2 (Los Angeles) 
   - us-east1 (South Carolina)
   - **UNDVIK europe-west3** - kostar pengar för Storage!
5. Klicka "Done"

**OBS:** Det är OK att ha Firestore i Europe och Storage i USA - prestandan påverkas inte märkbart för bilduppladdning.

### 4.2 Konfigurera Storage-regler (viktigt för bilduppladdning!)
1. I Storage-sektionen, gå till "Rules" fliken
2. Ersätt standardreglerna med följande:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Produktbilder - alla kan läsa, bara moderatorer/admins kan ladda upp
    match /product_images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && (
        isUserRole('admin') || isUserRole('moderator')
      );
      allow delete: if request.auth != null && isUserRole('admin');
    }
    
    // Helper-funktion för att kontrollera användarroll
    function isUserRole(role) {
      return firestore.get(/databases/(default)/documents/userRoles/$(request.auth.uid)).data.role == role;
    }
  }
}
```

3. Klicka "Publish" för att spara reglerna

**Viktigt**: Utan dessa regler kommer bilduppladdning inte att fungera!

## Steg 5: Hämta konfiguration

### 5.1 Lägg till Webb-app
1. I Firebase Console, klicka på inställnings-ikonen ⚙️
2. Välj "Project settings"
3. Scrolla ner till "Your apps"
4. Klicka på webb-ikonen `</>`
5. **App nickname**: `PLU Memory Web`
6. **Hosting**: Kryssa INTE i denna (vi använder GitHub Pages)
7. Klicka "Register app"

### 5.2 Kopiera konfiguration
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

## Steg 6: Uppdatera din kod

### 6.1 Ersätt konfiguration
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

## Steg 7: Testa lokalt (valfritt)

Om du vill testa innan du laddar upp till GitHub Pages:

### 7.1 Starta lokal server
```bash
# Med Python
python -m http.server 8000

# Med Node.js
npx http-server -p 8000

# Med PHP
php -S localhost:8000
```

### 7.2 Lägg till localhost i Firebase
1. Gå tillbaka till Firebase Console
2. Authentication → Sign-in method
3. Scrolla ner till "Authorized domains"
4. Lägg till `localhost`

## Steg 8: Ladda upp till GitHub Pages

1. Följ instruktionerna i `DEPLOY.md`
2. Efter deployment, testa funktionaliteten:
   - Klicka "Logga in med Google"
   - Spela några rundor
   - Kontrollera att achievements visas
   - Kolla leaderboard i profilen

## Funktioner som aktiveras

När Firebase är konfigurerat får du:

### 🔐 Autentisering
- **Google Sign-In** - Logga in med Google-konto
- **Apple Sign-In** - Logga in med Apple ID/iCloud (bäst på Safari/iOS)
- **E-post/Lösenord** - Skapa konto eller logga in med e-postadress
- **Lösenordsåterställning** - Glömt lösenord via e-post
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

### 📷 Bilduppladdning (Moderatorer/Admins)
- Ladda upp egna produktbilder
- Stöd för JPEG, PNG och WebP-format
- Automatisk storlek- och typvalidering
- Säker filhantering med Firebase Storage

### 👨‍💼 Administrations- och Moderatorfunktioner
- **Administratörer** kan:
  - Lägga till/redigera/ta bort produkter
  - Ladda upp och ta bort produktbilder
  - Hantera användarroller (sätta moderatorer)
  - Importera produktdata från JSON
- **Moderatorer** kan:
  - Lägga till/redigera produkter
  - Ladda upp produktbilder
  - Se produkthantering i spelgränssnittet

## Felsökning

### Problem: "Firebase inte konfigurerad"
- Kontrollera att du ersatt alla värden i `firebaseConfig`
- Se till att inget värde fortfarande är "DIN_API_KEY_HÄR"

### Problem: "Sign-in fungerar inte"
- **Google**: Kontrollera att din domän är tillagd i "Authorized domains"
- **Apple**: Fungerar bäst på Safari och iOS-enheter
- **E-post**: Kontrollera att Email/Password är aktiverat i Firebase Console
- För GitHub Pages: `dittanvändarnamn.github.io`
- Kontrollera att popup-blockerare inte blockerar inloggning

### Problem: "Kan inte spara data"
- Kontrollera Firestore-reglerna
- Se till att Authentication är aktiverat
- Kolla nätverksanslutning

### Problem: "Achievements visas inte"
- Kontrollera JavaScript-konsolen för fel
- Se till att användaren är inloggad
- Verifiera att Firestore-data sparas korrekt

### Problem: "Bilduppladdning fungerar inte"
- **Kontrollera Firebase Storage-regler**: Se till att Storage-reglerna är korrekt konfigurerade (Steg 4.2)
- **Användarroll**: Bara moderatorer och admins kan ladda upp bilder
- **Filformat**: Endast JPEG, PNG och WebP tillåtna
- **Filstorlek**: Max 5MB per bild
- **Browser console**: Kolla efter felmeddelanden i Developer Tools

### Problem: "Produkthantering syns inte"
- Se till att användaren har moderator- eller admin-roll
- Kontrollera Firestore-reglerna för userRoles-kollektionen
- Logga ut och in igen för att uppdatera rollcache

### Problem: "Storage kostar pengar" / "No-cost buckets not supported"
- **Lösning**: Använd en gratis region för Storage
- Gå till Firebase Console → Storage → Settings
- Välj `us-central1`, `us-west2`, eller `us-east1`
- Det är OK att ha Firestore i Europa och Storage i USA
- **Alternativ**: Skapa nytt projekt med allt i `us-central1`

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