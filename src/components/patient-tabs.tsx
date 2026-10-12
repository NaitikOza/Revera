import Link from "next/link";

export function PatientTabs({ patientId, active }: { patientId: string; active: "overview" | "timeline" | "review" }) {
  const tabs = [
    { label: "Overview", href: `/patients/${patientId}`, key: "overview" },
    { label: "Evidence", href: `/patients/${patientId}/timeline`, key: "timeline" },
    { label: "Review", href: `/patients/${patientId}/review`, key: "review" },
  ] as const;

  return (
    <nav className="my-5 flex gap-1 rounded-xl border border-line bg-white p-1" aria-label="Patient profile sections">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={active === tab.key ? "page" : undefined}
          className={`rounded-lg px-4 py-2 text-[10px] font-semibold transition ${active === tab.key ? "bg-forest text-white" : "text-slate-500 hover:bg-canvas hover:text-ink"}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
