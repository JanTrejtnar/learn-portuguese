/** Jednoduché liniové ikony (stroke = currentColor), aby rozhraní nebylo závislé na emoji. */
const paths: Record<string, preact.ComponentChildren> = {
  book: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17z" /><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /></>,
  cards: <><path d="m12 3 9 5-9 5-9-5 9-5z" /><path d="m3 13 9 5 9-5" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12.5 2.8 2.8L16 9.5" /></>,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  map: <><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  sliders: <><path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h10M20 18h0" /><circle cx="15" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="17" cy="18" r="2" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M21 13.2A8.5 8.5 0 1 1 10.8 3a6.8 6.8 0 0 0 10.2 10.2z" />,
  flame: <path d="M12 3c1 3 4 4.5 4 9a4 4 0 0 1-8 0c0-1.7.8-2.7 1.6-3.6C10.4 7.2 11.6 5.5 12 3z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />,
  puzzle: <path d="M10 4a2 2 0 1 1 4 0v2h4v4h-2a2 2 0 1 0 0 4h2v6h-6v-2a2 2 0 1 0-4 0v2H4v-6h2a2 2 0 1 0 0-4H4V6h6V4z" />,
  mask: <><path d="M4 5h16v6a8 8 0 0 1-16 0V5z" /><path d="M8.5 10h.01M15.5 10h.01M9 15c1.7 1.5 4.3 1.5 6 0" /></>,
  speech: <><path d="M4 5h16v10H9l-5 4V5z" /><path d="M8 9h8M8 12h5" /></>,
  ear: <path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a2.5 2.5 0 0 1-5 0M10 9a2 2 0 0 1 4 0" />,
  play: <path d="M7 4.5v15l12-7.5-12-7.5z" />,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4z" /><path d="M8 6H4v1a3 3 0 0 0 4 3M16 6h4v1a3 3 0 0 1-4 3M12 13v4M8 20h8M10 17h4" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
};

export const Icon = ({ name, class: cls = 'h-6 w-6', filled = false }: { name: keyof typeof paths; class?: string; filled?: boolean }) => (
  <svg viewBox="0 0 24 24" class={cls} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    {paths[name]}
  </svg>
);
