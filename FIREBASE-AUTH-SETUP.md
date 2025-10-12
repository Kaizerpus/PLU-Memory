# Firebase Authentication Setup Checklista 🔐

## Obligatoriska ändringar i Firebase Console

Du behöver aktivera de nya autentiseringsmetoderna i Firebase Console:

### ✅ Steg 1: Gå till Firebase Console
1. Besök [Firebase Console](https://console.firebase.google.com/)
2. Välj ditt `plu-memory` projekt
3. Gå till **Authentication** → **Sign-in method**

### ✅ Steg 2: Aktivera E-post/Lösenord
1. Klicka på **"Email/Password"**
2. Aktivera **"Enable"** för första alternativet
3. Klicka **"Save"**

### ✅ Steg 3: Aktivera Apple Sign-In (valfritt)
1. Klicka på **"Apple"**
2. Aktivera **"Enable"**
3. Lämna övriga fält tomma (för webbanvändning)
4. Klicka **"Save"**

### ✅ Steg 4: Kontrollera Authorized Domains
Se till att följande domäner är listade under "Authorized domains":
- `localhost` (för lokal testning)
- `kaizerpus.github.io` (din GitHub Pages URL)
- `plu-memory.firebaseapp.com` (automatiskt tillagd)

## Vad händer efter aktivering

### 🔐 **Google Sign-In** (redan aktivt)
- Användare loggar in med sitt Google-konto
- Automatisk profilinfo (namn, bild)

### 📧 **E-post/Lösenord** (nytt)
- Användare kan registrera konto med e-post
- Lösenordsåterställning via e-post
- Egna användarnamn (baserat på e-post)

### 🍎 **Apple Sign-In** (nytt)
- Fungerar bäst på Safari och iOS-enheter
- Privacyfokuserat (Apple kan dölja riktig e-post)
- Automatisk profilinfo från Apple ID

## E-postmallar (valfritt)

Du kan anpassa e-postmallarna som skickas till användare:

1. Gå till **Authentication** → **Templates**
2. Anpassa följande mallar:
   - **Password reset** - Lösenordsåterställning
   - **Email address verification** - E-postverifiering
3. Byt språk till svenska om du vill

## Test-instruktioner

### Testa Google Sign-In
1. Klicka på "🔐 Logga in med Google"
2. Välj Google-konto
3. Kontrollera att namnet visas i profilen

### Testa Apple Sign-In
1. Klicka på "🍎 Logga in med Apple"
2. Använd Apple ID
3. **OBS:** Fungerar bäst på Safari/iOS

### Testa E-post-registrering
1. Klicka på "📧 Logga in med E-post"
2. Gå till fliken "Registrera"
3. Ange e-post och lösenord (minst 6 tecken)
4. Klicka "Registrera konto"

### Testa E-post-inloggning
1. Klicka på "📧 Logga in med E-post"
2. Ange befintlig e-post och lösenord
3. Klicka "Logga in"

### Testa Lösenordsåterställning
1. Klicka på "📧 Logga in med E-post"
2. Klicka "Glömt lösenord?"
3. Ange e-postadress
4. Kontrollera e-post för återställningslänk

## Felsökning

### "Email/Password disabled"
→ Kontrollera att Email/Password är aktiverat i Firebase Console

### "Apple Sign-In not working"
→ Testa på Safari eller iOS-enhet (fungerar bäst där)

### "Domain not authorized"
→ Lägg till din domän under "Authorized domains"

### "User already exists"
→ Användaren har redan registrerat sig med samma e-post

## Security Notes

- **E-postverifiering**: Firebase kan kräva e-postverifiering för nya konton
- **Lösenordsstyrka**: Minimum 6 tecken (kan konfigureras)
- **Rate limiting**: Firebase begränsar för många inloggningsförsök
- **Cross-platform**: Samma användare kan logga in med olika metoder om samma e-post används

---

🎉 **Alla tre autentiseringsmetoderna är nu tillgängliga!**

Användare kan välja den metod de föredrar:
- Google för enkelhet
- Apple för privacy
- E-post för kontroll
