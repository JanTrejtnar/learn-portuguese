# Nápady na zlepšení aplikace

Živý seznam možných vylepšení. Konkrétní nálezy a pořadí prací jsou v `docs/ANALYZA_A_PLAN.md`. U každé položky je **dopad** (🟢 malý · 🟡 střední · 🔴 velký) a **pracnost** (S = hodiny, M = dny, L = týdny). Pořadí v rámci sekce je přibližně podle poměru dopad / pracnost.

> **Rychlý přehled doporučeného pořadí** je na konci dokumentu.

---

## 1. Obsah a jazyková kvalita

| Nápad | Dopad | Pracnost | Poznámka |
|---|---|---|---|
| **Revize rodilým mluvčím PT-PT** všech lekcí (`reviewed: false` → `true`) | 🔴 | M | Největší riziko kvality. Návrh: exportovat lekce do tabulky, mluvčí označí chyby, opravy se promítnou do `src/content/`. Do UI jde přidat štítek „zkontrolováno“. |
| **Úroveň B1** (subjuntivo, podmiňovací způsob, trpný rod, nepřímá řeč, osobní infinitiv) | 🔴 | L | Přirozené pokračování po A2. |
| **Roleplay scénáře pro A2** (hotel, lékárna, telefonát, pronájem bytu, pracovní pohovor) | 🟡 | M | Engine už existuje (`src/content/roleplay.ts`), je to jen obsah. |
| **„Byrokracie v Portugalsku“**: NIF, *Cartão de Cidadão*, *Finanças*, *Junta de Freguesia*, zdravotní středisko, bankovní účet | 🟡 | M | Velmi praktické pro lidi, kteří se stěhují. Dá se udělat jako samostatná tematická jednotka a scénáře. |
| **Kulturní lekce**: jídlo a pití podle regionů, svátky (*Santos Populares*, Vánoce), fado, zvyky, jak se chovat u stolu | 🟡 | M | Zvyšuje motivaci a slovní zásobu v kontextu. |
| **Referenční stránka gramatiky**: tabulky sloves, clitika (kdy před / za sloveso), kontrakce předložek, *ser × estar*, *por × para* | 🟡 | M | Teď je gramatika schovaná v lekcích; samostatný přehled s vyhledáváním by se hodil na rychlé dohledání. |
| **Falešní přátelé CZ ↔ PT** a typické chyby Čechů (rod, nosovky, redukce samohlásek) | 🟡 | S | Krátké kartičky; česká specifika jsou silná stránka aplikace. |
| **Trenér časování**: napiš správný tvar slovesa (nepravidelná slovesa, perfeito × imperfeito) | 🟡 | M | Nový typ cvičení (psaní s tolerancí diakritiky už existuje v kvízech). |
| **Trenér čísel, hodin a dat** (poslech + psaní) | 🟡 | S | Generované otázky, žádný nový obsah. |
| **Čtení a poslech**: krátké texty a dialogy (graded readers) s klikacími slovy a audiem | 🔴 | L | Buduje porozumění v souvislostech. Vyžaduje obsah i audio. |
| **Přepis výslovnosti** u karet (česká transkripce nebo IPA) | 🟢 | M | Pozor na správnost; nejlépe s revizí. |
| Vlastní slovíčka a **vlastní kartičky uživatele** | 🟡 | M | Import z CSV / ruční přidání. |
| **Kontrola brazilských tvarů v CI** (stávající test rozšířit o seznam typických brazilských slov) | 🟢 | S | Hlídá pravidlo „jen PT-PT“ při přidávání obsahu. |

## 2. Metody učení

| Nápad | Dopad | Pracnost | Poznámka |
|---|---|---|---|
| **FSRS** místo zjednodušeného SM-2 | 🟡 | M | Přesnější plánování opakování, měřitelně méně zbytečných opakování. Čistá logika v `src/lib/srs.ts`, dobře testovatelná. |
| **Detekce „pijavic“ (leech)**: karty, které se pořád zapomínají → jiný způsob procvičení (mnemotechnika, věta, audio) | 🟡 | S | Data (`lapses`) už se ukládají. |
| **Fáze „Učení“ pro nová slovíčka** (představit → rozpoznat → vybavit) před zařazením do SRS | 🟡 | M | Pozvolnější start, méně frustrace než rovnou „Otočit“. |
| Doplňovací cvičení a gramatika **přímo v SRS** (ne jen v testech) | 🔴 | M | Gramatika se pak opakuje v rozestupech jako slovíčka. |
| **Psaní** místo otáčení karet (aktivní vybavování), režim diktátu na kartách | 🟡 | S | Znovupoužití komponent z kvízů. |
| **Zařazovací test** (placement) na začátku, aby šlo přeskočit známé jednotky | 🟡 | M | Teď existuje „Už to umím, odemknout“, ale chybí inteligentní doporučení. |
| **Shadowing s lepším hodnocením** (foném / přízvuk; offline Whisper přes WebAssembly) | 🔴 | L | Dnešní rozpoznávání je jen v Chrome / Edge a posílá audio na servery výrobce. Offline model by řešil soukromí i kompatibilitu. |
| **AI konverzace** (původní Krok 10), viz níže | 🔴 | M–L | Tři varianty architektury níže. |
| Týdenní a měsíční cíle, **zmrazení série** (omluva jednoho dne), denní výzva | 🟡 | S–M | Gamifikace je hotová, chybí „odpouštějící“ série. |
| **Nelineární cesta** (dovednostní strom: slovíčka / gramatika / poslech / mluvení) | 🟡 | L | Dnes je jednotka lineární. |

### Krok 10 – možnosti architektury AI konverzace

1. **Serverless proxy** (např. Cloudflare Worker) s klíčem provozovatele. Uživatel nic nenastavuje; nutné hlídat zneužití (rate limit, účty), platí provozovatel.
2. **Vlastní klíč uživatele** (BYOK): ukládá se jen v prohlížeči uživatele. Žádný backend ani náklady, ale méně pohodlné a klíč je v prohlížeči.
3. **Lokální model v prohlížeči** (WebGPU): žádné náklady a soukromé, ale zatím omezená kvalita pro portugalštinu a velký první stah.
- Společné: systémový prompt vynucuje PT-PT a úroveň A1/A2, opravy chyb česky, omezení délky odpovědi, filtr nevhodného obsahu.

## 3. UX a design

| Nápad | Dopad | Pracnost | Poznámka |
|---|---|---|---|
| **Onboarding**: cíl, úroveň, denní cíl, čas připomenutí, krátká prohlídka | 🔴 | M | Dnes uživatel vidí rovnou úvodní stránku. |
| **Hledání** ve slovíčkách (hotovo na stránce Karty; zbývá hledání v lekcích a gramatice) | 🟡 | S | |
| **Oblíbené / „těžká slova“** a poznámky ke slovíčku | 🟡 | S | |
| **Swipe gesta** u karet (doprava = dobře, doleva = znovu), přehled klávesových zkratek | 🟡 | S | |
| **Zvukové efekty, haptika, konfety** při splnění testu / série (s přepínačem) | 🟢 | S | Respektovat „omezit pohyb“ (už respektováno u animací). |
| Nastavení **velikosti písma**, font vhodný pro dyslektiky, vyšší kontrast | 🟡 | S | |
| **Další jazyky rozhraní** (angličtina, slovenština, polština) | 🟡 | M | Texty teď žijí přímo v komponentách; bude třeba je vytáhnout do slovníku. |
| **Pokračovat tam, kde jsem skončil** (poslední lekce / karta) | 🟡 | S | |
| Lepší **prázdné a chybové stavy**, offline indikátor, „zpět“ v testu | 🟢 | S | |
| **Přístupnostní audit** (WCAG AA: kontrasty v obou režimech, čtečka obrazovky, popisky formulářů) | 🔴 | M | Základy jsou hotové (fokus, `aria-*`, skip-link), chybí systematický audit. |
| Vlastní motivy (jiné než vlajkové), sezónní motivy | 🟢 | S | Díky tokenům v `src/styles.css` stačí změnit proměnné. |

## 4. Platforma a technika

| Nápad | Dopad | Pracnost | Poznámka |
|---|---|---|---|
| **Předgenerované audio** (kvalitní neurální TTS nebo nahrávky rodilých mluvčích) a jeho cache pro offline | 🔴 | M–L | Dnes audio závisí na hlasu pt-PT v zařízení (na Windows a Linuxu často chybí). Největší technické riziko pro učení výslovnosti. |
| **Synchronizace mezi zařízeními** (volitelná, šifrovaná) | 🔴 | L | Dnes pouze ruční záloha do souboru. Možnosti: vlastní backend, Supabase / Firebase, nebo přenos přes QR / sdílený soubor. |
| **Automatická záloha** (File System Access API, připomínání zálohy) | 🟡 | S | |
| **Push připomínky** (denní cíl, série) | 🟡 | M | PWA push potřebuje server; jednodušší je lokální připomínka přes plánovač v zařízení (omezeně). |
| **Balení do nativní aplikace** (Capacitor) pro App Store / Google Play | 🟡 | M | Lepší práce s úložištěm a mikrofonem na iOS. |
| **Rozdělení obsahu** (lazy-load po úrovních) a code splitting | 🟡 | S | Dnes je veškerý obsah v jednom balíku (cca 200 kB). Při rozšíření na B1 poroste. |
| **E2E testy v repozitáři** (Playwright) a v CI | 🔴 | M | Průchody testovacích scénářů (karty, kvízy, scénáře, záloha, offline) se teď spouštěly ručně mimo repozitář. |
| **Verzování schématu IndexedDB** a migrace | 🟡 | S | Připraveno částečně (verze 2). |
| **Chybová hlášení a soukromá analytika** (volitelně, opt-in; např. Plausible) | 🟢 | S | Bez sledování uživatele by se těžko zjišťovalo, co aplikace nedokáže. |
| **Nástroje pro autory obsahu**: import z tabulky, generátor doplňovacích cvičení, validace PT-PT | 🟡 | M | Zrychlí psaní B1 a revizi. |
| Aktualizace závislostí, audit (`workbox-build` hlásí zranitelnosti jen v build nástrojích) | 🟢 | S | |
| **Prompt na aktualizaci** místo tiché auto-aktualizace („Je nová verze, obnovit?“) | 🟢 | S | Teď se nová verze stáhne sama a projeví se po restartu. |

## 5. Komunita a projekt

- **Průvodce přispěvatele** (jak psát lekce, pravidla PT-PT, formát obsahu), šablony issue pro hlášení chyb v obsahu.
- **Sdílení balíčků** karet mezi uživateli (export / import `JSON`).
- Licence obsahu a závislostí, uvedení zdrojů.
- Veřejná roadmapa a changelog.

## 6. Známá omezení současné verze

- Obsah (A1, A2) **nebyl zkontrolován rodilým mluvčím**.
- **Audio** závisí na hlase pt-PT v zařízení; bez něj se audio vypne (záměrně se nepřehrává jiná varianta).
- **Rozpoznávání řeči** funguje jen v Chrome / Edge a posílá audio ke zpracování na servery výrobce.
- **Pokrok je jen v prohlížeči** daného zařízení (zálohovat lze ručně).
- Žádná AI konverzace (Krok 10 vynechán).
- Některé části rozhraní používají emoji (ikony navigace jsou už vektorové).
- E2E testy nejsou součástí repozitáře (jen unit testy logiky a obsahu).

---

## Doporučené pořadí (nejlepší poměr dopadu a pracnosti)

1. **Revize rodilým mluvčím** (kvalita je základ).
2. **Onboarding** a „pokračovat, kde jsem skončil“.
3. **E2E testy do repozitáře a CI**.
4. **Předgenerované audio** pro slovíčka a věty (nebo aspoň kontrola dostupnosti hlasu při startu).
5. **Gramatika a cloze přímo v SRS** + detekce pijavic.
6. **Zmrazení série** a týdenní cíle.
7. **Roleplay scénáře pro A2** a téma „byrokracie v Portugalsku“.
8. **FSRS**.
9. **Synchronizace / automatická záloha**.
10. **B1** a čtení / poslech.
