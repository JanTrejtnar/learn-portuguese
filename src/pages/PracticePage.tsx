import { href } from '../router';

const Item = ({ to, emoji, title, text, primary }: { to: string; emoji: string; title: string; text: string; primary?: boolean }) => (
  <li>
    <a href={href(to)} class={`flex items-center gap-4 rounded-2xl border p-4 ${primary ? 'border-transparent bg-brand-700 text-white hover:bg-brand-600' : 'border-line bg-surface hover:border-brand-500'}`}>
      <span class="text-3xl" aria-hidden="true">{emoji}</span>
      <span>
        <span class="block font-semibold">{title}</span>
        <span class={`block text-sm ${primary ? 'opacity-90' : 'text-ink-soft'}`}>{text}</span>
      </span>
    </a>
  </li>
);

export const PracticePage = () => (
  <div>
    <h1 class="text-2xl font-bold">Procvičit</h1>
    <p class="mt-1 text-ink-soft">Nové věci se učíš v lekcích. Tady si je zopakuješ a vyzkoušíš v praxi.</p>

    <ul class="mt-5 space-y-3">
      <Item primary to="/cards/all" emoji="🃏" title="Karty na dnes" text="Slovíčka, která je právě čas zopakovat" />
      <Item to="/quiz/quick" emoji="⚡" title="Rychlý kvíz" text="10 otázek na tvoje nejslabší slovíčka" />
      <Item to="/grammar" emoji="🧩" title="Doplňování vět" text="Gramatika: věty s mezerou z lekcí" />
      <Item to="/roleplay" emoji="🎭" title="Scénáře" text="Rozhovory z reálných situací" />
      <Item to="/speak" emoji="🎤" title="Mluvení" text="Zopakuj větu nahlas a dostaneš zpětnou vazbu" />
      <Item to="/pairs" emoji="👂" title="Minimální páry" text="Rozlišuj podobně znějící slova" />
    </ul>

    <p class="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-ink-soft">
      <a href={href('/cards')} class="underline">Jiná sada karet</a>
      <a href={href('/quiz')} class="underline">Testy lekcí a jednotek</a>
      <a href={href('/gramatika')} class="underline">Přehled gramatiky</a>
    </p>
  </div>
);
