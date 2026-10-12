import Link from "next/link";
import { Icon } from "@/components/icons";

const navItems = [
  { label: "Overview", icon: "home" as const, active: true },
  { label: "Patient queue", icon: "people" as const, active: false },
  { label: "Review history", icon: "clock" as const, active: false },
];

export function Sidebar() {
  return (
    <aside className="soft-grid relative flex w-full flex-col overflow-hidden bg-forest text-white lg:fixed lg:inset-y-0 lg:left-0 lg:min-h-screen lg:w-[246px]">
      <div className="pointer-events-none absolute -right-20 top-14 h-44 w-44 rounded-full bg-[#78a898]/10 blur-2xl" />
      <div className="relative flex h-auto items-center px-4 py-4 lg:min-h-screen lg:flex-col lg:items-stretch lg:px-5 lg:py-7">
        <Link href="/" className="flex items-center gap-2 px-1 lg:mb-10 lg:gap-3 lg:px-2" aria-label="Revera home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-forest shadow-lg shadow-black/10 lg:h-10 lg:w-10 lg:rounded-2xl">
            <Icon name="pulse" className="h-5 w-5 lg:h-6 lg:w-6" />
          </span>
          <span>
            <span className="block text-[18px] font-semibold tracking-[-0.03em] lg:text-[20px]">revera</span>
            <span className="hidden text-[9px] font-semibold uppercase tracking-[0.22em] text-white/45 sm:block">clinical review</span>
          </span>
        </Link>

        <nav className="ml-auto flex gap-1 lg:ml-0 lg:block lg:space-y-1.5" aria-label="Primary navigation">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium sm:px-3 lg:gap-3 lg:px-3.5 lg:py-3 lg:text-sm ${
                item.active ? "bg-white/12 text-white" : "text-white/55"
              }`}
            >
              <Icon name={item.icon} className="h-[18px] w-[18px]" />
              <span className="hidden md:inline">{item.label}</span>
              {item.label === "Patient queue" && (
                <span className="hidden rounded-full bg-white/10 px-2 py-0.5 text-[10px] lg:ml-auto lg:inline">3</span>
              )}
            </div>
          ))}
        </nav>

        <div className="mt-auto hidden space-y-5 lg:block">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#c9e4d9]">
              <Icon name="lock" className="h-4 w-4" />
              Local workspace
            </div>
            <p className="text-[11px] leading-relaxed text-white/50">
              Synthetic demo records stay on this device. No clinical data leaves the local network.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-200/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Privacy boundary active
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-white/10 px-1 pt-5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#dfece6] text-xs font-bold text-forest">JC</div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">Dr. Jordan Chen</p>
              <p className="truncate text-[10px] text-white/40">Hospital Medicine</p>
            </div>
            <span className="ml-auto text-white/35">•••</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
