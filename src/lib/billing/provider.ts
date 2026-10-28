/**
 * Abstraction du paiement d'abonnement.
 *
 * V1 : `manual` - le super-admin enregistre un paiement reçu (Mobile Money, espèces, virement…).
 * Plus tard : `fedapay`, `paydunya` - créent une session de paiement puis confirment via webhook.
 * Dans tous les cas, l'activation de l'abonnement passe par `applyPayment` (src/lib/billing/apply.ts).
 */
import type { PaymentMethod } from "@prisma/client";

export interface CheckoutRequest {
  boutiqueId: string;
  planId: string;
  months: number;
  amount: number; // FCFA
  customerEmail: string;
  returnUrl: string;
}

export interface CheckoutSession {
  /** URL vers laquelle rediriger le Gérant (page de paiement hébergée). */
  redirectUrl: string;
  /** Identifiant de transaction côté fournisseur (stocké dans Payment.externalId). */
  externalId: string;
}

export interface WebhookResult {
  externalId: string;
  paid: boolean;
  amount?: number;
}

export interface PaymentProvider {
  readonly id: PaymentMethod;
  readonly label: string;
  /** Paiement en ligne ? false pour `manual`. */
  readonly online: boolean;
  createCheckout?(req: CheckoutRequest): Promise<CheckoutSession>;
  /** Vérifie la signature du webhook et renvoie l'état du paiement. */
  parseWebhook?(rawBody: string, headers: Headers): Promise<WebhookResult>;
}
