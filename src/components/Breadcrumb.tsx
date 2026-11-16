import { href } from '../router';

export interface Crumb {
  label: string;
  to?: string;
}

export const Breadcrumb = ({ items }: { items: Crumb[] }) => (
  <nav aria-label="Drobečková navigace" class="mb-4 flex flex-wrap items-center gap-1 text-sm text-stone-500">
    {items.map((c, i) => (
      <span key={i} class="flex items-center gap-1">
        {i > 0 && <span aria-hidden="true">›</span>}
        {c.to ? <a href={href(c.to)} class="hover:text-brand-700 hover:underline">{c.label}</a> : <span class="text-stone-800 dark:text-stone-200">{c.label}</span>}
      </span>
    ))}
  </nav>
);
