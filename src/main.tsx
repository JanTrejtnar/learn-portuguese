import { render } from 'preact';
import { registerSW } from 'virtual:pwa-register';
import { App } from './app';
import { initInstallCapture } from './lib/install';
import { toast } from './lib/toast';
import { initAccent } from './lib/accent';
import { applyTheme, getTheme, watchSystemTheme } from './lib/theme';
import './styles.css';

applyTheme(getTheme());
watchSystemTheme();
initAccent();
initInstallCapture();

// Service worker: po prvním načtení je aplikace dostupná i offline, nové verze se stáhnou samy.
registerSW({
  immediate: true,
  onOfflineReady() {
    try {
      if (localStorage.getItem('ap:offline-told')) return;
      localStorage.setItem('ap:offline-told', '1');
    } catch { /* bez úložiště ukážeme oznámení vždy */ }
    toast({ emoji: '📴', title: 'Připraveno offline', text: 'Aplikace teď funguje i bez připojení k internetu.' });
  },
});

render(<App />, document.getElementById('app')!);
