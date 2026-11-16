// Umožní testům importovat zdrojové .ts soubory se „extensionless“ importy (jako je používá Vite).
import { register } from 'node:module';
register('./resolve-hook.mjs', import.meta.url);
