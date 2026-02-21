import * as React from 'react';

/** Tile key for activity summary KPI tiles */
export type TileIconKey =
  | 'total'
  | 'open'
  | 'overdue'
  | 'dueToday'
  | 'dueWeek'
  | 'dueMonth'
  | 'dueYear';

/** Simple inline SVG icons (valid path data, no external dependency). Size controlled by CSS. */
const iconPaths: Record<TileIconKey, React.ReactNode> = {
  total: <path fill="currentColor" d="M2 5h16v1.5H2V5zm0 6h16v1.5H2V11zm0 6h10v1.5H2V17z" />,
  open: (
    <path
      fill="currentColor"
      d="M3 5h14a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm0 2v6h14V7.2L10.5 11 3 7.4V7z"
    />
  ),
  overdue: (
    <path
      fill="currentColor"
      d="M10 2a8 8 0 110 16 8 8 0 010-16zm0 2a6 6 0 100 12 6 6 0 000-12zm1 2v4h3v1.5h-4V6h1z"
    />
  ),
  dueToday: (
    <path
      fill="currentColor"
      d="M5 3h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm0 2v10h10V5H5zm2 2h2v2H7V7zm4 0h2v2h-2V7zm-4 4h2v2H7v-2zm4 0h2v2h-2v-2z"
    />
  ),
  dueWeek: (
    <path
      fill="currentColor"
      d="M5 3h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm0 2v2h2V5H5zm4 0v2h2V5H9zm4 0v2h2V5h-2zm-8 4v2h2V9H5zm4 0v2h2V9H9zm4 0v2h2V9h-2zm-8 4v2h2v-2H5zm4 0v2h2v-2H9zm4 0v2h2v-2h-2z"
    />
  ),
  dueMonth: (
    <path
      fill="currentColor"
      d="M5 3h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm0 2v10h10V5H5z"
    />
  ),
  dueYear: (
    <path
      fill="currentColor"
      d="M5 3h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm0 2v2h2V5H5zm4 0v2h2V5H9zm4 0v2h2V5h-2zm-8 4v2h2V9H5zm4 0v2h2V9H9zm4 0v2h2V9h-2zm-8 4v2h2v-2H5zm4 0v2h2v-2H9zm4 0v2h2v-2h-2z"
    />
  ),
};

const viewBox = '0 0 20 20';

export function TileIcon({ name, className }: { name: TileIconKey; className?: string }): React.ReactElement {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: 'block' }}
    >
      {iconPaths[name]}
    </svg>
  );
}
