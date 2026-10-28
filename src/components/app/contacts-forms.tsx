"use client";

import { useActionState, useEffect } from "react";
import { Alert, Field } from "@/components/ui";
import { FormModal } from "@/components/ui/form-modal";
import { SubmitButton } from "@/components/ui/submit-button";
import { createCustomer, createSupplier } from "@/lib/actions/contacts";
import type { ActionState } from "@/lib/actions/shared";

type FormAction = (prev: ActionState, fd: FormData) => Promise<ActionState>;

function ContactFormShell({
  action,
  onSuccess,
  children,
}: {
  action: FormAction;
  onSuccess?: () => void;
  children: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok && onSuccess) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="grid gap-3">
      {state?.message && <Alert tone="success">{state.message}</Alert>}
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {children}
    </form>
  );
}

function ContactFields() {
  return (
    <>
      <Field label="Nom" name="name">
        <input name="name" required className="onime-input" />
      </Field>
      <Field label="Téléphone" name="phone">
        <input name="phone" className="onime-input" />
      </Field>
      <Field label="Email" name="email">
        <input name="email" type="email" className="onime-input" />
      </Field>
      <Field label="Note" name="note">
        <input name="note" className="onime-input" />
      </Field>
    </>
  );
}

export function CustomerFormModal() {
  return (
    <FormModal triggerLabel="Nouveau client" title="Nouveau client">
      {({ close }) => (
        <ContactFormShell action={createCustomer} onSuccess={close}>
          <ContactFields />
          <SubmitButton variant="primary" className="!flex w-full !min-h-12 !justify-center">
            Ajouter
          </SubmitButton>
        </ContactFormShell>
      )}
    </FormModal>
  );
}

export function SupplierFormModal() {
  return (
    <FormModal triggerLabel="Nouveau fournisseur" title="Nouveau fournisseur">
      {({ close }) => (
        <ContactFormShell action={createSupplier} onSuccess={close}>
          <ContactFields />
          <SubmitButton variant="primary" className="!flex w-full !min-h-12 !justify-center">
            Ajouter
          </SubmitButton>
        </ContactFormShell>
      )}
    </FormModal>
  );
}
