/** Značka aplikace: vlajka (zelená 2/5, červená 3/5) se žlutým kruhem (armilární sféra). */
export const Logo = ({ class: cls = 'h-8 w-8' }: { class?: string }) => (
  <svg viewBox="0 0 32 32" class={cls} role="img" aria-label="Portuglove">
    <defs>
      <clipPath id="logo-clip"><rect width="32" height="32" rx="8" /></clipPath>
    </defs>
    <g clip-path="url(#logo-clip)">
      <rect width="32" height="32" fill="#da291c" />
      <rect width="12.8" height="32" fill="#046a38" />
      <circle cx="12.8" cy="16" r="6.2" fill="none" stroke="#ffe900" stroke-width="2.2" />
      <circle cx="12.8" cy="16" r="2.6" fill="#fff" />
    </g>
  </svg>
);
