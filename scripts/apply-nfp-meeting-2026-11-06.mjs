/*
 * Applies what came out of the Nurse-Family Partnership community partner
 * meeting on 2026-11-06, plus the family resources worth keeping from the
 * Facebook deep scrape (parts 1 to 4) and two family weekend guides shared
 * the same day.
 *
 * Provenance rule: a row gets lv = 2026-11-06 only when someone from the
 * organisation gave the contact at the meeting. Facts found by web search or
 * on Facebook are cited in src but leave lv alone, so the card keeps saying
 * "Never verified" until somebody calls. Organisation web pages could not be
 * opened from the session that made these edits (its network policy blocks
 * them), so anything beyond the meeting notes was checked through web search
 * results and says so in src.
 *
 * The weekend guides read as machine-written and disagree with this directory
 * in places, so nothing was taken from them unless search backed it up.
 *
 * Run once. Kept in the repo as the record of where these edits came from.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DAY = "2026-11-06";
const MEET = "Nurse-Family Partnership community partner meeting, 6 Nov 2026 (Skylar's notes)";
const WEB = "web search, 6 Nov 2026";
const FB = "Facebook deep scrape, 6 Nov 2026";

const load = (f) => {
  const path = new URL(`../data/${f}`, import.meta.url);
  return { path, file: JSON.parse(readFileSync(path, "utf8")) };
};
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");

/* the maintainer never writes em or en dashes, so refuse to add one */
const clean = (v) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  if (/[\u2013\u2014]/.test(s)) throw new Error(`dash in added text: ${s.slice(0, 90)}`);
  return v;
};

/* ------------------------------------------------------------ resources */

const res = load("resources.json");
const R = res.file.resources;
const byId = new Map(R.map((r) => [r.id, r]));

const appendTo = (r, key, text) => {
  clean(text);
  const cur = (r[key] || "").trim();
  if (!cur) r[key] = text;
  else if (key === "src") r[key] = `${cur}; ${text}`;
  else r[key] = `${cur}${/[.!?)]$/.test(cur) ? "" : "."} ${text}`;
};
const addNeeds = (r, ...keys) => {
  r.needs = [...new Set([...r.needs, ...keys])].sort();
};
const patch = (id, fn) => {
  const r = byId.get(id);
  if (!r) throw new Error(`no resource with id ${id}`);
  fn(r);
  clean(r);
  console.log("patched:", id);
};
const verifiedAtMeeting = (r) => { r.lv = DAY; r.vb = "SB"; };

const NOT_LISTED = ["⚪ Not listed - ask", "Not stated in the source. Ask when you call."];
const PUBLIC = ["🟠 Interpreter available",
  "Federally or publicly funded: a free qualified interpreter must be provided on request. Ask for one when you call."];

const add = (o) => {
  if (byId.has(o.id)) throw new Error(`already there: ${o.id} (has this script run before?)`);
  const [sp, spd] = o.lang || NOT_LISTED;
  const r = {
    id: o.id, n: o.n, pp: o.pp || "", sp, spd, ph: o.ph || "", em: o.em || "", w: o.w || "",
    d: o.d, a: o.a || "", h: o.h || "", os: o.os, t: o.t || "",
    lv: o.metAtMeeting ? DAY : "", vb: o.metAtMeeting ? "SB" : "",
    sec: o.sec, needs: [...o.needs].sort(), src: o.src, note: o.note || "", new: true,
  };
  clean(r);
  R.push(r);
  byId.set(r.id, r);
  console.log("added:", r.id);
};

/* --- the meeting: existing rows ---------------------------------------- */

patch("project-cara-mahec", (r) => {
  r.pp = "Caitlin Hettich";
  appendTo(r, "d", "Prenatal and postpartum medical care plus SUD treatment for people with a history of "
    + "substance use disorder; serves people who are pregnant or less than a year postpartum and in "
    + "recovery or seeking it. Refer by calling 828-255-5542 or through the online referral form on "
    + "MAHEC's Project CARA page; self-referral is fine. Point person Caitlin Hettich "
    + "(caitlin.hettich@mahec.net, direct 828-708-8560) welcomes collaboration and can connect partners "
    + "with MAHEC meetings. Patients come from across WNC, not only Buncombe.");
  addNeeds(r, "X:*", "X:2");
  verifiedAtMeeting(r);
  appendTo(r, "src", `referral route and point person from ${MEET}; eligibility from MAHEC and `
    + `NC Health News coverage via ${WEB}`);
});

patch("project-cara", (r) => {
  r.pp = "Caitlin Hettich";
  r.ph = "828-255-5542";
  r.em = "projectcara@mahec.net";
  r.w = "mahec.net";
  r.d = "perinatal substance use treatment at MAHEC (see 8.4): prenatal and postpartum care plus SUD "
    + "treatment. Refer at 828-255-5542 or through MAHEC's online referral form. Point person Caitlin Hettich.";
  verifiedAtMeeting(r);
  appendTo(r, "src", `referral route and point person from ${MEET}`);
});

patch("wic", (r) => {
  r.w = "ncdhhs.gov/ncwicreferral";
  appendTo(r, "d", "For pregnant and postpartum parents, infants, and children under 5: nutrition support, "
    + "healthy foods, breastfeeding support, and referrals. A family or a partner can submit the NC WIC "
    + "Families Referral Form online (ncdhhs.gov/ncwicreferral) and the WIC clinic picked on the form "
    + "contacts the family, within 20 days and often sooner according to NCDHHS.");
  addNeeds(r, "X:*", "X:2");
  appendTo(r, "src", `online referral form from ${MEET}; 20-day follow-up from an NCDHHS WIC outreach `
    + `newsletter via ${WEB}`);
});

patch("pregnancy-medicaid-and-wic", (r) => {
  appendTo(r, "d", "WIC can also start from the online referral form, ncdhhs.gov/ncwicreferral. Medicaid "
    + "immigration rules changed on 1 Oct 2026, but lawfully residing pregnant and postpartum people keep "
    + "coverage (see What changed).");
  appendTo(r, "src", `WIC form and Medicaid note from ${MEET}`);
});

patch("helpmate", (r) => {
  const before = "Free confidential shelter (~25 beds)";
  if (!r.d.includes(before)) throw new Error("Helpmate detail no longer says ~25 beds");
  r.d = r.d.replace(before, "Free confidential shelter (expanded in 2026, see below)");
  appendTo(r, "d", "2026 update from the 6 Nov NFP partner meeting: new shelter space with beds, including "
    + "two spaces designated for children; confirm availability on the hotline before promising a bed. "
    + "Press coverage describes a move to a larger confidential site (the old shelter had about 20 beds; "
    + "43 were planned). Court advocacy continues, and there are Tuesday classes on different topics. "
    + "Professionals can call the 24/7 hotline for a consultation or to make a referral.");
  verifiedAtMeeting(r);
  appendTo(r, "src", `shelter update, classes and professional consultation from ${MEET}; bed counts from `
    + `WLOS and SECU Foundation coverage via ${WEB}`);
});

patch("helpmate-domestic-violence-hotline", (r) => {
  r.d = "828-254-0516, answered 24/7. Professionals can call for a consultation or to make a referral.";
  r.h = "24/7";
  verifiedAtMeeting(r);
  appendTo(r, "src", `hotline and professional consultation from ${MEET}`);
});

patch("helpmate-confidential-dv-shelter", (r) => {
  r.d = "via 24/7 hotline 828-254-0516. New shelter space with more beds, including two spaces designated "
    + "for children (NFP partner meeting, 6 Nov 2026). Confirm availability on the hotline before promising a bed.";
  appendTo(r, "src", `shelter update from ${MEET}`);
});

for (const id of ["ywca-motherlove", "ywca-getting-ahead"]) {
  patch(id, (r) => {
    r.pp = "Tangie Ballard Bowman";
    r.w = "ywcaofasheville.org";
    appendTo(r, "d", "Part of YWCA Women's Empowerment, directed by Tangie Ballard Bowman. Clients call "
      + "828-254-7206 ext. 104.");
    appendTo(r, "src", `director and client extension from ${MEET}`);
  });
}

patch("pisgah-legal-services", (r) => {
  appendTo(r, "d", "Health care access (6 Nov 2026 NFP partner meeting): free legal help with eligible "
    + "health care access and coverage problems from Shoshana Barton, 828-210-3786; free Marketplace "
    + "enrollment help by appointment at 828-210-3404. See the separate health access entry.");
  appendTo(r, "src", `health access contacts from ${MEET}`);
});

patch("goodwill-industries", (r) => {
  r.w = "goodwillnwnc.org";
  appendTo(r, "d", "Goodwill also runs Justice Navigation Services for people involved with the justice "
    + "system: see that entry (contact Melissa Chambers).");
  appendTo(r, "src", `Justice Navigation from ${MEET}`);
});

for (const id of ["sistas-caring-4-sistas", "sistas-caring-4-sistas-2"]) {
  patch(id, (r) => {
    r.pp = "Co-kema King";
    appendTo(r, "d", "Nov 2026: limited openings for families due in December, January, and February. "
      + "Support includes prenatal visits and childbirth education, continuous labor support, postpartum "
      + "visits, newborn feeding support, and connections to local resources, subject to eligibility and "
      + "scheduling. Doula support contact named at the 6 Nov NFP partner meeting: Co-kema King (role and "
      + "referral steps to be confirmed).");
    appendTo(r, "src", `winter openings from an SC4S availability post in Facebook groups, 5 Nov 2026; `
      + `Co-kema King from ${MEET}`);
  });
}

/* the "big shout out" from the meeting. It was already here; the tags said
   Medicaid while the note said it takes no insurance, and the language badge
   was the generic federal-funding one although the August sweep found
   bilingual counselling */
patch("all-souls-counseling-center", (r) => {
  [r.sp, r.spd] = ["🟡 Bilingual staff",
    "Bilingual English/Spanish counseling available (Aug 2026 sweep). Ask for a Spanish-speaking therapist."];
  r.d = "Sliding-scale counseling for uninsured and underinsured WNC residents: individual, couples, and "
    + "group counseling with licensed therapists, in person or virtual. No one is turned away for inability "
    + "to pay, the scale goes down to $0, and in 2023 most sessions cost $25 or less. Does not bill Medicaid, "
    + "Medicare, or private insurance, so no insurance card is needed, which makes it a key option for "
    + "undocumented clients. Typically a 2 to 4 week waitlist. Also places therapists inside partner "
    + "community organizations. Got a shout-out at the 6 Nov 2026 Nurse-Family Partnership partner meeting. "
    + "allsoulscounseling.org";
  r.t = "Sliding scale, Spanish / bilingual | Verified 8/2026. Sliding scale for uninsured and underinsured "
    + "adults, no one turned away. Does NOT bill insurance or take Medicaid. Bilingual English/Spanish "
    + "counseling available.";
  addNeeds(r, "VII:4a", "VII:5a", "ESPANOL:*", "ESPANOL:personal-bilingue-bili");
  appendTo(r, "src", `shout-out at ${MEET}; services and fees corroborated by Asheville Chamber, Diocese of `
    + `WNC and Mountain Xpress profiles and a 2023 990 summary via ${WEB}; listed in AVL Kids' Facebook `
    + `"Resource Rundown", 5 Nov 2026`);
});

/* the meeting's host. This row had picked up Vaya Health's member line and a
   Vaya Family Partners note from a neighbouring row, so its "verified" badge
   was vouching for the wrong program */
patch("nurse-family-partnership-buncombe-hhs", (r) => {
  r.ph = "828-250-5072 / 828-250-5000";
  r.w = "buncombenc.gov/466/Nurse-Family-Partnership-NFP";
  r.a = "40 Coxe Ave";
  r.d = "Free nurse home visiting: each mother is paired with a registered nurse early in pregnancy, with "
    + "visits through the child's 2nd birthday. Buncombe's page: first-time mothers must enroll before 29 "
    + "weeks of pregnancy, and pregnant mothers who already have one or more children must enroll before "
    + "delivery. Income-eligible (confirm the current limit). 828-250-5072 is the NFP line in the county's "
    + "HHS resource guide; the county NFP page gives the HHS main line, 828-250-5000 (ask for Nurse-Family "
    + "Partnership). Hosted the 6 Nov 2026 community partner meeting that added several entries here.";
  r.t = "Free, Mobile / delivery";
  r.lv = "";
  r.vb = "";
  appendTo(r, "src", `phone, eligibility and address corrected from Buncombe County's NFP page and HHS `
    + `resource guide via ${WEB} (the row had carried Vaya Health's member line and a Vaya Family Partners note)`);
});

/* dead ends that were still showing as live rows */
patch("wnc-birth-center", (r) => {
  r.n = "WNC Birth Center (CLOSED July 2021)";
  r.d = "CLOSED. The Western North Carolina Birth Center closed in July 2021. Lilac Health Asheville Birth "
    + "& Wellness Center opened a birth center in the same space at 390 S French Broad Ave in 2023: see that entry.";
  r.a = "390 S French Broad Ave";
  r.note = "Closed since July 2021. For a birth center birth, refer to Lilac Health Asheville Birth & "
    + "Wellness Center, 828-970-5000.";
  r.readFirst = true;
  appendTo(r, "src", `closure from Mountain Xpress, NC Health News and Carolina Public Press reporting via ${WEB}`);
});

patch("trinity-place-youth-shelter", (r) => {
  r.n = "Trinity Place Youth Shelter (CLOSED May 2022)";
  r.note = "Closed permanently in May 2022. findhelp and other aggregators still list it. Do not refer. "
    + "For a youth in crisis use RHA Mobile Crisis 1-888-573-1006.";
  r.readFirst = true;
  appendTo(r, "src", "closure already recorded in the WHAT CHANGED dead ends (Eckerd Connects media "
    + "statement; WLOS), flagged on the row 6 Nov 2026");
});

patch("lilac-health-milk-depot", (r) => {
  appendTo(r, "d", "Same building as Lilac Health Asheville Birth & Wellness Center (828-970-5000), which "
    + "offers midwifery care.");
  appendTo(r, "src", `Lilac Health birth center link from ${MEET}`);
});

patch("lactation-support-asheville-lactation-consul", (r) => {
  appendTo(r, "d", "Also see buncombebreastfeed.org, the county breastfeeding resource site shared at the "
    + "6 Nov 2026 NFP partner meeting.");
  appendTo(r, "src", `buncombebreastfeed.org from ${MEET}`);
});

/* --- the meeting: new rows ---------------------------------------------- */

add({
  id: "lilac-health-asheville-birth-wellness-center",
  n: "Lilac Health Asheville Birth & Wellness Center",
  ph: "828-970-5000",
  w: "ashevillebirth.com",
  d: "Midwifery practice and accredited freestanding birth center for healthy, low-risk pregnancies, for "
    + "families who want a physiological birth without medical interventions. Also wellness care: annual "
    + "exams, contraception including IUDs, gynecology visits, and preconception planning. Opened in 2023 in "
    + "the former WNC Birth Center space. Ask whether they take Medicaid and the family's plan before "
    + "referring. Shared at the 6 Nov 2026 NFP partner meeting.",
  a: "390 S French Broad Ave, Suite C",
  os: "PART 9: PREGNANCY, BIRTH, POSTPARTUM",
  sec: "X",
  needs: ["VI:*", "VI:1a", "VI:3a", "X:*", "X:2"],
  metAtMeeting: true,
  src: `${MEET} (phone, website); address, services and history from the Asheville Chamber listing, `
    + `job postings and Mountain Xpress via ${WEB}`,
});

add({
  id: "blue-ridge-healthy-families",
  n: "Blue Ridge Healthy Families (Blue Ridge Partnership for Children)",
  pp: "Morgan Kaelin",
  lang: PUBLIC,
  em: "morgan.kaelin@brpartnershipforchildren.org",
  w: "brpartnershipforchildren.org",
  d: "Healthy Families America home visiting: family support and early childhood services for expecting "
    + "and new parents. Reaches well past Buncombe: NCDHHS's July 2025 list of NC Healthy Families sites "
    + "gives Avery, Buncombe, Henderson, Madison, Mitchell, Yancey, and Watauga counties (a 2024 list left "
    + "out Henderson and Watauga, so confirm the family's county). Began in Mitchell and Yancey in 2012. "
    + "Ask Morgan Kaelin about the enrollment window and how long services last.",
  os: "PART 9: PREGNANCY, BIRTH, POSTPARTUM",
  t: "Mobile / delivery",
  sec: "IV",
  needs: ["IV:*", "IV:3a", "I:*", "I:6a", "X:*", "X:2"],
  metAtMeeting: true,
  src: `${MEET} (contact); counties from the NCDHHS Healthy Families site list (July 2025) and `
    + `Mitchell News via ${WEB}`,
});

add({
  id: "mahec-school-health-program",
  n: "MAHEC School Health Program (school nurses)",
  pp: "Julie Burger",
  lang: PUBLIC,
  em: "julie.burger@mahec.net",
  w: "mahec.net/regional-initiatives/school-health-program",
  d: "MAHEC employs the school nurses for Asheville City Schools, Buncombe County Schools, and area charter "
    + "schools: about 30,000 students in 62 K-12 schools, with most nurses covering two schools. The route "
    + "when a child's health needs have to be planned with the school. Contacts from the 6 Nov 2026 NFP "
    + "partner meeting: Julie Burger, School Health Program Manager (julie.burger@mahec.net), and Taylor "
    + "Brown, school nurse (taylor.brown@mahec.net).",
  os: "III. Child Health",
  sec: "III",
  needs: ["III:*", "I:*", "I:3a"],
  metAtMeeting: true,
  src: `${MEET} (contacts); scope from mahec.net and the Buncombe County Schools school nurse page via ${WEB}`,
});

add({
  id: "buncombe-library-preschool-outreach-program",
  n: "Buncombe County Libraries Preschool Outreach Program (POP)",
  pp: "Abby Moser",
  lang: PUBLIC,
  ph: "828-250-4729",
  em: "abby.moser@buncombenc.gov",
  w: "buncombenc.gov/303/Preschool-Outreach-Program",
  d: "Free library services for children from birth to kindergarten and their teachers in child care and "
    + "early education centers: outreach librarians bring 30-minute story times and deliver materials, or a "
    + "class can come to Pack Library for a story time. A family whose child is in child care can ask the "
    + "center to sign up. The county page lists the inbox preschool.outreach@buncombecounty.org; the county "
    + "now uses buncombenc.gov addresses, so write to Abby Moser if it bounces.",
  os: "10.2 Centers and Programs",
  t: "Free, Kids / 0-5",
  sec: "I",
  needs: ["I:*", "I:7a"],
  metAtMeeting: true,
  src: `${MEET} (contact); program details and phone from buncombenc.gov via ${WEB}`,
});

add({
  id: "wcu-catalyst-clinic-clyde",
  n: "WCU CATalyst Clinic (free clinic, Clyde, Haywood County)",
  ph: "828-227-7300",
  em: "catalystclinic@wcu.edu",
  w: "wcu.edu/stories/posts/wcu-wider-circle-partner-to-launch-catalyst-clinic-in-clyde.aspx",
  d: "Free clinic run by Western Carolina University's School of Nursing with Wider Circle: faculty and "
    + "supervised nursing students. Basic adult health care, chronic disease support, health education, "
    + "screening, and help connecting to ongoing care, at no cost. Wednesdays 3 to 6pm at Clyde Central "
    + "United Methodist Church. WCU held its opening celebration on Oct 7. For Haywood County families especially.",
  a: "410 Charles St, Clyde",
  h: "Wed 3-6pm",
  os: "6.1 Free and Low-Cost Clinics",
  t: "Free",
  sec: "VI",
  needs: ["VI:*", "VI:1a"],
  metAtMeeting: true,
  src: `${MEET}; WCU story "WCU, Wider Circle partner to launch CATalyst Clinic in Clyde" via ${WEB}`,
});

add({
  id: "pisgah-legal-health-care-access-and-enrollment",
  n: "Pisgah Legal Services: health care access legal help and insurance enrollment",
  pp: "Shoshana Barton",
  lang: ["🟡 Bilingual staff", "Bilingual navigators help in Spanish; translation available."],
  ph: "828-210-3786 / 828-210-3404",
  em: "shoshana@pisgahlegal.org",
  w: "pisgahlegal.org",
  d: "Two free services. Legal help with eligible health care access and coverage problems: Shoshana Barton, "
    + "828-210-3786, shoshana@pisgahlegal.org. Help understanding Marketplace health insurance options and "
    + "enrolling, from navigators covering 18 WNC counties: appointments 828-210-3404. Open enrollment for "
    + "2027 coverage is on now; a plan picked by Dec 15, 2026 starts Jan 1, 2027. Also where to send a family "
    + "worried about the 1 Oct 2026 Medicaid immigration rules (see What changed).",
  a: "62 Charlotte St",
  os: "PART 14: LEGAL",
  t: "Free, Spanish / bilingual, Medicaid",
  sec: "VI",
  needs: ["VI:*", "VI:4a", "III:*", "III:5a", "VIII:*", "VIII:16a", "X:*", "X:3",
    "ESPANOL:*", "ESPANOL:personal-bilingue-bili"],
  metAtMeeting: true,
  src: `${MEET} (contacts and phone lines); navigator coverage and Spanish help from Pisgah Legal and `
    + `Mountain Xpress coverage via ${WEB}`,
});

add({
  id: "goodwill-justice-navigation-services",
  n: "Goodwill Justice Navigation Services",
  pp: "Melissa Chambers",
  em: "mchambers@goodwillnwnc.org",
  w: "goodwillnwnc.org",
  d: "Court navigation and reentry support for people involved with the justice system. Goodwill of "
    + "Northwest NC lists Justice Navigation among its key programs, and its Asheville court navigators work "
    + "with the Buncombe County Justice Resource Center using a peer support and community health worker "
    + "model. Make an appointment with Melissa Chambers rather than walking in.",
  os: "PART 14: LEGAL",
  sec: "X",
  needs: ["X:*", "X:3", "V:*", "V:8a"],
  metAtMeeting: true,
  src: `${MEET} (contact, appointment advice); program description from the Goodwill NWNC 2025 Impact `
    + `Report and Court Navigator job postings via ${WEB}`,
});

add({
  id: "ywca-womens-empowerment",
  n: "YWCA Women's Empowerment (Empowerment Child Care, MotherLove, Getting Ahead)",
  pp: "Tangie Ballard Bowman",
  ph: "828-254-7206",
  em: "tangela.bowman@ywcaofasheville.org",
  w: "ywcaofasheville.org",
  d: "For women working toward economic security and well-being: free Empowerment Child Care, MotherLove "
    + "(mentoring and support for teen parents), and Getting Ahead in a Just Gettin' By World. Clients call "
    + "828-254-7206 ext. 104. Director Tangie Ballard Bowman (email under Tangela) shared an upcoming event: "
    + "TD Bank at the YWCA, Tue Nov 17, 2026, 6pm; the topic was not given.",
  a: "185 S French Broad Ave",
  os: "PART 16: MONEY, WORK, BENEFITS, TAXES",
  t: "Free",
  sec: "V",
  needs: ["V:*", "V:8a", "IV:*", "IV:4a", "VIII:*", "VIII:9a", "X:*", "X:2", "X:4"],
  metAtMeeting: true,
  src: `${MEET} (contacts, extension, event); program components from the YWCA of Asheville site and `
    + `Mountain Xpress via ${WEB}`,
});

add({
  id: "buncombebreastfeed-org",
  n: "Buncombe County breastfeeding resources (buncombebreastfeed.org)",
  w: "buncombebreastfeed.org",
  d: "Breastfeeding resource website for Buncombe County, shared at the 6 Nov 2026 NFP partner meeting. Who "
    + "runs it is not confirmed yet. The county's named breastfeeding partners are the Buncombe County "
    + "Breastfeeding Coalition and LatchAVL, and Buncombe WIC has peer counselors and lactation consultants "
    + "(828-250-5000). Open the site and check what it offers before sending a family.",
  os: "PART 9: PREGNANCY, BIRTH, POSTPARTUM",
  sec: "X",
  needs: ["X:*", "X:2", "VIII:*", "VIII:4a"],
  src: `${MEET} (website only); coalition and WIC details from Buncombe County news releases via ${WEB}`,
});

/* --- the Facebook scrape and weekend guides ------------------------------ */

patch("ymca-wnc-mobile-food-markets", (r) => {
  appendTo(r, "d", "November 2026 stops listed as Facebook events (confirm before sending anyone): Fri Nov 13 "
    + "noon Crowell Apartments, 10 Coleys Cir, and 1pm Mission Hospital pop-up, 509 Biltmore Ave; Wed Nov 18 "
    + "11am Oakley/South Asheville Library; Thu Nov 19 11am Carolina Complete Health, 150 Tunnel Rd, and 2pm "
    + "Woodfin YMCA; Fri Nov 20 noon Haywood Pediatrics; Tue Nov 24 1pm Hendersonville Family YMCA.");
  addNeeds(r, "VIII:*", "VIII:5a");
  appendTo(r, "src", `November stops from Facebook event listings, ${FB}`);
});

for (const id of ["kaleidoscope-play-learn", "kaleidoscope-play-learn-2"]) {
  patch(id, (r) => {
    appendTo(r, "d", "29 Oct 2026 Facebook post: openings now for children 3 to 5 who are not enrolled in "
      + "licensed child care. Stories, songs, crafts and hands-on activities at several weekday sites "
      + "(Mondays 10 to 11:30am was listed first).");
    appendTo(r, "src", `openings from AVL Kids and Asheville Family Activities posts, 29 Oct 2026, ${FB}`);
  });
}

patch("nc-division-of-services-for-the-deaf-and-har", (r) => {
  appendTo(r, "d", "Open house Thu Nov 12, 2026, 1:30 to 3pm at the Asheville Regional Center: resources for "
    + "Deaf, DeafBlind, and hard of hearing adults and children, ASL interpreter provided.");
  appendTo(r, "src", `open house from a Facebook event listing, ${FB}`);
});

patch("tranzmission", (r) => {
  appendTo(r, "d", "Oct 2026: holding community town halls on what comes next for the organization after "
    + "funding trouble (see What changed).");
  appendTo(r, "src", "town halls from a QAX Facebook group post, 29 Oct 2026");
});

patch("asheville-parks-rec-soar-scholarships", (r) => {
  r.ph = "828-259-5800";
  r.em = "parks@ashevillenc.gov";
  appendTo(r, "d", "SOAR also covers Fun Day Out on teacher workdays and spring and winter break camps. All "
    + "residents can apply. Processing can take up to three weeks, so apply now for winter break. Applying "
    + "does not register a child; register and pay at avlrec.com while the application is reviewed.");
  appendTo(r, "src", `SOAR rules and contact from ashevillenc.gov via ${WEB}`);
});

for (const id of ["asheville-parks-rec-therapeutic-recreation", "asheville-parks-rec-therapeutic-recreation-2"]) {
  patch(id, (r) => {
    r.pp = "Lori Long";
    appendTo(r, "d", "Fall 2026 programs include TR Tots for toddlers and young children, TR Club Connect, and "
      + "the OAKS Afterschool program; check avlrec.com for TR Tots days and times. TR manager Lori Long, LRT, CTRS.");
    appendTo(r, "src", `TR Tots and program list from ashevillenc.gov via ${WEB}`);
  });
}

patch("poder-emma", (r) => {
  appendTo(r, "d", "Its El Mercadito program, run with Casa de Apoyo Mutuo (a mutual aid group formed after "
    + "Hurricane Helene), delivers free food boxes to neighbors who face barriers to getting food.");
  addNeeds(r, "VIII:5a");
  appendTo(r, "src", `El Mercadito from a Facebook group post, 3 Nov 2026, ${FB}`);
});

patch("holiday-assistance", (r) => {
  appendTo(r, "d", "2026 timing (checked 6 Nov): Eblen and Ingles run a Thanksgiving meal giveaway each "
    + "November, about 800 families in recent years; 2026 sign-up was not confirmed, so call Eblen at "
    + "828-255-3066 now. For the Saint Nicholas Project, family registration opened in early October in past "
    + "years and the 2025 toy store opened Dec 9 at 23 Hamilton St. A family-events guide now circulating "
    + "says online sign-up opens Nov 16 and the store runs Dec 17 to 22; that is unverified, so confirm with "
    + "Eblen before telling a family to wait.");
  appendTo(r, "src", `2026 timing from past Eblen announcements (Mountain Xpress, WLOS) via ${WEB}`);
});

add({
  id: "buncombe-library-zoom-pass",
  n: "ZOOM Pass: free admission to local attractions with a Buncombe library card",
  lang: PUBLIC,
  ph: "828-250-4700",
  w: "buncombenc.gov/315/ZOOM-Pass",
  d: "Buncombe County Public Libraries cardholders can reserve a free one-day pass to a local attraction. "
    + "Partners have included the Asheville Museum of Science, Hands On! Children's Museum, WNC Nature Center, "
    + "NC Arboretum, Asheville Art Museum, Cradle of Forestry, and Chimney Rock. Reserve online with a card in "
    + "good standing, one reservation per card; many passes cover a whole family, so read each pass's rules, "
    + "and pick the ticket up at a library branch before the visit. The partner list changes, so check the page.",
  os: "18.5 Free and Cheap Weekly Rhythm (community centers and more)",
  t: "Free, Kids / 0-5",
  sec: "X",
  needs: ["X:*", "X:11", "I:*", "I:11a"],
  src: `Buncombe County ZOOM Pass page (buncombenc.gov/315) via ${WEB}; flagged by a family weekend guide `
    + `shared 6 Nov 2026`,
});

add({
  id: "between-heartbeats-pregnancy-infant-loss-group",
  n: "Between Heartbeats: pregnancy and infant loss support group (online)",
  w: "facebook.com/events/979473675065211",
  d: "Trauma-informed support circle after pregnancy or infant loss. The Facebook listing describes an online "
    + "space (listed address 494 W Main St, Sylva). Next dates: Tue Nov 24 and Tue Dec 22, 2026, 6pm. The host "
    + "was not named and no web page turned up, so open the event before sharing it. Postpartum Support "
    + "International also runs free virtual loss groups.",
  os: "PART 9: PREGNANCY, BIRTH, POSTPARTUM",
  sec: "X",
  needs: ["X:*", "X:2", "VII:*", "VII:4a", "IV:*", "IV:4a"],
  src: `Facebook event listings for 24 Nov and 22 Dec 2026, ${FB}`,
});

add({
  id: "sensory-friendly-santa-tanger-2026-12-11",
  n: "Sensory-Friendly Visits with Santa, Tanger Outlets Asheville (Fri Dec 11, 2026)",
  w: "facebook.com/events/1001927645530291",
  d: "Calmer, relaxed Santa visits; the listing invites families of children with autism and other special "
    + "needs. Fri Dec 11, 2026, 11am. Photo packages may cost money, so check the listing.",
  a: "Tanger Outlets, Asheville",
  os: "PART 22: TIME-LIMITED AND SEASONAL PROGRAMS",
  sec: "IX",
  needs: ["IX:*", "IX:7a", "X:*", "X:12"],
  src: `Facebook event listing, ${FB}`,
});

add({
  id: "little-smiles-day-with-santa-arden-2026-12-12",
  n: "Little Smiles Day with Santa, Arden Dental Group (Sat Dec 12, 2026)",
  w: "facebook.com/events/2320488638687080",
  d: "Free community event: Santa photos, hot chocolate and cookies, ornament decorating. Sat Dec 12, 2026, "
    + "9am to 1pm.",
  a: "2160 Hendersonville Rd, Arden",
  os: "PART 22: TIME-LIMITED AND SEASONAL PROGRAMS",
  t: "Free, Kids / 0-5",
  sec: "X",
  needs: ["X:*", "X:11", "X:12"],
  src: `Facebook event listing, ${FB}`,
});

add({
  id: "community-thanksgiving-marion-2026-11-14",
  n: "Free Community Thanksgiving, Mt. Moriah Missionary Baptist, Marion (Sat Nov 14, 2026)",
  w: "facebook.com/events/1167809228916738",
  d: "8th annual free community Thanksgiving meal: turkey and all the trimmings, served from 11am, families "
    + "welcome. McDowell County.",
  a: "115 E Wilhemenia St, Marion",
  os: "PART 22: TIME-LIMITED AND SEASONAL PROGRAMS",
  t: "Free",
  sec: "VIII",
  needs: ["VIII:*", "VIII:5a", "X:*", "X:12"],
  src: `Facebook event listing, ${FB}`,
});

add({
  id: "free-narcan-trainings-nov-dec-2026",
  n: "Free Narcan (naloxone) trainings, Nov to Dec 2026",
  w: "facebook.com/events/1664551961336856",
  d: "Free naloxone training sessions listed for Thu Nov 19, Tue Dec 8 (at 216 Asheland Ave, Asheville), and "
    + "Thu Dec 17, 2026. The host was not named in the listings; a food pantry finder lists 216 Asheland Ave "
    + "as the Asheville Wellness and Opportunities Center. For naloxone itself on a weekday, WNCAP gives it "
    + "out free (see Harm reduction).",
  a: "216 Asheland Ave (Dec 8 session)",
  os: "8.4 Substance Use and Recovery",
  t: "Free",
  sec: "VII",
  needs: ["VII:*", "VII:6a", "X:*", "X:12"],
  src: `Facebook event listings, ${FB}; venue name from a feedam.org pantry listing via ${WEB}`,
});

add({
  id: "pathways-org-milestone-handouts",
  n: "Pathways.org free milestone handouts (speech and language, feeding)",
  w: "pathways.org/print/speech-brochure",
  d: "Free printable brochures on how babies' speech and language develop, plus a stage-by-stage guide to "
    + "feeding development for babies and toddlers (pathways.org/topics-of-development/feeding). Good to leave "
    + "with a family who has a first worry, before any referral.",
  os: "11.2 Where to Start: Two Pathways (do both at once)",
  t: "Free",
  sec: "I",
  needs: ["I:*", "IX:*", "IX:1a"],
  src: `saved Facebook items (Pathways.org links), ${FB}`,
});

add({
  id: "inclusive-childrens-books-autism-neurodiversity",
  n: "Book list: inclusive children's books on autism and neurodiversity",
  w: "notanautismmom.com/2021/08/25/inclusive-childrens-books-on-autism-and-neurodiversity/",
  d: "About 100 picture and chapter books with autistic and neurodivergent characters, collected on the Not "
    + "an Autism Mom blog (2021). Useful for siblings, classmates, and the child's own shelf.",
  os: "11.5 Sensory-Friendly Recreation, Camps, and Community Recommendations",
  t: "Free",
  sec: "IX",
  needs: ["IX:*", "IX:9a"],
  src: `saved Facebook item, ${FB}`,
});

res.file.meta.count = R.length;
res.file.meta.sources.push(
  "Nurse-Family Partnership community partner meeting notes, 6 Nov 2026",
  "Facebook deep scrape parts 1 to 4 and two family weekend guides, 6 Nov 2026 (family resources only; "
    + "see scripts/apply-nfp-meeting-2026-11-06.mjs)"
);
save(res);

/* --------------------------------------------------------- point people */

const ppl = load("point-people.json");
const P = ppl.file.people;
const person = (o) => {
  if (P.some((x) => x.n === o.n)) throw new Error(`already a point person: ${o.n}`);
  const p = { n: o.n, resp: "⚪ Not tried yet", role: o.role, org: o.org };
  if (o.ph) p.ph = o.ph;
  if (o.em) p.em = o.em;
  p.grp = o.grp;
  p.notes = o.notes;
  if (o.em || o.ph) { p.lv = DAY; p.vb = "SB"; }
  p.internal = false;
  p.src = MEET;
  clean(p);
  P.push(p);
  console.log("point person:", p.n);
};

person({
  n: "Caitlin Hettich", role: "Project CARA contact", org: "MAHEC Project CARA",
  ph: "828-708-8560 (direct)", em: "caitlin.hettich@mahec.net", grp: "Pregnancy & Postpartum",
  notes: "Welcomes collaboration and can connect partners with MAHEC meetings. Family referrals still go "
    + "through 828-255-5542 or MAHEC's online referral form. Met at the 6 Nov 2026 NFP partner meeting.",
});
person({
  n: "Morgan Kaelin", role: "Blue Ridge Healthy Families contact", org: "Blue Ridge Partnership for Children",
  em: "morgan.kaelin@brpartnershipforchildren.org", grp: "Pregnancy & Postpartum",
  notes: "Healthy Families America home visiting. Covers more than Buncombe (NCDHHS lists Avery, Henderson, "
    + "Madison, Mitchell, Yancey and Watauga too), so ask whether a family's county is covered. Met at the "
    + "6 Nov 2026 NFP partner meeting.",
});
person({
  n: "Co-kema King", role: "Doula support contact (role to be confirmed)",
  org: "Sistas Caring 4 Sistas (\"Sistas Caring for Children\" in the meeting notes)", grp: "Pregnancy & Postpartum",
  notes: "Named as the doula support contact at the 6 Nov 2026 NFP partner meeting; referral details still to "
    + "be confirmed and no phone or email captured yet. SC4S general line 828-575-0488, "
    + "doulaup@sistascaring4sistas.org.",
});
person({
  n: "Julie Burger", role: "School Health Program Manager", org: "MAHEC School Health Program",
  em: "julie.burger@mahec.net", grp: "Child Health",
  notes: "Manages the MAHEC school nurses who cover Asheville City, Buncombe County and charter schools. Met "
    + "at the 6 Nov 2026 NFP partner meeting.",
});
person({
  n: "Taylor Brown", role: "School nurse", org: "MAHEC School Health Program",
  em: "taylor.brown@mahec.net", grp: "Child Health",
  notes: "Program manager is Julie Burger. Met at the 6 Nov 2026 NFP partner meeting.",
});
person({
  n: "Abby Moser", role: "Preschool Outreach Program", org: "Buncombe County Public Libraries",
  em: "abby.moser@buncombenc.gov", grp: "Child Development",
  notes: "Library story times and materials for child care centers, birth to pre-K. Program line "
    + "828-250-4729. Met at the 6 Nov 2026 NFP partner meeting.",
});
person({
  n: "Tangie Ballard Bowman", role: "Women's Empowerment Director", org: "YWCA of Asheville",
  ph: "828-254-7206", em: "tangela.bowman@ywcaofasheville.org", grp: "Money & Work",
  notes: "Email uses her full name, Tangela. Clients use ext. 104 on the main line. Organization-related cell "
    + "for partners: 864-807-0244. Women's Empowerment covers Empowerment Child Care, MotherLove and Getting "
    + "Ahead. Upcoming: TD Bank at the YWCA, Tue Nov 17, 2026, 6pm (topic not given). Met at the 6 Nov 2026 "
    + "NFP partner meeting.",
});
person({
  n: "Shoshana Barton", role: "Health care access legal help", org: "Pisgah Legal Services",
  ph: "828-210-3786", em: "shoshana@pisgahlegal.org", grp: "Legal",
  notes: "Free legal help with eligible health care access and coverage problems. Marketplace enrollment "
    + "appointments are a different line, 828-210-3404. Met at the 6 Nov 2026 NFP partner meeting.",
});
person({
  n: "Melissa Chambers", role: "Justice Navigation Services", org: "Goodwill Industries of Northwest NC",
  em: "mchambers@goodwillnwnc.org", grp: "Legal",
  notes: "Court and reentry navigation for people involved with the justice system. Book an appointment "
    + "rather than walking in. Met at the 6 Nov 2026 NFP partner meeting.",
});

ppl.file.meta.count = P.length;
save(ppl);

/* ------------------------------------------------------------ changelog */

const cl = load("changelog.json");
const group = (id) => {
  const g = cl.file.groups.find((x) => x.id === id);
  if (!g) throw new Error(`no changelog group ${id}`);
  return g;
};
const entries = (...es) => es.map((e) => clean(e));

group("dead-ends").entries.unshift(...entries({
  date: "Nov 2026",
  what: "WNC Birth Center is CLOSED (since July 2021)",
  detail: "The Western North Carolina Birth Center at 390 S French Broad Ave closed in July 2021, and this "
    + "directory still listed it as open. Lilac Health Asheville Birth & Wellness Center has run a birth "
    + "center in the same space since 2023: 828-970-5000, ashevillebirth.com.",
  source: "Mountain Xpress, NC Health News and Carolina Public Press, via web search 6 Nov 2026",
}));

group("watch").entries.unshift(...entries(
  {
    date: "Oct 1 2026",
    what: "NC Medicaid immigration eligibility changed (federal H.R. 1)",
    detail: "From 1 October 2026 full NC Medicaid for non-citizens is limited mainly to lawful permanent "
      + "residents (green card holders), Cuban and Haitian entrants, and citizens of Micronesia, the Marshall "
      + "Islands and Palau. Many refugees, asylees, trafficking survivors and parolees lose full coverage; "
      + "Carolina Journal reports about 10,500 people lost it. Protections remain: lawfully residing children "
      + "under 19 and people who are pregnant or within 12 months postpartum stay eligible even without "
      + "permanent status, and Emergency Medicaid is still there for those who qualify. Do not tell a family "
      + "they are no longer eligible. Send them for individual guidance: Buncombe DSS, or Pisgah Legal health "
      + "access (Shoshana Barton, 828-210-3786). More changes start 1 January 2027.",
    source: "NFP community partner meeting, 6 Nov 2026; NC Medicaid H.R. 1 presentation and 'Medicaid is "
      + "Changing' page, Carolina Journal, via web search 6 Nov 2026",
  },
  {
    date: "Dec 15 2026",
    what: "Marketplace open enrollment for 2027: pick a plan by 15 December",
    detail: "Open enrollment on HealthCare.gov started 1 November 2026, and a plan chosen by 15 December 2026 "
      + "starts 1 January 2027. Some guides give 15 January 2027 as the end date and others 15 December; the "
      + "end date has been disputed in court, so treat 15 December as the deadline. Free help choosing and "
      + "enrolling: Pisgah Legal navigators, appointments 828-210-3404, Spanish available.",
    source: "NFP community partner meeting, 6 Nov 2026; enrollment guides via web search 6 Nov 2026",
  },
  {
    date: "Dec to Feb",
    what: "Sistas Caring 4 Sistas has a few free doula openings for December, January and February due dates",
    detail: "Prenatal visits and childbirth education, continuous labor support, postpartum visits, newborn "
      + "feeding support, and connections to local resources, subject to eligibility and scheduling. Refer "
      + "early. Main line 828-575-0488.",
    source: "SC4S availability post in the Asheville Community and Get Asheville Connected Facebook groups, 5 Nov 2026",
  },
  {
    date: "Nov 2026",
    what: "Helpmate shelter has new space with more beds, two designated for children",
    detail: "Reported at the NFP partner meeting. Press coverage describes a move to a larger confidential "
      + "site (the old shelter had about 20 beds; 43 were planned). Confirm a bed on the 24/7 hotline, "
      + "828-254-0516, before promising one. Helpmate also offers court advocacy and Tuesday classes on "
      + "different topics, and professionals can call the hotline for a consultation.",
    source: "NFP community partner meeting, 6 Nov 2026; WLOS and SECU Foundation coverage via web search",
  },
  {
    date: "Nov 12 2026",
    what: "DSDHH Asheville Regional Center open house, 1:30 to 3pm",
    detail: "12 Barbetta Dr. Resources for Deaf, DeafBlind and hard of hearing adults and children in WNC; "
      + "ASL interpreter provided.",
    source: "Facebook event listing, scraped 6 Nov 2026",
  },
  {
    date: "Nov 17 2026",
    what: "TD Bank at the YWCA, 6pm",
    detail: "Shared by Tangie Ballard Bowman, YWCA Women's Empowerment Director. The topic was not given at the "
      + "meeting, so ask her before inviting families. Clients: 828-254-7206 ext. 104.",
    source: "NFP community partner meeting, 6 Nov 2026",
  },
  {
    date: "Nov 2026",
    what: "YMCA mobile free food market stops through 24 November",
    detail: "Nov 13 Crowell Apartments (10 Coleys Cir) noon and Mission Hospital pop-up (509 Biltmore Ave) 1pm; "
      + "Nov 18 Oakley/South Asheville Library 11am; Nov 19 Carolina Complete Health (150 Tunnel Rd) 11am and "
      + "Woodfin YMCA 2pm; Nov 20 Haywood Pediatrics noon; Nov 24 Hendersonville Family YMCA 1pm. Free, "
      + "farmers-market style. Confirm before sending anyone.",
    source: "Facebook event listings, scraped 6 Nov 2026",
  },
  {
    date: "Oct 2026",
    what: "Tranzmission is holding community town halls on its future",
    detail: "After growing pains and funding trouble, Tranzmission is asking the community for input in a "
      + "series of town halls. Dates were not in the post. Ask Jasper Joy before telling a family which groups "
      + "are running.",
    source: "QAX Facebook group post, 29 Oct 2026",
  },
));

group("added").entries.unshift(...entries(
  {
    date: "Nov 6 2026",
    what: "Nurse-Family Partnership partner meeting: new resources and contacts",
    detail: "Added Lilac Health Asheville Birth & Wellness Center, Blue Ridge Healthy Families (7 counties), "
      + "the MAHEC School Health Program, the library Preschool Outreach Program, the free WCU CATalyst Clinic "
      + "in Clyde, Pisgah Legal health care access and enrollment, Goodwill Justice Navigation, YWCA Women's "
      + "Empowerment, and buncombebreastfeed.org. Updated Project CARA, WIC (online referral form), Helpmate, "
      + "Sistas Caring 4 Sistas, and All Souls Counseling (sliding scale down to $0, no insurance needed). Nine "
      + "new point people: Caitlin Hettich, Morgan Kaelin, Co-kema King, Julie Burger, Taylor Brown, Abby Moser, "
      + "Tangie Ballard Bowman, Shoshana Barton, Melissa Chambers. Facts beyond the meeting notes were checked "
      + "by web search because organization pages could not be opened; each row's source says which.",
    source: "NFP community partner meeting, 6 Nov 2026",
  },
  {
    date: "Nov 6 2026",
    what: "Nurse-Family Partnership row fixed",
    detail: "It carried Vaya Health's member line (1-800-962-9003) and a Vaya Family Partners note by mistake. "
      + "Now 828-250-5072 (the NFP line in the county HHS resource guide) or the HHS main line 828-250-5000, "
      + "40 Coxe Ave. Buncombe NFP also takes mothers who already have children if they enroll before "
      + "delivery; first-time mothers enroll before 29 weeks.",
    source: "Buncombe County NFP page and HHS resource guide, via web search 6 Nov 2026",
  },
  {
    date: "Nov 6 2026",
    what: "Facebook and weekend-guide finds added",
    detail: "New: ZOOM Pass (free attraction admission with a Buncombe library card), the Between Heartbeats "
      + "pregnancy and infant loss group (online), free Narcan trainings, holiday events (sensory-friendly Santa "
      + "Dec 11, Little Smiles Day with Santa Dec 12, Marion community Thanksgiving Nov 14), Pathways.org "
      + "milestone handouts, and an autism-inclusive children's book list. Updated YMCA mobile markets, "
      + "Kaleidoscope Play & Learn, DSDHH, APR SOAR and Therapeutic Recreation, PODER Emma, Tranzmission, and "
      + "holiday assistance. Seasonal rows carry their dates in the name; remove them after the season. "
      + "Trinity Place's row now says CLOSED to match the dead ends list.",
    source: "Facebook deep scrape parts 1 to 4 and two family weekend guides, 6 Nov 2026",
  },
));

group("open-questions").entries.unshift(...entries(
  {
    date: "OPEN",
    what: "Sistas Caring for Children, or Sistas Caring 4 Sistas?",
    detail: "The NFP meeting notes name 'Sistas Caring for Children' for doula support, with Co-kema King as "
      + "contact and referral details still to be confirmed. Filed under Sistas Caring 4 Sistas, the local "
      + "doula program. Confirm the name, Co-kema's role, and how to refer.",
    source: "NFP community partner meeting, 6 Nov 2026",
  },
  {
    date: "OPEN",
    what: "CHECK: Sistas Caring 4 Sistas language tag",
    detail: "Both SC4S rows are tagged Spanish-first / Latino-led. SC4S describes itself as doula care by and for "
      + "people of color, founded by Black women. Ask whether Spanish-speaking doulas are available and fix the tag.",
    source: "Spotted while adding the NFP meeting notes, 6 Nov 2026",
  },
  {
    date: "OPEN",
    what: "NFP Buncombe: which number do families call?",
    detail: "Sources disagree: 828-250-5072 (county HHS resource guide, findhelp), 828-250-5063 (Standing With "
      + "You), and the HHS main line 828-250-5000 on the county's NFP page. Ask the NFP team.",
    source: "Web search, 6 Nov 2026",
  },
  {
    date: "OPEN",
    what: "Does Lilac Health take NC Medicaid?",
    detail: "Nothing search returned says. Ask before referring a Medicaid family to the birth center.",
    source: "Web search, 6 Nov 2026",
  },
  {
    date: "OPEN",
    what: "Who runs buncombebreastfeed.org?",
    detail: "Shared at the NFP meeting as Buncombe's breastfeeding resource site. Search did not find it, so "
      + "its owner and contents are unconfirmed.",
    source: "NFP community partner meeting, 6 Nov 2026",
  },
  {
    date: "OPEN",
    what: "Lead: a free monthly dads' group",
    detail: "A post in Asheville Natural Mamas & Papas (16 Oct 2026) describes a free monthly dads' group on "
      + "early childhood development, attachment, and relationship-led parenting, next meeting 11 Nov. The host "
      + "and place were not captured. The directory has nothing for fathers yet.",
    source: "Facebook group post, 16 Oct 2026",
  },
  {
    date: "OPEN",
    what: "Lead: Casa de Apoyo Mutuo",
    detail: "Mutual aid group formed after Hurricane Helene: free food, essential resources, community "
      + "gatherings, and El Mercadito food boxes with PODER Emma. No contact captured yet; worth its own row "
      + "once someone reaches them.",
    source: "Flavors of The Hop Facebook group post, 3 Nov 2026",
  },
  {
    date: "OPEN",
    what: "Kaleidoscope Play & Learn: where and when?",
    detail: "A 29 Oct Facebook post lists several weekday sites, Mondays 10 to 11:30am first. A family weekend "
      + "guide says Fridays 9:30 to 11am at 222 S French Broad Ave, which does not match the 53 Asheland Ave "
      + "address this directory has for BPFC. Confirm with Marna at BPFC.",
    source: "Facebook post 29 Oct 2026; family weekend guide shared 6 Nov 2026",
  },
));
save(cl);
console.log(`\nresources: ${R.length}, point people: ${P.length}`);
