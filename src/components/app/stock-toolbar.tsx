"use client";

import { useState } from "react";
import { Alert } from "@/components/ui";
import { StockFormModals } from "@/components/app/inventory-forms";
import { BarcodeScanButton } from "@/components/app/barcode-scan-button";
import type { ScannableProduct } from "@/lib/barcode/match-client";
import { formatMoney } from "@/lib/money";

type Props = {
  products: ScannableProduct[];
  currency: string;
};

export function StockToolbar({ products, currency }: Props) {
  const [found, setFound] = useState<ScannableProduct | null>(null);
  const [unknownCode, setUnknownCode] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-stretch gap-3 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <BarcodeScanButton
          products={products}
          onProduct={(p) => {
            setFound(p);
            setUnknownCode(null);
          }}
          onUnknown={(code) => {
            setFound(null);
            setUnknownCode(code);
          }}
        />
        <StockFormModals products={products} />
      </div>

      {found && (
        <Alert tone="success" className="max-w-md text-left">
          <strong>{found.name}</strong>
          <br />
          Stock : {found.stockQty}
          {found.stockQty <= 0 ? " · rupture" : ""}
          <br />
          Prix : {formatMoney(found.unitPrice, currency)}
          {(found.sku || found.barcode) && (
            <>
              <br />
              <span className="text-muted-foreground">
                {[found.barcode && `Code-barres ${found.barcode}`, found.sku && `SKU ${found.sku}`].filter(Boolean).join(" · ")}
              </span>
            </>
          )}
        </Alert>
      )}

      {unknownCode && (
        <Alert tone="caution" className="max-w-md text-left">
          Aucun produit pour « {unknownCode} ». Vérifiez le code-barres ou créez le produit avec ce code.
        </Alert>
      )}
    </div>
  );
}
