/** Skeleton místo „Načítám…“ (méně poskakování obsahu). */
export const Loading = () => (
  <div class="space-y-3 py-4" role="status" aria-label="Načítám">
    <div class="skeleton h-8 w-2/3" />
    <div class="skeleton h-20 w-full" />
    <div class="skeleton h-20 w-full" />
    <div class="skeleton h-20 w-full" />
  </div>
);
