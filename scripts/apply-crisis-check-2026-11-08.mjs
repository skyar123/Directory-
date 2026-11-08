/*
 * Crisis rows check, finished 2026-11-08 (searches run 6 and 8 Nov 2026).
 *
 * The rest of the CRISIS section was unverified. Four rows are now confirmed
 * against official sources, and three carried information that is out of
 * date or could not be confirmed at all:
 *  - Community Paramedics / MCOT listed numbers that appear nowhere in the
 *    county's own directory, which gives the 24/7 line as 828-772-1294.
 *  - Mission's Copestone unit was replaced in August 2023 by the Sweeten Creek
 *    Mental Health & Wellness Center.
 *  - "The Bridges Crisis and Assessment Center" is the name of a juvenile
 *    crisis center in Winston-Salem, and nothing turns up at 1984 Hendersonville
 *    Rd. The row now says so instead of looking verified.
 *
 * Same rules as the accuracy pass: rows confirmed against an official source
 * carry vb "SB (web search)"; nothing is filled from guesswork.
 * Run once. Kept in the repo as the record of where these edits came from.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SEARCHED = "2026-11-06";
const WEB6 = "web search, 6 Nov 2026";
const WEB8 = "web search, 8 Nov 2026";
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");

const load = (f) => {
  const path = new URL(`../data/${f}`, import.meta.url);
  return { path, file: JSON.parse(readFileSync(path, "utf8")) };
};
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const clean = (v) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  if (DASH.test(s)) throw new Error(`dash in added text: ${s.slice(0, 90)}`);
  return v;
};

const res = load("resources.json");
const byId = new Map(res.file.resources.map((r) => [r.id, r]));
const expect = (r, key, value) => {
  if (r[key] !== value) throw new Error(`${r.id}.${key} is ${JSON.stringify(r[key])}, expected ${JSON.stringify(value)}`);
};
const appendSrc = (r, text) => { r.src = `${r.src.trim()}; ${clean(text)}`; };
const webVerified = (r) => { r.lv = SEARCHED; r.vb = "SB (web search)"; };
const patch = (id, fn) => {
  const r = byId.get(id);
  if (!r) throw new Error(`no resource with id ${id}`);
  fn(r);
  clean(r);
  console.log("patched:", id);
};

patch("report-child-abuse-neglect-buncombe-dss-cps", (r) => {
  expect(r, "ph", "828-250-5900");
  r.w = "buncombenc.gov/476/Adult-Child-Intake";
  r.a = "40 Coxe Ave, Asheville (Social Work Services)";
  r.d = "828-250-5900 (24/7). Reports can be made any time, day or night, and no appointment is needed.";
  webVerified(r);
  appendSrc(r, `24/7 reporting confirmed on Buncombe County's Adult & Child Intake and Child & Family Services pages via ${WEB6}`);
});

patch("rha-mobile-crisis-response-comes-to-you-11-c", (r) => {
  expect(r, "ph", "1-888-573-1006");
  r.w = "rhahealthservices.org";
  r.a = "Comes to the person: home, school or workplace";
  r.h = "24/7/365";
  r.d = "1-888-573-1006. RHA's Mobile Crisis Management West team covers 11 WNC counties, including Buncombe, "
    + "around the clock. A person answers first to talk through the situation, and the team can come to a home, "
    + "school or workplace. A 2019 county crisis guide gave an average response time of about 2 hours.";
  webVerified(r);
  appendSrc(r, `hours, coverage and process from RHA's site and the NCDHHS mobile crisis team directory via ${WEB6}`);
});

patch("vaya-health-behavioral-health-crisis-line", (r) => {
  expect(r, "ph", "1-800-849-6127");
  r.w = "vayahealth.com/contact";
  r.h = "24/7, including holidays";
  r.d = "1-800-849-6127, TTY 711. Free and confidential for anyone living in Vaya's region: a live person screens "
    + "the call, helps through the crisis, can send a mobile crisis team, and makes appointment referrals.";
  webVerified(r);
  appendSrc(r, `re-checked on vayahealth.com's contact and crisis line pages via ${WEB6}`);
});

patch("community-paramedics-mcot", (r) => {
  expect(r, "ph", "828-772-0666 / 828-337-9711");
  r.ph = "828-772-1294 (24/7) / 828-318-4179 (general)";
  r.w = "buncombenc.gov/1134/Community-Paramedics";
  r.a = "Mobile, Buncombe County";
  r.h = "24/7 line";
  r.d = "Buncombe County EMS Community Paramedics run two teams: PORT (post-overdose response) and MCOT, where "
    + "EMTs and mental health clinicians bring non-emergency primary care, mental health care and wound care to "
    + "unhoused and under-resourced people. County 24/7 line 828-772-1294; general questions 828-318-4179. The "
    + "numbers this row listed before (828-772-0666, and 828-337-9711 for PORT) do not appear in the county's "
    + "directory. See also the PORT row.";
  webVerified(r);
  appendSrc(r, `phones and team description from Buncombe County's Community Paramedics page and staff directory via ${WEB6}`);
});

patch("mission-hospital-copestone", (r) => {
  expect(r, "n", "Mission Hospital / Copestone");
  r.n = "Mission Hospital emergency department / Sweeten Creek Mental Health & Wellness Center (replaced Copestone)";
  r.d = "Copestone, Mission's behavioral health unit, was replaced in August 2023 by the 120-bed Sweeten Creek "
    + "Mental Health & Wellness Center at 32 Apex Circle, Asheville, owned by Mission Health (HCA). Admission "
    + "starts with a medical screening by an emergency physician, usually in Mission's emergency department at "
    + "509 Biltmore Ave, which has its own psychiatric evaluation area. Directory listings give 828-213-1111, "
    + "Mission's main number, for Sweeten Creek too. This row used to say it included pediatric behavioral health; "
    + "confirm which ages Sweeten Creek admits.";
  appendSrc(r, `Copestone's replacement, address and admission route from WUNC, WFAE and directory listings via ${WEB6} and ${WEB8}`);
});

patch("the-bridges-crisis-and-assessment-center", (r) => {
  expect(r, "n", "The Bridges Crisis and Assessment Center");
  r.n = "The Bridges Crisis and Assessment Center (name and address unconfirmed)";
  r.note = "Could not be confirmed. The Bridges is a juvenile crisis and assessment center in Winston-Salem, and "
    + "nothing turns up at 1984 Hendersonville Rd. For a child in a psychiatric crisis use the Caiyalynn Burrell "
    + "Child Crisis Center (277 Biltmore Ave, 24/7) or RHA Mobile Crisis, 1-888-573-1006.";
  r.readFirst = true;
  r.d = "1984 Hendersonville Rd. Short-term youth stabilization. Asheville's own juvenile crisis and assessment "
    + "center is the Western Area Multi-Purpose Juvenile Crisis and Assessment Center, 20 Lees Creek Rd: nine beds, "
    + "run with the Methodist Home for Children, for youth in the juvenile justice system who need a temporary "
    + "placement, so families do not refer to it directly.";
  /* the August verification note itself said to confirm the name, so the
     verified badge was overstating it */
  r.lv = "";
  r.vb = "";
  appendSrc(r, `name traced to Winston-Salem and the Lees Creek Rd center found through NC DPS press releases via `
    + `${WEB6} and ${WEB8}; verified date cleared because the name and address could not be confirmed`);
});

save(res);

const cl = load("changelog.json");
const group = (id) => cl.file.groups.find((g) => g.id === id);
group("open-questions").entries.unshift(clean({
  date: "OPEN",
  what: "What is 'The Bridges Crisis and Assessment Center' row?",
  detail: "Its name belongs to a juvenile crisis and assessment center in Winston-Salem, and nothing turns up at "
    + "1984 Hendersonville Rd. It may be a garbled copy of Asheville's Western Area Multi-Purpose Juvenile Crisis "
    + "and Assessment Center (20 Lees Creek Rd), which takes youth from the juvenile justice system, not family "
    + "referrals. Ask RHA (1-800-848-0180) and then rename the row or mark it closed.",
  source: "Crisis rows check, web search 6 and 8 Nov 2026",
}));
group("added").entries.unshift(clean({
  date: "Nov 8 2026",
  what: "Crisis rows checked: two wrong or stale rows fixed, four confirmed",
  detail: "Community Paramedics / MCOT listed numbers that are not in the county's directory; its 24/7 line is "
    + "828-772-1294. Mission's Copestone unit was replaced in 2023 by the Sweeten Creek Mental Health & Wellness "
    + "Center. 'The Bridges Crisis and Assessment Center' could not be confirmed and now says so. Confirmed "
    + "against official sources: the child abuse report line (24/7), RHA Mobile Crisis (24/7, 11 counties), the "
    + "Vaya crisis line (24/7 including holidays) and MCOT's new numbers, each now with a website.",
  source: "scripts/apply-crisis-check-2026-11-08.mjs",
}));
save(cl);
console.log("changelog updated");
