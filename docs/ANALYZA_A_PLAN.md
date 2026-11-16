# Analýza aplikace a plán zlepšení (UX, kvalita, funkčnost)

Stav k 16. 11. 2026. Doplňuje `docs/IMPROVEMENTS.md` (ten je široký katalog nápadů). Tento dokument je užší: vychází z toho, co **je dnes v aplikaci**, a navrhuje konkrétní opravy a zjednodušení s pořadím.

**Jak vznikl:** přečetl jsem kód stránek a knihoven (`src/pages`, `src/components`, `src/lib`), prošel obrazovky na mobilu (390 × 844) a spustil testy a build. **Co jsem neověřil:** chování na reálném telefonu (audio, mikrofon, iOS Safari), použití skutečnými uživateli a správnost obsahu rodilým mluvčím. Tvrzení o UX jsou tedy úsudek z kódu a screenshotů, ne měření.

## Stav realizace

**Hotovo (fáze 1 a část fáze 2):** U1 onboarding (`/welcome`), U3 „Otevřít lekci“ pro nového uživatele, U4 smazaný banner, U5 offline toast jen jednou, G1 sbalitelné vysvětlení (ⓘ) v seznamech, G2 „Co dál?“ na konci lekce, C2 štítek „neověřeno“, L1 krok „Nové slovíčko“ před zkouškou, L4 čistý souhrn, P1 nastavení učení na jednom místě (Nastavení → Učení).

**Také hotovo:** K1 E2E testy (`npm run test:e2e`, 7 scénářů, spouští se v CI po buildu).

**Zbývá:** N1/N2 sloučení navigace, T1/T2 výsledek testu, P2 zmrazení série, K2 lazy-load, K6 prompt na aktualizaci, L5/L6 gramatické a psací karty, C1/C3/A1 (obsah a audio).

## 0. Shrnutí v jedné stránce

**Co funguje dobře:** jasná vizuální identita, offline PWA, srozumitelné SRS (po poslední úpravě), vysvětlení slovíček, záloha, rozumná struktura kódu, build a 36 testů čisté logiky procházejí.

**Tři největší problémy:**
1. **Studium začíná „studeně“.** Nové slovíčko se ukáže jen jako otázka bez vysvětlení; uživatel nemá fázi „nejdřív se to nauč“. Totéž u gramatiky: je schovaná v lekci a nikdy se neopakuje.
2. **Zbytečně mnoho cest ke stejnému cíli a rozházené ovládání.** Lekce, Karty, Testy a Mapa ukazují tytéž jednotky čtyřmi způsoby. Nastavení učení je rozdělené na čtyři místa a stránka „Nastavení“ je neobsahuje.
3. **Audio a obsah jsou největší riziko kvality.** Zvuk závisí na hlasu v zařízení a všechna lekce mají `reviewed: false`. Aplikace to ví, ale uživatel to vidí jen jako drobné upozornění.

**Doporučené pořadí (rychlé vítězství první):**
1. Sjednotit nastavení a zjednodušit navigaci (týden práce odpadne z dalších oprav).
2. Fáze „učení“ nových karet + sbalitelné vysvětlení v lekci.
3. Onboarding a „Pokračovat tam, kde jsem skončil“.
4. E2E testy v CI (než se bude dál přidávat obsah).
5. Audio: předgenerované soubory nebo aspoň jasná diagnostika.
6. Revize obsahu rodilým mluvčím.

---

## 1. Nálezy podle oblastí

Legenda: **Dopad** 🔴 velký · 🟡 střední · 🟢 malý. **Pracnost** S = hodiny, M = dny, L = týdny. U každého je uveden soubor, kde se to dá řešit.

### 1.1 První použití a orientace

| # | Nález | Dopad | Pracnost | Návrh |
|---|---|---|---|---|
| U1 | **Chybí onboarding.** Nový uživatel dostane rovnou „Dnešní plán: 0 k opakování · 10 nových“ a tlačítko Začít, které otevře karty bez kontextu. Neví, co je SRS, XP ani proč jsou jednotky zamčené. | 🔴 | M | 3 obrazovky při prvním spuštění: cíl a tempo (Pohoda/Normální/Intenzivní), „jak se učíme“ (karty → test → další jednotka), nabídka „Už něco umím“ (přeskočit na A1.2 nebo A2). Ukládat do `settings`. |
| U2 | Domovská stránka je dlouhá: pozdrav, hráč, plán, 4 rychlé akce, pak všech 16 jednotek v seznamu. Na telefonu je nutné hodně scrollovat, než uživatel najde „kde jsem“. | 🟡 | S | Nahoru dát jednu velkou kartu **„Pokračovat“** (poslední rozdělaná lekce nebo další jednotka). Seznam jednotek sbalit po úrovních (A1 rozbalená, A2 sbalená dokud A1 není hotová). `HomePage.tsx` |
| U3 | Tlačítko „Začít“ vede na `/cards/all`, ale uživatel s nesplněnou jednotkou by měl spíš dostat **lekci**, ne karty z lekce, kterou nečetl. | 🟡 | S | Když uživatel nemá žádné karty, tlačítko „Začít“ otevře první lekci s textem „Nejdřív si projdi slovíčka“. |
| U4 | Banner „🛠️ Úroveň A2 se postupně doplňuje“ je zastaralý (A2 má 8 jednotek). | 🟢 | S | Smazat nebo nahradit „Další obsah (B1) připravujeme“. |
| U5 | Toast „Připraveno offline“ se zobrazuje 5,5 s přes obsah (na screenshotech zakrývá nadpisy stránky). | 🟢 | S | Zobrazit jen jednou za zařízení a posunout pod horní lištu, nebo ho zkrátit na 3 s. `ToastHost.tsx`, `toast.ts` |

### 1.2 Navigace a struktura

| # | Nález | Dopad | Pracnost | Návrh |
|---|---|---|---|---|
| N1 | **Šest záložek s překryvy**: Lekce (seznam jednotek), Mapa (táž data jako mapa), Karty (táž data jako seznam balíčků), Testy (táž data jako seznam testů). Uživatel si musí pamatovat, kde co je. | 🔴 | M | Sloučit na 4: **Učit se** (mapa jako hlavní pohled + přepínač „seznam“), **Karty** (opakování + hledání), **Praxe** (kvíz, scénáře, výslovnost, páry), **Pokrok** (statistiky + nastavení). Mapa a seznam jednotek jsou dva pohledy na tutéž věc. |
| N2 | Test jednotky a testy lekcí jsou na třech místech (Testy, jednotka, lekce). Na stránce Testy je pro 16 jednotek zhruba 64 řádků. | 🟡 | S | V Testech zobrazit jen „Doporučený test“ (další nesplněný) a „Rychlý kvíz“; zbytek přes jednotku. `QuizHubPage.tsx` |
| N3 | Zamčené jednotky: „Už to umím, odemknout“ je skrytá až uvnitř zamčené jednotky. Zkušenější uživatel to nenajde. | 🟡 | S | Tlačítko u zamčené jednotky na domovské stránce/mapě + zařazovací test. |
| N4 | „Praxe“ je jen rozcestník se 3 položkami (jedna úroveň navíc). | 🟢 | S | Dát Praxi přímo do „Učit se“ nebo zobrazit rovnou karty praxe na domovské stránce. |

### 1.3 Učení slovíček a opakování

| # | Nález | Dopad | Pracnost | Návrh |
|---|---|---|---|---|
| L1 | **Nová karta se zobrazí jako zkouška.** Uživatel poprvé vidí „Boa tarde“ a má hodnotit, zda ho „znal“. Přitom ho ještě nikdy neviděl. | 🔴 | M | Nová slovíčka ukázat nejdřív v režimu **„Poznej nové“** (portugalsky + česky + audio + vysvětlení + příklad), teprve pak hodnotit. Doplnit mini-kvíz (výběr z 3) před zařazením do SRS. `StudyPage.tsx`, `Flashcard.tsx` |
| L2 | Tlačítko „Znovu“ vrací kartu na konec fronty, ale SRS jí dá termín za „chvíli“ (10 min) a potom i **zítra**. Uživatel nevidí, že je karta „učená“, a může ji dostat o pár minut později znovu. | 🟡 | S | Při „Neznal jsem“ ukázat při dalším zobrazení štítek „znovu: z minula špatně“. |
| L3 | **Hodnocení se mapuje jinak podle režimu** (klávesa 2 = „Znal jsem“ v jednoduchém, „Těžce“ v podrobném). Návyk z klávesnice se tak rozbije. | 🟢 | S | Vždy 1 = Neznal, 2 = Znal, 3/4 jen v podrobném režimu. `StudyPage.tsx` |
| L4 | Souhrn na konci relace vždy píše „Těžké: 0 · Snadno: 0“, i když je zapnuté jednoduché hodnocení. | 🟢 | S | Zobrazit jen použité kategorie. |
| L5 | **Gramatika a doplňování se neopakují.** Zůstávají v lekcích a v testech; po splnění jednotky se k nim uživatel nevrací. | 🔴 | M | Do SRS přidat „gramatické karty“ (doplň tvar / vyber správný člen). Využít generátory z `src/lib/quiz.ts`. |
| L6 | Karty jedou jen v jednom způsobu (otočit → hodnotit). Aktivní vybavování (psaní, diktát) chybí. | 🟡 | M | Dva nové typy karet: „napiš portugalsky“ (s tolerancí diakritiky, kód už v kvízech je) a „poslechni a napiš“. |
| L7 | „Pijavice“ (karty, které se pořád zapomínají) se nijak nezvýrazňují, přestože se `lapses` ukládá. | 🟡 | S | Po 4. zapomenutí ukázat vysvětlení a příklad automaticky a nabídnout „Přidat vlastní poznámku“. |
| L8 | Vysvětlení použití (ⓘ) mají zatím **286 z 754** slovíček. Zbytek jsou vesměs jednoduchá jména a čísla, ale zdvořilostní odstíny a falešní přátelé chybí. | 🟡 | M | Doplnit zbylá slovesa A2 a fráze pro situace („v restauraci“, „u lékaře“). Přidat `example` (příkladová věta s audiem) do datového typu. |

### 1.4 Lekce a gramatika

| # | Nález | Dopad | Pracnost | Návrh |
|---|---|---|---|---|
| G1 | **Vysvětlení slovíček je v lekci vždy rozbalené.** Seznam 19 slov se tak prodlouží na několik obrazovek a zahlcuje (viz screenshot lekce). | 🔴 | S | Vysvětlení **sbalit** pod tlačítko ⓘ (stejně jako na kartě); jen u frází, kde je to důležité, ponechat první řádek. `WordRow.tsx`, `WordInfo.tsx` |
| G2 | Lekce nemá žádný „konec“: slovíčka, gramatika, dialog a dole nic. Chybí tlačítko „Další lekce“ nebo „Hotovo, jdi na karty“. | 🟡 | S | Na konci lekce velká karta „Co dál?“ (karty lekce → test lekce → další lekce). `LessonPage.tsx` |
| G3 | Chybí **referenční stránka gramatiky** (tabulky, ser × estar, zájmena za slovesem). Hledání funguje jen v kartách. | 🟡 | M | Samostatná stránka „Gramatika“ generovaná z `lesson.grammar` + hledání. |
| G4 | Dialogy mají audio po řádcích, ale **nemají cvičení** (zakrýt překlad, doplnit repliku, poslech bez textu). | 🟡 | M | Přepínač „skrýt text“ a „skrýt překlad“. |
| G5 | Upozornění „Obsah zatím nezkontroloval rodilý mluvčí“ je malý šedý řádek u každé lekce. | 🟢 | S | Jednou na domovské stránce, na lekci jen drobný štítek; po revizi se skryje. |

### 1.5 Testy a kvízy

| # | Nález | Dopad | Pracnost | Návrh |
|---|---|---|---|---|
| T1 | Pravidlo „80 % odemkne další jednotku“ je pro některé uživatele bariéra, jiné to nechá bez přemýšlení přeskočit. Obě cesty jsou k dispozici, ale nejsou vysvětlené. | 🟡 | S | Po neúspěchu nabídnout „Projít chyby“ a „Zkusit znovu“ hned; po třetím neúspěchu nabídnout „Odemknout i tak“. |
| T2 | Seznam otázek není vidět po testu (jen skóre a chybná slovíčka). | 🟡 | S | Na výsledku zobrazit chyby s vysvětlením (a tlačítko „přidat do opakování“, které už dnes funguje implicitně). |
| T3 | Rychlý kvíz (10 otázek na nejslabší slovíčka) je skrytý v domovské liště a v Testech; chybí obdoba „denní výzva“ s opakováním. | 🟢 | S | Z „Dnešního plánu“ nabídnout i rychlý kvíz po dokončení karet. |

### 1.6 Mluvení a poslech

| # | Nález | Dopad | Pracnost | Návrh |
|---|---|---|---|---|
| A1 | **Audio závisí na hlasu pt-PT v zařízení.** Na Windows, Linuxu a části Androidu hlas často chybí; aplikace pak mluví jiným hlasem nebo mlčí. `VoiceWarning` jen upozorní. | 🔴 | M–L | Předgenerované audio (neurální TTS nebo nahrávky) uložené do cache service workeru; aspoň tisíc nejčastějších frází. Alternativa: kontrola hlasu při onboardingu s návodem pro platformu. |
| A2 | Rozpoznávání řeči funguje jen v Chrome/Edge a posílá audio na servery výrobce (neřešeno v UI). | 🟡 | S | Přidat jednoznačný text o soukromí před prvním použitím a degradaci na „poslechni a porovnej“, když rozpoznávání chybí. `SpeakPage.tsx` |
| A3 | Karta má jen „normální“ a „pomalé“ audio; chybí přehrání celé věty / příkladu. | 🟢 | S | Po přidání `example` k slovíčku přidat i audio příkladu. |

### 1.7 Pokrok a gamifikace

| # | Nález | Dopad | Pracnost | Návrh |
|---|---|---|---|---|
| P1 | Denní cíl se nastavuje na stránce **Pokrok**, počet nových karet na stránce **Karty**, směr/autoplay v relaci, téma v Nastavení. Stránka Nastavení neobsahuje nic z učení. | 🔴 | S | Jedno místo: Nastavení → „Učení“ (denní cíl, nové karty denně, směr karet, autoplay, způsob hodnocení). Na ostatních stránkách ponechat jen zkratky. |
| P2 | Série dní nemá „odpuštění“ (jeden vynechaný den = konec). Pro dospělého učícího se po práci je to demotivující. | 🟡 | S | Zmrazení série (1× týdně automaticky), zobrazit „série v ohrožení“. `xp.ts`, `stats.ts` |
| P3 | Odznaky a mapa jsou dobré, ale chybí **týdenní přehled** („tento týden 5 dní, 80 slov, 78 % úspěšnost“). | 🟢 | S | Karta na stránce Pokrok. |
| P4 | Žádná připomínka k opakování; PWA push potřebuje server. | 🟡 | M | Aspoň nabídnout „přidat do kalendáře“ (ICS) s denní připomínkou. |

### 1.8 Přístupnost a design

| # | Nález | Dopad | Pracnost | Návrh |
|---|---|---|---|---|
| D1 | Systematický audit WCAG AA nebyl proveden (kontrasty ve světlém/tmavém režimu, popisky tlačítek, pořadí fokusu v testech). | 🟡 | M | `axe-core` v E2E testech + ruční průchod čtečkou obrazovky. |
| D2 | Nastavení velikosti písma a zvýšeného kontrastu není. Dospělí uživatelé je často potřebují. | 🟡 | S | Přepínač v Nastavení (CSS proměnná). |
| D3 | Emoji jako ikony (🃏, ⚡, 🎭) vypadají na každém systému jinak a čtečky je čtou doslova. | 🟢 | S | `aria-hidden` je u většiny, zbytek ověřit; ke klíčovým akcím přidat jednotné SVG ikony (`Icon.tsx` už existuje). |
| D4 | Rozložení na desktopu je dobré, na tabletu (768–1024 px) se využívá jen pruh 5xl. | 🟢 | S | Dvousloupcové rozložení lekce (slovíčka vlevo, gramatika vpravo). |

### 1.9 Technika a kvalita kódu

| # | Nález | Dopad | Pracnost | Návrh |
|---|---|---|---|---|
| K1 | **Testy pokrývají jen čistou logiku** (36 testů v `src/lib` a obsahu). Stránky, tok karet, záloha v prohlížeči a offline nejsou v repozitáři testovány; ověřovaly se ručně přes Playwright mimo repo. | 🔴 | M | Přidat Playwright testy do repa (mobilní viewport): onboarding, relace karet, test jednotky, záloha a obnova, offline. Spouštět v GitHub Actions před nasazením. |
| K2 | Veškerý obsah je v jednom JS balíku (315 kB, 103 kB gzip). S B1 poroste. | 🟡 | S | Lazy-load dat po úrovních (`import()` v `content/index.ts`). |
| K3 | Texty rozhraní jsou přímo v komponentách (čeština natvrdo). Překlady a konzistentní terminologie se špatně udržují (viz „Znovu / Nevěděl jsem / Neznal jsem“). | 🟡 | M | Slovník `ui.ts` s klíči; začít u nejčastějších (hodnocení, tlačítka, chyby). |
| K4 | `UnitPage` a `LessonPage` mají vlastní styly tlačítek, stejné styly se opakují v jiných stránkách (`rounded-xl bg-brand-700 px-4 py-2.5…`). | 🟢 | S | Komponenty `<Button>` / `<LinkButton>` s variantami. |
| K5 | `StudyPage` má ~250 řádků a míchá logiku fronty, SRS zápis, klávesnici a UI. | 🟢 | M | Vytáhnout hook `useStudySession` a otestovat ho. |
| K6 | Aktualizace aplikace proběhne potichu; uživatel neví, že je nová verze (viz `IMPROVEMENTS.md`). | 🟢 | S | Toast „Nová verze – obnovit“ přes `useRegisterSW`. |
| K7 | Žádný systém hlášení chyb ani volitelné anonymní statistiky použití. | 🟢 | S | Opt-in; i bez něj tlačítko „Nahlásit chybu“ s předvyplněným e-mailem/issue. |
| K8 | Výchozí větev na GitHubu není `main` (musí se přepnout v nastavení; push už jde na obě). | 🟢 | S | Přepnout ručně v Settings → Branches. |

### 1.10 Obsah (kvalita a rozsah)

| # | Nález | Dopad | Pracnost | Návrh |
|---|---|---|---|---|
| C1 | **Všechny lekce jsou `reviewed: false`.** Texty včetně vysvětlení používání psal AI; pravděpodobně obsahují drobné chyby (zdvořilostní odstíny, regionální slovíčka, výslovnost). | 🔴 | M | Export do tabulky (id, pt, cs, literal, usage), rodilý mluvčí označí chyby, opravy do `src/content/`. Po revizi `reviewed: true` a skrýt upozornění. |
| C2 | Vysvětlení nejsou v UI označena jako „návrh“. | 🟡 | S | Dokud nejsou revidovaná, malý štítek „neověřeno“ v panelu vysvětlení. |
| C3 | Chybí **příkladové věty** u slovíček (jen u pár frází). Pro slovesa a předložky jsou nejdůležitější. | 🔴 | M–L | Přidat `example: { pt, cs }`, zobrazovat na kartě a ve seznamu, přehrávat audio. |
| C4 | A2 nemá scénáře (roleplay) pro hotel, lékárnu, telefon a pronájem. Engine je hotový. | 🟡 | M | 4–5 nových scénářů v `src/content/roleplay.ts`. |
| C5 | Test na „žádné brazilské tvary“ kontroluje jen několik slov (`brazilsk`, `você`, `ônibus`…). | 🟢 | S | Rozšířit seznam typických brazilských slov a tvarů (např. gerundium `-ndo` v průběhovém tvaru) a spustit ho i nad `usage.ts`. |

---

## 2. Co zjednodušit (odebrat nebo sloučit)

1. **Sloučit Mapu a seznam jednotek** na domovské stránce do jednoho pohledu s přepínačem. Teď mají stejný obsah dvakrát.
2. **Sloučit nastavení** učení na jedno místo (P1).
3. **Zrušit stránku Praxe** jako samostatný rozcestník a dát její tři karty na domovskou stránku nebo do „Učit se“.
4. **Seznam testů** zkrátit na „doporučený test“ + rychlý kvíz (N2).
5. **Zmenšit počet rozhodnutí** v relaci karet: směr, autoplay a zamíchat patří do Nastavení, ne nad kartu.
6. **Sjednotit slovník rozhraní**: ve všech místech stejné názvy (Neznal jsem / Znal jsem; „Kartičky“ × „Karty“; „Lekce“ × „Jednotka“).

## 3. Plán po fázích

### Fáze 1 – Rychlé úpravy (1–2 dny)
Cíl: odstranit nejviditelnější nedostatky bez velkých změn.
- G1 sbalit vysvětlení v seznamu slovíček
- U4 smazat zastaralý banner A2, U5 zkrátit toast „offline“
- L3/L4 jednotné klávesy a čistý souhrn
- G2 „Co dál?“ na konci lekce
- P1 jedno místo pro nastavení učení
- C2 štítek „neověřeno“ u vysvětlení
**Hotovo, když:** nový uživatel vidí na lekci krátký seznam; všechna nastavení najde na jednom místě; screenshoty na 390 px nemají překrytý text.

### Fáze 2 – Učební tok (týden)
- L1 režim „Poznej nové“ před SRS
- U1 onboarding (3 obrazovky) + U2 „Pokračovat“
- N1/N2 sloučení navigace (4 záložky)
- T1/T2 lepší výsledek testu
- P2 zmrazení série
**Hotovo, když:** v testu s 3 novými uživateli (ruční, 10 minut) každý dokáže bez nápovědy dokončit první lekci a vysvětlit, co znamenají tlačítka hodnocení.

### Fáze 3 – Kvalita a spolehlivost (týden)
- K1 E2E testy v CI + D1 `axe-core`
- K2 lazy-load obsahu, K6 prompt na aktualizaci
- A2 text o soukromí a degradace rozpoznávání
- C5 rozšířená kontrola PT-PT
**Hotovo, když:** pull request neprojde bez zeleného E2E; Lighthouse PWA ≥ 90 a přístupnost ≥ 95.

### Fáze 4 – Obsah a výslovnost (průběžně)
- C1 revize rodilým mluvčím (nejvyšší priorita před veřejným zveřejněním)
- C3 příkladové věty
- A1 předgenerované audio
- L5/L6 gramatické karty a psaní
- C4 scénáře A2, potom B1
**Hotovo, když:** všechny lekce A1 mají `reviewed: true` a audio funguje bez hlasu v zařízení.

## 4. Rizika a nejistoty

- **Obsah:** bez revize hrozí, že se učí drobné chyby. Doporučuji revizi před sdílením mimo okruh známých.
- **Audio:** ověřeno jen v prostředí s hlasem; chování na Windows/iOS nezkoušeno.
- **Odhady pracnosti** jsou hrubé; E2E testy a audio mohou být výrazně větší, než je uvedeno.
- **Doporučení z UX** vychází z kódu a screenshotů, ne z testování s lidmi. Před velkými změnami navigace (N1) ověřit s několika uživateli.
- **Priorita se může lišit podle cíle:** pokud je aplikace jen pro osobní použití, stačí fáze 1 a 2; pokud má mít veřejné nasazení, přidat fáze 3 a revizi obsahu.

## 5. Otevřené otázky na tebe

1. Je cílem osobní použití, nebo veřejné nasazení? (mění prioritu C1, K1, A1)
2. Mám sloučit navigaci na 4 záložky (N1), nebo ji ponechat a jen odstranit duplicity?
3. Chceš příkladové věty u všech slovíček (C3), i za cenu delší přípravy obsahu?
4. Zvolit pro audio předgenerované soubory, nebo spoléhat na hlas zařízení?
