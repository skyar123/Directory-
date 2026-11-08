/*
 * Accuracy pass, 2026-11-06, run after apply-nfp-meeting-2026-11-06.mjs.
 *
 * Three kinds of change:
 *  1. Repairs from each row's own text: hours cut off mid-word by the
 *     importer, hours and phone numbers sitting in the address field, blank
 *     fields whose answer was already in the description, and tags that
 *     contradict the verified note.
 *  2. Errors found by checking sources: a phone number belonging to another
 *     organisation, a business from the Triangle named on an Asheville row,
 *     wrong addresses.
 *  3. Gaps filled from web search. Organisation pages could not be opened
 *     from this session, so every fact here came from search results; src
 *     says which source they quoted. A row is marked verified only when an
 *     official or the organisation's own source confirmed its main contact,
 *     and those rows carry vb "SB (web search)" so they stay distinguishable
 *     from facts Skylar confirmed directly.
 *
 * Nothing is filled from guesswork: a field no source states stays blank.
 * Run once. Kept in the repo as the record of where these edits came from.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DAY = "2026-11-06";
const WEB = "web search, 6 Nov 2026";
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
const R = res.file.resources;
const byId = new Map(R.map((r) => [r.id, r]));

const appendTo = (r, key, text) => {
  clean(text);
  const cur = (r[key] || "").trim();
  if (!cur) r[key] = text;
  else if (key === "src") r[key] = `${cur}; ${text}`;
  else r[key] = `${cur}${/[.!?)]$/.test(cur) ? "" : "."} ${text}`;
};
/* replace a piece of a field, refusing if the piece is not there, so a
   second run or a hand edit in between fails loudly instead of doubling up */
const swap = (r, key, from, to) => {
  if (!r[key].includes(from)) throw new Error(`${r.id}.${key} no longer contains: ${from.slice(0, 60)}`);
  r[key] = r[key].replace(from, clean(to));
};
const expect = (r, key, value) => {
  if (r[key] !== value) throw new Error(`${r.id}.${key} is ${JSON.stringify(r[key])}, expected ${JSON.stringify(value)}`);
};
const addNeeds = (r, ...keys) => { r.needs = [...new Set([...r.needs, ...keys])].sort(); };
const webVerified = (r) => { r.lv = DAY; r.vb = "SB (web search)"; };
let n = 0;
const patch = (id, fn) => {
  const r = byId.get(id);
  if (!r) throw new Error(`no resource with id ${id}`);
  fn(r);
  clean(r);
  n++;
};

/* ---------------------------------------------- 1. repairs from own text */

/* hours the importer cut off mid-word; the full wording is in the detail */
patch("true-ridge", (r) => {
  expect(r, "h", "Mon-Thu 9am-3pm, Fri 9am-12:30pm (in");
  r.h = "Mon-Thu 9am-3pm, Fri 9am-12:30pm (call first for an initial appointment)";
  r.a = "204 6th Ave W, Hendersonville";
  appendTo(r, "src", "hours and address moved out of the detail, 6 Nov 2026");
});
patch("community-engagement-markets", (r) => {
  expect(r, "h", "Monday 4:30pm (Asheville Christian Aca");
  r.h = "Swannanoa: first Monday 4:30pm (Asheville Christian Academy); other sites vary";
  appendTo(r, "src", "cut-off hours completed from the detail, 6 Nov 2026");
});
patch("abccm-crisis-dental", (r) => {
  expect(r, "h", "Monday 9am at 828-259-5339 (some li");
  r.h = "Fridays; call Monday 9am to get a slot";
  /* the row says uninsured only, so the Medicaid tag was wrong */
  expect(r, "t", "Free, Medicaid");
  r.t = "Free";
  appendTo(r, "src", "cut-off hours completed from the detail; Medicaid tag removed because the service "
    + "is for uninsured people only, 6 Nov 2026");
});
patch("harm-reduction-wncap-the-steady-collective-h", (r) => {
  expect(r, "h", "Mon-Fri 9am-5pm, 828-252-7489 (suppl");
  r.h = "WNCAP Mon-Fri 9am-5pm; Steady Collective mobile Tue, Wed, Fri (times below); Holler Mon-Fri 10am-5pm";
  appendTo(r, "src", "cut-off hours completed from the detail, 6 Nov 2026");
});

/* the pantry-by-day rows each list six or more sites, but the importer gave
   them one church's address and a cut-off slice of one site's hours */
for (const day of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
  patch(day, (r) => {
    if (!r.os.startsWith("3.3 Weekly Pantry")) throw new Error(`${day} is not a pantry-by-day row`);
    r.a = "Several sites, listed below";
    r.h = "Times vary by site, listed below";
    appendTo(r, "src", "address and hours replaced: they named one of the listed sites, 6 Nov 2026");
  });
}

/* hours and phone numbers that were sitting in the address field */
const splitAddress = (id, from, a, h, extra) => patch(id, (r) => {
  expect(r, "a", from);
  r.a = a;
  if (h !== undefined) { if (r.h) throw new Error(`${id} already has hours`); r.h = h; }
  if (extra) extra(r);
  appendTo(r, "src", "hours moved out of the address field, 6 Nov 2026");
});
splitAddress("social-security-administration", "800 Centre Park Dr, Asheville 28805. Mon-Fri 9-4",
  "800 Centre Park Dr, Asheville 28805", "Mon-Fri 9am-4pm");
for (const id of ["asheville-area-habitat-for-humanity", "habitat-critical-home-repair"]) {
  splitAddress(id, "33 Meadow Rd, Asheville 28803, Mon-Fri 8:30-5", "33 Meadow Rd, Asheville 28803", "Mon-Fri 8:30am-5pm");
}
splitAddress("buncombe-county-dss-respite-foster-homes", "40 Coxe Ave, Mon-Fri 8am-5pm", "40 Coxe Ave", "Mon-Fri 8am-5pm");
splitAddress("rise-autism-therapy",
  "Asheville and WNC. In home, school and community. Office hours Mon-Fri 9am-4pm. Fax 828-707-9497.",
  "No clinic: sessions in the home, school and community across Asheville and WNC", "Office Mon-Fri 9am-4pm",
  (r) => appendTo(r, "d", "Fax 828-707-9497."));
splitAddress("healing-hearts-medical-family-therapy-associ",
  "9 Vanderbilt Park Dr, Asheville NC 28803. Practice line 828-786-8595.", "9 Vanderbilt Park Dr, Asheville NC 28803",
  undefined, (r) => { expect(r, "ph", "828-501-0743"); r.ph = "828-501-0743 / 828-786-8595 (practice line)"; });
splitAddress("port-post-overdose-response-team-buncombe-co", "Buncombe County, mobile. PORT line 828-772-1294.",
  "Mobile, anywhere in Buncombe County", undefined);
splitAddress("warrior-wellness-center-blue-ridge-health-sb",
  "20 Erwin Hills Rd, Asheville (separate entrance off Service Road, so no walk through the school's main security perimeter). Open same hours as school, roughly 7:30am-3:30pm.",
  "20 Erwin Hills Rd, Asheville (separate entrance off Service Road, so no walk through the school's main security perimeter)",
  "School days, roughly 7:30am-3:30pm");

/* blanks whose answer was already in the row's own description */
patch("play-talk-grow-speech-feeding-aac-takes-medi", (r) => {
  r.a = "18 Regent Park Blvd, Suite A, West Asheville 28806";
  r.h = "Mon-Fri 8am-6pm, by appointment";
  appendTo(r, "src", "address and hours moved out of the detail, 6 Nov 2026");
});
patch("campfire-behavioral-health-campfire-aba-no-w", (r) => {
  r.a = "15 Henrietta St, Asheville 28801 (Chamber listing; their site gives no street address)";
  r.h = "9am-5pm";
  appendTo(r, "src", "address and hours moved out of the detail, 6 Nov 2026");
});
patch("never-leave-the-pharmacy-without-the-medicin", (r) => {
  r.w = "vayahealth.com/benefits-services/pharmacy/medication-search/";
  r.h = "Vaya Pharmacy Service Line Mon-Sat 7am-6pm";
  appendTo(r, "src", "website and hours moved out of the detail, 6 Nov 2026");
});
patch("foster-family-alliance-teaming-with-teens-se", (r) => {
  r.w = "ffa-nc.org";
  appendTo(r, "src", "website from the row's own email domain note, 6 Nov 2026");
});
patch("wnc-listening-line-non-crisis-emotional-supp", (r) => {
  r.h = "8am-11pm daily";
  appendTo(r, "d", "Henderson County's behavioral health resource list (Dec 2024) gives 828-547-4547 as the "
    + "warm line of Love and Respect Community for Recovery and Wellness, a recovery service for adults 18 and "
    + "over, so this may be that line under another name. For a 24/7 alternative, the statewide NC Peer "
    + "Warmline is 1-855-733-7762, staffed by certified peer support specialists.");
  appendTo(r, "src", `hours moved out of the detail; line identity and NC Peer Warmline from Henderson County `
    + `and NC 211 via ${WEB}`);
});

/* tag that contradicted the row's own verified note */
patch("whole-family-therapy-center", (r) => {
  expect(r, "t", "Medicaid | Verified 8/2026. Does NOT accept Medicaid.");
  r.t = "Verified 8/2026. Does NOT accept Medicaid.";
  appendTo(r, "src", "Medicaid tag removed: the verified note says it does not accept Medicaid, 6 Nov 2026");
});

/* ------------------------------------------- 2. errors found in sources */

/* the first number was the YMCA mobile market line */
patch("bounty-soul", (r) => {
  expect(r, "ph", "828-775-7081 / 828-273-9065");
  r.ph = "828-419-0533 / 828-273-9065";
  swap(r, "d", "828-775-7081 / 828-273-9065.", "Office 828-419-0533 (828-775-7081, listed here before, is the "
    + "YMCA mobile market line).");
  r.a = "999 Old US Hwy 70 W, Black Mountain 28711 (office; markets meet at rotating sites)";
  expect(r, "h", "Mondays 12:30-2pm (120 Alexander Pl, Swann");
  r.h = "Beacon Village truck Mon 12:30-2pm; UNETE market Tue 3:30-5pm; full calendar at bountyandsoul.org";
  appendTo(r, "src", `office phone and address from Idealist and CauseIQ listings via ${WEB}; YMCA line identified `
    + `from YMCA WNC mobile market schedules`);
});

/* 828-669-9404 is Swannanoa Valley Christian Ministry's number */
patch("abccm-our-daily-bread", (r) => {
  expect(r, "ph", "828-669-9404 (Black Mtn) / 828-259-5337 (Arden)");
  r.ph = "828-259-5300 (ABCCM) / 828-259-5337 (Arden)";
  r.w = "abccm.org/get-help";
  appendTo(r, "d", "This is Our Daily Bread at Sonrise, where ABCCM's downtown lunch moved. ABCCM's crisis page "
    + "lists Mon-Thu rather than Mon-Fri, so call ahead. 828-669-9404, listed here before, belongs to Swannanoa "
    + "Valley Christian Ministry.");
  appendTo(r, "src", `site history, hours conflict and ABCCM main line from abccm.org and Mountain Xpress via ${WEB}`);
});
patch("swannanoa-valley-christian-ministry", (r) => {
  r.ph = "828-669-9404 / 828-545-3948";
  r.em = "svcmdirector@gmail.com";
  r.a = "101 N Ridgeway Ave, Black Mountain 28711";
  r.h = "Mon-Fri 9am-3pm (call for eligibility)";
  appendTo(r, "d", "Also runs a food pantry. A community resource sheet gives 828-669-9404 and MANNA's food finder "
    + "gives 828-545-3948; try both.");
  appendTo(r, "src", `address, hours, second number and email from MANNA's food finder, Plentiful and a community `
    + `resource sheet via ${WEB}`);
});

/* "Emerald Doulas" is a Triangle-area business, not this Asheville agency */
patch("doulas-of-asheville", (r) => {
  expect(r, "d", "828-222-0446. Emerald Doulas: birth/postpartum support and advocacy.");
  r.d = "Boutique doula agency: childbirth education, birth and postpartum doula support, placenta "
    + "encapsulation and belly binding. 828-222-0446, info@doulasofasheville.com (from an older listing, so "
    + "confirm). An earlier version of this row named Emerald Doulas, which is a separate business in the "
    + "Raleigh-Durham area.";
  r.em = "info@doulasofasheville.com";
  appendTo(r, "src", `services, email and the Emerald Doulas mix-up from a CAPPA member profile, the agency's own `
    + `form and DoulaMatch via ${WEB}`);
});

patch("mahec-ob-gyn", (r) => {
  expect(r, "a", "123 Hendersonville Rd");
  r.a = "119 Hendersonville Rd, Asheville 28803 (MAHEC Biltmore campus)";
  r.h = "Mon-Thu 8am-4:30pm, Fri 9am-4:30pm (closed 12-1 for lunch)";
  r.w = "mahec.net/obgyn";
  webVerified(r);
  appendTo(r, "src", `address, phone and hours from MAHEC's Ob/Gyn contact page via ${WEB}`);
});
for (const id of ["project-cara-mahec", "project-cara"]) {
  patch(id, (r) => {
    r.h = "MAHEC Ob/Gyn hours: Mon-Thu 8am-4:30pm, Fri 9am-4:30pm (closed 12-1)";
    if (!r.a) r.a = "119 Hendersonville Rd, Asheville 28803 (MAHEC Ob/Gyn Specialists)";
    appendTo(r, "src", `hours of MAHEC Ob/Gyn Specialists, where Project CARA is based, from mahec.net via ${WEB}`);
  });
}

/* the call button dialled Madison County Smart Start for a Buncombe program */
for (const id of ["kaleidoscope-play-learn", "kaleidoscope-play-learn-2"]) {
  patch(id, (r) => {
    expect(r, "ph", "828-689-1525");
    r.ph = "828-285-9333 / 828-689-1525 (Madison County Smart Start)";
    r.w = "buncombepfc.org";
    r.a = "Rotating weekday sites in Buncombe County (BPFC office: 53 Asheland Ave, Suite 102A)";
    r.h = "Weekday mornings; Mondays 10-11:30am at one site (Oct 2026)";
    appendTo(r, "d", "BPFC has described the groups as free adult-child playgroups for children 3 months to 5 years "
      + "who live in Buncombe County and are not in licensed child care, with registration required first (2020 "
      + "description, so confirm the age range).");
    appendTo(r, "src", `BPFC main line and website from Asheville Chamber and directory listings, eligibility from a `
      + `2020 BPFC description, via ${WEB}`);
  });
}

/* the Raleigh program row had no contact at all */
patch("anchor-perinatal-wellness-waypoint-counselin", (r) => {
  r.ph = "919-275-0806 (Anchor) / 919-275-1405 (Waypoint)";
  r.a = "6120 Giles St, Suites 220-250, Raleigh 27612 (Anchor)";
  appendTo(r, "d", "Both are in the Raleigh-Durham area. Anchor runs a perinatal intensive outpatient program "
    + "(about 10 hours a week) that one listing calls the only one in North Carolina; Waypoint Counseling & "
    + "Maternal Wellness has Raleigh and Durham offices. Ask either about virtual sessions for a WNC family.");
  appendTo(r, "src", `phones and address from WakeMed's resource page, NPI and Psychology Today listings via ${WEB}`);
});

/* ------------------------------------------------ 3. gaps from web search */

patch("nc-division-of-services-for-the-deaf-and-har", (r) => {
  expect(r, "a", "12 Barbetta Dr, Asheville 28806, Mon-Fri 8-5");
  r.a = "12 Barbetta Dr, Asheville 28806";
  r.h = "Mon-Fri 8am-5pm";
  r.w = "ncdhhs.gov/divisions/services-deaf-and-hard-hearing/regional-centers-deaf-and-hard-hearing";
  r.em = "DSDHH.Information@dhhs.nc.gov";
  r.pp = "Susan Sacco";
  appendTo(r, "d", "Free. Serves Buncombe, Cherokee, Clay, Graham, Haywood, Henderson, Jackson, Macon, Madison, "
    + "Mitchell, Polk, Swain, Transylvania and Yancey counties. Video phone 828-333-5830.");
  webVerified(r);
  appendTo(r, "src", `website, counties and video phone from NCDHHS's regional centers page and brochure via ${WEB}`);
});

for (const id of ["asheville-parks-rec-therapeutic-recreation", "asheville-parks-rec-therapeutic-recreation-2"]) {
  patch(id, (r) => {
    r.a = "Murphy-Oakley Community Center, 749 Fairview Rd, Asheville 28803";
    r.h = "Program times vary; register at avlrec.com";
    r.w = "ashevillenc.gov/department/parks-recreation/recreation/therapeutic-recreation/";
    r.pp = "Lori Long";
    webVerified(r);
    appendTo(r, "src", `TR home base, phone and page from ashevillenc.gov via ${WEB}`);
  });
}
patch("asheville-parks-rec-soar-scholarships", (r) => {
  r.a = "Apply online with an APR account at avlrec.com";
  appendTo(r, "src", `how to apply from ashevillenc.gov via ${WEB}`);
});

patch("ymca-wnc-mobile-food-markets", (r) => {
  r.ph = "828-775-7081";
  r.w = "ymcawnc.org/schedules-7";
  r.a = "Rotating stops; see the monthly schedule";
  r.h = "Varies by stop; see the monthly schedule";
  appendTo(r, "d", "The YMCA posts a schedule PDF each month (English and Spanish) and stop announcements on its "
    + "Facebook page, @ymcawnccommunityhealth. Regular stops have included the Ferguson Family YMCA in Candler, "
    + "Woodfin YMCA, Hendersonville Family YMCA, Haywood Pediatrics in Clyde, Mills River Park and Madison County "
    + "Cooperative Extension in Marshall.");
  webVerified(r);
  appendTo(r, "src", `phone, schedule page and stops from YMCA WNC mobile market schedule PDFs via ${WEB}`);
});

patch("lilac-health-milk-depot", (r) => {
  expect(r, "ph", "919-350-8599");
  r.ph = "828-970-5000 / 919-350-8599 (WakeMed Mothers' Milk Bank)";
  r.h = "Daily 10am-4pm (undated listing; call ahead)";
  appendTo(r, "src", `depot hours and the local number from a community resource listing and the NPI registry via ${WEB}`);
});

patch("lactation-support-asheville-lactation-consul", (r) => {
  appendTo(r, "d", "ADDRESS CONFLICT: the practice's own site gives its office as 64 Peachtree Rd, Suite 30, while "
    + "a federal provider registry lists 573 Fairview Rd Ste 6 and 828-279-1735. Confirm before sending a family. "
    + "Home visits within 15 miles cost extra; consults run 1.5 to 2 hours.");
  appendTo(r, "src", `address conflict and services from the practice's site and the NPI registry via ${WEB}`);
});

patch("tranzmission", (r) => {
  r.a = "37 Montford Ave, Suite 2, Asheville 28801";
  r.ph = "828-771-6955";
  appendTo(r, "d", "The phone comes from one fundraising listing, so email is still the surer route.");
  appendTo(r, "src", `address and phone from GiveOutDay and CauseIQ listings via ${WEB}`);
});

patch("goodwill-industries", (r) => {
  r.ph = "828-298-9023";
  r.a = "1616 Patton Ave, Asheville 28806 (career center)";
  r.h = "Career coaching Mon-Fri 9am-4pm (A-B Tech listing)";
  appendTo(r, "src", `career center phone, address and coaching hours from A-B Tech's Goodwill pages via ${WEB}`);
});
patch("goodwill-justice-navigation-services", (r) => {
  appendTo(r, "d", "Goodwill's Asheville career center is at 1616 Patton Ave, 828-298-9023, if Melissa cannot be reached.");
  appendTo(r, "src", `career center contact from A-B Tech's Goodwill pages via ${WEB}`);
});

for (const id of ["ywca-motherlove", "ywca-getting-ahead"]) {
  patch(id, (r) => {
    r.a = "185 S French Broad Ave, Asheville 28801";
    appendTo(r, "src", `YWCA address from CauseIQ and Grace's List via ${WEB}`);
  });
}

patch("pisgah-legal-services", (r) => {
  r.h = "Mon-Fri 8:30am-5pm";
  appendTo(r, "d", "Apply online at pisgahlegal.org/free-legal-assistance or call during office hours; tell the "
    + "receptionist about a court date or if the person is homebound. Free for low-income households. Does not take "
    + "criminal, personal injury or divorce cases, and takes custody cases only for domestic violence survivors and "
    + "grandparents raising grandchildren.");
  webVerified(r);
  appendTo(r, "src", `hours, intake and eligibility from Pisgah Legal's 2025 legal aid brochure via ${WEB}`);
});
patch("pisgah-legal-health-care-access-and-enrollment", (r) => {
  r.h = "Mon-Fri 8:30am-5pm";
  appendTo(r, "src", `office hours from Pisgah Legal's 2025 legal aid brochure via ${WEB}`);
});

patch("blue-ridge-healthy-families", (r) => {
  r.ph = "828-682-5091";
  appendTo(r, "d", "The phone is from an older local article about the Yancey County office, and Blue Ridge "
    + "Partnership for Children's Mitchell County inbox is resource@brpartnershipforchildren.org; Morgan's email is "
    + "the surer route.");
  appendTo(r, "src", `older phone and county inbox from Mitchell News and a Smart Start directory via ${WEB}`);
});

patch("mahec-school-health-program", (r) => {
  r.a = "Nurses work inside the schools";
  appendTo(r, "d", "There is no central phone line: each school lists its own MAHEC nurse's number, for example on "
    + "the school's health page or through the front office.");
  appendTo(r, "src", `no central line, per mahec.net and Buncombe County Schools nurse pages via ${WEB}`);
});
patch("buncombe-library-preschool-outreach-program", (r) => {
  r.a = "Comes to the child care center; class visits at Pack Memorial Library, 67 Haywood St";
  appendTo(r, "src", "address from the program description already in the row, 6 Nov 2026");
});
patch("buncombe-library-zoom-pass", (r) => {
  r.a = "Reserve online; pick up at a Buncombe library branch";
  r.h = "Reserve any time online; pickup during library hours";
  appendTo(r, "src", "address and hours from the program description already in the row, 6 Nov 2026");
});
patch("nurse-family-partnership-buncombe-hhs", (r) => {
  r.h = "Mon-Fri 8am-5pm (HHS office hours)";
  appendTo(r, "src", "HHS office hours as listed for other 40 Coxe Ave services in this directory, 6 Nov 2026");
});

/* events and online resources: say so instead of leaving the fields blank */
const eventTime = {
  "sensory-friendly-santa-tanger-2026-12-11": "Fri Dec 11, 2026, 11am",
  "little-smiles-day-with-santa-arden-2026-12-12": "Sat Dec 12, 2026, 9am-1pm",
  "community-thanksgiving-marion-2026-11-14": "Sat Nov 14, 2026, served from 11am",
  "free-narcan-trainings-nov-dec-2026": "Thu Nov 19, Tue Dec 8 and Thu Dec 17, 2026 (times on each listing)",
  "between-heartbeats-pregnancy-infant-loss-group": "Tue Nov 24 and Tue Dec 22, 2026, 6pm",
};
for (const [id, h] of Object.entries(eventTime)) {
  patch(id, (r) => { r.h = h; appendTo(r, "src", "event time moved into the hours field, 6 Nov 2026"); });
}
patch("between-heartbeats-pregnancy-infant-loss-group", (r) => {
  r.a = "Online (the listing gives 494 W Main St, Sylva)";
});
for (const id of ["pathways-org-milestone-handouts", "inclusive-childrens-books-autism-neurodiversity"]) {
  patch(id, (r) => { r.a = "Online"; r.h = "Any time"; });
}

/* crisis rows */
patch("caiyalynn-burrell-child-crisis-center", (r) => {
  r.w = "daymarkrecovery.org/locations/fbc-buncombe";
  r.h = "24/7";
  webVerified(r);
  appendTo(r, "src", `Daymark location page via ${WEB}`);
});
patch("family-justice-center", (r) => {
  r.w = "buncombenc.gov/fjc";
  r.h = "Mon-Fri 8am-5pm, walk-ins welcome";
  appendTo(r, "d", "Free and confidential. Staff can walk a visitor in from the car if they call ahead. Parking at "
    + "35 Woodfin St or the county garage off College St; the center has its own entrance.");
  webVerified(r);
  appendTo(r, "src", `hours, parking and escort from Buncombe County's Family Justice Center pages via ${WEB}`);
});
patch("buncombe-county-family-justice-center", (r) => {
  r.w = "buncombenc.gov/277";
  webVerified(r);
  appendTo(r, "src", `Buncombe County's Family Justice Center pages via ${WEB}`);
});
patch("hope4nc-disaster-emotional-support", (r) => {
  r.w = "ncdhhs.gov/hope4nc";
  r.h = "24/7";
  r.d = "1-855-587-3463. Free, confidential line to a licensed clinician for emotional support and coping help "
    + "after Hurricane Helene; crisis outreach workers also link survivors to recovery resources. FEMA lists it for "
    + "residents of the 39 declared North Carolina counties.";
  webVerified(r);
  appendTo(r, "src", `NCDHHS Hope4NC pages and FEMA via ${WEB}`);
});
patch("buncombe-co-responder-unit", (r) => {
  r.h = "Sent through 911 dispatch";
  appendTo(r, "d", "Licensed mental health professionals contracted by EMS and the Sheriff's Office go out with "
    + "deputies on mental health calls, welfare checks and involuntary commitments anywhere in Buncombe County. The "
    + "828-250-6670 number could not be confirmed.");
  appendTo(r, "src", `program description from Buncombe County and Mountain Xpress coverage via ${WEB}`);
});
for (const id of ["988-suicide-crisis-lifeline", "suicide-crisis-lifeline"]) {
  patch(id, (r) => {
    r.w = "988lifeline.org";
    r.h = "24/7, call, text or chat";
    webVerified(r);
    appendTo(r, "src", `official site confirmed via ${WEB}`);
  });
}
patch("crisis-text-line", (r) => {
  r.w = "crisistextline.org";
  r.h = "24/7";
  webVerified(r);
  appendTo(r, "src", `official site and keyword confirmed via ${WEB}`);
});
patch("national-dv-hotline", (r) => {
  r.w = "thehotline.org";
  r.h = "24/7";
  appendTo(r, "d", "Also text START to 88788, or chat at thehotline.org.");
  webVerified(r);
  appendTo(r, "src", `official site and text line confirmed via ${WEB}`);
});
for (const id of ["our-voice", "our-voice-sexual-violence-hotline"]) {
  patch(id, (r) => {
    r.w = "ourvoicenc.org";
    r.a = "35 Woodfin St, Asheville 28801 (Family Justice Center)";
    r.h = "Crisis line 24/7; office Mon-Fri 8am-5pm";
    appendTo(r, "d", "Business line for non-urgent questions: 828-252-0562.");
    webVerified(r);
    appendTo(r, "src", `crisis line, business line, office and hours from ourvoicenc.org via ${WEB}`);
  });
}
patch("safelight", (r) => {
  r.w = "safelightfamily.org";
  r.em = "info@safelightfamily.org";
  r.a = "133 5th Ave W, Hendersonville 28792 (office)";
  appendTo(r, "d", "Also runs a Child Advocacy Center and a Family Justice Center in Henderson County.");
  webVerified(r);
  appendTo(r, "src", `website, office and email from Henderson County's resource card and WomensLaw via ${WEB}`);
});
patch("my-sister-s-place", (r) => {
  r.ph = "828-649-2446";
  r.w = "mysisters.place";
  r.a = "Marshall, Madison County (shelter address is confidential)";
  r.h = "Hotline 24/7";
  appendTo(r, "d", "24-hour hotline, emergency shelter, help with protective orders, court advocacy, and a support "
    + "group with child care. Services are free; its thrift shop helps fund the shelter.");
  appendTo(r, "src", `hotline, website and services from DomesticShelters.org and a Mars Hill church newsletter via ${WEB}`);
});
for (const id of ["rha-24-7-walk-in-crisis-behavioral-health-ur", "rha-health-services"]) {
  patch(id, (r) => {
    r.w = "rhahealthservices.org";
    appendTo(r, "src", `website via ${WEB}; RHA's newer pages still say 24/7/365 (an hours cut announced for March `
      + `2020 was reversed)`);
  });
}

/* pregnancy and postpartum rows that were thin or doubtful */
patch("perinatal-emotional-health-network-of-wnc", (r) => {
  appendTo(r, "d", "MAY BE INACTIVE: search turns up only the network's 2010 to 2011 blog, whose last posts say it "
    + "stopped its support group to focus on training providers. For support now, Postpartum Support International "
    + "runs free virtual groups and a helpline, 1-800-944-4773.");
  appendTo(r, "src", `status from the PEHN blog via ${WEB}`);
});
patch("project-dignity-of-wnc", (r) => {
  r.w = "projectdignitywnc.org";
  r.d = "Volunteer-run Hendersonville nonprofit, founded 2017, that supplies period products (and has also "
    + "given out diapers and toiletries) to people who are homeless, low-income or surviving domestic violence. It "
    + "works through schools and agencies, at last report 148 schools and 62 agencies in ten WNC counties, including "
    + "ABCCM and Salvation Army sites in Buncombe, Henderson and Rutherford, so families usually get supplies "
    + "through one of those partners. A press release gives the website as projectdignitywnc.com instead; it is also "
    + "on Facebook.";
  appendTo(r, "src", `Idealist, Mountain Xpress and MANNA coverage via ${WEB}`);
});
patch("homegrown-families", (r) => {
  appendTo(r, "d", "The same owner, Chama Woydak, runs Homegrown Babies, a doula and childbirth education agency "
    + "whose Health & Education Center has been listed at 201 Charlotte St, Asheville.");
  appendTo(r, "src", `owner and related agency from event listings and a speaker profile via ${WEB}`);
});
patch("dancy-perinatal-birth-trauma-partner-support", (r) => {
  r.ph = "916-800-3631";
  r.a = "Online";
  r.d = "Online birth trauma group run by Dancy Perinatal, a perinatal mental health company founded by Krysta "
    + "Dancy, a California marriage and family therapist. A Psychology Today listing gives enrollment as ongoing at "
    + "$50 to $70 a session. A partner-only group was not found, so ask whether partners and non-birthing parents "
    + "can join and whether North Carolina residents can.";
  appendTo(r, "src", `Psychology Today listing and podcast profile via ${WEB}`);
});
patch("m-y-life-center-mobile-unit", (r) => {
  appendTo(r, "d", "COULD NOT BE FOUND ONLINE (Nov 2026): no web page, listing or news item turned up under this "
    + "name. Confirm the number reaches it before sharing.");
  appendTo(r, "src", `nothing found via ${WEB}`);
});
patch("justbirth-space", (r) => {
  r.w = "justbirthspace.org";
  r.a = "Online";
  r.h = "Text line daily 9am-9pm ET";
  [r.sp, r.spd] = ["🟡 Bilingual staff", "Support in English and Spanish (JustBirth Space materials)."];
  appendTo(r, "d", "Launched in 2020 by Every Mother Counts with Ancient Song Doula Services and partners; no "
    + "insurance and no fees. A 2021 brochure describes a New York City and northern New Jersey focus, so confirm a "
    + "WNC family can book the one-on-one sessions; the groups are virtual.");
  appendTo(r, "src", `JustBirth Space materials and Every Mother Counts coverage via ${WEB}`);
});

/* Casa de Apoyo Mutuo already had a row; the first pass missed it */
patch("casa-de-apoyo-mutuo-mercadito-colaborativa-l", (r) => {
  expect(r, "a", "528 Emma Rd, Asheville. Wednesday, Friday and Sunday 12-5pm.");
  r.a = "528 Emma Rd, Asheville";
  r.h = "Wed, Fri and Sun 12-5pm";
  appendTo(r, "d", "With PODER Emma, El Mercadito also delivers free food boxes to neighbors who cannot get to the "
    + "market (Facebook post, 3 Nov 2026).");
  appendTo(r, "src", "hours moved out of the address field; deliveries from a Facebook group post, 3 Nov 2026");
});
patch("poder-emma", (r) => {
  swap(r, "d", "Its El Mercadito program, run with Casa de Apoyo Mutuo (a mutual aid group formed after Hurricane "
    + "Helene), delivers free food boxes to neighbors who face barriers to getting food.",
    "With Casa de Apoyo Mutuo's El Mercadito, it delivers free food boxes to neighbors who face barriers to getting "
    + "food (see Casa de Apoyo Mutuo / Mercadito).");
  r.w = "colaborativalamilpa.org";
  appendTo(r, "src", "El Mercadito attribution corrected and website taken from the Colaborativa La Milpa rows, 6 Nov 2026");
});

res.file.meta.sources.push("Accuracy pass by web search, 6 Nov 2026 (see scripts/apply-accuracy-pass-2026-11-06.mjs)");
save(res);
console.log(`patched ${n} rows`);

/* ------------------------------------------------------------ changelog */

const cl = load("changelog.json");
const group = (id) => cl.file.groups.find((g) => g.id === id);
const open = group("open-questions");
const wrong = open.entries.findIndex((e) => e.what === "Lead: Casa de Apoyo Mutuo");
if (wrong < 0) throw new Error("the Casa de Apoyo Mutuo lead is gone already");
open.entries.splice(wrong, 1);
open.entries.unshift(...[
  {
    date: "OPEN",
    what: "May be gone or renamed: M.Y. Life Center, Perinatal Emotional Health Network, WNC Listening Line",
    detail: "M.Y. Life Center's mobile unit (828-637-0009) could not be found online at all. The Perinatal Emotional "
      + "Health Network of WNC shows no activity since its 2011 blog. Henderson County lists the 'WNC Listening Line' "
      + "number as the warm line of Love and Respect Community for Recovery and Wellness. Call each before sending a "
      + "family, and mark it closed or rename it.",
    source: "Accuracy pass, web search 6 Nov 2026",
  },
  {
    date: "OPEN",
    what: "Asheville Lactation Consulting: which address?",
    detail: "The practice's own site gives 64 Peachtree Rd, Suite 30. A federal provider registry gives 573 Fairview "
      + "Rd Ste 6 and 828-279-1735. The directory and the Liz Mills and Julie Holcomb point-people notes still say 573 "
      + "Fairview Rd and 828-373-3345.",
    source: "Accuracy pass, web search 6 Nov 2026",
  },
  {
    date: "OPEN",
    what: "Phone numbers that rest on one source",
    detail: "Blue Ridge Healthy Families 828-682-5091 (an older article); Tranzmission 828-771-6955 (one fundraising "
      + "listing); Swannanoa Valley Christian Ministry 828-669-9404 or 828-545-3948 (sources disagree); Buncombe "
      + "Co-Responder Unit 828-250-6670 (not found anywhere). A quick call to each settles it.",
    source: "Accuracy pass, web search 6 Nov 2026",
  },
].map(clean));
group("added").entries.unshift(clean({
  date: "Nov 6 2026",
  what: "Accuracy pass: wrong numbers fixed, gaps filled, crisis lines verified",
  detail: "Fixed: Bounty & Soul carried the YMCA mobile market's phone; ABCCM Our Daily Bread carried Swannanoa "
    + "Valley Christian Ministry's; Kaleidoscope Play & Learn dialled Madison County Smart Start; Doulas of Asheville "
    + "named a Raleigh-Durham business; MAHEC Ob/Gyn had the wrong building; two rows were tagged Medicaid against "
    + "their own notes; hours cut off mid-word on eight rows; hours or phone numbers sitting in the address field "
    + "on ten. Filled from sources: My Sister's Place's hotline, websites for 14 crisis and safety rows, and Raleigh "
    + "contacts for the perinatal IOP. In all 84 rows changed: 7 more phones, 23 more websites, 28 more addresses, "
    + "47 more hours, and 11 rows verified for the first time. Checked and left alone: RHA's urgent care is still "
    + "listed as 24/7 on RHA's newer pages. Organization pages could not be opened from this session, so facts came "
    + "from web search; rows confirmed against an official or the organization's own source show 'verified by SB "
    + "(web search)'.",
  source: "scripts/apply-accuracy-pass-2026-11-06.mjs",
}));
save(cl);
console.log("changelog updated");
