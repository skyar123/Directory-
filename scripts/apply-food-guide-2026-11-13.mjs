/*
 * Food guide cross-check and flyers, 2026-11-13.
 *
 * Sources Skylar shared on 13 Nov 2026:
 *  - "WNC Free Food & Supplies" community guide (tiny.cc/freeinwnc, updated
 *    2 Oct 2026, kept by freefoodhelene@proton.me)
 *  - flyers: Code Purple Nov 13-14 (Asheville-Buncombe Continuum of Care),
 *    Bounty & Soul market updates, the Christmas Blessings Event in Candler,
 *    Eblen's Giving Thanks Turkey Giveaway, Salvation Army Angel Tree.
 *
 * What it does:
 *  - Salvation Army: Skylar does not refer families there, because it asks for
 *    a humiliating amount of personal detail (Angel Tree 2026 wants photo ID,
 *    birth certificates or custody papers, and income proof). Each Salvation
 *    Army row says so at the start of its description, where Ask AI reads it.
 *  - Code Purple: this winter's sites, check-in time and status line.
 *  - Rows the guide corrects or fills (Budgie's, Food Connection, Root Cause
 *    Farm, Swannanoa Communities Together, Foster Adventist, Garren Creek,
 *    Catholic Charities).
 *  - New rows for food sources in the guide that the directory lacked.
 *  - Events from the flyers. Angel Tree is left out on purpose.
 * Community guide details are not verified: no row gets lv from this. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";

const GUIDE = "WNC Free Food & Supplies community guide (tiny.cc/freeinwnc, updated 2 Oct 2026), shared by Skylar Belt 13 Nov 2026";
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

const res = load("resources.json");
const list = res.file.resources;
const byId = new Map(list.map((r) => [r.id, r]));
const get = (id) => { const r = byId.get(id); if (!r) throw new Error(`no resource ${id}`); return r; };
const expect = (r, k, v) => { if (r[k] !== v) throw new Error(`${r.id}.${k} is ${JSON.stringify(r[k])}`); };
const fill = (r, k, v) => { if (!blank(r[k])) throw new Error(`${r.id}.${k} already ${JSON.stringify(r[k])}`); r[k] = clean(v); };
const append = (r, k, t) => {
  clean(t);
  const cur = (r[k] || "").trim();
  r[k] = !cur ? t : k === "src" ? `${cur}; ${t}` : `${cur}${/[.!?)]$/.test(cur) ? "" : "."} ${t}`;
};
const swap = (r, k, from, to) => {
  if (!r[k].includes(from)) throw new Error(`${r.id}.${k} lacks ${JSON.stringify(from)}`);
  r[k] = r[k].replace(from, clean(to));
};
let n = 0;
const patch = (id, fn) => { const r = get(id); fn(r); clean(r); n++; };

/* ------------------------------------------------------- Salvation Army */

const SA = "Skylar does not refer families here first: it asks for a humiliating amount of personal detail and "
  + "paperwork. Offer other options before this one.";
for (const id of ["salvation-army-asheville", "salvation-army-rent-assistance", "salvation-army-shelter"]) {
  patch(id, (r) => {
    r.d = `${SA} ${r.d}`;
    r.note = r.note ? `${SA} ${r.note}` : SA;
    r.readFirst = true;
    append(r, "src", "referral stance from Skylar Belt, 13 Nov 2026");
  });
}
patch("salvation-army-shelter", (r) => {
  append(r, "d", "On Code Purple nights the Center of Hope opens to men, couples and people with pets with no ID needed "
    + "(see Code Purple).");
});
patch("salvation-army-asheville", (r) => {
  fill(r, "a", "750 Haywood Rd, Asheville (per the community food guide)");
  fill(r, "h", "Tue-Thu 9am-2:30pm (per the community food guide)");
  append(r, "src", `address, hours and items (hygiene, baby supplies, pet food) from the ${GUIDE}`);
});
patch("holiday-assistance", (r) => {
  append(r, "d", "Skylar does not refer to the Salvation Army Angel Tree: its 2026 sign-up (from November 16) asks for "
    + "photo ID, each child's birth certificate or custody papers, and proof of income, and bars families who asked "
    + "any other agency for Christmas help.");
  append(r, "src", "Angel Tree 2026 requirements from the Salvation Army flyer, stance from Skylar Belt, 13 Nov 2026");
});

/* ------------------------------------------------------------ Code Purple */

patch("code-purple", (r) => {
  r.ph = "828-442-7597 (Code Purple status line)";
  r.h = "Called nights only; check-in 5-8pm";
  swap(r, "d", "The 2026-27 site list had not been published as of 8 Nov 2026.",
    "2026-27, from the Continuum of Care's November flyer: women and children go to ABCCM Transformation Village, "
    + "30 Olin Haven Way; men, couples and people with pets go to the Center of Hope, 204 Haywood St. Check-in "
    + "5-8pm, no ID or sobriety required, free ART rides. Call the status line to hear whether tonight is a Code "
    + "Purple night.");
  append(r, "src", "2026-27 sites, check-in and status line from the Asheville-Buncombe Continuum of Care flyer for Nov 13-14, 2026, shared by Skylar Belt");
});
patch("code-purple-winter-shelter-free-art-rides-to", (r) => {
  fill(r, "ph", "828-442-7597 (Code Purple status line)");
  append(r, "d", "This winter's sites and check-in times are on the main Code Purple row.");
  append(r, "src", "status line from the Continuum of Care flyer, Nov 2026");
});

/* ------------------------------------------- rows the guide fills or fixes */

patch("budgie-s-bakery-free-pantry", (r) => {
  expect(r, "n", "Budgie's Bakery Free Pantry");
  r.n = "Budgie's Bakeshop Free Market & Pantry";
  r.a = "1808 Pisgah Hwy, Candler";
  r.h = "Pantry 24/7; free market 1st Saturday of the month 12-4pm";
  append(r, "d", "Free market on the first Saturday of the month, 12-4pm, and free firewood and propane in season.");
  r.note = "Local resource, now also listed in the WNC Free Food & Supplies community guide (Oct 2026). Confirm details "
    + "before referring.";
  append(r, "src", `market day and firewood from the ${GUIDE}`);
});
patch("food-connection", (r) => {
  r.h = "Tue 3pm Fairview; Wed 5pm Leicester; Thu 3pm Candler; Fri 11am Weaverville; Sat 10am Swannanoa";
  append(r, "d", "The October 2026 community food guide lists: Fairview Food Lion, 1350 Charlotte Hwy (Tue 3pm); Bell "
    + "United Methodist, 17 Mayrand Rd, Leicester (Wed 5pm); Francis Asbury Methodist, 725 Asbury Rd, Candler (Thu 3pm); "
    + "Victory Fellowship, 450 Aiken Rd, Weaverville (Fri 11am); ArtSpace Charter School, 2030 US 70, Swannanoa (Sat "
    + "10am, not the older 105 Whitson time).");
  append(r, "src", `sites and times from the ${GUIDE}`);
});
patch("root-cause-farm-free-market", (r) => {
  fill(r, "w", "rootcausefarm.org/calendar");
  append(r, "d", "The last market of 2026 is Tuesday, November 25; it reopens in spring.");
  append(r, "src", `website and season end from the ${GUIDE}`);
});
patch("swannanoa-communities-together", (r) => {
  fill(r, "w", "swannanoacommunitiestogether.org");
  append(r, "d", "The October 2026 food guide lists Mon-Fri 9am-5:30pm (not 6:30), financial help Mon-Wed 9am-3pm, a "
    + "free fridge and pantry, firewood in winter, and help with medicines for people without insurance.");
  append(r, "src", `website, hours and services from the ${GUIDE}`);
});
patch("foster-adventist-church", (r) => {
  fill(r, "h", "Crisis Ministry Tue 8:30-11am");
  append(r, "d", "The food guide lists its Crisis Ministry on Tuesdays 8:30-11am: food pantry, baby supplies, clothing, "
    + "home goods and services for people without housing.");
  append(r, "src", `Crisis Ministry hours and items from the ${GUIDE}`);
});
patch("garren-creek-thanksgiving-boxes-swannanoa", (r) => {
  append(r, "d", "Garren Creek Foundation also runs a free food and supply store every Tuesday 4:30-6:30pm at 1198 "
    + "Garren Creek Rd, Fairview.");
  append(r, "src", `weekly store from the ${GUIDE}`);
});
patch("catholic-charities", (r) => {
  append(r, "d", "The October 2026 food guide lists the pantry on Wednesdays 11am-1pm, open to anyone.");
  append(r, "src", `pantry day from the ${GUIDE}`);
});

/* ---------------------------------------------------------- new rows */

const FOOD = ["VIII:*", "VIII:5a"];
const add = (o) => {
  if (byId.has(o.id)) throw new Error(`id exists: ${o.id}`);
  const r = {
    id: o.id, n: o.n, pp: "", sp: "⚪ Not listed - ask", spd: "Not stated in the source. Ask when you call.",
    ph: o.ph || "", em: o.em || "", w: o.w || "", d: o.d, a: o.a || "", h: o.h || "",
    os: "Community food guide (Oct 2026)", t: o.t || "Free", lv: "", vb: "", sec: "VIII", needs: o.needs || FOOD,
    src: o.src ? `${GUIDE}; ${o.src}` : GUIDE, note: o.note || "", new: true,
  };
  clean(r);
  list.push(r); byId.set(r.id, r);
};

/* Asheville hot meals */
add({ id: "lunch-at-the-crossroads-first-baptist", n: "Lunch at the Crossroads (First Baptist Asheville)",
  a: "5 Oak St, Asheville", h: "Thursdays 12pm", d: "Free community lunch at First Baptist Church of Asheville." });
add({ id: "ywam-friday-hot-meal", n: "YWAM free hot meal (downtown)", a: "Corner of Aston St and Lexington Ave, Asheville",
  h: "Fridays 12pm", d: "Free hot meal served on the street corner every Friday." });
add({ id: "free-pizza-wednesdays-craggy-ave", n: "Free pizza Wednesdays (60 Craggy Ave)", a: "60 Craggy Ave, Asheville",
  h: "Wednesdays 6:30-9pm", d: "Free pizza every Wednesday evening, with vegan options." });
add({ id: "sand-hill-kitchen-bagged-lunches", n: "Sand Hill Kitchen bagged lunches", ph: "828-633-6868",
  a: "491 Sardis Rd, Asheville 28806", h: "During business hours",
  d: "Free bagged lunches during business hours, no questions asked." });

/* Asheville pantries, fridges and shares */
add({ id: "bethel-sda-pantry", n: "Bethel Seventh-day Adventist Church food pantry", ph: "828-329-9111",
  a: "238 S French Broad Ave, Asheville 28801", h: "Tuesdays 10am-1pm", d: "Food pantry." });
add({ id: "ab-tech-student-pantry", n: "A-B Tech student food pantry", a: "340 Victoria Rd, Asheville 28801",
  h: "Thursdays 1-5pm", d: "Food pantry for A-B Tech students, useful for student parents." });
add({ id: "biltmore-church-of-christ-pantry", n: "Biltmore Church of Christ food pantry",
  a: "823 Fairview St, Asheville 28803", h: "Wednesdays 10am-12pm", d: "Food pantry." });
add({ id: "covenant-community-church-snap-gap", n: "Covenant Community Church SNAP Gap pantry", ph: "828-298-8955",
  em: "info@cccasheville.org", w: "cccasheville.org/snapgap", a: "11 Rocket Dr, Asheville 28803", h: "Thursdays 9am",
  d: "Emergency food and food pantry, with help on SNAP, WIC and other nutrition benefits. More days may be added." });
add({ id: "deaverview-community-pantry", n: "Deaverview Community Food Pantry", a: "Apt 6D, 275 Deaverview Rd, Asheville",
  d: "Community food pantry in the Deaverview neighborhood." });
add({ id: "east-end-pantry", n: "East End Pantry", a: "44 Hildebrand St, Asheville", d: "Neighborhood free pantry in East End." });
add({ id: "emma-umc-pantry", n: "Emma United Methodist Church food pantry", ph: "828-699-5570",
  a: "55 Adams Hill Rd, Asheville 28806", h: "Mondays 3-5pm", d: "Food pantry open to anyone in need." });
add({ id: "little-free-bodega-haywood", n: "Little Free Bodega (West Asheville)", a: "575 Haywood Rd, in front of Hail Mary",
  h: "24/7", t: "Free, 24/7", d: "Part little free library, trading post, seed exchange, free clothes and free pantry and produce. No fridge." });
add({ id: "little-free-corner-store", n: "Little Free Corner Store fridge and pantry", a: "1065 Haywood Rd, Asheville",
  h: "24/7", t: "Free, 24/7", d: "Free fridge and pantry, open all the time." });
add({ id: "retro-coffee-pantry", n: "Retro Coffee little pantry", a: "2619 Sweeten Creek Rd, Asheville",
  d: "Free pantry; the guide lists its hours as to be decided." });
add({ id: "shiloh-pantry", n: "Shiloh Pantry", a: "49 Hampton St, Asheville", d: "Neighborhood free pantry in Shiloh." });
add({ id: "zephyr-hills-fwb-pantry", n: "Zephyr Hills Free Will Baptist food pantry", ph: "828-253-5487",
  a: "283 Shelburne Rd, Asheville 28806", h: "Thursdays 12-2pm", d: "Food pantry open to anyone in need." });
add({ id: "grant-center-free-fridge", n: "Grant Center free fridge", a: "285 Livingston St, Asheville",
  h: "Mon-Thu 9am-9pm, Fri 9am-8pm, Sat 10am-6pm", d: "Free fridge at the Grant Center in Southside." });
add({ id: "streetside-community-potluck", n: "Streetside Community potluck (Aston Park)",
  a: "Aston Park, 300 Hilliard Ave, Asheville 28801", h: "Saturdays and Sundays",
  d: "Community potluck and resource share: bring what you can, take what you need, including food, clothes and camping gear." });
add({ id: "the-whale-free-groceries", n: "The Whale free groceries", a: "507 Haywood Rd #10, Asheville 28806",
  h: "Tuesdays 4:30pm until gone", d: "Free groceries every Tuesday in West Asheville.",
  note: "The guide says they may take photos and post them on social media; tell families who would rather not be pictured." });

/* the rest of Buncombe */
add({ id: "big-ivy-community-club-pantry", n: "Big Ivy Community Club food pantry (Barnardsville)", ph: "828-626-3438",
  a: "540 Dillingham Rd, Barnardsville 28709", h: "Tue 1-6pm, Wed 11am-2pm, Thu 9am-12pm; hot meals 1pm",
  d: "Food pantry with hot meals at 1pm." });
add({ id: "appalachian-community-relief", n: "Appalachian Community Relief (Black Mountain)", ph: "828-545-1579",
  w: "appalachiancommunityrelief.org", a: "Black Mountain",
  d: "Free shop to visit in person, with an online application. Can also help with groceries at the Rite Buy store in Swannanoa." });
add({ id: "black-mountain-open-tables", n: "Black Mountain Open Table meals (UU and Methodist)",
  ph: "828-669-8050", em: "info@uusv.org", w: "uusv.org/open-table",
  a: "UU Congregation of the Swannanoa Valley, 500 Montreat Rd; Black Mountain UMC, 101 Church St",
  h: "Wednesdays 11:30am-1pm", d: "Two free community lunches on Wednesdays. The UU Open Table has no eligibility requirements." });
add({ id: "black-mountain-little-pantries", n: "Black Mountain little free pantries",
  a: "117 Montreat Rd; 201 Blue Ridge Rd; 130 Montreat Rd; 424 W State St", h: "24/7", t: "Free, 24/7",
  d: "Outdoor pantries at Black Mountain Presbyterian (117 Montreat Rd), First Christian (201 Blue Ridge Rd), First "
    + "Baptist (130 Montreat Rd, back of the lot) and St. James Episcopal (424 W State St, on Hwy 70)." });
add({ id: "leicester-library-pantry-manna", n: "Leicester Community Library pantry and MANNA distribution",
  a: "1561 Alexander Rd, Leicester", h: "MANNA distribution 3rd Tuesday 2:30-3:30pm",
  d: "Little pantry at the library, and a free MANNA food distribution at the community center every third Tuesday, open to anyone." });
add({ id: "blessing-bus", n: "Blessing Bus (Buncombe outreach)", a: "Rotating sites; Ingles, 2299 US 70, Swannanoa on 1st and 3rd Wednesdays",
  d: "Hot food, blessing bags, propane vouchers, bus passes and a monthly free laundry day for neighbors without "
    + "housing. Visits sites around Buncombe on Tuesdays." });
add({ id: "weaverville-first-baptist-pantry", n: "Weaverville First Baptist Food and Supply Pantry",
  a: "63 N Main St, Weaverville 28787", h: "Tuesdays and Fridays 10am-2pm", d: "Food and supply pantry." });
add({ id: "period-pantry-locations", n: "Asheville Period Pantry locations", w: "ashevilleperiodpantry.com/locations",
  a: "Many sites in Asheville, Candler, Fairview and Hendersonville, including the Enka-Candler library",
  needs: ["VIII:*", "VIII:13a"], d: "Free menstrual products at pantries across the area; the website maps them." });
add({ id: "free-firewood-wnc", n: "Free firewood and propane (seasonal)", needs: ["VIII:*", "VIII:14a"],
  ph: "828-669-9404 (Swannanoa Valley Christian Ministry)",
  d: "Swannanoa Valley Christian Ministry delivers a free load of split firewood in Black Mountain and Swannanoa through "
    + "spring. Swannanoa Communities Together (2121 US 70) and Budgie's Bakeshop (1808 Pisgah Hwy, Candler) have "
    + "firewood in winter, and the Asheville Tool Library (16 Smith Mill Rd) sometimes leaves emergency firewood to "
    + "take. Pisgah National Forest allows free firewood gathering for personal use through December 2026 (Pisgah "
    + "Ranger District 828-877-3265; Appalachian Ranger District 828-689-9694)." });

/* neighboring counties */
add({ id: "iam-pantry-hendersonville", n: "IAM food and hygiene pantry (Hendersonville)", w: "iam-hc.org/get-help",
  a: "310 Freeman St, Hendersonville 28792", h: "Mon, Tue, Thu 9am-4pm; Wed and Fri 9am-12:30pm",
  d: "Food and hygiene help with no Henderson County residency or income proof required, plus a mobile pantry (schedule on the website)." });
add({ id: "loves-kitchen-hendersonville", n: "Love's Kitchen hot meal (Hendersonville)", a: "312 5th Ave W, Hendersonville 28739",
  h: "Thursdays 11:30am-1pm", d: "Free hot meal every Thursday." });
add({ id: "the-storehouse-hendersonville", n: "The Storehouse (Hendersonville)", a: "1049 Spartanburg Hwy, Hendersonville",
  h: "Wed-Fri 9am-2pm", d: "Food, hygiene items and cold-weather clothing." });
add({ id: "roar-mutual-aid-hub-marshall", n: "ROAR Mutual Aid Hub (Marshall)", w: "ruralorganizing.wordpress.com",
  a: "798 Walnut Creek Rd, Marshall", h: "Saturdays 10am-4pm",
  d: "Free hot food, local vegetables, canned goods, clothes, medical and hygiene supplies, and firewood and propane vouchers." });
add({ id: "beacon-of-hope-marshall", n: "Beacon of Hope food distribution (Marshall)", w: "bohmarshall.org",
  a: "5111 US 25/70 Hwy, Marshall 28753", h: "Mon-Fri 12-4pm (none on the 4th Wednesday)", d: "Weekday food distribution in Madison County." });
add({ id: "foothills-food-hub", n: "Foothills Food Hub drive-thru food boxes (McDowell)", w: "foothillsfoodhub.org",
  a: "608 Jacktown Rd, Marion; 407 Salem Church Rd, Old Fort",
  h: "Marion 2nd and 4th Tuesdays 1-2pm; Old Fort Mondays 2-3pm",
  d: "Free household boxes of dry goods, farm produce and farm meat, no questions asked." });
add({ id: "bear-closet-of-marion", n: "Bear Closet of Marion food and supply pantry", ph: "828-803-8790",
  w: "bearclosetofmarion.com", a: "337 Garden Creek Rd, Marion",
  h: "Children's meals Tue 12-4pm; produce stand and hot meals Wed 11am-3pm",
  d: "Food and supply pantry. Children 1 to 18 can get a free meal every day." });
add({ id: "haywood-christian-ministry-market", n: "Haywood Christian Ministry community market (Waynesville)",
  a: "150 Branner Ave, Waynesville", h: "Mon 12-4pm, Wed 9am-1pm, Fri 11am-4pm", d: "Community market and food pantry." });
add({ id: "bread-of-life-brevard", n: "The Bread of Life (Brevard)", ph: "828-877-3577", em: "breadoflifetc@gmail.com",
  a: "238 S Caldwell St, Brevard 28712", h: "Pantry Mon-Fri 9am-2pm; hot meals Mon-Fri 12-2pm",
  d: "Hot meals and a grocery-style pantry on weekdays." });
add({ id: "sharing-house-brevard", n: "The Sharing House (Brevard)", ph: "828-844-2866", w: "sharinghouse.org/food-access",
  a: "164 Duckworth Ave, Brevard 28712", h: "Mon-Fri 9am-12pm and 1-4pm; Tue until 6pm", d: "Food access in Transylvania County." });
add({ id: "reconciliation-house-burnsville", n: "Reconciliation House (Burnsville)", ph: "828-682-7251", w: "rec-house.org",
  a: "20 Academy St, Burnsville", h: "Pantry Mon, Wed, Fri 9am-12pm (call ahead to reserve a time)",
  d: "Pre-packed box, shop the shelves, or order ahead at orderahead.org; food every two weeks or monthly, and someone "
    + "can pick up for you. Also helps with heating and utility bills." });

res.file.meta.count = list.length;
res.file.meta.sources.push("WNC Free Food & Supplies community guide (Oct 2026) and flyers shared 13 Nov 2026 "
  + "(see scripts/apply-food-guide-2026-11-13.mjs)");
save(res);
console.log(`patched ${n}; ${list.length} resources`);

/* ---------------------------------------------------------- events */

const ev = load("events.json");
const FLYER = "Flyer shared by Skylar Belt, 13 Nov 2026";
const events = [
  { id: "code-purple-2026-11-13", date: "2026-11-13", end: "2026-11-14", time: "Check-in 5-8pm", kind: "event",
    what: "Code Purple called: emergency overnight shelter",
    detail: "Women and children: ABCCM Transformation Village, 30 Olin Haven Way. Men, couples and people with pets: "
      + "Center of Hope, 204 Haywood St. No ID or sobriety required; free ART rides to the shelters.",
    ph: "828-442-7597", rid: "code-purple", src: `${FLYER} (Asheville-Buncombe Continuum of Care)` },
  { id: "eblen-turkey-giveaway-2026-11-20", date: "2026-11-20", kind: "event",
    what: "Eblen Charities Giving Thanks Turkey Giveaway",
    detail: "Everything for a Thanksgiving meal, with Ingles and iHeart Media. Sign up in advance; the flyer says sign-ups are still open.",
    tags: ["Free"], ph: "828-255-3066", w: "eblencharities.org", rid: "eblen-charities", src: FLYER },
  { id: "christmas-blessings-candler-2026-11-21", date: "2026-11-21", time: "10am-2pm", kind: "event",
    what: "3rd Annual Christmas Blessings Event: free toys, food and clothing",
    where: "Maple Ridge Baptist, 133 Medford Branch Rd, Candler 28715",
    detail: "Free Christmas toy shop with new toys, a hot meal, a free used-clothing store, pantry staple boxes, and "
      + "bookbags and school supplies. Everyone welcome. Hosted by Woodland Terrace Baptist Church.",
    tags: ["Free"], w: "hoperidgechristianministries.org", src: FLYER },
  { id: "bounty-soul-artspace-moved-2026-11-21", date: "2026-11-21", time: "10-11:30am", kind: "event",
    what: "Bounty & Soul ArtSpace market moves for one day",
    where: "Black Mountain Machine & Tool, 2988 US Hwy 70, Black Mountain 28711",
    detail: "The Saturday ArtSpace market meets here this week only.", tags: ["Free"], rid: "bounty-soul", src: FLYER },
  { id: "bounty-soul-thanksgiving-week-2026-11-25", date: "2026-11-25", end: "2026-11-28", kind: "event",
    what: "Bounty & Soul Thanksgiving week market changes",
    detail: "Bi-Lo market moves to Wednesday, Nov 25, 3:30-4:30pm (not Thursday). Cancelled: Beacon Community Center "
      + "and Fairview Reynolds (Wed Nov 25), Grant Center (Fri Nov 27) and ArtSpace (Sat Nov 28). Regular markets "
      + "resume Monday, Nov 30.", tags: ["Free"], rid: "bounty-soul", src: FLYER },
];
for (const e of events) {
  if (ev.file.events.some((x) => x.id === e.id)) throw new Error(`event exists: ${e.id}`);
  ev.file.events.push(clean(e));
}
ev.file.events.sort((a, b) => a.date.localeCompare(b.date));
save(ev);

/* ---------------------------------------------------------- changelog */

const cl = load("changelog.json");
const group = (id) => cl.file.groups.find((g) => g.id === id);
group("added").entries.unshift(clean({
  date: "Nov 13 2026",
  what: "Food guide cross-check: 39 new food sources, Code Purple sites, Salvation Army flagged",
  detail: "From the WNC Free Food & Supplies guide (Oct 2026): new rows for Asheville meals, pantries and fridges, "
    + "Barnardsville, Black Mountain, Leicester and Weaverville sites, free firewood, and the main food sources in "
    + "Henderson, Madison, McDowell, Haywood, Transylvania and Yancey. Corrected Food Connection's times, Swannanoa "
    + "Communities Together's hours and Budgie's Bakeshop. Code Purple now lists this winter's sites and status line "
    + "(828-442-7597). Salvation Army rows say Skylar does not refer there first, because of how much personal detail "
    + "it asks for. Calendar: Code Purple Nov 13-14, Eblen's turkey giveaway (Nov 20), the Christmas Blessings Event "
    + "in Candler (Nov 21) and Bounty & Soul's market changes.",
  source: "scripts/apply-food-guide-2026-11-13.mjs",
}));
save(cl);
console.log("events and changelog updated");
