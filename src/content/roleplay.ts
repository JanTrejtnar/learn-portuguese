import type { Quality, RoleplayChoice, RoleplayNode, Scenario } from '../lib/roleplay';

const ch = (quality: Quality, pt: string, cs: string, feedback: string, next: string | null): RoleplayChoice => ({ quality, pt, cs, feedback, next });
const node = (pt: string, cs: string, choices: RoleplayChoice[]): RoleplayNode => ({ npc: { pt, cs }, choices });

const BYE_TIP = '„Até logo“ je běžné a zdvořilé rozloučení.';

export const scenarios: Scenario[] = [
  {
    id: 'conhecer',
    title: 'Conhecer alguém',
    emoji: '🤝',
    unitId: 'a1-u1',
    npcName: 'Ana',
    setting: 'Na kávě se seznamuješ s Anou, Portugalkou z Lisabonu.',
    goal: 'Představ se, řekni, odkud jsi, a zeptej se, jak se má.',
    start: 'n0',
    nodes: {
      n0: node('Olá! Chamo-me Ana. Como te chamas?', 'Ahoj! Jmenuji se Ana. Jak se jmenuješ?', [
        ch('good', 'Olá! Chamo-me Tomás. Muito prazer.', 'Ahoj! Jmenuji se Tomáš. Těší mě.', 'Perfeito! Jméno + „muito prazer“.', 'n1'),
        ch('ok', 'Tomás.', 'Tomáš.', 'Srozumitelné, ale strohé. Lépe: „Chamo-me Tomás.“', 'n1'),
        ch('bad', 'Adeus!', 'Nashledanou!', '„Adeus“ se říká při loučení. Zde je třeba se představit: „Chamo-me…“', 'n1'),
      ]),
      n1: node('Igualmente! De onde és?', 'Vzájemně! Odkud jsi?', [
        ch('good', 'Sou de Praga. Sou checo.', 'Jsem z Prahy. Jsem Čech.', 'Skvěle: původ s „sou de“ a národnost s „sou“.', 'n2'),
        ch('ok', 'Praga.', 'Praha.', 'Dobré, ale úplná věta je lepší: „Sou de Praga.“', 'n2'),
        ch('bad', 'Estou bem, obrigado.', 'Mám se dobře, děkuji.', 'Ana se ptala, odkud jsi, ne jak se máš.', 'n2'),
      ]),
      n2: node('Falas português?', 'Mluvíš portugalsky?', [
        ch('good', 'Falo um pouco de português.', 'Mluvím trochu portugalsky.', 'Přesně tak se to říká.', 'n3'),
        ch('ok', 'Não percebo.', 'Nerozumím.', 'To je pravda, ale ptala se, jestli mluvíš. Lépe: „Falo um pouco.“', 'n3'),
        ch('bad', 'Boa noite!', 'Dobrý večer!', 'Odpověz na otázku, zda mluvíš portugalsky.', 'n3'),
      ]),
      n3: node('Que bom! Como estás hoje?', 'To je skvělé! Jak se dnes máš?', [
        ch('good', 'Estou bem, obrigado. E tu?', 'Mám se dobře, děkuji. A ty?', 'Výborně: odpověď + zdvořilá zpětná otázka.', 'n4'),
        ch('ok', 'Bem.', 'Dobře.', 'Stačí, ale zdvořilejší je celá věta a „E tu?“', 'n4'),
        ch('bad', 'Sou checo.', 'Jsem Čech.', 'Tohle už jsi řekl. Ana se ptá, jak se máš.', 'n4'),
      ]),
      n4: node('Também estou bem. Até logo!', 'Taky se mám dobře. Na shledanou!', [
        ch('good', 'Até logo! Obrigado pela conversa!', 'Na shledanou! Díky za rozhovor!', BYE_TIP, null),
        ch('ok', 'Adeus.', 'Nashledanou.', 'Správně, ale „Até logo“ je přátelštější.', null),
        ch('bad', 'Bom dia!', 'Dobré ráno!', '„Bom dia“ je pozdrav při příchodu, ne při odchodu.', null),
      ]),
    },
  },
  {
    id: 'pastelaria',
    title: 'Na pastelaria',
    emoji: '☕',
    unitId: 'a1-u4',
    npcName: 'Empregado',
    setting: 'Jsi v lisabonské pastelaria a chceš si dát snídani.',
    goal: 'Zdvořile si objednej bica a pastel de nata a zaplať.',
    start: 'n0',
    nodes: {
      n0: node('Bom dia! O que deseja?', 'Dobrý den! Co si přejete?', [
        ch('good', 'Bom dia! Queria uma bica e um pastel de nata, por favor.', 'Dobrý den! Chtěl(a) bych bica a pastel de nata, prosím.', 'Perfeito! „Queria…“ je zdvořilá objednávka.', 'n1'),
        ch('ok', 'Quero uma bica.', 'Chci espresso.', 'Srozumitelné, ale příkré. Zdvořileji: „Queria… por favor.“', 'n1'),
        ch('bad', 'Adeus!', 'Nashledanou!', '„Adeus“ se říká při loučení. Odpověz na „O que deseja?“', 'n0b'),
      ]),
      n0b: node('Desculpe… O que deseja?', 'Promiňte… co si přejete?', [
        ch('good', 'Queria um café, por favor.', 'Chtěl(a) bych espresso, prosím.', 'Takhle to je správně.', 'n1'),
        ch('ok', 'Café.', 'Espresso.', 'Stačí, ale přidej „por favor“.', 'n1'),
        ch('bad', 'Obrigado.', 'Děkuji.', 'Ještě sis nic neobjednal(a).', 'n1'),
      ]),
      n1: node('Com certeza. Mais alguma coisa?', 'Samozřejmě. Ještě něco?', [
        ch('good', 'Não, é tudo. A conta, se faz favor.', 'Ne, to je vše. Účet, prosím.', 'Výborně: „A conta, se faz favor“ je klasika.', 'n2'),
        ch('good', 'Sim. Uma água, por favor.', 'Ano. Vodu, prosím.', 'Dobře, doobjednáváš další věc.', 'n1b'),
        ch('bad', 'Eu tenho fome.', 'Mám hlad.', 'Ptají se, jestli chceš ještě něco objednat.', 'n2'),
      ]),
      n1b: node('Uma água. Com gás ou sem gás?', 'Vodu. S bublinkami, nebo bez?', [
        ch('good', 'Sem gás, por favor.', 'Bez bublinek, prosím.', 'Přesně: „sem gás“ = bez bublinek.', 'n2'),
        ch('ok', 'Água.', 'Voda.', 'Odpověz konkrétně: „sem gás“ nebo „com gás“.', 'n2'),
        ch('bad', 'Pastel.', 'Pastel.', 'Neodpovídá to na otázku, s bublinkami, nebo bez.', 'n2'),
      ]),
      n2: node('São dois euros e vinte.', 'To jsou dvě eura dvacet.', [
        ch('good', 'Posso pagar com cartão?', 'Mohu platit kartou?', 'Správná zdvořilá otázka.', 'n3'),
        ch('ok', 'Aqui tem.', 'Tady máte.', 'Platíš hotově, to je v pořádku.', 'n4'),
        ch('bad', 'Quanto custa?', 'Kolik to stojí?', 'Cenu ti právě řekli.', 'n4'),
      ]),
      n3: node('Claro, sem problema. Aqui tem o recibo.', 'Jistě, bez problému. Tady máte účtenku.', [
        ch('good', 'Muito obrigado. Até logo!', 'Moc děkuji. Na shledanou!', BYE_TIP, null),
        ch('ok', 'Adeus.', 'Nashledanou.', 'Správně, ale „Até logo“ je přátelštější.', null),
        ch('bad', 'Bom dia!', 'Dobré ráno!', '„Bom dia“ je pozdrav při příchodu.', null),
      ]),
      n4: node('Obrigado e até logo!', 'Děkuji a na shledanou!', [
        ch('good', 'Obrigado! Até logo!', 'Děkuji! Na shledanou!', BYE_TIP, null),
        ch('ok', 'Adeus.', 'Nashledanou.', 'Správně, ale „Até logo“ je přátelštější.', null),
        ch('bad', 'Bom dia!', 'Dobré ráno!', '„Bom dia“ je pozdrav při příchodu.', null),
      ]),
    },
  },
  {
    id: 'comboio',
    title: 'Bilhete de comboio',
    emoji: '🚆',
    unitId: 'a1-u6',
    npcName: 'Funcionária',
    setting: 'Jsi u pokladny na nádraží v Lisabonu.',
    goal: 'Kup zpáteční jízdenku do Porta a zjisti, kdy vlak odjíždí.',
    start: 'n0',
    nodes: {
      n0: node('Bom dia. Diga.', 'Dobrý den. Poslouchám.', [
        ch('good', 'Bom dia. Queria um bilhete para o Porto, por favor.', 'Dobrý den. Chtěl(a) bych jízdenku do Porta, prosím.', 'Skvělé! Pozdrav + „queria“ + „por favor“.', 'n1'),
        ch('ok', 'Bilhete Porto.', 'Jízdenka Porto.', 'Pochopí tě, ale chybí sloveso a zdvořilost: „Queria um bilhete para o Porto.“', 'n1'),
        ch('bad', 'Onde fica a casa de banho?', 'Kde jsou toalety?', 'Tohle je pokladna, přišel(a) jsi koupit jízdenku.', 'n0b'),
      ]),
      n0b: node('Isto é a bilheteira. Quer comprar um bilhete?', 'Tady je pokladna. Chcete koupit jízdenku?', [
        ch('good', 'Sim, queria um bilhete para o Porto.', 'Ano, chtěl(a) bych jízdenku do Porta.', 'Takhle.', 'n1'),
        ch('ok', 'Sim.', 'Ano.', 'Stačí, ale řekni kam: „…para o Porto“.', 'n1'),
        ch('bad', 'Não.', 'Ne.', 'Ale chceš jet do Porta!', 'n1'),
      ]),
      n1: node('De ida ou de ida e volta?', 'Jednosměrnou, nebo zpáteční?', [
        ch('good', 'De ida e volta, por favor.', 'Zpáteční, prosím.', 'Přesně.', 'n2'),
        ch('ok', 'Ida e volta.', 'Tam a zpět.', 'Rozumí se, ale přidej „de“ a „por favor“.', 'n2'),
        ch('bad', 'Vou de comboio.', 'Jedu vlakem.', 'Neodpověděl(a) jsi, jestli jednosměrnou, nebo zpáteční.', 'n2'),
      ]),
      n2: node('São vinte e cinco euros. Quer pagar com cartão?', 'To je dvacet pět eur. Chcete platit kartou?', [
        ch('good', 'Sim, com cartão, por favor.', 'Ano, kartou, prosím.', 'Správně.', 'n3'),
        ch('ok', 'Em dinheiro.', 'V hotovosti.', 'Také správně.', 'n3'),
        ch('bad', 'Tenho fome.', 'Mám hlad.', 'To nesouvisí s otázkou.', 'n3'),
      ]),
      n3: node('Aqui tem o bilhete.', 'Tady máte jízdenku.', [
        ch('good', 'Obrigado. A que horas parte o comboio?', 'Děkuji. V kolik odjíždí vlak?', 'Výborně: poděkování + užitečná otázka.', 'n4'),
        ch('ok', 'Obrigado.', 'Děkuji.', 'Slušné, ale nezjistil(a) jsi, kdy vlak jede.', 'n5'),
        ch('bad', 'Boa noite.', 'Dobrý večer.', 'Není vhodné, poděkuj za jízdenku.', 'n5'),
      ]),
      n4: node('Parte às dez e meia, do cais três.', 'Odjíždí v půl jedenácté z nástupiště tři.', [
        ch('good', 'Muito obrigado. Até logo!', 'Moc děkuji. Na shledanou!', BYE_TIP, null),
        ch('ok', 'Obrigado.', 'Děkuji.', 'Správně, ale můžeš se rozloučit.', null),
        ch('bad', 'De que cais?', 'Z kterého nástupiště?', 'Právě ti řekla: cais três.', null),
      ]),
      n5: node('Boa viagem!', 'Šťastnou cestu!', [
        ch('good', 'Obrigado! Até logo!', 'Děkuji! Na shledanou!', BYE_TIP, null),
        ch('ok', 'Adeus.', 'Nashledanou.', 'Správně, ale „Até logo“ je přátelštější.', null),
        ch('bad', 'Bom dia!', 'Dobré ráno!', '„Bom dia“ je pozdrav při příchodu.', null),
      ]),
    },
  },
  {
    id: 'caminho',
    title: 'Perguntar o caminho',
    emoji: '🧭',
    unitId: 'a1-u6',
    npcName: 'Rui',
    setting: 'Hledáš v Lisabonu lékárnu a oslovíš kolemjdoucího.',
    goal: 'Zeptej se na cestu a ujisti se, že jsi vše pochopil(a).',
    start: 'n0',
    nodes: {
      n0: node('Boa tarde. Precisa de ajuda?', 'Dobré odpoledne. Potřebujete pomoc?', [
        ch('good', 'Boa tarde. Com licença, onde fica a farmácia?', 'Dobré odpoledne. S dovolením, kde je lékárna?', 'Výborně: „Com licença, onde fica…?“', 'n1'),
        ch('ok', 'Farmácia?', 'Lékárna?', 'Pochopí, ale zdvořileji: „Onde fica a farmácia?“', 'n1'),
        ch('bad', 'Adeus.', 'Nashledanou.', 'To je rozloučení. Řekni, co hledáš.', 'n0b'),
      ]),
      n0b: node('Desculpe? Procura alguma coisa?', 'Promiňte? Hledáte něco?', [
        ch('good', 'Sim, onde fica a farmácia?', 'Ano, kde je lékárna?', 'Takhle.', 'n1'),
        ch('ok', 'Farmácia.', 'Lékárna.', 'Přidej sloveso: „Onde fica…?“', 'n1'),
        ch('bad', 'Não.', 'Ne.', 'Ale hledáš lékárnu!', 'n1'),
      ]),
      n1: node('Siga em frente e vire à direita. Fica ao lado do banco.', 'Jděte rovně a odbočte doprava. Je vedle banky.', [
        ch('good', 'Fica longe?', 'Je to daleko?', 'Dobrá otázka.', 'n2'),
        ch('good', 'Pode repetir, por favor?', 'Můžete to zopakovat, prosím?', 'Ptát se na zopakování je v pořádku.', 'n1r'),
        ch('ok', 'Não percebo.', 'Nerozumím.', 'Pravda, ale lépe: „Pode repetir, por favor?“', 'n1r'),
        ch('bad', 'Sim, adeus.', 'Ano, nashledanou.', 'Rozloučil(a) ses, aniž bys něco řekl(a) k cestě.', 'n2'),
      ]),
      n1r: node('Claro. Siga em frente, depois vire à direita. A farmácia fica ao lado do banco.', 'Jistě. Jděte rovně, pak doprava. Lékárna je vedle banky.', [
        ch('good', 'Fica longe?', 'Je to daleko?', 'Dobrá otázka.', 'n2'),
        ch('ok', 'Obrigado.', 'Děkuji.', 'Slušné, ale nezjistil(a) jsi vzdálenost.', 'n2'),
        ch('bad', 'Pode repetir?', 'Můžete to zopakovat?', 'Právě to zopakovala, zkus se zeptat, jak je to daleko.', 'n2'),
      ]),
      n2: node('Não, fica a cinco minutos a pé.', 'Ne, je to pět minut pěšky.', [
        ch('good', 'Muito obrigado. Até logo!', 'Moc děkuji. Na shledanou!', BYE_TIP, null),
        ch('ok', 'Obrigado.', 'Děkuji.', 'Správně, ale můžeš se rozloučit.', null),
        ch('bad', 'Fica longe?', 'Je to daleko?', 'To už jsi se zeptal(a), odpověděl(a) ti.', null),
      ]),
    },
  },
  {
    id: 'loja',
    title: 'Na loja de roupa',
    emoji: '🧥',
    unitId: 'a1-u7',
    npcName: 'Empregada',
    setting: 'Jsi v obchodě s oblečením a líbí se ti jeden kabát.',
    goal: 'Zeptej se na cenu, vyzkoušej si kabát a zaplať.',
    start: 'n0',
    nodes: {
      n0: node('Boa tarde! Posso ajudar?', 'Dobré odpoledne! Mohu pomoci?', [
        ch('good', 'Boa tarde. Quanto custa este casaco?', 'Dobré odpoledne. Kolik stojí tenhle kabát?', 'Výborně: pozdrav a rovnou otázka.', 'n1'),
        ch('good', 'Estou só a ver, obrigado.', 'Jen se dívám, děkuji.', 'Typická odpověď v obchodě v Portugalsku.', 'n0b'),
        ch('bad', 'Tenho fome.', 'Mám hlad.', 'To nesouvisí s nákupem.', 'n1'),
      ]),
      n0b: node('Com certeza. Se precisar de ajuda, é só dizer.', 'Samozřejmě. Když budete potřebovat pomoc, stačí říct.', [
        ch('good', 'Obrigado. Quanto custa este casaco?', 'Děkuji. Kolik stojí tenhle kabát?', 'Správně.', 'n1'),
        ch('ok', 'Casaco.', 'Kabát.', 'Přidej otázku: „Quanto custa?“', 'n1'),
        ch('bad', 'Adeus.', 'Nashledanou.', 'Ještě jsi nic nezjistil(a).', 'n1'),
      ]),
      n1: node('Custa sessenta euros.', 'Stojí šedesát eur.', [
        ch('good', 'Posso experimentar?', 'Mohu si to vyzkoušet?', 'Přesně.', 'n2'),
        ch('ok', 'É caro.', 'To je drahé.', 'Možné, ale chceš ho vyzkoušet.', 'n2'),
        ch('bad', 'Quero pagar.', 'Chci platit.', 'Nejdřív si to vyzkoušej.', 'n2'),
      ]),
      n2: node('Claro! Então, gostou?', 'Jistě! Tak co, líbí se vám?', [
        ch('good', 'Gostei. Fico com este.', 'Líbí se mi. Vezmu si ho.', 'Skvěle: „Fico com este.“', 'n3'),
        ch('good', 'É pequeno. Tem um tamanho maior?', 'Je malý. Máte větší velikost?', 'Výborně!', 'n2b'),
        ch('ok', 'Sim.', 'Ano.', 'Správně, ale řekni, že ho bereš: „Fico com este.“', 'n3'),
        ch('bad', 'Não, obrigado. Adeus.', 'Ne, děkuji. Nashledanou.', 'Odcházíš bez nákupu, scénář tím končí.', null),
      ]),
      n2b: node('Aqui tem um tamanho maior. Gostou?', 'Tady máte větší velikost. Líbí se vám?', [
        ch('good', 'Gostei. Fico com este.', 'Líbí se mi. Vezmu si ho.', 'Skvěle.', 'n3'),
        ch('ok', 'Sim.', 'Ano.', 'Správně, ale řekni, že ho bereš: „Fico com este.“', 'n3'),
        ch('bad', 'Não.', 'Ne.', 'Odcházíš bez nákupu, scénář tím končí.', null),
      ]),
      n3: node('Quer pagar em dinheiro ou com cartão?', 'Chcete platit hotově, nebo kartou?', [
        ch('good', 'Com cartão, por favor.', 'Kartou, prosím.', 'Přesně.', 'n4'),
        ch('ok', 'Em dinheiro.', 'V hotovosti.', 'Také správně.', 'n4'),
        ch('bad', 'Sim.', 'Ano.', 'Otázka byla „hotově, nebo kartou“, „sim“ neodpovídá.', 'n4'),
      ]),
      n4: node('Quer fatura com contribuinte?', 'Chcete fakturu s daňovým číslem?', [
        ch('good', 'Sim, por favor.', 'Ano, prosím.', 'V Portugalsku se obchody často ptají na NIF (contribuinte).', 'n5'),
        ch('good', 'Não, obrigado.', 'Ne, děkuji.', 'Také v pořádku.', 'n5'),
        ch('bad', 'Quanto custa?', 'Kolik to stojí?', 'Cenu už znáš.', 'n5'),
      ]),
      n5: node('Aqui tem. Obrigada e até logo!', 'Tady máte. Děkuji a na shledanou!', [
        ch('good', 'Obrigado! Até logo!', 'Děkuji! Na shledanou!', BYE_TIP, null),
        ch('ok', 'Adeus.', 'Nashledanou.', 'Správně, ale „Até logo“ je přátelštější.', null),
        ch('bad', 'Bom dia!', 'Dobré ráno!', '„Bom dia“ je pozdrav při příchodu.', null),
      ]),
    },
  },
];

export const getScenario = (id: string): Scenario | undefined => scenarios.find((s) => s.id === id);
