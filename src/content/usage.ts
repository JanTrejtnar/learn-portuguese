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
  'u4l1-sandes': { usage: 'V PT-PT „sandes“, ne „sanduíche“. Je to nejběžnější slovo ve všech kavárnách.' },
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
};

/** Připojí vysvětlení k slovíčku (pokud existuje). */
export const withUsage = (word: Word): Word => {
  const u = usage[word.id];
  return u ? { ...word, ...u } : word;
};
