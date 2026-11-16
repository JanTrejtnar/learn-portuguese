# Analýza 2: co zlepšit a srovnání s Duolingem

Stav k 16. 11. 2026, po úrovni B1. Navazuje na `docs/ANALYZA_A_PLAN.md` (co už je hotové) a `docs/IMPROVEMENTS.md` (katalog nápadů). Tento dokument **neopakuje** hotové věci (onboarding, mince, avatar, pohlednice, psaní při opakování, gramatické SRS, zařazovací test, B1…). Hledá, co v aplikaci **ještě chybí nebo se zhoršilo**.

**Jak vznikl:** přečetl jsem dokumentaci, kód domovské stránky, lekce, SRS, fronty, nastavení, audia, typů cvičení a konfigurace PWA, a spustil jsem `tsc`, testy a build. **Neověřil jsem:** chování na reálném telefonu (iOS Safari, audio, mikrofon), správnost obsahu rodilým mluvčím, ani to, jak aplikaci používají lidé. Srovnání s Duolingem vychází z mé znalosti jeho produktu, ne z čerstvého průchodu aplikací.

## 1. Stav v číslech

| Údaj | Hodnota |
|---|---|
| `tsc --noEmit`, `npm test` | bez chyb, 64 testů prochází |
| Jednotky / lekce | 24 jednotek (A1, A2, B1 po 8) |
| Slovíčka a fráze | ≈ 763 (každé s příkladovou větou) |
| Scénáře (roleplay) | ≈ 14 |
| Balíček JS | **546 kB** (precache 626 KiB); build vypisuje varování „chunk > 500 kB“ |
| Ověřeno rodilým mluvčím | **nic** (`reviewed: false` všude) |
| Ukládání pokroku | jen IndexedDB + `localStorage` v prohlížeči, ruční záloha do souboru |

## 2. Srovnání s Duolingem

| Oblast | Duolingo | Portuglove dnes | Závěr |
|---|---|---|---|
| **Jádro učení** | Krátká lekce (5–10 min) = 10–15 různých cvičení za sebou, okamžitá zpětná vazba, malý cíl | Lekce je **stránka ke čtení** (slovíčka, gramatika, dialog), pak oddělené karty a oddělený test. Cvičení jsou bohatá (výběr, psaní, diktát, spojování, skládání vět, doplňování), ale uživatel je musí sám poskládat. | 🔴 Největší rozdíl. Chybí „jedno tlačítko → vedená relace“. |
| **Pořadí a cesta** | Lineární cesta, každý krok má jasné „co teď“ | Mapa + seznam, jednotky se odemykají testem, karta „Dnešní plán“ | ✅ Srovnatelné, mapa je silnější než Duolingo. |
| **Opakování** | Skryté, součást cest; „Practice“ podle slabých míst | Skutečné SRS (lepší než Duolingo), psaní při opakování, gramatika v SRS | ✅ Silnější stránka. |
| **Návyk a připomínky** | Push notifikace, série, ligy, kamarádi, „série v ohrožení“ | Série, zmrazení, mince, odznaky. **Žádná připomínka**, žádní lidé | 🟡 Připomínky chybí úplně. Sociální část na jedno zařízení nejde. |
| **Čtení a poslech souvislého textu** | Příběhy, audio lekce, podcasty | Dialogy s audiem po řádcích, žádná cvičení nad nimi, žádné krátké čtené texty | 🔴 Slabé místo: slova jsou dobře, souvislé porozumění skoro vůbec. |
| **Mluvení** | Rozpoznávání řeči v každé lekci | Samostatná stránka a scénáře, jen Chrome/Edge, audio na serverech výrobce | 🟡 Funkční, ale okrajové. |
| **Audio** | Nahrané hlasy, vždy stejné | Hlas zařízení (Web Speech), závisí na tom, zda má pt-PT | 🔴 Nejistá kvalita podle zařízení. |
| **Účet a data** | Účet, synchronizace mezi zařízeními | Žádný účet, data jen v tomto prohlížeči | 🔴 Riziko ztráty pokroku (viz N3). |
| **Obsah** | Tým, revize, A/B testy | Psáno AI, neověřeno | 🔴 Největší riziko kvality. |
| **Jazyková specifika** | Obecný kurz (Duolingo u portugalštiny učí brazilskou variantu) | Čistě PT-PT, **česky**, česká specifika (falešní přátelé, gramatika vysvětlená Čechům) | ✅ Hlavní konkurenční výhoda. Dnes ji využívají jen zčásti (viz N6). |

**Poznámka k pozicování:** Portuglove nemá být „menší Duolingo“. Silné stránky jsou PT-PT, čeština, opravdové SRS a gramatika s vysvětlením. Duolingo kopírujme jen v tom, co je skutečný návyk učení (vedená krátká relace, připomínky), ne v soutěžení a ligách.

## 3. Nálezy

Legenda: **Dopad** 🔴 velký · 🟡 střední · 🟢 malý. **Pracnost** S hodiny · M dny · L týdny. Čísla začínají `N` (nové), ať se nepletou s kódy z první analýzy.

### Učební tok

| # | Nález | Dopad | Pracnost | Návrh |
|---|---|---|---|---|
| N1 | **Chybí vedená relace „Projít lekci“.** `LessonPage` nabízí „Kartičky“, „Test lekce“ a záložky. Nováček neví, v jakém pořadí a po jakých krocích projít 40 slovíček, gramatiku a dialog. Duolingo mu dává jedno tlačítko. | 🔴 | M | Tlačítko **„Projít lekci“** (12–15 kroků): představit 5 slov → cvičit je (výběr → psaní/poslech) → krok z gramatiky (doplňování z `cloze`) → řádek dialogu (poslech + skládání) → souhrn s XP. Generátory jsou už v `src/lib/quiz.ts`, takže je to hlavně sestavení fronty a pruh postupu. Stávající karty, test a záložky zůstanou jako „režim pro pokročilé“. |
| N2 | **Dialogy nemají cvičení.** (v první analýze G4, stále neřešeno). Poslech řádku s audiem je jediná interakce. | 🔴 | M | Tři režimy nad dialogem: „poslech bez textu → otázka na porozumění“, „doplň repliku“, „seřaď řádky“. Zahrnout do relace z N1. |
| N5 | **Žádné krátké čtené a poslechové texty.** B1 bez souvislého čtení je neúplné: gramatika (konjuntiv, vyprávění) se učí na izolovaných větách. | 🔴 | L | 3–5 krátkých textů na jednotku (50–120 slov), s klikacími slovy, audiem a 3 otázkami. Pro B1 začít jednou na jednotku. Vyžaduje revizi rodilým mluvčím víc než cokoli jiného. |
| N6 | **Česká specifika se nevyužívají.** Aplikace nemá žádný modul výslovnosti PT-PT (redukované samohlásky, nosovky, „sh“ u s/z, závěrečné -s, ão), ani přehled falešných přátel CZ ↔ PT. U Čecha je to hlavní bariéra a Duolingo s tím nepomůže. | 🟡 | M | Minikurz **Výslovnost** (6–8 krátkých lekcí s minimálními páry, které engine `PairsPage` už umí) a karty **Falešní přátelé**. Přepis výslovnosti u slov jen s revizí. |
| N7 | **SRS je zjednodušený SM-2.** Funguje, ale u zapomenutých karet ho FSRS zvládá lépe a je měřitelně efektivnější. | 🟢 | M | Až po N1. Čistá logika v `srs.ts` + testy; zachovat formát `CardState` (migrace). |

### Návyk a spolehlivost

| # | Nález | Dopad | Pracnost | Návrh |
|---|---|---|---|---|
| N3 | **Pokrok se může ztratit.** Všechno je v IndexedDB/localStorage. Záloha je jen ruční. Podle mého vědomí Safari na iOS maže data webů, které se 7 dní neotevřely a nejsou přidané na plochu. Série a mince by zmizely beze slova. Tuto stránku jsem na iOS nezkoušel, riziko je tedy předpoklad. | 🔴 | S–M | (a) Při startu zavolat `navigator.storage.persist()`. (b) Připomenout zálohu po 14 dnech bez exportu a po velkém pokroku. (c) Nabídka „Přidat na plochu“ s vysvětlením proč (`install.ts` existuje). (d) Později volitelná synchronizace (viz sekce 5). |
| N4 | **Žádné připomínky.** Bez nich se série drží jen u lidí, kteří si aplikaci otevřou sami. Web Push potřebuje server. | 🟡 | S | Bez serveru: stažení kalendářní události `.ics` s denní připomínkou a odkazem, plus „série v ohrožení“ jako odznak v ikoně (Badging API, kde jde). Web Push jen pokud bude backend. |
| N8 | **Týdenní cíl a „výzvy“ chybí.** Denní cíl je jen XP. Duolingo míchá krátkodobé úkoly („3 testy dnes“). | 🟢 | S | 2–3 denní úkoly odvozené z dat, odměna jen malé množství mincí. Bez ligy a bez žebříčku. |

### Technika a kvalita

| # | Nález | Dopad | Pracnost | Návrh |
|---|---|---|---|---|
| N9 | **Balíček přesáhl 500 kB.** První analýza (K2) lazy-load vynechala, protože balíček měl 480 kB. B1 ho posunul na 546 kB a build už varuje. Roste s každou další lekcí. | 🟡 | S | `import()` obsahu po úrovních (A1 hned, A2 a B1 při prvním použití) + oddělit mapu (SVG). Offline cache zůstane (precache všech chunků). Měřit: první stažení < 300 kB gzip. |
| N10 | **Revize obsahu nemá postup.** Štítek „neověřeno“ existuje, ale není nástroj, jak revizi provést. | 🔴 | S | Skript `npm run export:review` → CSV/Markdown (id, pt, cs, literal, usage, příklad, lekce) pro rodilého mluvčího; pak jednorázový import oprav. Bez toho C1 zůstává „někdy“. |
| N11 | **Audio je největší nejistota na cizích zařízeních.** Stále platí A1 z první analýzy. Aplikace zvládne detekci, ale nic lepšího nenabídne. | 🔴 | M–L | Rozhodnutí o předgenerovaném audiu (slovíčka + příkladové věty, ≈ 1500 souborů, desítky MB → nemusí být v precache, jen při prvním použití). Do té doby aspoň test hlasu v průvodci s návodem pro platformu. |
| N12 | **Texty rozhraní jsou natvrdo v komponentách** (K3), buttonové styly se opakují (K4), `StudyPage` a `QuizPage` mají 270–380 řádků. Nic z toho nepřekáží uživateli, zpomalí to ale N1. | 🟢 | M | Až při práci na N1: `<Button>` a hook `useExerciseSession` společný pro karty, kvíz a vedenou lekci. |
| N13 | **Žádná měření použití.** Nevíme, kde lidé odpadají (první lekce? test jednotky?). | 🟢 | S | Volitelné, bez účtu, jen lokální souhrn v Pokroku („nejčastěji chybuješ v…“) a ruční „Nahlásit chybu“ (issue). |

## 4. Plán po fázích

Každá změna chování musí podle `CLAUDE.md` zahrnout úpravu tutoriálu (`src/content/tutorial.ts`, `WelcomePage.tsx`), jeho testů a zmínku v `docs/ANALYZA_A_PLAN.md`. U N1 to platí zvlášť (mění se, jak se lekce „dělá“).

### Fáze A: ochrana a rychlé úspory (1–2 dny)
- N3 `storage.persist()`, připomenutí zálohy, vysvětlení „Přidat na plochu“
- N9 lazy-load obsahu po úrovních
- N10 export pro revizi rodilým mluvčím
- N4 stažení `.ics` připomínky

**Hotovo, když:** nový build nehlásí varování o velikosti; po vymazání dat lze obnovit ze zálohy; export lekcí vznikne jedním příkazem; E2E a `axe` testy procházejí.

### Fáze B: vedená relace (cca týden)
- N1 „Projít lekci“ (sdílený hook relace, pruh postupu, souhrn)
- N2 cvičení nad dialogy
- Úprava tutoriálu, E2E scénář „projdi první lekci“

**Hotovo, když:** nový uživatel dojde z úvodní obrazovky na konec první lekce **jedním tlačítkem** bez vstupu do jiných částí aplikace. Ideálně ověřit na 2–3 lidech (10 minut, bez nápovědy).

### Fáze C: souvislý jazyk a čeština jako výhoda (2–3 týdny, průběžně)
- N6 minikurz výslovnosti + falešní přátelé
- N5 čtené a poslechové texty (nejdřív A2/B1)
- N8 denní úkoly
- Revize rodilým mluvčím běží souběžně (jinak Fáze C jen přidává neověřený text)

### Fáze D: velké sázky (až po rozhodnutí)
- N11 předgenerované audio
- N7 FSRS
- Synchronizace pokroku mezi zařízeními
- AI konverzace, offline Whisper pro mluvení (viz `IMPROVEMENTS.md`)

## 5. Co dělat jinak než Duolingo

- **Žádné ligy, žádné „srdíčka“ za chybu.** Pro dospělého, který se učí po práci, je trest za chybu špatná motivace, a aplikace to už řeší mírně (odpuštění série).
- **Neomezovat opakování** (Duolingo to v bezplatné verzi omezuje). Silná stránka zůstává SRS bez limitu.
- **Synchronizace bez účtu:** pokud bude potřeba mezi telefonem a počítačem, nejlevnější je šifrovaný soubor zálohy + QR/odkaz, ne vlastní server. Server a účty znamenají provoz, soukromí a GDPR; na to potřebuji tvé rozhodnutí.

## 6. Rizika a nejistoty

- **Obsah:** všechna nová práce (N5, N6, N2) přidává další neověřený text. Bez rodilého mluvčího se kvalita nezlepší, jen se rozšíří.
- **Odhady pracnosti jsou hrubé.** N1 závisí na tom, kolik z `StudyPage`/`QuizPage` půjde znovu použít bez přepisu.
- **N3 a audio jsou předpoklady**, ne měření. Před větší prací je dobré vyzkoušet aplikaci na iPhonu a na Windows bez pt-PT hlasu.
- **Srovnání s Duolingem** je z mé znalosti, ne z čerstvého průchodu jeho aplikací.

## 7. Otázky na tebe

1. Je cílem osobní použití, nebo veřejné nasazení? (Veřejné: revize, N3, N11 jsou povinné; osobní: stačí Fáze A + B.)
2. Je dobré, aby vedená relace z N1 byla **hlavní** způsob učení (tlačítko „Pokračovat“ na úvodní stránce), a karty/testy zůstaly vedle ní?
3. Je k dispozici rodilý mluvčí pro revizi, a v jakém tempu (např. jedna jednotka týdně)? Podle toho řadit Fázi C.
4. Chceš synchronizaci mezi zařízeními? Pokud ano, bez serveru (soubor/QR), nebo s účtem?
5. Mám připravit předgenerované audio (a z jakého zdroje), nebo zůstat u hlasu zařízení?
