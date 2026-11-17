/*
 * Details from the "OK Computer Buncombe Family Navigator" build Skylar shared on
 * 17 Nov 2026. That build lists its sources and says it checked official pages
 * on 14 Nov 2026. It is another tool's reading of those pages, not a check done
 * here, so nothing below gets a verified date, and where it disagrees with a row
 * the row keeps its value and the note names both. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const load = (f) => { const path = new URL(`../data/${f}`, import.meta.url); return { path, file: JSON.parse(readFileSync(path, "utf8")) }; };
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const clean = (v) => { const s = JSON.stringify(v); if (DASH.test(s)) throw new Error(`dash: ${s.slice(0, 90)}`); return v; };
const OKC = "OK Computer Buncombe Family Navigator build, shared by Skylar Belt 17 Nov 2026 (cites official pages checked 14 Nov 2026)";
const res = load("resources.json");
const list = res.file.resources;
const get = (id) => { const r = list.find((x) => x.id === id); if (!r) throw new Error(id); return r; };
const app = (r, k, t) => { const c = (r[k] || "").trim(); r[k] = !c ? t : k === "src" ? `${c}; ${t}` : `${c}${/[.!?)]$/.test(c) ? "" : "."} ${t}`; };
const patch = (id, fn, what) => { const r = get(id); fn(r); app(r, "src", `${what} from the ${OKC}`); clean(r); };

/* holiday */
if (list.some((r) => r.id === "asheville-dream-center-holiday")) throw new Error("exists");
list.push(clean({
  id: "asheville-dream-center-holiday", n: "Asheville Dream Center holiday outreach (Love Our City)", pp: "",
  sp: "⚪ Not listed - ask", spd: "Not stated in the source. Ask when you call.", ph: "828-674-2989",
  em: "info@ashevilledreamcenter.org", w: "ashevilledreamcenter.org/love-our-city",
  d: "Seasonal outreach: a Thanksgiving Outreach on Saturday, November 21, 2026 and a Dream Christmas Toy Giveaway on "
    + "Saturday, December 12, 2026. Its page says more details are coming, so call or email before making a firm plan.",
  a: "", h: "Thanksgiving Outreach Nov 21; Christmas Toy Giveaway Dec 12 (2026)", os: "Holiday help", t: "Free",
  lv: "", vb: "", sec: "VIII", needs: ["VIII:*", "VIII:5a", "VIII:10a", "X:*", "X:12"],
  src: OKC, note: "Times, place and sign-up were not published yet.", new: true,
}));
patch("holiday-assistance", (r) => {
  app(r, "d", "ALSO: Asheville Dream Center's Dream Christmas Toy Giveaway is December 12 and its Thanksgiving Outreach "
    + "November 21 (details forthcoming; 828-674-2989).");
}, "Dream Center dates");

/* Bounty & Soul */
patch("bounty-soul", (r) => {
  r.h = "Free markets Mon-Sat at different sites; schedule at bountyandsoul.org; weather updates 828-585-7835";
  app(r, "d", "Weekly no-cost market schedule on bountyandsoul.org (Nov 2026): Mon 11:30am-1pm Rock Hill Baptist, 486 "
    + "Caribou Rd; Tue 3-4:30pm Root Cause Farm, 26 Joe Jenkins Rd, Fairview; Tue 3:30-5pm UNETE; Wed 3:30-5pm Fairview "
    + "Reynolds; Wed 3:30-5:30pm Beacon Community Center, 216 Whitson Ave, Swannanoa; Thu 3:30-5:30pm Bi-Lo drive-thru, "
    + "205 NC-9, Black Mountain; Fri 1:30-3pm Grant Southside Community Center, 285 Livingston St; Sat 10-11:30am "
    + "ArtSpace, 2030 US 70, Swannanoa. No market at the office. Support animals welcome; other pets stay home. It is a "
    + "weekly pattern, not a promise: check the schedule or the update line (828-585-7835).");
}, "weekly market schedule and update line");
patch("mercado-unete-bounty-soul", (r) => {
  app(r, "note", "Address conflict: Bounty & Soul's market schedule (checked 14 Nov 2026 by another tool) lists UNETE at "
    + "871 Riverside Dr, Asheville, Tuesdays 3:30-5pm; this row and the food schedule say 55 Adams Hill Rd. Confirm before sending a family.");
}, "UNETE address on Bounty & Soul's schedule");

/* early childhood */
patch("kaleidoscope-play-learn", (r) => {
  app(r, "note", "The program page now says registration is required (not drop-in), groups run during the school year "
    + "only, caregivers stay, one adult per child. To register: ages 3 months to 3 years, grace.ragaller@acsgmail.net; "
    + "ages 3 to 5, marna.holland@acsgmail.net.");
}, "registration rule and contacts");
patch("cdsa", (r) => {
  r.ph = "828-250-3400 / 828-251-6091";
  app(r, "note", "Two numbers: the state CDSA directory lists 828-250-3400; local guides (BPFC, ECAC) list 828-251-6091. Try 828-250-3400 first. Anyone can make a referral call.");
}, "state directory phone");

/* safety, legal, transport, harm reduction */
patch("our-voice", (r) => {
  app(r, "d", "Forensic medical exams at the Family Justice Center are free, need no ID and do not require filing a "
    + "police report; survivors can decline or stop any part of an exam.");
}, "forensic exam terms");
patch("pisgah-legal-services", (r) => {
  app(r, "d", "After applying, Pisgah tries to reach people three times within 7 to 10 days and may call from an unknown "
    + "or private number; call back if nothing comes within 10 days. Say so if homebound or facing an urgent court date.");
}, "callback process");
patch("working-wheels", (r) => {
  app(r, "d", "Car purchase needs at least three months in an eligible partner program and a case manager's referral, "
    + "plus a valid NC license, proof of work and the ability to pay $628. Repairs also need a partner referral. "
    + "Families cannot apply on their own, and Working Wheels cannot connect them to a partner.");
}, "eligibility rules");
patch("mountain-mobility", (r) => {
  app(r, "d", "Reservations: option 4, Mon-Fri 8am-3pm. Relay 711 for TTY.");
}, "reservation line and hours");
patch("harm-reduction-wncap-the-steady-collective-h", (r) => {
  app(r, "note", "Schedule conflict: another tool's 14 Nov 2026 reading of the Steady Collective site lists Tue 3-4:30pm "
    + "in Candler (1808 Pisgah Hwy), Wed 10am-12:30pm at 271 Haywood St, and Fri 2-5pm at 39 Parkway Dr, West Asheville. "
    + "Check thesteadycollective.org before going.");
}, "Steady Collective schedule");
patch("ahope-day-center-homeward-bound", (r) => {
  app(r, "d", "Basic services (showers, breakfast, mail, lockers, phone, Wi-Fi, charging) Mon-Fri 8-11am; housing and "
    + "case management Mon/Tue/Thu/Fri 11am-1pm. Someone who cannot get there can be referred through Homeward Bound's "
    + "online Outreach Assistance request.");
}, "service hours and outreach request");
patch("manna-food-helpline-2", (r) => {
  app(r, "d", "MANNA says its community mobile markets are free and open to anyone who needs food; no ID is required.");
}, "mobile market terms");

res.file.meta.count = list.length;
res.file.meta.sources.push("OK Computer Buncombe Family Navigator build, 17 Nov 2026 (see scripts/apply-okc-build-2026-11-17.mjs)");
save(res);

/* events */
const ev = load("events.json");
for (const e of [
  { id: "dream-center-thanksgiving-outreach-2026-11-21", date: "2026-11-21", kind: "event", what: "Asheville Dream Center Thanksgiving Outreach",
    detail: "Seasonal Thanksgiving outreach from Love Our City.", note: "Details forthcoming: call 828-674-2989 before planning.",
    tags: ["Free"], ph: "828-674-2989", w: "ashevilledreamcenter.org/love-our-city", rid: "asheville-dream-center-holiday", src: OKC },
  { id: "dream-center-toy-giveaway-2026-12-12", date: "2026-12-12", kind: "event", what: "Asheville Dream Center Dream Christmas Toy Giveaway",
    detail: "Free Christmas toy giveaway.", note: "Details forthcoming: call 828-674-2989 or email info@ashevilledreamcenter.org.",
    tags: ["Free"], ph: "828-674-2989", w: "ashevilledreamcenter.org/love-our-city", rid: "asheville-dream-center-holiday", src: OKC },
]) { if (ev.file.events.some((x) => x.id === e.id)) throw new Error(e.id); ev.file.events.push(clean(e)); }
ev.file.events.sort((a, b) => a.date.localeCompare(b.date));
save(ev);

/* Food by day: Bounty & Soul markets not already listed */
const fd = load("food-by-day.json");
const add = { Monday: ["Bounty & Soul market, Rock Hill Baptist", "11:30am-1pm (486 Caribou Rd)"], Tuesday: ["Bounty & Soul market, Root Cause Farm", "3-4:30pm (26 Joe Jenkins Rd, Fairview; season ends Nov 25)"],
  Wednesday: ["Bounty & Soul market, Beacon Community Center", "3:30-5:30pm (216 Whitson Ave, Swannanoa)"], Thursday: ["Bounty & Soul Bi-Lo drive-thru market", "3:30-5:30pm (205 NC-9, Black Mountain)"],
  Friday: ["Bounty & Soul market, Grant Southside Community Center", "1:30-3pm (285 Livingston St)"], Saturday: ["Bounty & Soul market, ArtSpace", "10-11:30am (2030 US 70, Swannanoa)"] };
for (const [day, [place, when]] of Object.entries(add)) {
  const d = fd.file.days.find((x) => x.day === day);
  if (d.sites.some((s) => s.place === place)) throw new Error(place);
  d.sites.push(clean({ place, when, goodToKnow: "Free; check bountyandsoul.org or 828-585-7835 for weather changes", lv: "", vb: "" }));
}
save(fd);

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift(clean({
  date: "Nov 17 2026", what: "From the OK Computer navigator build: Dream Center holiday dates, Bounty & Soul schedule, intake details",
  detail: "New Asheville Dream Center holiday row and two events (Nov 21, Dec 12). Bounty & Soul's full weekly market schedule, also added to Food by day. Intake details for Kaleidoscope (now registration only), CDSA, Our VOICE, Pisgah Legal, Working Wheels, Mountain Mobility, AHOPE and MANNA. Conflicts kept visible: UNETE's address and the Steady Collective schedule.",
  source: "scripts/apply-okc-build-2026-11-17.mjs" }));
save(cl);
console.log("done", list.length);
