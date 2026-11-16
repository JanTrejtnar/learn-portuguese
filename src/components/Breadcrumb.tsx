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
    <div class="sticky top-[3.3rem] z-20 -mx-4 mb-2 bg-app/90 px-4 py-1 backdrop-blur-md md:top-0 md:mx-0 md:px-0">
      <a href={href(parent.to)} class="-ml-2 inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-sm font-semibold text-ink-soft hover:bg-surface-2 hover:text-brand-700">
        <Icon name="arrow" class="h-4 w-4 rotate-180" />
        {parent.label}
      </a>
    </div>
  );
};
