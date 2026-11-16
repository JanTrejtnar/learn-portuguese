import type { ComponentChildren } from 'preact';

const tones = {
  plain: 'border-line bg-surface',
  right: 'border-green-600 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100',
  wrong: 'border-red-600 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
};

/** Spodní lišta s hlavní akcí (Zkontrolovat, Další…): na telefonu je pod palcem a nic se nemusí scrollovat. */
export const BottomBar = ({ tone = 'plain', children }: { tone?: keyof typeof tones; children: ComponentChildren }) => (
  <div class={`fixed inset-x-0 bottom-0 z-40 border-t-2 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${tones[tone]}`}>
    <div class="mx-auto max-w-xl">{children}</div>
  </div>
);

export const bigBtn = 'flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-700 px-4 py-3 text-base font-bold text-white shadow-soft hover:bg-brand-600 disabled:opacity-40';
