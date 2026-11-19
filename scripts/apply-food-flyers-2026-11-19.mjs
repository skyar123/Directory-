/*
 * Four food flyers shared by Skylar Belt, 19 Nov 2026. Run once.
 *
 * 1. YWAM Asheville free food truck: Friday 11/20, 12:30pm, Thanksgiving
 *    casserole, corner of Aston and Lexington, until food runs out
 *    (ywamasheville.org on the truck). The directory's YWAM row (from the
 *    October food guide) said Fridays at 12pm; it gets the website, the food
 *    truck and "until food runs out", and the day's event.
 * 2. Bounty & Soul: the Saturday ArtSpace market meets at Black Mountain
 *    Machine & Tool, 2988 US Highway 70, Black Mountain 28711, on Saturday 21
 *    Nov 2026, same time (10-11:30am). The event was already here from a
 *    13 Nov flyer; this adds the note to Food by day's Saturday entry and
 *    fixes "US 700" in the organizer calendar's copy.
 * 3. Bountiful Cities 2027 Share Market dates (English and Spanish flyers):
 *    no-cost vegetables and fruit with MANNA, SUNA and Asheville City
 *    Schools, 1st Wednesdays 3:30-5:30pm at Self-Help Credit Union, 391 S
 *    French Broad Ave, and 2nd and 4th Wednesdays 3-5pm at the William
 *    Randolph campus gym, 90 Montford Ave. A new row, Food by day entries
 *    and the 35 dated markets (each checked to fall on the Wednesday the
 *    flyer says).
 * 4. MANNA Community Market, Wednesday 18 Nov 2026, 3-5pm, Rock Hill
 *    Missionary Baptist-Shiloh, 486 Caribou Rd, Asheville 28803: free
 *    groceries and supplies, open to everyone, no questions asked. MANNA's
 *    January 2026 market list (by web search) has the same site on Wednesday
 *    21 Jan, 3-5pm; both are third Wednesdays. A new row, a Food by day entry
 *    and the (now past) event.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const clean = (s) => { if (DASH.test(s)) throw new Error(`dash in: ${s}`); return s; };
const load = (f) => {
  const path = new URL(`../data/${f}`, import.meta.url);
  return { path, file: JSON.parse(readFileSync(path, "utf8")) };
};
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const FLYER = "Flyer shared by Skylar Belt, 19 Nov 2026";

const res = load("resources.json");
const list = res.file.resources;
const get = (id) => { const r = list.find((x) => x.id === id); if (!r) throw new Error(`no row ${id}`); return r; };
const lacks = (id) => { if (list.some((x) => x.id === id)) throw new Error(`${id} already exists`); };
const expect = (r, k, v) => { if (r[k] !== v) throw new Error(`${r.id}.${k} is ${JSON.stringify(r[k])}, expected ${JSON.stringify(v)}`); };
const addSrc = (r, s) => { r.src = `${String(r.src || "").trim()}; ${clean(s)}`; };

/* 1. YWAM */
const yw = get("ywam-friday-hot-meal");
expect(yw, "h", "Fridays 12pm");
expect(yw, "w", "");
yw.n = "YWAM free food truck hot meal (downtown, Fridays)";
yw.w = "ywamasheville.org";
yw.d = clean("Free hot meal from YWAM Asheville's food truck on the street corner every Friday, until the food runs out.");
yw.h = "Fridays at midday, until food runs out";
yw.note = clean("The October food guide says 12pm; YWAM's flyer for Friday 20 Nov 2026 says 12:30pm. Go early: it ends "
  + "when the food runs out.");
addSrc(yw, "food truck, website, 12:30pm and \"until food runs out\" from YWAM's flyer for 20 Nov 2026, shared by Skylar Belt 19 Nov 2026");

/* 3. Bountiful Cities Share Markets */
const wed = (d) => { const x = new Date(d + "T12:00:00Z"); return x.getUTCDay() === 3 ? Math.ceil(x.getUTCDate() / 7) : 0; };
const FIRST = ["01-06", "02-03", "03-03", "04-07", "05-05", "06-02", "07-07", "08-04", "09-01", "10-06", "11-03", "12-01"]
  .map((d) => "2027-" + d);
const SECOND_FOURTH = ["01-13", "01-27", "02-10", "02-24", "03-10", "03-24", "04-14", "04-28", "05-12", "05-26", "06-09",
  "06-23", "07-14", "07-28", "08-11", "08-25", "09-08", "09-22", "10-13", "10-27", "11-10", "11-24", "12-08"]
  .map((d) => "2027-" + d);
for (const d of FIRST) if (wed(d) !== 1) throw new Error(`${d} is not a first Wednesday`);
for (const d of SECOND_FOURTH) if (![2, 4].includes(wed(d))) throw new Error(`${d} is not a 2nd or 4th Wednesday`);
if (FIRST.length + SECOND_FOURTH.length !== 35) throw new Error("expected 35 market dates");

const SM = "bountiful-cities-share-markets";
lacks(SM);
const SM_SRC = "Bountiful Cities 2027 Share Market flyers (English and Spanish), shared by Skylar Belt 19 Nov 2026";
list.push({
  id: SM,
  n: "Bountiful Cities Share Markets (free vegetables and fruit, Wednesdays)",
  pp: "",
  sp: "⚪ Not listed - ask",
  spd: clean("The 2027 flyer is in English and Spanish; ask about Spanish at the market."),
  ph: "",
  em: "",
  w: "bountifulcities.org/share-market",
  d: clean("No-cost vegetables and fruit, year-round, from Bountiful Cities with MANNA FoodBank, the Southside United "
    + "Neighborhood Association (SUNA) and Asheville City Schools. 2027 dates: at Self-Help Credit Union, 391 S French "
    + "Broad Ave, 3:30-5:30pm on Jan 6, Feb 3, Mar 3, Apr 7, May 5, Jun 2, Jul 7, Aug 4, Sep 1, Oct 6, Nov 3 and Dec 1; "
    + "at the William Randolph campus gym, 90 Montford Ave, 3-5pm on Jan 13 and 27, Feb 10 and 24, Mar 10 and 24, Apr "
    + "14 and 28, May 12 and 26, Jun 9 and 23, Jul 14 and 28, Aug 11 and 25, Sep 8 and 22, Oct 13 and 27, Nov 10 and "
    + "24, and Dec 8. Gardeners can bring produce to share, and the markets take volunteers."),
  a: "Self-Help Credit Union, 391 S French Broad Ave (1st Wednesdays); William Randolph campus gym, 90 Montford Ave (2nd and 4th Wednesdays)",
  h: "1st Wednesdays 3:30-5:30pm; 2nd and 4th Wednesdays 3-5pm",
  os: "Share Market flyer (2027 dates)",
  t: "Free",
  lv: "",
  vb: "",
  sec: "VIII",
  needs: ["VIII:*", "VIII:5a"],
  src: SM_SRC,
  note: clean("The flyer gives 2027 dates only (no market on Dec 22, 2027; more in 2028). For December 2026, check "
    + "bountifulcities.org/share-market; WLOS listed a market on Wednesday, 28 Oct 2026 at William Randolph, 3-5pm."),
  new: true,
});
const veg = get("bountiful-cities-free-veggie-mondays");
const old = "Bountiful Cities also runs free Share Markets (WLOS listed one on October 28 at William Randolph School, 3-5pm).";
if (!veg.note.includes(old)) throw new Error("Veggie Mondays note changed");
veg.note = veg.note.replace(old, "Bountiful Cities also runs free Share Markets on Wednesdays: see that row.");

/* 4. MANNA Community Market at Shiloh */
const MS = "manna-community-market-shiloh";
lacks(MS);
list.push({
  id: MS,
  n: "MANNA Community Market at Rock Hill Missionary Baptist (Shiloh)",
  pp: "",
  sp: "⚪ Not listed - ask",
  spd: "Not stated in the source. Ask when you call.",
  ph: "828-290-9749",
  em: "",
  w: "mannafoodbank.org/manna-community-market",
  d: clean("Free groceries and supplies from MANNA's mobile market: open to everyone, no questions asked. MANNA posts "
    + "each month's market dates; the phone is the MANNA Food Helpline. Bounty & Soul's Monday produce market meets at "
    + "the same church."),
  a: "Rock Hill Missionary Baptist Church, 486 Caribou Rd, Asheville 28803",
  h: "Wednesdays 3-5pm, about monthly (third Wednesday on 21 Jan and 18 Nov 2026)",
  os: "MANNA Community Market flyer",
  t: "Free, Walk-in",
  lv: "",
  vb: "",
  sec: "VIII",
  needs: ["VIII:*", "VIII:5a"],
  src: clean("MANNA Community Market flyer for 18 Nov 2026, shared by Skylar Belt 19 Nov 2026; January 2026 MANNA "
    + "Community Markets list (mannafoodbank.org), via web search 19 Nov 2026; phone from the directory's MANNA Food "
    + "Helpline row"),
  note: clean("Only two dates are known, both third Wednesdays, so check MANNA's list or call the helpline for the "
    + "next one before sending a family."),
  new: true,
});

res.file.meta.count = list.length;
res.file.meta.sources.push("Food flyers of 19 Nov 2026: YWAM food truck, Bounty & Soul one-day move, Bountiful Cities "
  + "2027 Share Markets, MANNA Community Market at Shiloh (see scripts/apply-food-flyers-2026-11-19.mjs)");
save(res);

/* events */
const ev = load("events.json");
const evIds = new Set(ev.file.events.map((e) => e.id));
const addEvent = (e) => { if (evIds.has(e.id)) throw new Error(`event ${e.id} exists`); evIds.add(e.id); clean(JSON.stringify(e)); ev.file.events.push(e); };
addEvent({
  id: "ywam-food-truck-thanksgiving-2026-11-20", date: "2026-11-20", time: "12:30pm", kind: "event",
  what: "YWAM free food truck: Thanksgiving casserole",
  where: "Corner of Aston St and Lexington Ave, downtown Asheville",
  detail: "Free hot meal from YWAM Asheville's food truck, until the food runs out.",
  tags: ["Free"], w: "ywamasheville.org", rid: "ywam-friday-hot-meal", src: FLYER,
});
addEvent({
  id: "manna-community-market-shiloh-2026-11-18", date: "2026-11-18", time: "3-5pm", kind: "event",
  what: "MANNA Community Market: free groceries and supplies",
  where: "Rock Hill Missionary Baptist-Shiloh, 486 Caribou Rd, Asheville 28803",
  detail: "Open to everyone, no questions asked.",
  tags: ["Free"], rid: MS, src: FLYER,
});
for (const d of FIRST) {
  addEvent({
    id: `share-market-self-help-${d}`, date: d, time: "3:30-5:30pm", kind: "event",
    what: "Bountiful Cities Share Market: free vegetables and fruit",
    where: "Self-Help Credit Union, 391 S French Broad Ave, Asheville",
    tags: ["Free"], w: "bountifulcities.org/share-market", rid: SM, src: SM_SRC,
  });
}
for (const d of SECOND_FOURTH) {
  addEvent({
    id: `share-market-william-randolph-${d}`, date: d, time: "3-5pm", kind: "event",
    what: "Bountiful Cities Share Market: free vegetables and fruit",
    where: "William Randolph campus gym, 90 Montford Ave, Asheville",
    tags: ["Free"], w: "bountifulcities.org/share-market", rid: SM, src: SM_SRC,
  });
}
const bs = ev.file.events.find((e) => e.id === "bounty-soul-artspace-moved-2026-11-21");
if (!bs || bs.time !== "10-11:30am" || !/2988 US Hwy 70/.test(bs.where)) throw new Error("Bounty & Soul move event not as expected");
bs.detail = "The Saturday ArtSpace market meets here this week only, same time. There is no ArtSpace market on Nov 28.";
bs.src += "; Bounty & Soul's market update flyer (English and Spanish), shared again 19 Nov 2026";
ev.file.meta.src = `${ev.file.meta.src}; food flyers of 19 Nov 2026 (scripts/apply-food-flyers-2026-11-19.mjs)`;
save(ev);

/* the organizer calendar's copy of the moved market */
const cal = load("calendar.json");
const pe = cal.file.events.find((e) => e.id === "pe-e0076");
if (!pe || pe.where !== "Black Mountain Machine and Tool, 2988 US 700, Black Mountain, NC 28711") throw new Error("calendar pe-e0076 not as expected");
pe.where = "Black Mountain Machine and Tool, 2988 US 70, Black Mountain, NC 28711";
save(cal);

/* Food by day */
const food = load("food-by-day.json");
const day = (n) => food.file.days.find((d) => d.day === n);
const site = (n, place) => { const s = day(n).sites.find((x) => x.place === place); if (!s) throw new Error(`${n}: no ${place}`); return s; };
const fy = site("Friday", "YWAM free hot meal");
fy.place = "YWAM free food truck hot meal";
fy.when = "12-12:30pm (corner of Aston St and Lexington Ave)";
fy.goodToKnow = "Until food runs out; the 20 Nov flyer says 12:30pm";
const art = site("Saturday", "Bounty & Soul market, ArtSpace");
art.goodToKnow += "; Nov 21, 2026 only: at Black Mountain Machine & Tool, 2988 US 70, Black Mountain, same time. No market Nov 28";
const W = day("Wednesday").sites;
for (const p of ["Bountiful Cities Share Market", "MANNA Community Market, Rock Hill Missionary Baptist"]) {
  if (W.some((s) => s.place.startsWith(p))) throw new Error(`Wednesday already has ${p}`);
}
W.push(
  { place: "Bountiful Cities Share Market, Self-Help Credit Union", when: "1st Wed 3:30-5:30pm (391 S French Broad Ave)",
    goodToKnow: "Free vegetables and fruit; 2027 dates on the flyer, check bountifulcities.org/share-market for December", lv: "", vb: "" },
  { place: "Bountiful Cities Share Market, William Randolph gym", when: "2nd and 4th Wed 3-5pm (90 Montford Ave)",
    goodToKnow: "Free vegetables and fruit; 2027 dates on the flyer, check bountifulcities.org/share-market for December", lv: "", vb: "" },
  { place: "MANNA Community Market, Rock Hill Missionary Baptist (Shiloh)", when: "3rd Wed 3-5pm (486 Caribou Rd)",
    goodToKnow: "Monthly; third Wednesday on the Jan and Nov 2026 dates, so confirm with the MANNA Food Helpline", lv: "", vb: "" },
);
clean(JSON.stringify(food.file.days));
food.file.meta.src += "; YWAM, Bounty & Soul, Bountiful Cities Share Market and MANNA Shiloh flyers, 19 Nov 2026";
save(food);

/* What changed */
const cl = load("changelog.json");
const entry = {
  date: "Nov 19 2026",
  what: "Free food flyers: YWAM's food truck, Bountiful Cities Share Markets, MANNA at Shiloh",
  detail: clean("YWAM's Friday hot meal is a food truck that runs until the food is gone (this Friday, Nov 20, a "
    + "Thanksgiving casserole at 12:30pm). New: Bountiful Cities' free vegetable and fruit Share Markets, every 1st "
    + "Wednesday at 391 S French Broad Ave and 2nd and 4th Wednesdays at 90 Montford Ave, with all 35 dates for 2027 on "
    + "the Events tab; and MANNA's Community Market at Rock Hill Missionary Baptist in Shiloh, about monthly on "
    + "Wednesdays 3-5pm. Food by day notes the Bounty & Soul ArtSpace market's one-day move to Black Mountain on Nov 21."),
  source: "scripts/apply-food-flyers-2026-11-19.mjs",
};
cl.file.groups.find((g) => g.id === "added").entries.unshift(entry);
save(cl);
console.log(`YWAM updated; ${list.length} resources; ${FIRST.length + SECOND_FOURTH.length + 2} events added; Food by day updated`);
