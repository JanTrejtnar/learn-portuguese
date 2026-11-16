// Export obsahu pro revizi rodilým mluvčím: CSV (UTF-8 s BOM, otevře se v Excelu i Google Tabulkách).
// Spuštění: npm run export:review [-- výstup.csv]
// Sloupce „oprava“ a „poznámka revizora“ vyplní revizor; opravy se pak ručně promítnou do src/content/.
import { writeFileSync } from 'node:fs';
import { units } from '../src/content/index.ts';

const out = process.argv[2] ?? 'review-export.csv';
const cols = ['úroveň', 'jednotka', 'lekce', 'typ', 'id', 'portugalsky', 'česky', 'doslova', 'použití / poznámka', 'příklad PT', 'příklad CZ', 'oprava', 'poznámka revizora'];
const cell = (v: string | undefined): string => `"${(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
const rows: string[][] = [];

for (const u of units) {
  for (const l of u.lessons) {
    const head = [u.level, `${u.level}.${u.order} ${u.title}`, l.title];
    for (const w of l.words) rows.push([...head, 'slovíčko', w.id, w.pt, w.cs, w.literal ?? '', [w.usage, w.note].filter(Boolean).join(' | '), w.example?.pt ?? '', w.example?.cs ?? '', '', '']);
    for (const g of l.grammar ? (Array.isArray(l.grammar) ? l.grammar : [l.grammar]) : []) {
      rows.push([...head, 'gramatika', '', g.title, g.body.join(' / '), '', g.table ? g.table.rows.map((r) => r.join(' · ')).join(' // ') : '', '', '', '', '']);
    }
    for (const d of l.dialogue ?? []) rows.push([...head, 'dialog', '', d.pt, d.cs, '', d.speaker, '', '', '', '']);
    for (const c of l.cloze ?? []) rows.push([...head, 'doplňování', '', c.pt.replace('___', `[${c.answer}]`), c.cs, '', `špatné možnosti: ${c.distractors.join(', ')}`, '', '', '', '']);
  }
}

writeFileSync(out, '﻿' + [cols, ...rows].map((r) => r.map(cell).join(',')).join('\n') + '\n');
console.log(`Exportováno ${rows.length} řádků do ${out}`);
