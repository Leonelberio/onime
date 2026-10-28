"use client";

import { useCallback, useState } from "react";
import { ScanLine } from "lucide-react";
import { BarcodeScannerModal } from "@/components/app/barcode-scanner-modal";
import type { ScannableProduct } from "@/lib/barcode/match-client";
import { lookupProductByCode, matchProductByCode } from "@/lib/barcode/match-client";

type Props = {
  products?: ScannableProduct[];
  onProduct: (product: ScannableProduct, rawCode: string) => void;
  onUnknown?: (rawCode: string) => void;
  variant?: "primary" | "secondary";
  label?: string;
  className?: string;
};

export function BarcodeScanButton({
  products,
  onProduct,
  onUnknown,
  variant = "secondary",
  label = "Scanner",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);

  const handleScan = useCallback(
    async (code: string) => {
      let hit = products ? matchProductByCode(products, code) : null;
      if (!hit) hit = await lookupProductByCode(code);
      if (hit) onProduct(hit, code);
      else onUnknown?.(code);
    },
    [products, onProduct, onUnknown],
  );

  return (
    <>
      <button
        type="button"
        className={`onime-btn onime-btn--${variant} inline-flex items-center gap-2 ${className}`}
        onClick={() => setOpen(true)}
      >
        <ScanLine className="h-[18px] w-[18px]" aria-hidden="true" />
        {label}
      </button>
      <BarcodeScannerModal open={open} onClose={() => setOpen(false)} onScan={handleScan} />
    </>
  );
}
