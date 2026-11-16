import { Breadcrumb } from '../components/Breadcrumb';
import { AudioButton } from '../components/AudioButton';
import { VoiceWarning } from '../components/VoiceWarning';
import { falseFriends, pronunciation } from '../content/pronunciation';
import { href } from '../router';

export const PronunciationPage = () => (
  <div class="mx-auto max-w-xl">
    <Breadcrumb items={[{ label: 'Procvičit', to: '/practice' }, { label: 'Výslovnost a pasti' }]} />
    <h1 class="text-2xl font-bold">Výslovnost PT-PT a pasti pro Čechy</h1>
    <p class="mt-1 text-ink-soft">Co se v evropské portugalštině vyslovuje jinak, než čekáš. Český přepis je jen přibližný, rozhoduje poslech.</p>
    <VoiceWarning />

    {pronunciation.map((t) => (
      <section key={t.id} class="mt-5 rounded-2xl border border-line bg-surface p-4">
        <h2 class="text-lg font-bold"><span aria-hidden="true">{t.emoji}</span> {t.title}</h2>
        {t.text.map((p) => <p key={p} class="mt-2 text-sm text-ink-soft">{p}</p>)}
        <ul class="mt-3 space-y-2">
          {t.examples.map((e) => (
            <li key={e.pt + e.approx} class="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2">
              <AudioButton text={e.pt.split(',')[0]!} />
              <span class="min-w-0">
                <span lang="pt-PT" class="font-semibold">{e.pt}</span>
                <span class="ml-2 text-sm text-muted">≈ {e.approx}</span>
                <span class="block text-sm text-ink-soft">{e.cs}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    ))}

    <h2 class="mt-9 mb-1 text-xl font-bold">Falešní přátelé a pasti</h2>
    <p class="text-sm text-ink-soft">Slova, která vypadají nebo znějí povědomě, ale znamenají něco jiného.</p>
    <ul class="mt-3 space-y-3">
      {falseFriends.map((f) => (
        <li key={f.id} class="rounded-2xl border border-line bg-surface p-4">
          <div class="flex items-center gap-2">
            <span lang="pt-PT" class="text-lg font-bold">{f.pt}</span>
            <AudioButton text={f.pt.split(/\s*[×/]\s*/)[0]!} />
          </div>
          <p class="mt-1 text-sm text-muted">Past: {f.trap}</p>
          <p class="mt-1"><b>Znamená:</b> {f.meaning}</p>
          {f.instead && <p class="text-sm text-ink-soft">Správně pro to druhé: <span lang="pt-PT">{f.instead}</span></p>}
          <p class="mt-2 flex items-center gap-2 text-sm"><AudioButton text={f.example.pt.split('. ')[0]!} /><span><span lang="pt-PT" class="font-semibold">{f.example.pt}</span> <span class="text-ink-soft">{f.example.cs}</span></span></p>
        </li>
      ))}
    </ul>

    <a href={href('/pairs')} class="mt-8 inline-flex min-h-11 items-center rounded-xl bg-brand-700 px-5 py-2.5 font-semibold text-white">👂 Procvičit minimální páry</a>
  </div>
);
