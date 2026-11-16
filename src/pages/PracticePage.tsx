import { href } from '../router';

const items = [
  { to: '/roleplay', emoji: '🎭', title: 'Scénáře', text: 'Větvené rozhovory z reálných situací: pastelaria, nádraží, obchod, cesta.' },
  { to: '/pairs', emoji: '👂', title: 'Minimální páry', text: 'Rozlišuj podobně znějící slova: avó × avô, caro × carro, mês × mas…' },
  { to: '/speak', emoji: '🎤', title: 'Mluvení', text: 'Poslechni si větu, zopakuj ji nahlas a dostaneš zpětnou vazbu.' },
];

export const PracticePage = () => (
  <div>
    <h1 class="text-2xl font-bold">Praxe</h1>
    <p class="mt-1 text-stone-600 dark:text-stone-400">Použij, co ses naučil(a): poslech, rozhovor a mluvení.</p>
    <ul class="mt-6 space-y-3">
      {items.map((i) => (
        <li key={i.to}>
          <a href={href(i.to)} class="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5 hover:border-brand-500 dark:border-stone-800 dark:bg-stone-900">
            <span class="text-4xl" aria-hidden="true">{i.emoji}</span>
            <span>
              <span class="block text-lg font-semibold">{i.title}</span>
              <span class="block text-sm text-stone-600 dark:text-stone-400">{i.text}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  </div>
);
