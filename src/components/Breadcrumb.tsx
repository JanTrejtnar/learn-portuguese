import { href } from '../router';
import { Icon } from './Icon';

export interface Crumb {
  label: string;
  to?: string;
}

/** Jednoduchá šipka zpět na nadřazenou stránku (poslední odkaz v cestě). */
export const Breadcrumb = ({ items }: { items: Crumb[] }) => {
  const parent = [...items].reverse().find((c) => c.to);
  if (!parent?.to) return null;
  return (
    <a href={href(parent.to)} class="mb-3 -ml-2 inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-sm font-semibold text-ink-soft hover:bg-surface-2 hover:text-brand-700">
      <Icon name="arrow" class="h-4 w-4 rotate-180" />
      {parent.label}
    </a>
  );
};
