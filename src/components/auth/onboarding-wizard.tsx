"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Alert, Field } from "@/components/ui";
import { SubmitButton } from "@/components/ui/submit-button";
import { signUp } from "@/lib/actions/auth";
import { COMPANY_CURRENCIES } from "@/lib/currencies";

const STEPS = [
  { id: 1, title: "Organisation" },
  { id: 2, title: "Première boutique" },
  { id: 3, title: "Votre compte" },
] as const;

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [organizationName, setOrganizationName] = useState("");
  const [currency, setCurrency] = useState("XOF");
  const [boutiqueName, setBoutiqueName] = useState("");
  const [boutiqueAddress, setBoutiqueAddress] = useState("");
  const [boutiquePhone, setBoutiquePhone] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const [state, formAction] = useActionState(signUp, undefined);

  useEffect(() => {
    const to = state?.data?.redirect;
    if (state?.ok && to) window.location.assign(to);
  }, [state]);

  const recap = useMemo(
    () => ({
      organizationName: organizationName.trim(),
      currency,
      boutiqueName: boutiqueName.trim(),
      boutiqueAddress: boutiqueAddress.trim(),
      boutiquePhone: boutiquePhone.trim(),
    }),
    [organizationName, currency, boutiqueName, boutiqueAddress, boutiquePhone],
  );

  function goNext() {
    setLocalError(null);
    if (step === 1) {
      if (recap.organizationName.length < 2) {
        setLocalError("Indiquez le nom de votre organisation (2 caractères minimum).");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (recap.boutiqueName.length < 2) {
        setLocalError("Indiquez le nom de votre première boutique.");
        return;
      }
      setStep(3);
    }
  }

  function goBack() {
    setLocalError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div className="space-y-6">
      <nav aria-label="Étapes d'inscription" className="flex gap-2">
        {STEPS.map((s) => {
          const active = s.id === step;
          const done = s.id < step;
          return (
            <div
              key={s.id}
              className={`flex-1 rounded-md border px-2 py-2 text-center text-caption sm:text-body-sm ${
                active ? "border-[#44D600] bg-[#44D600]/10 font-semibold" : done ? "border-border text-muted-foreground" : "border-border text-muted-foreground"
              }`}
            >
              <span className="block text-caption opacity-80">Étape {s.id}</span>
              {s.title}
            </div>
          );
        })}
      </nav>

      {(localError || state?.error) && (
        <Alert tone="error">{localError ?? state?.error}</Alert>
      )}

      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="organizationName" value={recap.organizationName} />
        <input type="hidden" name="currency" value={currency} />
        <input type="hidden" name="boutiqueName" value={recap.boutiqueName} />
        <input type="hidden" name="boutiqueAddress" value={recap.boutiqueAddress} />
        <input type="hidden" name="boutiquePhone" value={recap.boutiquePhone} />

        {step === 1 && (
          <>
            <p className="text-body-sm text-muted-foreground">
              Votre organisation regroupe les boutiques, la facturation et la vue consolidée.
            </p>
            <Field label="Nom de l'organisation" name="organizationNameDisplay">
              <input
                id="organizationNameDisplay"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                maxLength={80}
                className="onime-input"
                placeholder="Ex. Groupe Diallo Retail"
              />
            </Field>
            <label className="grid gap-1 text-body-sm">
              Devise principale
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="onime-input"
                aria-label="Devise"
              >
                {COMPANY_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-body-sm text-muted-foreground">
              Chaque boutique a son stock, ses ventes et son pointage. Vous pourrez en ajouter d&apos;autres ensuite.
            </p>
            <Field label="Nom de la boutique" name="boutiqueNameDisplay">
              <input
                id="boutiqueNameDisplay"
                value={boutiqueName}
                onChange={(e) => setBoutiqueName(e.target.value)}
                required
                maxLength={80}
                className="onime-input"
                placeholder="Ex. Boutique Plateau"
              />
            </Field>
            <Field label="Adresse (optionnel)" name="boutiqueAddressDisplay">
              <input
                id="boutiqueAddressDisplay"
                value={boutiqueAddress}
                onChange={(e) => setBoutiqueAddress(e.target.value)}
                maxLength={160}
                className="onime-input"
                placeholder="Quartier, ville…"
              />
            </Field>
            <Field label="Téléphone (optionnel)" name="boutiquePhoneDisplay">
              <input
                id="boutiquePhoneDisplay"
                value={boutiquePhone}
                onChange={(e) => setBoutiquePhone(e.target.value)}
                maxLength={40}
                className="onime-input"
                type="tel"
                autoComplete="tel"
              />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <div className="rounded-card border border-border bg-muted/30 p-4 text-body-sm">
              <p className="font-semibold">Récapitulatif</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>
                  <span className="text-foreground">Organisation :</span> {recap.organizationName} ({currency})
                </li>
                <li>
                  <span className="text-foreground">Boutique :</span> {recap.boutiqueName}
                  {recap.boutiqueAddress ? ` · ${recap.boutiqueAddress}` : ""}
                </li>
              </ul>
            </div>
            <Field label="Votre nom" name="name" error={state?.fieldErrors?.name}>
              <input id="name" name="name" required maxLength={80} className="onime-input" autoComplete="name" />
            </Field>
            <Field label="Email" name="email" error={state?.fieldErrors?.email}>
              <input id="email" name="email" type="email" required className="onime-input" autoComplete="email" />
            </Field>
            <Field label="Mot de passe" name="password" hint="8 caractères minimum" error={state?.fieldErrors?.password}>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="onime-input"
                autoComplete="new-password"
              />
            </Field>
          </>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {step > 1 && (
            <button type="button" className="onime-btn onime-btn--secondary flex-1 sm:flex-none" onClick={goBack}>
              Retour
            </button>
          )}
          {step < 3 ? (
            <button type="button" className="onime-btn onime-btn--primary flex-1 sm:ml-auto sm:flex-none" onClick={goNext}>
              Continuer
            </button>
          ) : (
            <SubmitButton className="flex-1 sm:ml-auto sm:flex-none" pendingLabel="Création…">
              Créer mon espace
            </SubmitButton>
          )}
        </div>
      </form>
    </div>
  );
}
