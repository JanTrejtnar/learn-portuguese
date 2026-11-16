import type { GrammarBlock } from '../types';
import { AudioButton } from './AudioButton';

/** České znaky, které v portugalštině nejsou: takový text se nepřehrává portugalským hlasem. */
const CZECH = /[ěščřžůďťňý]/i;
const speakable = (t: string): boolean => {
  const x = t.trim();
  return x.length > 1 && /\p{L}/u.test(x) && !CZECH.test(x);
};

/** Odstavec: portugalské výrazy v „uvozovkách“ dostanou tlačítko s reproduktorem. */
const Paragraph = ({ text }: { text: string }) => (
  <p>
    {text.split(/(„[^“]+“)/).map((part, i) => {
      const m = /^„([^“]+)“$/.exec(part);
      if (!m || !speakable(m[1]!)) return part;
      const pt = m[1]!.replace(/\s*\/\s*/g, ' / ');
      return <span key={i} class="whitespace-nowrap"><span lang="pt-PT">{part}</span><span class="ml-1 align-middle"><AudioButton text={pt} /></span></span>;
    })}
  </p>
);

/** Gramatický blok lekce (text + případná tabulka); portugalské věty a tvary jdou přehrát. */
export const GrammarBlockView = ({ block }: { block: GrammarBlock }) => (
  <div class="space-y-3 rounded-2xl border border-line bg-surface p-4">
    {block.body.map((p, i) => <Paragraph key={i} text={p} />)}
    {block.table && (
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-line">
              {block.table.headers.map((h) => <th key={h} class="py-2 pr-4 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {block.table.rows.map((row, i) => (
              <tr key={i} class="border-b border-line last:border-0">
                {row.map((cell, j) => {
                  const pt = j > 0 || /port/i.test(block.table!.headers[0] ?? '');
                  return (
                    <td key={j} class="py-2 pr-4" lang={pt ? 'pt-PT' : undefined}>
                      {pt && speakable(cell) ? <span class="inline-flex items-center gap-2"><AudioButton text={cell} />{cell}</span> : cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
