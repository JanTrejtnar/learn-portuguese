import { useVoiceStatus } from '../lib/audio';

/** Upozornění, když zařízení neumí číst evropskou portugalštinu. */
export const VoiceWarning = () => {
  const status = useVoiceStatus();
  if (status === 'ready' || status === 'unknown') return null;

  const text =
    status === 'unsupported'
      ? 'Tento prohlížeč nepodporuje čtení textu nahlas, audio nebude fungovat.'
      : 'Na tomto zařízení není nainstalován hlas pro evropskou portugalštinu (pt-PT). Aby se nepřehrávala jiná než evropská výslovnost, audio je vypnuté. Hlas pt-PT (např. Joana) lze doinstalovat v nastavení systému (Hlasový výstup / Text-to-speech).';

  return (
    <p role="alert" class="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
      🔇 {text}
    </p>
  );
};
