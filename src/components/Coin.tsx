/** Zlatá mince (SVG) – místo emoji, aby vypadala stejně všude. */
export const Coin = ({ class: cls = 'h-5 w-5' }: { class?: string }) => (
  <svg viewBox="0 0 24 24" class={`inline-block shrink-0 align-[-0.2em] ${cls}`} aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#f5c518" stroke="#b8900e" stroke-width="1.5" />
    <circle cx="12" cy="12" r="7.6" fill="none" stroke="#b8900e" stroke-width="1.2" />
    <path d="M12 7.2l1.4 3 3.3.4-2.4 2.3.6 3.2L12 14.4l-2.9 1.7.6-3.2-2.4-2.3 3.3-.4z" fill="#b8900e" />
  </svg>
);
