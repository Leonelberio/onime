/**
 * Limiteur très simple en mémoire (fenêtre glissante) pour freiner le brute-force sur /connexion.
 * Limite connue : par instance serverless. Pour une protection forte, brancher Upstash/Redis.
 */
const hits = new Map<string, number[]>();

/** RATE_LIMIT_MULTIPLIER (ex. 100) assouplit les seuils pour les tests de bout en bout ; 1 par défaut. */
const multiplier = () => Math.max(1, Number(process.env.RATE_LIMIT_MULTIPLIER) || 1);

export function rateLimit(key: string, maxBase: number, windowMs: number, now = Date.now()): boolean {
  const max = maxBase * multiplier();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return true;
}
