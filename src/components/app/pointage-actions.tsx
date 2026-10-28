"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui";
import { SubmitButton } from "@/components/ui/submit-button";
import { clockIn, clockOut } from "@/lib/actions/timeclock";

export function PointageActions({ hasOpen }: { hasOpen: boolean }) {
  const [inState, inAction] = useActionState(clockIn, undefined);
  const [outState, outAction] = useActionState(clockOut, undefined);
  const state = inState ?? outState;

  return (
    <div className="mb-8">
      {state?.message && <Alert tone="success" className="mb-3">{state.message}</Alert>}
      {state?.error && <Alert tone="error" className="mb-3">{state.error}</Alert>}
      {!hasOpen ? (
        <form action={inAction}>
          <SubmitButton className="onime-btn onime-btn--primary !min-h-12">Pointer l&apos;entrée</SubmitButton>
        </form>
      ) : (
        <form action={outAction}>
          <SubmitButton className="onime-btn onime-btn--secondary !min-h-12">Pointer la sortie</SubmitButton>
        </form>
      )}
    </div>
  );
}
