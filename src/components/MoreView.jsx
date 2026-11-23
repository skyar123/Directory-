/* Everything that is not an everyday tool, grouped, so the top level stays
   at four places: Find, Today, Plan and More. */
export const MORE_GROUPS = [
  ["Browse", [
    ["sniff", "By SNIFF question", "Every SNIFF question, in the order the form asks, with what answers it"],
    ["food", "Food by day", "The weekly pantry and meal schedule, day by day"],
    ["events", "All events", "Events, deadlines and sign-ups, with filters"],
    ["assessment", "Community assessment", "The Child First Community Resource Assessment rows"],
  ]],
  ["Contacts", [
    ["people", "Point people", "Named contacts, and how quickly each one answers"],
  ]],
  ["Upkeep", [
    ["changed", "What changed", "New listings, corrections and dead ends"],
    ["gaps", "What is missing", "Missing phones and websites, and gaps in the service system"],
    ["data", "Data and repo", "Downloads, sources and clearing your edits"],
  ]],
];
export const MORE_TITLE = Object.fromEntries(MORE_GROUPS.flatMap(([, items]) => items.map(([id, t]) => [id, t])));

export default function MoreView({ go }) {
  return (
    <section className="pane more">
      {MORE_GROUPS.map(([g, items]) => (
        <div key={g} className="more-group">
          <h2>{g}</h2>
          <div className="more-list">
            {items.map(([id, title, sub]) => (
              <button key={id} className="more-link" onClick={() => go(id)}>
                <strong>{title}</strong><span>{sub}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
