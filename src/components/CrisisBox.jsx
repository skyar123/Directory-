import { telHref } from "../data.js";
import { CRISIS_LINES } from "../urgent.js";

/* Shown by Ask AI the moment a question sounds like someone may be in
   danger, before Gemini answers and whatever it says. The lines, numbers and
   hours are the directory's own rows, so a fix to a row fixes this too. */
function actionsFor(r) {
  const text = /text\s+(\w+)\s+to\s+(\d+)/i.exec(r.phone || "");
  if (text) return [{ href: `sms:${text[2]}?&body=${encodeURIComponent(text[1])}`, label: `Text ${text[1]} to ${text[2]}` }];
  if (!r.phone) return [];
  const first = r.phone.split(/[/,]/)[0].trim();
  const out = [{ href: telHref(first), label: "Call " + first }];
  if (/\btext\b/i.test(r.hours || "")) out.push({ href: "sms:" + telHref(first).slice(4), label: "Text " + first });
  return out;
}

export default function CrisisBox({ kind, byId }) {
  const lines = (CRISIS_LINES[kind] || []).map((id) => byId.get(id)).filter(Boolean);
  return (
    <aside className="crisis-box" aria-label="Help right now">
      <h3>Help is here right now</h3>
      <p className="crisis-911">
        If anyone is in danger right now, call <a href="tel:911">911</a>.
      </p>
      <ul className="crisis-lines">
        {lines.map((r) => (
          <li key={r.id}>
            <span className="crisis-name">
              <strong>{r.name}</strong>
              {r.hours && <span className="crisis-hours">{r.hours}</span>}
            </span>
            <span className="crisis-acts">
              {actionsFor(r).map((a) => (
                <a key={a.href} className="act call" href={a.href}>{a.label}</a>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <p className="tiny">
        These lines are free. Reaching out is a strong thing to do, for a family and for you.
        Ask AI's other suggestions follow below.
      </p>
    </aside>
  );
}
