import { telHref } from "../data.js";
import { LINES } from "./NeedStart.jsx";

/* The crisis lines, one tap from every screen (the red button in the header),
   instead of filling the top of the home screen. */
export default function CrisisSheet({ open, onClose, resById }) {
  if (!open) return null;
  const lines = LINES.map(([id, short, sub]) => [resById.get(id), short, sub]).filter(([r]) => r && r.phone);
  return (
    <div className="sheet" role="dialog" aria-label="Crisis lines">
      <button className="sheet-backdrop" aria-label="Close" onClick={onClose} />
      <div className="sheet-panel crisis-panel">
        <div className="sheet-head">
          <h2>Help right now</h2>
          <button className="linkish" onClick={onClose}>Close</button>
        </div>
        <a className="crisis-911" href="tel:911">In danger right now? <strong>Call 911</strong></a>
        <ul className="crisis-list">
          {lines.map(([r, short, sub]) => (
            <li key={r.id}>
              <a href={telHref(r.phone)}><strong>{short}</strong><span>{sub}</span><em>{r.phone.split("/")[0].trim()}</em></a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
