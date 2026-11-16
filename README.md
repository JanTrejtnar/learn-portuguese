# Aprender Português 🇵🇹

Webová aplikace (PWA) pro učení **evropské portugalštiny (PT-PT)**, úroveň A1–A2. Rozhraní je v češtině.

## Spuštění

```bash
npm install
npm run dev        # vývojový server
npm run build      # typecheck + produkční build do dist/
npm test           # unit testy SRS
```

## Stack
Vite · Preact · TypeScript · Tailwind CSS 4 · hash router (bez serveru) · obsah v typovaných modulech `src/content/`.

## Struktura
- `src/content/a1/` – jednotky a lekce (slovíčka, gramatika, dialogy). Každé slovíčko má stabilní `id`.
- `src/pages/`, `src/components/` – UI.
- `src/router.ts` – minimalistický hash router.

## Pravidla obsahu
- Pouze PT-PT (*tu estás a fazer*, enklitika *chamo-me*, *autocarro*, *telemóvel*…). **Žádné brazilské tvary ani srovnání s brazilštinou.**
- Doplňovací cvičení (`cloze`) patří ke gramatice lekce; `npm test` hlídá strukturu obsahu.
- `reviewed: false` u lekce = zatím nezkontroloval rodilý mluvčí.

## Plán
1. ✅ Skeleton + data A1 (jednotky 1–2, později rozšířeno)
2. ✅ Flashcards + audio (`pt-PT`)
3. ✅ SRS + IndexedDB
4. ✅ Kvízy a testy
5. ✅ Kompletní A1 (jednotky 1–8) + gramatická cvičení (doplňování vět)
6. ✅ Gamifikace (XP, úrovně, denní cíl, odznaky, mapa) · 7. ✅ Roleplay, minimální páry a mluvení · 8. PWA/offline · 9. A2 · 10. AI konverzace
