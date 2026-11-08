import { Chip } from "./bits.jsx";

/* Quick taps that tell Ask AI about the family without identifying anyone:
   the children's ages, Spanish, no car, and the town. They are added to the
   question as one plain line, which the search and Gemini both read. */
export const AGES = [
  ["baby", "Baby (under 1)"], ["toddler", "Toddler (1 to 3)"],
  ["preschool", "Preschool (3 to 5)"], ["school", "School-age"],
];
export const TOWNS = [
  "Asheville", "West Asheville", "Arden", "Barnardsville", "Black Mountain", "Candler", "Enka", "Fairview",
  "Fletcher", "Leicester", "Swannanoa", "Weaverville", "Woodfin", "Marshall", "Mars Hill", "Hendersonville",
  "Waynesville", "Marion",
];
const AGE_WORDS = { baby: "a baby", toddler: "a toddler", preschool: "a preschooler", school: "a school-age child" };
export const NO_CONTEXT = { ages: [], spanish: false, noCar: false, town: "" };

export function contextLine(ctx) {
  const bits = [];
  if (ctx.ages.length) bits.push("children: " + AGES.filter(([k]) => ctx.ages.includes(k)).map(([k]) => AGE_WORDS[k]).join(" and "));
  if (ctx.spanish) bits.push("the family speaks Spanish");
  if (ctx.noCar) bits.push("no car");
  if (ctx.town) bits.push("lives in or near " + ctx.town);
  return bits.length ? "About the family: " + bits.join("; ") + "." : "";
}

export default function AskContext({ ctx, onChange }) {
  const set = (patch) => onChange({ ...ctx, ...patch });
  const toggleAge = (k) => set({ ages: ctx.ages.includes(k) ? ctx.ages.filter((a) => a !== k) : [...ctx.ages, k] });
  return (
    <div className="ask-context" role="group" aria-label="About the family, optional">
      <span className="ask-context-label">About the family, if it helps:</span>
      {AGES.map(([k, label]) => (
        <Chip key={k} active={ctx.ages.includes(k)} onClick={() => toggleAge(k)}>{label}</Chip>
      ))}
      <Chip active={ctx.spanish} onClick={() => set({ spanish: !ctx.spanish })}>Speaks Spanish</Chip>
      <Chip active={ctx.noCar} onClick={() => set({ noCar: !ctx.noCar })}>No car</Chip>
      <select className="ask-town" value={ctx.town} onChange={(e) => set({ town: e.target.value })} aria-label="Town">
        <option value="">Town</option>
        {TOWNS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
    </div>
  );
}
