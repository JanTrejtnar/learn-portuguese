/**
 * Výslovnost evropské portugalštiny pro Čechy a falešní přátelé CZ ↔ PT.
 * Český „přibližný přepis“ je jen pomůcka (nenahrazuje poslech). Obsah je psaný AI a čeká na revizi rodilým mluvčím.
 */
export interface PronExample {
  pt: string;
  /** Přibližný přepis českými písmeny. */
  approx: string;
  cs: string;
}

export interface PronTopic {
  id: string;
  emoji: string;
  title: string;
  /** Co je pro Čecha jinak a co dělat. */
  text: string[];
  examples: PronExample[];
  reviewed: boolean;
}

export const pronunciation: PronTopic[] = [
  {
    id: 'reducao', emoji: '🤐', title: 'Slabé a „spolknuté“ samohlásky', reviewed: false,
    text: [
      'Evropská portugalština výrazně zkracuje samohlásky bez přízvuku. Nepřízvučné e se skoro neříká a nepřízvučné o zní jako u. Proto slova vypadají „kratší“, než se píší.',
      'Rada: poslouchej, které slabiky nesou přízvuk, a ostatní říkej rychle a tiše. Nepřízvučné samohlásky nevyslovuj čistě jako v češtině.',
    ],
    examples: [
      { pt: 'obrigado', approx: 'ubrigádu', cs: 'děkuji (muž)' },
      { pt: 'pequeno', approx: 'pkénu', cs: 'malý' },
      { pt: 'de', approx: 'd (skoro neznělé)', cs: 'z, od' },
      { pt: 'telemóvel', approx: 'tlmóvel', cs: 'mobilní telefon' },
    ],
  },
  {
    id: 'sibilantes', emoji: '🐍', title: 'S a Z na konci slabiky: „š“ a „ž“', reviewed: false,
    text: [
      'Na konci slova a před neznělou souhláskou se s čte jako š, před znělou souhláskou jako ž. Na začátku slabiky před samohláskou je to normální s.',
      'Čtení x a ch: ch je vždy š (chá, chave).',
    ],
    examples: [
      { pt: 'português', approx: 'purtugéš', cs: 'portugalský, portugalština' },
      { pt: 'mesmo', approx: 'mežmu', cs: 'stejný, právě' },
      { pt: 'dois', approx: 'dojš', cs: 'dva' },
      { pt: 'chave', approx: 'šáv', cs: 'klíč' },
    ],
  },
  {
    id: 'nasais', emoji: '👃', title: 'Nosové samohlásky (ã, õ, -m, -n)', reviewed: false,
    text: [
      'Čeština nosovky nemá. Samohláska před m nebo n na konci slabiky nebo se znaménkem ~ se vyslovuje nosem a hlásku n ani m nevyslovuješ celou. Důležité je „nepřidat“ plné n.',
      'Typické koncovky: -ão (jako nosové „au“), -ões, -em, -im, -om, -um.',
    ],
    examples: [
      { pt: 'não', approx: 'nǎu (nosově)', cs: 'ne' },
      { pt: 'pão', approx: 'pǎu (nosově)', cs: 'chléb' },
      { pt: 'bom', approx: 'bõ (nosově)', cs: 'dobrý' },
      { pt: 'obrigado, bem', approx: 'bẽj (nosově)', cs: 'dobře' },
    ],
  },
  {
    id: 'lh-nh', emoji: '✅', title: 'LH a NH znáš z češtiny', reviewed: false,
    text: [
      'To je dobrá zpráva: lh se čte jako české ľ (měkké l) a nh jako české ň. Příklad: filho a manhã.',
    ],
    examples: [
      { pt: 'filho', approx: 'fíľu', cs: 'syn' },
      { pt: 'trabalho', approx: 'trabáľu', cs: 'práce' },
      { pt: 'manhã', approx: 'maňã', cs: 'ráno, dopoledne' },
      { pt: 'vinho', approx: 'víňu', cs: 'víno' },
    ],
  },
  {
    id: 'rr', emoji: '🌀', title: 'R: dvojí podoba', reviewed: false,
    text: [
      'R na začátku slova a rr se vyslovuje zadním (uvulárním) zvukem, podobně jako ve francouzštině. R uprostřed slova mezi samohláskami je krátké „klepnuté“ r podobné českému.',
      'Rada: český „ř“ neříkej. Zadní r si zkus nejdřív jako „chrchlání“ v krku.',
    ],
    examples: [
      { pt: 'rua', approx: 'zadní r + úa', cs: 'ulice' },
      { pt: 'carro', approx: 'káRu', cs: 'auto' },
      { pt: 'caro', approx: 'káru (krátké r)', cs: 'drahý' },
      { pt: 'obrigado', approx: 'ubrigádu', cs: 'děkuji (muž)' },
    ],
  },
  {
    id: 'pravopis', emoji: '🔤', title: 'Písmena, která překvapí', reviewed: false,
    text: [
      'h se nečte (hotel, hoje). c před e a i a ç je s (cinco, aça). qu před e a i je k (quem), g před e a i je ž (gente), j je vždy ž (já).',
      'l na konci slabiky je „tmavé“, blíž k ł (Portugal, sol).',
    ],
    examples: [
      { pt: 'hoje', approx: 'óže', cs: 'dnes' },
      { pt: 'cinco', approx: 'sínku', cs: 'pět' },
      { pt: 'quem', approx: 'kẽj (nosově)', cs: 'kdo' },
      { pt: 'gente', approx: 'žẽt', cs: 'lidé' },
      { pt: 'Portugal', approx: 'purtugáł', cs: 'Portugalsko' },
    ],
  },
  {
    id: 'acento', emoji: '📍', title: 'Přízvuk a čárky', reviewed: false,
    text: [
      'Přízvuk bývá na předposlední slabice, u slov končících na souhlásku (kromě s, m) na poslední. Čárky (á é í ó ú) a stříšky (ê ô) přízvuk značí a mění zvuk samohlásky: é a ó jsou otevřené, ê a ô zavřenější.',
      'Slovo s čárkou čti vždy s důrazem na ní. Ostatní slabiky pak zkracuj.',
    ],
    examples: [
      { pt: 'café', approx: 'kafé', cs: 'káva, kavárna' },
      { pt: 'você', approx: 'vosê', cs: 'vy (zdvořile)' },
      { pt: 'avó', approx: 'avó', cs: 'babička' },
      { pt: 'avô', approx: 'avô', cs: 'dědeček' },
    ],
  },
];

export interface FalseFriend {
  id: string;
  pt: string;
  /** Čeho se Čech bojí / co by čekal. */
  trap: string;
  meaning: string;
  /** Jak se řekne to, co by čekal. */
  instead?: string;
  example: { pt: string; cs: string };
}

export const falseFriends: FalseFriend[] = [
  { id: 'ff-cena', pt: 'cena', trap: 'česky „cena“ = peníze', meaning: 'scéna (ve filmu, v divadle)', instead: 'preço = cena', example: { pt: 'Qual é o preço?', cs: 'Jaká je cena?' } },
  { id: 'ff-quinta', pt: 'quinta-feira', trap: 'čeština: pátek (pátý den od pondělka)', meaning: 'čtvrtek', instead: 'sexta-feira = pátek', example: { pt: 'Na quinta-feira vou ao médico.', cs: 'Ve čtvrtek jdu k lékaři.' } },
  { id: 'ff-esquisito', pt: 'esquisito', trap: 'zní jako „exkluzivní, vybraný“', meaning: 'divný, zvláštní', example: { pt: 'Isto é muito esquisito.', cs: 'To je hodně divné.' } },
  { id: 'ff-ginasio', pt: 'ginásio', trap: 'česky gymnázium = střední škola', meaning: 'tělocvična, posilovna', instead: 'escola secundária = střední škola', example: { pt: 'Vou ao ginásio às sete.', cs: 'Jdu do posilovny v sedm.' } },
  { id: 'ff-constipado', pt: 'constipado', trap: 'zní jako „zácpa“', meaning: 'nachlazený', instead: 'prisão de ventre = zácpa', example: { pt: 'Estou constipado.', cs: 'Jsem nachlazený.' } },
  { id: 'ff-pretender', pt: 'pretender', trap: 'zní jako „předstírat“', meaning: 'mít v úmyslu, chtít', instead: 'fingir = předstírat', example: { pt: 'Pretendo viajar em agosto.', cs: 'Hodlám cestovat v srpnu.' } },
  { id: 'ff-pedir', pt: 'pedir', trap: 'dva různé významy', meaning: 'požádat, objednat si (ne „zeptat se“)', instead: 'perguntar = zeptat se', example: { pt: 'Vou pedir um café. Posso perguntar uma coisa?', cs: 'Objednám si kávu. Můžu se na něco zeptat?' } },
  { id: 'ff-apanhar', pt: 'apanhar', trap: 'česky nezní jako „chytit“', meaning: 'chytit; nastoupit (apanhar o autocarro)', example: { pt: 'Apanho o autocarro às oito.', cs: 'Autobus nastupuju v osm.' } },
  { id: 'ff-puxar', pt: 'puxar / empurrar', trap: 'na dveřích: Puxe / Empurre', meaning: 'táhnout / tlačit', example: { pt: 'Puxe a porta, por favor.', cs: 'Zatáhněte za dveře, prosím.' } },
  { id: 'ff-carta', pt: 'carta × cartão', trap: 'česky „karta“', meaning: 'carta = dopis; cartão = karta (platební, věrnostní)', example: { pt: 'Posso pagar com cartão?', cs: 'Mohu platit kartou?' } },
  { id: 'ff-taca', pt: 'taça', trap: 'zní jako „tác, tašek“', meaning: 'pohár, miska', instead: 'copo = sklenice', example: { pt: 'Um copo de água, por favor.', cs: 'Sklenici vody, prosím.' } },
];
