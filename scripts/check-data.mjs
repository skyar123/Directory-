/*
 * Validates data/ before you commit an edited export. The workflow in the
 * README is "download the JSON, drop it in, commit" -- this is what catches a
 * truncated download or a hand-edit that broke a reference.
 *
 *   npm run check
 */
import { readFileSync } from "node:fs";

const read = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const problems = [];
const note = (m) => problems.push(m);

const resources = read("resources.json");
const sniff = read("sniff.json");
const people = read("point-people.json");
const cra = read("community-resource-assessment.json");
const changelog = read("changelog.json");
const food = read("food-by-day.json");
const events = read("events.json");
const calendar = read("calendar.json");

const sectionIds = new Set(sniff.sections.map((s) => s.id));
const needKeys = new Set(sniff.needs.map((n) => n.key));

/* resources */
const seen = new Set();
for (const r of resources.resources) {
  if (!r.id) note(`resource with no id: ${r.n}`);
  if (seen.has(r.id)) note(`duplicate resource id: ${r.id}`);
  seen.add(r.id);
  if (!r.n) note(`resource ${r.id} has no name`);
  if (!sectionIds.has(r.sec)) note(`resource ${r.id} has unknown section "${r.sec}"`);
  if (!r.src) note(`resource ${r.id} has no src -- every fact needs a provenance`);
  for (const k of r.needs || []) {
    // "I:*" style wildcards point at a whole section rather than one question
    if (k.endsWith(":*")) {
      if (!sectionIds.has(k.slice(0, -2))) note(`resource ${r.id} wildcard "${k}" has no section`);
    } else if (!needKeys.has(k)) {
      note(`resource ${r.id} references unknown SNIFF question "${k}"`);
    }
  }
}

/* food schedule */
for (const d of food.days) {
  if (!d.sites.length) note(`food day ${d.day} has no sites`);
  for (const s of d.sites) if (!s.place) note(`a site on ${d.day} has no name`);
}

/* events: the Events tab sorts on these dates, so a typo would file an
   event under the wrong day rather than fail anywhere you would see it */
const KINDS = new Set(["event", "deadline", "signup"]);
const isDay = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return false;
  const d = new Date(s + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
const eventIds = new Set();
for (const e of events.events) {
  if (!e.id) note(`event with no id: ${e.what}`);
  if (eventIds.has(e.id)) note(`duplicate event id: ${e.id}`);
  eventIds.add(e.id);
  if (!e.what) note(`event ${e.id} has no title`);
  if (!isDay(e.date)) note(`event ${e.id} has date "${e.date}", not a real YYYY-MM-DD day`);
  if (e.end !== undefined && !(isDay(e.end) && e.end >= e.date)) {
    note(`event ${e.id} has end "${e.end}", not a real day on or after its date`);
  }
  if (!KINDS.has(e.kind)) note(`event ${e.id} has unknown kind "${e.kind}"`);
  if (e.tags !== undefined && !Array.isArray(e.tags)) note(`event ${e.id} has tags that are not a list`);
  if (!e.src) note(`event ${e.id} has no src: every event needs a provenance`);
  if (e.rid && !seen.has(e.rid)) note(`event ${e.id} links to unknown resource "${e.rid}"`);
}

/* the Public Edition calendar: the same rules, plus its own window and
   labels. Its src is built from org and status, so org and status are what
   every entry has to carry instead. */
const STATUSES = new Set(["library", "organizer", "recheck", "season"]);
const FITS = new Set(["family", "caregiver", "general"]);
const AGES = new Set(["baby", "toddler", "preschool", "school", "teen", "adult"]);
const { from, to } = calendar.meta;
if (!isDay(from) || !isDay(to)) note(`calendar.json meta needs a real from and to day`);
for (const e of calendar.events) {
  if (!e.id) note(`calendar event with no id: ${e.what}`);
  if (eventIds.has(e.id)) note(`duplicate event id across events.json and calendar.json: ${e.id}`);
  eventIds.add(e.id);
  if (!e.what) note(`calendar event ${e.id} has no title`);
  if (!isDay(e.date)) note(`calendar event ${e.id} has date "${e.date}", not a real YYYY-MM-DD day`);
  else if (e.date < from || e.date > to) note(`calendar event ${e.id} on ${e.date} is outside ${from} to ${to}`);
  if (e.end !== undefined && !(isDay(e.end) && e.end >= e.date)) {
    note(`calendar event ${e.id} has end "${e.end}", not a real day on or after its date`);
  }
  if (!KINDS.has(e.kind)) note(`calendar event ${e.id} has unknown kind "${e.kind}"`);
  if (e.tags !== undefined && !Array.isArray(e.tags)) note(`calendar event ${e.id} has tags that are not a list`);
  if (!e.org) note(`calendar event ${e.id} has no org`);
  if (!STATUSES.has(e.status)) note(`calendar event ${e.id} has unknown status "${e.status}"`);
  if (!FITS.has(e.fit)) note(`calendar event ${e.id} has unknown fit "${e.fit}"`);
  for (const a of e.ages || []) if (!AGES.has(a)) note(`calendar event ${e.id} has unknown age group "${a}"`);
  if (!e.w) note(`calendar event ${e.id} has no link to its listing`);
  if (e.rid && !seen.has(e.rid)) note(`calendar event ${e.id} links to unknown resource "${e.rid}"`);
}
for (const s of calendar.series) {
  if (!s.org || !s.what || !s.note) note(`calendar series "${s.what}" needs org, what and its verification note`);
  for (const k of ["first", "last"]) if (s[k] !== undefined && !isDay(s[k])) note(`calendar series "${s.what}" has ${k} "${s[k]}", not a real day`);
  if (s.rid && !seen.has(s.rid)) note(`calendar series "${s.what}" links to unknown resource "${s.rid}"`);
}
for (const w of calendar.watch) {
  if (!w.org || !w.what || !w.status) note(`calendar lead "${w.what}" needs org, what and its announcement status`);
  if (w.rid && !seen.has(w.rid)) note(`calendar lead "${w.what}" links to unknown resource "${w.rid}"`);
}
for (const c of calendar.calendars) if (!c.org || !c.w) note(`monitored calendar "${c.org}" needs org and a link`);

/* people */
const pnames = new Set();
for (const p of people.people) {
  if (!p.n) note("a point person has no name");
  if (pnames.has(p.n)) note(`duplicate point person: ${p.n}`);
  pnames.add(p.n);
}

/* assessment rows */
for (const row of cra.rows) {
  if (!cra.sections.some((s) => s.id === row.section)) {
    note(`assessment row ${row.id} has unknown section "${row.section}"`);
  }
  for (const k of row.needs || []) {
    if (!k.endsWith(":*") && !needKeys.has(k)) {
      note(`assessment row ${row.id} references unknown SNIFF question "${k}"`);
    }
  }
}

const counts = {
  resources: resources.resources.length,
  "SNIFF questions": sniff.needs.length,
  sections: sniff.sections.length,
  "point people": people.people.length,
  "assessment rows": cra.rows.length,
  "changelog entries": changelog.groups.reduce((n, g) => n + g.entries.length, 0),
  "food schedule rows": food.days.reduce((n, d) => n + d.sites.length, 0),
  events: events.events.length,
  "calendar events": calendar.events.length,
  "calendar series": calendar.series.length,
};
for (const [k, v] of Object.entries(counts)) console.log(`${String(v).padStart(5)}  ${k}`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems.slice(0, 40)) console.error("  " + p);
  if (problems.length > 40) console.error(`  ...and ${problems.length - 40} more`);
  process.exit(1);
}
console.log("\ndata/ is consistent");
