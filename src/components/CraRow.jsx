import { useState, useMemo } from "react";
import { SECBY, CRA_SECTIONS } from "../data.js";
import { Field } from "./bits.jsx";
import { craCandidates } from "../search.js";

export default function CraRow({ row, resources, entry, onEntry, onCopy }) {
  const [open, setOpen] = useState(false);
  const s = CRA_SECTIONS.find((c) => c.id === row.section);
  const cands = useMemo(() => (open ? craCandidates(row, resources) : []), [open, row, resources]);
  const attach = entry.attach || [];
  const detach = entry.detach || [];
  const confirmed = resources.filter((r) => attach.includes(r.id));
  const auto = cands.filter((c) => !attach.includes(c.r.id) && !detach.includes(c.r.id)).slice(0, 14);

  return (
    <div className="cra-row" style={{ borderLeftColor: s.deep }}>
      <button className="cra-head" onClick={() => setOpen((v) => !v)}>
        <span className="cra-num" style={{ background: s.hue, color: s.deep }}>{row.section}.{row.num}</span>
        <span className="cra-label">{row.label}</span>
        <span className="cra-count" style={{ color: confirmed.length ? s.deep : "#B0271F" }}>
          {confirmed.length ? confirmed.length + " confirmed" : "not filled"}
        </span>
      </button>

      {open && (
        <div className="cra-body">
          <div className="cra-grid">
            <Field label="Specific target populations served" area
              value={entry.pop || ""} onChange={(v) => onEntry({ ...entry, pop: v })} />
            <div className="cra-selects">
              <label className="field">
                <span>Member of your community collaborative?</span>
                <select value={entry.collab || ""} onChange={(e) => onEntry({ ...entry, collab: e.target.value })}>
                  <option value="">not answered</option><option>Yes</option><option>No</option><option>Unknown</option>
                </select>
              </label>
              <label className="field">
                <span>Does Child First already have a relationship?</span>
                <select value={entry.rel || ""} onChange={(e) => onEntry({ ...entry, rel: e.target.value })}>
                  <option value="">not answered</option><option>Yes</option><option>No</option><option>Unknown</option>
                </select>
              </label>
            </div>
          </div>

          <h4>On the form for this row {confirmed.length ? "(" + confirmed.length + ")" : ""}</h4>
          {confirmed.length === 0 && (
            <p className="empty">
              Nothing added yet. Pick from the suggestions below, or record this as a gap in your community.
            </p>
          )}
          <ul className="pill-list">
            {confirmed.map((r) => (
              <li key={r.id}>
                <span className="pill on" style={{ background: SECBY[r.sec].hue, color: SECBY[r.sec].deep }}>
                  {r.name}
                  <button onClick={() => onEntry({ ...entry, attach: attach.filter((x) => x !== r.id) })}
                    aria-label={"Remove " + r.name}>×</button>
                </span>
              </li>
            ))}
          </ul>

          <h4>Suggested from your directory</h4>
          {auto.length === 0 && (
            <p className="empty">No match in the directory. That is a real gap worth naming in the assessment.</p>
          )}
          <ul className="pill-list">
            {auto.map(({ r, why }) => (
              <li key={r.id}>
                <button className="pill" style={{ borderColor: SECBY[r.sec].deep, color: SECBY[r.sec].deep }}
                  title={why + " · " + (r.phone || "no phone on file")}
                  onClick={() => onEntry({ ...entry, attach: [...attach, r.id] })}>
                  + {r.name}
                </button>
              </li>
            ))}
          </ul>

          <div className="row-btns">
            <button className="btn" onClick={() => onCopy(row, confirmed, entry)}>
              Copy this row for the Word form
            </button>
            <span className="tiny src">
              Row text: Community_Resource_Assessment_Form_2.docx (Child First, Dec 2015)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
