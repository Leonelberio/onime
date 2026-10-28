"use client";

import clsx from "clsx";
import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";

export function SubmitButton({
  children, variant = "primary", className, pendingLabel, ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "tertiary" | "error"; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      {...props}
      aria-busy={pending || undefined}
      disabled={pending || props.disabled}
      className={clsx("onime-btn", `onime-btn--${variant}`, className)}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
