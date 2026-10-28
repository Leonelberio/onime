"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { btnClass } from "@/components/ui";

type BtnVariant = "primary" | "secondary" | "tertiary";

export function FormModal({
  triggerLabel,
  title,
  variant = "primary",
  triggerClassName,
  children,
}: {
  triggerLabel: string;
  title: string;
  variant?: BtnVariant;
  triggerClassName?: string;
  children: (ctx: { close: () => void }) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const close = () => setOpen(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={clsx(btnClass(variant), triggerClassName)}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false);
        }}
        className="fixed inset-0 z-50 m-auto max-h-[min(90dvh,640px)] w-[min(calc(100%-2rem),28rem)] max-w-none overflow-hidden rounded-card border border-border bg-card p-0 text-foreground backdrop:bg-black/50 open:flex open:flex-col"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-5 py-4">
          <h2 id={titleId} className="font-display text-lg font-bold">
            {title}
          </h2>
          <button type="button" className="onime-btn-icon shrink-0" aria-label="Fermer" onClick={close}>
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children({ close })}</div>
      </dialog>
    </>
  );
}
