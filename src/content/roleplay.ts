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
  {
    id: 'hotel',
    title: 'Check-in no hotel',
    emoji: '🏨',
    unitId: 'a2-u3',
    npcName: 'Rececionista',
    setting: 'Přijíždíš do hotelu v Lisabonu a máš rezervaci.',
    goal: 'Přihlas se k rezervaci, zeptej se na snídani a na wi-fi.',
    start: 'n0',
    nodes: {
      n0: node('Boa tarde! Em que posso ajudar?', 'Dobré odpoledne! Čím mohu pomoci?', [
        ch('good', 'Boa tarde! Tenho uma reserva em nome de Novák.', 'Dobré odpoledne! Mám rezervaci na jméno Novák.', 'Perfeito: „Tenho uma reserva em nome de…“', 'n1'),
        ch('ok', 'Reserva Novák.', 'Rezervace Novák.', 'Srozumitelné, ale lépe celou větou: „Tenho uma reserva…“', 'n1'),
        ch('bad', 'Adeus!', 'Nashledanou!', 'Právě jsi přišel(a), pozdrav: „Boa tarde!“', 'n1'),
      ]),
      n1: node('Sim, vejo aqui. Um quarto duplo para duas noites, certo?', 'Ano, vidím to. Dvoulůžkový pokoj na dvě noci, správně?', [
        ch('good', 'Sim, está certo. Obrigado.', 'Ano, je to správně. Děkuji.', 'Potvrdit rezervaci zdvořile.', 'n2'),
        ch('ok', 'Sim.', 'Ano.', 'Stačí, ale zdvořilost si říká o „obrigado“.', 'n2'),
        ch('bad', 'Não percebo.', 'Nerozumím.', 'Věta byla jednoduchá, zkus potvrdit „Sim, está certo.“', 'n2'),
      ]),
      n2: node('O quarto é no terceiro andar. Quer o pequeno-almoço incluído?', 'Pokoj je ve třetím patře. Chcete snídani v ceně?', [
        ch('good', 'Sim, por favor. A que horas é o pequeno-almoço?', 'Ano, prosím. V kolik je snídaně?', 'Skvěle: potvrzení + doplňující otázka.', 'n3'),
        ch('ok', 'Sim, por favor.', 'Ano, prosím.', 'Správně. Můžeš se zeptat i, v kolik hodin je snídaně.', 'n3'),
        ch('bad', 'Quero uma bica.', 'Chci espresso.', 'Otázka byla o snídani v ceně, ne o kávě.', 'n3'),
      ]),
      n3: node('É das sete e meia às dez. Precisa de mais alguma coisa?', 'Je od půl osmé do deseti. Potřebujete ještě něco?', [
        ch('good', 'Qual é a palavra-passe do wi-fi?', 'Jaké je heslo k wi-fi?', 'Přesně: „palavra-passe“ je heslo.', 'n4'),
        ch('ok', 'Wi-fi?', 'Wi-fi?', 'Zkus celou větou: „Qual é a palavra-passe do wi-fi?“', 'n4'),
        ch('bad', 'Quanto custa a água?', 'Kolik stojí voda?', 'Zeptej se na wi-fi.', 'n4'),
      ]),
      n4: node('Está no cartão. Aqui tem a chave. Boa estadia!', 'Je na kartičce. Tady je klíč. Příjemný pobyt!', [
        ch('good', 'Muito obrigado! Boa tarde!', 'Moc děkuji! Hezké odpoledne!', BYE_TIP, null),
        ch('ok', 'Obrigado.', 'Děkuji.', 'Správně, můžeš přidat i přání.', null),
        ch('bad', 'Bom dia!', 'Dobré ráno!', 'Je odpoledne, ráno už je pryč.', null),
      ]),
    },
  },
  {
    id: 'farmacia',
    title: 'Na farmácia',
    emoji: '💊',
    unitId: 'a2-u4',
    npcName: 'Farmacêutica',
    setting: 'Bolí tě hlava a hrdlo a jdeš do lékárny.',
    goal: 'Popiš, co tě bolí, a zeptej se, jak lék užívat.',
    start: 'n0',
    nodes: {
      n0: node('Bom dia! Em que posso ajudar?', 'Dobrý den! Čím mohu pomoci?', [
        ch('good', 'Bom dia! Dói-me a cabeça e a garganta.', 'Dobrý den! Bolí mě hlava a v krku.', 'Správně: „Dói-me…“ (jedno), „Doem-me…“ (více).', 'n1'),
        ch('ok', 'Cabeça.', 'Hlava.', 'Lépe celou větou: „Dói-me a cabeça.“', 'n1'),
        ch('bad', 'Quero uma cerveja.', 'Chci pivo.', 'Jsi v lékárně, popiš potíže.', 'n1'),
      ]),
      n1: node('Há quanto tempo tem estes sintomas?', 'Jak dlouho máte tyto potíže?', [
        ch('good', 'Desde ontem. Também tenho febre.', 'Od včerejška. Mám i horečku.', 'Výborně: „desde ontem“.', 'n2'),
        ch('ok', 'Ontem.', 'Včera.', 'Lépe: „Desde ontem.“', 'n2'),
        ch('bad', 'Amanhã.', 'Zítra.', 'Ptá se, jak dlouho to trvá, ne kdy bude.', 'n2'),
      ]),
      n2: node('Tem alergias a medicamentos?', 'Máte alergii na léky?', [
        ch('good', 'Não, não tenho alergias.', 'Ne, nemám alergie.', 'Důležitá informace v lékárně.', 'n3'),
        ch('ok', 'Não.', 'Ne.', 'Stačí, ale celá věta je jistější.', 'n3'),
        ch('bad', 'Sim, tenho muito frio.', 'Ano, je mi velká zima.', 'Ptala se na alergie, ne na počasí.', 'n3'),
      ]),
      n3: node('Então recomendo estes comprimidos. Tome um de manhã e outro à noite.', 'Pak doporučuji tyto tablety. Berte jednu ráno a jednu večer.', [
        ch('good', 'Quantos dias devo tomar?', 'Kolik dní je mám brát?', 'Dobrá otázka na dávkování.', 'n4'),
        ch('ok', 'Sim.', 'Ano.', 'Zeptej se na detail: „Quantos dias?“', 'n4'),
        ch('bad', 'Onde fica o museu?', 'Kde je muzeum?', 'Neodpovídá situaci.', 'n4'),
      ]),
      n4: node('Durante cinco dias. São dez euros.', 'Pět dní. Platíte deset eur.', [
        ch('good', 'Posso pagar com cartão? Obrigado!', 'Mohu platit kartou? Děkuji!', BYE_TIP, null),
        ch('ok', 'Tome. Obrigado.', 'Tady. Děkuji.', 'Funguje, ale zeptej se na kartu zdvořile.', null),
        ch('bad', 'É muito barato, adeus!', 'To je moc levné, nashledanou!', 'Zbytečný komentář; zaplať a pozdrav.', null),
      ]),
    },
  },
  {
    id: 'telefone',
    title: 'Pozvání po telefonu',
    emoji: '📱',
    unitId: 'a2-u5',
    npcName: 'Rita',
    setting: 'Voláš kamarádce Ritě a zveš ji do kina.',
    goal: 'Pozdrav, pozvi ji a domluv čas a místo.',
    start: 'n0',
    nodes: {
      n0: node('Estou? Olá, Tomás! Tudo bem?', 'Haló? Ahoj, Tomáši! Všechno v pořádku?', [
        ch('good', 'Olá, Rita! Estou bem, e tu?', 'Ahoj, Rito! Mám se dobře, a ty?', 'Přátelské a zdvořilé.', 'n1'),
        ch('ok', 'Olá.', 'Ahoj.', 'Zeptej se i, jak se má ona: „E tu?“', 'n1'),
        ch('bad', 'Adeus!', 'Nashledanou!', 'Hovor právě začal, pozdrav.', 'n1'),
      ]),
      n1: node('Também estou bem. Diz, o que se passa?', 'Taky se mám dobře. Povídej, co se děje?', [
        ch('good', 'Queres ir ao cinema comigo amanhã?', 'Chceš jít zítra se mnou do kina?', 'Přirozené pozvání s „queres“.', 'n2'),
        ch('ok', 'Cinema, amanhã.', 'Kino, zítra.', 'Použij celou větu: „Queres ir ao cinema?“', 'n2'),
        ch('bad', 'Não tenho tempo.', 'Nemám čas.', 'Ty ji zveš, neodmítej.', 'n2'),
      ]),
      n2: node('Boa ideia! A que horas é o filme?', 'Dobrý nápad! V kolik je film?', [
        ch('good', 'É às oito. Encontramo-nos às sete e meia?', 'Je v osm. Sejdeme se v půl osmé?', 'Výborně: čas + návrh sejít se.', 'n3'),
        ch('ok', 'Às oito.', 'V osm.', 'Správně, přidej návrh, kdy se sejdete.', 'n3'),
        ch('bad', 'Ontem.', 'Včera.', 'Film je zítra večer.', 'n3'),
      ]),
      n3: node('Combinado. E onde nos encontramos?', 'Domluveno. A kde se sejdeme?', [
        ch('good', 'À porta do cinema, por favor.', 'U vchodu do kina, prosím.', 'Přesně.', 'n4'),
        ch('ok', 'No cinema.', 'V kině.', 'Lépe: „À porta do cinema.“', 'n4'),
        ch('bad', 'Em Praga.', 'V Praze.', 'Neodpovídá, jde o místo schůzky.', 'n4'),
      ]),
      n4: node('Perfeito! Até amanhã, então!', 'Skvělé! Tak zítra!', [
        ch('good', 'Até amanhã! Beijinhos!', 'Do zítřka! Pusinky!', 'Neformální a přátelské rozloučení.', null),
        ch('ok', 'Adeus.', 'Nashledanou.', 'Správně, ale „Até amanhã“ sedí lépe.', null),
        ch('bad', 'Bom dia!', 'Dobré ráno!', 'Je večer a loučíte se.', null),
      ]),
    },
  },
  {
    id: 'arrendar',
    title: 'Pronájem bytu',
    emoji: '🔑',
    unitId: 'a2-u7',
    npcName: 'Senhorio',
    setting: 'Prohlížíš si byt k pronájmu v Lisabonu.',
    goal: 'Zeptej se na cenu, kauci a vybavení bytu.',
    start: 'n0',
    nodes: {
      n0: node('Bom dia! Este é o apartamento. É um T2.', 'Dobrý den! Tohle je ten byt. Je to 2+1.', [
        ch('good', 'Bom dia! Gosto da sala. Quanto é a renda?', 'Dobrý den! Líbí se mi obývací pokoj. Kolik je nájem?', 'Pochvala + hlavní otázka.', 'n1'),
        ch('ok', 'Quanto custa?', 'Kolik to stojí?', 'Lépe: „Quanto é a renda?“ (nájem).', 'n1'),
        ch('bad', 'Quero um café.', 'Chci kávu.', 'Zeptej se na byt.', 'n1'),
      ]),
      n1: node('A renda é novecentos euros por mês.', 'Nájem je devět set eur měsíčně.', [
        ch('good', 'E a caução? Quantos meses?', 'A kauce? Kolik měsíců?', 'Typická otázka u pronájmu.', 'n2'),
        ch('ok', 'É caro.', 'To je drahé.', 'Zeptej se na kauci: „E a caução?“', 'n2'),
        ch('bad', 'Não gosto.', 'Nelíbí se mi.', 'Ještě jsi nezjistil(a) podmínky.', 'n2'),
      ]),
      n2: node('A caução é de dois meses. O apartamento é mobilado.', 'Kauce jsou dva měsíce. Byt je zařízený.', [
        ch('good', 'Tem frigorífico e fogão?', 'Je tam lednice a sporák?', 'Konkrétní otázka na vybavení.', 'n3'),
        ch('ok', 'Sim.', 'Ano.', 'Zeptej se na vybavení.', 'n3'),
        ch('bad', 'Onde fica a estação?', 'Kde je nádraží?', 'Nesouvisí s vybavením bytu.', 'n3'),
      ]),
      n3: node('Sim, tem tudo. Também há uma varanda.', 'Ano, je tam všechno. Je tu i balkon.', [
        ch('good', 'Ótimo! Posso ver a cozinha?', 'Skvělé! Mohu vidět kuchyni?', 'Zdvořilá prosba.', 'n4'),
        ch('ok', 'Quero a cozinha.', 'Chci kuchyni.', 'Zdvořileji: „Posso ver…?“', 'n4'),
        ch('bad', 'Adeus.', 'Nashledanou.', 'Prohlídka teprve začíná.', null),
      ]),
      n4: node('Claro. Quando quer assinar o contrato?', 'Jistě. Kdy chcete podepsat smlouvu?', [
        ch('good', 'Preciso de pensar. Telefono amanhã, pode ser?', 'Potřebuji si to rozmyslet. Zavolám zítra, může být?', 'Zdvořilé a konkrétní.', null),
        ch('ok', 'Amanhã.', 'Zítra.', 'Lépe celou větou.', null),
        ch('bad', 'Não sei o que dizer.', 'Nevím, co říct.', 'Zkus domluvit, kdy zavoláš.', null),
      ]),
    },
  },
  {
    id: 'entrevista',
    title: 'Pracovní pohovor',
    emoji: '💼',
    unitId: 'a2-u7',
    npcName: 'Dra. Sofia',
    setting: 'Jsi na pohovoru ve firmě v Lisabonu.',
    goal: 'Představ se, řekni své zkušenosti a zeptej se na plat.',
    start: 'n0',
    nodes: {
      n0: node('Bom dia! Pode apresentar-se, por favor?', 'Dobrý den! Můžete se, prosím, představit?', [
        ch('good', 'Bom dia! Chamo-me Tomás, sou da Chéquia e vivo em Lisboa.', 'Dobrý den! Jmenuji se Tomáš, jsem z Česka a žiji v Lisabonu.', 'Jasné a stručné představení.', 'n1'),
        ch('ok', 'Tomás.', 'Tomáš.', 'Řekni víc: odkud jsi a kde žiješ.', 'n1'),
        ch('bad', 'Adeus!', 'Nashledanou!', 'Pohovor teprve začíná.', 'n1'),
      ]),
      n1: node('Onde trabalhou antes?', 'Kde jste pracoval dříve?', [
        ch('good', 'Trabalhei num escritório durante três anos.', 'Pracoval jsem tři roky v kanceláři.', 'Správně: pretérito „trabalhei“.', 'n2'),
        ch('ok', 'No escritório.', 'V kanceláři.', 'Lépe celou větou v minulém čase.', 'n2'),
        ch('bad', 'Amanhã trabalho.', 'Zítra pracuji.', 'Ptá se na minulost.', 'n2'),
      ]),
      n2: node('Fala inglês?', 'Mluvíte anglicky?', [
        ch('good', 'Sim, falo inglês e um pouco de português.', 'Ano, mluvím anglicky a trochu portugalsky.', 'Pravdivá a konkrétní odpověď.', 'n3'),
        ch('ok', 'Sim.', 'Ano.', 'Můžeš dodat i portugalštinu.', 'n3'),
        ch('bad', 'Não percebo nada.', 'Vůbec nerozumím.', 'Odpověz, jaké jazyky umíš.', 'n3'),
      ]),
      n3: node('Muito bem. Tem alguma pergunta?', 'Dobře. Máte nějakou otázku?', [
        ch('good', 'Sim. Qual é o salário e o horário de trabalho?', 'Ano. Jaký je plat a pracovní doba?', 'Správné otázky na pohovoru.', 'n4'),
        ch('ok', 'Salário?', 'Plat?', 'Zkus celou větou.', 'n4'),
        ch('bad', 'Não gosto de trabalhar.', 'Nerad pracuji.', 'To na pohovoru neříkej.', 'n4'),
      ]),
      n4: node('O salário é de mil euros. Entramos em contacto esta semana.', 'Plat je tisíc eur. Ozveme se tento týden.', [
        ch('good', 'Muito obrigado pela entrevista. Até breve!', 'Moc děkuji za pohovor. Brzy na shledanou!', 'Zdvořilé ukončení.', null),
        ch('ok', 'Obrigado. Adeus.', 'Děkuji. Nashledanou.', 'Správně, ale dodej poděkování za pohovor.', null),
        ch('bad', 'Bom dia!', 'Dobré ráno!', 'Při odchodu se říká „até breve“ nebo „adeus“.', null),
      ]),
    },
  },
];

export const getScenario = (id: string): Scenario | undefined => scenarios.find((s) => s.id === id);
