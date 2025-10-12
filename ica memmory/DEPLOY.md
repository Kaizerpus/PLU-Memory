# Deployment Guide för GitHub Pages

## Steg för att ladda upp till GitHub Pages

### 1. Skapa GitHub Repository

1. Gå till [GitHub.com](https://github.com)
2. Klicka på "New repository"
3. Namnge repot (t.ex. `plu-memory-game`)
4. Markera "Public" (krävs för gratis GitHub Pages)
5. Klicka "Create repository"

### 2. Ladda upp filer

Du kan antingen:

**Alternativ A: Via GitHub web interface**
1. Klicka "uploading an existing file"
2. Dra och släpp alla filer från din mapp
3. Skriv en commit-beskrivning: "Initial upload of PLU Memory Game"
4. Klicka "Commit new files"

**Alternativ B: Via Git (om du har Git installerat)**
```bash
git init
git add .
git commit -m "Initial upload of PLU Memory Game"
git branch -M main
git remote add origin https://github.com/DITTANVÄNDARNAMN/plu-memory-game.git
git push -u origin main
```

### 3. Aktivera GitHub Pages

1. Gå till ditt repository på GitHub
2. Klicka på "Settings" (längst till höger i menyn)
3. Scrolla ner till "Pages" i vänstermenyn
4. Under "Source", välj "Deploy from a branch"
5. Välj "main" branch och "/ (root)"
6. Klicka "Save"

### 4. Vänta på deployment

- GitHub kommer att bygga din sida (tar 1-10 minuter)
- Du får en URL som: `https://dittanvändarnamn.github.io/plu-memory-game/`
- En grön bock visas när det är klart

## Viktiga filer för GitHub Pages

Dessa filer säkerställer kompatibilitet:

- `.nojekyll` - Förhindrar Jekyll-bearbetning
- `manifest.json` - PWA-konfiguration med relativa paths
- `sw.js` - Service Worker med relativa cache-paths
- `README.md` - Dokumentation
- `_config.yml` - GitHub Pages konfiguration

## Felsökning

### Problem: Sidan laddar inte
- Kontrollera att `index.html` finns i root-mappen
- Kolla att GitHub Pages är aktiverat i Settings

### Problem: Bilder laddar inte
- Kontrollera att alla bildpaths använder relativa sökvägar (`./images/` inte `/images/`)
- Se till att bildfilnamn stämmer exakt (versalkänsligt)

### Problem: PWA fungerar inte
- GitHub Pages kräver HTTPS - detta fixas automatiskt
- Service Worker cache-paths är redan fixade för relativa sökvägar

### Problem: Fonts/ikoner laddar inte
- Alla ikoner använder data URLs eller lokala filer
- Inga externa CDN-resurser som kan blockeras

## Test efter deployment

1. Besök din GitHub Pages URL
2. Testa att spelet fungerar
3. Kontrollera att PWA-installation erbjuds
4. Testa offline-funktionalitet
5. Kontrollera att export/import fungerar

## Framtida uppdateringar

För att uppdatera spelet:
1. Gör ändringar i dina lokala filer
2. Ladda upp till GitHub (samma process som ovan)
3. GitHub Pages uppdateras automatiskt inom några minuter

---

🎉 Din PLU Memory Game är nu redo för GitHub Pages!