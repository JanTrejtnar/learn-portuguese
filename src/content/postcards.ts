/**
 * Sbírka pohlednic: ke každé jednotce patří jedno portugalské město. Pohlednice se odemkne
 * splněním testu jednotky. Text je česky, věta je v PT-PT a čeká na revizi rodilým mluvčím.
 */
export interface Postcard {
  /** Zajímavost o městě (česky, krátce). */
  fact: string;
  /** Jednoduchá věta v PT-PT k městu. */
  pt: string;
  cs: string;
}

export const postcards: Record<string, Postcard> = {
  'a1-u1': { fact: 'Starými čtvrtěmi Lisabonu projíždí slavná žlutá tramvaj číslo 28.', pt: 'Onde fica a paragem do elétrico?', cs: 'Kde je zastávka tramvaje?' },
  'a1-u2': { fact: 'V Sintře stojí barevný palác Pena na vrcholu kopce. Celá oblast je na seznamu UNESCO.', pt: 'O palácio é muito bonito.', cs: 'Palác je velmi hezký.' },
  'a1-u3': { fact: 'Óbidos je opevněné městečko s bílými domky. Místní pijí třešňový likér ginjinha z čokoládového kalíšku.', pt: 'Quero uma ginjinha, por favor.', cs: 'Chci ginjinhu, prosím.' },
  'a1-u4': { fact: 'V Coimbře je jedna z nejstarších univerzit v Evropě, založená v roce 1290.', pt: 'Estudo na universidade.', cs: 'Studuji na univerzitě.' },
  'a1-u5': { fact: 'Porto je domovem portského vína, které zraje ve sklepích ve čtvrti Vila Nova de Gaia.', pt: 'Um vinho do Porto, por favor.', cs: 'Portské víno, prosím.' },
  'a1-u6': { fact: 'Nad Bragou stojí poutní místo Bom Jesus do Monte s dlouhým barokním schodištěm.', pt: 'Subimos as escadas devagar.', cs: 'Pomalu jdeme po schodech nahoru.' },
  'a1-u7': { fact: 'V Évoře se dochoval římský chrám a historické centrum je na seznamu UNESCO.', pt: 'O templo é muito antigo.', cs: 'Chrám je velmi starý.' },
  'a1-u8': { fact: 'Faro je hlavní město Algarve. Vedle něj leží přírodní park Ria Formosa s lagunami a ostrovy.', pt: 'Vamos de barco à ilha.', cs: 'Pojedeme lodí na ostrov.' },
  'a2-u1': { fact: 'U Lagosu jsou útesy a jeskyně Ponta da Piedade, které se dají projet na lodičce.', pt: 'As grutas são lindas.', cs: 'Jeskyně jsou nádherné.' },
  'a2-u2': { fact: 'Tavira je městečko s římským mostem. Na ostrov Ilha de Tavira se jezdí lodí.', pt: 'Gosto de peixe grelhado.', cs: 'Mám rád grilovanou rybu.' },
  'a2-u3': { fact: 'V ústí řeky Sado u Setúbalu žijí delfíni a dá se za nimi vyplout lodí.', pt: 'Vimos golfinhos no rio.', cs: 'Viděli jsme v řece delfíny.' },
  'a2-u4': { fact: 'Aveiro se přezdívá „portugalské Benátky“. Kanály brázdí barevné lodě moliceiros.', pt: 'Passeamos de barco pelos canais.', cs: 'Vozíme se lodí po kanálech.' },
  'a2-u5': { fact: 'Guimarães se označuje za kolébku Portugalska. Nad městem stojí středověký hrad.', pt: 'Visitamos o castelo.', cs: 'Navštívíme hrad.' },
  'a2-u6': { fact: 'Viseu leží v oblasti, kde se pěstuje víno Dão. Je to klidné město s krásným historickým centrem.', pt: 'Um copo de vinho do Dão, por favor.', cs: 'Sklenku vína Dão, prosím.' },
  'a2-u7': { fact: 'V Tomaru stojí klášter Convento de Cristo, původně sídlo templářů. Je na seznamu UNESCO.', pt: 'O convento é enorme.', cs: 'Klášter je obrovský.' },
  'a2-u8': { fact: 'Guarda patří k nejvýše položeným městům Portugalska. Nedaleko je pohoří Serra da Estrela.', pt: 'Aqui faz muito frio.', cs: 'Tady je velká zima.' },
};
