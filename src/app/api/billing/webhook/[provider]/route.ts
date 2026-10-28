import { getProvider } from "@/lib/billing/providers";

/**
 * Hook de webhook de paiement (FedaPay / PayDunya) - NON ACTIVÉ EN V1.
 * Implémentation prévue : provider.parseWebhook() vérifie la signature, puis on appelle
 * applyPayment() (src/lib/billing/apply.ts). Voir docs/BILLING.md.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  const p = getProvider(provider);
  if (!p || !p.online) return Response.json({ error: "Fournisseur inconnu" }, { status: 404 });
  return Response.json({ error: `${p.label} : webhook non implémenté en V1`, docs: "docs/BILLING.md" }, { status: 501 });
}
