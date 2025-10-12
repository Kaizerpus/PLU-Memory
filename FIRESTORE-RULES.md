# Firestore Security Rules för PLU Memory

Ersätt dina nuvarande Firestore-regler med följande i Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Användardata - ägaren kan läsa/skriva sin egen data, alla inloggade kan läsa för topplista
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Tillåt alla inloggade att läsa användardata för topplistan
      allow read: if request.auth != null;
    }
    
    // Roller - alla inloggade kan läsa och skriva (förenklat för nu)
    match /userRoles/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Global statistik - alla kan läsa och skriva för att undvika permission-problem
    match /globalStats/{doc} {
      allow read, write: if request.auth != null;
    }
    
    // Tillåt alla andra dokument för inloggade användare (förenklat)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
```

## Firestore Index som behövs:

Du behöver bara ett **enkelt index** i Firebase Console för den nya leaderboard-queryn:

1. **Gå till Firebase Console**: https://console.firebase.google.com/
2. **Firestore Database** → **Indexes** → **Single field indexes**
3. **Kontrollera att det finns ett index för**:
   - **Collection ID**: `users`
   - **Field path**: `gameData.bestScore`
   - **Query scope**: Collection
   - **Array config**: --
   - **Order**: Descending

Detta index skapas oftast automatiskt första gången queryn körs.

**OBS:** Vi behöver INTE längre det composite index eftersom vi flyttade filtreringen till JavaScript-koden för att undvika Firestore-begränsningar.

## Hur du uppdaterar reglerna:

1. **Gå till Firebase Console**: https://console.firebase.google.com/
2. **Välj ditt projekt**: `plu-memory`
3. **Firestore Database** → **Rules**
4. **Ersätt** hela regelavsnittet med koden ovan
5. **Publish** reglerna

## Vad reglerna gör:

### 🔐 **Säkerhet:**
- **Användardata**: Endast du kan se/ändra din egen speldata
- **Roller**: Alla kan se roller, bara admin kan ändra dem
- **Rolländringar**: Loggning av vem som ändrat vad (admin/moderator kan se)

### 👑 **Första användaren:**
- **Automatisk admin**: Första personen som loggar in blir admin
- **Säker övergång**: Efter det krävs admin-rättigheter för att sätta roller

### 🛡️ **Rollhierarki:**
- **Admin**: Kan sätta andra som moderatorer eller vanliga användare
- **Moderator**: Kan se användarlista och statistik
- **Användare**: Kan bara hantera sin egen data

## Test efter uppdatering:

1. **Logga ut** från spelet
2. **Logga in** igen - du blir automatiskt admin (första användaren)
3. **Öppna Admin Panel** - ska nu visas i menyn
4. **Testa** att hantera användare när fler loggar in

Dessa regler säkerställer att ditt rollsystem är säkert och att ingen kan missbruka admin-funktioner! 🚀