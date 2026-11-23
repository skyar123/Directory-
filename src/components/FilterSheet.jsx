import { FACETS } from "../facets.js";
import Icon from "./Icon.jsx";

/*
 * The Filter panel on Find: a sheet over the results on phones, a panel on
 * a computer. Every choice shows how many results it would leave, and the
 * button says how many will show (the pattern NN/g and Baymard recommend
 * for filtering on phones).
 */
export default function FilterSheet({ open, onClose, facets, toggle, counts, total, sections, sec, setSec,
  secCounts, gaps, setGaps, onClear }) {
  if (!open) return null;
  const groups = [...new Set(FACETS.map(([, , g]) => g))];
  return (
    <div className="sheet" role="dialog" aria-label="Filters">
      <button className="sheet-backdrop" aria-label="Close filters" onClick={onClose} />
      <div className="sheet-panel">
        <div className="sheet-head">
          <h2>Filters</h2>
          <button className="linkish" onClick={onClear}>Clear all</button>
        </div>
        {groups.map((g) => (
          <fieldset key={g} className="sheet-group">
            <legend>{g}</legend>
            {FACETS.filter(([, , gg]) => gg === g).map(([k, label]) => (
              <label key={k} className={"sheet-opt" + (counts[k] === 0 && !facets.includes(k) ? " zero" : "")}>
                <input type="checkbox" checked={facets.includes(k)} onChange={() => toggle(k)} />
                <span>{label}</span>
                <span className="sheet-n">{counts[k]}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <fieldset className="sheet-group">
          <legend>SNIFF section</legend>
          <label className="sheet-opt">
            <input type="radio" name="sec" checked={!sec} onChange={() => setSec("")} />
            <span>Any section</span>
          </label>
          {sections.filter((s) => secCounts[s.id] || sec === s.id).map((s) => (
            <label key={s.id} className="sheet-opt">
              <input type="radio" name="sec" checked={sec === s.id} onChange={() => setSec(s.id)} />
              <span><span className="dot" style={{ background: s.deep }} /> {s.id}. {s.name}</span>
              <span className="sheet-n">{secCounts[s.id] || 0}</span>
            </label>
          ))}
        </fieldset>
        <fieldset className="sheet-group">
          <legend>Upkeep</legend>
          <label className="sheet-opt">
            <input type="checkbox" checked={gaps} onChange={() => setGaps(!gaps)} />
            <span>Needs work only (missing a phone or website, or never verified)</span>
          </label>
        </fieldset>
        <p className="tiny">"Open today" reads each program's hours on file, so call to confirm.</p>
        <button className="btn ok-btn sheet-done" onClick={onClose}>
          <Icon name="search" size={15} />Show {total} {total === 1 ? "result" : "results"}
        </button>
      </div>
    </div>
  );
}
