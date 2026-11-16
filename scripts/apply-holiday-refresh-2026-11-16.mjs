/*
 * Holiday help brought up to date, 2026-11-16.
 *
 * Sources: Eblen Charities' own Saint Nicholas Project page and its Giving
 * Thanks flyer; the WNC Toys for Tots site (wnctft-nc.toysfortots.org); WLOS on
 * ABCCM's 2025 Christmas Angel Shop; the Salvation Army Angel Tree 2026 flyer.
 * Web search 16 Nov 2026, flyers shared by Skylar Belt 13 to 16 Nov 2026.
 * Skylar does not refer to the Salvation Army first, so the row leads with
 * ABCCM, Eblen and Toys for Tots. Run once.
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
const WEB = "web search, 16 Nov 2026";
const res = load("resources.json");
const list = res.file.resources;
const get = (id) => { const r = list.find((x) => x.id === id); if (!r) throw new Error(id); return r; };
const addSrc = (r, t) => { r.src = `${r.src.trim()}; ${t}`; };

const ha = get("holiday-assistance");
ha.ph = "828-259-5300 (ABCCM) / 828-255-3066 (Eblen)";
ha.w = "eblencharities.org/christmas-gift-assistance";
ha.h = "Sign-ups open now (mid November 2026); gifts given out in December";
ha.d = "Christmas and Thanksgiving help for 2026, best first. "
  + "(1) Eblen Charities Saint Nicholas Project: a free toy store where parents choose gifts for children birth to 18. "
  + "Eblen says online sign-up starts at the beginning of November and the store opens for the two weeks before "
  + "Christmas; book at eblencharities.org/christmas-gift-assistance now, because slots filled fast in 2025. "
  + "(2) ABCCM Christmas Angel: gifts for children and teens through the Christmas Angel Shop; in 2025 it took "
  + "applications up to December 23. Ask at an ABCCM Crisis Ministry (828-259-5300) or abccm.org/christmas-angel. "
  + "(3) WNC Toys for Tots (Buncombe, Henderson, Madison, Polk, Transylvania, Yancey): families do not apply to Toys for "
  + "Tots directly; they sign up through one partner program in their area (see the Toys for Tots row). "
  + "(4) Thanksgiving: Eblen's Giving Thanks Turkey Giveaway is Friday, November 20, with advance sign-up (call "
  + "828-255-3066); see the calendar for the Christmas Blessings Event in Candler (November 21) and other giveaways. "
  + "Toys for Tots asks families to sign up with only one of its partner programs. "
  + "Skylar does not refer to the Salvation Army Angel Tree: its 2026 sign-up (a link posted the morning of November 16, "
  + "limited spots) asks for photo ID, each child's birth certificate or custody papers, and proof of income, and bars "
  + "families who asked any other agency for Christmas help.";
ha.note = "Checked 16 Nov 2026. This year's Eblen store dates and place, and ABCCM's 2026 deadline, were not published "
  + "yet; confirm before telling a family when to go.";
addSrc(ha, `rewritten from Eblen's Saint Nicholas Project page and Giving Thanks flyer, WNC Toys for Tots, WLOS on ABCCM's 2025 Christmas Angel Shop, and the Salvation Army 2026 Angel Tree flyer, via ${WEB}`);
clean(ha);

const eb = get("eblen-saint-nicholas-project-christmas");
eb.d = eb.d.replace("Slots filled quickly in 2025, so sign up as soon as registration opens.",
  "Eblen says sign-up starts online at the beginning of November and the store runs for the two weeks before "
  + "Christmas, so registration should be open now; slots filled quickly in 2025.");
eb.h = "Sign up online now; shopping by appointment in the two weeks before Christmas";
addSrc(eb, `sign-up timing from Eblen's own Saint Nicholas Project page via ${WEB}`);
clean(eb);

if (list.some((r) => r.id === "toys-for-tots-wnc")) throw new Error("exists");
list.push(clean({
  id: "toys-for-tots-wnc", n: "WNC Toys for Tots (through local partner programs)", pp: "",
  sp: "⚪ Not listed - ask", spd: "Not stated in the source. Ask when you call.", ph: "", em: "",
  w: "wnctft-nc.toysfortots.org",
  d: "The Marine Corps Reserve toy campaign for Buncombe, Henderson, Madison, Polk, Transylvania and Yancey counties. "
    + "Families do not apply to Toys for Tots: they sign up with one partner program in their area, and should sign up "
    + "with only one. The 2026 deadline for programs to request toys was November 9, so a family's best route now is a "
    + "partner such as a church, school or agency already on the list. Benefit guides give the ages as 1 to 13.",
  a: "", h: "Partner programs sign families up in November", os: "Holiday help", t: "Free, Kids / 0-5", lv: "", vb: "",
  sec: "VIII", needs: ["VIII:*", "VIII:10a", "X:*", "X:12"],
  src: `WNC Toys for Tots site (counties served, program-only requests, 9 Nov 2026 deadline) via ${WEB}; age range from benefit guides`,
  note: "Ask which local program in the family's area hands out Toys for Tots gifts before promising toys.", new: true,
}));
res.file.meta.count = list.length;
res.file.meta.sources.push("Holiday help refresh, 16 Nov 2026 (see scripts/apply-holiday-refresh-2026-11-16.mjs)");
save(res);

/* events */
const ev = load("events.json");
const e = (id) => { const x = ev.file.events.find((y) => y.id === id); if (!x) throw new Error(id); return x; };
const th = e("eblen-ingles-thanksgiving-giveaway-2026-11");
th.end = "2026-11-19";
th.what = "Sign up: Eblen Giving Thanks Turkey Giveaway (Nov 20)";
th.detail = "Advance sign-up is required to get everything for a Thanksgiving meal at the Friday, November 20 giveaway, "
  + "with Ingles and iHeart Media.";
th.note = "Confirmed by Eblen's flyer; sign-ups were still open on 13 November.";
th.src = `${th.src}; confirmed by Eblen's Giving Thanks flyer, shared by Skylar Belt 13 Nov 2026`;
clean(th);

const at = e("salvation-army-angel-tree-registration-2026-11");
at.date = "2026-11-16";
at.detail = "A registration link goes up the morning of November 16 with limited spots, for children 0 to 12 (siblings "
  + "to 17) in Buncombe; families get an appointment to shop.";
at.note = "Skylar does not refer here: it asks for photo ID, birth certificates or custody papers and proof of income, "
  + "and bars families who asked anyone else for Christmas help. Offer Eblen, ABCCM or a Toys for Tots partner first.";
at.src = `${at.src}; 2026 dates and rules from the Salvation Army Angel Tree flyer, shared by Skylar Belt 13 Nov 2026`;
clean(at);
const ad = e("salvation-army-angel-tree-distribution-2026-12-21");
ad.note = "Not a first referral (see the registration entry).";
clean(ad);

const st = e("eblen-saint-nicholas-store-2026-12-17");
st.rid = "eblen-saint-nicholas-project-christmas";
st.note = "Eblen says the store runs the two weeks before Christmas; the exact 2026 dates and place are not published "
  + "yet (2025 opened December 9 at 23 Hamilton St). Families must book a slot online first.";
st.src = `${st.src}; timing from Eblen's own page via ${WEB}`;
clean(st);
save(ev);

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift(clean({
  date: "Nov 16 2026",
  what: "Holiday help brought up to date",
  detail: "The Holiday assistance row now leads with Eblen's Saint Nicholas Project (sign-up open now), ABCCM's "
    + "Christmas Angel and WNC Toys for Tots, with Thanksgiving help, and says why the Salvation Army Angel Tree is not "
    + "a first referral. New Toys for Tots row. Calendar: Eblen's turkey sign-up confirmed for November 20, the Angel "
    + "Tree entry updated with its 2026 rules, and the Eblen store entry linked to its row.",
  source: "scripts/apply-holiday-refresh-2026-11-16.mjs",
}));
save(cl);
console.log("done", list.length);
