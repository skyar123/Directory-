import { telHref } from "../data.js";
import { day, longDate, AGE_LABEL, STATUS_LABEL } from "../events.js";
import Icon from "./Icon.jsx";

/* label, badge class and the card's edge colour for each kind */
const KIND = {
  event: ["", "", "var(--line-strong)"],
  deadline: ["Deadline", "due", "var(--alert)"],
  signup: ["Sign-up", "new", "var(--accent)"],
};

export default function EventCard({ e, soon, resource, onOpen }) {
  const [label, cls, edge] = KIND[e.kind] || KIND.event;
  const open = soon === "On now" || soon === "Open now";
  /* a window that has already opened is shown by the day it closes */
  const shown = day(open ? e.end : e.date);
  const when = longDate(e.date) + (e.end ? " to " + longDate(e.end) : "")
    + (e.time ? " · " + e.time : "");
  const url = e.w ? (e.w.startsWith("http") ? e.w : "https://" + e.w) : "";
  /* a calendar listing's link is a long event URL; its site says enough */
  let linkText = e.w || "";
  if (linkText.length > 42) {
    try { linkText = new URL(url).hostname.replace(/^www\./, ""); } catch (err) { /* keep it */ }
  }

  return (
    <article className="card ev" style={{ "--sec": edge }}>
      <div className="ev-top">
        <div className="ev-date" aria-hidden="true">
          <span>{open ? "until" : shown.toLocaleDateString("en-US", { weekday: "short" })}</span>
          <strong>{shown.getDate()}</strong>
          <span>{shown.toLocaleDateString("en-US", { month: "short" })}</span>
        </div>
        <div className="ev-main">
          <strong className="ev-what">{e.what}</strong>
          <span className="card-sub"><Icon name="clock" size={13} />{when}</span>
          {e.where && <span className="card-sub"><Icon name="pin" size={13} />{e.where}</span>}
          {e.org && <span className="card-sub ev-org">{e.org}</span>}
        </div>
      </div>

      <div className="card-badges">
        {soon && <span className="badge soon">{soon}</span>}
        {label && <span className={"badge " + cls}>{label}</span>}
        {(e.ages || []).map((a) => <span key={a} className="badge">{AGE_LABEL[a] || a}</span>)}
        {(e.tags || []).map((t) => <span key={t} className="badge sp">{t}</span>)}
        {e.status
          ? <span className={"badge " + (e.status === "recheck" ? "warn" : "listed")}>
              {STATUS_LABEL[e.status]}{e.status !== "recheck" && e.checked ? ", " + e.checked : ""}
            </span>
          : e.lv
            ? <span className="badge ok">Verified {e.lv}</span>
            : <span className="badge warn">Never verified</span>}
      </div>

      {e.note && <p className="callout">{e.note}</p>}
      {e.detail && <p className="detail">{e.detail}</p>}
      {e.cost && <p className="detail">Cost: {e.cost}</p>}

      {(e.ph || url || resource) && (
        <div className="card-actions">
          {e.ph && (
            <a className="act call" href={telHref(e.ph)}>
              <Icon name="phone" size={14} />{e.ph}
            </a>
          )}
          {url && (
            <a className="act link" href={url} target="_blank" rel="noreferrer">
              <Icon name="link" size={14} />{linkText}
            </a>
          )}
          {resource && (
            <button className="act link" onClick={onOpen} title={resource.name}>
              <Icon name="search" size={14} />Open in the directory
            </button>
          )}
        </div>
      )}
      <p className="tiny src">Source: {e.src}</p>
    </article>
  );
}
