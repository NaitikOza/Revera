import { Icon, type IconName } from "@/components/icons";
import type { PatientDetail } from "@/lib/repository";

const kindStyles: Record<string, { icon: IconName; bg: string; color: string }> = {
  encounter: { icon: "document", bg: "bg-[#edf1ef]", color: "text-moss" },
  imaging: { icon: "image", bg: "bg-[#e7eef5]", color: "text-[#54738d]" },
  laboratory: { icon: "flask", bg: "bg-[#f6eedf]", color: "text-[#a86c27]" },
  diagnosis: { icon: "activity", bg: "bg-[#efe9f5]", color: "text-[#73578a]" },
};

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(new Date(date));
}

export function EvidenceTimeline({ records }: { records: PatientDetail["records"] }) {
  return (
    <section className="rounded-[22px] border border-line bg-white p-5 shadow-card md:p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-moss">
            <Icon name="pulse" className="h-3.5 w-3.5" />
            Longitudinal evidence
          </div>
          <h2 className="text-lg font-semibold tracking-[-0.025em] text-ink">Clinical timeline</h2>
        </div>
        <span className="rounded-full bg-canvas px-3 py-1 text-[10px] font-medium text-slate-500">{records.length} records</span>
      </div>

      <div className="relative">
        <div className="absolute bottom-5 left-[17px] top-4 w-px bg-[#dfe6e1]" />
        <ol className="space-y-6">
          {records.map((record, index) => {
            const style = kindStyles[record.kind] ?? kindStyles.encounter;
            return (
              <li key={record.id} className="relative flex gap-4">
                <div className={`relative z-10 grid h-[35px] w-[35px] shrink-0 place-items-center rounded-xl border-4 border-white ${style.bg} ${style.color}`}>
                  <Icon name={style.icon} className="h-4 w-4" />
                </div>
                <div className={`min-w-0 flex-1 ${index < records.length - 1 ? "pb-1" : ""}`}>
                  <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-[13px] font-semibold text-ink">{record.title}</h3>
                    <time className="text-[10px] font-medium text-slate-400">{dateLabel(record.recordedAt)}</time>
                  </div>
                  <p className="text-xs leading-[1.65] text-slate-600">{record.summary}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#f3f5f2] px-2 py-1 text-[9px] font-medium text-slate-500">{record.source}</span>
                    {record.observations
                      .filter((item) => item.interpretation === "conflicts")
                      .map((item) => (
                        <span key={item.label} className="rounded-md bg-[#fff0eb] px-2 py-1 text-[9px] font-semibold text-[#b34f39]">
                          Conflicting · {item.label}
                        </span>
                      ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
