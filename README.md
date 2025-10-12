# PLU Memory - ICA Training Game 🛒

Ett interaktivt träningsspel för att lära sig PLU-koder (Price Look-Up codes) för ICA-produkter.

## 🎮 Funktioner

- **Interaktiv träning** av PLU-koder för 21 olika produkter
- **Mobiloptimerad** med touch-gester och responsiv design
- **PWA-funktionalitet** - installera som app på din enhet
- **Offline-stöd** - fungerar utan internetanslutning
- **Tillgänglighet** - fullt tillgänglig med tangentbordsnavigation och skärmläsarstöd
- **Export/Import** - säkerhetskopiera och överför din speldata
- **Detaljerad statistik** - följ din progress och förbättring
- **Animationer** - mjuk och engagerande användarupplevelse
- **🔥 Firebase-integration** - cloud-synkronisering och sociala funktioner
- **🏆 Achievements System** - lås upp prestationer medan du lär dig
- **📊 Leaderboard** - tävla med andra spelare
- **☁️ Cloud-backup** - dina resultat sparas säkert i molnet

## 🚀 Kom igång

Spelet är helt webbaserat och kräver ingen installation:

1. Besök [GitHub Pages-sidan](https://yourusername.github.io/plu-memory-game/)
2. **Valfritt**: Logga in med Google för cloud-funktioner
3. Klicka på "Starta Träning" för att börja
4. Lär dig PLU-koderna genom att matcha produkter med deras koder
5. **Samla achievements** och klättra på leaderboard!

### 🔥 Firebase Setup (för cloud-funktioner)

För att aktivera cloud-synkronisering, achievements och leaderboard:

1. Följ den detaljerade guiden i `FIREBASE-SETUP.md`
2. Skapa ett gratis Firebase-projekt
3. Konfigurera authentication och Firestore
4. Uppdatera `firebase-config.js` med dina inställningar

**Obs**: Spelet fungerar helt utan Firebase, men du missar de sociala funktionerna.

## 📱 Installation som PWA

För bästa upplevelse kan du installera spelet som en app:

1. Öppna spelet i din webbläsare
2. Klicka på "Installera app"-knappen som visas
3. Bekräfta installationen
4. Spelet kommer nu att finnas som en app på din enhet

## 🎯 Så här fungerar det

- **Träningsläge**: Lär dig PLU-koder steg för steg
- **Poängsystem**: Samla poäng för rätta svar
- **Streak-bonus**: Få extra poäng för konsekutiva rätta svar
- **Statistik**: Se din framgång över tid
- **Olika svårighetsgrader**: Från vanliga till ovanliga produkter

## 🛠️ Teknisk information

- **Vanilla JavaScript** - inga externa beroenden
- **CSS3** med moderna funktioner
- **Service Worker** för offline-funktionalitet
- **Web App Manifest** för PWA-stöd
- **Firebase Integration** för cloud-funktioner (valfritt)
- **Lokalt lagring** för speldata + cloud-backup
- **Responsiv design** för alla enheter

## 📊 Produkter som ingår

Spelet innehåller 21 olika produkter fördelade på kategorier:

- **Grönsaker**: Morot, Potatis, Röd lök, Gurka
- **Bröd & Bakverk**: Donuts, Muffins, Knutar, Bullar
- **Snacks**: Chips, Nötter, Godis
- **Drycker**: Läsk, Juice, Kaffe
- **Diverse**: Övriga ICA-produkter

## 🔧 Utveckling

För att köra lokalt:

```bash
# Klona repot
git clone https://github.com/yourusername/plu-memory-game.git

# Gå till mappen
cd plu-memory-game

# Starta en lokal server (exempel med Python)
python -m http.server 8000

# Eller med Node.js
npx http-server -p 8000
```

Besök sedan `http://localhost:8000` i din webbläsare.

## 📝 Licens

Detta projekt är skapat för utbildningssyfte och träning av ICA-personal.

## 🤝 Bidrag

Förslag på förbättringar och nya funktioner är välkomna! Skapa gärna en issue eller pull request.

---

Utvecklat med ❤️ för ICA-teamet