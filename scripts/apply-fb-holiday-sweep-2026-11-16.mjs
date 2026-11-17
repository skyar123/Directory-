/*
 * Facebook holiday sweep, 16 Nov 2026 (PDF report Skylar shared: "Holiday Gift &
 * Meal Programs, Facebook Sweep"). Each item was read from the actual post or
 * flyer; nothing here is filled in from elsewhere. Individual one-family
 * giveaways and donor-only drives are left out. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const load = (f) => { const path = new URL(`../data/${f}`, import.meta.url); return { path, file: JSON.parse(readFileSync(path, "utf8")) }; };
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const clean = (v) => { const s = JSON.stringify(v); if (DASH.test(s)) throw new Error(`dash: ${s.slice(0, 90)}`); return v; };
const SWEEP = "Facebook holiday sweep shared by Skylar Belt, 16 Nov 2026";
const res = load("resources.json");
const list = res.file.resources;
const get = (id) => { const r = list.find((x) => x.id === id); if (!r) throw new Error(id); return r; };
const app = (r, k, t) => { const c = (r[k] || "").trim(); r[k] = !c ? t : k === "src" ? `${c}; ${t}` : `${c}${/[.!?)]$/.test(c) ? "" : "."} ${t}`; };

const ab = get("abccm-christmas-angel");
ab.w = "act.abccm.org/page/103314/survey/1";
ab.h = "Christmas Angel Shop open the week of Thanksgiving through the third week of December";
app(ab, "d", "The family application form is act.abccm.org/page/103314/survey/1 (on ABCCM's own site; shared in a Facebook "
  + "comment, not an official post). ABCCM's November 12 posts say the shop opens the week of Thanksgiving and runs "
  + "through the third week of December.");
app(ab, "src", `${SWEEP} (ABCCM's Nov 12 posts; application link from a Hendersonville group comment, Nov 15)`);
clean(ab);

const ha = get("holiday-assistance");
ha.d = ha.d.replace("2) ABCCM CHRISTMAS ANGEL. Parents apply at an ABCCM Crisis Ministry (828-259-5300)",
  "2) ABCCM CHRISTMAS ANGEL. Parents apply online at act.abccm.org/page/103314/survey/1 or at an ABCCM Crisis Ministry (828-259-5300)");
app(ha, "d", "NO PAPERWORK NEEDED: the Christmas Blessings Event (Nov 21), Radiant Church's Thanksgiving dinner (Nov 26) and "
  + "Horse Shoe Community Church's lunch (Nov 20) state no documents at all, which matters for families who have lost "
  + "birth certificates. FULL: Eblen's Thanksgiving giveaway was reported fully registered on November 16, and most "
  + "Swannanoa Thanksgiving boxes (Ingles drive, Meadowbrook FWB Church) are spoken for; NC 211 is the fallback.");
app(ha, "src", SWEEP);
clean(ha);

const gc = get("garren-creek-thanksgiving-boxes-swannanoa");
gc.em = "info@garrencreek.org";
gc.a = "Pickup at 1198 Garren Creek Rd, Fairview";
app(gc, "d", "To ask for a dinner, email info@garrencreek.org or message Garren Creek Foundation's Facebook page; pickup "
  + "dates were not set. Treat it as first come and nearly full.");
app(gc, "src", `${SWEEP} (Friends of Swannanoa, Oct 28 and Nov 2)`);
clean(gc);

const sh = get("the-storehouse-hendersonville");
app(sh, "d", "At Christmas it gets names of children in need from schools and DSS, so a family's route in is through the school or DSS.");
app(sh, "src", `${SWEEP} (Hendersonville group, Nov 11)`);
clean(sh);

const es = get("estes-resource-center");
app(es, "d", "1984 Hendersonville Rd is Skyland United Methodist Church (a November 2026 MANNA pop-up was held there), so the "
  + "old row may have meant a resource at that church.");
app(es, "src", SWEEP);
clean(es);

if (list.some((r) => r.id === "grace-covenant-free-food")) throw new Error("exists");
list.push(clean({
  id: "grace-covenant-free-food", n: "Grace Covenant Presbyterian free food (no ID, no questions)", pp: "",
  sp: "🟡 Bilingual staff", spd: "The post says Spanish is spoken.", ph: "", em: "", w: "",
  d: "Free food at Grace Covenant Presbyterian Church: no ID, no documents, no registration, no questions asked, and "
    + "Spanish spoken. The community food guide lists the pantry on Thursdays 11am-1pm; a November 2026 post advertised "
    + "Thursday November 12, 11am-1pm. Confirm the weekly schedule.",
  a: "789 Merrimon Ave, Asheville 28804", h: "Thursdays 11am-1pm (confirm)", os: "Community food guide (Oct 2026)",
  t: "Free, No ID, Spanish / bilingual", lv: "", vb: "", sec: "VIII", needs: ["VIII:*", "VIII:5a", "ESPANOL:*"],
  src: `WNC Free Food & Supplies community guide (Oct 2026); ${SWEEP} (LGBTQ Women of Asheville, Nov 11)`, note: "", new: true,
}));
res.file.meta.count = list.length;
res.file.meta.sources.push("Facebook holiday sweep, 16 Nov 2026 (see scripts/apply-fb-holiday-sweep-2026-11-16.mjs)");
save(res);

const ev = load("events.json");
const E = (id) => { const x = ev.file.events.find((y) => y.id === id); if (!x) throw new Error(id); return x; };
for (const id of ["eblen-ingles-thanksgiving-giveaway-2026-11", "eblen-turkey-giveaway-2026-11-20"]) {
  const x = E(id);
  x.note = "Reported FULLY REGISTERED on November 16 (Friends of Swannanoa comment). Do not send new families; try the meals listed for Nov 20 to 26 or NC 211.";
  x.src = `${x.src}; full status from the ${SWEEP}`;
  clean(x);
}
const cb = E("christmas-blessings-candler-2026-11-21");
cb.note = "Walk-in: no sign-up, income test or documents stated.";
clean(cb);
const add = [
  { id: "manna-popup-skyland-umc-2026-11-16", date: "2026-11-16", time: "3:30-4:30pm", kind: "event",
    what: "MANNA free groceries pop-up", where: "Skyland United Methodist Church, 1984 Hendersonville Rd, Asheville",
    detail: "One-time free grocery mobile market.", tags: ["Free"], src: `${SWEEP} (Nov 16 digest)` },
  { id: "iam-holiday-meal-boxes-2026-11-16", date: "2026-11-16", end: "2026-11-25", kind: "event",
    what: "IAM holiday meal boxes (Hendersonville)", where: "IAM, 310 Freeman St, Hendersonville",
    detail: "Holiday meal boxes given out through Thanksgiving week.", note: "How to sign up and who qualifies were not stated; call IAM first.",
    tags: ["Free"], rid: "iam-pantry-hendersonville", src: `${SWEEP} (Nov 16 digest)` },
  { id: "horse-shoe-feed-u-friday-2026-11-20", date: "2026-11-20", time: "11:30am-1pm", kind: "event",
    what: "Free Thanksgiving lunch: Horse Shoe Community Church \"Feed U Friday\"",
    where: "Horse Shoe Community Church, 3 Banner Farm Rd, Horse Shoe 28742 (Henderson County)",
    detail: "Free sit-down Thanksgiving lunch (turkey, homemade sides and desserts), with take-out dinners. Open to everyone, no requirements stated.",
    note: "RSVP was due Monday, November 16: call 828-714-1670 and ask if there is still room.", ph: "828-714-1670",
    tags: ["Free"], src: `${SWEEP} (Hendersonville, NC group, Nov 10)` },
  { id: "radiant-church-feed-the-828-2026-11-26", date: "2026-11-26", time: "11am-2pm", kind: "event",
    what: "Free Thanksgiving dinner: Radiant Church \"Feed the 828\" (Arden)",
    where: "Radiant Church Arden campus, Radiant Cafe at the back, 3839 Sweeten Creek Rd, Arden",
    detail: "Free Thanksgiving dinner, dine in or take out. Free to the community; no RSVP or requirements stated.",
    w: "radiant828.com", tags: ["Free"], src: `${SWEEP} (Hendersonville group, Nov 15; Asheville Free, Nov 13)` },
  { id: "hot-mess-express-gift-wrapping-2026-12-08", date: "2026-12-08", kind: "event",
    what: "Free gift wrapping for families (Hot Mess Express Asheville)",
    detail: "Volunteers wrap families' gifts for free. Location given when you sign up.",
    w: "forms.gle/yjoGnCTgb1wXEHML7", note: "Sign up on the form or email tyonnahoward@hotmessexpressaffiliate.co. Also December 22.",
    tags: ["Free"], src: `${SWEEP} (Asheville Mamas, Nov 12)` },
  { id: "hot-mess-express-gift-wrapping-2026-12-22", date: "2026-12-22", kind: "event",
    what: "Free gift wrapping for families (Hot Mess Express Asheville)",
    detail: "Volunteers wrap families' gifts for free. Location given when you sign up.",
    w: "forms.gle/yjoGnCTgb1wXEHML7", note: "Sign up on the form or email tyonnahoward@hotmessexpressaffiliate.co.",
    tags: ["Free"], src: `${SWEEP} (Asheville Mamas, Nov 12)` },
];
for (const x of add) { if (ev.file.events.some((y) => y.id === x.id)) throw new Error(x.id); ev.file.events.push(clean(x)); }
ev.file.events.sort((a, b) => a.date.localeCompare(b.date));
save(ev);

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift(clean({
  date: "Nov 16 2026", what: "Facebook holiday sweep: ABCCM application link, Thanksgiving meals, full programs",
  detail: "ABCCM Christmas Angel now has its family application form and shop dates. Calendar: Horse Shoe Thanksgiving lunch (Nov 20), Radiant Church dinner (Nov 26), IAM holiday boxes, a MANNA pop-up, free gift wrapping (Dec 8 and 22). Eblen's Thanksgiving giveaway is marked full. New Grace Covenant no-ID free food row. Holiday assistance flags the programs that need no documents.",
  source: "scripts/apply-fb-holiday-sweep-2026-11-16.mjs" }));
save(cl);
console.log("done", list.length);
