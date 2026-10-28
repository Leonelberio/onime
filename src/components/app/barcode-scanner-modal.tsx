"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { ScanLine, X } from "lucide-react";
import { Alert } from "@/components/ui";

type Props = {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  title?: string;
};

export function BarcodeScannerModal({ open, onClose, onScan, title = "Scanner un code-barres" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const titleId = useId();

  const submitManual = useCallback(() => {
    const t = manual.trim();
    if (!t) return;
    onScan(t);
    onClose();
  }, [manual, onClose, onScan]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setManual("");
    const reader = new BrowserMultiFormatReader();
    let controls: IScannerControls | null = null;
    let cancelled = false;

    const start = async () => {
      const el = videoRef.current;
      if (!el) return;
      try {
        controls = await reader.decodeFromVideoDevice(undefined, el, (result) => {
          if (cancelled || !result) return;
          cancelled = true;
          controls?.stop();
          onScan(result.getText());
          onClose();
        });
      } catch {
        if (!cancelled) setError("Caméra indisponible. Utilisez la saisie manuelle ou autorisez l’accès à la caméra.");
      }
    };

    void start();

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [open, onClose, onScan]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-card border border-border bg-card p-4 shadow-lg"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id={titleId} className="flex items-center gap-2 font-display text-lg font-bold">
            <ScanLine className="h-5 w-5" aria-hidden="true" />
            {title}
          </h2>
          <button type="button" className="onime-btn-icon" onClick={onClose} aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? <Alert tone="caution" className="mb-3">{error}</Alert> : null}

        <div className="relative mb-3 overflow-hidden rounded-lg bg-black aspect-[4/3]">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-8 border-2 border-[#44D600] rounded-md opacity-80" aria-hidden="true" />
        </div>

        <p className="mb-3 text-body-sm text-muted-foreground">
          EAN, UPC, Code 128… Placez le code dans le cadre. Fonctionne mieux en HTTPS ou sur localhost.
        </p>

        <label className="grid gap-1 text-body-sm">
          Saisie manuelle
          <div className="flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              className="onime-input flex-1"
              placeholder="Ex. 3760123456789"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submitManual())}
            />
            <button type="button" className="onime-btn onime-btn--secondary shrink-0" onClick={submitManual}>
              OK
            </button>
          </div>
        </label>
      </div>
    </div>
  );
}
