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
  spark: "M8 2c.4 2.9 1.4 4.6 4.5 6-3.1 1.4-4.1 3.1-4.5 6-.4-2.9-1.4-4.6-4.5-6C6.6 6.6 7.6 4.9 8 2Z M13 1.5v2.5 M11.8 2.8h2.5",
  /* the bottom bar on phones */
  calendar: "M2.5 3.5h11v10h-11Z M2.5 6.5h11 M5.5 2v3 M10.5 2v3",
  clipboard: "M5.5 2h5v2.5h-5Z M5.5 3.2h-2v11.3h9V3.2h-2 M5.5 8h5 M5.5 10.8h3.5",
  grid: "M2.5 2.5h4v4h-4Z M9.5 2.5h4v4h-4Z M2.5 9.5h4v4h-4Z M9.5 9.5h4v4h-4Z",
  /* the need tiles on Find */
  bowl: "M2 7.5h12a6 6 0 0 1-12 0Z M5.5 5c0-1 1-1.2 1-2.5 M9.5 5c0-1 1-1.2 1-2.5",
  bottle: "M6.5 1.5h3 M6.2 3.5h3.6 M6.5 3.5 5 6v7.5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V6L9.5 3.5 M5 9.5h6",
  bed: "M1.5 4v9 M1.5 10h13v3 M7 10V7.5h5.5a2 2 0 0 1 2 2v.5 M4.3 8.5a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Z",
  shield: "M8 1.5 13.5 3.5v4c0 3.4-2.4 5.9-5.5 7-3.1-1.1-5.5-3.6-5.5-7v-4Z M5.8 8l1.5 1.5 3-3",
  house: "M2 7.5 8 2.5l6 5 M3.5 6.5v7h9v-7 M6.5 13.5v-4h3v4",
  bolt: "M9 1.5 3.5 9h4L7 14.5 12.5 7h-4Z",
  blocks: "M2.5 9.5h5v5h-5Z M8.5 9.5h5v5h-5Z M5.5 3.5h5v5h-5Z",
  sprout: "M8 14.5V8 M8 8C8 5 6 3.5 2.5 3.5 2.5 6.5 4.5 8 8 8Z M8 9.5c0-2.5 1.7-4 5.5-4 0 2.5-1.7 4-5.5 4Z",
  car: "M2.5 10.5V12.5h2v-1.5h7v1.5h2v-2 M2.5 10.5l1.3-4.3a1 1 0 0 1 1-.7h6.4a1 1 0 0 1 1 .7l1.3 4.3Z M2.5 10.5h11",
  chat: "M2.5 3h11v7.5h-6l-3 2.5v-2.5h-2Z M5.5 6.5h5",
  scale: "M8 2.5v11 M5 13.5h6 M3 5h10 M3 5 1.5 9a1.5 1.5 0 0 0 3 0Z M13 5l-1.5 4a1.5 1.5 0 0 0 3 0Z",
  gift: "M2.5 6.5h11V9h-11Z M3.5 9v5.5h9V9 M8 6.5v8 M8 6.5C6.5 6.5 5 5.8 5 4.5S6.5 3 8 6.5Z M8 6.5c1.5 0 3-.7 3-2S9.5 3 8 6.5Z",
  compass: "M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z M10.5 5.5 9 9l-3.5 1.5L7 7Z",
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
