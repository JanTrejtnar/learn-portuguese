import { speak, useVoiceStatus } from '../lib/audio';

interface Props {
  text: string;
  size?: 'sm' | 'md';
  /** Zobrazit i tlačítko pro pomalé přehrání. */
  withSlow?: boolean;
}

const btn =
  'inline-flex items-center justify-center rounded-full bg-brand-100 text-brand-700 transition hover:bg-brand-500 hover:text-white focus-visible:outline-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-900 dark:text-brand-100';

export const AudioButton = ({ text, size = 'sm', withSlow = false }: Props) => {
  const status = useVoiceStatus();
  const disabled = status === 'unsupported' || status === 'no-pt-pt';
  const dim = size === 'md' ? 'h-12 w-12 text-xl' : 'h-8 w-8 text-base';
  const title = disabled ? 'Na tomto zařízení není k dispozici hlas pt-PT' : 'Přehrát výslovnost (pt-PT)';

  return (
    <span class="inline-flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        class={`${btn} ${dim}`}
        disabled={disabled}
        title={title}
        aria-label={`Přehrát: ${text}`}
        onClick={(e) => {
          e.stopPropagation();
          speak(text);
        }}
      >
        🔊
      </button>
      {withSlow && (
        <button
          type="button"
          class={`${btn} ${dim}`}
          disabled={disabled}
          title="Přehrát pomalu"
          aria-label={`Přehrát pomalu: ${text}`}
          onClick={(e) => {
            e.stopPropagation();
            speak(text, { slow: true });
          }}
        >
          🐢
        </button>
      )}
    </span>
  );
};
