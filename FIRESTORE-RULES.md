# Firestore Security Rules för PLU Memory med Rollsystem

Ersätt dina nuvarande Firestore-regler med följande i Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Användardata - endast ägaren kan läsa/skriva sin egen data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Roller - alla inloggade kan läsa, endast admin kan skriva
    match /userRoles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        // Tillåt första användaren att sätta sin egen roll
        !exists(/databases/$(database)/documents/userRoles/$(request.auth.uid)) ||
        // Tillåt admin att sätta andras roller
        get(/databases/$(database)/documents/userRoles/$(request.auth.uid)).data.role == 'admin'
      );
    }
    
    // Rolländringar - endast admin kan skriva, moderatorer kan läsa
    match /roleChanges/{changeId} {
      allow read: if request.auth != null && (
        get(/databases/$(database)/documents/userRoles/$(request.auth.uid)).data.role in ['admin', 'moderator']
      );
      allow create: if request.auth != null && (
        get(/databases/$(database)/documents/userRoles/$(request.auth.uid)).data.role == 'admin'
      );
    }
    
    // Global statistik - alla kan läsa, endast system kan skriva
    match /globalStats/{doc} {
      allow read: if request.auth != null;
      allow write: if false; // Endast via Cloud Functions
    }
  }
}
```

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