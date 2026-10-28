"use client";

import { useRouter } from "next/navigation";

export function PointageFilters({
  employees,
  userId,
  from,
  to,
}: {
  employees: { id: string; name: string }[];
  userId?: string;
  from: string;
  to: string;
}) {
  const router = useRouter();

  return (
    <form
      className="mb-6 flex flex-wrap items-end gap-3 rounded-card border border-border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const q = new URLSearchParams();
        const u = String(fd.get("userId") ?? "");
        const f = String(fd.get("from") ?? "");
        const t = String(fd.get("to") ?? "");
        if (u) q.set("userId", u);
        if (f) q.set("from", f);
        if (t) q.set("to", t);
        router.push(`/dashboard/pointage?${q.toString()}`);
      }}
    >
      <label className="grid gap-1 text-body-sm">
        <span>Employé</span>
        <select name="userId" defaultValue={userId ?? ""} className="onime-input min-w-[10rem]">
          <option value="">Tous</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-body-sm">
        <span>Du</span>
        <input name="from" type="date" defaultValue={from} className="onime-input" />
      </label>
      <label className="grid gap-1 text-body-sm">
        <span>Au</span>
        <input name="to" type="date" defaultValue={to} className="onime-input" />
      </label>
      <button type="submit" className="onime-btn onime-btn--secondary !min-h-10">
        Filtrer
      </button>
    </form>
  );
}
