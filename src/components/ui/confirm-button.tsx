"use client";

import clsx from "clsx";
import type { ComponentProps } from "react";

/** Bouton de formulaire avec confirmation native avant soumission (suppressions). */
export function ConfirmButton({ confirm, className, children, ...props }: ComponentProps<"button"> & { confirm: string }) {
  return (
    <button
      type="submit"
      {...props}
      className={clsx(className)}
      onClick={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
        props.onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
