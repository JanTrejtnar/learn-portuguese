import type { GrammarBlock } from '../types';

/** Gramatický blok lekce (text + případná tabulka). */
export const GrammarBlockView = ({ block }: { block: GrammarBlock }) => (
  <div class="space-y-3 rounded-2xl border border-line bg-surface p-4">
    {block.body.map((p, i) => <p key={i}>{p}</p>)}
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
                {row.map((cell, j) => <td key={j} class="py-2 pr-4" lang={j > 0 ? 'pt-PT' : undefined}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
