import { Users } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { removeStaff, setStaffDisabled } from "@/lib/actions/staff";
import type { StaffInviteRole } from "@/lib/staff-roles";
import { EmployeeDevices } from "@/components/app/employee-devices";
import type { User } from "@prisma/client";

export function StaffRoster({
  members,
  role,
  readOnly,
  emptyTitle,
  emptyHint,
  devicesByUserId = {},
}: {
  members: User[];
  role: StaffInviteRole;
  readOnly: boolean;
  emptyTitle: string;
  emptyHint: string;
  devicesByUserId?: Record<string, { id: string; userAgent: string | null; registeredAt: Date; lastUsedAt: Date | null; revokedAt: Date | null }[]>;
}) {
  if (members.length === 0) {
    return (
      <EmptyState icon={<Users className="h-6 w-6" aria-hidden="true" />} title={emptyTitle}>
        {emptyHint}
      </EmptyState>
    );
  }

  return (
    <ul className="onime-card divide-y divide-border p-0">
      {members.map((w) => (
        <li key={w.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {w.name} {w.disabled && <Badge tone="caution">Désactivé</Badge>}
            </p>
            <p className="truncate text-body-sm text-muted-foreground">{w.email}</p>
            <EmployeeDevices devices={devicesByUserId[w.id] ?? []} readOnly={readOnly} />
          </div>
          <form action={setStaffDisabled}>
            <input type="hidden" name="id" value={w.id} />
            <input type="hidden" name="role" value={role} />
            <input type="hidden" name="disabled" value={String(!w.disabled)} />
            <button className="onime-btn onime-btn--secondary" disabled={readOnly}>{w.disabled ? "Réactiver" : "Désactiver"}</button>
          </form>
          <form action={removeStaff}>
            <input type="hidden" name="id" value={w.id} />
            <input type="hidden" name="role" value={role} />
            <ConfirmButton confirm={`Supprimer le compte de ${w.name} ?`} className="onime-btn onime-btn--tertiary" disabled={readOnly}>
              Supprimer
            </ConfirmButton>
          </form>
        </li>
      ))}
    </ul>
  );
}
