/*
 * Christmas gift help and the official Code Purple 2026-27 sheet, 2026-11-16.
 *
 * Sources: the Asheville-Buncombe Continuum of Care's "Code Purple 2026-2027"
 * sheet (shared by Skylar Belt, 16 Nov 2026); Eblen Charities' Christmas gift
 * assistance page (eblencharities.org/christmas-gift-assistance) and its 2024
 * release and WLOS's 2025 report, via web search, 16 Nov 2026.
 *
 * Correction: 828-442-7597 is the Code Purple Coordinator. The recorded
 * message that says whether Code Purple is called tonight is 828-398-6011.
 * Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const load = (f) => {
  const path = new URL(`../data/${f}`, import.meta.url);
  return { path, file: JSON.parse(readFileSync(path, "utf8")) };
};
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const clean = (v) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  if (DASH.test(s)) throw new Error(`dash in text: ${s.slice(0, 90)}`);
  return v;
};
const res = load("resources.json");
const list = res.file.resources;
const get = (id) => { const r = list.find((x) => x.id === id); if (!r) throw new Error(id); return r; };
const append = (r, k, t) => {
  const cur = (r[k] || "").trim();
  r[k] = !cur ? t : k === "src" ? `${cur}; ${t}` : `${cur}${/[.!?)]$/.test(cur) ? "" : "."} ${t}`;
};
const SHEET = "Asheville-Buncombe Continuum of Care, Code Purple 2026-2027 sheet, shared by Skylar Belt 16 Nov 2026";
const EBLEN = "Eblen's Christmas gift assistance page, its 2024 release and WLOS (Dec 2025), via web search, 16 Nov 2026";

/* ------------------------------------------------------------ Code Purple */
const cp = get("code-purple");
cp.ph = "828-398-6011 (recorded message: is it called?) / 828-442-7597 (coordinator)";
cp.em = "HomelessStrategy@ashevillenc.gov";
cp.a = "ABCCM Safe Haven at Transformation Village, 30 Olin Haven Way; Homeward Bound Center of Hope, 204 Haywood St";
cp.h = "When called, Nov 1, 2026 to Apr 30, 2027; entry 5-8pm";
cp.d = "Emergency overflow shelter with fewer requirements than usual, open only on nights it is called, November 1, "
  + "2026 to April 30, 2027. Women and women with children: ABCCM Safe Haven at Transformation Village, 30 Olin Haven "
  + "Way (bus W2; it cannot serve people on the sex offender registry). Men, couples and people with pets: Homeward "
  + "Bound's Center of Hope, 204 Haywood St (buses W6, WE1 West, WE2 West). Entry 5-8pm; after 8pm, entry has to be "
  + "arranged by public safety or outreach staff. No ID or sobriety needed. ART buses are free to every site that night and "
  + "back downtown the next morning. It is called 48 hours ahead, at or below 32°F including wind chill, or 33-40°F "
  + "with rain or snow, for at least 2 hours in a row between 5pm and 7:30am, and in declared emergencies. Call "
  + "828-398-6011 any time for a recorded message saying whether it is called, or sign up for email alerts (QR code "
  + "on the sheet).";
append(cp, "src", `2026-27 sites, rules, routes and contacts from the ${SHEET}; corrects the coordinator number labelled as the status line on 13 Nov`);
clean(cp);

const cp2 = get("code-purple-winter-shelter-free-art-rides-to");
cp2.ph = "828-398-6011 (recorded message) / 828-442-7597 (coordinator)";
append(cp2, "src", `phones from the ${SHEET}`);
clean(cp2);

const ev = load("events.json");
const cpe = ev.file.events.find((e) => e.id === "code-purple-2026-11-13");
cpe.ph = "828-398-6011";
cpe.detail = cpe.detail + " Recorded message on whether it is called: 828-398-6011; coordinator 828-442-7597.";
clean(cpe);
save(ev);

/* ------------------------------------------------------- Christmas gifts */
const ha = get("holiday-assistance");
append(ha, "d", "Eblen's Christmas gift assistance page is eblencharities.org/christmas-gift-assistance: families sign "
  + "up there for a shopping appointment at the free Saint Nicholas Project toy store (see its own row).");
append(ha, "src", EBLEN);
clean(ha);

const eb = get("eblen-charities");
append(eb, "d", "At Christmas it runs the Saint Nicholas Project toy store (see that row) and in November a "
  + "Thanksgiving meal giveaway with Ingles.");
clean(eb);

const row = {
  id: "eblen-saint-nicholas-project-christmas", n: "Eblen Charities Saint Nicholas Project: free Christmas toy store",
  pp: "", sp: "⚪ Not listed - ask", spd: "Not stated in the source. Ask when you call.",
  ph: "828-255-3066", em: "", w: "eblencharities.org/christmas-gift-assistance",
  d: "Families choose new toys (and in past years clothing) for their children, birth through 18, free, at a toy store "
    + "by appointment. Parents and guardians living in or near poverty, and Hurricane Helene survivors, register online "
    + "for a shopping slot. Slots filled quickly in 2025, so sign up as soon as registration opens. The 2025 store "
    + "opened December 9 at 23 Hamilton St; check the page for this year's dates and place. Ask what to bring "
    + "when you book.",
  a: "Store location changes each year (2025: 23 Hamilton St, Asheville)", h: "Shopping by appointment in December",
  os: "Holiday help", t: "Free, Kids / 0-5", lv: "", vb: "", sec: "VIII",
  needs: ["VIII:*", "VIII:10a", "VIII:12a", "X:*", "X:12"],
  src: EBLEN, note: "", new: true,
};
if (list.some((r) => r.id === row.id)) throw new Error("exists");
list.push(clean(row));
res.file.meta.count = list.length;
res.file.meta.sources.push("Code Purple 2026-2027 sheet and Eblen Christmas gift assistance, 16 Nov 2026 (see scripts/apply-holiday-codepurple-2026-11-16.mjs)");
save(res);

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift(clean({
  date: "Nov 16 2026",
  what: "Code Purple 2026-27 rules, and Eblen's Christmas toy store",
  detail: "Code Purple now has the official 2026-27 sheet: sites, bus routes, 5-8pm entry, when it is called, and the "
    + "right numbers (828-398-6011 recorded message; 828-442-7597 is the coordinator, not a status line). New row for "
    + "Eblen's Saint Nicholas Project toy store, with its sign-up page.",
  source: "scripts/apply-holiday-codepurple-2026-11-16.mjs",
}));
save(cl);
console.log("done", list.length);
