"use client";

import { useActionState, useEffect, useRef } from "react";
import { Alert, Field } from "@/components/ui";
import { SubmitButton } from "@/components/ui/submit-button";
import { extendCompanyTrial, recordPayment, savePlan } from "@/lib/actions/superadmin";

export function ExtendTrialForm({ organizationId }: { organizationId: string }) {
  const [state, action] = useActionState(extendCompanyTrial, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="organizationId" value={organizationId} />
      <div className="flex items-end gap-3">
        <div className="w-32"><Field label="Jours à ajouter" name="days" error={state?.fieldErrors?.days}>
          <input id="days" name="days" type="number" min={1} max={365} defaultValue={7} className="onime-input" required /></Field></div>
        <SubmitButton variant="secondary" pendingLabel="…">Prolonger l&apos;essai</SubmitButton>
      </div>
      {state?.ok && <Alert tone="success">{state.message}</Alert>}
      {state?.error && !state.fieldErrors && <Alert tone="error">{state.error}</Alert>}
    </form>
  );
}

export function PaymentForm({ organizationId, plans }: { organizationId: string; plans: { id: string; name: string; priceMonthly: number }[] }) {
  const [state, action] = useActionState(recordPayment, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="organizationId" value={organizationId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Plan" name="planId">
          <select id="planId" name="planId" className="onime-select" defaultValue={plans[0]?.id}>
            <option value="">- Sans plan -</option>
            {plans.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.priceMonthly.toLocaleString("fr-FR")} FCFA)</option>)}
          </select>
        </Field>
        <Field label="Mois couverts" name="months" error={state?.fieldErrors?.months}>
          <input id="months" name="months" type="number" min={1} max={36} defaultValue={1} required className="onime-input" /></Field>
        <Field label="Montant reçu (FCFA)" name="amount" error={state?.fieldErrors?.amount}>
          <input id="amount" name="amount" inputMode="numeric" required className="onime-input" placeholder={String(plans[0]?.priceMonthly ?? 15000)} /></Field>
        <Field label="Référence (Mobile Money, reçu…)" name="reference"><input id="reference" name="reference" maxLength={80} className="onime-input" /></Field>
      </div>
      <Field label="Note interne (optionnel)" name="note"><input id="note" name="note" maxLength={200} className="onime-input" /></Field>
      <SubmitButton pendingLabel="Enregistrement…">Enregistrer le paiement</SubmitButton>
      {state?.ok && <Alert tone="success">{state.message}</Alert>}
      {state?.error && !state.fieldErrors && <Alert tone="error">{state.error}</Alert>}
    </form>
  );
}

export function PlanForm({ plan }: { plan?: { id: string; name: string; description: string | null; priceMonthly: number; active: boolean } }) {
  const [state, action] = useActionState(savePlan, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok && !plan) ref.current?.reset(); }, [state, plan]);
  const k = plan?.id ?? "new";
  return (
    <form ref={ref} action={action} className="space-y-3">
      {plan && <input type="hidden" name="id" value={plan.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nom du plan" name={`name-${k}`} error={state?.fieldErrors?.name}>
          <input id={`name-${k}`} name="name" defaultValue={plan?.name} required maxLength={60} className="onime-input" placeholder="Essentiel" /></Field>
        <Field label="Prix mensuel (FCFA)" name={`price-${k}`} error={state?.fieldErrors?.priceMonthly}>
          <input id={`price-${k}`} name="priceMonthly" defaultValue={plan?.priceMonthly} required inputMode="numeric" className="onime-input" placeholder="15000" /></Field>
      </div>
      <Field label="Description" name={`desc-${k}`}><input id={`desc-${k}`} name="description" defaultValue={plan?.description ?? ""} maxLength={200} className="onime-input" /></Field>
      <label className="flex min-h-11 items-center gap-3 text-body-sm font-medium">
        <input type="checkbox" name="active" defaultChecked={plan?.active ?? true} className="h-5 w-5 accent-[var(--onime-accent-strong)]" /> Plan proposé aux Entreprises
      </label>
      <SubmitButton pendingLabel="Enregistrement…">{plan ? "Mettre à jour" : "Créer le plan"}</SubmitButton>
      {state?.ok && <Alert tone="success">{state.message}</Alert>}
      {state?.error && !state.fieldErrors && <Alert tone="error">{state.error}</Alert>}
    </form>
  );
}
