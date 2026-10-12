import type { SVGProps } from "react";

export type IconName =
  | "activity"
  | "alert"
  | "arrow"
  | "brain"
  | "check"
  | "chevron"
  | "clock"
  | "document"
  | "flask"
  | "heart"
  | "home"
  | "image"
  | "lock"
  | "map"
  | "people"
  | "pulse"
  | "search"
  | "shield"
  | "sparkle";

const paths: Record<IconName, React.ReactNode> = {
  activity: <><path d="M4 12h3l2-6 4 12 2-6h5" /></>,
  alert: <><path d="M12 4 3.5 19h17L12 4Z" /><path d="M12 9v4M12 16.5v.01" /></>,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
  brain: <><path d="M9.5 4.5A3 3 0 0 0 5 7a3 3 0 0 0 .5 5.5A3.5 3.5 0 0 0 9 18h1V6.5a2 2 0 0 0-.5-2ZM14.5 4.5A3 3 0 0 1 19 7a3 3 0 0 1-.5 5.5A3.5 3.5 0 0 1 15 18h-1V6.5a2 2 0 0 1 .5-2Z" /><path d="M7 10h3M14 13h3" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>,
  document: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h4M9 12h6M9 16h5" /></>,
  flask: <><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" /><path d="M8 15h8" /></>,
  heart: <path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10A4.5 4.5 0 0 1 12 5a4.5 4.5 0 0 1 8 3.5Z" />,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5.5 9.5V21h13V9.5M9.5 21v-6h5v6" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 15-4-4-7 7-3-3-4 4" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  map: <><path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2z" /><path d="M9 4v14M15 6v14" /></>,
  people: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-2a5.5 5.5 0 0 1 11 0v2M16 5.5a3 3 0 0 1 0 5.5M17 14a5 5 0 0 1 3.5 4.8V20" /></>,
  pulse: <><path d="M3 12h4l2-5 4 10 2-5h6" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></>,
  shield: <><path d="M12 3 5 6v5c0 4.5 2.8 8.3 7 10 4.2-1.7 7-5.5 7-10V6z" /><path d="m9 12 2 2 4-5" /></>,
  sparkle: <><path d="m12 3 1.3 4.2L17.5 9l-4.2 1.8L12 15l-1.3-4.2L6.5 9l4.2-1.8z" /><path d="m18.5 15 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z" /></>,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
