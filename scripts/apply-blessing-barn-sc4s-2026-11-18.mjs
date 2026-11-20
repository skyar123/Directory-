/*
 * The Blessing Barn closed, and Sistas Caring 4 Sistas and BeLoved
 * relabelled, 2026-11-18.
 *
 * - Skylar Belt, 18 Nov 2026: "Blessing barn not running". Its row is kept
 *   only to say so (the name carries CLOSED, which ranks it last in search),
 *   and it leaves Food by day and the Tuesday and Thursday food lists.
 * - Sistas Caring 4 Sistas (SC4S) carried "Spanish-first / Latino-led" and was
 *   filed under Servicios en espanol. Skylar asked for it to be looked up
 *   online. By web search, 18 Nov 2026: a doula collective founded by Black
 *   women in Asheville (The Urban News calls it the city's first African
 *   American women-led doula program), serving primarily Black women and
 *   other families of color (NC Health News, Stroll magazine); no source
 *   mentions Spanish services. Its address was ABIPA's office (220 Continuum
 *   Dr, Fletcher), from a workbook row that also described ABIPA and Umoja,
 *   which have their own rows; the Asheville Chamber's nonprofit listing and
 *   the workbook's other copy give 50 S French Broad Ave.
 * - BeLoved Asheville is BIPOC- and low-wealth-led mutual aid; Asheville en
 *   Espanol is one of its programs (a network of Latinx leaders and a youth
 *   arts and leadership program, by BeLoved's own page). So its "Asheville in
 *   Black" and street pantry rows lose the Latino-led label; the Spanish
 *   listing of the pantries (Despensas callejeras) keeps its own.
 * - Three rows merged on 17 Nov had their workbook note run into their tags
 *   (the "|" between them became a comma), so the note showed as a dozen tag
 *   chips. The "|" goes back.
 * Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const clean = (s) => { if (DASH.test(s)) throw new Error(`dash in: ${s}`); return s; };
const load = (f) => {
  const path = new URL(`../data/${f}`, import.meta.url);
  return { path, file: JSON.parse(readFileSync(path, "utf8")) };
};
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");

const res = load("resources.json");
const list = res.file.resources;
const get = (id) => { const r = list.find((x) => x.id === id); if (!r) throw new Error(`no row ${id}`); return r; };
const expect = (r, k, v) => { if (r[k] !== v) throw new Error(`${r.id}.${k} is ${JSON.stringify(r[k])}, expected ${JSON.stringify(v)}`); };
const addSrc = (r, s) => { r.src = `${String(r.src || "").trim()}; ${clean(s)}`; };

/* 1. The Blessing Barn */
const bb = get("the-blessing-barn");
expect(bb, "n", "The Blessing Barn");
expect(bb, "h", "Tue and Thu 10am-2pm (some Saturdays)");
bb.n = "The Blessing Barn (CLOSED as of Nov 2026)";
bb.d = clean("CLOSED. Not running as of November 2026. It gave diapers, baby supplies and household items at "
  + "2492 US-70, Swannanoa, on Tuesdays and Thursdays, and its Birthday Barn gave birthday gifts to kids 2-12. "
  + "The Blessing Project's Blessing Bus is its mobile successor: see that row.");
bb.a = "";
bb.h = "";
bb.t = "Closed";
bb.lv = "2026-11-18";
bb.vb = "SB";
bb.note = clean("Skylar confirmed on 18 Nov 2026 that the Blessing Barn is not running (her food map had it as paused "
  + "or closed). Ask The Blessing Project whether the Birthday Barn still runs anywhere.");
addSrc(bb, "closed per Skylar Belt, 18 Nov 2026");

/* the day lists of food sites */
const CUT = { tuesday: " Blessing Barn 10am-2pm (2492 US-70, Swannanoa) |", thursday: " Blessing Barn 10am-2pm |" };
for (const [id, seg] of Object.entries(CUT)) {
  const r = get(id);
  if (r.d.split(seg).length !== 2) throw new Error(`${id}: Blessing Barn segment not found once`);
  r.d = r.d.replace(seg, "");
  if (/blessing barn/i.test(r.d)) throw new Error(`${id} still names the Blessing Barn`);
  addSrc(r, "Blessing Barn removed (closed), 18 Nov 2026");
}

/* 2. Sistas Caring 4 Sistas */
const sc = get("sistas-caring-4-sistas");
expect(sc, "sp", "🟢 Spanish-first / Latino-led");
expect(sc, "a", "220 Continuum Dr");
if (!sc.d.startsWith("BIPOC doula care. Umoja and ABIPA")) throw new Error("SC4S detail changed");
const keep = sc.d.slice(sc.d.indexOf("Nov 2026: limited openings"));
if (!keep.startsWith("Nov 2026")) throw new Error("SC4S winter openings text not found");
sc.sp = "⚪ Not listed - ask";
sc.spd = clean("No source mentions Spanish services: it is a doula collective founded by Black women, for Black "
  + "families and other families of color. Ask whether a Spanish-speaking doula or an interpreter is available.");
const before = sc.needs.length;
sc.needs = sc.needs.filter((k) => !k.startsWith("ESPANOL:"));
if (before - sc.needs.length !== 2) throw new Error("SC4S Spanish filing not as expected");
sc.a = "50 S French Broad Ave, Suite 212, Asheville 28801";
sc.d = clean("Free community doula care from a collective founded by Black women in Asheville, for Black families and "
  + "other families of color: birth, postpartum, lactation and partner support, plus in-home and after-hours care. "
  + "Grew out of Mothering Asheville with MAHEC. ") + keep;
sc.t = "Free, Evening / weekend";
sc.note = clean("Listings give different addresses: 50 S French Broad Ave (the Asheville Chamber's nonprofit listing; "
  + "Suite 212 in the workbook), 121 Hendersonville Rd (a local directory) and 9 Canterbury Rd (the NPI registry). "
  + "A 2022 county grant filing gives the phone 828-620-9828 and the site sistascaring4sistas.org. Doula visits "
  + "happen at home or the birth, so confirm by phone before sending anything by mail.");
addSrc(sc, "Spanish label, Spanish-services filing, address and description corrected 18 Nov 2026 by web search "
  + "(Asheville Chamber nonprofit listing, The Urban News, NC Health News, Buncombe County 2022 grant filing): no "
  + "source mentions Spanish services, and 220 Continuum Dr is ABIPA's office");

/* 3. BeLoved */
const bl1 = get("beloved-asheville-asheville-in-black-and-kid");
const bl2 = get("beloved-asheville-street-pantries");
for (const r of [bl1, bl2]) expect(r, "sp", "🟢 Spanish-first / Latino-led");
bl1.sp = "⚪ Not listed - ask";
bl1.spd = clean("BeLoved is BIPOC-led, not a Spanish-first program. Its Asheville en Espanol program is a network of "
  + "Latinx leaders and a youth arts program; ask about Spanish for these programs.");
bl2.sp = "⚪ Not listed - ask";
bl2.spd = clean("Unstaffed and open around the clock, so no conversation, ID or intake is needed. BeLoved also runs "
  + "Asheville en Espanol, its Latinx network; the Spanish listing is Despensas callejeras BeLoved.");
for (const r of [bl1, bl2]) {
  addSrc(r, "Latino-led label removed 18 Nov 2026: BeLoved is BIPOC- and low-wealth-led, with Asheville en Espanol "
    + "as one program (BeLoved's own page, via web search)");
}

/* 4. tags and workbook notes split apart again on the merged rows */
for (const id of ["mountain-child-advocacy-center", "colaborativa-la-milpa"]) {
  const r = get(id);
  if (!/, Verified /.test(r.t)) throw new Error(`${id} tags not as expected`);
  r.t = r.t.replace(", Verified ", " | Verified ");
}

if (DASH.test(JSON.stringify([bb, sc, bl1, bl2]).replace(/"src":"[^"]*"/g, ""))) throw new Error("dash added");
res.file.meta.count = list.length;
res.file.meta.sources.push("Blessing Barn closed, SC4S and BeLoved relabelled, 18 Nov 2026 "
  + "(see scripts/apply-blessing-barn-sc4s-2026-11-18.mjs)");
save(res);

/* Food by day */
const food = load("food-by-day.json");
let cut = 0;
for (const day of food.file.days) {
  const n = day.sites.length;
  day.sites = day.sites.filter((s) => s.place !== "Blessing Barn");
  cut += n - day.sites.length;
}
if (cut !== 2) throw new Error(`expected 2 Blessing Barn entries, removed ${cut}`);
food.file.meta.src += "; the Blessing Barn removed 18 Nov 2026 (closed, per Skylar Belt)";
save(food);

/* What changed */
const cl = load("changelog.json");
const entry = {
  date: "Nov 18 2026",
  what: "The Blessing Barn is closed; Sistas Caring 4 Sistas and BeLoved relabelled",
  detail: clean("The Blessing Barn in Swannanoa is not running (Skylar, 18 Nov). It is off Food by day and the Tuesday "
    + "and Thursday lists, and its row now says CLOSED and points to the Blessing Bus. Sistas Caring 4 Sistas was "
    + "labelled Spanish-first and Latino-led and filed under Spanish services; it is a doula collective founded by "
    + "Black women, for Black families and other families of color, and no source mentions Spanish, so it now says "
    + "to ask about a Spanish-speaking doula. Its address was another group's (ABIPA in Fletcher) and is now 50 S "
    + "French Broad Ave. BeLoved is BIPOC-led, with Asheville en Espanol as one of its programs, so its Asheville in "
    + "Black and street pantry rows lose the Latino-led label. Long workbook notes on cards now read as a sentence "
    + "instead of a row of tags."),
  source: "scripts/apply-blessing-barn-sc4s-2026-11-18.mjs; src/components/ResourceCard.jsx",
};
cl.file.groups.find((g) => g.id === "added").entries.unshift(entry);
save(cl);
console.log(`Blessing Barn closed (${cut} Food by day entries removed); SC4S, 2 BeLoved rows and 2 tag fields fixed`);
