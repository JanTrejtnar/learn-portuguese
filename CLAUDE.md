# Portuglove – pokyny pro práci na projektu

- Aplikace pro výuku **evropské portugalštiny (PT-PT)** s českým uživatelským rozhraním. Veškerý text pro uživatele je česky; brazilské tvary jsou zakázané (hlídají je testy).
- Obsah je psaný AI a čeká na revizi rodilým mluvčím (`reviewed: false` = štítek „neověřeno“).
- Ověření před commitem: `npx tsc --noEmit`, `npm test`, `npm run build`, `npm run test:e2e`.
- Commity: větev `claude/pt-pt-learning-app-plan-wpl11p` a `main`. PR jen na výslovné přání.

## Tutoriál musí být vždy aktuální

Při **každé změně chování aplikace** (lekce, odemykání, testy, mince, odměny, pohlednice, navigace, mapa, cvičení) zkontroluj a případně uprav vstupní tutoriál (`src/content/tutorial.ts`, `src/pages/WelcomePage.tsx`). Čísla a pravidla v tutoriálu se berou z konstant v kódu, ne z ručně psaných hodnot. Součástí práce je i úprava testů tutoriálu a zmínka ve `docs/ANALYZA_A_PLAN.md`.
