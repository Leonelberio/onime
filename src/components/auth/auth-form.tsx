"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert, Field } from "@/components/ui";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/lib/actions/shared";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

export interface AuthField {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  defaultValue?: string | number;
  min?: number;
  max?: number;
}

export function AuthForm({
  action, fields, submitLabel, pendingLabel, hidden, footer,
}: {
  action: Action;
  fields: AuthField[];
  submitLabel: string;
  pendingLabel: string;
  hidden?: Record<string, string>;
  footer?: { text: string; href: string; cta: string };
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-4" noValidate>
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {fields.map((f) => (
        <Field key={f.name} label={f.label} name={f.name} hint={f.hint} error={state?.fieldErrors?.[f.name]}>
          <input
            id={f.name}
            name={f.name}
            type={f.type ?? "text"}
            autoComplete={f.autoComplete}
            defaultValue={f.defaultValue}
            min={f.min}
            max={f.max}
            required
            inputMode={f.type === "number" ? "numeric" : undefined}
            aria-invalid={state?.fieldErrors?.[f.name] ? true : undefined}
            aria-describedby={state?.fieldErrors?.[f.name] ? `${f.name}-err` : f.hint ? `${f.name}-hint` : undefined}
            className="onime-input"
          />
        </Field>
      ))}
      <SubmitButton className="w-full" pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
      {footer && (
        <p className="text-center text-body-sm text-muted-foreground">
          {footer.text} <Link href={footer.href} className="onime-link">{footer.cta}</Link>
        </p>
      )}
    </form>
  );
}
