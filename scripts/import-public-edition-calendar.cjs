/* Builds data/calendar.json from the event sheets of the Buncombe County
   Family Resource Directory, Public Edition (checked 7 Nov 2026).
     python3 scripts/export-public-edition.py <workbook.xlsx> public.json
     node scripts/import-public-edition-calendar.cjs . public.json --write

   What goes in, following the Public Edition's own rules:
   - Curated Events: its family and caregiver calendar, one entry per dated
     occurrence, inside the window 2026-11-07 to 2027-11-07. It is the library
     feed minus 74 adult-interest programs, plus the other organizers' feeds.
     The full library feed stays out, linked from "calendars".
   - Recurring Series, as published patterns, never as promised dates.
   - Annual-Unannounced, as leads to watch, never as scheduled events.
   - Calendars to Monitor, with what each covered and where it is thin, so a
     quiet month reads as not yet published rather than as nothing on.
   The workbook's "Not stated" boilerplate is dropped rather than shown. An
   occurrence that events.json already has is left out here, and that entry
   gains the calendar's facts and its provenance. Without --write it reports. */
const fs = require("fs");
const [repo, pubPath, flag] = process.argv.slice(2);
const W = JSON.parse(fs.readFileSync(pubPath, "utf8"));
const resources = JSON.parse(fs.readFileSync(repo + "/data/resources.json", "utf8")).resources;
const rids = new Set(resources.map((r) => r.id));
const evPath = repo + "/data/events.json";
const evRaw = fs.readFileSync(evPath, "utf8");
const evFile = JSON.parse(evRaw);
if (JSON.stringify(evFile, null, 1) + "\n" !== evRaw) throw new Error("events.json would not round-trip");

const FROM = "2026-11-07", TO = "2027-11-07", CHECKED = "2026-11-07";
const real = (v) => {
  const s = v === undefined || v === null ? "" : String(v).trim();
  return !s || /^Not stated/i.test(s) ? "" : s;
};
const ent = (s) => s.replace(/&amp;/g, "&").replace(/&#0?39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");
const clip = (s, n) => {
  s = ent(String(s || "")).replace(/\s+/g, " ").trim();
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "") + "…";
};

/* organizer names as people say them, and the directory row each links to */
const ORG = { "Arboretum": "NC Arboretum", "Adult Education Programs": "NC Arboretum adult education", "Resources For Resilience": "Resources for Resilience" };
const RID = {
  "Buncombe County Public Libraries": "buncombe-county-public-libraries", "Bounty & Soul": "bounty-soul",
  "Asheville Art Museum": "asheville-art-museum", "NC Arboretum": "north-carolina-arboretum",
  "NC Arboretum adult education": "north-carolina-arboretum", "North Carolina Arboretum": "north-carolina-arboretum",
  "Resources for Resilience": "resources-for-resilience", "Asheville Museum of Science": "asheville-museum-of-science",
  "WNC Nature Center": "wnc-nature-center", "Asheville Parks & Recreation": "asheville-parks-recreation", "Helpmate": "helpmate",
  "Black Mountain Center for the Arts": "black-mountain-center-for-the-arts", "Homegrown Families": "homegrown-families",
  "Birthstone Center": "birthstone-center-for-appalachian-perinatal-resilience", "LEAF Global Arts": "leaf-global-arts",
  "Wortham Center for the Performing Arts": "wortham-center-for-the-performing-arts",
};
for (const id of Object.values(RID)) if (!rids.has(id)) throw new Error("no resource " + id);
const orgOf = (o) => ORG[String(o).trim()] || String(o).trim();
const ridOf = (o) => RID[orgOf(o)];

/* "13:00", "10:00am" and "2:00pm" all appear; written the way events.json does, "10:30-11:30am" */
const hm = (t) => {
  const m = /^(\d{1,2}):(\d{2})\s*(am|pm)?$/i.exec(String(t || "").trim());
  if (!m) return null;
  let h = +m[1];
  const mer = (m[3] || "").toLowerCase();
  if (mer === "pm" && h < 12) h += 12;
  if (mer === "am" && h === 12) h = 0;
  return { h, min: +m[2] };
};
const say = ({ h, min }, mer) => {
  if (h === 12 && min === 0 && mer) return "noon";
  return (h % 12 || 12) + (min ? ":" + String(min).padStart(2, "0") : "") + (mer ? (h >= 12 ? "pm" : "am") : "");
};
const timeOf = (a, b) => {
  const s = hm(a), e = hm(b);
  /* midnight is how the feeds write "all day" */
  if (!s || (s.h === 0 && s.min === 0)) return "";
  if (!e || (e.h === s.h && e.min === s.min)) return say(s, true);
  const same = (s.h >= 12) === (e.h >= 12) && !(e.h === 12 && e.min === 0);
  return say(s, !same) + "-" + say(e, true);
};

const AGES = [
  ["baby", /\bbab(y|ies)\b|4 mos|five and under/i], ["toddler", /toddler|five and under/i],
  ["preschool", /preschool|five and under/i], ["school", /school age|grades k|tween/i],
  ["teen", /\bteens?\b|ages 13\+/i], ["adult", /\badults?\b|ages 13\+|ages 21\+/i],
];
const agesOf = (aud) => AGES.filter(([, re]) => re.test(aud || "")).map(([k]) => k);
const fitOf = (f) => /^children and families/i.test(f) ? "family" : /caregivers\/adults|adults\/caregivers/i.test(f) ? "caregiver" : "general";
const STATUS = [
  [/^Confirmed on library calendar/, "library"], [/^Confirmed on organizer calendar/, "organizer"],
  [/prior research/, "recheck"], [/program-season window/, "season"],
];
const statusOf = (s) => (STATUS.find(([re]) => re.test(s)) || [, ""])[1];
const REG = [
  [/registration closed/i, "Registration closed"], [/^Registration required/i, "Registration required"],
  [/^Registration opens (\d{4}-\d{2}-\d{2})/i, (m) => "Registration opens " + new Date(m[1] + "T12:00:00").toLocaleDateString("en-US", { day: "numeric", month: "short" })],
  [/^Registration\/link in event description/i, "Register on the event page"],
  [/^Appointment slots/i, "Appointments; an adult comes with the child"],
];
const regTag = (r) => {
  for (const [re, out] of REG) { const m = re.exec(r || ""); if (m) return typeof out === "function" ? out(m) : out; }
  return "";
};
const phoneOf = (c) => ((c || "").match(/\(?\d{3}\)?[-.\s]\d{3}[-.]\d{4}/) || [""])[0].replace(/\./g, "-");
const addrOf = (a) => a.replace(/,\s*NC,?\s*(\d{5})\b/, ", NC $1").replace(/,\s*(\d{5})$/, " $1");

/* occurrences events.json already has, kept there; found by date and title words */
const DUP = { L0066: "fire-safety-for-kids-fairview-2026-11-14" };
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const report = { window: 0, cancelled: [], dup: [], candidates: [], noPlace: {} };
const out = [];
const seen = new Set();
for (const r of W["Curated Events"]) {
  const date = String(r["Start Date"]).slice(0, 10), end = String(r["End Date"] || "").slice(0, 10);
  if (date < FROM || date > TO) { report.window++; continue; }
  const what = clip(r.Event, 140);
  if (/\b(cancell?ed|postponed|closed|closure)\b/i.test(what)) { report.cancelled.push(`${r["Event ID"]} ${what}`); continue; }
  const org = orgOf(r.Organizer);
  const loc = real(r.Location), room = real(r.Room), addr = real(r.Address);
  const roomOnly = room && room.startsWith(loc) ? room.slice(loc.length).replace(/^[\s:–-]+/, "") : room;
  let where = loc ? loc + (roomOnly && !loc.includes(roomOnly) ? " (" + roomOnly + ")" : "") : "";
  if (addr && !where.includes(addr)) where = where ? where + ", " + addrOf(addr) : addrOf(addr);
  const access = real(r["Accessibility / Transportation"]);
  const online = /virtual/i.test(r.Category || "") || /^online|zoom/i.test(loc);
  if (!where && online) where = "Online";
  if (!where && /^75 Gashes Creek Road/.test(access)) where = "WNC Nature Center, 75 Gashes Creek Rd, Asheville";
  const key = [r["Source URL"], date, r["Start Time"], norm(what), norm(where)].join("|");
  if (seen.has(key)) { report.dup.push(r["Event ID"]); continue; }
  seen.add(key);
  if (DUP[r["Event ID"]]) { report.dup.push(`${r["Event ID"]} -> events.json ${DUP[r["Event ID"]]}`); continue; }
  for (const e of evFile.events) {
    if (e.date !== date) continue;
    const a = norm(e.what).split(" ").filter((w) => w.length > 3), b = new Set(norm(what).split(" "));
    const near = e.time === timeOf(r["Start Time"], r["End Time"]) || norm(e.where || "").split(" ").some((w) => w.length > 3 && norm(where).includes(w));
    if (a.filter((w) => b.has(w)).length >= 2 && near) report.candidates.push(`${r["Event ID"]} ${what} ~ ${e.id}`);
  }
  const notes = [];
  if (/Source discrepancy/i.test(access)) notes.push("Sources disagree on the address: an older county guide lists 11 Rocket Dr. Go by this listing and confirm before you go.");
  if (/Traffic\/bridge advisory/i.test(access)) notes.push("A traffic and bridge advisory is expected through May 2027. Check directions before you go.");
  if (!where) { notes.push("The listing does not say where. Check the event page."); report.noPlace[org] = (report.noPlace[org] || 0) + 1; }
  if (/Confirm weekly session options/i.test(r.Registration || "")) notes.push("Confirm the weekly session options and the scholarship process.");
  const tags = [];
  const reg = regTag(r.Registration);
  if (reg) tags.push(reg);
  if (online && where === "Online") tags.push("Online");
  if (/bilingual|biling[uü]e|hora del cuento|español|spanish/i.test(what + " " + String(r.Description || "").slice(0, 200))) tags.push("Spanish");
  const e = {
    id: "pe-" + r["Event ID"].toLowerCase(), date,
    ...(end && end !== date && { end }),
    ...(timeOf(r["Start Time"], r["End Time"]) && r["All Day"] !== "Yes" && { time: timeOf(r["Start Time"], r["End Time"]) }),
    kind: "event", what,
    ...(where && { where }),
    ...(real(r.Description) && { detail: clip(r.Description, 220) }),
    ...(notes.length && { note: notes.join(" ") }),
    ...(tags.length && { tags }),
    org,
    ...(agesOf(r.Audience).length && { ages: agesOf(r.Audience) }),
    fit: fitOf(r["Family / Caregiver Fit"]),
    ...(real(r.Cost) && { cost: clip(r.Cost, 160) }),
    ...(phoneOf(r["Organizer Contact"]) && { ph: phoneOf(r["Organizer Contact"]) }),
    w: String(r["Source URL"]).trim(),
    ...(ridOf(r.Organizer) && { rid: ridOf(r.Organizer) }),
    status: statusOf(r.Status),
  };
  if (!e.status) throw new Error("unknown status " + r.Status);
  out.push(e);
}
out.sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || "") || a.what.localeCompare(b.what));

/* standing series carry their schedule as words ("Fourth Friday",
   "Standing recurrence") where the others have dates and counts */
const isDate = (v) => /^\d{4}-\d{2}-\d{2}/.test(String(v || ""));
const lower1 = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const series = W["Recurring Series"].map((r) => {
  const first = real(r["First Published Date"]), last = real(r["Last Published Date"]), n = real(r["Published Occurrences"]);
  const words = [!/^\d+$/.test(n) && n, !isDate(first) && first, !isDate(last) && last].filter(Boolean);
  const t = real(r["Start Time"]);
  const time = timeOf(t) || (t && !/^(not captured|varies)$/i.test(t) ? t : "");
  return {
  org: orgOf(r.Organizer), what: clip(r["Series / Event"], 140),
  ...(time && { time }),
  ...(real(r.Audience) && { aud: clip(r.Audience, 120) }),
  ...(isDate(first) && { first: first.slice(0, 10) }),
  ...(isDate(last) && { last: last.slice(0, 10) }),
  ...(/^\d+$/.test(n) && Number(n) > 0 && { n: Number(n) }),
  ...(words.length && { when: words.map((w, i) => (i ? lower1(w) : w)).join("; ") }),
  pattern: real(r["Published Pattern"]),
  ...(real(r.Cost) && { cost: clip(r.Cost, 160) }),
  ...(regTag(r.Registration) && { reg: regTag(r.Registration) }),
  ...(real(r["Source URL"]) && { w: String(r["Source URL"]).trim() }),
  ...(ridOf(r.Organizer) && { rid: ridOf(r.Organizer) }),
  note: real(r["Verification Note"]),
  };
}).sort((a, b) => a.org.localeCompare(b.org) || a.what.localeCompare(b.what));

const watch = W["Annual-Unannounced"].map((r) => ({
  org: orgOf(r.Organization), what: clip(r["Program / Event Lead"], 200), status: real(r["Announcement Status"]),
  next: real(r["Next Action"]), w: String(r["Source URL"] || "").trim(),
  ...((ridOf(r.Organization) || /Kaleidoscope/.test(r["Program / Event Lead"])) && { rid: ridOf(r.Organization) || "kaleidoscope-play-learn" }),
}));

const calendars = W["Calendars to Monitor"].map((r) => ({
  org: orgOf(r["Calendar / Organization"]), w: String(r.URL || "").trim(), coverage: real(r["Coverage Captured"]),
  gap: real(r["Publication / Gap Note"]), next: real(r["Next Check"]),
}));

const coverage = (W["Monthly Coverage"] || []).filter((r) => /^\d{4}-\d{2}$/.test(r["Month Key"]))
  .map((r) => ({ month: r["Month Key"], curated: r["Curated Events"], library: r["Library Events"], other: r["Other Events"] }));

const cal = {
  meta: {
    file: "calendar.json",
    generated: CHECKED,
    checked: CHECKED,
    from: FROM, to: TO,
    src: "Buncombe County Family Resource Directory, Public Edition, checked 7 Nov 2026: its curated family and caregiver calendar (Buncombe County Public Libraries' family programs plus the Bounty & Soul, NC Arboretum, Asheville Art Museum, Resources for Resilience and other organizer feeds), its recurring series, its annual leads not yet announced, and the calendars it monitors.",
    note: "Rebuilt by scripts/import-public-edition-calendar.cjs. Every event's source is the Public Edition's copy of its organizer's calendar, so src is not repeated on each one: the app builds it from org and status. `status` is how the Public Edition found the listing: library or organizer (on that calendar when checked), recheck (from earlier research; recheck before going), season (a program-season window). `fit` is family, caregiver or general. `ages` uses baby, toddler, preschool, school, teen and adult. Hand-picked events with notes stay in events.json.",
    coverage,
  },
  events: out, series, watch, calendars,
};

/* the one occurrence events.json already had: the calendar names its host */
const fire = evFile.events.find((e) => e.id === "fire-safety-for-kids-fairview-2026-11-14");
const fireNote = "The library calendar lists it as a Fairview Library program with the Fairview Fire Department, for kids and their grown-ups. Neither listing gives a cost.";
const fireSrc = "; also on the Buncombe County Public Libraries calendar, via the Public Edition (checked 7 Nov 2026)";
if (fire && !fire.src.includes(fireSrc)) {
  fire.where = "Fairview Library, 1 Taylor Rd, Fairview";
  fire.note = fireNote;
  fire.rid = "buncombe-county-public-libraries";
  fire.src += fireSrc;
}

const by = (k) => Object.entries(out.reduce((m, e) => ((m[e[k]] = (m[e[k]] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]).map(([v, c]) => `${c} ${v}`).join(", ");
console.log(`${out.length} occurrences (${report.window} outside the window, ${report.cancelled.length} cancellations, ${report.dup.length} duplicates)`);
console.log("  by status:", by("status"));
console.log("  by organizer:", by("org"));
console.log("  by fit:", by("fit"));
console.log(`${series.length} series, ${watch.length} leads to watch, ${calendars.length} calendars`);
console.log("duplicates:", report.dup.join("; ") || "none");
console.log("possible duplicates to check:", report.candidates.join("; ") || "none");
console.log("cancellations dropped:", report.cancelled.join("; ") || "none");
console.log("no place yet:", JSON.stringify(report.noPlace));
console.log(`calendar.json ${Math.round(JSON.stringify(cal, null, 1).length / 1024)} KB, ${Math.round(JSON.stringify(cal).length / 1024)} KB minified`);
if (flag === "--write") {
  fs.writeFileSync(repo + "/data/calendar.json", JSON.stringify(cal, null, 1) + "\n");
  fs.writeFileSync(evPath, JSON.stringify(evFile, null, 1) + "\n");
  console.log("written");
}
