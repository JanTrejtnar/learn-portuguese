import { SPEAKING_ENABLED } from '../lib/config';
import { unlockedWords } from '../content';
import { useProgress } from '../lib/useProgress';
import { Icon } from '../components/Icon';
import { href } from '../router';

const Item = ({ to, icon, title, text, primary, count }: { to: string; icon: Parameters<typeof Icon>[0]['name']; title: string; text: string; primary?: boolean; count?: number }) => (
  <li>
    <a href={href(to)} class={`flex items-center gap-4 rounded-2xl border p-4 ${primary ? 'border-transparent bg-brand-700 text-white hover:bg-brand-600' : 'border-line bg-surface hover:border-brand-500'}`}>
      <span class={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${primary ? 'bg-white/15' : 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-100'}`}><Icon name={icon} class="h-6 w-6" /></span>
      <span class="min-w-0 flex-1">
        <span class="block font-semibold">{title}</span>
        <span class={`block text-sm ${primary ? 'opacity-90' : 'text-ink-soft'}`}>{text}</span>
      </span>
      {count !== undefined && count > 0 && <span class={`shrink-0 rounded-full px-2.5 py-1 text-sm font-extrabold ${primary ? 'bg-gold-400 text-brand-950' : 'bg-brand-700 text-white'}`} aria-label={`${count} k opakování`}>{count}</span>}
    </a>
  </li>
);

const Group = ({ title, children }: { title: string; children: preact.ComponentChildren }) => (
  <section class="mt-6">
    <h2 class="mb-2 text-sm font-bold uppercase tracking-wider text-muted">{title}</h2>
    <ul class="space-y-3">{children}</ul>
  </section>
);

export const PracticePage = () => {
  const progress = useProgress();
  const now = Date.now();
  const due = progress ? unlockedWords(progress.tests).filter((w) => (progress.cards.get(w.id)?.due ?? Infinity) <= now).length : 0;
  return (
    <div>
      <h1 class="text-2xl font-bold">Procvičit</h1>
      <p class="mt-1 text-ink-soft">Nové věci se učíš v lekcích. Tady si je zopakuješ a vyzkoušíš v praxi.</p>

      <Group title="Opakování">
        <Item primary to="/cards/all" icon="cards" title="Karty na dnes" text="Slovíčka, která je právě čas zopakovat" count={due} />
        <Item to="/quiz/quick" icon="bolt" title="Rychlý kvíz" text="10 otázek na tvoje nejslabší slovíčka" />
      </Group>
      <Group title="Gramatika">
        <Item to="/gramatika" icon="book" title="Přehled gramatiky" text="Pravidla z odemčených lekcí s vyhledáváním" />
        <Item to="/grammar" icon="puzzle" title="Doplňování vět" text="Gramatika: věty s mezerou z lekcí" />
      </Group>
      <Group title="Praxe a výslovnost">
        <Item to="/roleplay" icon="mask" title="Scénáře" text="Rozhovory z reálných situací" />
        {SPEAKING_ENABLED && <Item to="/speak" icon="speech" title="Mluvení" text="Zopakuj větu nahlas a dostaneš zpětnou vazbu" />}
        <Item to="/vyslovnost" icon="speech" title="Výslovnost a pasti" text="Čím se PT-PT liší pro Čechy, falešní přátelé" />
        <Item to="/pairs" icon="ear" title="Minimální páry" text="Rozlišuj podobně znějící slova" />
      </Group>
    </div>
  );
};
