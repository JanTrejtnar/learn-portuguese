import { render } from 'preact';
import { registerSW } from 'virtual:pwa-register';
import { App } from './app';
import { initInstallCapture } from './lib/install';
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
    // bez oznámení: offline režim je v Nastavení
  },
});

render(<App />, document.getElementById('app')!);
