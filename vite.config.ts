import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Relativní base: funguje na GitHub Pages i v podadresáři.
  base: './',
  plugins: [preact(), tailwindcss()],
});
