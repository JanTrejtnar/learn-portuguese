# Analýza aplikace a plán zlepšení (UX, kvalita, funkčnost)

Stav k 16. 11. 2026. Doplňuje `docs/IMPROVEMENTS.md` (ten je široký katalog nápadů). Tento dokument je užší: vychází z toho, co **je dnes v aplikaci**, a navrhuje konkrétní opravy a zjednodušení s pořadím.

**Jak vznikl:** přečetl jsem kód stránek a knihoven (`src/pages`, `src/components`, `src/lib`), prošel obrazovky na mobilu (390 × 844) a spustil testy a build. **Co jsem neověřil:** chování na reálném telefonu (audio, mikrofon, iOS Safari), použití skutečnými uživateli a správnost obsahu rodilým mluvčím. Tvrzení o UX jsou tedy úsudek z kódu a screenshotů, ne měření.

## Stav realizace

**Hotovo (fáze 1 a část fáze 2):** U1 onboarding (`/welcome`), U3 „Otevřít lekci“ pro nového uživatele, U4 smazaný banner, U5 offline toast jen jednou, G1 sbalitelné vysvětlení (ⓘ) v seznamech, G2 „Co dál?“ na konci lekce, C2 štítek „neověřeno“, L1 krok „Nové slovíčko“ před zkouškou, L4 čistý souhrn, P1 nastavení učení na jednom místě (Nastavení → Učení).

**Také hotovo:** K1 E2E testy (`npm run test:e2e`, 7 scénářů, spouští se v CI po buildu).

**Také hotovo (rozhodnutí o navigaci):** N1 jsem neprovedl jako sloučení na čtyři záložky. Mapa a seznam jednotek jsou nyní dva pohledy přepínané tlačítky Seznam / Mapa pod záložkou „Lekce“ (záložek je 5, mapu uživatel oceňuje, tak zůstala). N2: testy jednotlivých lekcí jsou sbalené. P2: jeden vynechaný den se v sérii odpustí (nejvýš jednou za 7 dní) a Domů ukáže „Série je v ohrožení“. T2 už existovalo (výpis chyb po testu).

**Také hotovo (mince, obchod, avatar – kap. 6, M1–M3):** zůstatek mincí se odvozuje z pokroku (`src/lib/coins.ts`), obchod `/shop` (Pokrok → Obchod) prodává pozadí, oblečení, pokrývky hlavy, doplňky, barevné motivy a zmrazení série; avatar je SVG z vrstev (`src/components/Avatar.tsx`, 24 položek, 5 odměn za odznak/úroveň zdarma, základní vzhled postavy zdarma). Stav je v `localStorage` (`ap:shop`) a je součástí zálohy. Rozhodnutí: mince nejsou za kliknutí, takže strop nebyl potřeba; zůstatek se nikdy nezobrazí záporný; zmrazení se použije samo, jen když běžné odpuštění nestačí.

**Také hotovo:** T1 (po třech neúspěšných pokusech o test jednotky nabídka odemknout další jednotku, test zůstává k opakování), P1 dokončeno (Pokrok už jen odkazuje na Nastavení; na stránce Karty zůstala zkratka „nových karet denně“). K2 (lazy-load obsahu) jsem neřešil: celá aplikace má po sestavení asi 480 KB, takže přínos by byl malý.

**Také hotovo (L5, L6 – aktivní vybavování):**
- *Analýza:* pasivní otáčení karet nestačí; nejlépe pomáhá vybavit si slovo z hlavy. Řešení nesmí přidat další úložiště ani rozbít SRS, proto se používá stejný stav karty a stejné hodnocení.
- *L6 Psaní a diktát při opakování:* u slovíček, která už mají ≥ 2 opakování a jsou krátká, se místo otočení karty někdy zobrazí „napiš portugalsky“ nebo „napiš, co slyšíš“ (`src/lib/recall.ts`, `StudyPage.tsx`). Výběr je stabilní v rámci dne, podíl řídí nastavení „Psaní při opakování“ (vypnuto / někdy ≈ 1/3 / často ≈ 70 %, výchozí „někdy“). Správně nebo jen s chybou v diakritice = „Znal jsem“, jinak „Neznal jsem“. Tlačítko „Dnes bez psaní“ vypne psaní pro aktuální sezení.
- *L5 Gramatika:* 268 vět s mezerou z 51 lekcí se opakuje plánem SRS na stránce `/grammar` (Karty → Gramatika: doplňování vět). Id karet má předponu `cl:`, takže se nepočítají mezi slovíčka v odznacích; každé sezení přidá až 6 nových vět.
- Testy: 51 jednotkových, 11 E2E.

**Také hotovo (drobnosti):** L7 (u slovíčka zapomenutého ≥ 4× se po otočení ukáže „Těžké slovíčko“ s tipem a vysvětlením; vlastní poznámky jsem neřešil, potřebovaly by nové úložiště), G3 (stránka Praxe → Přehled gramatiky s hledáním, `/gramatika`), N3 („Už to umím, odemknout“ přímo u první zamčené jednotky na úvodní stránce), P3 (karta „Posledních 7 dní“ na stránce Pokrok).

**Zbývá:** K2 lazy-load, C1 (revize rodilým mluvčím), A1 (vlastní audio, odloženo), úroveň B1 a vstupní tutoriál (viz plány níže). K6 neřeším: aplikace se aktualizuje automaticky (`autoUpdate`).

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

## 6. Návrh: mince a avatar (ekonomika odměn)

Nápad od uživatele: za každý odemčený odznak dostat určitý počet mincí a mince utrácet; jedna z variant je vlastní avatar, který se postupně vylepšuje. Aplikace dnes má 19 odznaků, XP, úrovně (Turista … Mestre) a denní cíl, ale nemá nic, na co by se odměna dala „použít“.

### 6.1 Zdroje mincí

| Zdroj | Mince | Poznámka |
|---|---|---|
| Odznak (běžný / vzácný / velký) | 10 / 25 / 50 | Hodnota je v definici odznaku; zpětně se dopočítá z už získaných. |
| Splněný denní cíl | 5 | Ne za každé opakování, jinak se vyplatí „klikat“. |
| Úroveň navíc | 20 | Při přechodu na vyšší úroveň. |
| Test jednotky poprvé | 15 | Opakované splnění nic. |
| Týdenní série (7 dní) | 15 | Podpora pravidelnosti. |

Zásady: mince se **nepočítají z počtu kliknutí**, ale z opravdového pokroku. Stav mincí se odvozuje (zisky − výdaje), aby šel pokrok zálohovat a nešlo ho rozbít. Denní strop (např. 30) brání „farmení“.

### 6.2 Na co mince utrácet (varianty)

1. **Avatar a jeho vylepšování** (hlavní návrh, viz 6.3).
2. **Zmrazení série** – koupit si další odpuštění vynechaného dne nad rámec 1× týdně (cena např. 30). Přímo podporuje učení a dává mincím smysl.
3. **Motivy a vzhled aplikace** – barevné motivy (Azulejo, Atlantik, Pastel de nata), pozadí karet, styl mapy.
4. **Tipy a nápovědy** – v testech odkrýt první písmeno nebo vyřadit dvě špatné možnosti (jen s malou cenou, ať se nepokazí učení).
5. **Bonusový obsah** – odemykání „kulturních kapitol“: krátké příběhy, gastro slovník, fráze na cesty, lisabonský slang; odemyká se mincemi místo hotového volného přístupu.
6. **Sbírka** – kolekce karet z Portugalska (azulejo, kohout z Barcela, tramvaj 28, pastel de nata…); za mince balíček, uvnitř náhodný kousek s krátkou zajímavostí. Pozor na „loot box“ pocit: bez duplicit, vždy něco nového.
7. **Dárek nebo výzva** – vyzvat známého k týdennímu souboji o XP, vítěz dostane mince (vyžaduje server, až v pozdější fázi).
8. **Dobrovolné „charitativní“ utrácení** – symbolický dar (strom, projekt); bez skutečných plateb, jen příběh. Nízká priorita.

**Doporučení:** začít variantami 1 + 2 + 3. Jsou malé, nepotřebují server a nemění učební tok. Varianty 4 a 6 přidat později, až bude jasné, jak se mince chovají (inflace, nuda).

### 6.3 Avatar (podrobněji)

- **Základ:** postavička v SVG vykreslená z vrstev (tělo, obličej, vlasy, oblečení, doplněk, pozadí). Žádné obrázky navíc, vejde se do offline cache.
- **Vývoj podle úrovně:** každá úroveň (Turista → Mestre) odemkne jednu „kategorii“ nebo vyšší stupeň vybavení: Turista s mapou a kšiltovkou → Lisboeta s tramvají 28 → Mestre s vlastním azulejo pláštěm.
- **Obchod:** položky stojí mince (např. 20–200), některé jsou vázané na úroveň nebo odznak (nejde je koupit, jen získat).
- **Sloty:** pokrývka hlavy, oblečení, doplněk (kytara, kohout, káva), pozadí (Lisabon, Porto, Algarve), mazlíček.
- **Zobrazení:** malý avatar v hlavičce a na stránce Domů; velký v nové záložce/podstránce „Můj avatar“ pod Pokrok.
- **Emoce:** avatar reaguje na splněný cíl (jásá), na ohroženou sérii (starostlivý).
- **Ukládání:** `avatar: { owned: string[], equipped: Record<slot,string> }` v IndexedDB vedle pokroku; zahrnout do zálohy.

### 6.4 Rizika a pojistky

- **Vnější motivace potlačí vnitřní:** mince nesmí být důvod učit se „k odznaku“. Proto odměny za skutečný pokrok, ne za čas v aplikaci.
- **Inflace a nuda:** jakmile je vše koupeno, mince nemají smysl. Proto průběžně přidávat položky a mít „drahé“ cíle.
- **Rozsah:** vykreslování avataru a obchod je větší práce (návrh grafiky, nové uložení, UI). Kreslení lze zjednodušit na emoji/SVG sady.
- **Spravedlnost:** zpětně započítat odznaky už získané, ať nikdo nezačíná „od nuly“.
- **Žádné reálné peníze.** Mince jsou jen herní měna.

### 6.5 Postup (návrh fází)

1. **M1 – ekonomika:** mince u odznaků, denní cíl, úroveň; zobrazení zůstatku, historie zisků; testy odvození zůstatku a stropu.
2. **M2 – obchod:** stránka „Obchod“ s několika položkami (zmrazení série, 3 motivy); nákup a ověření zůstatku.
3. **M3 – avatar:** SVG vrstvy, 15–20 položek, správa vybavení, zobrazení na Domů.
4. **M4 – rozšíření:** sbírka, bonusové kapitoly, nápovědy v testech podle zkušeností.

Odhad: M1 S, M2 M, M3 L, M4 podle výběru. Navrhuji začít M1 a M2, pak se rozhodnout o avataru podle toho, jak mince fungují.

### 6.6 Otázky na tebe

1. Má být avatar **hlavní** cíl mincí, nebo jen jedna z možností (doporučuji jednu z několika)?
2. Jaký styl postavičky: realistický, kreslený, nebo jednoduchý (emoji/ikony)? Ovlivňuje to pracnost víc než kód.
3. Mají být některé věci jen **k získání** (ne ke koupi), např. za dokončení A1/A2?
4. Chceš v budoucnu srovnání s ostatními (žebříček, výzvy)? To by vyžadovalo server.

## Zjednodušení po prvním testování (UX úklid)

- Název aplikace: **Portuglove**.
- Navigace zredukována na 3 záložky: Lekce · Procvičit (karty, kvíz, gramatika, scénáře, mluvení, páry; testy jsou odkaz dole) · Pokrok. Tmavý režim jen v Nastavení.
- Karty: bez intervalů „za chvíli / zítra“, jen „Neznal jsem / Znal jsem“; bez popisků kláves; bez přepínačů směru, autoplaye a míchání na stránce (jen v Nastavení); otočení karty nepouští audio znovu; prázdný balíček nabízí „Procvičit znovu“.
- Audio: pomalé přehrávání je výrazně pomalejší (0,35×), varianty „divertido / divertida“ se čtou s pauzou.
- Kvíz: rozdíl jen v interpunkci („Olá!“ × „Olá,“) se nepovažuje za chybu a nevzniká jako past. Poslech lze přeskočit („Nemohu poslouchat“), u mluvení „Teď nemohu mluvit“.
- Upozornění: malé nenápadné bubliny dole, jen odznak, denní cíl a zmrazení.
- Šipka zpět místo drobečkové navigace. Zpráva o neověření rodilým mluvčím se uživateli nezobrazuje.
- Dokončení karet nebo úspěšného testu: konfety a krátký zvuk (jde vypnout v Nastavení).

## Další dávka (po UX úklidu)

- **C3 příkladové věty:** nový soubor `src/content/examples.ts` (ID slovíčka → věta PT-PT + překlad), připojuje se přes `w()`. Pokryto 527 z 754 slovíček; zbylé jsou fráze a citoslovce, které samy tvoří větu. Čeká na revizi rodilým mluvčím.
- **C4 scénáře:** přibyly Check-in v hotelu (A2.3), Na farmácia (A2.4), Pozvání po telefonu (A2.5), Pronájem bytu a Pracovní pohovor (A2.7).
- **C5 kontrola PT-PT:** jeden test prochází obsah, scénáře, páry, vysvětlení, příklady i pohlednice a hledá typická brazilská slova a gerundium po „estar“.
- **D1 přístupnost:** `axe-core` v E2E (WCAG 2 A/AA, 16 stránek, světlý i tmavý režim). Opraveno: kontrast šedého textu, zamčené karty a odznaky bez průhlednosti, vnořené ovládací prvky na kartě.
- **M4 sbírka:** stránka „Sbírka pohlednic“ (z Pokroku). Za splněný test jednotky se odemkne pohlednice s městem, zajímavostí a větou s audiem (`src/content/postcards.ts`, bez ukládání, odvozeno z výsledků testů). Role „bonusových kapitol“ je tím naplněna; nápovědy v testech zatím ne.
- **Nezařazeno:** vlastní nahrané audio (A1), revize rodilým mluvčím (C1).

## Soustředěný režim cvičení a další úpravy (UX)
- Cvičení (karty, kvíz, gramatika, scénáře, páry, mluvení) běží bez hlavní navigace a záhlaví: jen křížek s potvrzením „Opravdu chceš odejít?“ a pruh postupu.
- Hlavní akce (Zkontrolovat, Další, hodnocení karty) i zpětná vazba jsou ve spodní liště (`BottomBar`).
- Poslech a diktát čtou jen jednu variantu („obrigado“, ne „obrigado / obrigada“); po poslechu se ukáže český překlad.
- Skládání vět: slova bez interpunkce a bez velkého prvního písmene.
- „Test jednotky“ → „Dokončit jednotku“; po dokončení nabídka prokliku na nově odemčenou jednotku.
- Zvuky se renderují do WAV a hrají přes `<audio>` (funguje i na iPhonu s vypnutým zvonkem).
- Mapa na jednu obrazovku s přesnějším obrysem; ikona ozubeného kola pro Nastavení.

## Hotovo: úroveň B1 (první verze, obsah čeká na revizi)

**Rozhodnutí o pořadí:** B1 se připravuje jako návrh a **nevydává se, dokud uživatel neprojde obsah A1+A2** (viz „Rizika“). Důvod: veškerý text je zatím psaný AI a čeká na revizi rodilým mluvčím. Další úroveň by nasypala další neověřený obsah. Technicky ale jde B1 připravit tak, aby po schválení stačilo přepnout příznak.

### Rozsah
- 8 jednotek × 3 lekce (shodná struktura jako A2), cca 40 slovíček/frází na lekci, tedy zhruba 950 nových položek. Každá lekce: slovíčka s příkladem, gramatický blok, dialog, věty s mezerou (cloze), scénář k jednotce.
- Striktně **PT-PT**. Testy zakazující brazilské tvary platí i pro B1 (v textech B1 se navíc hlídá „a + infinitivo“ místo gerundia: *estou a comer*, ne *estou comendo*).
- Každý nový obsah má `reviewed: false` (štítek „neověřeno“), dokud ho nepotvrdí rodilý mluvčí.

### Osnova jednotek (návrh, k úpravě)
| Jednotka | Město na mapě | Téma | Hlavní gramatika |
|---|---|---|---|
| B1.1 | Viana do Castelo | Vyprávění a vzpomínky | pretérito imperfeito × perfeito, mais-que-perfeito |
| B1.2 | Bragança | Tradice, svátky, počasí a příroda | konjuntiv přítomný po „espero que“, „talvez“, „é preciso que“ |
| B1.3 | Nazaré | Plány, sny, hypotézy | futuro, condicional, „se“ + imperfeito |
| B1.4 | Castelo Branco | Práce, kariéra, školství | infinitivo pessoal (typicky PT-PT), vztažné věty (*que, quem, onde*) |
| B1.5 | Peniche | Zdraví, problémy na cestách, reklamace | zájmena (clitics): pořadí a poloha, „-lo/-la“, „o, a, lhe“ |
| B1.6 | Funchal (Madeira) | Cestování, ubytování, doporučení | imperativ, zdvořilé prosby a rady |
| B1.7 | Ponta Delgada (Azory) | Média, technologie, názory | trpný rod, nepřímá řeč, souvětí s „embora“, „apesar de“ |
| B1.8 | Beja | Občanství, úřady, společnost | konjuntiv imperfektu a budoucí, souslednost časů |

### Co se musí v aplikaci udělat
1. **Typy a obsah:** `Level = 'A1' | 'A2' | 'B1'`, složka `src/content/b1/`, registrace v `content/index.ts`, `unitCode` (B1.1…), titulky a podtitulky.
2. **Mapa:** třetí záložka B1. Madeira a Azory jako dva vložené „ostrovy“ v rohu mapy (inset), aby se pevninské Portugalsko nezmenšovalo. Souřadnice a `NUDGE` pro nová města.
3. **Sbírka pohlednic:** 8 nových pohlednic (zajímavost + věta v PT-PT), sekce B1 ve sbírce.
4. **Odznaky a mince:** odznak „B1 Completo“ (50 mincí), nový odznak za 1000 slovíček; vázané odměny v obchodě (`b1-done`).
5. **Odemykání:** B1 se odemkne dokončením A2 nebo přes volbu úrovně v úvodním tutoriálu (viz dále).
6. **Testy:** jednotkové testy struktury obsahu (každé slovo má id, B1 nemá zakázané tvary), rozšíření E2E (mapa B1, odemčení).
7. **Odhad:** infrastruktura 0,5 dne; obsah 8 jednotek ≈ 8 samostatných dávek (jedna jednotka ≈ 1 dávka se samokontrolou PT-PT).

### Rizika
- **Kvalita obsahu:** B1 gramatika (konjuntiv, infinitivo pessoal, clitics) je nejnáchylnější na chyby. Proto je ke každé lekci nutná revize rodilým mluvčím před označením „ověřeno“.
- **Velikost aplikace:** ~950 položek navíc zvětší balíček; pokud přesáhne ≈ 1 MB, vrátit se k lazy-loadu obsahu po úrovních (K2).
- **Mapa:** ostrovy mimo pevninu vyžadují úpravu rozložení; ověřit na mobilu.

### Otevřené otázky na uživatele
1. Souhlasí osnova a města? Chceš jiné téma nebo pořadí?
2. Má se B1 vydat hned (s příznakem „neověřeno“), nebo až po revizi A1+A2?
3. Zahrnout Madeiru a Azory na mapě (ostrovy), nebo zůstat jen na pevnině?

## Hotovo: vstupní tutoriál a výběr úrovně

Dnes existuje 3krokový úvod (`/welcome`: jak se učíme, denní cíl, kde začít). Navrhuje se ho rozšířit tak, aby vysvětlil celou aplikaci a umožnil zkušenějším uživatelům přeskočit začátek.

### Obsah tutoriálu (krátký, 5 obrazovek, každou jde přeskočit)
1. **Vítej:** co se naučíš (evropská portugalština, česky), jak dlouho to zabere denně.
2. **Jak fungují lekce:** jednotka → lekce → slovíčka, gramatika, dialog; mapa a seznam; „Dokončit jednotku“ (test, hranice `PASS_RATIO`) odemkne další jednotku a dá pohlednici.
3. **Procvičování:** kartičky s opakováním (SRS), kvízy, scénáře, mluvení; denní cíl a XP.
4. **Odměny:** mince (za co se získávají), obchod, avatar, pohlednice, série (a zmrazení).
5. **Kde začít (výběr úrovně):**
   - **Úplný začátečník:** začne se od A1.1, nic se nepřeskakuje.
   - **Něco už umím (A1):** nabídne se krátký *zařazovací test* (cca 12 otázek ze slovíček A1); při ≥ 80 % se jednotky A1 označí jako přeskočené a začíná se od A2.
   - **Pokročilejší (A2) / B1 (až bude):** stejný princip pro vyšší úroveň.
   - Možnost „Přeskočit bez testu a jen odemknout vše“ není, aby se nerozbil postup; místo toho jde kdykoli použít „Už to umím“ u konkrétní jednotky.

### Pravidla přeskočení
- Přeskočené jednotky se uloží jako `skipped: true` (stejný mechanismus jako dnes „Už to umím“). Nedávají hvězdy, mince ani pohlednice (ty se dají získat později, když je uživatel splní).
- Slovíčka přeskočených jednotek se **nepřidávají** do karet; kdo chce, najde je v lekcích.
- Tutoriál lze otevřít znovu z Nastavení („Zobrazit úvodního průvodce“) a výběr úrovně lze změnit.

### Aby tutoriál nezastaral (závazné pravidlo)
- Všechny číselné údaje a pravidla v tutoriálu se **berou z konstant v kódu** (`PASS_RATIO`, hodnoty mincí `COINS_PER_*`, denní cíle…), ne z ručně psaných čísel.
- Texty jsou na jednom místě (`src/content/tutorial.ts`), aby se při změně aplikace daly snadno najít a upravit.
- Jednotkový test hlídá, že tutoriál zmiňuje aktuální hodnoty z konstant; E2E test projde tutoriálem.
- Pravidlo je zapsáno v `CLAUDE.md`: při každé změně chování aplikace (lekce, odměny, odemykání, navigace) je součástí práce kontrola a úprava tutoriálu.

### Postup
1. Přepsat `WelcomePage` na krokový průvodce nad `content/tutorial.ts`.
2. Zařazovací test (využije generátor kvízů z `lib/quiz.ts`).
3. Uložení volby úrovně a přeskočených jednotek; testy.
4. Odkaz v Nastavení; E2E; aktualizace tohoto plánu.

## Hotovo: příkladové věty a nápovědy v testech

- **Příkladové věty:** všech 227 frází, číslovek a citoslovců, které je dosud neměly, dostalo příklad (`src/content/examples.ts`). Dnes má příklad každé z 754 slovíček. Věty jsou krátké, v PT-PT a čekají na revizi rodilým mluvčím.
- **Nápovědy v testech (M4):** v kvízech a testech jednotek stojí nápověda `HINT_PRICE` (3) mince; v kartičkách a gramatice nejsou. Podle typu otázky: *výběr* vyřadí dvě špatné možnosti, *psaní* odkryje první písmeno a délku slov, *skládání věty* prozradí první slovo. Odpověď s nápovědou se počítá správně, ale slovíčko se ještě vrátí do opakování (stejně jako při chybě), aby nápověda neobešla učení. Cena se zapisuje do stavu obchodu (`hintsBought`), takže zůstatek zůstává odvozený a nikdy záporný. Pokud je zůstatek menší než cena, tlačítko je vypnuté.
- Mapa a tutoriál musí zmínit nápovědy, až bude tutoriál implementován (kapitola o odměnách).

- **Tutoriál implementován:** `/welcome` je 5krokový průvodce (lekce, procvičování, odměny, denní cíl, výběr úrovně). Texty a čísla jsou v `src/content/tutorial.ts` (hodnoty z konstant `PASS_RATIO`, `COINS_PER_*`, `HINT_PRICE`, `FREEZE_PRICE`, `MAX_FREEZES`), hlídá je `tests/tutorial.test.mts`. Odkaz „Zobrazit úvodního průvodce“ je v Nastavení.
- **Zařazovací test:** trasa `/quiz/placement-a1` a `/quiz/placement-a2` (12 otázek, bez nápověd). Při splnění `PASS_RATIO` se jednotky A1 (u A2 i A2) uloží jako `skipped`. Žádné XP, mince, hvězdy ani pohlednice. Pohlednice ve sbírce se počítají jen za skutečně splněný test.
- Nápovědy v testech jsou v tutoriálu zmíněny (kapitola Procvičování).

## Hotovo: úroveň B1

- **Obsah:** 8 jednotek B1.1–B1.8 (Viana do Castelo, Bragança, Nazaré, Castelo Branco, Peniche, Funchal, Ponta Delgada, Beja), každá 3 lekce se slovíčky a příklady, gramatikou, cvičeními a dialogem. Celkem ≈ 330 položek (stejná hustota jako A2; původní odhad 950 byl příliš vysoký). Gramatika: imperfeito/perfeito/mais-que-perfeito, conjuntivo presente, futuro a condicional, infinitivo pessoal a vztažné věty, zájmena (clitics), imperativ, trpný rod a nepřímá řeč, conjuntivo imperfeito a budoucí. Soubory `src/content/b1/`.
- **Mapa:** třetí záložka B1. Madeira a Azory jsou vložené ostrůvky v oceánu vlevo od pevniny (`City.inset`), cesta mezi nimi vede po moři.
- **Pohlednice:** 8 nových. **Odznak** „B1 Completo“ (50 mincí) a odměna v obchodě (Pastýřská vesta). **Scénáře:** Reklamace v obchodě (B1.5) a Rezervace pokoje (B1.6).
- **Odemykání:** B1.1 se odemkne dokončením A2.8. Volba „Umím docela dost (A2)“ v průvodci přeskočí A1 i A2 a začíná na B1.
- **Neověřeno:** veškerý obsah B1 je `reviewed: false` a čeká na rodilého mluvčího, zvlášť gramatika (conjuntivo, infinitivo pessoal, zájmena).

## Hotovo: Fáze A (veřejná příprava) a pilot vedené relace

Rozhodnutí z `docs/ANALYZA_DUOLINGO_A_PLAN_2.md`: aplikace je zatím osobní, ale má být připravená na veřejné nasazení; rodilý mluvčí nebude dlouho k dispozici; vedená relace začíná jako pilot (varianta B) vedle stávajících tlačítek.

- **Ochrana dat (N3):** při startu se žádá `navigator.storage.persist()`. Úvodní stránka po `BACKUP_EVERY_DAYS` (14) dnech bez zálohy (a po aspoň 3 dnech aktivity) nabídne stažení zálohy, jde odložit o 7 dní. Nastavení ukazuje datum poslední zálohy. Logika: `src/lib/backupReminder.ts`, stažení souboru `src/lib/backupFile.ts`.
- **Připomínka (N4):** Nastavení → Denní připomínka stáhne `.ics` s denním opakováním (`src/lib/reminder.ts`). Bez serveru nejde poslat upozornění samo.
- **Veřejná důvěra:** stránka `/about` (O aplikaci a soukromí): neověřený obsah, co se ukládá, mikrofon a soukromí, odkaz „nahlásit chybu“ (`src/lib/config.ts`; funguje jen u veřejného repozitáře). Na úvodní stránce je drobná poznámka a na stránce Mluvení věta o rozpoznávání řeči.
- **Velikost (N9):** build se rozdělil na chunk aplikace (184 kB) a chunk obsahu (374 kB), varování o 500 kB zmizelo. Celkový objem se nezměnil; skutečné lazy-loadování po úrovních nebylo provedeno (obsah se čte synchronně v celé aplikaci).
- **Revize obsahu (N10):** `npm run export:review [-- soubor.csv]` vyexportuje slovíčka, gramatiku, dialogy a doplňování (≈ 1 700 řádků) se sloupci „oprava“ a „poznámka revizora“.
- **Vedená relace (N1, pilot):** na stránce lekce tlačítko „Projít lekci“ (`/learn/:id`). Dávka `LEARN_BATCH` (6) nových slov: představení (PT, CZ, audio, příklad) → `LEARN_QUESTIONS` (12) cvičení → slova vstoupí do kartiček (zpackaná „znovu“, ostatní interval 1 den), XP jako u kvízu. Poté „Další slova“ nebo test lekce. Implementace je režim `learn` v `QuizPage` (`src/lib/learn.ts`, `src/components/LearnIntro.tsx`).
- **Tutoriál:** doplněny položky „Projít lekci“ a „Záloha pokroku“; test hlídá hodnoty `LEARN_BATCH` a `BACKUP_EVERY_DAYS`.
- **Zbývá z plánu:** cvičení nad dialogy (N2), rozhodnutí, zda se „Projít lekci“ stane hlavní cestou na úvodní stránce (po vyzkoušení), minikurz výslovnosti (N6), předgenerované audio (N11), licence a doména.

## Hotovo: rozhodnutí z 2. kola (úvodní stránka, dialogy, výslovnost, licence, mikrofon)

- **Hlavní cesta:** karta „Dnešní plán“ vede tlačítkem „Pokračovat“ do další lekce (`nextLearnTarget` v `src/lib/learn.ts`: první odemčená nesplněná jednotka, první lekce s nenaučenými slovy; po probrání všech slov „Dokončit jednotku“). Opakování karet je vedlejší tlačítko „Opakovat (N)“.
- **Dialogy (N2):** poslední dávka lekce končí `DIALOGUE_QUESTIONS` (4) cvičeními nad dialogem: „Co odpovíš?“ (výběr repliky) a poslech řádku s výběrem českého významu (`generateDialogueQuestions` v `src/lib/quiz.ts`). Nemění karty.
- **Výslovnost a pasti (N6):** stránka `/vyslovnost` (Procvičit → Výslovnost a pasti): 7 témat výslovnosti PT-PT pro Čechy a 11 falešných přátel (`src/content/pronunciation.ts`). Neověřeno rodilým mluvčím; český přepis je jen přibližný.
- **Licence:** kód MIT (`LICENSE`), obsah CC BY-NC-SA 4.0 (`LICENSE-CONTENT.md`), zmíněno na stránce O aplikaci.
- **Mikrofon schovaný:** příznak `SPEAKING_ENABLED = false` v `src/lib/config.ts` skryje Mluvení v Procvičit a v tutoriálu, trasa `/speak` vrací „nenalezeno“, O aplikaci říká, že se mikrofon nepoužívá. Kód zůstal; zapnutí = změna příznaku a kontrola soukromí a tutoriálu.
- **Křížová kontrola A1 (bez rodilého mluvčího):** čtyři nezávislé průchody jiným modelem, výstup `docs/revize/A1-*.md` (celkem 86 nálezů, z toho 18 „chyb“). Nálezy se zatím **neuplatnily**: jsou to návrhy AI a potřebují lidské rozhodnutí.
