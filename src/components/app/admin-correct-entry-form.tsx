"use client";

import { useActionState, useEffect } from "react";
import { FormModal } from "@/components/ui/form-modal";
import { Field } from "@/components/ui";
import { SubmitButton } from "@/components/ui/submit-button";
import { adminCorrectEntry } from "@/lib/actions/timeclock";

function CorrectForm({ entryId, onSuccess }: { entryId: string; onSuccess?: () => void }) {
  const [state, action] = useActionState(adminCorrectEntry, undefined);

  useEffect(() => {
    if (state?.ok && onSuccess) onSuccess();
  }, [state, onSuccess]);

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="entryId" value={entryId} />
      {state?.error && <p className="text-body-sm text-error-text">{state.error}</p>}
      {state?.message && <p className="text-body-sm text-success-text">{state.message}</p>}
      <Field label="Motif obligatoire" name="reason">
        <textarea name="reason" required rows={3} className="onime-textarea" placeholder="Ex. oubli de pointer la sortie" />
      </Field>
      <SubmitButton variant="primary" className="!flex w-full !justify-center">
        Clôturer avec correction
      </SubmitButton>
    </form>
  );
}

export function AdminCorrectEntryForm({ entryId }: { entryId: string }) {
  return (
    <FormModal triggerLabel="Corriger" title="Correction de pointage" variant="secondary" triggerClassName="!min-h-10 text-xs">
      {({ close }) => <CorrectForm entryId={entryId} onSuccess={close} />}
    </FormModal>
  );
}
