import Link from "next/link";
import clsx from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type Variant = "primary" | "secondary" | "tertiary" | "error";

export function btnClass(variant: Variant = "primary", extra?: string) {
  return clsx("onime-btn", `onime-btn--${variant}`, extra);
}

export function LinkButton({ variant = "primary", className, ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...props} className={btnClass(variant, className)} />;
}

export function Badge({ tone = "primary", children, className }: { tone?: "primary" | "success" | "error" | "caution" | "info"; children: ReactNode; className?: string }) {
  return <span className={clsx("onime-badge", `onime-badge--${tone}`, className)}>{children}</span>;
}

export function Card({ children, className, flat = false, as: Tag = "div" }: { children: ReactNode; className?: string; flat?: boolean; as?: "div" | "section" | "article" | "li" }) {
  return <Tag className={clsx("onime-card", flat && "onime-card--flat", "card-pad", className)}>{children}</Tag>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-body-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border-hover bg-surface/60 px-6 py-12 text-center">
      {icon && <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-button bg-primary-soft text-primary-text">{icon}</div>}
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {children && <p className="mt-1 max-w-sm text-body-sm text-muted-foreground">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Alert({ tone = "info", title, children, className }: { tone?: "info" | "success" | "error" | "caution"; title?: string; children?: ReactNode; className?: string }) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "info" ? Info : AlertCircle;
  const tones = {
    info: "bg-info-soft text-info-text",
    success: "bg-success-soft text-success-text",
    error: "bg-error-soft text-error-text",
    caution: "bg-caution-soft text-caution-text",
  } as const;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={clsx("flex gap-3 rounded-button px-4 py-3 text-body-sm", tones[tone], className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : undefined}>{children}</div>}
      </div>
    </div>
  );
}

export function Field({
  label, name, hint, error, children,
}: { label: string; name: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="onime-label">{label}</label>
      {children}
      {error ? <p id={`${name}-err`} className="onime-help onime-help--error">{error}</p> : hint ? <p id={`${name}-hint`} className="onime-help">{hint}</p> : null}
    </div>
  );
}

export function Stat({ label, value, hint, className }: { label: string; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <Card className={clsx("min-w-0", className)}>
      <p className="text-caption font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-caption text-muted-foreground">{hint}</p>}
    </Card>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton", className)} aria-hidden="true" />;
}
