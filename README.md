# Portuglove 🇵🇹

Webová aplikace (PWA) pro učení **evropské portugalštiny (PT-PT)**, úroveň A1–B1. Rozhraní je v češtině.

## Spuštění

```bash
npm install
npm run dev        # vývojový server
npm run build      # typecheck + produkční build do dist/
npm test           # unit testy SRS
```

## Stack
Vite · Preact · TypeScript · Tailwind CSS 4 · PWA (vite-plugin-pwa) · hash router (bez serveru) · obsah v typovaných modulech `src/content/`.

## Vzhled
- Barvy portugalské vlajky: zelená `#046a38` (primární), červená `#da291c` (akcent: série, aktuální město, chyby) a žlutá `#ffe900` (zvýraznění: XP, hlavní tlačítka). Tokeny jsou v `src/styles.css`.
- Světlý a tmavý režim (podle systému nebo ruční volba tlačítkem v záhlaví / v Nastavení). Povrchy a text jsou sémantické tokeny (`bg-surface`, `text-muted`, `border-line`…), nepoužívej přímo odstíny `stone-*`.

## Offline, instalace a záloha
- Aplikace je **PWA**: po prvním načtení funguje offline a jde nainstalovat na plochu (Nastavení → Aplikace).
- Pokrok je uložený v prohlížeči (IndexedDB). **Nastavení → Záloha** umožní export/import do JSON souboru (přenos mezi zařízeními).
- Tmavý/světlý vzhled: Nastavení → Vzhled.

## Nasazení
Statický build (`npm run build` → `dist/`) lze nahrát kamkoli. Workflow `.github/workflows/deploy.yml` buildí a testuje při každém pushi a z větve `main` nasazuje na GitHub Pages (v repozitáři zapni *Settings → Pages → Source: GitHub Actions*).

## Struktura
- `src/content/a1/` – jednotky a lekce (slovíčka, gramatika, dialogy). Každé slovíčko má stabilní `id`.
- `src/pages/`, `src/components/` – UI.
- `src/router.ts` – minimalistický hash router.

## Pravidla obsahu
- Pouze PT-PT (*tu estás a fazer*, enklitika *chamo-me*, *autocarro*, *telemóvel*…). **Žádné brazilské tvary ani srovnání s brazilštinou.**
- Doplňovací cvičení (`cloze`) patří ke gramatice lekce; `npm test` hlídá strukturu obsahu.
- `reviewed: false` u lekce = zatím nezkontroloval rodilý mluvčí.

## Další nápady
Seznam možných vylepšení je v [`docs/IMPROVEMENTS.md`](docs/IMPROVEMENTS.md). Krok 10 (AI konverzace) je zatím vynechán.

## Plán
1. ✅ Skeleton + data A1 (jednotky 1–2, později rozšířeno)
2. ✅ Flashcards + audio (`pt-PT`)
3. ✅ SRS + IndexedDB
4. ✅ Kvízy a testy
5. ✅ Kompletní A1 (jednotky 1–8) + gramatická cvičení (doplňování vět)
6. ✅ Gamifikace (XP, úrovně, denní cíl, odznaky, mapa) · 7. ✅ Roleplay, minimální páry a mluvení · 8. ✅ PWA/offline, záloha, nasazení · 9. ✅ Kompletní A2 (jednotky 1–8) · 10. ⏸ AI konverzace (zatím vynecháno, viz `docs/IMPROVEMENTS.md`)
