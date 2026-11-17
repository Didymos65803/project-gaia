import type { ReactNode } from 'react';
import type { IconName } from '../data/types';

const shapes: Record<IconName, ReactNode> = {
  globe: <><circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="3.6" ry="8"/><path d="M4 12h16M12 1v2m0 18v2M1 12h2m18 0h2"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></>,
  chart: <><path d="M3 3v17h18M6 15l5-5 4 2 6-7"/><path d="M17 5h4v4"/></>,
  flask: <><path d="M9 3h6m-5 0v7L4.5 19a1.4 1.4 0 0 0 1.2 2h12.6a1.4 1.4 0 0 0 1.2-2L14 10V3M7.4 15h9.2"/><path d="M10 18h.01m4-.5h.01" strokeWidth="2.4"/></>,
  drop: <><path d="M12 2.5c2.7 3.5 6.5 7.4 6.5 11.6a6.5 6.5 0 1 1-13 0c0-4.2 3.8-8.1 6.5-11.6Z"/><path d="M9 15a3 3 0 0 0 3 3"/></>,
  bolt: <path d="M13 2 4.5 13H11l-1 9 9.5-12H13l1-8h-1Z"/>,
  leaf: <><path d="M5.5 18.5C1 14 5 8 10 7c4.3-1 6.9-.3 10.7-3.4.4 5.9-1.8 12.4-6.3 14.6-3.1 1.6-6.6 1.2-8.9.3ZM3 21l11-9"/></>,
  cloud: <><path d="M5 16a3.5 3.5 0 0 1-1-6.9 6.2 6.2 0 0 1 11.9-1.4A4.3 4.3 0 1 1 17.8 16H5Zm4 3-1 2m5-2-1 2m5-2-1 2"/></>,
  dna: <><path d="M7 3c0 9 10 9 10 18M17 3c0 9-10 9-10 18M7.6 6h8.8M9.6 9h4.8m-4.8 6h4.8m-6.8 3h8.8"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6"/>,
  back: <path d="M20 12H5m6-6-6 6 6 6"/>,
  notebook: <><path d="M7 3h12v18H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM5 17h14M9 7h6m-6 4h4"/><path d="M3 7h3m-3 4h3"/></>,
  settings: <><path d="m9.5 3-.7 2.2-2 .9-2.1-.9-2 3.5 1.7 1.6v2.4l-1.7 1.5 2 3.5 2.2-.8 2 .9.6 2.2h4l.7-2.2 2-.9 2.1.9 2-3.5-1.7-1.6v-2.4l1.7-1.5-2-3.5-2.2.8-2-.9-.6-2.1Z"/><circle cx="11.5" cy="11.5" r="3"/></>,
  hint: <><path d="M9 18h6m-5 3h4M8.5 15.5A6 6 0 1 1 15.5 15.5l-.5 1.2H9l-.5-1.2Z"/><path d="M11 8h2"/></>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  radio: <><path d="M7 5a10 10 0 0 0 0 14M4 2a14 14 0 0 0 0 20M17 5a10 10 0 0 1 0 14m3-17a14 14 0 0 1 0 20"/><circle cx="12" cy="12" r="2"/></>,
  clock: <><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  shield: <><path d="M12 2.8 20 6v5c0 4.6-2.6 7.7-8 10-5.4-2.3-8-5.4-8-10V6l8-3.2Z"/><path d="m8.5 12 2.3 2.3 4.7-4.8"/></>,
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>;
}
