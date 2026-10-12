"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { formatClinicalDate } from "@/lib/format";
import type { PatientSummary } from "@/lib/repository";

export function PatientDirectory({ patients }: { patients: PatientSummary[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return patients;
    return patients.filter((patient) =>
      [patient.displayName, patient.recordNumber, patient.location].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [patients, query]);

  return (
    <section className="rounded-[22px] border border-line bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">All patients</h2>
          <p className="mt-0.5 text-[10px] text-slate-400">Synthetic demo cases</p>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-3 py-2 sm:w-64">
          <Icon name="search" className="h-4 w-4 text-slate-400" />
          <span className="sr-only">Search patients</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search patients"
            className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-slate-400"
          />
        </label>
      </div>

      <div className="divide-y divide-line">
        {filtered.map((patient) => (
          <Link
            key={patient.id}
            href={`/patients/${patient.id}`}
            className="group grid gap-3 p-4 transition hover:bg-[#f8faf7] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-center"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f0ec] text-[11px] font-bold text-forest">{patient.initials}</span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-ink">{patient.displayName}</span>
              <span className="mt-0.5 block text-[9px] text-slate-400">{patient.recordNumber} · {patient.age} · {patient.location}</span>
            </span>
            <span className="text-[9px] text-slate-400">
              Updated {patient.latestEvidenceAt ? formatClinicalDate(patient.latestEvidenceAt, false) : "—"}
            </span>
            <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-semibold ${patient.openAlertCount > 0 ? "bg-[#f9e5df] text-[#a84d39]" : "bg-[#e6f0eb] text-[#3e6c5f]"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${patient.openAlertCount > 0 ? "bg-coral" : "bg-emerald-500"}`} />
              {patient.openAlertCount > 0 ? `${patient.openAlertCount} to review` : "No open review"}
            </span>
          </Link>
        ))}
        {filtered.length === 0 && <div className="p-10 text-center text-xs text-slate-400">No matching synthetic patient.</div>}
      </div>
    </section>
  );
}
