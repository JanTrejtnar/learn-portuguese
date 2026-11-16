import { useEffect, useState } from 'preact/hooks';
import { AudioButton } from '../components/AudioButton';
import { Breadcrumb } from '../components/Breadcrumb';
import { VoiceWarning } from '../components/VoiceWarning';
import { GrammarBlockView } from '../components/GrammarBlockView';
import { WordRow } from '../components/WordRow';
import { getLesson } from '../content';
import { href } from '../router';
import { NotFoundPage } from './NotFoundPage';

const PAGE = 5;

export const LessonPage = ({ id }: { id: string }) => {
  const found = getLesson(id);
  const [tab, setTab] = useState('words');
  const [page, setPage] = useState(0);
  useEffect(() => { setTab('words'); setPage(0); }, [id]);
  if (!found) return <NotFoundPage />;
  const { unit, lesson } = found;
  const nextLesson = unit.lessons[unit.lessons.findIndex((l) => l.id === lesson.id) + 1];
  const pages = Math.ceil(lesson.words.length / PAGE);
  const tabs = [
    { id: 'words', label: `Slovíčka · ${lesson.words.length}` },
    ...(lesson.grammar ? [{ id: 'grammar', label: 'Gramatika' }] : []),
    ...(lesson.dialogue ? [{ id: 'dialogue', label: 'Dialog' }] : []),
  ];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Lekce', to: '/' }, { label: unit.title, to: `/unit/${unit.id}` }, { label: lesson.title }]} />
      <h1 class="text-2xl font-bold" lang="pt-PT">{lesson.title}</h1>
      <p class="text-ink-soft">{lesson.subtitle}</p>

      <div class="mt-4 flex flex-wrap gap-2">
        <a href={href(`/cards/${lesson.id}`)} class="inline-flex min-h-11 items-center rounded-xl bg-brand-700 px-4 py-2 font-semibold text-white hover:bg-brand-600">🃏 Kartičky</a>
        <a href={href(`/quiz/${lesson.id}`)} class="inline-flex min-h-11 items-center rounded-xl border border-brand-700 px-4 py-2 font-semibold text-brand-700 dark:text-brand-100">Test lekce</a>
        {nextLesson
          ? <a href={href(`/lesson/${nextLesson.id}`)} class="inline-flex min-h-11 items-center rounded-xl border border-line-strong px-4 py-2 font-semibold">Další →</a>
          : <a href={href(`/quiz/${unit.id}`)} class="inline-flex min-h-11 items-center rounded-xl border border-line-strong px-4 py-2 font-semibold">🏆 Test jednotky →</a>}
      </div>

      {tabs.length > 1 && (
        <div class="mt-5 flex gap-2" role="tablist" aria-label="Části lekce">
          {tabs.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              class={`min-h-11 rounded-xl px-4 py-2 font-bold ${tab === t.id ? 'bg-brand-700 text-white shadow-soft' : 'border border-line-strong bg-surface'}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === 'words' && (
        <section class="mt-4">
          <VoiceWarning />
          <ul class="space-y-2">{lesson.words.slice(page * PAGE, (page + 1) * PAGE).map((word) => <WordRow key={word.id} word={word} />)}</ul>
          {pages > 1 && (
            <div class="mt-3 flex items-center justify-between gap-2">
              <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} class="min-h-11 rounded-xl border border-line-strong px-4 font-semibold disabled:opacity-40">← Zpět</button>
              <span class="text-sm font-semibold text-ink-soft" aria-live="polite">{page + 1} / {pages}</span>
              <button type="button" disabled={page === pages - 1} onClick={() => setPage(page + 1)} class="min-h-11 rounded-xl bg-brand-700 px-4 font-semibold text-white disabled:opacity-40">Dál →</button>
            </div>
          )}
        </section>
      )}

      {tab === 'grammar' && lesson.grammar && (
        <section class="mt-4">
          <h2 class="mb-3 text-lg font-semibold">{lesson.grammar.title}</h2>
          <GrammarBlockView block={lesson.grammar} />
        </section>
      )}

      {tab === 'dialogue' && lesson.dialogue && (
        <section class="mt-4">
          <ul class="space-y-2">
            {lesson.dialogue.map((line, i) => (
              <li key={i} class="rounded-xl border border-line bg-surface p-3">
                <span class="text-xs font-semibold text-brand-700 dark:text-brand-100">{line.speaker}</span>
                <p lang="pt-PT" class="flex items-center gap-2 font-medium">
                  <AudioButton text={line.pt} />
                  {line.pt}
                </p>
                <p class="text-sm text-muted">{line.cs}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
