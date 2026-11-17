/*
 * Merge duplicate resources, 2026-11-17 (Skylar: "Merge and tidy the lists,
 * but allow it to repeat at SNIFF sections").
 *
 * The workbook filed the same program once per SNIFF section it serves, so
 * 34 programs had two to four rows (72 rows). Each group becomes one row:
 *  - needs: every key from every copy, so the row still shows under each
 *    SNIFF section and question its copies did;
 *  - detail: the fullest copy's text, then whatever the others add (their
 *    "see Part 5" cross-references dropped; Spanish copies marked "En
 *    español");
 *  - contacts: the kept row's own, filled from the copies where it had
 *    none; a different phone or address from a copy goes in `note` unless
 *    the merged detail already shows it;
 *  - the newest verification, the strongest Spanish label, every source.
 * The kept id is the one other files point at, else the plain id (no -2),
 * else the most complete row. meta.merged maps each removed id to the kept
 * one, so plans and edits saved in a browser under an old id still find
 * the program. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const load = (f) => {
  const path = new URL(`../data/${f}`, import.meta.url);
  return { path, file: JSON.parse(readFileSync(path, "utf8")) };
};
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");

const res = load("resources.json");
const list = res.file.resources;
/* ids other files point at must survive */
const referenced = new Set(["kaleidoscope-play-learn", "caring-for-children-respite-scholarship", "eblen-charities",
  "nc-211", "liheap", "988-suicide-crisis-lifeline", "helpmate-domestic-violence-hotline",
  "our-voice-sexual-violence-hotline", "code-purple"]);

const fold = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const key = (s) => fold(s).replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const groups = new Map();
list.forEach((r) => { const k = key(r.n); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); });
const dupes = [...groups.values()].filter((g) => g.length > 1);
if (dupes.length !== 34) throw new Error(`expected 34 groups, found ${dupes.length}`);

const filled = (r) => ["ph", "em", "w", "a", "h", "lv", "pp"].filter((k) => (r[k] || "").trim()).length;
const pickKept = (g) => g.find((r) => referenced.has(r.id))
  || [...g].sort((a, b) => (/-\d+$/.test(a.id) ? 1 : 0) - (/-\d+$/.test(b.id) ? 1 : 0)
    || filled(b) - filled(a) || (b.d || "").length - (a.d || "").length)[0];

/* a copy's text without its pointers to the other copies */
const tidy = (t) => String(t || "")
  .replace(/\s*\((see|ver) [^)]*\)/gi, "")
  .replace(/\s*Details are on the main [^.]*row\.?/gi, "")
  .replace(/\s+/g, " ").trim();
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const words = (t) => new Set(fold(t).split(/[^a-z0-9]+/).filter((w) => w.length > 3));
const adds = (base, t) => {
  if (!t) return false;
  const b = fold(base), x = fold(t);
  if (b.includes(x)) return false;
  const w = [...words(t)];
  if (!w.length) return false;
  const have = words(base);
  return w.filter((x2) => have.has(x2)).length / w.length < 0.6;
};
const spanish = (t) => /[áéíóúñ¿¡]|\b(gratis|marque|jueves|lunes|ciudadan\w*|acompanamiento|noticias|despensa|cada dos)\b/i.test(t);
const SP_RANK = (sp) => (/^🟢/u.test(sp) ? 4 : /^🟡/u.test(sp) ? 3 : /^🟠/u.test(sp) ? 2 : sp ? 1 : 0);
const end = (t) => (/[.!?)]$/.test(t) ? t : t + ".");

const merged = {};
const removed = new Set();
for (const g of dupes) {
  const kept = pickKept(g);
  const others = g.filter((r) => r !== kept);

  kept.n = [...g].map((r) => r.n).sort((a, b) => b.length - a.length)[0];
  kept.needs = [...new Set(g.flatMap((r) => r.needs || []))].sort();

  const texts = g.map((r) => ({ r, t: tidy(r.d) })).sort((a, b) => b.t.length - a.t.length);
  let d = texts[0].t;
  /* an added copy's opening address or phone, already on the row, is dropped */
  const known = [kept.a, ...String(kept.ph || "").split(/\s*\/\s*/), ...g.map((r) => r.a)].map((x) => (x || "").trim()).filter(Boolean);
  const trimLead = (t) => {
    let out = t, again = true;
    while (again) {
      again = false;
      for (const k of known) {
        if (out.toLowerCase().startsWith(k.toLowerCase())) { out = out.slice(k.length).replace(/^[\s.,;:]+/, ""); again = true; }
      }
    }
    return out;
  };
  for (const { t: raw } of texts.slice(1)) {
    const t = trimLead(raw);
    if (!adds(d, t)) continue;
    d = `${end(d)} ${spanish(t) ? "En español: " : ""}${cap(t)}`;
  }
  kept.d = d;
  /* every section a copy was filed in, so the row repeats under each */
  const secs = [...new Set([kept.sec, ...others.map((r) => r.sec)].filter(Boolean))];
  if (secs.length > 1) kept.secs = secs;

  for (const k of ["em", "w", "h", "pp", "spd", "alt", "os"]) {
    if (!(kept[k] || "").trim()) { const o = others.find((r) => (r[k] || "").trim()); if (o) kept[k] = o[k]; }
  }
  const notes = [];
  for (const k of ["ph", "a"]) {
    for (const o of others) {
      const v = (o[k] || "").trim();
      if (!v) continue;
      const cur = (kept[k] || "").trim();
      if (!cur) { kept[k] = v; continue; }
      if (fold(cur).includes(fold(v))) continue;
      if (fold(v).includes(fold(cur))) { kept[k] = v; continue; }
      const probe = fold(v).split(/[/,]/)[0].trim();
      if (fold(kept.d).includes(probe)) continue;
      notes.push(`Another listing of this program gave ${k === "ph" ? "the phone" : "the address"} ${v}.`);
    }
  }
  kept.sp = [...g].map((r) => r.sp || "").sort((a, b) => SP_RANK(b) - SP_RANK(a))[0];
  const newest = [...g].filter((r) => r.lv).sort((a, b) => (b.lv > a.lv ? 1 : -1))[0];
  if (newest) { kept.lv = newest.lv; kept.vb = newest.vb; }
  const tags = [...new Set(g.flatMap((r) => String(r.t || "").split(/\s*[|,]\s*/)).filter(Boolean))];
  kept.t = tags.join(", ");
  kept.src = [...new Set(g.flatMap((r) => String(r.src || "").split(/;\s*/)).filter(Boolean))].join("; ")
    + `; merged 17 Nov 2026 from ${g.length} rows (${g.map((r) => r.id).join(", ")})`;
  kept.note = [...new Set(g.map((r) => (r.note || "").trim()).filter(Boolean).concat(notes))].join(" ");
  if (g.some((r) => r.start)) kept.start = true;
  if (g.some((r) => r.readFirst)) kept.readFirst = true;
  if (DASH.test(JSON.stringify(kept)) && !DASH.test(JSON.stringify(g))) throw new Error(`dash added in ${kept.id}`);

  for (const o of others) { merged[o.id] = kept.id; removed.add(o.id); }
}
res.file.resources = list.filter((r) => !removed.has(r.id));
res.file.meta.count = res.file.resources.length;
res.file.meta.merged = { ...(res.file.meta.merged || {}), ...merged };
res.file.meta.sources.push("Duplicate rows merged, 17 Nov 2026 (see scripts/apply-merge-duplicates-2026-11-17.mjs); meta.merged maps old ids to kept ones");
save(res);

const cl = load("changelog.json");
const entry = {
  date: "Nov 17 2026",
  what: "Duplicate listings merged into one per program",
  detail: `${dupes.length} programs were listed two to four times, once per SNIFF section they serve (${removed.size + dupes.length} `
    + `rows). Each is now one listing (${res.file.meta.count} resources in all) that still shows under every SNIFF section `
    + "and question its copies did, with the fullest description, the others' extra details (Spanish ones marked), "
    + "the newest verification and every source. Examples: Catholic Charities, Safe Shelter, MANNA Food Helpline, NC 211, "
    + "Mountain Child Advocacy Center, True Ridge, The Arc.",
  source: "scripts/apply-merge-duplicates-2026-11-17.mjs",
};
if (DASH.test(JSON.stringify(entry))) throw new Error("dash in changelog entry");
cl.file.groups.find((g) => g.id === "added").entries.unshift(entry);
save(cl);
console.log(`merged ${dupes.length} groups, removed ${removed.size} rows, ${res.file.meta.count} resources`);
