import { shortDate } from "../events.js";

/* What the calendar cannot promise, kept apart from the dated listings:
   series as their organizers had published them, annual events with no
   date yet, and the calendars this was read from, with where each is thin. */
const linkOf = (w) => (w && !w.startsWith("http") ? "https://" + w : w);

function seriesWhen(s) {
  if (s.when) return s.when;
  const span = s.first && s.last && s.first !== s.last
    ? `${shortDate(s.first)} to ${shortDate(s.last)}` : s.first ? shortDate(s.first) : "";
  return [s.n && `${s.n} date${s.n === 1 ? "" : "s"} published`, span].filter(Boolean).join(", ");
}

export default function CalendarNotes({ cal, resById, onOpen }) {
  const open = (rid) => resById.get(rid) && (
    <button className="linkish" onClick={() => onOpen(resById.get(rid))}>Open in the directory</button>
  );
  return (
    <div className="cal-notes">
      <details className="past">
        <summary>Repeating series <span className="need-n">{cal.series.length}</span></summary>
        <p className="tiny cal-intro">
          Each series as its organizer had published it when the Public Edition checked ({cal.checked}).
          A pattern is not a promise of more dates: check the listing before you send anyone.
        </p>
        <ul className="cal-list">
          {cal.series.map((s, i) => (
            <li key={i}>
              <strong>{s.what}</strong>
              <span className="cal-org">{s.org}</span>
              <span>{[s.pattern, seriesWhen(s), s.time].filter(Boolean).join(" · ")}</span>
              {(s.aud || s.cost || s.reg) && (
                <span>{[s.aud && "For: " + s.aud, s.cost && "Cost: " + s.cost, s.reg].filter(Boolean).join(" · ")}</span>
              )}
              <span className="tiny">{s.note}</span>
              <span className="cal-acts">
                {s.w && <a href={linkOf(s.w)} target="_blank" rel="noreferrer">Listing</a>}
                {open(s.rid)}
              </span>
            </li>
          ))}
        </ul>
      </details>

      <details className="past">
        <summary>Watch for: not announced yet <span className="need-n">{cal.watch.length}</span></summary>
        <p className="tiny cal-intro">
          Yearly events and series with no date in the window yet. Do not tell a family they are on.
        </p>
        <ul className="cal-list">
          {cal.watch.map((w, i) => (
            <li key={i}>
              <strong>{w.what}</strong>
              <span className="cal-org">{w.org}</span>
              <span>{w.status}</span>
              {w.next && <span className="tiny">Next step: {w.next}</span>}
              <span className="cal-acts">
                {w.w && <a href={linkOf(w.w)} target="_blank" rel="noreferrer">Organizer's page</a>}
                {open(w.rid)}
              </span>
            </li>
          ))}
        </ul>
      </details>

      <details className="past">
        <summary>Where the calendar comes from <span className="need-n">{cal.calendars.length}</span></summary>
        <p className="tiny cal-intro">
          Organizers publish a few months ahead, so later months look thin. That means not published
          yet, not that nothing is on. These are the calendars to check again each month.
        </p>
        <ul className="cal-list">
          {cal.calendars.map((c, i) => (
            <li key={i}>
              <strong>{c.org}</strong>
              {c.coverage && <span>{c.coverage}</span>}
              {c.gap && <span className="tiny">{c.gap}</span>}
              <span className="cal-acts">
                {c.w && <a href={linkOf(c.w)} target="_blank" rel="noreferrer">Calendar</a>}
                {c.next && <span className="tiny">Check: {c.next.toLowerCase()}</span>}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
