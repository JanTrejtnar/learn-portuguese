import { AudioButton } from '../components/AudioButton';
import { Breadcrumb } from '../components/Breadcrumb';
import { VoiceWarning } from '../components/VoiceWarning';
import { GrammarBlockView } from '../components/GrammarBlockView';
import { WordRow } from '../components/WordRow';
import { getLesson } from '../content';
import { href } from '../router';
import { NotFoundPage } from './NotFoundPage';

export const LessonPage = ({ id }: { id: string }) => {
  const found = getLesson(id);
  if (!found) return <NotFoundPage />;
  const { unit, lesson } = found;
  const nextLesson = unit.lessons[unit.lessons.findIndex((l) => l.id === lesson.id) + 1];

  return (
    <div>
      <Breadcrumb items={[{ label: 'Lekce', to: '/' }, { label: unit.title, to: `/unit/${unit.id}` }, { label: lesson.title }]} />
      <h1 class="text-2xl font-bold" lang="pt-PT">{lesson.title}</h1>
      <p class="text-ink-soft">{lesson.subtitle}</p>

      <h2 class="mt-8 mb-3 text-lg font-semibold">Slovní zásoba</h2>
      <VoiceWarning />
      <ul class="space-y-2">{lesson.words.map((word) => <WordRow key={word.id} word={word} />)}</ul>

      {lesson.grammar && (
        <section class="mt-10">
          <h2 class="mb-3 text-lg font-semibold">Gramatika: {lesson.grammar.title}</h2>
          <GrammarBlockView block={lesson.grammar} />
        </section>
      )}

      {lesson.dialogue && (
        <section class="mt-10">
          <h2 class="mb-3 text-lg font-semibold">Dialog</h2>
          <ul class="space-y-2">
            {lesson.dialogue.map((line, i) => (
              <li key={i} class="rounded-xl border border-line bg-surface p-3">
                <span class="text-xs font-semibold text-brand-700">{line.speaker}</span>
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

      <section class="mt-10 rounded-2xl border border-brand-600/40 bg-brand-50 p-4 dark:bg-brand-900/40">
        <h2 class="font-semibold">Dokončení lekce</h2>
        <p class="mt-1 text-sm text-ink-soft">1. Nauč se slovíčka na kartičkách. 2. Ověř si je krátkým testem.</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <a href={href(`/cards/${lesson.id}`)} class="rounded-xl bg-brand-700 px-4 py-2.5 font-semibold text-white hover:bg-brand-600">1. Kartičky</a>
          <a href={href(`/quiz/${lesson.id}`)} class="rounded-xl border border-brand-700 px-4 py-2.5 font-semibold text-brand-700 dark:text-brand-100">2. Test lekce</a>
          {nextLesson
            ? <a href={href(`/lesson/${nextLesson.id}`)} class="rounded-xl border border-line-strong px-4 py-2.5 font-semibold">Další lekce: {nextLesson.title} →</a>
            : <a href={href(`/quiz/${unit.id}`)} class="rounded-xl border border-line-strong px-4 py-2.5 font-semibold">🏆 Test jednotky →</a>}
        </div>
      </section>
    </div>
  );
};
