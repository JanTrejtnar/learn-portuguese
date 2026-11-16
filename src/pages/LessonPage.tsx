import { AudioButton } from '../components/AudioButton';
import { Breadcrumb } from '../components/Breadcrumb';
import { VoiceWarning } from '../components/VoiceWarning';
import { WordRow } from '../components/WordRow';
import { getLesson } from '../content';
import { href } from '../router';
import { NotFoundPage } from './NotFoundPage';

export const LessonPage = ({ id }: { id: string }) => {
  const found = getLesson(id);
  if (!found) return <NotFoundPage />;
  const { unit, lesson } = found;

  return (
    <div>
      <Breadcrumb items={[{ label: 'Lekce', to: '/' }, { label: unit.title, to: `/unit/${unit.id}` }, { label: lesson.title }]} />
      <h1 class="text-2xl font-bold" lang="pt-PT">{lesson.title}</h1>
      <p class="text-stone-600 dark:text-stone-400">{lesson.subtitle}</p>
      {!lesson.reviewed && (
        <p class="mt-3 text-xs text-stone-500">⚠️ Obsah zatím nezkontroloval rodilý mluvčí PT-PT.</p>
      )}

      <a href={href(`/cards/${lesson.id}`)} class="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white hover:bg-brand-600">
        🃏 Procvičit kartičky
      </a>

      <h2 class="mt-8 mb-3 text-lg font-semibold">Slovní zásoba</h2>
      <VoiceWarning />
      <ul class="space-y-2">{lesson.words.map((word) => <WordRow key={word.id} word={word} />)}</ul>

      {lesson.grammar && (
        <section class="mt-10">
          <h2 class="mb-3 text-lg font-semibold">Gramatika: {lesson.grammar.title}</h2>
          <div class="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            {lesson.grammar.body.map((p, i) => <p key={i}>{p}</p>)}
            {lesson.grammar.table && (
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                  <thead>
                    <tr class="border-b border-stone-200 dark:border-stone-700">
                      {lesson.grammar.table.headers.map((h) => <th key={h} class="py-2 pr-4 font-semibold">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {lesson.grammar.table.rows.map((row, i) => (
                      <tr key={i} class="border-b border-stone-100 last:border-0 dark:border-stone-800">
                        {row.map((cell, j) => <td key={j} class="py-2 pr-4" lang={j > 0 ? 'pt-PT' : undefined}>{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {lesson.dialogue && (
        <section class="mt-10">
          <h2 class="mb-3 text-lg font-semibold">Dialog</h2>
          <ul class="space-y-2">
            {lesson.dialogue.map((line, i) => (
              <li key={i} class="rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
                <span class="text-xs font-semibold text-brand-700">{line.speaker}</span>
                <p lang="pt-PT" class="flex items-center gap-2 font-medium">
                  <AudioButton text={line.pt} />
                  {line.pt}
                </p>
                <p class="text-sm text-stone-500">{line.cs}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
