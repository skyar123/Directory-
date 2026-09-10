/*
 * The few icons the UI needs, as inline SVG. Emoji were doing this job before,
 * which renders differently on every platform and reads as decoration rather
 * than as an affordance.
 */
const PATHS = {
  search: "M11 11 15 15 M7.5 12.5a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
  phone: "M5.5 2.5h-2a1 1 0 0 0-1 1.1 12 12 0 0 0 10.9 10.9 1 1 0 0 0 1.1-1v-2a1 1 0 0 0-.8-1l-2-.4a1 1 0 0 0-1 .4l-.6.8a9.5 9.5 0 0 1-4-4l.8-.6a1 1 0 0 0 .4-1l-.4-2a1 1 0 0 0-1-.8Z",
  link: "M6.8 9.2a3 3 0 0 0 4.3 0l2.1-2.1a3 3 0 1 0-4.3-4.3l-1 1 M9.2 6.8a3 3 0 0 0-4.3 0l-2.1 2.1a3 3 0 1 0 4.3 4.3l1-1",
  mail: "M2 4.5h12v8H2z M2 5l6 4.2L14 5",
  pin: "M8 14.5s5-4.2 5-7.6a5 5 0 0 0-10 0c0 3.4 5 7.6 5 7.6Z M8 8.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z",
  clock: "M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z M8 4.5V8l2.4 1.6",
  plus: "M8 3.5v9 M3.5 8h9",
  minus: "M3.5 8h9",
};

export default function Icon({ name, size = 15, className }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16"
      fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {d.split(" M").map((seg, i) => <path key={i} d={i ? "M" + seg : seg} />)}
    </svg>
  );
}

/* the rainbow arc from the favicon, so the header has a real mark */
export function Logo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <g strokeWidth="3.2" strokeLinecap="round" stroke="currentColor">
        <path d="M5 24a11 11 0 0 1 22 0" opacity=".38" />
        <path d="M9.5 24a6.5 6.5 0 0 1 13 0" opacity=".66" />
        <path d="M14 24a2 2 0 0 1 4 0" />
      </g>
    </svg>
  );
}
