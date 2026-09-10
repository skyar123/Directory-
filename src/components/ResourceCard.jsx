import { useState } from "react";
import { SECBY, NEEDBY, FIELDS } from "../data.js";
import { VerifyBadge, MissingBits, Field } from "./bits.jsx";
import Icon from "./Icon.jsx";

export default function ResourceCard({ r, open, onToggle, onEdit, onVerify, showGaps }) {
  const s = SECBY[r.sec] || SECBY.X;
  const [editing, setEditing] = useState(false);
  const tel = r.phone ? r.phone.split(/[/,]/)[0].trim() : "";
  const url = r.web ? (r.web.startsWith("http") ? r.web : "https://" + r.web) : "";
  const answers = r.needs.filter((k) => NEEDBY[k]);

  return (
    <article className="card" data-open={open ? "true" : "false"} style={{ "--sec": s.deep }}>
      <button className="card-head" onClick={onToggle} aria-expanded={open ? "true" : "false"}>
        <span className="card-title">
          <strong>{r.name}</strong>
          <span className="card-sub">
            <span className="dot" style={{ background: s.deep }} />
            {s.id}. {s.name}
            {r.origSection && r.origSection.toLowerCase() !== s.name.toLowerCase()
              && !r.origSection.toLowerCase().startsWith(s.id.toLowerCase() + ".")
              && <span className="card-orig">{r.origSection}</span>}
          </span>
        </span>
        <span className="card-caret"><Icon name={open ? "minus" : "plus"} /></span>
      </button>

      <div className="card-badges">
        {r.startHere && <span className="badge start">Start here</span>}
        {r.readFirst && <span className="badge warn">Read the note first</span>}
        {r.isNew && <span className="badge new">New</span>}
        <VerifyBadge r={r} />
        {r.spanish && <span className="badge sp">{r.spanish.replace(/^[^\w]+/, "")}</span>}
        {showGaps && <MissingBits r={r} />}
      </div>

      <div className="card-actions">
        {tel && (
          <a className="act call" href={"tel:" + tel.replace(/[^0-9]/g, "")}>
            <Icon name="phone" size={14} />{r.phone}
          </a>
        )}
        {url && (
          <a className="act link" href={url} target="_blank" rel="noreferrer">
            <Icon name="link" size={14} />{r.web}
          </a>
        )}
        {r.email && (
          <a className="act link" href={"mailto:" + r.email}>
            <Icon name="mail" size={14} />{r.email}
          </a>
        )}
        {r.address && <span className="act loc"><Icon name="pin" size={14} />{r.address}</span>}
        {r.hours && <span className="act loc"><Icon name="clock" size={14} />{r.hours}</span>}
      </div>

      {open && (
        <div className="card-body">
          {r.note && <p className="callout">{r.note}</p>}
          {r.detail && <p className="detail">{r.detail}</p>}
          {r.tags && (
            <p className="tags">
              {r.tags.split(/\s*[|,]\s*/).filter(Boolean).map((t, i) => <span key={i}>{t}</span>)}
            </p>
          )}
          {r.spanishDetail && <p className="tiny"><strong>Spanish:</strong> {r.spanishDetail}</p>}
          {r.point && <p className="tiny"><strong>Point person:</strong> {r.point}</p>}
          {!!answers.length && (
            <p className="tiny">
              <strong>Answers:</strong>{" "}
              {answers.map((k) => NEEDBY[k].section + " " + NEEDBY[k].code + " " + NEEDBY[k].label).join(" · ")}
            </p>
          )}
          <p className="tiny src">
            Source: {r.source}{r.verifiedBy ? " · verified by " + r.verifiedBy : ""}
          </p>

          <div className="row-btns">
            <button className="btn" onClick={() => setEditing((v) => !v)}>
              {editing ? "Close editor" : "Edit"}
            </button>
            <button className="btn ok-btn" onClick={onVerify}>Mark verified today</button>
          </div>

          {editing && (
            <div className="editor">
              {FIELDS.map(([key, label]) => (
                <Field key={key} label={label} value={r[key] || ""} area={key === "detail"}
                  onChange={(v) => onEdit(key, v)} />
              ))}
              <p className="tiny">Edits are saved in this browser. Export from the Data tab to keep them.</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
