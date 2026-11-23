/*
 * Two compiled collections Skylar asked for (23 Nov 2026), built from the
 * SNIFF needs each program is filed under, plus programs whose own name
 * says what they are, so a new listing joins its collection without a
 * separate list to keep up.
 */
export const COLLECTIONS = {
  autism: {
    title: "Autism resources",
    sub: "Where to start, evaluations, therapies and ABA, school rights, respite and funding, sensory-friendly places, everyday life",
    icon: "sprout",
    tone: 4,
    needs: ["IX:1a", "IX:2a", "IX:3a", "IX:4a", "IX:5a", "IX:6a", "IX:7a", "IX:8a", "IX:9a", "IX:10a", "IX:11a"],
    alsoSection: "IX",
    alsoName: /autis|neurodiver|\bABA\b|sensory/i,
    otherLabel: "More autism and neurodivergence resources",
  },
  development: {
    title: "Evaluations and developmental concerns",
    sub: "Developmental screening, early intervention, speech, OT and feeding therapy, autism and developmental evaluations",
    icon: "compass",
    tone: 5,
    needs: ["IX:1a", "I:1a", "I:2a", "IX:4a", "I:5a", "IX:2a", "I:3a", "IX:3a", "I:6a", "II:1a", "II:2a"],
    alsoName: /speech|occupational therap|feeding therap|pediatric therapy|developmental (evaluation|assessment|screening)|psych(ological)? testing|evaluation/i,
    otherLabel: "Other therapy and evaluation listings",
  },
};

/* the collection's programs, grouped by need, each program once */
export function collect(c, resources, needBy) {
  const taken = new Set();
  const groups = c.needs.map((k) => {
    const items = resources.filter((r) => !taken.has(r.id) && r.needs.includes(k));
    items.forEach((r) => taken.add(r.id));
    return { key: k, label: needBy[k] ? needBy[k].label : k, items };
  }).filter((g) => g.items.length);
  const more = resources.filter((r) => !taken.has(r.id) && !/\bclosed\b/i.test(r.name)
    && ((c.alsoSection && (r.sec === c.alsoSection || (r.secs || []).includes(c.alsoSection))) || (c.alsoName && c.alsoName.test(r.name))));
  if (more.length) groups.push({ key: "more", label: c.otherLabel, items: more });
  return groups;
}
