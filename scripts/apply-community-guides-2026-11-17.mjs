/*
 * Community guides, full pass, 2026-11-17.
 *
 * Sources Skylar shared on 17 Nov 2026:
 *  - "WNC Free Food & Supplies" guide (tiny.cc/freeinwnc, updated 2 Oct 2026).
 *    The 13 Nov pass added its main sources; this adds the rest, by county.
 *  - "WNC Free Medical Support Resources" and "WNC Financial Support
 *    Resources", the same maintainer's companion lists (freefoodhelene@proton.me).
 *  - "Low-Cost & Free Things to do in the Asheville Area, October 2026" (last
 *    update 7 Oct 2026, facebook.com/AVLAreaHappenings). Its dated October events
 *    are past; this keeps the ongoing free family outings, meals and classes.
 *
 * Web search, 17 Nov 2026, checked the new clinics, holiday programs and
 * referral lines. Only The Free Clinics (its own site) and the Swain County
 * Health Department (county site) were confirmed by their own pages, so only
 * those two get lv. Everything else carries the community list as its source,
 * and conflicts are kept in `note`.
 *
 * Left out on purpose: NC HOPE (closed to applications since 2022), the St.
 * Vincent de Paul St. Mary Conference (Wayne County, eastern NC), the Catawba
 * County United Way link, NCHRC food box delivery (marked disabled in the
 * guide), adult-only and paid entertainment, and the past October events.
 * Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FOOD = "WNC Free Food & Supplies community guide (tiny.cc/freeinwnc, updated 2 Oct 2026), shared again by Skylar Belt 17 Nov 2026";
const MED = "WNC Free Medical Support Resources community list (companion to the food guide), shared by Skylar Belt 17 Nov 2026";
const FIN = "WNC Financial Support Resources community list (companion to the food guide), shared by Skylar Belt 17 Nov 2026";
const OCT = "Low-Cost & Free Things to do in the Asheville Area, October 2026 (updated 7 Oct 2026, facebook.com/AVLAreaHappenings), shared by Skylar Belt 17 Nov 2026";
const WEB = "web search, 17 Nov 2026";
const SA = "Skylar does not refer families here first: it asks for a humiliating amount of personal detail and "
  + "paperwork. Offer other options before this one.";

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
const fill = (r, k, v) => { if (!blank(r[k])) throw new Error(`${r.id}.${k} already ${JSON.stringify(r[k])}`); r[k] = clean(v); };
const append = (r, k, t) => {
  clean(t);
  const cur = (r[k] || "").trim();
  r[k] = !cur ? t : k === "src" ? `${cur}; ${t}` : `${cur}${/[.!?)]$/.test(cur) ? "" : "."} ${t}`;
};
const lacks = (r, k, s) => { if ((r[k] || "").includes(s)) throw new Error(`${r.id}.${k} already mentions ${s}`); };
let patched = 0;
const patch = (id, fn) => { const r = get(id); fn(r); clean(r); patched++; };

const FOOD_NEEDS = ["VIII:*", "VIII:5a"];
const PLAY_NEEDS = ["X:*", "X:11"];
const added = [];
const add = (o) => {
  if (byId.has(o.id)) throw new Error(`exists: ${o.id}`);
  const r = {
    id: o.id, n: o.n, pp: "", sp: o.sp || "⚪ Not listed - ask",
    spd: o.spd || "Not stated in the source. Ask when you call.",
    ph: o.ph || "", em: o.em || "", w: o.w || "", d: o.d, a: o.a || "", h: o.h || "",
    os: o.os, t: o.t || "Free", lv: o.lv || "", vb: o.vb || "", sec: o.sec || "VIII",
    needs: o.needs || FOOD_NEEDS, src: o.src, note: o.note || "", new: true,
    ...(o.alt && { alt: o.alt }),
  };
  list.push(clean(r));
  byId.set(r.id, r);
  added.push(r.id);
};
const food = (o) => add({ os: "Community food guide (Oct 2026)", src: FOOD, ...o });
const med = (o) => add({ os: "Community medical list (Oct 2026)", sec: "VI", needs: ["VI:*", "VI:1a"], src: MED, ...o });
const outing = (o) => add({ os: "Low-cost family outings (Oct 2026 list)", sec: "X", needs: PLAY_NEEDS, src: OCT, ...o });

/* =============================================================== FOOD ===== */

/* Buncombe and statewide */
food({
  id: "east-asheville-welcome-table-groce", n: "East Asheville Welcome Table (Groce United Methodist)",
  a: "954 Tunnel Rd, Asheville 28805", h: "Thursdays 5-6:15pm", t: "Free, Evening / weekend",
  d: "A free community meal every Thursday evening at Groce United Methodist Church.",
  src: `${FOOD}; also in the ${OCT}`,
});
food({
  id: "uate-feed-the-people-wednesday", n: "UATE Feed the People free dinner (West Asheville)",
  a: "Corner of Oakwood St and Haywood Rd, West Asheville", h: "Wednesdays 6-7:30pm", t: "Free, Evening / weekend",
  needs: ["VIII:*", "VIII:5a", "VIII:12a"],
  d: "A free hot dinner every Wednesday with a vegetarian option (the guide marks 6-7:30pm as a new time). Harm "
    + "reduction supplies, masks and tests, clothes and other supplies are handed out too.",
});
food({
  id: "wecan-community-garden", n: "WECAN community garden (West Asheville)",
  a: "Corner of Haywood Rd and Jefferson Dr, Asheville",
  d: "A community garden in the guide's Asheville list. The guide gives no hours or rules, so ask before picking.",
});
food({
  id: "feed-a-family-grocery-delivery", n: "Feed A Family: free grocery delivery (NC and SC)",
  w: "feed-a-family.org", t: "Free, Mobile / delivery",
  d: "Free groceries delivered through Instacart to anyone in North or South Carolina, per the guide. The driver's "
    + "license has to match the delivery address, and it takes about a week from sign-up to delivery.",
});
food({
  id: "match-mcdowell-food-box-delivery", n: "MATCH food box delivery (McDowell County)",
  ph: "828-659-5289", t: "Free, Mobile / delivery",
  d: "McDowell Access to Care and Health (MATCH) signs families up for a delivered food box when they cannot get to "
    + "a distribution. Call 828-659-5289 or use the sign-up form linked from the guide.",
});

/* Ashe, Avery, Watauga */
food({
  id: "food-avery-ashe-counties", n: "Free food in Avery and Ashe counties (Newland, Banner Elk, Creston)",
  a: "Several sites, listed below",
  d: "Foscoe Home Team, 10543 NC-105 Suite 4, Banner Elk: Tue-Fri 10am-4pm, Sat 11am-3pm; bring a valid ID showing "
    + "you live in Avery, Watauga or Ashe County; free masks in its take-what-you-need box. Feeding Avery Families, "
    + "189 Old Vale Rd, Newland, 828-783-8506: Fridays 9:30-11:30am and 12:30-2:30pm. Reaching Avery Ministry (RAM), "
    + "147 New Vale Rd, Newland, 828-733-5127: Mon-Fri 10am-4pm. Loving Hands Ministry, 1824 Elk Park Hwy, Newland: "
    + "Mondays and Wednesdays 10am-2pm. Produce boxes in Creston, 11719 NC-88: Tue, Wed and Thu 9am-12pm. Free masks "
    + "at Valle Crucis Community Park's Little Free Library, 2892 Broadstone Rd, Banner Elk.",
});
food({
  id: "food-supplies-boone-watauga", n: "Free food, supplies and masks in Boone (Watauga County)",
  a: "Several sites, listed below", em: "highcountrymutualaid4@gmail.com",
  needs: ["VIII:*", "VIII:5a", "VIII:12a", "VIII:11a"],
  d: "High Country Mutual Aid free store: hygiene products, pads and tampons, baby diapers and wipes, covid masks and "
    + "tests, clothes, blankets and shoes (email highcountrymutualaid4@gmail.com). Boone Unitarian Universalist Little "
    + "Free Library and free pantry, 381 E King St, also has masks and tests. Crop & Trade Co-op, 1773 NC-194, was "
    + "opening a free fridge in October and has masks and tests. Free masks at High Country Community Health (935 "
    + "State Farm Rd and 240 NC-105 Ext #100) and the Little Free Library in Clawson-Burnley Park, 2355 M.L.K. Jr. St.",
});

/* Haywood */
food({
  id: "fumc-waynesville-pantry-saturday-meal", n: "First United Methodist Waynesville food pantry and Saturday free meal",
  ph: "828-456-9475", a: "566 S Haywood St, Waynesville 28786", h: "Free meal and pantry Saturdays 9-11am",
  t: "Free, Evening / weekend",
  d: "A church food pantry, plus a free meal and pantry every Saturday morning.",
});
food({
  id: "grace-episcopal-waynesville-pantry", n: "Grace Episcopal Church food pantry (Waynesville)",
  ph: "828-456-6029", a: "394 N Haywood St, Waynesville 28786 (in the driveway off Miller St)",
  d: "Church food pantry; the guide gives no hours, so call first.",
});
food({
  id: "bethel-rural-community-pantry", n: "Bethel Rural Community Pantry (Waynesville)",
  ph: "828-246-4747", a: "664 Sonoma Rd, Waynesville 28786",
  d: "Community food pantry; the guide gives no hours, so call first.",
});
food({
  id: "open-door-waynesville", n: "Open Door (Waynesville)",
  ph: "828-452-3846", a: "Commerce St, Waynesville 28786",
  d: "Listed in the guide's Waynesville food section, with no hours or details; call first.",
});
food({
  id: "holy-cow-food-truck-haywood", n: "Holy Cow Food Truck free hot meals (Waynesville and Cruso)",
  w: "haywoodpathwayscenter.org", a: "179 Hemlock St, Waynesville; Cruso UMC, 11653 Cruso Rd, Canton",
  h: "Waynesville Tue-Sat 6:30-7:30pm; Cruso Tuesdays 4:30-6:30pm", t: "Free, Evening / weekend",
  d: "Free hot meals from a food truck linked to Haywood Pathways Center: Tuesday to Saturday evenings on Hemlock St "
    + "in Waynesville, and Tuesday evenings at Cruso United Methodist.",
});
food({
  id: "canton-food-pantries", n: "Food pantries in Canton (Beulah Baptist, Feeding the Multitudes, The Community Kitchen)",
  a: "Several sites, listed below",
  d: "The Community Kitchen, 143 Pandora Circle Rd: food pantry Mon-Fri 10am-3pm. Beulah Baptist Church food pantry, "
    + "483 Sunset Circle, 828-648-6505. Feeding the Multitudes, 50 Azalea Dr, 828-276-6375. Call the last two for hours.",
});
food({
  id: "clyde-food-pantries", n: "Food pantries in Clyde (Little Pantry That Could, Clyde's Cupboard)",
  a: "Several sites, listed below",
  d: "Haywood's Little Pantry That Could, 384 Jones Cove Rd, Clyde, 828-550-6884. Clyde's Cupboard at Haywood "
    + "Community College, 185 Freedlander Dr: food and personal care items for students, Mon-Fri 8am-5pm.",
});
food({
  id: "maggie-valley-umc-pantry", n: "Maggie Valley United Methodist food pantry",
  ph: "828-926-8036", a: "4192 Soco Rd, Maggie Valley 28751",
  d: "Church food pantry; call for hours.",
});
food({
  id: "mountain-projects-congregate-meals", n: "Mountain Projects congregate meals (age 60+, Waynesville and Maggie Valley)",
  a: "44 Boundary St, Waynesville; 3987 Soco Rd, Maggie Valley", h: "8:30am-12:30pm",
  d: "Meals at no cost for people 60 and older (voluntary contributions welcome); anyone under 60 can eat for $4.53 "
    + "a meal. Useful for grandparents raising grandchildren.",
});
food({
  id: "haywood-little-free-pantries", n: "Haywood County little free pantries (Waynesville, Canton, Maggie Valley)",
  a: "Several sites, listed below", t: "Free, 24/7",
  d: "Take-what-you-need pantry boxes, as the guide lists them. Waynesville: Bethel Grocery Pantry, 5692 Pigeon Rd "
    + "(next to the building); Big Blue Pantry, 80 Willow Rd; Crabtree UMC, 5405 Crabtree Rd (back of the parking "
    + "lot); Hazelwood Pantry, 114 Robinson St (at Avalon Ct); Pigeon Multicultural Development Center, 450 Pigeon St "
    + "(on the left facing Oakdale Rd); Shady Grove UMC, 3570 Jonathan Creek Rd (by the picnic shelter); Waynesville "
    + "Head Start, 489 Pigeon St; Wellness Porch Pantry, 540 Dellwood Rd (next to the Elks Lodge). Canton: Cruso "
    + "Community Pantry (Why Worry Blvd at Burnette Cove Rd); First United Methodist, 30 Newfound St (back of the "
    + "parking lot); Haywood Pantries Depot, 505 Main St (on the sidewalk); Morningstar UMC, 2535 Dutch Cove Rd "
    + "(across the street). Maggie Valley: Our Place Inn, 4077 Soco Rd (no details in the guide).",
});
food({
  id: "haycopride-little-free-queer-store", n: "HayCo Pride Little Free Queer Store (Waynesville)",
  em: "info@haycopride.com", w: "haycopride.com", a: "Waynesville pickup (location to be announced)",
  needs: ["VIII:*", "VIII:12a", "X:*", "X:9"],
  d: "Free masks, tests and supplies from Haywood County Pride; email for the current pickup spot.",
});
food({
  id: "salvation-army-waynesville", n: "Salvation Army of WNC, Waynesville",
  ph: "828-456-7111", a: "290 Pigeon St, Waynesville 28786", h: "Mon-Fri 8:30am-4:30pm",
  d: `${SA} The guide lists a food pantry for individuals and families.`,
  alt: "Haywood Christian Ministry's community market and pantry, 150 Branner Ave (Mon 12-4pm, Wed 9am-1pm, Fri 11am-4pm).",
});

/* Henderson and Polk */
food({
  id: "hope-umc-east-flat-rock-meal", n: "Hope UMC free hot meal (East Flat Rock)",
  a: "2443 Spartanburg Hwy, East Flat Rock", h: "Tuesdays 4:30-6pm", t: "Free, Evening / weekend",
  d: "A free hot meal every Tuesday evening.",
});
food({
  id: "edneyville-community-food-pantry", n: "Edneyville community food pantry (neighbor choice)",
  a: "3685 Chimney Rock Rd, Hendersonville", h: "Mondays and Thursdays 2-5:30pm",
  d: "Weekly neighbor-choice shopping, so families pick their own food.",
});
food({
  id: "st-marys-drive-food-pantry", n: "Food pantry on St Marys Drive (Hendersonville)",
  a: "186 St Marys Dr, Hendersonville", h: "Thursdays 2-5:30pm",
  d: "A weekly food pantry; the guide does not name the host.",
});
food({
  id: "full-circle-wellness-free-pantry", n: "Full Circle Community Wellness free pantry (Hendersonville)",
  a: "1915 George St, Hendersonville (behind the Blue Ridge Mall)", t: "Free, 24/7",
  d: "A free pantry box behind the Blue Ridge Mall.",
});
food({
  id: "saluda-pantry", n: "Saluda Pantry (Polk County)",
  w: "saludapantry.com", a: "54 Carolina St, Saluda 28773", h: "Tue and Thu 10am-4pm; Sat 10am-1pm",
  d: "Food pantry in Saluda.",
});
add({
  id: "salvation-army-henderson-polk-transylvania", n: "Salvation Army of Henderson, Polk and Transylvania Counties",
  ph: "828-693-4181 (Hendersonville) / 828-862-6518 (Brevard)", em: "HendersonvilleNC@uss.salvationarmy.org",
  w: "southernusa.salvationarmy.org/henderson-polk-transylvania",
  a: "239 3rd Ave E, Hendersonville 28792; 126 N Caldwell St, Brevard 28712",
  h: "Food pantry Mon-Fri 9:30am-12pm; social services Mon-Fri 8:30am-12pm and 1-4pm",
  os: "Community financial list (Oct 2026)", t: "",
  needs: ["VIII:*", "VIII:5a", "VIII:6a", "VIII:14a"],
  d: `${SA} Food pantry, emergency help with rent and utilities, and Christmas help.`,
  src: `${FIN}; food pantry hours and Brevard site from the ${FOOD}`,
  alt: "In Henderson County, IAM (828-697-7029). In Transylvania, The Sharing House (828-844-2866) or The Bread of Life (828-877-3577).",
});

/* Macon */
food({
  id: "smoky-mountain-harm-reduction-franklin", n: "Smoky Mountain Harm Reduction (Franklin)",
  a: "3261 Georgia Rd, Franklin", needs: ["VIII:*", "VIII:5a", "VIII:13a"],
  d: "Free hot meals, pantry staples, produce boxes and household supplies.",
});
food({
  id: "little-queer-pantry-franklin", n: "Little Queer Pantry (Franklin)",
  a: "39 Phillips St, Franklin", needs: ["VIII:*", "VIII:5a", "X:*", "X:9"],
  d: "A free food pantry for the LGBTQ+ community.",
});

/* Madison */
food({
  id: "barnard-supply-hub-marshall", n: "Barnard Supply Hub (Marshall)",
  a: "23 Barnard Church Rd, Marshall 28753", h: "Thursdays and Fridays",
  d: "A weekly supply hub in Madison County; the guide gives no times, so check before going.",
});

/* McDowell */
food({
  id: "giving-goods-hub-marion", n: "Giving Goods Hub distribution center (Marion)",
  ph: "828-460-2461", a: "334 AB Elliott Rd, Marion",
  d: "Call 828-460-2461 for an appointment. The guide says they might be able to deliver.",
});
food({
  id: "church-of-god-old-fort-food", n: "Church of God food distribution (Old Fort)",
  a: "4900 Greenlee Rd, Old Fort", h: "Thursdays 1-3pm",
  d: "A weekly food distribution.",
});

/* Mitchell */
food({
  id: "food-mitchell-county", n: "Free food in Mitchell County (Spruce Pine and Bakersville)",
  a: "Several sites, listed below",
  d: "Spruce Pine: Mitchell County Shepherd's Staff, 10994 NC-226 S, 828-385-6153 (Mon, Tue, Thu 9am-3pm; Fri "
    + "9am-1pm); Ave Maria Ministries, 679 Summit Ave, 828-898-6900 (Wednesdays 10am-1pm); Pine Grove MANNA Community "
    + "Market, 53 Pine Grove Rd (2nd Monday 12-1:30pm). Bakersville: Bakersville Baptist Church pantry, 339 S "
    + "Mitchell Ave, 828-385-0133 (Tuesdays 3:30-4:30pm); Buladean Community Food Pantry, 12190 NC-226, "
    + "828-385-4495 (Mon and Fri 12-3pm). Centro Latino in Spruce Pine has its own row.",
});
food({
  id: "centro-latino-spruce-pine", n: "Centro Latino, Service Center for Latinos (Spruce Pine)",
  ph: "828-385-2309", a: "431 Oak Ave, Spruce Pine",
  h: "Mobile food 1st Friday 9:30am-12pm (drive-up in the parking lot); office hours 1st Thursday 10-11am",
  needs: ["VIII:*", "VIII:5a", "X:*", "X:10"],
  spd: "A service center for Latinos; the guide does not say which languages staff speak. Ask when you call.",
  d: "A monthly drive-up mobile food distribution and monthly office hours.",
});

/* Rutherford */
food({
  id: "soup-kitchens-rutherford-county", n: "Soup kitchens in Rutherford County (Forest City, Rutherfordton, Mooresboro)",
  a: "Several sites, listed below", t: "Free, Evening / weekend",
  d: "Grace of God Rescue Mission, 537 W Main St, Forest City, 828-245-9141: hot meals Mon-Sat 4-5:30pm. Oak Grove "
    + "Missionary Baptist, 125 Weathers St, Forest City, 828-245-0157: Tuesday soup kitchen. Jericho Road Soup "
    + "Kitchen, 330 N Ridgecrest Ave, Rutherfordton: Wednesdays 10am-12pm. New Beginnings Soup Kitchen, 668 N "
    + "Washington St, Rutherfordton, 828-286-9278: Thursdays 4:30-6pm, take-out only. Harvest House Soup Kitchen, 2938 "
    + "Harris Henrietta Rd, Mooresboro, 828-447-2797: Wednesdays 4-6pm.",
});

/* Jackson */
add({
  id: "united-christian-ministries-jackson", n: "United Christian Ministries of Jackson County (Sylva)",
  ph: "828-586-8228", a: "191 Skyland Dr, Sylva 28779",
  h: "Pantry Mon, Thu, Fri 10am-3pm; Tue 12:30-5pm; Wed 10am-12:30pm",
  os: "Community food guide (Oct 2026)", t: "",
  needs: ["VIII:*", "VIII:5a", "VIII:6a", "VIII:14a"],
  d: "Food pantry, plus financial assistance (the financial list).",
  src: `${FOOD}; financial help from the ${FIN}`,
});
food({
  id: "sylva-food-pantries", n: "More free food in Sylva (The Community Table, Cornbread and Roses)",
  a: "Several sites, listed below",
  d: "The Community Table: food pantry and groceries for home use, Mon, Tue, Thu, Fri 11am-5:30pm, once every two "
    + "weeks (the guide gives no address). Cornbread and Roses Community Pantry, 1294 Savannah Dr: Sundays 12-4pm.",
});

/* Swain */
food({
  id: "restoration-house-bryson-city", n: "Restoration House WNC: pantry and 24/7 Blessing Box (Bryson City)",
  a: "81 Academy St, Bryson City", h: "Pantry Mon, Tue, Thu, Fri 10am-3pm; Wed 1-6pm; Blessing Box and vending machine 24/7",
  t: "Free, 24/7", needs: ["VIII:*", "VIII:5a", "VII:*", "VII:6a"],
  d: "A Blessing Box outside that anyone can take from at any hour, a food pantry, and a free 24/7 public health "
    + "vending machine with healthy snacks, meal kits, hygiene products and recovery resources. It also hosted the "
    + "free haircut clinic on November 17, 2026 (see Events).",
});
food({
  id: "scc-swain-center-food-pantry", n: "SCC Swain Center community food pantry (Bryson City)",
  a: "60 Almond School Rd, Bryson City", h: "Mon-Thu 8am-5pm; Fri 8am-12pm",
  d: "A community food pantry inside Southwestern Community College's Swain Center (listed as SCC Heritage Arts).",
});

/* Yancey */
food({
  id: "food-burnsville-more", n: "More free food in Burnsville (No Empty Tables fridge, Micaville MANNA market)",
  a: "Several sites, listed below",
  d: "No Empty Tables Initiative free fridge, 601 E Main St, Burnsville. Micaville MANNA Community Market, 71 Newdale "
    + "Church Rd, Burnsville: 2nd Wednesday 10-11:30am. Reconciliation House has its own row.",
});

/* ============================================================ MEDICAL ===== */

med({
  id: "nccare360", n: "NCCARE360: ask for help online and get connected",
  w: "nccare360.org", sec: "X", needs: ["X:*", "X:1", "IV:*", "IV:1a"], os: "Community financial list (Oct 2026)",
  d: "North Carolina's statewide referral network for food, housing, utilities, transportation and more. A person can "
    + "send a request through the public form on nccare360.org; with their consent, an NC 211 navigator follows up "
    + "and connects them to a local agency. There is also an anonymous resource search. ABCCM points families to this "
    + "form for help with food, rent and utilities.",
  src: `${FIN} (ABCCM's assistance request form); how it works from an NCCARE360 overview and NCDHHS materials via ${WEB}`,
  alt: "Call or text 211.",
});
med({
  id: "dispensary-of-hope", n: "Dispensary of Hope: free medicines through partner pharmacies",
  w: "dispensaryofhope.org",
  d: "A national charity that supplies donated medicines to partner pharmacies and clinics, which give them free to "
    + "people without prescription coverage. Typical rules are ages 18 to 65, no prescription coverage, and income at "
    + "or below 200% of the poverty level; partners can differ. The community list says to search by zip code on its "
    + "site. A 2024 news report on two new WNC pharmacies showed them filling prescriptions from its stock at no cost; "
    + "ask MAHEC's pharmacy whether it takes part.",
  src: `${MED}; how it works and typical rules from news and health-system reports via ${WEB}`,
  alt: "NC MedAssist mails free medicines to uninsured NC residents: 1-866-331-1348.",
});
med({
  id: "mutual-aid-wellness-collective-clinic", n: "Mutual Aid Wellness Collective free clinic (at 12 Baskets)",
  a: "610 Haywood Rd, Asheville (12 Baskets)", h: "Mon, Tue, Fri 11am-1pm",
  d: "A volunteer free clinic offering wound care, blood pressure checks, first aid and basic care. The community "
    + "list places it at 12 Baskets on Monday, Tuesday and Friday, 11am to 1pm, during the free lunch.",
  src: `${MED}; services from a community resource directory via ${WEB}`,
  note: "A web search did not confirm that it meets at 12 Baskets. Ask 12 Baskets before sending someone.",
});
med({
  id: "asheville-free-clinic-mahec", n: "Asheville Free Clinic (MAHEC primary care, every other Tuesday)",
  h: "Every other Tuesday 1-4pm", t: "Sliding scale, Medicaid",
  d: "Primary care by MAHEC Family Health Centers: wound care, medicine refills, muscle, joint and nerve pain, "
    + "substance use treatment, and chronic conditions such as diabetes, high blood pressure and asthma. It takes "
    + "people without insurance, Medicaid, Medicare and private insurance, and staff help with a sliding-scale "
    + "discount application.",
  note: "The list gives no address, and a web search found nothing on this clinic. Ask MAHEC (828-257-4730) where "
    + "and when it meets before sending someone.",
});
med({
  id: "big-ivy-free-healthcare-barnardsville", n: "Free Healthcare for the Community by the Community (Big Ivy Health, Barnardsville)",
  a: "Barnardsville Fire Department, 100 Dillingham Rd, Barnardsville 28709", h: "Mondays 4:30-7:30pm",
  t: "Free, Evening / weekend", needs: ["VI:*", "VI:1a", "III:*", "III:1a", "VII:*", "VII:1a"],
  d: "Free care from Big Ivy Health: check-ups, well-child visits and sports physicals, blood pressure and blood sugar "
    + "checks, minor illness, injury and skin care, pregnancy tests, depression and anxiety screening, health "
    + "education, chronic disease management and stress support.",
  note: "A web search could not confirm the Monday clinic. Call Big Ivy Community Club (828-626-3438) or the fire "
    + "department first.",
});
med({
  id: "svcm-neighborcare-clinic", n: "SVCM NeighborCare free clinic (Black Mountain)",
  ph: "828-419-0439 (call or text)", w: "svcmblackmountain.org",
  a: "101 N Ridgeway Ave, Black Mountain 28711 (Annex building, top right past the counseling center)",
  h: "Wednesdays 9am-12pm (a 2024 report and a county list add Saturdays 9am-12pm)",
  d: "A free medical clinic from Swannanoa Valley Christian Ministry for people in Black Mountain, Swannanoa, "
    + "Montreat, Ridgecrest and East Asheville with gross income under 250% of the poverty level. Walk-ins are okay, "
    + "but an appointment is preferred; online scheduling is on SVCM's NeighborCare page. Health Ridge Pharmacy fills "
    + "its prescriptions.",
  src: `${MED}; eligibility, Saturday hours and pharmacy from a January 2024 Valley Echo report and a Buncombe County resource list via ${WEB}`,
  note: "The phone number is only in the community list. Hours differ: Wednesday only (Oct 2026 list) or Wednesday "
    + "and Saturday (2024 report, county list).",
});
med({
  id: "buladean-health-clinic", n: "Buladean Health Clinic (Mitchell County)",
  a: "12190 NC-226, Bakersville 28705", h: "Mon, Tue, Thu, Fri 8am-2pm", t: "",
  d: "A health clinic at the same address as the Buladean Community Food Pantry.",
  note: "A web search found no listing for this clinic; call before sending someone.",
  alt: "Bakersville Community Health Center, 86 N Mitchell Ave, Bakersville (828-688-2104, per health directories).",
});
med({
  id: "pansy-collective-test-strips", n: "Pansy Collective: free drug test strips (Asheville)",
  em: "pansycollective@proton.me", w: "linktr.ee/pansyasheville", sec: "VII", needs: ["VII:*", "VII:6a"],
  d: "Free drug-checking test strips from a local harm reduction collective. Email or see the link page for pickup.",
  alt: "WNCAP, 554 Fairview Rd (828-252-7489), or The Steady Collective's mobile sites (see the harm reduction row).",
});
med({
  id: "black-mountain-counseling-center", n: "Black Mountain Counseling Center (sliding scale)",
  ph: "828-669-9798", w: "blackmountaincounseling.org", t: "Sliding scale",
  sec: "VII", needs: ["VII:*", "VII:1a", "VII:2a", "VII:5a"],
  d: "Nonprofit counseling for individuals and families regardless of ability to pay, with offices in Black Mountain "
    + "and Old Fort and online sessions for Buncombe and McDowell residents. The sliding scale is a suggestion: the "
    + "fee is agreed between the client and the counselor.",
  src: `${MED}; phone, offices and fee approach from the center's own pages and its Asheville Chamber listing via ${WEB}`,
});
med({
  id: "the-free-clinics-hendersonville", n: "The Free Clinics (Hendersonville)",
  ph: "828-697-8422", w: "thefreeclinics.org", a: "841 Case St, Hendersonville 28792",
  h: "Medical clinic Tuesday evenings, walk-in; psychiatric clinic 1st and 3rd Tuesdays",
  needs: ["VI:*", "VI:1a", "VII:*", "VII:3a"], lv: "2026-11-17", vb: "SB (web search)",
  d: "A free walk-in medical clinic every Tuesday evening for non-emergency care, with case management and follow-up. "
    + "A psychiatric clinic runs on the 1st and 3rd Tuesdays (walk-in or appointment). Eligibility screening happens "
    + "at the Tuesday clinics. The building is the third on the left after turning onto Case St, near Upward Rd and "
    + "Spartanburg Hwy.",
  src: `${MED}; phone, address, hours and directions from The Free Clinics' own site via ${WEB}`,
  note: "Start time differs: 5pm on its hours page, 4pm in the community list and an older events page. Call to check.",
});
med({
  id: "medical-loan-closet-henderson", n: "Medical Loan Closet of Henderson County",
  ph: "828-692-9005", w: "medicalloancloset.org", a: "1225 Seventh Ave E, Hendersonville 28792",
  h: "Tuesdays and Fridays 12:30-4:30pm", needs: ["VI:*", "VIII:*", "VIII:11a"],
  d: "Free loans of medical equipment such as wheelchairs, walkers, hospital beds, knee scooters, shower chairs and "
    + "tub benches, plus a free shelf of adult incontinence and other medical supplies.",
  src: `${MED}; equipment list, phone and website from a Hendersonville Magazine listing via ${WEB}`,
  note: "Helene damaged the building, one map listing shows it closed, and another directory gives 828-693-9005. "
    + "Call before sending anyone.",
});
med({
  id: "swain-county-health-department", n: "Swain County Health Department (Bryson City)",
  ph: "828-488-3198", w: "swaincountync.gov/health-department", a: "545 Center St, Bryson City 28713",
  h: "Mon-Fri 7:30am-4:30pm, closed 12-1pm", t: "Walk-in", lv: "2026-11-17", vb: "SB (web search)",
  needs: ["VI:*", "VI:1a", "III:*", "III:1a"],
  d: "Walk-ins welcome, per the community list: immunizations, lab draws, drug screens, STD testing, pregnancy "
    + "testing, injections, A1C checks and TB skin tests.",
  src: `${MED}; phone, address and hours from the county's health department page via ${WEB}`,
  note: "Other county and CDC listings give 7:45am-4:45pm and say appointments are needed; call first.",
});
med({
  id: "blue-ridge-free-dental-clinic", n: "Blue Ridge Free Dental Clinic (Cashiers)",
  ph: "828-743-3393", w: "brfdc.org", a: "130 Hwy 64 E, Cashiers 28717", needs: ["VI:*", "VI:1a", "III:*", "III:3a"],
  d: "Free dental care for people who cannot otherwise afford it, serving Jackson, Macon, Swain and Transylvania "
    + "counties. Call for scheduling.",
  src: `${MED}; phone and address also in Cashiers chamber and dental directories via ${WEB}`,
  note: "A Laurel Magazine article lists Macon, Jackson and Transylvania only; ask whether Swain is still served.",
});
med({
  id: "mission-childrens-toothbus", n: "Mission Children's Dental Outreach and the ToothBus",
  ph: "828-213-1700", sec: "III", needs: ["III:*", "III:3a"], t: "Kids / 0-5",
  d: "School-based dental care from Mission Children's Hospital: the ToothBus visits elementary schools, with consent "
    + "forms sent home through teachers and a treatment letter after each visit. Ask the child's school whether it "
    + "comes there.",
  src: `${MED}; how it works from a 2013 Mission Children's Dental presentation via ${WEB}`,
  note: "A web search found only a 2013 description (five WNC counties, 25 elementary schools) and could not confirm "
    + "the phone or that it still runs.",
  alt: "Children's dental at WNC Community Health Services stays open to new child patients (828-285-0622).",
});
med({
  id: "wnc-mask-bloc", n: "WNC Mask Bloc: free covid tests and masks",
  em: "wncmaskbloc@proton.me", w: "linktr.ee/wncmaskbloc",
  d: "Free covid tests and masks, and sometimes free mobility aids. Pickup hubs with masks and tests include Firestorm "
    + "Books (1022 Haywood Rd, Asheville), Swannanoa Communities Together's free fridge and pantry (2121 US 70), "
    + "Watauga County Public Library (140 Queen St, Boone) and the Boone sites in the Boone row; message the Mask Bloc "
    + "for the Waynesville pickup address.",
});
med({
  id: "buncombe-public-health-mobile-team", n: "Buncombe County Public Health mobile team (pop-up clinics)",
  w: "buncombecounty.org/governing/depts/health/mobile-team.aspx",
  d: "The county's Public Health on Wheels unit holds pop-up clinics: vaccines and vaccine record reviews, rapid HIV "
    + "and hepatitis C testing, and free Tdap, covid, flu and hepatitis A shots at community care sites. The current "
    + "schedule is on the county page.",
  src: `${MED} ("Buncombe Clinic Popup", see link for dates); services and page from a WNC Times article and a Buncombe County resource list via ${WEB}`,
  note: "The community list's link did not survive the copy; this is the county pop-up clinic a web search found, so "
    + "check that it is the one meant.",
});

/* ========================================================== FINANCIAL ===== */

add({
  id: "biltmore-umc-rent-relief", n: "Biltmore United Methodist Church rent relief",
  ph: "828-274-2379", a: "376 Hendersonville Rd, Asheville 28803",
  os: "Community financial list (Oct 2026)", t: "", needs: ["VIII:*", "VIII:6a"],
  d: "Very limited rent relief, sometimes as a forgivable loan, on a couple of days a month, by appointment.",
  src: `${FIN}; how it helps from a bill-help directory via ${WEB}`,
  note: "In 2021 the congregation voted to sell this property, and a web search could not confirm it still meets or "
    + "helps here. Call first. Dial carefully: Foster Adventist across the road is 828-274-2014.",
  alt: "Buncombe DSS emergency assistance (828-250-6330), Eblen Charities (828-255-3066) or ABCCM Crisis Ministry (828-259-5300).",
});

/* ============================================================ HOLIDAY ===== */

const HOL = ["VIII:*", "VIII:10a", "X:*", "X:12"];
add({
  id: "arc-operation-santa", n: "Operation Santa (The Arc of Buncombe County)",
  ph: "828-253-1255", w: "arcofbc.org/operationsanta", os: "Holiday help", t: "Free, Kids / 0-5",
  sec: "VIII", needs: HOL,
  d: "The Arc's Christmas gift program, funded mostly by individual donations. The Arc serves people with "
    + "intellectual and developmental disabilities and their families. The 2026 sign-up was not published online when "
    + "checked (17 Nov 2026); call The Arc to ask who qualifies and how to apply.",
  src: `${FIN} (holiday list); funding from an Urban News article via ${WEB}`,
});
add({
  id: "svcm-johnny-raines-christmas-cheer", n: "Johnny Raines Christmas Cheer (Swannanoa Valley Christian Ministry)",
  ph: "828-669-9404", w: "svcmblackmountain.org/johnny-raines-christmas-program", os: "Holiday help",
  t: "Free, Kids / 0-5", sec: "VIII", needs: HOL,
  d: "Christmas gifts for local families whose budgets do not stretch to Christmas, per SVCM's own page. SVCM serves "
    + "East Asheville (Oteen and east of the VA hospital), Swannanoa, Black Mountain, Montreat and Ridgecrest. 2026 "
    + "sign-up details were not online when checked (17 Nov 2026), so call SVCM.",
  src: `${FIN} (holiday list and SVCM service area); program description from SVCM's own giving page via ${WEB}`,
});
add({
  id: "hearts-with-hands-hope-for-the-holidays", n: "Hope for the Holidays (Hearts with Hands)",
  w: "heartswithhands.org/holidays", os: "Holiday help", t: "Free, Kids / 0-5", sec: "VIII", needs: HOL,
  d: "A holiday gift event from Hearts with Hands, a disaster relief group. In 2025 it filled up and took a waitlist "
    + "(name, email and phone). 2026 details were not online when checked (17 Nov 2026).",
  src: `${FIN} (holiday list); 2025 waitlist from the Hearts with Hands form and a Buncombe school holiday list via ${WEB}`,
  note: "Full in 2025. Offer Eblen, ABCCM or a Toys for Tots partner alongside it.",
});
add({
  id: "usps-operation-santa", n: "USPS Operation Santa: letters to Santa that people can adopt",
  w: "uspsoperationsanta.com", os: "Holiday help", t: "Free, Kids / 0-5", sec: "VIII", needs: HOL,
  d: "Children write to Santa Claus, 123 Elf Rd, North Pole 88888. Letters postmarked by December 5, 2026 can be "
    + "adopted by vetted members of the public, who ship gifts by December 12. No account is needed to write a "
    + "letter, but adoption is not guaranteed: treat it as a bonus, not the plan.",
  src: `${FIN} (holiday list); 2026 dates and rules from national news reports on the program via ${WEB}`,
});

/* ============================================ OUTINGS, MEALS, CLASSES ===== */

add({
  id: "valley-hope-church-community-meal", n: "Valley Hope Church free community meal (Swannanoa) / comidas comunitarias gratuitas",
  a: "115 Rockdale Ave, Swannanoa", h: "Mondays 5:30-6:30pm", os: "Community food guide (Oct 2026)",
  t: "Free, Evening / weekend", needs: FOOD_NEEDS,
  spd: "Its listing is bilingual (\"Comidas comunitarias gratuitas\"); ask whether Spanish speakers serve.",
  d: "A free community meal every Monday evening.",
  src: `${OCT}; address from the directory's Food by day schedule (v19 workbook)`,
});
add({
  id: "beacon-community-center-english-class", n: "Free beginner English class and Zumba (Beacon Community Center, Swannanoa)",
  a: "Beacon Community Center, 216 Whitson Ave, Swannanoa",
  h: "English usually Fridays 5:30-7pm; Zumba Mondays 6:30pm (October 2026)", os: "Low-cost family outings (Oct 2026 list)",
  sec: "V", needs: ["V:*", "V:2a", "X:*", "X:10"],
  d: "A free beginner English class (bring a notebook), weekly in October 2026, mostly on Fridays, and a free Zumba "
    + "class on Monday evenings.",
  src: `${OCT}; street address from the Bounty & Soul row`,
});
outing({
  id: "hands-on-childrens-museum-hendersonville", n: "Hands On! Children's Museum (Hendersonville): free with WIC or EBT",
  a: "318 N Main St, Hendersonville", h: "Tue-Sat 9am-5pm", t: "Kids / 0-5",
  needs: ["X:*", "X:11", "I:*", "I:11a"],
  d: "A hands-on museum for young children. $12 adults and children, $4 infants (one day listed $10); free for "
    + "members and for families using WIC or EBT. Also a Buncombe library ZOOM Pass partner.",
});
outing({
  id: "museums-for-all-wnc", n: "Museums for All: cheap or free museum entry with EBT or WIC",
  w: "museums4all.org", t: "Kids / 0-5",
  d: "Museums in the Museums for All program give reduced entry with an EBT card; museums4all.org lists them. Near "
    + "here: Hands On! Children's Museum in Hendersonville (free with WIC or EBT), the Asheville Museum of Science and "
    + "the Asheville Art Museum (see their rows), and the American Museum of the House Cat in Sylva ($3; children "
    + "under 6 free).",
});
outing({
  id: "free-museums-hendersonville", n: "Free museums in downtown Hendersonville",
  a: "Several sites, listed below",
  d: "All free or by donation. Henderson County Heritage Museum, 1 Historic Courthouse Square: Wed-Sat 10am-5pm, Sun "
    + "1-5pm. WNC Air Museum, 1240 Gilbert St: Wed 10am-5pm, Sat and Sun 12-5pm. Mineral & Lapidary Museum, 400 N "
    + "Main St: Wed-Fri 1-5pm, Sat 10am-5pm (closed Mondays and Tuesdays in winter). Apple Valley Model Railroad Club "
    + "at the historic train depot: Wed 1-3pm, Sat 10am-2pm.",
});
outing({
  id: "carl-sandburg-home-flat-rock", n: "Carl Sandburg Home National Historic Site (Flat Rock)",
  a: "Flat Rock", h: "Barns daily 10am-4pm; visitor center Tue-Sun 9am-5pm",
  d: "Free grounds and barns, open daily, and a visitor center. House tours (Tue-Sun 11am-3pm on the hour) cost extra.",
});
outing({
  id: "beaver-lake-bird-sanctuary", n: "Beaver Lake Bird Sanctuary (North Asheville)",
  a: "1056 Merrimon Ave, Asheville", h: "Dawn to dusk",
  d: "A free bird sanctuary and boardwalk; no pets, and the parking lot gate is on a timer.",
});
outing({
  id: "center-for-craft-asheville", n: "Center for Craft (downtown Asheville)",
  a: "67 Broadway St, Asheville", h: "Mon-Sat 10am-6pm",
  d: "Free craft exhibits; register online before visiting.",
});
outing({
  id: "asheville-museum-of-history", n: "Asheville Museum of History (Smith-McDowell House)",
  a: "283 Victoria Rd, Asheville (A-B Tech campus)", h: "Wed-Sat 11am-5pm", t: "",
  d: "Suggested donation $10 adults, $6 youth 7 to 17, military and college students; free for children 6 and under, "
    + "members and A-B Tech students and staff. NC residents get in free on the first Wednesday of the month.",
});
outing({
  id: "vance-birthplace-weaverville", n: "Vance Birthplace State Historic Site (Weaverville)",
  a: "Weaverville", h: "Tue-Sat 9am-5pm",
  d: "Free self-guided tours (donations welcome). Guided tours are $2 ages 18 to 64 and military, $1 ages 65+ and 3 "
    + "to 17, free under 3.",
});
outing({
  id: "thomas-wolfe-memorial", n: "Thomas Wolfe Memorial State Historic Site (downtown Asheville)",
  a: "N Market St, Asheville", h: "Tue-Sat 9am-5pm; tours at half past each hour", t: "",
  d: "House tours: $5 adults, $4 seniors 65+ and military, $1 ages 3 to 17, free 2 and under.",
});
outing({
  id: "mountain-gateway-museum-old-fort", n: "Mountain Gateway Museum and Heritage Center (Old Fort)",
  a: "78C Catawba Ave, Old Fort", h: "Tue-Sat 10am-5pm",
  d: "A free regional history museum.",
});
outing({
  id: "kid-senses-museum-rutherfordton", n: "KidSenses Children's Museum (Rutherfordton)",
  a: "172 N Main St, Rutherfordton", h: "Tue-Sat 9am-5pm (1st Friday until 8pm)", t: "Kids / 0-5",
  d: "A children's museum: $10 ages 1 to 61, $7.48 ages 62+ and active military, free for members.",
});
outing({
  id: "splasheville-pack-square", n: "Splasheville splash pad (Pack Square Park)",
  a: "Pack Square Park, Asheville", h: "Warm months; closes for the season in fall",
  d: "A free splash pad downtown. It closes early for special events.",
});
outing({
  id: "free-skate-parks-wnc", n: "Free skate parks (Asheville, Black Mountain, Waynesville, Hendersonville)",
  a: "Several sites, listed below", h: "Dawn to dusk",
  d: "Free, dawn to dusk: 50 Cherry St N, Asheville; 101 Carver Ave, Black Mountain; 285 Vance St, Waynesville; Patton "
    + "Park, Hendersonville. Tannery Skate Park on Silversteen Dr in Brevard is open 9am-5pm.",
});
outing({
  id: "family-basketball-stephens-lee", n: "Free family basketball (Stephens-Lee Community Center)",
  a: "Stephens-Lee Community Center, Asheville", h: "Saturdays 11am-1pm",
  d: "Free open basketball for families on Saturday late mornings.",
});
outing({
  id: "buncombe-library-wifi", n: "Free Wi-Fi at Buncombe County libraries (24/7)",
  sec: "X", needs: ["X:*", "X:5"], h: "24/7", os: "Low-cost family outings (Oct 2026 list)",
  d: "The libraries' guest Wi-Fi works around the clock, including from the parking lot: network LibraryGuest, "
    + "password readmore.",
});

/* ===================================================== PATCH EXISTING ===== */

patch("free-firewood-wnc", (r) => {
  lacks(r, "d", "Spring Creek");
  append(r, "d", "Spring Creek Community Center (13075 NC 209 Hwy, Hot Springs) has a woodshed, and ROAR in Marshall "
    + "gives propane vouchers on Saturdays 10am-4pm (see its row). Grandfather Ranger District (Avery, Burke, Caldwell, "
    + "McDowell and Watauga): 828-652-2144.");
  append(r, "src", `Spring Creek, ROAR propane and Grandfather Ranger District from the ${FOOD}`);
});
patch("madco-herbal-collective-free-herbal-pantry-m", (r) => {
  if (r.d !== "MadCo Herbal Collective free herbal pantry (Marshall, 1st/3rd Thursdays).") throw new Error("madco d changed");
  fill(r, "a", "Ginny Lou's, 74 S Main St, Marshall 28753");
  fill(r, "h", "Free herbal pantry 1st and 3rd Thursdays 1-4pm; medicine making 2nd Thursday 1-4pm (fall and winter 2025-26)");
  r.d = "A free herbal pantry inside Ginny Lou's in downtown Marshall, plus medicine-making afternoons.";
  r.note = "The medical list puts medicine making on the 2nd Thursday; the food guide says the 3rd. Ask before going.";
  append(r, "src", `place and hours from the ${MED} and the ${FOOD}`);
});
patch("swannanoa-communities-together", (r) => {
  fill(r, "ph", "828-423-5727");
  append(r, "d", "The financial list gives rent and utility help for east Asheville to Ridgecrest, at 828-423-5727.");
  append(r, "src", `phone and service area from the ${FIN}`);
});
patch("catholic-charities", (r) => {
  lacks(r, "d", "211");
  append(r, "d", "For help with rent, mortgage or utilities, the Asheville office sends people to NC 211 (2-1-1 or "
    + "1-888-892-1162), per the October 2026 financial list.");
  append(r, "src", `rent and utility routing from the ${FIN}`);
});
patch("foster-adventist-church", (r) => {
  lacks(r, "d", "ext. 303");
  append(r, "d", "The financial list gives 828-274-2014 ext. 303 for help.");
  append(r, "src", `extension from the ${FIN}`);
});
patch("the-arc-of-buncombe-county", (r) => {
  lacks(r, "d", "crisis");
  append(r, "d", "It also helps people with intellectual and developmental disabilities and their families through a "
    + "housing, medical, transportation or utility crisis, and runs Operation Santa at Christmas (see that row).");
  append(r, "src", `crisis help from the ${FIN}`);
});
patch("abccm-crisis-ministries", (r) => {
  lacks(r, "d", "NCCARE360");
  append(r, "d", "ABCCM's request form for food, rent, utilities, mortgage, clothing and furniture help is on "
    + "NCCARE360 (see that row).");
  append(r, "note", "The October 2026 financial list gives ABCCM's address as 1845 Brevard Rd, Arden (a chamber "
    + "listing agrees) and a North Buncombe number of 828-645-6141 at 403 Weaverville Hwy, not 828-259-5303. Confirm "
    + "which is current.");
  append(r, "src", `NCCARE360 form, Arden address and North phone from the ${FIN}; chamber listing via ${WEB}`);
});
patch("abccm-medical-ministry", (r) => {
  fill(r, "em", "medical@abccm.org");
  append(r, "d", "The October 2026 medical list adds: walk-in clinic Mon-Thu 9-11am and Monday 2-4pm; staff take "
    + "calls Mon-Thu 9am-6pm, mornings are best for visits and refills. Dental is Friday 8:30am-12pm by appointment, "
    + "booked from 9am Monday. The clinic pharmacy at 155 Livingston St is open weekdays 9am-1pm, plus Monday 2-6pm "
    + "and Tuesday 5:30-6pm; refill line 828-398-6687. ABCCM 356 Pharmacy, 356 Biltmore Ave Suite 205 "
    + "(828-259-5306): Mon-Wed 1-5pm, Thu 9am-1pm.");
  append(r, "note", "Hours differ: this row's Wednesday 9am-1pm against the list's Mon-Thu 9am-6pm call hours.");
  append(r, "src", `walk-in, dental, pharmacy hours, email and refill line from the ${MED}`);
});
patch("nc-medassist", (r) => {
  fill(r, "em", "info@medassist.org");
  append(r, "d", "Office and pharmacy Mon-Fri 8am-4:30pm (pharmacy 704-943-9639). Its OTC Free Store is in "
    + "Charlotte (4428 Taggart Creek Rd, Suite 101; Mon, Wed, Fri 10am-12:30pm and 1:30-3:30pm; 704-350-3587).");
  append(r, "src", `hours, email, pharmacy line and OTC Free Store from the ${MED}`);
});
patch("wnc-community-health-services-minnie-jones-h", (r) => {
  append(r, "note", "The October 2026 medical list gives 356 Biltmore Ave, the same address it gives for ABCCM's 356 "
    + "Pharmacy; this row keeps 257.");
  append(r, "d", "New patients can also send the online request form and hear back in 1 to 3 business days; "
    + "interpretation is free.");
  append(r, "src", `request form and interpretation from the ${MED}`);
});
patch("ahope-day-center-homeward-bound", (r) => {
  lacks(r, "d", "rental help");
  append(r, "d", "The October 2026 financial list also names Homeward Bound (828-252-8883, homewardboundwnc.org/get-help) "
    + "for short-term rental help.");
  append(r, "src", `short-term rental help from the ${FIN}`);
});
patch("community-action-opportunities-weatherizatio", (r) => {
  append(r, "note", "The October 2026 financial list lists Community Action Opportunities for utility help at "
    + "828-250-0410, a different number from this row's.");
  append(r, "src", `utility help line from the ${FIN}`);
});
patch("bounty-soul", (r) => {
  lacks(r, "d", "Zumba");
  append(r, "d", "The October 2026 low-cost list adds free Zumba with Bounty & Soul on Tuesdays and Thursdays "
    + "6:30-7:30pm at St. James Episcopal Church, Black Mountain, and free kids' soccer skills (ages 6 to 14, Swannanoa "
    + "Valley, registration) on Tuesdays 5:30-7pm at Grovemont Park.");
  append(r, "src", `Zumba and kids' soccer from the ${OCT}`);
});
patch("iam-pantry-hendersonville", (r) => {
  fill(r, "ph", "828-697-7029");
  fill(r, "em", "interfaith@iam-hc.org");
  append(r, "d", "IAM also gives financial help (iam-hc.org/get-help); the mobile pantry schedule is at "
    + "iam-hc.org/mobile-pantry.");
  append(r, "src", `phone, email and financial help from the ${FIN}`);
});
patch("buncombe-library-zoom-pass", (r) => {
  lacks(r, "d", "Haywood");
  append(r, "d", "Other counties' libraries have their own passes: Haywood (haywoodlibrary.org/828/Zoom-Pass), Henderson "
    + "(hendersoncountync.gov/library/page/zoom-pass), McDowell (mcdowellpubliclibrary.org/zoom-pass), Transylvania "
    + "(library.transylvaniacounty.org/zoom), Rutherford, Polk and Madison.");
  append(r, "src", `other counties' passes from the ${OCT}`);
});
patch("holiday-assistance", (r) => {
  lacks(r, "d", "Operation Santa");
  append(r, "d", "Also: The Arc's Operation Santa, SVCM's Johnny Raines Christmas Cheer for the Swannanoa Valley, Hearts "
    + "with Hands' Hope for the Holidays (full in 2025, with a waitlist) and USPS Operation Santa letters (postmarked by "
    + "December 5); each has its own row.");
  append(r, "src", `more programs from the ${FIN}, checked via ${WEB}`);
});

res.file.meta.count = list.length;
res.file.meta.sources.push("Community food, medical and financial lists and the October 2026 low-cost list, 17 Nov 2026 (see scripts/apply-community-guides-2026-11-17.mjs)");
save(res);

/* ============================================================= EVENTS ===== */

const ev = load("events.json");
const hair = ev.file.events.find((e) => e.id === "restoration-house-haircuts-2026-11-17");
if (!hair || hair.rid) throw new Error("haircut event missing or already linked");
hair.rid = "restoration-house-bryson-city";
const santa = {
  id: "usps-operation-santa-letters-2026-12-05", date: "2026-12-05", kind: "deadline",
  what: "USPS Operation Santa: letters postmarked by today can be adopted",
  detail: "Children's letters to Santa Claus, 123 Elf Rd, North Pole 88888, postmarked by December 5 can be adopted "
    + "by vetted members of the public. Adoption is not guaranteed.",
  ph: "", w: "uspsoperationsanta.com", rid: "usps-operation-santa",
  src: `${FIN} (holiday list); 2026 dates from national news reports via ${WEB}`,
};
if (ev.file.events.some((e) => e.id === santa.id)) throw new Error("event exists");
ev.file.events.push(clean(santa));
save(ev);

/* ========================================================== CHANGELOG ===== */

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift(clean({
  date: "Nov 17 2026",
  what: "Community food, medical and financial lists, and free family outings",
  detail: `${added.length} new rows and ${patched} rows updated. Food: the rest of the WNC Free Food guide, by county `
    + "(Haywood, Henderson, McDowell, Madison, Mitchell, Rutherford, Jackson, Swain, Yancey, Macon and the High "
    + "Country), plus Asheville's East Asheville Welcome Table and UATE Feed the People. Medical: SVCM NeighborCare, "
    + "The Free Clinics, Black Mountain Counseling Center, Blue Ridge Free Dental, Dispensary of Hope and more. Money "
    + "and holidays: NCCARE360, The Arc's Operation Santa, SVCM's Christmas Cheer, Hearts with Hands and USPS "
    + "Operation Santa. Outings: Hands On! (free with WIC or EBT), Museums for All, free museums and more. Salvation "
    + "Army rows say Skylar does not refer there first. NC HOPE is left out because it has been closed since 2022.",
  source: "scripts/apply-community-guides-2026-11-17.mjs",
}));
save(cl);
console.log(`added ${added.length} rows, patched ${patched}, total ${list.length}`);
