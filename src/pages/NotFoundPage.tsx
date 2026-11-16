import { href } from '../router';

export const NotFoundPage = () => (
  <div class="py-16 text-center">
    <div class="text-5xl" aria-hidden="true">🤷</div>
    <h1 class="mt-4 text-xl font-bold">Stránka nenalezena</h1>
    <a href={href('/')} class="mt-4 inline-block text-brand-700 underline">Zpět na lekce</a>
  </div>
);
