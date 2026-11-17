# Analýza UI (listopad 2026)

Podklad: snímky mobilu (390×844, světlý) a desktopu (1280×800, tmavý) pro Domů, Mapu, Lekci, Představení slov, Procvičit, Pokrok a Nastavení.

## Co funguje
- Čistá, konzistentní vizuální identita (zelená/červená/žlutá z vlajky), tmavý režim, spodní navigace na mobilu a postranní panel na desktopu.
- Jedna hlavní akce na domovské stránce („Pokračovat“), cvičení bez navigace a s akcí dole.
- Přístupnost kontrolovaná axe, velké cíle pro dotyk.

## Nálezy a návrhy (podle dopadu)
1. **Domů: dvě konkurující výzvy.** Žlutá „Pokračovat“ a červené „▶ další krok“ na kartě jednotky dělají totéž. Červená barva navíc připomíná chybu. Návrh: aktuální jednotku zvýraznit zeleným okrajem/štítkem „Tady jsi“ a tlačítko na kartě odstranit.
2. **Domů: shora příliš mnoho vrstev.** Pozdrav, karta úrovně, karta plánu, přepínač Seznam/Mapa, teprve potom lekce. Návrh: sloučit pozdrav a úroveň do jedné řádky, přepínač přesunout do záhlaví sekce.
3. **Kruh „0“ bez popisku.** Není jasné, že jde o denní cíl. Návrh: popisek „dnes“ nebo „0/40 XP“ uvnitř a odstranit duplicitu textu vedle.
4. **Stránka lekce: 4 tlačítka se zalamují do dvou řad.** Primární „Projít lekci“ je dobře, ale „Karty“, „Test lekce“ a „Další →“ mají stejnou váhu a „Další →“ je nejasné. Návrh: jedna primární akce plná šířka, ostatní jako sekundární řada nebo menu; „Další →“ přejmenovat na „Další lekce“.
5. **Seznam slovíček je hustý.** Každé slovo má dvě tlačítka zvuku, žlutě orámované ⓘ a poznámku. Návrh: jedno tlačítko zvuku u slova, příklad jen po rozbalení, jemnější ⓘ.
6. **Představení slov: prázdná spodní polovina.** Karta je nahoře, zbytek obrazovky prázdný. Návrh: slovo větší, karta vertikálně vystředěná, překlad výraznější, případně barevné rozlišení slovního druhu.
7. **Procvičit: sedm stejně vážných položek.** Jediné zvýraznění má „Karty na dnes“. Návrh: seskupit (Opakování / Gramatika / Mluvená praxe / Výslovnost), zobrazit počty (např. „Karty · 12“) a skrýt nepoužité.
8. **Nastavení: dlouhé a s osamělou volbou na druhém řádku.** Segmentované volby se zalamují nerovnoměrně. Návrh: mřížka stejných sloupců, sekce zabalit do rozbalovacích celků nebo záložek.
9. **Mapa na mobilu: drobné popisky a zámky.** Města jsou malá a popisky málo čitelné; hlavička s „0/8, 0/24“ nemá vysvětlení. Návrh: větší popisky (min. 12 px), legenda ikon, přepínač Seznam/Mapa sjednotit (ikona vedle textu).
10. **Ikony: emoji vs. čárové ikony.** Navigace používá čárové ikony, Procvičit a tlačítka emoji, jejichž vzhled se liší podle zařízení. Návrh: jednotná sada SVG ikon pro hlavní prvky.
11. **Pokrok: opakuje kartu úrovně z Domů a má prázdné stavy „–“.** Návrh: pro nového uživatele ukázat motivační prázdný stav místo nul.
12. **Desktop: obsah vlevo v úzkém sloupci.** Vpravo zůstává prázdno; mapa a lekce by využily dvousloupcové rozložení (např. slovíčka vlevo, tipy/gramatika vpravo).
13. **Drobnosti:** popisky spodní navigace 11 px; zamčené karty v tmavém režimu mají nízký kontrast (pozor na WCAG pro text); chybí animace přechodů mezi obrazovkami cvičení.

## Doporučené pořadí
1) body 1–3 a 4 (rychlé, velký vliv), 2) 5–7 a 8, 3) 9–10, 4) 11–13.

## Hotovo (zapracováno všech 13 bodů)
- Domů: aktuální jednotka zeleně se štítkem „Tady jsi“ (bez druhého tlačítka), kompaktní pozdrav, kruh denního cíle s popiskem, přepínač Seznam/Mapa v záhlaví sekce „Lekce“.
- Lekce: jedna velká primární akce, tři sekundární (Kartičky, Test lekce, Další lekce), na desktopu postranní sloupec s akcemi; slovíčka mají jedno tlačítko zvuku, příklad se rozbalí, ⓘ je decentní.
- Představení slov: větší slovo, karta vystředěná.
- Procvičit: tři skupiny, počet karet k opakování, jednotné SVG ikony; přepínač Seznam/Mapa s SVG ikonami.
- Nastavení: volby v mřížce stejných sloupců, méně důležité karty sbalené.
- Mapa: větší popisky měst (12), legenda ikon. Pokrok: prázdný stav pro nového uživatele. Navigace 12 px, plynulý přechod otázek ve cvičení.
- Tutoriál nemění pravidla ani konstanty (změna je jen vzhled), proto zůstal beze změny; E2E testy upraveny (prázdný stav pokroku, sbalená připomínka).
