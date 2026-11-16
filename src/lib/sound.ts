/** Krátký vítězný zvuk bez audio souborů (WebAudio). Selhání je tiché. */
let ctx: AudioContext | undefined;

export const playChime = (): void => {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    const t0 = ctx.currentTime + 0.02;
    // C dur: C5 – E5 – G5 – C6
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = t0 + i * 0.11;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.16, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + (i === 3 ? 0.7 : 0.25));
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + 0.8);
    });
  } catch {
    /* zvuk je bonus */
  }
};
