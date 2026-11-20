import { telHref } from "../data.js";
import Icon from "./Icon.jsx";

/* The lines a family may need before anything else. Numbers come from the
   directory's own rows, so a fix to a row fixes this strip too. */
const LINES = [
  ["988-suicide-crisis-lifeline", "988", "Suicide or mental health crisis, call or text"],
  ["helpmate-domestic-violence-hotline", "Helpmate", "Domestic violence, 24/7"],
  ["our-voice-sexual-violence-hotline", "Our VOICE", "Sexual violence or trafficking, 24/7"],
  ["nc-211", "211", "Any need, any time"],
  ["code-purple", "Code Purple", "Cold-night shelter: is it called tonight?"],
];

/* Each need opens the SNIFF question that holds the curated list, the day's
   food schedule, or a search. */
export const NEED_ROUTES = [
  { label: "Food today", sub: "Pantries, meals and markets open today", go: { food: true }, icon: "bowl", tone: 1 },
  { label: "Diapers, formula and baby gear", sub: "Diaper bank, WIC, baby closets", go: { q: "diaper" }, icon: "bottle", tone: 2 },
  { label: "A safe place tonight", sub: "Shelters and Code Purple", go: { need: "VIII:7a" }, icon: "bed", tone: 3 },
  { label: "Not safe at home", sub: "Domestic violence help and safety planning", go: { need: "VII:7a" }, icon: "shield", tone: 4 },
  { label: "Rent, eviction or housing", sub: "Emergency help, legal aid, housing lists", go: { need: "VIII:6a" }, icon: "house", tone: 5 },
  { label: "Heat, power or a shut-off notice", sub: "LIHEAP, CIP, Duke and other utility help", go: { need: "VIII:14a" }, icon: "bolt", tone: 6 },
  { label: "Childcare or preschool", sub: "Head Start, NC Pre-K, help paying", go: { need: "I:7a" }, icon: "blocks", tone: 2 },
  { label: "A worry about a child's development", sub: "Early intervention and evaluations", go: { need: "I:2a" }, icon: "sprout", tone: 1 },
  { label: "A ride", sub: "Buses, Mountain Mobility, Medicaid rides", go: { need: "VIII:17a" }, icon: "car", tone: 5 },
  { label: "Counseling or recovery", sub: "Therapy, substance use care", go: { need: "VII:2a" }, icon: "chat", tone: 4 },
  { label: "Legal or immigration help", sub: "Civil legal aid and immigrant support", go: { need: "VIII:16a" }, icon: "scale", tone: 6 },
  { label: "Christmas and holiday help", sub: "Toy stores, gift programs, holiday meals", go: { q: "christmas" }, icon: "gift", tone: 3 },
  { label: "Not sure where to start", sub: "The call-first lines", go: { need: "X:1" }, icon: "compass", tone: 0 },
];

export default function NeedStart({ resById, onGo }) {
  const lines = LINES.map(([id, short, sub]) => [resById.get(id), short, sub]).filter(([r]) => r && r.phone);
  return (
    <div className="need-start">
      <aside className="crisis-strip" aria-label="Help right now">
        <p className="crisis-strip-911">In danger right now? Call <a href="tel:911">911</a>.</p>
        <ul>
          {lines.map(([r, short, sub]) => (
            <li key={r.id}>
              <a href={telHref(r.phone)}>
                <strong>{short}</strong>
                <span>{sub}</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <h2 className="need-title">What does the family need first?</h2>
      <div className="need-grid">
        {NEED_ROUTES.map((n) => (
          <button key={n.label} className={"need-btn tone-" + n.tone} onClick={() => onGo(n.go)}>
            <span className="need-ic"><Icon name={n.icon} size={20} /></span>
            <span className="need-txt"><strong>{n.label}</strong><small>{n.sub}</small></span>
          </button>
        ))}
      </div>
      <p className="tiny">Or type in the search box above, or ask Ask AI with the whole situation.</p>
    </div>
  );
}
