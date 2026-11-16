import { Breadcrumb } from '../components/Breadcrumb';
import { REPORT_URL, REPO_URL, SPEAKING_ENABLED } from '../lib/config';

const Section = ({ title, children }: { title: string; children: preact.ComponentChildren }) => (
  <section class="mt-6">
    <h2 class="mb-2 text-lg font-bold">{title}</h2>
    <div class="space-y-2 text-ink-soft">{children}</div>
  </section>
);

export const AboutPage = () => (
  <div class="mx-auto max-w-xl">
    <Breadcrumb items={[{ label: 'Nastavení', to: '/settings' }, { label: 'O aplikaci' }]} />
    <h1 class="text-2xl font-bold">O aplikaci a soukromí</h1>

    <Section title="Co je Portuglove">
      <p>Aplikace pro výuku <b>evropské portugalštiny (PT-PT)</b> v češtině, úrovně A1 až B1. Je zdarma a bez reklam.</p>
    </Section>

    <Section title="Obsah zatím nezkontroloval rodilý mluvčí">
      <p>Lekce, překlady, vysvětlení a příklady vznikly s pomocí umělé inteligence a <b>nebyly ověřeny rodilým mluvčím</b>. Mohou obsahovat chyby, zvlášť v gramatice vyšších úrovní (konjuntiv, infinitivo pessoal, zájmena). U položek, které tě zarazí, si je ověř ve slovníku nebo u zkušeného mluvčího.</p>
      <p>Když chybu najdeš, pomůže, když ji nahlásíš: <a class="font-semibold text-brand-700 underline dark:text-brand-100" href={REPORT_URL} target="_blank" rel="noopener noreferrer">nahlásit chybu</a> (otevře se stránka GitHubu; napiš, v které lekci a u které věty).</p>
    </Section>

    <Section title="Soukromí a data">
      <ul class="list-disc space-y-1 pl-5">
        <li><b>Žádné účty, žádné sledování.</b> Aplikace neposílá nikam tvůj pokrok, nepoužívá analytiku ani cookies.</li>
        <li>Pokrok a nastavení jsou uložené <b>jen v tomto prohlížeči</b> (IndexedDB a localStorage). Když data prohlížeče smažeš, pokrok zmizí. Proto je v Nastavení záloha do souboru.</li>
        {SPEAKING_ENABLED && <li><b>Výslovnost a mikrofon:</b> rozpoznávání řeči zajišťuje tvůj prohlížeč (v Chrome a Edge se zvuk posílá na servery jeho výrobce, například Google). Aplikace sama žádný zvuk neukládá ani neodesílá. Mluvení je volitelné.</li>}
        {!SPEAKING_ENABLED && <li><b>Mikrofon se nepoužívá.</b> Aplikace nikdy nežádá o přístup k mikrofonu ani ke kameře.</li>}
        <li><b>Audio slovíček</b> přehrává hlas tvého zařízení (syntéza řeči). Kvalita závisí na tom, zda má zařízení portugalský hlas z Portugalska.</li>
        <li>Aplikaci poskytuje statický hosting (GitHub Pages). Poskytovatel hostingu může podle svých pravidel zaznamenávat IP adresy návštěvníků; aplikace k tomu nepřidává nic.</li>
      </ul>
    </Section>

    <Section title="Licence">
      <p>Kód aplikace je pod licencí MIT, studijní obsah pod <a class="font-semibold text-brand-700 underline dark:text-brand-100" href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.cs" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a> (sdílet a upravovat lze nekomerčně se stejnou licencí). Zdrojový kód je na <a class="font-semibold text-brand-700 underline dark:text-brand-100" href={REPO_URL} target="_blank" rel="noopener noreferrer">GitHubu</a>.</p>
    </Section>

    <Section title="Dostupnost">
      <p>Po prvním načtení funguje aplikace i bez internetu. Nové verze se stáhnou samy.</p>
    </Section>
  </div>
);
