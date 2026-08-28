export function Chip({ children, bg, fg, onClick, active, title }) {
  return (
    <button className={"chip" + (active ? " chip-on" : "")} onClick={onClick} title={title}
      style={{ background: active ? fg : bg, color: active ? "#fff" : fg, borderColor: fg }}>
      {children}
    </button>
  );
}

export function VerifyBadge({ r }) {
  if (r.verified) return <span className="badge ok">✅ {r.verified}</span>;
  return <span className="badge warn">⚠️ never verified</span>;
}

export function MissingBits({ r }) {
  const gaps = [];
  if (!r.phone) gaps.push("phone");
  if (!r.web) gaps.push("website");
  if (!r.address) gaps.push("address");
  if (!r.hours) gaps.push("hours");
  if (!r.point) gaps.push("point person");
  if (!gaps.length) return null;
  return <span className="badge gap">missing {gaps.join(", ")}</span>;
}

export function Field({ label, value, onChange, area }) {
  return (
    <label className="field">
      <span>{label}</span>
      {area
        ? <textarea value={value} rows={4} onChange={(e) => onChange(e.target.value)} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}
