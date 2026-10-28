import { normalizeBarcode } from "./normalize";

export type ScannableProduct = {
  id: string;
  name: string;
  stockQty: number;
  unitPrice: number;
  sku: string | null;
  barcode: string | null;
};

export function matchProductByCode(products: ScannableProduct[], rawCode: string): ScannableProduct | null {
  const code = normalizeBarcode(rawCode);
  if (!code) return null;
  const lower = code.toLowerCase();
  return (
    products.find((p) => {
      const sku = p.sku ? normalizeBarcode(p.sku) : "";
      const bc = p.barcode ? normalizeBarcode(p.barcode) : "";
      return sku === code || bc === code || sku.toLowerCase() === lower || bc.toLowerCase() === lower;
    }) ?? null
  );
}

export async function lookupProductByCode(code: string): Promise<ScannableProduct | null> {
  const res = await fetch(`/api/barcode/lookup?code=${encodeURIComponent(code)}`, { credentials: "same-origin" });
  if (!res.ok) return null;
  const data = (await res.json()) as { product: ScannableProduct };
  return data.product ?? null;
}
