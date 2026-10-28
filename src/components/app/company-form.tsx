"use client";

import { useActionState, useState } from "react";
import { Alert, Field } from "@/components/ui";
import { SubmitButton } from "@/components/ui/submit-button";
import { ImageUploader } from "@/components/app/image-uploader";
import { updateOrganization } from "@/lib/actions/organization";
import { contrastRatio, readableOn } from "@/lib/color";
import { normalizeCurrency, COMPANY_CURRENCIES } from "@/lib/currencies";

const SWATCHES = ["#44D600", "#2563EB", "#D9480F", "#E67700", "#2F9E44", "#0C8599", "#1971C2", "#7048E8", "#1F2937"];

export interface CompanyView {
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  brandColor: string;
  currency: string;
  logoUrlLight: string | null;
  logoUrlDark: string | null;
}

export function CompanyForm({ r, readOnly }: { r: CompanyView; readOnly: boolean }) {
  const [state, action] = useActionState(updateOrganization, undefined);
  const [color, setColor] = useState(r.brandColor);
  const fg = readableOn(color);
  const ratio = contrastRatio(fg, color);

  return (
    <form action={action} className="space-y-6">
      {state?.ok && <Alert tone="success">{state.message}</Alert>}
      {state?.error && !state.fieldErrors && <Alert tone="error">{state.error}</Alert>}
      {readOnly && <Alert tone="caution">Mode lecture : modifications désactivées (abonnement inactif).</Alert>}

      <fieldset disabled={readOnly} className="onime-card card-pad space-y-4">
        <h2 className="font-display text-lg font-bold">Informations</h2>
        <Field label="Nom de l'entreprise" name="name" error={state?.fieldErrors?.name}>
          <input id="name" name="name" defaultValue={r.name} required maxLength={80} className="onime-input" />
        </Field>
        <Field label="Description" name="description" error={state?.fieldErrors?.description}>
          <textarea id="description" name="description" defaultValue={r.description ?? ""} maxLength={300} rows={2} className="onime-textarea" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Téléphone" name="phone"><input id="phone" name="phone" defaultValue={r.phone ?? ""} inputMode="tel" maxLength={40} className="onime-input" /></Field>
          <Field label="Adresse" name="address"><input id="address" name="address" defaultValue={r.address ?? ""} maxLength={160} className="onime-input" /></Field>
        </div>
        <Field label="Devise" name="currency" error={state?.fieldErrors?.currency}>
          <select id="currency" name="currency" defaultValue={normalizeCurrency(r.currency)} className="onime-select">
            {COMPANY_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </Field>
      </fieldset>

      <fieldset disabled={readOnly} className="onime-card card-pad space-y-5">
        <h2 className="font-display text-lg font-bold">Identité visuelle</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploader name="logoUrlDark" kind="logo" initialUrl={r.logoUrlDark} label="Logo foncé" />
          <ImageUploader name="logoUrlLight" kind="logo" initialUrl={r.logoUrlLight} label="Logo clair" />
        </div>
        <div>
          <label htmlFor="brandColor" className="onime-label">Couleur principale</label>
          <div className="flex flex-wrap items-center gap-2">
            {SWATCHES.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Couleur ${c}`} aria-pressed={color.toLowerCase() === c.toLowerCase()}
                className="press-icon h-9 w-9 rounded-pill border-2 border-transparent aria-pressed:border-foreground" style={{ background: c }} />
            ))}
            <input id="brandColor" name="brandColor" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 cursor-pointer rounded-sm border border-input bg-transparent p-0.5" />
          </div>
          <p className="onime-help">Contraste {ratio.toFixed(1)}:1</p>
        </div>
      </fieldset>

      <SubmitButton disabled={readOnly} pendingLabel="Enregistrement…">Enregistrer</SubmitButton>
    </form>
  );
}
