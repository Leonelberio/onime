import { revokeEmployeeDevice } from "@/lib/actions/timeclock";

function fmt(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(d);
}

export function EmployeeDevices({
  devices,
  readOnly,
}: {
  devices: {
    id: string;
    userAgent: string | null;
    registeredAt: Date;
    lastUsedAt: Date | null;
    revokedAt: Date | null;
  }[];
  readOnly: boolean;
  userId?: string;
}) {
  const active = devices.filter((d) => !d.revokedAt);
  if (active.length === 0) return null;

  return (
    <ul className="mt-2 space-y-1 text-caption text-muted-foreground">
      {active.map((d) => (
        <li key={d.id} className="flex flex-wrap items-center gap-2">
          <span>
            Appareil · {d.userAgent?.slice(0, 40) ?? "—"} · depuis {fmt(d.registeredAt)}
          </span>
          {!readOnly && (
            <form action={revokeEmployeeDevice}>
              <input type="hidden" name="deviceId" value={d.id} />
              <button type="submit" className="text-error-text underline">
                Révoquer
              </button>
            </form>
          )}
        </li>
      ))}
    </ul>
  );
}
