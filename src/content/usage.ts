import type { Word } from '../types';

/**
 * Vysvětlení „jak se to používá“ ke slovíčkům a frázím (doslovný překlad, situace, odstín).
 * Klíč = ID slovíčka. Vše v evropské portugalštině (PT-PT). Čeká na revizi rodilým mluvčím.
 */
export type UsageInfo = Pick<Word, 'literal' | 'usage' | 'register'>;

export const usage: Record<string, UsageInfo> = {
  // Jednotka 1 – pozdravy
  'u1l1-ola': { usage: 'Univerzální pozdrav, funguje kdykoli a s kýmkoli. Mezi známými se říká i „Olá!“ s důrazem a úsměvem.' },
  'u1l1-bom-dia': { literal: 'dobrý den', usage: 'Pozdrav od rána do oběda. Portugalci ho říkají i cizím lidem v obchodě, výtahu nebo čekárně, je to slušnost.' },
  'u1l1-boa-tarde': { literal: 'dobré odpoledne', usage: 'Pozdrav od oběda do setmění. Pozor: „odpoledne“ začíná po obědě, ne ve 12:00.' },
  'u1l1-boa-noite': { literal: 'dobrá noc', usage: 'Říká se jako pozdrav po setmění (dobrý večer) i na rozloučenou před spaním (dobrou noc).' },
  'u1l1-adeus': { literal: 's Bohem (a-deus)', usage: 'Rozloučení spíš na delší dobu nebo definitivně. V běžném životě se častěji říká „Até logo“ nebo „Tchau“.' },
  'u1l1-ate-logo': { literal: 'do brzy', usage: 'Nejběžnější rozloučení, když se uvidíte brzy nebo se datum nechává otevřené. Přirozené v obchodě i mezi známými.' },
  'u1l1-ate-amanha': { literal: 'do zítřka', usage: 'Rozloučení „uvidíme se zítra“. Říká se běžně na konci dne, třeba kolegům v práci.' },
  'u1l1-tchau': { literal: 'čau', usage: 'Neformální rozloučení mezi přáteli a známými. Funguje i jako „ahoj“ při odchodu.', register: 'informal' },
  'u1l1-tudo-bem': { literal: 'všechno dobře?', usage: 'Neformální pozdrav „Jak to jde?“. Odpovídá se „Tudo bem!“ (Dobrý!) a často se ani nečeká dlouhá odpověď.', register: 'informal' },
  'u1l1-como-estas': { literal: 'jak jsi?', usage: 'Neformální „Jak se máš?“ s tykáním (tu). Typická odpověď: „Estou bem, obrigado. E tu?“' },
  'u1l1-como-esta': { literal: 'jak je?', usage: 'Zdvořilé „Jak se máte?“ s vykáním. Použij u starších lidí, cizích nebo v oficiální situaci.', register: 'formal' },
  'u1l1-obrigado': { literal: 'zavázaný', usage: 'Muž říká „obrigado“, žena „obrigada“, podle toho, kdo děkuje, ne komu. Řekne se to často, i za drobnost.' },
  'u1l1-de-nada': { literal: 'z ničeho', usage: 'Odpověď na „obrigado“. Ekvivalent „Není zač“.' },
  'u1l1-por-favor': { usage: 'Doplněk k prosbě. V restauraci a v obchodě se říká hodně často; zdvořilejší variantou je „se faz favor“.' },
  'u1l1-desculpe': { literal: 'omluvte', usage: 'Zdvořilá omluva i způsob, jak někoho oslovit („Promiňte, můžete…?“). U kamarádů „desculpa“.', register: 'formal' },
  'u1l1-com-licenca': { literal: 's povolením', usage: 'Říká se, když projdeš kolem někoho nebo vstupuješ do místnosti, někdy i při vstupu do domu.', register: 'formal' },

  // Jednotka 1 – osoby
  'u1l2-tu': { usage: 'Tykání. Používá se mezi přáteli, rodinou a vrstevníky. Při pochybnostech u starších lidí vykej.' },
  'u1l2-vos': { usage: 'V PT-PT je „vocês“ množné číslo „vy“. Zdvořilé vykání jednotlivce se tvoří třetí osobou („o senhor“, „a senhora“ nebo jménem) – viz gramatika.' },
  'u1l2-o-senhor': { literal: 'pán / paní', usage: 'Zdvořilé vykání jedné osoby. Sloveso je ve 3. osobě: „O senhor quer um café?“. Při rozhovoru se používá i jméno: „A Maria quer um café?“', register: 'formal' },
  'u1l2-chamo-me': { literal: 'jmenuji se (nazývám se)', usage: 'Standardní způsob, jak se představit. Zájmeno „me“ stojí v PT-PT za slovesem a spojuje se pomlčkou.' },
  'u1l2-muito-prazer': { literal: 'velké potěšení', usage: 'Reakce při seznámení. Odpověď: „Igualmente!“ nebo „O prazer é meu.“' },
  'u1l2-igualmente': { literal: 'stejně', usage: 'Zdvořilá odpověď na „muito prazer“, přání dobré chuti, hezký den apod. (Vzájemně.)' },
  'u1l2-falo': { usage: 'Užitečná věta při komunikaci. Portugalci ocení, když se alespoň pokusíš portugalsky.' },
  'u1l2-nao-percebo': { literal: 'nechápu', usage: 'Řekni, když ti někdo nerozumí nebo mluví příliš rychle. Pomůže doplnit „Pode repetir?“.' },
  'u1l2-pode-repetir': { literal: 'můžete opakovat?', usage: 'Zdvořilá prosba o zopakování, vykání. Kamarádovi řekneš „Podes repetir?“.', register: 'formal' },

  // Jednotka 3 – místa
  'u3l1-em-casa': { usage: 'Říká se, kde někdo je („Estou em casa“) i kam jde („Vou para casa“).' },
  'u3l3-pastelaria': { usage: 'Typická portugalská kavárna s pečivem a koláčky (pastel de nata). Zde se snídá a svačí, nejde o cukrárnu v českém slova smyslu.' },
  'u3l3-casa-de-banho': { literal: 'dům na koupání', usage: 'Správný výraz pro toaletu v PT-PT, i když je v místnosti jen záchod. V restauraci se ptáš: „Onde fica a casa de banho?“' },
  'u3l3-onde-fica': { literal: 'kde leží…?', usage: 'Nejběžnější způsob, jak se zeptat na cestu. Sloveso „ficar“ znamená „být umístěn“.' },
  'u3l3-fica': { literal: 'leží tady blízko', usage: 'Typická odpověď na dotaz na cestu. „Ficar“ tu znamená „nacházet se“, ne „zůstat“.' },

  // Jednotka 4 – kavárna a jídlo
  'u4l1-cafe': { literal: 'káva', usage: 'Když v Portugalsku řekneš „um café“, dostaneš malé silné espresso. Pro kávu s mlékem si řekni „um galão“ nebo „uma meia de leite“.' },
  'u4l1-bica': { usage: 'Espresso v Lisabonu a na jihu. Na severu (Porto) se tomu říká „cimbalino“. Slovo „bica“ je lisabonské.' },
  'u4l1-galao': { usage: 'Káva s hodně mléka ve vysoké sklenici, typická snídaňová káva.' },
  'u4l1-meia': { literal: 'půl mléka', usage: 'Káva s mlékem v šálku, zhruba půl na půl. Objednává se i bez zmínky o kávě.' },
  'u4l1-pastel': { literal: 'košíček z nata (smetany)', usage: 'Slavný pudinkový košíček. V Lisabonu v Belému se mu říká „pastel de Belém“. Jí se teplý, se skořicí.' },
  'u4l1-sandes': { usage: '„Sandes“ je nejběžnější slovo pro sendvič v kavárnách i pekárnách. Typická je „sandes mista“ (šunka a sýr).' },
  'u4l1-pequeno-almoco': { literal: 'malý oběd', usage: 'Snídaně. Doslovně „malý oběd“, protože „almoço“ je oběd.' },
  'u4l2-queria': { literal: 'chtěl jsem', usage: 'Zdvořilá objednávka: „Queria um café, por favor.“ Minulý čas nedokonavý zde zjemňuje prosbu. Nejběžnější způsob objednání.', register: 'formal' },
  'u4l2-para-mim': { literal: 'pro mě', usage: 'Při objednávání ve skupině: „Para mim, um galão.“' },
  'u4l2-tem': { literal: 'máte?', usage: 'Zeptáš se, zda mají zboží: „Tem pão?“. Je to vykání (3. osoba).' },
  'u4l2-o-que-deseja': { literal: 'co si přejete?', usage: 'Typická otázka obsluhy. Odpověď: „Queria…“ nebo „Para mim…“.', register: 'formal' },
  'u4l2-a-conta': { literal: 'účet, když je to možné', usage: 'Zdvořilé vyžádání účtu v restauraci. „Se faz favor“ je zdvořilejší varianta „por favor“.', register: 'formal' },
  'u4l2-quanto-e': { literal: 'kolik je to?', usage: 'Zeptáš se na celkovou částku po objednání.' },
  'u4l2-troco': { literal: 'drobné', usage: 'Vrácené peníze po zaplacení. „Fique com o troco“ = „nechte si drobné (spropitné)“.' },
  'u4l3-fome': { literal: 'mít hlad', usage: 'V portugalštině se hlad, žízeň, zima a horko vyjadřují slovesem „ter“ (mít), ne „být“: „Tenho fome.“' },
  'u4l3-quantos-anos': { literal: 'kolik let máš?', usage: 'Věk se v portugalštině „má“ (ter), ne „je“: „Tenho trinta anos.“' },

  // Jednotka 5 – čas
  'u5l3-que-horas': { literal: 'jaké hodiny jsou?', usage: 'Standardní otázka na čas. Odpověď je v množném čísle: „São três horas“, kromě 1:00 („É uma hora“).' },
  'u5l3-e-meia': { literal: 'a půl', usage: 'Půl hodiny po celé: 14:30 = „duas e meia“. Česky ale „půl třetí“, tedy rozdílný systém!' },
  'u5l3-menos-quarto': { literal: 'minus čtvrt', usage: '15 minut před celou: 8:45 = „nove menos um quarto“. Česky „tři čtvrtě na devět“.' },
  'u5l3-as-oito': { literal: 'v osm', usage: 'Předložka „a“ + člen: „às oito“ (v osm), „à uma“ (v jednu).' },
  'u5l4-tomar-duche': { literal: 'vzít sprchu', usage: 'Portugalci „berou“ sprchu, snídani i léky: „tomar duche“, „tomar o pequeno-almoço“, „tomar um comprimido“.' },
  'u5l4-pequeno-almoco': { literal: 'vzít malý oběd', usage: 'V PT-PT se snídaně „bere“. Říká se také „tomar o pequeno-almoço“.' },

  // Jednotka 6 – doprava a orientace
  'u6l1-ir-embora': { literal: 'jít pryč', usage: 'Odejít odněkud a nevracet se hned: „Já vou embora.“ (Už jdu pryč.)' },
  'u6l1-vamos': { literal: 'jdeme', usage: 'Vyzvání ke společné akci: „Vamos!“ = „Pojďme!“ i „Jdeme!“.' },
  'u6l2-ida': { literal: 'tam', usage: 'Jednosměrná jízdenka: „Um bilhete de ida, por favor.“' },
  'u6l2-ida-volta': { literal: 'tam a zpět', usage: 'Zpáteční jízdenka: „Um bilhete de ida e volta.“' },
  'u6l2-viva': { usage: 'Dobíjecí karta pro lisabonskou MHD (metro, autobus, tramvaj). Koupíš ji a dobiješ v automatu na stanici metra nebo na přepážce.' },
  'u6l3-em-frente': { literal: 'vpřed', usage: 'Při navigaci: „Siga em frente.“ = „Jděte rovně.“' },
  'u6l3-perdido': { literal: 'ztracený', usage: 'Muž říká „perdido“, žena „perdida“. Užitečné při orientaci: „Desculpe, estou perdido. Onde fica…?“' },

  // Jednotka 7 – obchod a peníze
  'u7l1-posso-ajudar': { literal: 'mohu pomoci?', usage: 'Standardní věta prodavače. Odpověď: „Estou só a ver, obrigado“ (jen se dívám) nebo „Queria…“.' },
  'u7l1-so-a-ver': { usage: 'Zdvořilé odmítnutí pomoci prodavače: stručně a bez konfliktu.' },
  'u7l1-fico': { literal: 'zůstanu s tímto', usage: 'Rozhodnutí o koupi: „Fico com este.“ = „Vezmu si tenhle.“' },
  'u7l2-multibanco': { usage: 'Portugalská síť bankomatů a platebních terminálů. Lidé říkají „vou ao multibanco“, když míří do bankomatu.' },
  'u7l2-nif': { literal: 'daňové identifikační číslo', usage: 'Číslo, které se v Portugalsku požaduje pro mnoho věcí (SIM karta, internet). V obchodě se ptají: „Quer fatura com contribuinte?“' },
  'u7l2-ha': { literal: 'je / existuje', usage: 'Neosobní tvar slovesa „haver“. „Há um problema“ = „Je tu problém“. Ve větě se nemění podle množství.' },
  'u7l2-nao-ha': { usage: 'Znamená „v pořádku, to nevadí“ při omluvě nebo ochotě.' },
  'u7l3-dele': { usage: 'Zdůrazňuje, komu věc patří, když je to nejasné: „o carro dele“ (jeho auto) × „o carro dela“ (její).' },
  'u7l4-qual': { usage: 'Při výběru z několika možností: „Qual é o teu?“ = „Který je tvůj?“. Množné číslo „quais“.' },

  // Jednotka 8 – záliby
  'u8l1-gostar': { literal: 'libit se', usage: 'Po „gostar“ vždy následuje „de“: „Gosto de café.“ Bez „de“ je to chyba.' },
  'u8l1-precisar': { usage: 'Po „precisar“ následuje „de“: „Preciso de ajuda.“' },
  'u8l1-gostava': { literal: 'líbilo by se mi', usage: 'Zdvořilé přání: „Gostaria de um café.“ V mluvě se častěji říká „Gostava de…“ (zjemnění).', register: 'formal' },
  'u8l2-jogar': { usage: 'U her a sportů se používá „jogar“, u hudebních nástrojů „tocar“.' },

  // A2 – jednotka 1: minulost (perfeito)
  'a2u1l1-ha-dias': { literal: 'je tři dny', usage: '„Há“ + doba znamená „před“: „há três dias“ = před třemi dny.' },
  'a2u1l1-semana-passada': { usage: 'V PT-PT se říká „na semana passada“ i „semana passada“ (bez předložky) – běžná mluva.' },
  'a2u1l1-esperar': { usage: 'Znamená čekat i doufat. „Esperar por alguém“ = čekat na někoho, „Espero que…“ = doufám, že…' },
  'a2u1l1-conhecer': { usage: 'Znát osobu nebo místo, případně se s někým seznámit. Fakta se „znají“ slovesem „saber“: „Sei que…“' },
  'a2u1l1-assistir': { usage: 'V PT-PT „assistir a“ znamená být přítomen (zápas, koncert). Díváš-li se na televizi, říká se „ver televisão“.' },
  'a2u1l2-ser-ir': { usage: 'Tvar „foi“ patří slovesům „ser“ i „ir“. Význam poznáš z kontextu: „Ele foi professor“ (byl) × „Ele foi ao banco“ (šel).' },
  'a2u1l2-como-foi': { literal: 'jak to bylo?', usage: 'Nejčastější otázka po zážitku (dovolená, schůzka, pohovor). Odpověď: „Foi ótimo!“ nebo „Foi péssimo.“' },
  'a2u1l2-foi-otimo': { usage: 'Přirozená pozitivní reakce. „Ótimo“ se používá velmi často.' },
  'a2u1l3-como-foi-fds': { usage: 'Ptáš se po víkendu, typicky v pondělí v práci nebo ve škole. Odpověď: „Foi bom, obrigado. E o teu?“' },
  'a2u1l3-o-que-fizeste': { usage: 'Tykání. S vykáním: „O que fez?“ (použij 3. osobu).' },
  'a2u1l3-a-seguir': { literal: 'následující', usage: 'Zdůrazňuje následný krok: „Primeiro tomei café, a seguir fui trabalhar.“' },
  'a2u1l3-adorei': { literal: 'zbožňoval jsem', usage: 'Silnější než „gostei“. Říká se o zážitku, jídle, filmu apod. Muž i žena říkají „adorei“.' },

  // A2 – jednotka 2: imperfeito
  'a2u2l1-antigamente': { usage: 'Vyvolává minulost, kterou si pamatuješ jako zvyk nebo období. Typicky s imperfeitem: „Antigamente, eu morava em Praga.“' },
  'a2u2l1-costumar': { literal: 'mít ve zvyku', usage: '„Costumo acordar cedo“ = obvykle vstávám brzy. V minulosti: „Costumava ir à praia.“' },
  'a2u2l1-era': { usage: 'Imperfeito „ser“ se používá pro popis a okolnosti v minulosti: „Era pequeno“, „Era noite“.' },
  'a2u2l2-brincar': { usage: 'Hrát si (hlavně o dětech). „Jogar“ je hrát hru nebo sport, „tocar“ hrát na nástroj.' },
  'a2u2l2-recreio': { usage: 'Školní přestávka a také školní hřiště. „No recreio“ = o přestávce.' },
  'a2u2l2-ferias': { literal: 'svátky', usage: 'Vždy množné číslo: „as férias“. Dovolená i školní prázdniny. „Estar de férias“ = mít dovolenou.' },
  'a2u2l3-estava-a': { usage: 'V PT-PT se průběh vyjadřuje „estar a + infinitiv“ (ne gerundiem): „Estava a ver televisão.“' },
  'a2u2l3-bater': { literal: 'bít na dveře', usage: 'Zaklepat: „Bateram à porta.“ Zazvonit se řekne „tocar à campainha“.' },
  'a2u2l3-tocar': { usage: 'Zvonit, hrát na nástroj nebo se něčeho dotknout. Zazvonit u dveří: „tocar à campainha“.' },

  // A2 – jednotka 3: ubytování a cestování
  'a2u3l1-residencial': { usage: 'Levnější penzion (často rodinný). Hotel je „hotel“, hostel je „hostel“. Ve městech je to rozšířená možnost ubytování.' },
  'a2u3l1-quarto-duplo': { usage: '„Quarto de casal“ je pokoj s jednou velkou postelí, „quarto duplo“ je pokoj pro dva (může mít dvě postele). Při rezervaci to upřesni.' },
  'a2u3l1-andar': { usage: 'Patro. V PT-PT je přízemí „rés-do-chão“, první patro je „primeiro andar“ (tedy české 1. patro). Sloveso „andar“ znamená chodit.' },
  'a2u3l2-mais': { usage: 'Srovnání: „A casa é mais cara do que o apartamento.“ „Do que“ lze v mluvě zkrátit na „que“.' },
  'a2u3l2-o-mais': { usage: 'Nejvyšší stupeň: „o mais barato“ (nejlevnější), „a mais bonita de Lisboa“ (nejhezčí v Lisabonu).' },
  'a2u3l2-melhor': { usage: 'Lepší (přídavné jméno) i lépe („melhor“ jako příslovce). Používá se bez „mais“: ne „mais bom“, ale „melhor“.' },
  'a2u3l3-miradouro': { usage: 'Vyhlídka s výhledem na město nebo krajinu. V Lisabonu je jich mnoho (Miradouro da Senhora do Monte). Typické turistické místo.' },
  'a2u3l3-visita': { usage: 'Prohlídka s průvodcem. „Visita guiada“ je běžná v klášterech, hradech a muzeích; často je v angličtině i portugalštině.' },
  'a2u3l3-entrada': { usage: 'Vstup i vstupné. „Entrada livre“ = vstup zdarma, „entrada proibida“ = vstup zakázán.' },
  'a2u3l3-marco': { usage: 'Měsíce se píší malým písmenem. „Em março“ = v březnu.' },

  // A2 – jednotka 4: zdraví
  'a2u4l1-doer': { literal: 'bolí mi hlava', usage: 'Bolest se vyjadřuje slovesem „doer“ s předmětem („mi“): „Dói-me a cabeça.“ (jedn. č.) × „Doem-me os pés.“ (mn. č.)' },
  'a2u4l1-constipado': { literal: 'zácpa (falešný přítel)', usage: 'Pozor na falešného přítele: „constipado“ znamená nachlazený (rýma), ne „zácpa“. Pro zácpu je „prisão de ventre“.' },
  'a2u4l1-sentir-me': { usage: 'Lékaři se řekne: „Sinto-me mal.“ Obecně nepříjemný pocit; konkrétně: „Tenho dor de cabeça.“' },
  'a2u4l2-centro-saude': { usage: 'Středisko státního zdravotnictví (obvodní lékař, očkování, běžné ošetření). Pro akutní potíže mimo ordinační dobu se jde na „urgências“.' },
  'a2u4l2-urgencias': { usage: 'Nemocniční pohotovost. Nouzová linka v celé EU a v Portugalsku je 112.' },
  'a2u4l2-consulta': { usage: 'Návštěva u lékaře i konzultace. „Marcar uma consulta“ = objednat se. „Ir à consulta“ = jít k lékaři.' },
  'a2u4l3-diga': { literal: 'řekněte (rozkaz)', usage: 'Rozkazovací způsob vykání (3. osoba). Lékaři a lékárníci ho používají běžně, zní zdvořile.', register: 'formal' },
  'a2u4l3-bebe': { usage: 'Tykání: rozkaz od „beber“ má stejný tvar jako 3. osoba oznamovacího způsobu. „Bebe água!“ × vykání „Beba água!“' },
  'a2u4l3-descansa': { usage: 'Tykání. Vykání: „Descanse.“ Zápor: „Não descanses“ (záporný rozkaz = konjunktiv).' },

  // A2 – jednotka 5: zájmena
  'a2u5l1-pao-o': { literal: 'chleba? koupím ho', usage: 'V PT-PT se zájmeno klade za sloveso s pomlčkou: „Compro-o.“ Po koncovce -r/-s/-z se přidává -l-: „comprá-lo“, „vê-lo“.' },
  'a2u5l1-vou-ve-lo': { usage: 'U infinitivu se zájmeno připojuje pomlčkou: „vê-lo“. Po infinitivu se z „o“ stane „-lo“ a koncové -r odpadne: vê-lo (ne „ver-o“).' },
  'a2u5l2-telefonar': { usage: 'Zavolat komu: „Telefonei à Ana.“ (nepřímý předmět s předložkou „a“). Zavolat na číslo: „ligar para“.' },
  'a2u5l2-prenda': { usage: 'Dárek. Běžné je i slovo „presente“; „prenda“ je typicky portugalské a vřelejší. „Dar uma prenda“ = dát dárek.' },
  'u5l4-nunca': { usage: 'Před slovesem „não“ nepotřebuje: „Nunca vou.“ Za slovesem se „não“ přidává: „Não vou nunca.“ Obě věty znamenají „Nikdy nechodím.“' },
  'a2u5l3-ja': { usage: 'Znamená „už“ („Já comi“ = už jsem jedl) i důraz („Já vou!“ = už jdu!). Záporně „já não“ = už ne.' },

  // A2 – jednotka 6: budoucnost a telefon
  'a2u6l1-daqui-a-pouco': { literal: 'odtud za málo', usage: 'Za chvíli, brzy: „Vemo-nos daqui a pouco.“ („Uvidíme se za chvíli.“)' },
  'a2u6l1-pensar': { usage: 'Plán: „Penso viajar em agosto“ = mám v plánu cestovat v srpnu. Lze také vyjádřit i budoucnost: „Vou viajar.“' },
  'a2u6l2-vai-chover': { literal: 'půjde pršet', usage: 'Nejběžnější budoucnost v řeči: „ir“ + infinitiv („Vou comer“, „Vai chover“). Tvar „choverá“ se používá hlavně v psané řeči a v předpovědi počasí.' },
  'a2u6l2-chovera': { register: 'formal', usage: 'Budoucí čas „-ei, -á“ je v psané a formální řeči (předpověď počasí, zpravodajství). V hovoru se říká „Vai chover.“' },
  'a2u6l3-pode-ser': { literal: 'může být', usage: 'Přijetí nabídky nebo plánu: „Pode ser!“ = Klidně, ujde to. Nemá nadšený podtón.' },
  'a2u6l3-combinado': { literal: 'dohodnuto', usage: 'Potvrzení domluvy: „Combinado!“ = Domluveno! Velmi běžné.' },
  'a2u6l3-estou': { literal: 'jsem?', usage: 'Typický způsob, jak zvednout telefon v Portugalsku: „Estou?“ nebo „Estou, sim?“. Pozdrav „Olá“ přichází až potom.' },
  'a2u6l3-quem-fala': { literal: 'kdo mluví?', usage: 'Zeptáš se, kdo volá. Odpověď: „Fala o Tomás.“ („Tady Tomáš.“) Mluvit s někým: „Posso falar com…?“' },
  'a2u6l3-ligar': { usage: 'Zavolat (telefonem) i zapnout (televizi, světlo): „Ligo-te amanhã.“ × „Liga a luz.“ Opak je „desligar“.' },

  // A2 – jednotka 7: bydlení a práce
  'a2u7l1-t2': { usage: 'V Portugalsku se byty označují T + počet ložnic: T0 garsonka, T1 jedna ložnice, T2 dvě ložnice atd. Obývák a kuchyně se nepočítají.' },
  'a2u7l1-res-do-chao': { literal: 'úroveň země', usage: 'Přízemí. První patro je „primeiro andar“. V adrese se zkracuje „r/c“.' },
  'a2u7l1-frigorifico': { usage: 'Lednička. V mluvě se říká i „frigo“.' },
  'a2u7l2-senhorio': { usage: 'Majitel, který byt pronajímá. V Portugalsku bývá nájemní smlouva („contrato de arrendamento“) psaná, kauce je obvykle jeden nebo dva měsíční nájmy.' },
  'a2u7l2-despesas': { usage: 'V nájmu se rozlišuje „renda“ (základní nájem) a „despesas“ (energie, internet, správa). Ptej se: „As despesas estão incluídas?“' },
  'a2u7l2-morada': { usage: 'Adresa. Na formulářích: „Morada“, „Código postal“.' },
  'a2u7l2-mudar-se': { usage: 'Stěhovat se (změnit bydliště): „Vou mudar-me para Lisboa.“ Přestěhovat věci: „fazer a mudança“.' },
  'a2u7l3-teletrabalho': { usage: 'Říká se i „trabalhar a partir de casa“.' },
  'a2u7l3-entrevista': { usage: 'Pracovní pohovor. Typické otázky: „Fale-me de si.“ (Řekněte mi o sobě.) Oslovení „doutor / doutora“ se v Portugalsku používá velmi široce.' },
  'a2u7l3-colega': { usage: 'Kolega i spolužák. V PT-PT se používá o všech lidech, se kterými sdílíš práci nebo školu.' },

  // A2 – jednotka 8: názory a vyjadřování
  'a2u8l1-acho-que': { literal: 'nacházím, že', usage: 'Nejběžnější způsob, jak vyjádřit názor: „Acho que sim.“ (Myslím, že ano.) Po „acho que“ následuje oznamovací způsob.' },
  'a2u8l1-parece-me': { usage: 'Měkčí než „acho que“: vyjadřuje dojem. „Parece-me bem.“ (Zdá se mi to dobré.)' },
  'a2u8l1-tens-razao': { literal: 'máš rozum (důvod)', usage: 'Vyjádření souhlasu: „Tens razão.“ Vykání: „Tem razão.“ Nepoužívá se sloveso „být“.' },
  'a2u8l1-claro-que-sim': { usage: 'Silný souhlas nebo ochota: „Claro que sim!“ Zkráceně: „Claro!“' },
  'a2u8l1-depende': { usage: 'Častá odpověď na otázku. Rozvinutí: „Depende do tempo.“ (Záleží na počasí.)' },
  'a2u8l2-porque-e-que': { literal: 'proč je že', usage: 'Zdvořilejší a běžnější otázka „proč“ v mluvě: „Porque é que não vens?“ Samostatné „Porquê?“ zní stručněji.' },
  'a2u8l2-porque-acento': { usage: 'Na konci věty a samostatně se píše „porquê“ s přízvukem. „Porque“ uvnitř věty znamená „protože“.' },
  'a2u8l2-pois-e': { usage: 'Typicky portugalský souhlas: potvrzení, že rozumíš nebo že máš stejný názor. Nepoužívá se jako vyjádření radosti.' },
  'a2u8l2-ainda-bem': { literal: 'ještě dobře', usage: 'Reakce na dobrou zprávu: „Ainda bem que chegaste!“ (Ještě že ses dostal.)' },
  'a2u8l2-que-pena': { usage: 'Lítost nad něčím: „Que pena!“ („Škoda!“). Neznamená trest, jen „škoda“.' },
  'a2u8l2-fixe': { usage: 'Velmi běžné hovorové slovo v Portugalsku: super, v pohodě. Nepoužívej ho v úředním nebo pracovním jednání.', register: 'colloquial' },
  'a2u8l2-giro': { usage: 'Hovorově: hezký, milý, roztomilý (o člověku, místě i věci). Typické pro mladší generaci.', register: 'colloquial' },
  'a2u8l3-tenho-estado': { usage: 'Tvar „ter estado“ vyjadřuje opakování nebo trvání do současnosti: „Tenho estado doente.“ Překládá se přítomným časem „poslední dobou jsem…“.' },
  'a2u8l3-boa-sorte': { usage: 'Přání štěstí před zkouškou, cestou nebo pohovorem. Odpověď: „Obrigado!“' },
  'a2u8l3-parabens': { literal: 'pozdravy', usage: 'Gratulace k úspěchu, narozeninám i svatbě. Vždy v množném čísle: „Parabéns!“' },
  'a2u8l3-bom-proveito': { literal: 'dobrý zisk', usage: 'Přání před jídlem nebo při jídle. Ekvivalent „Dobrou chuť“. Může se říct cizím lidem v restauraci.' },
  'a2u8l3-saude': { literal: 'zdraví', usage: 'Přípitek i reakce na kýchnutí. Při přípitku se dívá do očí a cinká.' },
};

/** Připojí vysvětlení k slovíčku (pokud existuje). */
export const withUsage = (word: Word): Word => {
  const u = usage[word.id];
  return u ? { ...word, ...u } : word;
};
