/** Minimální páry: slova, která se liší jedním zvukem (cvičení poslechu). */
export interface PairWord {
  pt: string;
  cs: string;
}

export interface MinimalPair {
  id: string;
  a: PairWord;
  b: PairWord;
  /** Co poslouchat (česky). */
  tip: string;
}

export const minimalPairs: MinimalPair[] = [
  { id: 'avo', a: { pt: 'avó', cs: 'babička' }, b: { pt: 'avô', cs: 'dědeček' }, tip: 'Otevřené „ó“ (avó) × zavřené „ô“ (avô).' },
  { id: 'caro', a: { pt: 'caro', cs: 'drahý' }, b: { pt: 'carro', cs: 'auto' }, tip: 'Jedno „r“ je jedno ťuknutí jazykem, „rr“ je hrdelní (jako francouzské r).' },
  { id: 'coro', a: { pt: 'coro', cs: 'sbor' }, b: { pt: 'corro', cs: 'běžím' }, tip: 'Opět „r“ (ťuknutí) × „rr“ (hrdelní).' },
  { id: 'casa', a: { pt: 'casa', cs: 'dům' }, b: { pt: 'caça', cs: 'lov' }, tip: '„s“ mezi samohláskami zní jako „z“, „ç“ zní jako „s“.' },
  { id: 'asa', a: { pt: 'asa', cs: 'křídlo' }, b: { pt: 'assa', cs: 'peče' }, tip: 'Jedno „s“ mezi samohláskami = „z“, dvě „ss“ = „s“.' },
  { id: 'filha', a: { pt: 'filha', cs: 'dcera' }, b: { pt: 'fila', cs: 'fronta' }, tip: '„lh“ je měkké l (jako „lj“), obyčejné „l“ je tvrdé.' },
  { id: 'alho', a: { pt: 'alho', cs: 'česnek' }, b: { pt: 'ali', cs: 'tam' }, tip: '„lh“ (měkké l) × „li“.' },
  { id: 'sonho', a: { pt: 'sonho', cs: 'sen' }, b: { pt: 'sono', cs: 'spánek' }, tip: '„nh“ zní jako české „ň“.' },
  { id: 'mes', a: { pt: 'mês', cs: 'měsíc' }, b: { pt: 'mas', cs: 'ale' }, tip: '„ê“ je zavřené e, „a“ v „mas“ je temné, neutrální a.' },
  { id: 'sol', a: { pt: 'sol', cs: 'slunce' }, b: { pt: 'sul', cs: 'jih' }, tip: 'Otevřené „o“ v „sol“ × české „u“ v „sul“.' },
  { id: 'pao', a: { pt: 'pão', cs: 'chléb' }, b: { pt: 'pau', cs: 'hůl' }, tip: '„ão“ je nosová (nosní) samohláska, „au“ je čisté „au“.' },
  { id: 'mao', a: { pt: 'mão', cs: 'ruka' }, b: { pt: 'mau', cs: 'špatný' }, tip: '„ão“ nosově × „au“ čistě.' },
];
