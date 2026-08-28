import { useState } from "react";
import { SECBY, NEEDBY, FIELDS } from "../data.js";
import { VerifyBadge, MissingBits, Field } from "./bits.jsx";

export default function ResourceCard({ r, open, onToggle, onEdit, onVerify, compact }) {
  const s = SECBY[r.sec] || SECBY.X;
  const [editing, setEditing] = useState(false);
  const tel = r.phone ? r.phone.split(/[/,]/)[0].trim() : "";
  const url = r.web ? (r.web.startsWith("http") ? r.web : "https://" + r.web) : "";

  return (
    <article className="card" style={{ borderLeftColor: s.deep, background: open ? "#fff" : "#FFFDF8" }}>
      <button className="card-head" onClick={onToggle}>
        <span className="card-icon" style={{ background: s.hue }}>{s.icon}</span>
        <span className="card-title">
          <strong>{r.name}</strong>
          <span className="card-sub">{r.origSection || s.name}</span>
        </span>
        <span className="card-caret">{open ? "−" : "+"}</span>
      </button>

      <div className="card-badges">
        {r.isNew && <span className="badge new">new</span>}
        <VerifyBadge r={r} />
        {r.spanish && <span className="badge sp">{r.spanish}</span>}
        {!compact && <MissingBits r={r} />}
      </div>

      <div className="card-actions">
        {tel && <a className="act call" href={"tel:" + tel.replace(/[^0-9]/g, "")}>📞 {r.phone}</a>}
        {url && <a className="act link" href={url} target="_blank" rel="noreferrer">🔗 {r.web}</a>}
        {r.email && <a className="act link" href={"mailto:" + r.email}>✉️ {r.email}</a>}
        {r.address && <span className="act loc">📍 {r.address}</span>}
        {r.hours && <span className="act loc">🕓 {r.hours}</span>}
      </div>

      {open && (
        <div className="card-body">
          {r.note && <p className="callout">🚩 {r.note}</p>}
          {r.detail && <p className="detail">{r.detail}</p>}
          {r.tags && <p className="tags">{r.tags}</p>}
          {r.spanishDetail && <p className="tiny">Spanish: {r.spanishDetail}</p>}
          {r.point && <p className="tiny">Point person: {r.point}</p>}
          {!!r.needs.filter((k) => NEEDBY[k]).length && (
            <p className="tiny">
              Answers: {r.needs.filter((k) => NEEDBY[k])
                .map((k) => NEEDBY[k].section + " " + NEEDBY[k].code + " " + NEEDBY[k].label)
                .join(" · ")}
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
              <p className="tiny">
                Edits are saved in this browser. Export from the Data tab to keep them.
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
