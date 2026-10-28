"use client";

import { useActionState, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Alert, Field } from "@/components/ui";
import { FormModal } from "@/components/ui/form-modal";
import { SubmitButton } from "@/components/ui/submit-button";
import { createEmployeeInvitation } from "@/lib/actions/staff";
import type { StaffInviteRole } from "@/lib/staff-roles";

function InviteFormBody({
  readOnly,
  inviteRole,
  labelPlaceholder,
  fieldLabel,
}: {
  readOnly: boolean;
  inviteRole: StaffInviteRole;
  fieldLabel: string;
  labelPlaceholder: string;
}) {
  const [state, action] = useActionState(createEmployeeInvitation, undefined);
  const [copied, setCopied] = useState(false);
  const link = state?.data?.link;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="inviteRole" value={inviteRole} />
      <Field label={fieldLabel} name="label">
        <input
          id={`label-${inviteRole}`}
          name="label"
          maxLength={60}
          className="onime-input"
          placeholder={labelPlaceholder}
          disabled={readOnly}
        />
      </Field>
      <SubmitButton disabled={readOnly} pendingLabel="Création…" className="!flex w-full !min-h-12 !justify-center">
        Créer un lien d&apos;invitation
      </SubmitButton>
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {link && (
        <div className="space-y-2">
          <Alert tone="success">{state?.message}</Alert>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={link}
              aria-label="Lien d'invitation"
              className="onime-input font-mono text-caption"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              className="onime-btn onime-btn--secondary shrink-0"
              onClick={async () => {
                await navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}{" "}
              {copied ? "Copié" : "Copier"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

export function InviteFormModal({
  readOnly,
  inviteRole,
  labelPlaceholder,
  fieldLabel,
}: {
  readOnly: boolean;
  inviteRole: StaffInviteRole;
  fieldLabel: string;
  labelPlaceholder: string;
}) {
  return (
    <FormModal triggerLabel="Inviter un employé" title="Invitation employé" variant="secondary">
      {() => (
        <InviteFormBody
          readOnly={readOnly}
          inviteRole={inviteRole}
          fieldLabel={fieldLabel}
          labelPlaceholder={labelPlaceholder}
        />
      )}
    </FormModal>
  );
}
