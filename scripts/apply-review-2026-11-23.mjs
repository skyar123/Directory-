/*
 * Review of 23 Nov 2026 (Skylar: "check every resource ... accuracy is key").
 * Run once.
 *
 * 1. Diapers. Babies Need Bottoms gives no diapers to families directly: it
 *    supplies partner agencies (a 2020 county release: it "is not able to
 *    provide diapers directly to individuals"). Its "diaper line",
 *    1-888-892-1162, is NC 211's toll-free number, so the row's call button
 *    called 211 under Babies Need Bottoms' name. The row now says how a family
 *    actually gets diapers and carries no phone of its own. The Register of
 *    Deeds row said "walk-in, take what you need"; the county's announcement
 *    of that partnership says supplies are offered to parents and relatives
 *    who come in for a child's birth certificate, and is undated.
 * 2. Dates that have passed (an audit of every row for dated sign-ups,
 *    events and deadlines before today): past events are taken out, and the
 *    hours line says what is next. Root Cause Farm's "last market of 2026 is
 *    Tuesday, November 25" cannot be right (Nov 25, 2026 is a Wednesday, and
 *    no 2026 end date is published), so it goes.
 * 3. New: the WNC Free Food & Supplies guide (tiny.cc/freeinwnc), which much
 *    of the food data came from but had no row of its own, and the public
 *    free resource Signal group Skylar shared.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const clean = (s) => { if (DASH.test(s)) throw new Error(`dash in: ${s.slice(0, 80)}`); return s; };
const load = (f) => { const path = new URL(`../data/${f}`, import.meta.url); return { path, file: JSON.parse(readFileSync(path, "utf8")) }; };
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const res = load("resources.json");
const list = res.file.resources;
const get = (id) => { const r = list.find((x) => x.id === id); if (!r) throw new Error(`no row ${id}`); return r; };
const swap = (r, k, from, to) => {
  if (!String(r[k] || "").includes(from)) throw new Error(`${r.id}.${k} lacks: ${from.slice(0, 70)}`);
  r[k] = r[k].replace(from, clean(to)).replace(/\s{2,}/g, " ").trim();
};
const addSrc = (r, s) => { r.src = `${String(r.src || "").trim()}; ${clean(s)}`; };
const REVIEW = "review of 23 Nov 2026 (scripts/apply-review-2026-11-23.mjs)";

/* 1. diapers */
const bnb = get("babies-need-bottoms");
if (bnb.ph !== "1-888-892-1162 (diaper line) / 211") throw new Error("BNB phone changed");
bnb.ph = "";
bnb.a = "";
bnb.d = clean("Families cannot get diapers from Babies Need Bottoms directly. It is the regional diaper bank: it supplies "
  + "partner agencies, and families pick diapers up there. Partners have included MANNA mobile markets, ABCCM, Helpmate, "
  + "YWCA MotherLove, BEAR Closets and Children First/CIS sites. To find the nearest partner, call 211 (or 1-888-892-1162, "
  + "NC 211's toll-free line) or use nc211.org. Serves children 0-3 across Buncombe, Haywood, Henderson, Madison, "
  + "McDowell and Transylvania. Practice tip: any family visiting a partner agency with an infant should be offered "
  + "diapers on the same visit.");
bnb.note = clean("The 1-888-892-1162 number listed here before as a diaper line is NC 211's. Babies Need Bottoms' own "
  + "office (828-250-4315, meagan@babiesneedbottoms.org; mailing address PO Box 5171, Asheville 28813) is for agencies "
  + "and donors, not diaper requests. Its partner list changes; 211 has the current one.");
addSrc(bnb, "partner-only model from a Buncombe County release and grant reports (via web search, 23 Nov 2026); " + REVIEW);
const rod = get("buncombe-county-register-of-deeds");
swap(rod, "d", "Free diapers, wipes, and formula, walk-in, take what you need (partnership with Babies Need Bottoms).",
  "Diapers, wipes and formula from Babies Need Bottoms for parents and relatives who come in for a child's birth certificate.");
rod.note = clean("The county's announcement of this partnership is undated and ties the supplies to birth certificate "
  + "visits. Call the Register of Deeds before sending a family only for diapers.");
addSrc(rod, "Buncombe County news release on the Babies Need Bottoms partnership (undated), via web search 23 Nov 2026; " + REVIEW);

/* 2. dates that have passed */
const ha = get("holiday-assistance");
swap(ha, "d", "4) Christmas Blessings Event, Saturday November 21, 10am-2pm, Maple Ridge Baptist, 133 Medford Branch Rd, Candler: free toys, clothing and food, everyone welcome. THANKSGIVING: Eblen's turkey giveaway is Friday, November 20, with advance sign-up (828-255-3066).",
  "4) Cowboy Christmas Toy Giveaway, Saturday December 5, 10am-2pm, Blue Ridge Cowboy Church, 49 Saxon Hill, Fairview: free toys, a free lunch and pictures with Santa (see Events).");
swap(ha, "d", "NO PAPERWORK NEEDED: the Christmas Blessings Event (Nov 21), Radiant Church's Thanksgiving dinner (Nov 26) and Horse Shoe Community Church's lunch (Nov 20) state no documents at all, which matters for families who have lost birth certificates. FULL: Eblen's Thanksgiving giveaway was reported fully registered on November 16, and most Swannanoa Thanksgiving boxes (Ingles drive, Meadowbrook FWB Church) are spoken for; NC 211 is the fallback.",
  "NO PAPERWORK NEEDED: Radiant Church's Thanksgiving dinner (Nov 26) states no documents at all, which matters for families who have lost birth certificates. Eblen's Thanksgiving giveaway and most Swannanoa Thanksgiving boxes filled up in mid November; NC 211 is the fallback.");
swap(ha, "d", "ALSO: Asheville Dream Center's Dream Christmas Toy Giveaway is December 12 and its Thanksgiving Outreach November 21 (details forthcoming; 828-674-2989).",
  "ALSO: Asheville Dream Center plans a Dream Christmas Toy Giveaway on December 12 (not confirmed online; 828-674-2989).");
ha.h = "Sign-ups open at most programs now; gifts given out in December";
ha.note = clean("Updated 23 Nov 2026: past November events taken out. Eblen's sign-up opened Nov 16 and its slots have filled "
  + "within days in past years, so check before promising one. ABCCM's 2026 deadline and Eblen's store address were not "
  + "published yet.");
addSrc(ha, REVIEW);

const bil = get("bilingual-early-childhood-literacy-and-adult");
swap(bil, "d", "; Fiesta de la Herencia Hispana at Pack Memorial (Nov 8, folklórico, Mexican puppetry by Edwin Salas, bilingual storytelling with Carolina Quiroga-Hurtado)", "");
addSrc(bil, "past event taken out, " + REVIEW);

const dsdhh = get("nc-division-of-services-for-the-deaf-and-har");
swap(dsdhh, "d", "Open house Thu Nov 12, 2026, 1:30 to 3pm at the Asheville Regional Center: resources for Deaf, DeafBlind, and hard of hearing adults and children, ASL interpreter provided. Free. ", "");
addSrc(dsdhh, "past open house taken out, " + REVIEW);

const ymca = get("ymca-wnc-mobile-food-markets");
swap(ymca, "d", "November 2026 stops listed as Facebook events (confirm before sending anyone): Fri Nov 13 noon Crowell Apartments, 10 Coleys Cir, and 1pm Mission Hospital pop-up, 509 Biltmore Ave; Wed Nov 18 11am Oakley/South Asheville Library; Thu Nov 19 11am Carolina Complete Health, 150 Tunnel Rd, and 2pm Woodfin YMCA; Fri Nov 20 noon Haywood Pediatrics; Tue Nov 24 1pm Hendersonville Family YMCA.",
  "Its last listed November 2026 stop is Tue Nov 24, 1pm, Hendersonville Family YMCA; check the December schedule before sending anyone.");
addSrc(ymca, "past November stops taken out, " + REVIEW);

const yw = get("ywca-womens-empowerment");
swap(yw, "d", "Director Tangie Ballard Bowman (email under Tangela) shared an upcoming event: TD Bank at the YWCA, Tue Nov 17, 2026, 6pm; the topic was not given. ", "");
addSrc(yw, "past event taken out, " + REVIEW);

const ebl = get("eblen-saint-nicholas-project-christmas");
swap(ebl, "d", "SIGN UP NOW: online appointments opened Monday, November 16, 2026, and slots fill quickly.",
  "Online appointments opened Monday, November 16, 2026; in past years every slot filled within days, so check whether any remain before promising one.");
ebl.h = "Sign-up opened Nov 16, 2026 (may be full); store open the 5 days before Christmas, by appointment";
addSrc(ebl, "Eblen's page and WLOS coverage of past years' fast-filling slots, via web search 23 Nov 2026; " + REVIEW);

const rcf = get("root-cause-farm-free-market");
swap(rcf, "d", "The last market of 2026 is Tuesday, November 25; it reopens in spring.",
  "No 2026 end date is published, so call 828-276-1156 before sending anyone in late fall or winter; it reopens in spring.");
addSrc(rcf, "impossible 2026 end date (Nov 25, 2026 is a Wednesday) taken out; Tuesday 3-4:30pm and phone confirmed by local listings via web search, " + REVIEW);

const ms = get("mountain-strong-free-clinic");
swap(ms, "d", "(Saturday Nov 21, 11am-2pm, and Thursday Dec 17, 5-8pm)", "(next: Thursday Dec 17, 5-8pm)");
ms.h = "Open house Thu Dec 17 5-8pm; call for other times";
addSrc(ms, "past open house date taken out, " + REVIEW);

const dc = get("asheville-dream-center-holiday");
swap(dc, "d", "a Thanksgiving Outreach on Saturday, November 21, 2026 and a Dream Christmas Toy Giveaway on Saturday, December 12, 2026",
  "a Dream Christmas Toy Giveaway on Saturday, December 12, 2026 (its Thanksgiving Outreach was Nov 21)");
dc.h = "Christmas Toy Giveaway Sat Dec 12, 2026 (not confirmed online)";
dc.note = clean("Times, place and sign-up were not published yet, and a web search on 23 Nov 2026 found no announcement of the Dec 12 giveaway. Call 828-674-2989 first.");
addSrc(dc, REVIEW);

const rh = get("restoration-house-bryson-city");
swap(rh, "d", " It also hosted the free haircut clinic on November 17, 2026 (see Events).", "");
addSrc(rh, "past event taken out, " + REVIEW);

const fan = get("operation-fan-heat-relief");
fan.note = clean("Out of season now: it runs May 1 to October 31. Ask again in late April 2027.");
addSrc(fan, REVIEW);

/* 3. new rows */
for (const id of ["wnc-free-food-supplies-guide", "free-resource-signal-group"]) if (list.some((r) => r.id === id)) throw new Error(`${id} exists`);
list.push({
  id: "wnc-free-food-supplies-guide",
  n: "WNC Free Food & Supplies guide (community list, tiny.cc/freeinwnc)",
  pp: "", sp: "⚪ Not listed - ask", spd: "Not stated in the source.", ph: "", em: "freefoodhelene@proton.me",
  w: "tiny.cc/freeinwnc",
  d: clean("A volunteer-kept list of free food across Western North Carolina, county by county: pantries, free meals, free "
    + "fridges, home deliveries and supplies. It links companion lists of free clinics and medical help, financial help and "
    + "pet pantries, a calendar of free food distributions and free food zines. Corrections and additions go to "
    + "freefoodhelene@proton.me or @FreeFoodWnc on Signal. Much of this directory's food data comes from its October 2026 edition."),
  a: "", h: "", os: "Community guide", t: "Free", lv: "", vb: "", sec: "VIII", needs: ["VIII:*", "VIII:5a"],
  src: "The guide's own header (updated 2 Oct 2026), from the copies Skylar Belt shared 13 and 17 Nov 2026; link shared again 23 Nov 2026",
  note: clean("The edition this directory used is dated 2 Oct 2026; the live guide may have changed since. It is a different list from the Buncombe Food Resource Guide (bit.ly/BuncombeFoodResourceGuide), which has its own row."),
  new: true,
});
list.push({
  id: "free-resource-signal-group",
  n: "Free resource group chat (public Signal group)",
  pp: "", sp: "⚪ Not listed - ask", spd: "Not stated in the source.", ph: "", em: "",
  w: "https://signal.group/#CjQKIDdYw3PJN-yAMxqxqgZlpMDqJa-nMd23zEaswuw6wyXiEhDYWpTz_8BL50RoTKfSfvTj",
  d: clean("A public Signal group chat where people share free resources. Open the link on a phone with the Signal app "
    + "installed to join. Useful for finding out about giveaways and distributions as they happen."),
  a: "", h: "", os: "Community group chats", t: "Free", lv: "", vb: "", sec: "VIII", needs: ["VIII:*", "VIII:5a"],
  src: "Link shared by Skylar Belt, 23 Nov 2026, who describes it as a public free resource group chat",
  note: clean("The group's name and moderators could not be checked from here: Signal group links only open in the app. "
    + "Members can see each other's Signal names, so a family may want a profile name they are comfortable sharing."),
  new: true,
});

res.file.meta.count = list.length;
res.file.meta.sources.push("Review of 23 Nov 2026: diaper routing, passed dates, the free food guide and a public Signal group (see scripts/apply-review-2026-11-23.mjs)");
save(res);

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift({
  date: "Nov 23 2026",
  what: "Diaper routing corrected, passed dates cleared, the free food guide added",
  detail: clean("Babies Need Bottoms does not give diapers to families: it supplies partner agencies. Its listed \"diaper "
    + "line\" was NC 211's number, so its call button called 211 under its name; the row now says to call 211 for the "
    + "nearest partner, and it is off the home screen (Code Purple took its place). The Register of Deeds offers its "
    + "diapers at birth certificate visits, per the county. Sixteen rows with November dates that have passed were "
    + "updated (Thanksgiving events, open houses, mobile market stops), and Root Cause Farm's impossible 2026 end date "
    + "came out. New: the WNC Free Food & Supplies guide (tiny.cc/freeinwnc) and a public free resource Signal group."),
  source: "scripts/apply-review-2026-11-23.mjs",
});
save(cl);
console.log("review applied;", list.length, "resources");
