import type { PaymentMethod } from "@prisma/client";
import type { PaymentProvider } from "./provider";

const manual: PaymentProvider = { id: "MANUAL", label: "Enregistrement manuel", online: false };

const notImplemented = (id: PaymentMethod, label: string, envs: string[]): PaymentProvider => ({
  id,
  label,
  online: true,
  async createCheckout() {
    throw new Error(`${label} n'est pas encore branché (V1). Variables prévues : ${envs.join(", ")}. Voir docs/BILLING.md.`);
  },
  async parseWebhook() {
    throw new Error(`${label} : vérification de webhook non implémentée (V1). Voir docs/BILLING.md.`);
  },
});

/** FedaPay / PayDunya : points d'extension documentés, non actifs en V1. */
export const providers: Record<PaymentMethod, PaymentProvider> = {
  MANUAL: manual,
  FEDAPAY: notImplemented("FEDAPAY", "FedaPay", ["FEDAPAY_SECRET_KEY", "FEDAPAY_WEBHOOK_SECRET"]),
  PAYDUNYA: notImplemented("PAYDUNYA", "PayDunya", ["PAYDUNYA_MASTER_KEY", "PAYDUNYA_PRIVATE_KEY", "PAYDUNYA_TOKEN"]),
};

export function getProvider(id: string): PaymentProvider | null {
  const key = id.toUpperCase() as PaymentMethod;
  return providers[key] ?? null;
}
