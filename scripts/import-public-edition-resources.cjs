/* Merges the 169 resources of the Buncombe County Family Resource Directory,
   Public Edition (checked 7 Nov 2026) into data/resources.json.
     python3 scripts/export-public-edition.py <workbook.xlsx> public.json
     node scripts/import-public-edition-resources.cjs . public.json --write
   Every public record was matched by hand to an existing row (M) or given a
   section and SNIFF questions as a new row (NEW). A match only fills blank
   website, phone, address, hours and email fields and adds the Public Edition
   to src; where both sides have a value and they differ, the row keeps its
   own and the disagreement goes in note. Without --write it only reports. */
const fs = require("fs");
const [repo, pubPath, flag] = process.argv.slice(2);
const path = repo + "/data/resources.json";
const raw = fs.readFileSync(path, "utf8");
const f = JSON.parse(raw);
if (JSON.stringify(f, null, 1) + "\n" !== raw) throw new Error("resources.json would not round-trip");
const P = JSON.parse(fs.readFileSync(pubPath, "utf8"))["Master Resources"];
const byPid = new Map(P.map((p) => [p["Resource ID"], p]));
const A = f.resources;
const find = (id) => A.find((a) => a.id === id) || A.find((a) => a.id.startsWith(id));

/* decisions: match an existing row, or add a new one with section and SNIFF keys */
const M = {
  R001: "nc-pre-k-head-start-unified-application", R002: "child-care-subsidy-program", R003: "mountain-child-care-connections",
  R004: "verner-center-for-early-learning", R005: "dolly-parton-s-imagination-library", R006: "buncombe-county-public-libraries",
  R008: "read-to-succeed-asheville-buncombe", R009: "literacy-together", R011: "asheville-city-schools", R012: "medicaid-enrollment",
  R013: "buncombe-county-schools", R014: "caring-for-children-eckerd-connects", R015: "rha-child-first", R016: "cdsa",
  R017: "exceptional-children-s-assistance-center", R018: "family-preservation-services", R020: "blue-ridge-healthy-families", R021: "mahec", R112: "blue-ridge-health-arden-2",
  R022: "family-support-network-of-wnc", R023: "vaya-health", R024: "wnc-community-health-services",
  R025: "wnc-community-health-services-minnie-jones-h", R028: "kaleidoscope-play-learn", R029: "circle-of-security",
  R030: "buncombe-county-public-libraries", R031: "kids-garden-asheville", R032: "buncombe-library-zoom-pass", R033: "homegrown-families",
  R035: "we-rock-the-spectrum", R037: "asheville-parks-rec-soar-scholarships", R041: "babies-need-bottoms", R042: "bear-closets",
  R043: "children-first-communities-in-schools", R045: "family-support-network-of-wnc", R048: "homegrown-families",
  R050: "buncombe-county-register-of-deeds", R051: "sistas-caring-4-sistas", R053: "ywca-womens-empowerment",
  R054: "buy-nothing-groups-and-local-parent-facebook", R055: "buy-nothing-groups-and-local-parent-facebook", R058: "snap", R059: "wic",
  R060: "manna-food-helpline", R061: "community-engagement-markets", R063: "ymca-wnc-mobile-food-markets", R064: "bounty-soul",
  R065: "12-baskets-cafe", R066: "free-fridge-asheville-group", R067: "abccm-crisis-ministries", R068: "eblen-charities",
  R070: "buncombe-dss-emergency-assistance", R071: "liheap", R072: "housing-authority-of-the-city-of-ashevil",
  R073: "mountain-housing-opportunities", R074: "asheville-area-habitat-for-humanity", R075: "ahope-day-center-homeward-bound",
  R077: "community-action-opportunities-weatheriz", R078: "transformation-village-abccm", R079: "catholic-charities", R080: "eblen-charities",
  R081: "salvation-army-shelter", R082: "crisis-intervention-program-cip", R083: "buncombe-dss", R084: "catholic-charities",
  R085: "eblen-charities", R086: "salvation-army-rent-assistance", R087: "helpmate", R088: "our-voice", R089: "angel-s-watch",
  R090: "buncombe-county-family-justice-center", R091: "mountain-child-advocacy-center", R094: "rha-health-services",
  R096: "national-dv-hotline", R098: "988-suicide-crisis-lifeline", R102: "all-souls-counseling-center",
  R103: "sunrise-community-for-recovery-wellness", R106: "youth-outright", R107: "your-next-chapter-counseling",
  R108: "matone-counseling-testing", R109: "winter-to-spring-wellness", R115: "pisgah-institute", R119: "river-of-hope",
  R121: "pinnacle-behavioral-health-wellness", R122: "appalachian-mountain-community-health-center", R123: "firstwnc-sunshine-project",
  R124: "rha-health-services", R125: "autism-society-of-nc", R128: "play-talk-grow-speech-feeding-aac-takes-medi",
  R129: "the-arc-of-buncombe-county", R130: "art-asheville-rides-transit", R131: "mountain-mobility",
  R132: "appalachian-mountain-community-health-center", R133: "pisgah-legal-services", R134: "ymi-cultural-center", R136: "cenzontle",
  R137: "alas-asheville-latin-americans-achieving", R138: "hola-carolina-radio-la-pantera-97-3-fm", R139: "poder-emma",
  R141: "umoja-health-wellness-and-justice-collec", R143: "cima-colaborativa-la-milpa", R144: "colaborativa-la-milpa",
  R148: "meals-on-wheels", R153: "beloved-asheville-asheville-in-black-and-kid", R155: "nc-211", R156: "legal-aid-of-north-carolina",
  R157: "tranzmission", R158: "goodwill-industries", R161: "buncombe-county-public-libraries", R162: "working-wheels",
};
const fun = ["X:*", "X:11"];
const NEW = {
  R007: ["I", ["I:*", "I:8a"]], R010: ["VI", ["VI:*", "VI:4a", "V:*", "V:3a"]], R019: ["VII", ["VII:*", "VII:6a"]],
  R026: ["X", ["X:*", "X:2"]], R027: ["X", ["X:*", "X:2"]], R034: ["I", ["I:*", "I:8a"]],
  R036: ["I", ["I:*", "I:11a", ...fun]], R038: ["I", ["I:*", "I:10a", "I:11a"]], R039: ["I", ["I:*", "I:11a", "VIII:*", "VIII:9a"]],
  R040: ["X", ["VIII:*", "X:*"]], R044: ["V", ["V:*", "V:8a"]], R046: ["IV", ["IV:*", "IV:5a"]], R047: ["III", ["III:*", "III:1a"]],
  R049: ["IV", ["IV:*", "IV:4a"]], R052: ["V", ["V:*", "V:4a", "V:8a"]], R056: ["I", ["I:*", "I:7a"]], R057: ["VIII", ["VIII:*"]],
  R062: ["VIII", ["VIII:*", "VIII:5a"]], R069: ["VIII", ["VIII:*", "VIII:5a", "VIII:11a"]], R076: ["VIII", ["VIII:*", "VIII:6a", "VIII:7a"]],
  R092: ["VII", ["VII:*", "VII:7a"]], R093: ["VIII", ["VIII:*", "VIII:8a", "VII:*", "VII:7a"]], R095: ["VII", ["VII:*", "VII:6a"]],
  R097: ["CRISIS", ["VII:*", "VII:7a"]], R099: ["CRISIS", ["X:*", "X:9"]], R100: ["VII", ["VII:*", "VII:4a"]],
  R101: ["VII", ["VII:*", "VII:4a"]], R104: ["VII", ["VII:*", "VII:4a"]], R105: ["II", ["II:*", "II:6a"]],
  R110: ["VII", ["VII:*", "VII:2a"]], R111: ["VII", ["VII:*", "VII:2a", "VII:5a"]], 
  R113: ["VII", ["VII:*", "VII:3a"]], R114: ["VII", ["VII:*", "VII:6a"]], R116: ["VII", ["VII:*", "VII:2a", "VII:3a"]],
  R117: ["VII", ["VII:*", "VII:2a", "VII:5a"]], R118: ["VII", ["VII:*", "VII:2a"]], R120: ["VII", ["VII:*", "VII:3a"]],
  R126: ["X", ["X:*", "X:7", "IX:*", "IX:11a"]], R127: ["X", ["X:*", "X:7", "IX:*"]], R135: ["X", ["X:*", "X:10", "VIII:*", "VIII:15a"]],
  R140: ["X", ["X:*", "X:10", "IV:*", "IV:3a"]], R142: ["X", ["X:*", "X:10", "X:3"]],
  R145: ["X", ["X:*"]], R146: ["X", ["X:*"]], R147: ["X", ["X:*"]], R149: ["X", ["X:*"]], R150: ["X", ["X:*"]], R151: ["X", ["X:*"]], R152: ["X", ["X:*"]],
  R154: ["IV", ["IV:*", "IV:1a", "IV:5a"]], R159: ["X", ["X:*", "X:5"]], R160: ["X", ["X:*", "X:5"]],
  R163: ["X", fun], R164: ["X", fun], R165: ["X", [...fun, "I:*", "I:11a"]], R166: ["X", fun], R167: ["X", fun],
  R168: ["X", [...fun, "I:*", "I:11a"]], R169: ["X", [...fun, "I:*", "I:11a"]],
};
/* the Public Edition's own known discrepancies, kept where they apply */
const DISC = {
  "bounty-soul": "Sources disagree on the Fairview venue: the official schedule may show 99999 Rocket Dr while an older county guide lists 11 Rocket Dr. Use the current listing and call.",
  "wnc-community-health-services-minnie-jones-h": "Sources disagree on the address: listings show both 154 and 257 Biltmore Ave. Confirm before sending a family.",
  "wnc-minnie-jones-health-center": "Sources disagree on the address: listings show both 154 and 257 Biltmore Ave. Confirm before sending a family.",
  "kaleidoscope-play-learn": "Older flyers and search results conflict on days, sites, eligibility and breaks. Confirm the current schedule.",
  "kaleidoscope-play-learn-2": "Older flyers and search results conflict on days, sites, eligibility and breaks. Confirm the current schedule.",
  R069: "Sources disagree on access: the BPFC directory lists Tuesday to Thursday hours, while another source describes appointment-only access. Call before visiting.",
  R026: "The group's schedule page is dated 2024 and has a malformed end time. Confirm the 2026-27 meetings before sending a family.",
};

const real = (v) => v && !/^Not stated/i.test(String(v).trim()) ? String(v).trim() : "";
const site = (u) => String(u || "").replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
const digits = (p) => String(p || "").split(/[/,]/)[0].replace(/\D/g, "").slice(-10);
const slug = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60).replace(/-+$/, "");
const SRC = (p) => `Buncombe County Family Resource Directory, Public Edition: ${p["Directory Source"]} (${site(p["Source URL"])}), checked 7 Nov 2026`;
const tagsFor = (p) => {
  const offer = p["What It Offers"], cost = real(p["Cost / Insurance"]);
  return [
    /24\/7/.test(real(p["Hours / Timing"])) && "24/7",
    (/^free\b/i.test(cost) || /^free\b/i.test(offer)) && "Free",
    /\bbirth\b|\b0[–-]5\b|\bbabies\b|\btoddlers?\b/i.test(offer) && "Kids / 0-5",
    /\bspanish\b/i.test(p["Program / Resource"] + " " + offer) && "Spanish / bilingual",
    /\blgbtq/i.test(offer) && "LGBTQ+ affirming",
  ].filter(Boolean).join(", ");
};
const addNote = (row, text) => { if (!row.note.includes(text)) row.note = (row.note ? row.note + " " : "") + text; };

const orgCount = {};
for (const p of P) if (NEW[p["Resource ID"]]) orgCount[p.Organization.trim()] = (orgCount[p.Organization.trim()] || 0) + 1;
const log = { matched: 0, filled: [], conflicts: [], srcAdded: 0, added: [] };
const seenSrc = new Set();
for (const p of P) {
  const pid = p["Resource ID"];
  if (M[pid]) {
    const row = find(M[pid]);
    if (!row) throw new Error(`${pid}: no row ${M[pid]}`);
    log.matched++;
    for (const [field, key, norm] of [["w", "Website", site], ["ph", "Phone", (x) => x], ["a", "Address", (x) => x], ["h", "Hours / Timing", (x) => x], ["em", "Email", (x) => x]]) {
      const v = real(p[key]); if (!v) continue;
      const val = norm(v);
      if (field === "w" && /^handsonasheville\.org/.test(val)) continue;
      if (!row[field]) { row[field] = val; log.filled.push(`${row.id}.${field} <- ${val.slice(0, 60)} (${pid})`); }
      else {
        const same = field === "w" ? site(row.w).split("/")[0] === val.split("/")[0]
          : field === "ph" ? digits(row.ph) === digits(val) || row.ph.replace(/\D/g, "").includes(digits(val))
          : row[field].toLowerCase().includes(val.toLowerCase().slice(0, 12));
        if (!same) log.conflicts.push(`${row.id}.${field}: directory "${row[field].slice(0, 50)}" vs Public Edition "${val.slice(0, 50)}" (${pid})`);
      }
    }
    if (!seenSrc.has(row.id)) { row.src += `; also listed in the ${SRC(p)}`; seenSrc.add(row.id); log.srcAdded++; }
    continue;
  }
  if (!NEW[pid]) throw new Error(`${pid} has no decision`);
  const [sec, needs] = NEW[pid];
  const org = p.Organization.trim(), prog = p["Program / Resource"].trim();
  const n = /^[A-Z]{2,6}$/.test(prog) ? `${prog} (${org})` : prog.toLowerCase().includes(org.toLowerCase()) ? prog : org.toLowerCase().includes(prog.toLowerCase()) ? org : `${org}: ${prog}`;
  /* the organisation's name where that is unique, else the full name */
  let id = slug(org);
  if (orgCount[org] > 1 || A.some((a) => a.id === id)) id = slug(n);
  while (A.some((a) => a.id === id)) id += "-pe";
  const extra = [real(p["Eligibility / Population"]) && `Who it serves: ${real(p["Eligibility / Population"])}`, real(p["Cost / Insurance"]) && !(/^free( and confidential)?$/i.test(real(p["Cost / Insurance"])) && /\bfree\b/i.test(p["What It Offers"])) && `Cost: ${real(p["Cost / Insurance"])}`, real(p["Referral / Access Route"]) && `How to get in: ${real(p["Referral / Access Route"])}`, real(p["Documents / ID"]) && `Documents: ${real(p["Documents / ID"])}`].filter(Boolean);
  const row = {
    id, n, pp: "", sp: real(p["Language Access"]) ? "🟠 Interpreter available" : "⚪ Not listed - ask",
    spd: real(p["Language Access"]) || "Not stated in the source. Ask when you call.",
    ph: [real(p.Phone), real(p["Text / Crisis Line"]).replace(/^Text\b/, "text")].filter(Boolean).join(" / "), em: real(p.Email), w: site(p.Website),
    d: [p["What It Offers"].trim(), ...extra].map((x) => /[.!?]$/.test(x) ? x : x + ".").join(" "), a: real(p.Address), h: real(p["Hours / Timing"]),
    os: "Public Edition: " + p.Category, t: tagsFor(p),
    lv: "", vb: "", sec, needs, src: SRC(p) + `; ${p["Verification Tier"]}`, note: "", new: true,
  };
  if (DISC[pid]) row.note = DISC[pid];
  if (pid === "R034") { row.sp = "🟡 Bilingual staff"; row.spd = "The classes are taught in Spanish and English."; }
  if (pid === "R163") row.note = "A traffic and bridge advisory was listed as expected through May 2027. Check directions before traveling (Public Edition, 7 Nov 2026).";
  A.push(row);
  log.added.push(`${id} [${sec}]`);
}
for (const [id, text] of Object.entries(DISC)) if (!/^R\d/.test(id)) addNote(find(id), text);
const PE = "the Public Edition (7 Nov 2026)";
const WEB = {
  "verner-center-for-early-learning": `Sources disagree on the website: this row has verneremail.org, which is also the staff email domain, while ${PE} lists vernerearlylearning.org.`,
  "dolly-parton-s-imagination-library": `Sources disagree on the sign-up page: this row points to Literacy Together (lit-together.org), while ${PE} points to Buncombe Partnership for Children's page, buncombepfc.org/dpil.`,
  "rha-child-first": `${PE[0].toUpperCase() + PE.slice(1)} links Children's Home Society of NC's Child First page (chsnc.org/programs-services/child-first). The referral route above is RHA's.`,
  "blue-ridge-healthy-families": `Sources disagree on the website: ${PE} lists brhealthyfamilies.org.`,
  "poder-emma": `Sources disagree on the website: ${PE} lists PODER Emma's own site, poderemma.org.`,
  "cima-colaborativa-la-milpa": `${PE[0].toUpperCase() + PE.slice(1)} links CIMA's Facebook page, facebook.com/cimawnc.`,
};
for (const [id, text] of Object.entries(WEB)) addNote(find(id), text);
/* the few matched rows where the Public Edition has a real fact the row lacks */
const goodwill = find("goodwill-industries");
if (!/Career Navigator/.test(goodwill.d)) goodwill.d += " At a Career Center, ask to meet with a Career Navigator. Goodwill's own services are free; partner courses may charge fees, with tuition help for people who qualify (Public Edition, 7 Nov 2026).";
const tranz = find("tranzmission");
if (!/caregiver/i.test(tranz.d)) tranz.d += " Some groups are for supportive parents and caregivers (Public Edition, 7 Nov 2026).";
const legal = find("legal-aid-of-north-carolina");
addNote(legal, "Sources disagree on the office: the Public Edition (7 Nov 2026, from Legal Aid of NC's office list) names the Morganton office (211 E Union St, 828-437-8280 or 800-849-5195) as the one serving Buncombe, while this row lists an Asheville office at 20 Artful Way. Call the helpline to confirm which office takes the case.");
f.meta.count = A.length;
if (!f.meta.sources.some((s) => /Public Edition/.test(s))) f.meta.sources.push("Buncombe County Family Resource Directory, Public Edition (169 resources checked 7 Nov 2026; mostly the Buncombe Partnership for Children family-resource directory, 16 from official sites)");
console.log(`matched ${log.matched} public records to ${seenSrc.size} rows; filled ${log.filled.length} blank fields; ${log.conflicts.length} conflicts; added ${log.added.length} rows; total ${A.length}`);
console.log("\nfilled:\n  " + log.filled.join("\n  "));
console.log("\nconflicts (kept the directory's value):\n  " + (log.conflicts.join("\n  ") || "none"));
console.log("\nadded:\n  " + log.added.join("\n  "));
if (flag === "--write") { fs.writeFileSync(path, JSON.stringify(f, null, 1) + "\n"); console.log("\nwritten"); }
