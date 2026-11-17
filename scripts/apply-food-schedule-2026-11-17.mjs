/*
 * Food by day brought up to date, a 211 phone fix, and Skylar's food map,
 * 2026-11-17.
 *
 * Food by day (data/food-by-day.json) was still the August workbook's tab:
 * 51 entries. The October food guide's weekly Buncombe sites, added as
 * resources on 13 and 17 Nov, never reached it, so the Food by day tab, the
 * "Food today" button and Ask AI's schedule all missed them. This adds each
 * of those sites on the days the directory's own rows give (the rows' hours
 * came from the WNC Free Food & Supplies guide, updated 2 Oct 2026), and the
 * same lines to the Monday to Sunday rows. Unstaffed 24/7 pantry boxes stay
 * out: they have no day.
 *
 * The "NC 211 / text FOODNC" row showed 828-659-5289, which the August
 * workbook printed beside Feed-a-Family. The October guide gives that number
 * for MATCH, McDowell County's food box delivery, which has its own row.
 *
 * Skylar's Google map of free food (shared 17 Nov 2026) gets a row. Its
 * viewer link is used, never the edit link. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";

const GUIDE = "WNC Free Food & Supplies community guide (updated 2 Oct 2026), as recorded on each site's row";
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

/* ======================================================== FOOD BY DAY ===== */

const S = (place, when, goodToKnow = "") => ({ place, when, goodToKnow });
const GRANT = "Grant Center free fridge";
const ADD = {
  Monday: [
    S("Emma United Methodist food pantry", "3-5pm (55 Adams Hill Rd)"),
    S(GRANT, "9am-9pm (285 Livingston St)", "Fridge"),
  ],
  Tuesday: [
    S("Bethel Seventh-day Adventist food pantry", "10am-1pm (238 S French Broad Ave)"),
    S("Big Ivy Community Club pantry", "1-6pm, hot meal at 1pm (540 Dillingham Rd, Barnardsville)"),
    S("Weaverville First Baptist food and supply pantry", "10am-2pm (63 N Main St, Weaverville)"),
    S("Garren Creek free food and supply store", "4:30-6:30pm (1198 Garren Creek Rd, Fairview)", "Evening"),
    S("The Whale free groceries", "4:30pm until gone (507 Haywood Rd #10)", "May post photos online"),
    S("MANNA distribution, Leicester", "3rd Tuesday only, 2:30-3:30pm (Leicester Community Center, 1561 Alexander Rd)", "Monthly"),
    S(GRANT, "9am-9pm (285 Livingston St)", "Fridge"),
  ],
  Wednesday: [
    S("Big Ivy Community Club pantry", "11am-2pm (540 Dillingham Rd, Barnardsville)"),
    S("Black Mountain Open Table meals", "11:30am-1pm (UU Congregation, 500 Montreat Rd; First UMC, 101 Church St)", "No requirements"),
    S("Blessing Bus", "1st and 3rd Wednesdays (Ingles, 2299 US 70, Swannanoa)", "Monthly"),
    S("Free pizza", "6:30-9pm (60 Craggy Ave)", "Evening, vegan option"),
    S(GRANT, "9am-9pm (285 Livingston St)", "Fridge"),
  ],
  Thursday: [
    S("Covenant Community Church SNAP Gap pantry", "9am (11 Rocket Dr)"),
    S("Big Ivy Community Club pantry", "9am-12pm (540 Dillingham Rd, Barnardsville)"),
    S("Grace Covenant free food", "11am-1pm (789 Merrimon Ave; confirm)", "No ID"),
    S("Lunch at the Crossroads", "12pm (First Baptist, 5 Oak St)"),
    S("Zephyr Hills Free Will Baptist pantry", "12-2pm (283 Shelburne Rd)"),
    S("A-B Tech student food pantry", "1-5pm (340 Victoria Rd)", "A-B Tech students"),
    S("East Asheville Welcome Table", "5-6:15pm (Groce UMC, 954 Tunnel Rd)", "Evening"),
    S(GRANT, "9am-9pm (285 Livingston St)", "Fridge"),
  ],
  Friday: [
    S("Weaverville First Baptist food and supply pantry", "10am-2pm (63 N Main St, Weaverville)"),
    S("YWAM free hot meal", "12pm (corner of Aston St and Lexington Ave)"),
    S(GRANT, "9am-8pm (285 Livingston St)", "Fridge"),
  ],
  Saturday: [
    S("Budgie's Bakeshop free market", "1st Saturday only, 12-4pm (1808 Pisgah Hwy, Candler)", "Monthly"),
    S("Streetside community potluck", "Aston Park, 300 Hilliard Ave", "Bring what you can, take what you need"),
    S(GRANT, "10am-6pm (285 Livingston St)", "Fridge"),
  ],
  Sunday: [
    S("Streetside community potluck", "Aston Park, 300 Hilliard Ave", "Bring what you can, take what you need"),
  ],
};

const food = load("food-by-day.json");
let added = 0;
for (const d of food.file.days) {
  for (const s of ADD[d.day] || []) {
    const key = s.place.toLowerCase().split(" ").slice(0, 2).join(" ");
    if (d.sites.some((x) => x.place.toLowerCase().includes(key))) throw new Error(`${d.day} already has ${s.place}`);
    d.sites.push(clean({ ...s, lv: "", vb: "" }));
    added++;
  }
}
/* the workbook's Wednesday dinner time changed in the October guide */
const wed = food.file.days.find((d) => d.day === "Wednesday");
const ftp = wed.sites.find((x) => /^Feed the People/.test(x.place));
if (!ftp) throw new Error("no Feed the People");
ftp.goodToKnow = clean([ftp.goodToKnow, "The October 2026 food guide gives a new time, 6-7:30pm"].filter(Boolean).join("; "));
/* Skylar does not refer to the Salvation Army first */
const sa = wed.sites.find((x) => /^Salvation Army/.test(x.place));
if (!sa) throw new Error("no Salvation Army");
sa.goodToKnow = clean([sa.goodToKnow, "Not a first referral (asks for a lot of personal detail)"].filter(Boolean).join("; "));
/* the October guide and Skylar's map give 12 Baskets lunch Mon, Tue, Thu, Fri */
const tb = wed.sites.find((x) => /^12 Baskets/.test(x.place));
if (!tb) throw new Error("no 12 Baskets Wednesday");
tb.goodToKnow = clean([tb.goodToKnow, "The October guide and Skylar's food map list lunch Mon, Tue, Thu and Fri only; confirm Wednesday"].filter(Boolean).join("; "));
/* Skylar's map (17 Nov 2026) says the fixed Blessing Barn is paused or closed */
for (const d of food.file.days) for (const x of d.sites) if (/^Blessing Barn/.test(x.place)) {
  x.goodToKnow = clean([x.goodToKnow, "May be paused or closed (Skylar's food map); the Blessing Bus is its mobile successor. Confirm first"].filter(Boolean).join("; "));
}
food.file.meta.src = `${food.file.meta.src}; weekly Buncombe sites from the October 2026 WNC Free Food guide added 17 Nov 2026 (scripts/apply-food-schedule-2026-11-17.mjs)`;
save(food);

/* ========================================================== RESOURCES ===== */

const res = load("resources.json");
const list = res.file.resources;
const get = (id) => { const r = list.find((x) => x.id === id); if (!r) throw new Error(`no resource ${id}`); return r; };
const append = (r, k, t) => {
  clean(t);
  const cur = (r[k] || "").trim();
  r[k] = !cur ? t : k === "src" ? `${cur}; ${t}` : `${cur}${/[.!?)]$/.test(cur) ? "" : "."} ${t}`;
};
const fill = (r, k, v) => { if ((r[k] || "").trim()) throw new Error(`${r.id}.${k} already ${r[k]}`); r[k] = clean(v); };

/* the Monday to Sunday rows list the same schedule as Food by day */
for (const [day, sites] of Object.entries(ADD)) {
  const r = get(day.toLowerCase());
  if (r.n !== day) throw new Error(`${r.id} is ${r.n}`);
  r.d = clean(r.d.trim() + sites.map((s) => ` | ${s.place} ${s.when}`).join(""));
  append(r, "src", GUIDE);
}

const f211 = get("nc-211-text-foodnc-to-877-877-findhelp-org-f");
if (f211.ph !== "828-659-5289") throw new Error("211 phone changed");
f211.n = "NC 211 food finders: text FOODNC to 877-877, findhelp.org";
f211.ph = "211 / 1-888-892-1162";
f211.d = "Ways to find food fast: dial 2-1-1 (or 1-888-892-1162), text FOODNC to 877-877 for nearby meal sites, or "
  + "search findhelp.org by zip code. Feed A Family (free grocery delivery) and MATCH (McDowell County food boxes) have "
  + "their own rows.";
f211.note = "The August workbook printed 828-659-5289 beside Feed-a-Family; the October food guide gives that number for "
  + "MATCH, McDowell County's food box delivery, so it moved off this row.";
append(f211, "src", "phone corrected 17 Nov 2026 against the WNC Free Food & Supplies guide (MATCH entry) and the NC 211 row");
clean(f211);

/* what Skylar's map adds or disagrees with (her listing text, pasted 17 Nov 2026) */
const MAPSRC = "Skylar Belt's free food map listings, pasted 17 Nov 2026";
const barn = get("the-blessing-barn");
append(barn, "note", "Skylar's food map (17 Nov 2026) says the fixed Blessing Barn is paused or closed and the Blessing Bus "
  + "(theblessingproject.org) is its mobile successor; the hours here are from August. Confirm before sending anyone.");
append(barn, "src", MAPSRC);
clean(barn);
const bus = get("blessing-bus");
fill(bus, "w", "theblessingproject.org");
append(bus, "d", "Skylar's food map calls it The Blessing Project's mobile successor to the Blessing Barn.");
append(bus, "src", MAPSRC);
clean(bus);
const bl = get("beloved-asheville-street-pantries");
append(bl, "note", "The October food guide, linking BeLoved's own street pantry list, puts the Weaverville pantry in front of "
  + "Hardee's on Weaver Blvd, not at 16 N Main St, and the Tunnel Rd pantry in front of Azalea Church past Zaxby's, before "
  + "exit 55. It also lists Black Mountain (Hwy 9 near the railroad tracks, across from the old Bilo), Candler (Smokey Park "
  + "Hwy between the Shell and BP) and Swannanoa (2299 US 70). Check the current list before sending a family.");
append(bl, "src", "pantry sites as given in the WNC Free Food & Supplies guide (Oct 2026), from BeLoved's street pantry PDF");
clean(bl);
const tz = get("tranzmission");
append(tz, "d", "Its food pantry restarted Saturday, November 7, 2026, 1-3pm, after Trans Community Hours (10am-12pm), at "
  + "Tranzmission's space in the Tzedek building, 37 Montford Ave; the weekly schedule is still being rebuilt and support "
  + "groups were paused, per Skylar's food map. It earlier ran Thu-Sat 4-6pm. Check Instagram or email for the week's hours.");
append(tz, "src", MAPSRC);
clean(tz);

const MAP_ID = "wnc-free-food-map";
if (list.some((r) => r.id === MAP_ID)) throw new Error("map row exists");
list.push(clean({
  id: MAP_ID, n: "Free food map of WNC (Skylar Belt's Google map)", pp: "",
  sp: "⚪ Not listed - ask", spd: "Not stated in the source. Ask when you call.", ph: "", em: "",
  w: "google.com/maps/d/viewer?mid=1ltNhkQG9AvCtlWLhywHh_NfMIlFn2dY",
  d: "Skylar Belt's Google map of 94 free food spots, mostly in Buncombe County: prepared meals, grocery pantries, free "
    + "fridges and self-serve pantries, produce markets, mobile and delivery options, WIC offices and the MANNA helpline, "
    + "each with hours and details. Open it on a phone to see what is close and get directions. Use it with Food by day, "
    + "and call before sending anyone.",
  a: "Online map", h: "Any time", os: "Find Food Fast", t: "Free", lv: "", vb: "", sec: "VIII",
  needs: ["VIII:*", "VIII:5a"], src: "Map made and shared by Skylar Belt, 17 Nov 2026 (viewer link); listings pasted by Skylar the same day",
  note: "Checked against the directory on 17 Nov 2026 from Skylar's pasted listings; the map itself could not be opened from "
    + "the build environment. Most listings were not independently verified, as the map says.",
  new: true, start: true,
}));
res.file.meta.count = list.length;
res.file.meta.sources.push("Food by day update, 211 phone fix and Skylar's food map, 17 Nov 2026 (see scripts/apply-food-schedule-2026-11-17.mjs)");
save(res);

/* ========================================================== CHANGELOG ===== */

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift(clean({
  date: "Nov 17 2026",
  what: "Food by day caught up with the October food guide, and Skylar's food map",
  detail: `Food by day had only the August workbook's 51 entries; ${added} more from the October guide's weekly Buncombe `
    + "sites are now on their days (Emma UMC, Bethel SDA, Big Ivy, Garren Creek, The Whale, Grace Covenant, East "
    + "Asheville Welcome Table, the Grant Center fridge and more), which also feeds the Food today button and Ask AI. "
    + "The NC 211 food row no longer shows MATCH's McDowell number. New row: Skylar's free food map (94 spots). From the "
    + "map: the Blessing Barn may be paused, Tranzmission's pantry restarted on Saturdays, and BeLoved's Weaverville "
    + "pantry location is in question.",
  source: "scripts/apply-food-schedule-2026-11-17.mjs",
}));
save(cl);
console.log(`added ${added} Food by day entries, ${list.length} resources`);
