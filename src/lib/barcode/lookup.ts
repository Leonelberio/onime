import "server-only";
import { db } from "../db";
import { normalizeBarcode } from "./normalize";

export type ProductLookupHit = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  unitPrice: number;
  stockQty: number;
  minStock: number;
};

/** Trouve un produit actif par SKU ou code-barres (boutique courante). */
export async function findProductByScannedCode(boutiqueId: string, rawCode: string): Promise<ProductLookupHit | null> {
  const code = normalizeBarcode(rawCode);
  if (!code) return null;

  const product = await db.product.findFirst({
    where: {
      boutiqueId,
      active: true,
      OR: [
        { sku: code },
        { barcode: code },
        { sku: { equals: code, mode: "insensitive" } },
        { barcode: { equals: code, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      sku: true,
      barcode: true,
      unitPrice: true,
      stockQty: true,
      minStock: true,
    },
  });

  return product;
}
