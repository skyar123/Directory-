/* Second Drive pass, 7 Nov 2026: the family-resource files the first pass
   left as candidates (kinship benefits, the March caregiver guide, respite
   options, a caregiver therapy handout, drop-in movement options), read under
   the same rules and applied the same way as apply-drive-merge-2026-11-07.mjs:
   text is appended, blanks filled, disagreements go in note.
     node scripts/apply-drive-followup-2026-11-07.mjs [--write] */
import { readFileSync, writeFileSync } from "node:fs";
const DATA = {
 "enrich": [
  {
   "id": "nc-kinship-relative-care",
   "src": "Drive: Asheville NC Kinship Care Benefits (Jul 2026), citing NCDHHS, S.L. 2023-14 and S.L. 2025-16",
   "add": "For a child in DSS custody placed with relatives, per the Drive kinship guide: an unlicensed kinship caregiver can get a monthly payment of half the foster care board rate (the guide gives $351 a month for ages 0 to 5 against a $702 board rate) after signing the DSS-5802 acknowledgement and the county's checks. A licensed kinship foster home gets the full rate; the kinship licensing track is 15 hours of training instead of 30, plus fingerprints for adults in the home, medical exams with a TB test, a fire inspection, CPR and first aid, and a no-spanking agreement. Children in DSS custody get priority child care vouchers with no parent fee (the social worker applies through NC FAST; over-market fees are not covered), Medicaid to age 26, and CMARC care management for ages 0 to 5. In Buncombe a Kinship Support Specialist calls relative caregivers in the second week of a placement.",
   "note": "Check before planning guardianship: the Drive kinship guide says that under S.L. 2025-16 a child generally has to be at least 10 for KinGAP guardianship assistance (unless placed with an older sibling), so guardianship of a young child could end the monthly payment. Confirm with the social worker and the Guardian ad Litem first."
  },
  {
   "id": "bear-closets",
   "src": "Drive: Asheville NC Kinship Care Benefits (Jul 2026), citing the BEAR Closet sites' pages",
   "add": "Hours per the Drive kinship guide: St. Paul's UMC, 223 Hillside St, 2nd and 4th Wednesdays 4-6pm and Thursdays by appointment; Weaverville UMC, 90 N Main St, order online ahead for curbside pickup, 1st and 3rd Mondays 5-7pm and 2nd, 4th and 5th Mondays 10am-noon; Abernethy UMC, 1418 Patton Ave, 1st and 3rd Wednesdays 10am-2pm; also Snow Hill and East Asheville UMC. Small items are given; big equipment is loaned and returned when outgrown. Clothing to 6T, toddler car seats and boosters, potty chairs, pull-ups."
  },
  {
   "id": "foster-and-kinship-closets-giving-tree-foste",
   "src": "Drive: Asheville NC Kinship Care Benefits (Jul 2026)",
   "add": "Buncombe County HHS also keeps a Foster Closet of free clothing and items for children in foster care; ask the child's social worker."
  },
  {
   "id": "asheville-museum-of-science",
   "src": "Drive: Free Events and Programs for Caregivers of Children Ages 1-5, WNC Caregiver Resource Guide (compiled 6 Mar 2026)",
   "add": "Museums for All: $5 a person with an EBT card and photo ID, up to 4 people (per the March 2026 guide). Free with a library ZOOM Pass too."
  },
  {
   "id": "asheville-art-museum",
   "src": "Drive: Free Events and Programs for Caregivers of Children Ages 1-5, WNC Caregiver Resource Guide (compiled 6 Mar 2026)",
   "add": "Takes part in Museums for All (reduced admission with an EBT card), and children under 6 are always free (per the March 2026 guide)."
  },
  {
   "id": "nc-division-of-services-for-the-deaf-and-har",
   "src": "Drive: Free Events and Programs for Caregivers of Children Ages 1-5, WNC Caregiver Resource Guide (compiled 6 Mar 2026)",
   "add": "Community connections, per the March 2026 guide: Asheville Deaf Chat, first Tuesdays 5:30-8pm at the Starbucks at 211 River Ford Pkwy, for Deaf and hard-of-hearing people, ASL learners and families; HLAA Asheville, third Saturdays at CarePartners' Seymour Auditorium (hlaa.asheville@gmail.com); free statewide virtual ASL classes (ask the regional center for the calendar); MyDeafChild.org gives families of a deaf child 0-3 free Sign It ASL. The guide found no regular in-person ASL storytime or DHH playgroup for ages 1-5 in Asheville, so virtual storytimes plus the regional center are the best current route."
  },
  {
   "id": "council-on-aging-of-buncombe-county",
   "src": "Drive: Respite Options for Caregivers (Jul 2026; checked against each organization's published information and an FFA-NC coach)",
   "add": "Family Caregiver Support Program, per the Drive respite guide: for grandparents and other relatives 55 or older raising a child in Buncombe or Madison; it can pay for a week of summer camp, after-school fees or short-term daytime care, not overnight care. Ask for the Family Caregiver Support Specialist, ext. 1303. CAPES caregiver support group: third Tuesday of the month at 2pm.",
   "note": "CAPES meeting place differs between listings: the Council on Aging site gives First Baptist Church Asheville, 5 Oak St, Room SC207; other directories give CenterWell Primary Care on Patton Ave. Confirm when you call."
  },
  {
   "id": "nc-lifespan-respite",
   "src": "Drive: Respite Options for Caregivers (Jul 2026; checked against each organization's published information and an FFA-NC coach)",
   "add": "Up to $750 a year in vouchers to hire a respite provider the family chooses (18 or older, not living in the home). Needs a referral from a professional such as the Family Resource Partner, a social worker or a care coordinator. Cannot be used for child care during regular work hours."
  },
  {
   "id": "buncombe-county-kinship-support-group",
   "src": "Drive: Respite Options for Caregivers (Jul 2026; checked against each organization's published information and an FFA-NC coach)",
   "add": "For grandparents, aunts, uncles, cousins and family friends raising a child, with or without a court order; meets twice a month at Skyland United Methodist Church. To join, email luv4kin@gmail.com with who you are and who you are raising."
  },
  {
   "id": "ymca-after-school",
   "src": "Drive: Respite Options for Caregivers (Jul 2026; checked against each organization's published information and an FFA-NC coach)",
   "add": "Youth Services: ybc@ymcawnc.org. Options include full-time (41 weeks) or 3-day after-school, drop-in, and year-round plans with summer camp. The 21st Century Horizons program gives free after-school care at select Buncombe middle and intermediate schools. Y-Access asks for a tax return, two pay stubs or a benefits letter, and a county voucher application first."
  },
  {
   "id": "your-next-chapter-counseling",
   "src": "Drive: Therapy & Mental Health Resources for foster families (Child First handout, Jun 2026)",
   "add": "Samantha Morgan, LCSW, is certified in Child-Parent Psychotherapy (CPP) and EMDR, with a focus on complex trauma, attachment disruption and early childhood; about $150 a session, takes major commercial insurance (per the June 2026 handout)."
  },
  {
   "id": "winter-to-spring-wellness",
   "src": "Drive: Therapy & Mental Health Resources for foster families (Child First handout, Jun 2026)",
   "add": "Sarah Anderson, LCMHCS, is certified in Child-Parent Psychotherapy (CPP) and sees ages 2 to 18, using Triple P and Conscious Discipline. Per the June 2026 handout the practice takes Healthy Blue, Vaya and WellCare Medicaid as well as self-pay."
  }
 ],
 "resources": [
  {
   "n": "CMARC: Care Management for At-Risk Children (ages 0-5)",
   "sec": "III",
   "needs": [
    "III:*",
    "II:*",
    "IV:*"
   ],
   "os": "Drive: Asheville NC Kinship Care Benefits",
   "t": "Free, Kids / 0-5",
   "d": "Free statewide care management for children birth to 5 facing toxic stress or adverse experiences (children removed from home included) or with special health needs: a care manager helps the family through medical appointments, behavior worries and developmental milestones. It replaced CC4C (Care Coordination for Children), and children entering foster care get these calls. Ask the child's doctor or Medicaid health plan for a referral.",
   "src": "Drive: Asheville NC Kinship Care Benefits (Jul 2026), citing NCDHHS"
  },
  {
   "n": "Botanical Gardens at Asheville",
   "sec": "X",
   "needs": [
    "X:*",
    "X:11"
   ],
   "os": "Drive: WNC Caregiver Resource Guide, March 2026",
   "t": "Free, Kids / 0-5",
   "a": "151 W.T. Weaver Blvd, Asheville (next to UNC Asheville)",
   "w": "ashevillebotanicalgarden.org",
   "h": "Grounds dawn to dusk daily; visitor center 10am-4pm",
   "d": "Free 10-acre garden of native Southern Appalachian plants with free parking: a flat half-mile loop trail, a creek and footbridges, a meadow and picnic spots. One of the best truly free toddler nature outings. A free Kids Investigation Passport scavenger hunt (ages 4 to 10) is at the visitor center.",
   "src": "Drive: Free Events and Programs for Caregivers of Children Ages 1-5, WNC Caregiver Resource Guide (compiled 6 Mar 2026); Drive: Asheville Family Weekend Guide (4-6 Sep 2026) for the passport and visitor-center hours"
  },
  {
   "n": "Folk Art Center (Southern Highland Craft Guild)",
   "sec": "X",
   "needs": [
    "X:*",
    "X:11"
   ],
   "os": "Drive: WNC Caregiver Resource Guide, March 2026",
   "t": "Free",
   "a": "Blue Ridge Parkway Milepost 382, Asheville",
   "w": "southernhighlandguild.org",
   "d": "Free galleries of Appalachian craft, stroller-accessible, with free parking; guild artists often demonstrate carving, weaving and pottery during the day.",
   "note": "Hours differ between the Drive guides (9am-5pm in March; 10am-5pm with demonstrations 10am-4pm in September). Check before going.",
   "src": "Drive: Free Events and Programs for Caregivers of Children Ages 1-5, WNC Caregiver Resource Guide (compiled 6 Mar 2026); Drive: Asheville Family Weekend Guide (4-6 Sep 2026)"
  },
  {
   "n": "WNC Farmers Market",
   "sec": "X",
   "needs": [
    "X:*",
    "X:11",
    "VIII:*"
   ],
   "os": "Drive: WNC Caregiver Resource Guide, March 2026",
   "a": "570 Brevard Rd, Asheville",
   "h": "Daily 8am-5pm",
   "d": "Year-round state farmers market, free to browse, with produce, honey, jams and crafts. Takes SNAP/EBT. An easy, low-pressure family outing.",
   "src": "Drive: Free Events and Programs for Caregivers of Children Ages 1-5, WNC Caregiver Resource Guide (compiled 6 Mar 2026); Drive: Asheville Family Weekend Guide (4-6 Sep 2026)"
  },
  {
   "n": "The Incredible Years parenting program",
   "sec": "IV",
   "needs": [
    "IV:*",
    "IV:4a",
    "II:*"
   ],
   "os": "Drive: WNC Caregiver Resource Guide, March 2026",
   "t": "Free, Kids / 0-5",
   "w": "buncombepfc.org",
   "d": "Free parent education groups for families of children 3 to 5 with challenging behavior, offered through Buncombe Partnership for Children and FIRST WNC (per the March 2026 guide). Ask BPFC when the next group starts.",
   "src": "Drive: Free Events and Programs for Caregivers of Children Ages 1-5, WNC Caregiver Resource Guide (compiled 6 Mar 2026)"
  },
  {
   "n": "Free outdoor and nature play for young children",
   "sec": "X",
   "needs": [
    "X:*",
    "X:11",
    "I:*",
    "I:11a"
   ],
   "os": "Drive: WNC Caregiver Resource Guide, March 2026",
   "t": "Free, Kids / 0-5",
   "d": "Free options from the March 2026 guide: Growing Wild Forest School's open house, a free nature play morning for ages 3 to 6 on the first Saturday of the month (West Asheville); Asheville Farmstead School's monthly free Discovery Days on the farm and in the forest; Hike It Baby / OutGrown community hikes for ages 0 to 5 (find the local chapter online or on Facebook); Kids in Parks TRACK Trails, self-guided trails with brochures and prizes; Buncombe Partnership for Children's Adventure Play pop-up playgrounds (6 to 12 a year); and Asheville Parks & Recreation's Rec 'n' Roll mobile fun van. Easy stroller walks: the Botanical Gardens loop, Bent Creek's Lake Powhatan Homestead Trail, Richmond Hill Park.",
   "note": "Compiled March 2026; dates and locations of the monthly programs change. Check each before going.",
   "src": "Drive: Free Events and Programs for Caregivers of Children Ages 1-5, WNC Caregiver Resource Guide (compiled 6 Mar 2026)"
  }
 ],
 "events": []
};

const root = new URL("../data/", import.meta.url);
const load = (f) => {
  const raw = readFileSync(new URL(f, root), "utf8");
  const j = JSON.parse(raw);
  if (JSON.stringify(j, null, 1) + "\n" !== raw) throw new Error(f + " would not round-trip");
  return j;
};
const res = load("resources.json"), ev = load("events.json");
const R = res.resources;
const find = (id) => R.find((r) => r.id === id) || (id.endsWith("*") && R.find((r) => r.id.startsWith(id.slice(0, -1))));
const sentence = (s) => (/[.!?)]$/.test(s) ? s : s + ".");
const slug = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/['’]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 56).replace(/-+$/, "");
const log = { enriched: [], filled: [], noted: [], added: [], events: [] };

for (const e of DATA.enrich) {
  const r = find(e.id);
  if (!r) throw new Error("no resource " + e.id);
  if (e.add && !r.d.includes(e.add.slice(0, 60))) { r.d = (r.d ? sentence(r.d.trim()) + " " : "") + e.add; log.enriched.push(r.id); }
  for (const k of ["a", "ph", "h"]) if (e[k] && !r[k]) { r[k] = e[k]; log.filled.push(`${r.id}.${k}`); }
  if (e.note && !r.note.includes(e.note.slice(0, 60))) { r.note = (r.note ? sentence(r.note.trim()) + " " : "") + e.note; log.noted.push(r.id); }
  const tag = "; " + e.src;
  if (!r.src.includes(e.src)) r.src += tag;
}

for (const n of DATA.resources) {
  if (R.some((r) => r.n === n.n)) continue;
  let id = slug(n.n);
  while (R.some((r) => r.id === id)) id += "-2";
  R.push({
    id, n: n.n, pp: "", sp: n.sp || "⚪ Not listed - ask", spd: n.spd || "Not stated in the source. Ask when you call.",
    ph: n.ph || "", em: n.em || "", w: n.w || "", d: n.d, a: n.a || "", h: n.h || "", os: n.os, t: n.t || "",
    lv: "", vb: "", sec: n.sec, needs: n.needs, src: n.src, note: n.note || "", new: true,
  });
  log.added.push(`${id} [${n.sec}]`);
}
res.meta.count = R.length;

for (const e of DATA.events) {
  const id = slug(e.what) + "-" + e.date;
  if (ev.events.some((x) => x.id === id)) continue;
  const verified = /checked by web search/.test(e.src);
  ev.events.push({
    id, date: e.date, ...(e.end && { end: e.end }), ...(e.time && { time: e.time }), kind: e.kind || "event", what: e.what,
    ...(e.where && { where: e.where }), ...(e.detail && { detail: e.detail }), ...(e.note && { note: e.note }),
    tags: e.tags || [], ...(e.ph && { ph: e.ph }), ...(e.w && { w: e.w }), ...(e.rid && { rid: e.rid }),
    ...(verified && { lv: "2026-11-07", vb: "SB (web search)" }), src: e.src,
  });
  log.events.push(id);
}
ev.events.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

console.log(`enriched ${log.enriched.length} rows, filled ${log.filled.length} blanks, ${log.noted.length} notes, added ${log.added.length} rows and ${log.events.length} events; ${R.length} resources`);
console.log("enriched:", log.enriched.join(", "));
console.log("filled:", log.filled.join(", "));
console.log("notes:", log.noted.join(", "));
console.log("added:", log.added.join(", "));
console.log("events:", log.events.join(", "));
if (process.argv.includes("--write")) {
  writeFileSync(new URL("resources.json", root), JSON.stringify(res, null, 1) + "\n");
  writeFileSync(new URL("events.json", root), JSON.stringify(ev, null, 1) + "\n");
  console.log("written");
}
