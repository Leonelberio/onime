"use client";

/** Carillon synthétisé (Web Audio) : aucun fichier audio à héberger. Nécessite un geste utilisateur préalable. */
let ctx: AudioContext | null = null;

export function unlockAudio(): boolean {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return false;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx.state !== "closed";
  } catch {
    return false;
  }
}

export function playChime() {
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  [[880, 0], [1175, 0.16], [1480, 0.32]].forEach(([freq, delay]) => {
    const osc = ctx!.createOscillator();
    const gain = ctx!.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + delay);
    gain.gain.exponentialRampToValueAtTime(0.25, now + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.5);
    osc.connect(gain).connect(ctx!.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.55);
  });
}
