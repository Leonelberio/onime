import type { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { computePaymentPeriod } from "../subscription";

export interface ApplyPaymentParams {
  organizationId: string;
  planId: string | null;
  amount: number;
  months: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  reference?: string | null;
  note?: string | null;
  externalId?: string | null;
  recordedBy?: string | null;
  now?: Date;
}

/**
 * Point d'entrée UNIQUE pour activer / prolonger un abonnement (niveau organisation).
 */
export async function applyPayment(tx: Prisma.TransactionClient, p: ApplyPaymentParams) {
  const status = p.status ?? "PAID";
  const now = p.now ?? new Date();

  if (p.externalId) {
    const existing = await tx.payment.findUnique({ where: { method_externalId: { method: p.method, externalId: p.externalId } } });
    if (existing && existing.status === "PAID") return existing;
  }

  const organization = await tx.organization.findUniqueOrThrow({
    where: { id: p.organizationId },
    select: { subscriptionEndsAt: true },
  });

  if (status !== "PAID") {
    return tx.payment.create({
      data: {
        organizationId: p.organizationId,
        planId: p.planId,
        amount: p.amount,
        months: p.months,
        method: p.method,
        status,
        reference: p.reference ?? null,
        note: p.note ?? null,
        externalId: p.externalId ?? null,
        recordedBy: p.recordedBy ?? null,
      },
    });
  }

  const period = computePaymentPeriod(organization.subscriptionEndsAt, p.months, now);

  const payment = await tx.payment.create({
    data: {
      organizationId: p.organizationId,
      planId: p.planId,
      amount: p.amount,
      months: p.months,
      method: p.method,
      status,
      reference: p.reference ?? null,
      note: p.note ?? null,
      externalId: p.externalId ?? null,
      recordedBy: p.recordedBy ?? null,
      periodStart: period.start,
      periodEnd: period.end,
    },
  });
  await tx.organization.update({
    where: { id: p.organizationId },
    data: { subscriptionEndsAt: period.end, ...(p.planId ? { planId: p.planId } : {}) },
  });
  return payment;
}
