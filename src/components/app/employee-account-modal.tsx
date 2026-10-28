"use client";

import { useActionState, useEffect } from "react";
import { Alert, Field } from "@/components/ui";
import { FormModal } from "@/components/ui/form-modal";
import { SubmitButton } from "@/components/ui/submit-button";
import { createEmployeeAccount } from "@/lib/actions/staff";

function Body({ onSuccess }: { onSuccess?: () => void }) {
  const [state, action] = useActionState(createEmployeeAccount, undefined);
  useEffect(() => {
    if (state?.ok && onSuccess) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={action} className="grid gap-3">
      {state?.message && <Alert tone="success">{state.message}</Alert>}
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Nom" name="name">
        <input name="name" required className="onime-input" />
      </Field>
      <Field label="Email (identifiant)" name="email">
        <input name="email" type="email" required className="onime-input" />
      </Field>
      <Field label="Mot de passe initial" name="password">
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className="onime-input" />
      </Field>
      <SubmitButton variant="primary" className="!flex w-full !justify-center">
        Créer le compte
      </SubmitButton>
    </form>
  );
}

export function EmployeeAccountModal() {
  return (
    <FormModal triggerLabel="Créer un compte" title="Compte employé" variant="primary">
      {({ close }) => <Body onSuccess={close} />}
    </FormModal>
  );
}
