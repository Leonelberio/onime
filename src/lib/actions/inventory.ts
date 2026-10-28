"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../db";
import { emptyToNull, fail, guarded, parseForm, requireWritable, success, type ActionState } from "./shared";

const productSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(120),
  sku: z.string().trim().max(40).optional(),
  barcode: z.string().trim().max(64).optional(),
  description: z.string().trim().max(300).optional(),
  unitPrice: z.coerce.number().int().min(0),
  stockQty: z.coerce.number().int().min(0),
  minStock: z.coerce.number().int().min(0).default(0),
});

export async function createProduct(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { boutique } = await requireWritable({ ownerOnly: true });
    const parsed = parseForm(productSchema, fd);
    if ("error" in parsed) return parsed.error;
    const d = parsed.data;
    await db.product.create({
      data: {
        boutiqueId: boutique.id,
        name: d.name,
        sku: emptyToNull(d.sku),
        barcode: emptyToNull(d.barcode),
        description: emptyToNull(d.description),
        unitPrice: d.unitPrice,
        stockQty: d.stockQty,
        minStock: d.minStock,
      },
    });
    revalidatePath("/dashboard/stock");
    return success("Produit ajouté.");
  });
}

const adjustSchema = z.object({
  productId: z.string().min(1),
  delta: z.coerce.number().int().refine((n) => n !== 0, "Quantité requise"),
  reason: z.string().trim().min(2).max(120),
});

export async function adjustStock(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { boutique } = await requireWritable({ ownerOnly: true });
    const parsed = parseForm(adjustSchema, fd);
    if ("error" in parsed) return parsed.error;
    const d = parsed.data;
    const product = await db.product.findFirst({ where: { id: d.productId, boutiqueId: boutique.id } });
    if (!product) return fail("Produit introuvable.");
    const next = product.stockQty + d.delta;
    if (next < 0) return fail("Stock insuffisant pour cette sortie.");

    await db.$transaction([
      db.product.update({ where: { id: product.id }, data: { stockQty: next } }),
      db.stockMovement.create({
        data: { productId: product.id, delta: d.delta, reason: d.reason, refType: "manual" },
      }),
    ]);
    revalidatePath("/dashboard/stock");
    return success("Stock mis à jour.");
  });
}

const purchaseSchema = z.object({
  supplierId: z.string().optional(),
  reference: z.string().trim().max(60).optional(),
  note: z.string().trim().max(200).optional(),
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unitCost: z.coerce.number().int().min(0),
});

export async function createPurchase(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { boutique } = await requireWritable({ ownerOnly: true });
    const parsed = parseForm(purchaseSchema, fd);
    if ("error" in parsed) return parsed.error;
    const d = parsed.data;
    const product = await db.product.findFirst({ where: { id: d.productId, boutiqueId: boutique.id } });
    if (!product) return fail("Produit introuvable.");
    const total = d.quantity * d.unitCost;

    await db.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          boutiqueId: boutique.id,
          supplierId: emptyToNull(d.supplierId),
          reference: emptyToNull(d.reference),
          note: emptyToNull(d.note),
          status: "RECEIVED",
          total,
          receivedAt: new Date(),
          lines: {
            create: { productId: product.id, quantity: d.quantity, unitCost: d.unitCost },
          },
        },
      });
      await tx.product.update({
        where: { id: product.id },
        data: { stockQty: { increment: d.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          delta: d.quantity,
          reason: "Réception achat",
          refType: "purchase",
          refId: purchase.id,
        },
      });
    });

    revalidatePath("/dashboard/achats");
    revalidatePath("/dashboard/stock");
    return success("Achat enregistré et stock mis à jour.");
  });
}

const saleSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().trim().max(80).optional(),
  reference: z.string().trim().max(60).optional(),
  note: z.string().trim().max(200).optional(),
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().int().min(0),
});

export async function createSale(_prev: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const { boutique } = await requireWritable({ ownerOnly: true });
    const parsed = parseForm(saleSchema, fd);
    if ("error" in parsed) return parsed.error;
    const d = parsed.data;
    const product = await db.product.findFirst({ where: { id: d.productId, boutiqueId: boutique.id } });
    if (!product) return fail("Produit introuvable.");
    if (product.stockQty < d.quantity) return fail("Stock insuffisant pour cette vente.");

    const customerId = emptyToNull(d.customerId);
    let customerName = emptyToNull(d.customerName);
    if (customerId) {
      const customer = await db.customer.findFirst({ where: { id: customerId, boutiqueId: boutique.id } });
      if (!customer) return fail("Client introuvable.");
      customerName = customer.name;
    }

    const total = d.quantity * d.unitPrice;

    await db.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          boutiqueId: boutique.id,
          customerId,
          customerName,
          reference: emptyToNull(d.reference),
          note: emptyToNull(d.note),
          status: "CONFIRMED",
          total,
          confirmedAt: new Date(),
          lines: {
            create: { productId: product.id, quantity: d.quantity, unitPrice: d.unitPrice },
          },
        },
      });
      await tx.product.update({
        where: { id: product.id },
        data: { stockQty: { decrement: d.quantity } },
      });
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          delta: -d.quantity,
          reason: "Vente",
          refType: "sale",
          refId: sale.id,
        },
      });
    });

    revalidatePath("/dashboard/ventes");
    revalidatePath("/dashboard/stock");
    return success("Vente enregistrée.");
  });
}
