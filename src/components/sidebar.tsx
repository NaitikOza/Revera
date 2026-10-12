"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";

const navItems: Array<{ label: string; href: string; icon: IconName; matches: (path: string) => boolean }> = [
  { label: "Home", href: "/", icon: "home", matches: (path) => path === "/" },
  { label: "Patients", href: "/patients", icon: "people", matches: (path) => path.startsWith("/patients") },
  { label: "Reviews", href: "/reviews", icon: "clock", matches: (path) => path.startsWith("/reviews") },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="soft-grid relative z-20 w-full overflow-hidden bg-forest text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-[232px]">
      <div className="relative flex items-center gap-3 px-4 py-3 lg:min-h-screen lg:flex-col lg:items-stretch lg:px-4 lg:py-6">
        <Link href="/" className="flex items-center gap-2.5 px-1 lg:mb-9 lg:px-2" aria-label="Revera home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-forest shadow-lg shadow-black/10">
            <Icon name="pulse" className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-semibold tracking-[-0.03em]">revera</span>
            <span className="hidden text-[8px] font-semibold uppercase tracking-[0.22em] text-white/45 sm:block">review workspace</span>
          </span>
        </Link>

        <nav className="ml-auto flex gap-1 lg:ml-0 lg:block lg:space-y-1.5" aria-label="Primary navigation">
          {navItems.map((item) => {
            const active = item.matches(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition lg:gap-3 lg:px-3.5 lg:py-3 ${
                  active ? "bg-white/12 text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon name={item.icon} className="h-[17px] w-[17px]" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden lg:block">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3.5">
            <div className="flex items-center gap-2 text-[10px] font-semibold text-[#d1e7df]">
              <Icon name="lock" className="h-3.5 w-3.5" />
              Local · synthetic only
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-white/10 px-1 pt-4">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#dfece6] text-[10px] font-bold text-forest">JC</div>
            <div>
              <p className="text-[11px] font-semibold">Dr. Jordan Chen</p>
              <p className="text-[9px] text-white/40">Hospital Medicine</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
