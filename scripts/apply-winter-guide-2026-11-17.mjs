/*
 * Winter 2026-27 holiday guide cross-check, 2026-11-17.
 *
 * Source: "Buncombe County Winter 2026-2027 Holiday Stabilization and Resource
 * Guide", shared by Skylar Belt 17 Nov 2026. It was compiled from Skylar's own
 * Drive guides and directory workbook plus web pages, so nearly every resource
 * and phone number in it is already here. What it adds is the season's
 * calendar: school breaks, county and library closures, ART's holiday service,
 * LIHEAP windows and free holiday events.
 *
 * Web search, 17 Nov 2026, checked each dated item. Where the guide disagrees
 * with an official source (the 2026-27 Code Purple sheet, the county holiday
 * calendar), the official source stays and the guide goes in `note`. Dated
 * items no source confirmed for 2026 were left out of Events and are named in
 * the README line instead: APR Friendsgiving (Nov 21), MANNA's pre-Thanksgiving
 * boxes (Nov 20-21), Haywood Street and 12 Baskets holiday feasts, the Grove
 * Arcade Winter Wonderland, Folk Art Center toy demos, seed swaps and the
 * Black History Month program list. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";

const WINTER = "Buncombe County Winter 2026-2027 Holiday Stabilization and Resource Guide, shared by Skylar Belt 17 Nov 2026";
const WEB = "web search, 17 Nov 2026";
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
const blank = (v) => !v || !String(v).trim();
const append = (r, k, t) => {
  clean(t);
  const cur = (r[k] || "").trim();
  r[k] = !cur ? t : k === "src" ? `${cur}; ${t}` : `${cur}${/[.!?)]$/.test(cur) ? "" : "."} ${t}`;
};
const fill = (r, k, v) => { if (!blank(r[k])) throw new Error(`${r.id}.${k} already ${JSON.stringify(r[k])}`); r[k] = clean(v); };
const lacks = (r, k, s) => { if ((r[k] || "").includes(s)) throw new Error(`${r.id}.${k} already mentions ${s}`); };

/* ========================================================== RESOURCES ===== */

const res = load("resources.json");
const list = res.file.resources;
const get = (id) => { const r = list.find((x) => x.id === id); if (!r) throw new Error(`no resource ${id}`); return r; };
let patched = 0;
const patch = (id, fn) => { const r = get(id); fn(r); clean(r); patched++; };

patch("code-purple", (r) => {
  lacks(r, "note", "785-4855");
  append(r, "note", "The winter guide and the city's 2025-26 Code Purple page give 828-785-4855 for the winter shelter "
    + "coordinators; the official 2026-27 sheet gives 828-442-7597, which this row keeps. The guide also gives 6pm-7am "
    + "hours and lists storm overflow at First Presbyterian (20 beds) and Trinity UMC (50 beds); the sheet's 5-8pm "
    + "entry stands, and the overflow sites are not confirmed.");
  append(r, "src", `coordinator line from the city's 2025-26 Code Purple page via ${WEB}; guide details from the ${WINTER}`);
});
patch("safe-shelter-2", (r) => {
  append(r, "note", "The winter guide says both sites open every night Nov 1 to Mar 31 regardless of weather, with "
    + "walk-in resource help Mon-Fri 1-2pm; this row keeps 11am-2pm until the shelter confirms.");
  append(r, "src", `nightly season and walk-in hours as given in the ${WINTER}`);
});
patch("roar-mutual-aid-hub-marshall", (r) => {
  fill(r, "ph", "828-243-7953");
  fill(r, "em", "roarhollerhub@gmail.com");
  append(r, "d", "ROAR (Rural Organizing and Resilience) also delivers firewood, propane tanks, camp stoves and heaters in "
    + "North Buncombe and Madison County, with no paperwork or status questions.");
  append(r, "src", `phone, email and deliveries from the ${WINTER}`);
});
patch("free-firewood-wnc", (r) => {
  lacks(r, "d", "Healing Heat");
  append(r, "d", "Healing Heat Firewood Bank gives kiln-dried firewood in half-cord bags and bulk loads through local "
    + "church partners (the winter guide gives no contact).");
  append(r, "src", `Healing Heat from the ${WINTER}`);
});
patch("haywood-street-congregation-downtown-welcome", (r) => {
  append(r, "note", "The winter guide says Haywood Street (and 12 Baskets) serve free feasts with coats on Black Friday, "
    + "Nov 27, 10am-1pm, and Dec 25-27, and a Sunday breakfast 8:30-10:30am. None of that was confirmed online: in 2022 "
    + "Haywood Street's Thanksgiving feast was the Wednesday before. Ask before telling a family.");
  append(r, "src", `holiday feast claims from the ${WINTER}; 2022 feast date from Mountain Xpress via ${WEB}`);
});
patch("foster-and-kinship-closets-giving-tree-foste", (r) => {
  lacks(r, "d", "Holiday Wishes");
  append(r, "d", "Each year Buncombe HHS runs Holiday Wishes: children in foster care and young adults in extended foster "
    + "care submit wish lists that community members sponsor. Ask the child's social worker; the winter guide gives "
    + "Nov 10-30, 2026.");
  append(r, "src", `Holiday Wishes format from past Buncombe County releases via ${WEB}; 2026 dates from the ${WINTER}`);
});
patch("nc-pre-k-head-start-unified-application", (r) => {
  append(r, "note", "The winter guide lists a bilingual NC Pre-K and Head Start enrollment fair Feb 19-20, 2027 "
    + "(10am-2pm) at 222 S French Broad Ave and a Feb 20 priority deadline; neither was confirmed online.");
  append(r, "src", `fair and deadline as given in the ${WINTER}`);
});
patch("free-tax-prep-vita", (r) => {
  lacks(r, "d", "210-3404");
  append(r, "d", "Pisgah Legal Services' VITA program: 828-210-3404, for families earning $57,000 or less (its own page), "
    + "with English and Spanish help and drop-off or remote filing. The winter guide lists a free tax, Medicaid and "
    + "housing clinic Feb 26-27, 2027 at 62A Charlotte St; not confirmed.");
  append(r, "src", `Pisgah Legal VITA line and income limit from pisgahlegal.org via ${WEB}; clinic dates from the ${WINTER}`);
});
patch("liheap", (r) => {
  append(r, "note", "The winter guide gives Saturday Jan 2 for the general window; two benefit guides give Monday Jan 4, "
    + "2027, because Jan 1 is a holiday. The state plan confirms Dec 1, 2026 to Mar 31, 2027 overall.");
  append(r, "src", `season dates from the NC LIHEAP state plan and benefit guides via ${WEB}`);
});
patch("eblen-charities", (r) => {
  lacks(r, "d", "info@eblencharities.org");
  append(r, "d", "For a utility or rent appointment, send the documents first (the account holder attestation for utility "
    + "bills, and income proof or a no-income self-attestation) in person or to info@eblencharities.org at least 3 "
    + "business days ahead.");
  append(r, "note", "Some mid-2026 county lists give 52 Westgate Pkwy; Eblen's own 2026 pages use 23 Hamilton St. Call "
    + "828-255-3066 before sending anyone. The winter guide says Eblen is closed Dec 23-25 and Dec 30 to Jan 1.");
  append(r, "src", `appointment documents, address conflict and holiday closures from the ${WINTER}`);
});
patch("community-engagement-markets", (r) => {
  append(r, "note", "Pisgah View Apartments is a regular stop (2nd and 4th Wednesdays on the county's 2025 flyer). The "
    + "winter guide says the Nov 25, 2026 Pisgah View market is canceled; not confirmed online, so check the county's "
    + "market calendar.");
  append(r, "src", `Pisgah View schedule from the county's 2025 market flyer via ${WEB}; cancellation from the ${WINTER}`);
});

const outlets = {
  id: "discount-grocery-outlets", n: "Discount and salvage grocery stores (Buncombe)", pp: "",
  sp: "⚪ Not listed - ask", spd: "Not stated in the source. Ask when you call.", ph: "", em: "", w: "",
  d: "For families just over the SNAP limit: discount and salvage grocers that stretch a food budget. Uplifting Deals, "
    + "198 Weaverville Rd; Overstock Outlet, 1442 Smokey Park Hwy, Candler; Sav-Mor, 891 Patton Ave and 842 Merrimon "
    + "Ave; Hopey & Co., 800 Fairview Rd #111 and Black Mountain; Grocery Outlet, 121 New Leicester Hwy and 1380 Tunnel "
    + "Rd. These are stores, not free food.",
  a: "Several sites, listed in the description", h: "", os: "Winter holiday guide (Nov 2026)", t: "",
  lv: "", vb: "", sec: "VIII", needs: ["VIII:*", "VIII:3a", "VIII:5a"], src: WINTER, note: "", new: true,
};
if (list.some((x) => x.id === outlets.id)) throw new Error("outlets exists");
list.push(clean(outlets));
res.file.meta.count = list.length;
res.file.meta.sources.push("Winter 2026-27 holiday guide cross-check, 17 Nov 2026 (see scripts/apply-winter-guide-2026-11-17.mjs)");
save(res);

/* ============================================================= EVENTS ===== */

const ev = load("events.json");
const events = ev.file.events;
const addEv = (e) => {
  if (events.some((x) => x.id === e.id)) throw new Error(`event exists: ${e.id}`);
  events.push(clean({ ph: "", w: "", ...e }));
};
const ART = "ART did not run on Thanksgiving or Christmas Day in 2025 and stopped after 6:30pm on Christmas Eve, per city "
  + "notices; check ridetheart.com/holidays or 828-253-5691 for 2026.";

addEv({
  id: "thanksgiving-closures-2026-11-25", date: "2026-11-25", end: "2026-11-27", kind: "event",
  what: "Thanksgiving week: schools, libraries, county offices and buses closed",
  detail: "Schools (Buncombe County and Asheville City) are out Nov 25-27, so school meals pause. Libraries and county "
    + "offices close Thu Nov 26 and Fri Nov 27 (county holiday calendar). ART buses and Mountain Mobility do not run on "
    + "Thanksgiving Day; ART runs a regular weekday schedule on Friday, per the winter guide. Still open: BeLoved's 24/7 "
    + "street pantries, free fridges, library parking-lot Wi-Fi (password readmore), and Code Purple on called nights "
    + "(828-398-6011).",
  note: ART, where: "Buncombe County",
  src: `county holiday calendar 2023-2026 and third-party BCS and ACS calendars via ${WEB}; ${WINTER}`,
});
addEv({
  id: "school-winter-break-2026-12-21", date: "2026-12-21", end: "2027-01-04", kind: "event",
  what: "School winter break (BCS Dec 21 to Jan 4; ACS Dec 21 to Jan 1)",
  detail: "Buncombe County Schools: no school Dec 21 (teacher workday) through Jan 4 (teacher workday); students back "
    + "Tue Jan 5. Asheville City Schools: early release Fri Dec 18, out Dec 21 to Jan 1, back Mon Jan 4. School meals "
    + "pause; plan food, childcare and camps now.",
  note: "Dates from third-party copies of the district calendars, which disagree slightly on whether BCS break ends Dec "
    + "31 or Jan 1; confirm on buncombeschools.org/calendar and the ACS calendar.",
  where: "Buncombe County and Asheville City Schools",
  src: `third-party BCS and ACS 2026-27 calendars via ${WEB}; ${WINTER}`,
});
addEv({
  id: "christmas-closures-2026-12-24", date: "2026-12-24", end: "2026-12-28", kind: "event",
  what: "Christmas closures: libraries, county offices, buses and Eblen",
  detail: "Libraries and county offices close Thu Dec 24, Fri Dec 25 and Mon Dec 28 (county holiday calendar); the "
    + "winter guide says branches open Sat Dec 26, 9am-5pm. ART stops early on Christmas Eve and does not run on "
    + "Christmas Day; Mountain Mobility is also closed Christmas Day. Eblen Charities is closed Dec 23-25, per the winter "
    + "guide.",
  note: ART, where: "Buncombe County",
  src: `county holiday calendar 2023-2026 and city transit notices via ${WEB}; ${WINTER}`,
});
addEv({
  id: "new-years-day-closures-2027-01-01", date: "2027-01-01", kind: "event",
  what: "New Year's Day: libraries and county offices closed, buses on Sunday hours",
  detail: "Libraries and county offices are closed. ART runs a reduced Sunday-hours schedule (8am-6pm), and Mountain "
    + "Mobility runs only city paratransit, per the winter guide. Eblen Charities is closed Dec 30 to Jan 1.",
  note: "ART ran a reduced holiday schedule on Jan 1 last season, per city notices; check ridetheart.com/holidays.",
  where: "Buncombe County", src: `city transit notices via ${WEB}; ${WINTER}`,
});
addEv({
  id: "mlk-day-closures-2027-01-18", date: "2027-01-18", end: "2027-01-19", kind: "event",
  what: "MLK Day: schools, libraries and county offices closed",
  detail: "No school on Mon Jan 18, and Buncombe County Schools also has a teacher workday Tue Jan 19. Libraries and "
    + "county offices are closed Jan 18, and ART runs Sunday hours (8am-6pm). Later BCS dates: 2-hour early dismissals "
    + "Jan 15 and Feb 12, and a teacher workday Feb 15.",
  note: "From the winter guide; confirm on the district calendars.", where: "Buncombe County", src: WINTER,
});
addEv({
  id: "liheap-priority-window-2026-12-01", date: "2026-12-01", end: "2026-12-31", kind: "signup",
  what: "LIHEAP heating help: December window for households with someone 60+ or disabled",
  detail: "Households with someone 60 or older, or with a disability and receiving Division of Aging and Adult Services "
    + "help, can apply in December. Apply at epass.nc.gov, call 828-250-6330, or go to 40 Coxe Ave. Approval also "
    + "opens Crisis Intervention funds and Duke Energy's monthly bill credit.",
  ph: "828-250-6330", w: "epass.nc.gov", rid: "liheap",
  note: "Dates from benefit guides; NCDHHS publishes the official chart each season.",
  src: `NC LIHEAP state plan and benefit guides via ${WEB}; ${WINTER}`,
});
addEv({
  id: "liheap-general-window-2027-01-04", date: "2027-01-04", end: "2027-03-31", kind: "signup",
  what: "LIHEAP heating help opens to all eligible households",
  detail: "Households at or below about 130% of the poverty level can apply until March 31 or until funds run out. "
    + "Apply at epass.nc.gov, 828-250-6330, or 40 Coxe Ave. Renters whose heat is in the rent usually do not qualify.",
  ph: "828-250-6330", w: "epass.nc.gov", rid: "liheap",
  note: "Benefit guides give Mon Jan 4 because Jan 1 is a holiday; the winter guide says Sat Jan 2.",
  src: `NC LIHEAP state plan and benefit guides via ${WEB}; ${WINTER}`,
});
addEv({
  id: "black-mountain-holly-jolly-2026-12-04", date: "2026-12-04", end: "2026-12-06", kind: "event",
  what: "Black Mountain Holly Jolly, Christmas parade and Circle of Lights",
  detail: "Free downtown holiday celebration with carolers and luminaries, the Christmas parade, and the Circle of "
    + "Lights luminary walk at Lake Tomahawk. The winter guide gives Holly Jolly Fri Dec 4, 5-8pm and the parade Sat "
    + "Dec 5 at 4pm.",
  tags: ["Free"], where: "Downtown Black Mountain and Lake Tomahawk",
  note: "Explore Asheville lists both Dec 4 and Dec 5-6, 2026, and a travel site says Helene damaged the Lake Tomahawk "
    + "trail. Check with the Black Mountain chamber before going.",
  src: `Explore Asheville listings via ${WEB}; ${WINTER}`,
});
addEv({
  id: "lake-julian-festival-of-lights-2026-12-02", date: "2026-12-02", end: "2026-12-23", kind: "event",
  what: "Lake Julian Festival of Lights (drive-through, paid per car)",
  detail: "Buncombe County's drive-through light display, nightly 6-9pm. Tickets are per car, and part of the proceeds "
    + "goes to Special Olympics Buncombe County.",
  where: "Lake Julian Park, 37 Lake Julian Rd, Arden",
  note: "One events site gives Dec 2-23, 2026 (the 2025 run was Dec 2-23); the winter guide says Dec 4-23 at $10-20 a "
    + "car. Not free.",
  src: `lake.com listing and past Buncombe County releases via ${WEB}; ${WINTER}`,
});
addEv({
  id: "big-crafty-free-sunday-2026-12-06", date: "2026-12-05", end: "2026-12-06", kind: "event",
  what: "The Big Crafty holiday craft fair (free on Sunday)",
  detail: "Independent artists, toy makers and potters at Harrah's Cherokee Center, noon-6pm both days. Saturday is $10; "
    + "Sunday Dec 6 is free.",
  tags: ["Free"], where: "Harrah's Cherokee Center, 87 Haywood St, Asheville",
  src: `Explore Asheville and another event listing via ${WEB}; ${WINTER}`,
});
addEv({
  id: "weaverville-candlelight-stroll-2026-12-11", date: "2026-12-11", kind: "event",
  what: "Weaverville Candlelight Stroll",
  detail: "Free evening on Main Street, 6-9pm, with a Winter Wonderland on Florida Avenue. The winter guide adds hot "
    + "cider, cookies, ornament tables and Santa.",
  tags: ["Free"], where: "Downtown Weaverville",
  src: `Explore Asheville listing (21st annual) via ${WEB}; ${WINTER}`,
});
addEv({
  id: "grove-park-inn-gingerbread-2026-11-17", date: "2026-11-17", end: "2027-01-03", kind: "event",
  what: "National Gingerbread House Competition display (Omni Grove Park Inn)",
  detail: "Hundreds of gingerbread houses on display. Viewing is free for non-guests on select evenings and weekdays, "
    + "but parking costs money and peak weekends may need a reservation. Hotline 800-413-5778.",
  ph: "800-413-5778", where: "Omni Grove Park Inn, 290 Macon Ave, Asheville",
  note: "The winter guide says half the parking proceeds go to MANNA and Eblen; not confirmed.",
  src: `Omni and Explore Asheville listings via ${WEB}; ${WINTER}`,
});
addEv({
  id: "ymi-kwanzaa-2026-12-26", date: "2026-12-26", end: "2027-01-01", kind: "event",
  what: "Kwanzaa at the YMI Cultural Center",
  detail: "The YMI hosts Asheville's yearly Kwanzaa celebration with candle-lighting, drumming and storytelling.",
  ph: "828-252-4614", tags: ["Free"], where: "YMI Cultural Center, 39 S Market St, Asheville",
  note: "The 2026 schedule was not published when checked. Past years ran a free nightly celebration Dec 26 to Jan 1 at "
    + "6pm; the winter guide says Dec 26-27, 12-5pm. Call the YMI.",
  src: `past YMI Kwanzaa announcements via ${WEB}; ${WINTER}`,
});
addEv({
  id: "mlk-weekend-2027-01-16", date: "2027-01-16", end: "2027-01-18", kind: "event",
  what: "MLK weekend: prayer breakfast and Peace March and Rally",
  detail: "The Dr. Martin Luther King Jr. Association's yearly events: a prayer breakfast on the Saturday and a free "
    + "Peace March from St. James A.M.E. Church to a rally in Pack Square Park on MLK Day, Mon Jan 18. The winter guide "
    + "adds youth storytelling at the YMI and a family day of service.",
  tags: ["Free"], where: "Downtown Asheville", w: "mlkasheville.org",
  note: "2027 times were not published when checked; check mlkasheville.org.",
  src: `past MLK Association schedules via ${WEB}; ${WINTER}`,
});
addEv({
  id: "winter-break-camps-2026-12-21", date: "2026-11-17", end: "2026-12-21", kind: "signup",
  what: "Sign up: winter break day camps (Asheville Parks & Rec, Museum of Science)",
  detail: "Full-day camps cover working hours while schools are out. SOAR scholarships cover Parks & Rec camp fees for "
    + "families with free or reduced lunch, SNAP, Medicaid, Section 8 or SSI, but take up to three weeks, so apply now. "
    + "The Museum of Science's STEAM Winter Break Camp is on the Events calendar.",
  ph: "828-259-5800", rid: "asheville-parks-rec-soar-scholarships",
  note: "Parks & Rec's 2026 camp dates were not published when checked. In 2025 its Holiday Camp ran Dec 22-23, Dec "
    + "29-31 and Jan 2, 8:30am-6pm ($40 first child, $30 each additional), and registration opened Nov 1. The winter "
    + "guide says Dec 21-23 and 28-31, 8am-5pm, with registration from Nov 21.",
  src: `2025 Parks & Rec holiday roundup via ${WEB}; ${WINTER}`,
});

const store = events.find((e) => e.id === "eblen-saint-nicholas-store-2026-12-17");
if (!store) throw new Error("no store event");
append(store, "note", "The winter guide says shopping appointments run Dec 14-18 with restock days through Dec 22 at 23 "
  + "Hamilton St; not confirmed. Ask Eblen when booking.");
append(store, "src", `appointment dates as given in the ${WINTER}`);
clean(store);
save(ev);

/* ======================================== CALENDAR: HOLIDAY REPEATS ===== */
/* Imported listings keep their organizers' own punctuation, so only the added note is dash-checked (append does it). */

const cal = load("calendar.json");
const HOLI = { "2026-11-26": "Thanksgiving Day", "2026-12-24": "Christmas Eve", "2026-12-25": "Christmas Day", "2027-01-01": "New Year's Day" };
let flagged = 0;
for (const e of cal.file.events) {
  const day = HOLI[e.date];
  if (!day) continue;
  append(e, "note", `Falls on ${day}: this listing repeats from the organizer's calendar, so call to confirm it is happening.`);
  flagged++;
}
save(cal);

/* ========================================================== CHANGELOG ===== */

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift(clean({
  date: "Nov 17 2026",
  what: "Winter holiday calendar: closures, school breaks, LIHEAP and holiday events",
  detail: "From the winter 2026-27 holiday guide: Events now show Thanksgiving, Christmas, New Year's and MLK Day "
    + "closures (schools, libraries, county offices, ART), both school winter breaks, the two LIHEAP windows, winter "
    + "break camp sign-up, and free or low-cost holiday events (Black Mountain Holly Jolly, Weaverville Candlelight "
    + "Stroll, the Big Crafty's free Sunday, Kwanzaa at the YMI, MLK weekend, the Grove Park gingerbread display, Lake "
    + `Julian lights). ${flagged} repeating calendar listings on Thanksgiving, Christmas and New Year's Day now say to call `
    + "first. Code Purple keeps the official sheet's numbers, with the guide's in its note.",
  source: "scripts/apply-winter-guide-2026-11-17.mjs",
}));
save(cl);
console.log(`patched ${patched} rows, 1 new row, ${events.length} events, ${flagged} calendar listings flagged`);
