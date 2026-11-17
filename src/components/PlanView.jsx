import { telHref } from "../data.js";
import Icon from "./Icon.jsx";
import { familyText } from "./ResourceCard.jsx";

/* Questions that decide whether a visit works, asked before the trip rather
   than found out at the door. Prompts to carry along, not a screening form. */
export const PLAN_ASKS = [
  "How will we get there, and how long will it take?",
  "Is there an interpreter, or someone who speaks our language?",
  "Can the children come along, or is there childcare?",
  "Is there anything to arrange for a disability or sensory needs?",
  "What papers do we need, and what if we don't have them?",
  "Is there a time that works around work or school?",
  "How can they reach us: phone, text or email?",
];

/* with the year, because a plan is read later and a sign-up window can run
   into next year */
const withYear = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};
const evWhen = (e) => withYear(e.date) + (e.end ? " to " + withYear(e.end) : "") + (e.time ? ", " + e.time : "");

/* the plan as a family would read it: public contact facts, backups, dated
   events and the chosen questions. Staff notes never go in. */
export function planText(resources, events, asks) {
  const out = ["Your plan", ""];
  resources.forEach((r, i) => { out.push(`${i + 1}. ${familyText(r).split("\n\nBefore you go")[0]}`, ""); });
  if (events.length) {
    out.push("Dates to remember");
    events.forEach((e) => out.push(`- ${evWhen(e)}: ${e.what}${e.where ? ", " + e.where : ""}${e.w ? " (" + e.w + ")" : ""}`));
    out.push("");
  }
  if (asks.length) {
    out.push("Before you go, ask:");
    asks.forEach((a) => out.push("- " + a));
    out.push("");
  }
  out.push("Call before you go: hours and openings can change.");
  return out.join("\n");
}

export default function PlanView({ plan, resById, onRemove, onToggleAsk, onClear, copyText, onFind, onEvents }) {
  const resources = plan.items.filter((x) => x.t === "r").map((x) => resById.get(x.id)).filter(Boolean);
  const events = plan.items.filter((x) => x.t === "e").sort((a, b) => a.date.localeCompare(b.date));
  const total = resources.length + events.length;

  return (
    <section className="pane plan">
      <div className="plan-head">
        <h2>Visit plan</h2>
        <p className="lede">
          Gather the few places that fit a family, then copy or print them as one plan, with backups and the
          questions to ask before going.
        </p>
        <p className="handling no-print">
          <strong>Stays in this browser only.</strong> Nothing is sent anywhere. Do not add names or case details.
        </p>
      </div>

      <div className="row-btns no-print">
        <button className="btn ok-btn" disabled={!total}
          onClick={() => copyText(planText(resources, events, plan.asks), "Plan copied. Read it over before you send it.")}>
          Copy plan for a family
        </button>
        <button className="btn" disabled={!total} onClick={() => window.print()}>Print or save as PDF</button>
        <button className="btn danger" disabled={!total && !plan.asks.length}
          onClick={() => { if (window.confirm("Clear the whole visit plan?")) onClear(); }}>
          Clear plan
        </button>
      </div>

      {!total && (
        <div className="empty plan-empty no-print">
          <p>Nothing in the plan yet. Open a resource and tap <strong>Add to visit plan</strong>, or add an event from the Events tab.</p>
          <div className="row-btns">
            <button className="btn" onClick={onFind}>Find a resource</button>
            <button className="btn" onClick={onEvents}>Browse events</button>
          </div>
        </div>
      )}

      {!!resources.length && (
        <>
          <h3>Places to contact ({resources.length})</h3>
          <ol className="plan-list">
            {resources.map((r) => (
              <li key={r.id} className="plan-item">
                <div className="plan-item-main">
                  <strong>{r.name}</strong>
                  {r.phone && <a className="act call" href={telHref(r.phone)}><Icon name="phone" size={14} />{r.phone}</a>}
                  {r.address && <span className="plan-fact"><Icon name="pin" size={13} />{r.address}</span>}
                  {r.hours && <span className="plan-fact"><Icon name="clock" size={13} />{r.hours}</span>}
                  {r.web && <span className="plan-fact"><Icon name="link" size={13} />{r.web}</span>}
                  {r.email && <span className="plan-fact"><Icon name="mail" size={13} />{r.email}</span>}
                  {r.backup && <p className="backup"><strong>If this doesn't work:</strong> {r.backup}</p>}
                  {r.note && <p className="tiny plan-staff no-print"><strong>Staff note (not copied):</strong> {r.note}</p>}
                </div>
                <button className="btn no-print" onClick={() => onRemove("r", r.id)} aria-label={"Remove " + r.name}>Remove</button>
              </li>
            ))}
          </ol>
        </>
      )}

      {!!events.length && (
        <>
          <h3>Dates ({events.length})</h3>
          <ul className="plan-list">
            {events.map((e) => (
              <li key={e.id} className="plan-item">
                <div className="plan-item-main">
                  <strong>{e.what}</strong>
                  <span className="plan-fact"><Icon name="clock" size={13} />{evWhen(e)}</span>
                  {e.where && <span className="plan-fact"><Icon name="pin" size={13} />{e.where}</span>}
                  {e.ph && <a className="act call" href={telHref(e.ph)}><Icon name="phone" size={14} />{e.ph}</a>}
                  {e.w && <span className="plan-fact"><Icon name="link" size={13} />{e.w}</span>}
                </div>
                <button className="btn no-print" onClick={() => onRemove("e", e.id)} aria-label={"Remove " + e.what}>Remove</button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3>Before you go, ask</h3>
      <p className="tiny no-print">Tick the questions to carry into the copied or printed plan.</p>
      <ul className="plan-asks">
        {PLAN_ASKS.map((a) => {
          const on = plan.asks.includes(a);
          return (
            <li key={a} className={on ? "on" : "off"}>
              <label>
                <input type="checkbox" checked={on} onChange={() => onToggleAsk(a)} />
                <span>{a}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="tiny">Call before you go: hours and openings can change.</p>
    </section>
  );
}
