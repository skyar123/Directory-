/*
 * Gap fill, 2026-11-08: missing phones, websites, addresses and hours.
 *
 * 112 rows had neither a phone nor a website, and 96 more in the family
 * sections had a website but no phone. This pass looked up about 70 of the
 * rows that name a real organization or program (the rest are tips, group
 * rows and how-to notes that have no single contact). It also copies details
 * between duplicate rows of the same organization.
 *
 * Rules, as in the earlier passes:
 *  - `fill` only writes a field that is blank, and stops the script if it is
 *    not, so nothing already in the directory is silently replaced.
 *  - A row gets lv 2026-11-08 and vb "SB (web search)" only when an official or
 *    the organization's own source confirmed its main contact, and only if it
 *    was never verified before (Skylar's own checks are left as they are).
 *  - Contact details from directories or news are filled but say so in `src`.
 *  - Nine resources turned up nothing online. Skylar confirmed they exist by
 *    word of mouth, so their notes say that instead of doubting them.
 * Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DAY = "2026-11-08";
const WEB = "web search, 8 Nov 2026";
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
const blank = (v) => !v || !String(v).trim();

const res = load("resources.json");
const byId = new Map(res.file.resources.map((r) => [r.id, r]));
const get = (id) => {
  const r = byId.get(id);
  if (!r) throw new Error(`no resource with id ${id}`);
  return r;
};
const expect = (r, key, value) => {
  if (r[key] !== value) throw new Error(`${r.id}.${key} is ${JSON.stringify(r[key])}, expected ${JSON.stringify(value)}`);
};
/* write a field that is empty today; refuse to overwrite */
const fill = (r, key, value) => {
  if (!blank(r[key])) throw new Error(`${r.id}.${key} already holds ${JSON.stringify(r[key])}`);
  r[key] = clean(value);
};
const append = (r, key, text) => {
  clean(text);
  const cur = (r[key] || "").trim();
  if (!cur) r[key] = text;
  else if (key === "src") r[key] = `${cur}; ${text}`;
  else r[key] = `${cur}${/[.!?)]$/.test(cur) ? "" : "."} ${text}`;
};
const swap = (r, key, from, to) => {
  if (!r[key].includes(from)) throw new Error(`${r.id}.${key} does not contain ${JSON.stringify(from)}`);
  r[key] = r[key].replace(from, clean(to));
};
let verified = 0;
const webVerified = (r) => {
  if (!blank(r.lv)) return; /* keep an earlier, direct verification */
  r.lv = DAY;
  r.vb = "SB (web search)";
  verified++;
};
let n = 0;
const patch = (id, fn) => {
  const r = get(id);
  fn(r);
  clean(r);
  n++;
};
/* known locally, not online: Skylar confirmed these exist by word of mouth */
const WOM = "Word of mouth: a local resource with no online listing (Skylar Belt, 8 Nov 2026). The details come "
  + "from local contacts, so confirm them before referring.";
const wordOfMouth = (id, extraNote = "", extraSrc = "") => patch(id, (r) => {
  append(r, "note", extraNote ? `${WOM} ${extraNote}` : WOM);
  append(r, "src", `not listed online (nothing found by ${WEB}); exists by word of mouth, per Skylar Belt, 8 Nov 2026`
    + (extraSrc ? `; ${extraSrc}` : ""));
});

/* -------------------------------------- copies from the same organization */

patch("12-baskets-tech-help-tuesdays", (r) => {
  const cafe = get("12-baskets-cafe");
  fill(r, "ph", cafe.ph);
  fill(r, "w", cafe.w);
  fill(r, "h", "Tuesdays 10:30am-12:30pm");
  append(r, "src", "phone and website copied from the 12 Baskets Cafe row");
});
patch("safe-shelter", (r) => {
  const main = get("safe-shelter-2");
  fill(r, "w", main.w);
  fill(r, "a", main.a);
  fill(r, "h", main.h);
  append(r, "d", "Details are on the main Safe Shelter row.");
  webVerified(r);
  append(r, "src", `website, address and hours copied from the main Safe Shelter row, confirmed on its own site via ${WEB}`);
});
patch("mercado-unete-bounty-soul", (r) => {
  const bs = get("bounty-soul");
  fill(r, "ph", bs.ph);
  fill(r, "w", bs.w);
  fill(r, "h", "Martes 3:30-5pm");
  append(r, "src", "phone and website copied from the Bounty & Soul row");
});
patch("liheap-heating", (r) => {
  const main = get("liheap");
  fill(r, "ph", main.ph);
  fill(r, "w", main.w);
  fill(r, "a", main.a);
  append(r, "d", "For the 2026-27 dates, see the main LIHEAP row.");
  append(r, "src", "phone, website and address copied from the main LIHEAP row");
});
patch("manna-packs", (r) => {
  fill(r, "w", "mannafoodbank.org");
  append(r, "src", "MANNA's website, as on the MANNA helpline rows");
});
patch("salvation-army-asheville", (r) => {
  fill(r, "ph", "828-253-4723");
  append(r, "src", `phone from the Salvation Army's Asheville page (one number for its Haywood St services) via ${WEB}`);
});
patch("ssi-ssdi", (r) => {
  const ssa = get("social-security-administration");
  fill(r, "ph", ssa.ph);
  fill(r, "w", ssa.w);
  fill(r, "a", ssa.a);
  fill(r, "h", ssa.h);
  append(r, "src", "phones, website, office and hours copied from the Social Security Administration row (verified Aug 2026)");
});

/* ---------------------------------------------------- food and basics */

wordOfMouth("budgie-s-bakery-free-pantry");
patch("rosetta-s-kitchen-everyone-eats", (r) => {
  fill(r, "h", "Tue-Sat 12-8pm (the restaurant's own page; other listings differ)");
  append(r, "d", "Still at 68 N Lexington. Its own page describes pay-it-forward and sliding-scale meals; an older "
    + "article priced the Everyone Eats plate (beans, rice, and slaw or chips) at $2 to $6 on a sliding scale, so ask "
    + "what is free now.");
  append(r, "src", `address, hours and pay-it-forward meals from the restaurant's own page, older pricing from Mountain Xpress, via ${WEB}`);
});
patch("field-and-kitchen", (r) => {
  append(r, "note", "May be closed. An undated survey from its operator, Caja, says it is closing this Field & "
    + "Kitchen location \"this fall\" to consolidate at the farm. Call before sending anyone.");
  r.readFirst = true;
  append(r, "src", `possible closure from the operator's survey page via ${WEB}`);
});
patch("root-cause-farm-free-market", (r) => {
  fill(r, "ph", "828-276-1156");
  fill(r, "a", "26 Joe Jenkins Rd, Fairview");
  fill(r, "h", "Share Market Tuesdays 3-4:30pm in season (about April to November)");
  append(r, "d", "Free produce, no questions asked, run with Bounty & Soul; bring a bag. The 2025 market ran April 1 "
    + "to November 11, so expect a winter break. Older listings give other times, so call first.");
  append(r, "src", `address, phone, market time and season from farm directory listings and WLOS via ${WEB}`);
});
wordOfMouth("bountiful-cities-free-veggie-mondays", "Bountiful Cities also runs free Share Markets (WLOS listed "
  + "one on October 28 at William Randolph School, 3-5pm).", "Share Markets from WLOS");
patch("estes-resource-center", (r) => {
  expect(r, "a", "1984 Hendersonville Rd");
  r.n = "Estes Family Resource Center (W.W. Estes Elementary)";
  r.a = "W.W. Estes Elementary, 275 Overlook Rd, Asheville (beside the bus lot)";
  fill(r, "w", "acrms.buncombeschools.org/o/wwees/page/estes-family-resource-center");
  r.d = "Food pantry, clothing closet, parenting classes and holiday help for Estes Elementary families, run from a "
    + "building beside the school's bus lot; it also collects school supplies. This row used to give 1984 "
    + "Hendersonville Rd, which could not be confirmed.";
  append(r, "src", `center, services and address from Buncombe County Schools' Estes Elementary pages via ${WEB}; old address not found`);
});
patch("foster-adventist-church", (r) => {
  fill(r, "ph", "828-274-2014");
  append(r, "d", "Listings describe a food pantry and a hot to-go breakfast, and a 2020 listing adds a clothing closet. "
    + "Showers could not be confirmed (the county's resource sheet lists showers at the downtown YMCA), so call first.");
  append(r, "src", `phone and services from church and food directory listings and a Buncombe County resource sheet via ${WEB}`);
});
wordOfMouth("laundry-love", "The BBB lists Fiesta Laundries at 712 Merrimon Ave, not 615, so check the address.",
  "Fiesta's address from the BBB");
wordOfMouth("project-comfort", "If it cannot help, ABCCM has given out free air conditioners and fans in heat "
  + "waves, and BeLoved Asheville has handed out heaters in past winters.", "alternatives from WLOS");
patch("swannanoa-communities-together", (r) => {
  fill(r, "a", "2121 US 70 Hwy, Swannanoa");
  append(r, "src", `address from a Pisgah Legal Services page and Helene case management from Direct Relief via ${WEB}; no phone or website found`);
});

/* ------------------------------------------------- community and work */

patch("burton-street-community-center", (r) => {
  fill(r, "ph", "828-254-1942");
  fill(r, "w", "ashevillenc.gov/locations/burton-street-community-center/");
  webVerified(r);
  append(r, "src", `phone and address from the City of Asheville's community center listing via ${WEB}`);
});
patch("hood-huggers-international", (r) => {
  fill(r, "w", "hoodhuggers.com");
  append(r, "d", "Founded by DeWayne Barton: arts, environmental stewardship and social enterprise in Black "
    + "neighborhoods, with walking and driving tours of legacy Black neighborhoods booked through the website.");
  append(r, "src", `website and tours from PBS North Carolina and Mountain Xpress via ${WEB}`);
});
wordOfMouth("watoto-wa-utamaduni-children-of-culture");
patch("just-economics-wnc", (r) => {
  fill(r, "ph", "828-505-7466");
  fill(r, "em", "info@justeconomicswnc.org");
  fill(r, "w", "justeconomicswnc.org");
  fill(r, "a", "PO Box 2396, Asheville 28802 (mailing)");
  append(r, "d", "Living wage rates and certification are at justeconomicswnc.org/living-wage-certification; it "
    + "announced 2026 rates and fully resumed certification.");
  webVerified(r);
  append(r, "src", `phone, email and address from Just Economics' own site, 2026 rates from 828newsNOW, via ${WEB}`);
});
patch("mountain-bizworks", (r) => {
  fill(r, "ph", "828-253-2834");
  fill(r, "w", "mountainbizworks.org");
  fill(r, "a", "153 S Lexington Ave, Asheville 28801");
  append(r, "d", "Business loans from $10,000 to $250,000 for WNC small businesses.");
  webVerified(r);
  append(r, "src", `phone and address from Mountain BizWorks' own event pages, loan range from Idealist, via ${WEB}`);
});
patch("kramden-institute", (r) => {
  fill(r, "w", "kramden.org");
  append(r, "d", "Kramden is in Durham, and computers must be picked up there in person. Tech Scholars is for "
    + "students in grades 3 to 12 with no working home computer, nominated by a teacher, counselor, school social "
    + "worker or principal, with free tech support while they are enrolled.");
  append(r, "src", `website, Tech Scholars rules and pickup from kramden.org and a Durham schools page via ${WEB}; no phone found`);
});
patch("e2d", (r) => {
  append(r, "d", "E2D (Eliminate the Digital Divide) is a Davidson nonprofit founded in 2013, and most of its "
    + "programs serve Charlotte-Mecklenburg students, so ask whether a WNC family qualifies.");
  append(r, "src", `base and programs from UNC Charlotte, Lowe's and Davidson news via ${WEB}; no phone or website confirmed`);
});
for (const id of ["hispanic-federation-nc", "hispanic-federation-nc-2"]) {
  patch(id, (r) => {
    fill(r, "w", "hispanicfederation.org/about/where-we-operate/north-carolina/");
    append(r, "d", "There is no Asheville office: its North Carolina offices are in Charlotte and Mount Olive, and "
      + "the website has a contact form. It also runs NC Salud, a Spanish-language health information hotline.");
    append(r, "src", `offices from Hispanic Federation's North Carolina page, NC Salud from WUNC, via ${WEB}`);
  });
}
patch("us-committee-for-refugees-and-immigrants-usc", (r) => {
  fill(r, "ph", "919-334-0072");
  fill(r, "w", "refugees.org/nc/");
  fill(r, "a", "3824 Barrett Dr, Suite 200, Raleigh 27609");
  append(r, "d", "USCRI's North Carolina office is in Raleigh and it has no Asheville office. In Asheville, start "
    + "with Catholic Charities (see that row).");
  webVerified(r);
  append(r, "src", `phone from USCRI's North Carolina page, address from a state directory, via ${WEB}`);
});
patch("el-centro", (r) => {
  fill(r, "w", "elcentrohvl.org");
  append(r, "d", "El Centro of Henderson County is the Latino Advocacy Coalition's center, founded in 1998; a "
    + "listing describes GED preparation and digital literacy classes. For free English and citizenship classes in "
    + "Henderson County, Literacy Connection is another option.");
  append(r, "src", `website and classes from Idealist and GreatNonprofits listings via ${WEB}; no phone found`);
});

/* ------------------------------------------------ families and caregivers */

wordOfMouth("fostering-the-family");
patch("homebuilders", (r) => {
  fill(r, "w", "ncdhhs.gov/divisions/social-services/family-first-prevention-services-act-information");
  append(r, "d", "Families cannot sign up themselves: county child welfare staff refer a family when a child is at "
    + "imminent risk of going into foster, group or institutional care. Expect about 40 hours of in-home work over "
    + "four weeks. NCDHHS lists Children's Home Society of NC as the provider for Social Services Regions One, Two "
    + "and Four.");
  append(r, "src", `referral rule and providers from NCDHHS, hours from a 2024 Centerstone flyer, via ${WEB}`);
});
patch("nc-free-legal-answers", (r) => {
  fill(r, "w", "nc.freelegalanswers.org");
  append(r, "d", "Household income must be under 300% of the federal poverty level, and questions must be about "
    + "civil matters such as family, housing or consumer problems.");
  webVerified(r);
  append(r, "src", `eligibility from the site's own FAQ via ${WEB}`);
});
for (const id of ["nc-lifespan-respite", "nc-lifespan-respite-2"]) {
  patch(id, (r) => {
    fill(r, "w", "ncdhhs.gov/divisions/aging/nc-lifespan-respite-program");
    append(r, "d", "NCDHHS reimburses family caregivers of a person of any age for up to $750 of respite in a "
      + "calendar year; the money has to be used within 90 days of approval.");
    append(r, "src", `program page from NCDHHS via ${WEB}`);
  });
}
for (const id of ["bcs-language-services", "bcs-language-services-2"]) {
  patch(id, (r) => {
    fill(r, "ph", "828-350-2295");
    fill(r, "em", "languageservices@bcsemail.org");
    fill(r, "w", "buncombeschools.org/page/language-services");
    append(r, "d", "On-call interpreters and translators for Spanish, Russian, Ukrainian, Vietnamese and Moldovan, "
      + "and an outside agency for other languages. Each school has a Language Services designee, and families can "
      + "ask the school for the form to request an interpreter at a parent-teacher conference.");
    webVerified(r);
    append(r, "src", `phone, email and services from Buncombe County Schools' Language Services pages via ${WEB}`);
  });
}
patch("a-b-tech-lavender-fund-single-parent-scholar", (r) => {
  fill(r, "ph", "828-398-7177 (A-B Tech Foundation)");
  fill(r, "em", "advancement@abtech.edu");
  fill(r, "w", "abtech.edu/future-students/financial-aid/scholarships/lavender-fund-scholarship-program-single-parents");
  append(r, "d", "For single parents with primary custody of a child under 18, taking at least 8 credit hours a "
    + "semester. Apply online January to April; awards are announced in June. It pays tuition and can cover "
    + "emergencies such as rent, utilities or food, with support through the year. The 2026 deadline was April 24.");
  webVerified(r);
  append(r, "src", `eligibility, dates and contacts from A-B Tech's scholarship and Foundation pages via ${WEB}`);
});
patch("cmarc-care-management-for-at-risk-children-ages-0-5", (r) => {
  fill(r, "ph", "828-250-5707 (Buncombe CMARC referrals)");
  fill(r, "w", "ncdhhs.gov/divisions/child-and-family-well-being/whole-child-health-section/school-adolescent-and-child-health/care-management-risk-children");
  append(r, "d", "Referrals go to the CMARC staff at the health department in the child's county; the Buncombe "
    + "number is the referral line in NC Medicaid's CMARC directory.");
  webVerified(r);
  append(r, "src", `Buncombe referral line from NC Medicaid's CMARC Referral and Supervisor Directory via ${WEB}`);
});
patch("mountaincare-adult-day-services", (r) => {
  fill(r, "ph", "828-277-3399");
  expect(r, "note", "The guide gives no phone or website, and the address is from a 2024 move. Confirm both before referring.");
  r.note = "The phone is from the state's adult day directory, which still shows the old Sweeten Creek Rd address. "
    + "Ask for the First Baptist Church site, and confirm the address before referring.";
  append(r, "src", `phone from the NC Division of Aging and Adult Services adult day directory, 2024 move from the Biltmore Beacon, via ${WEB}`);
});
patch("the-little-gym-parent-survival-nights", (r) => {
  fill(r, "ph", "828-747-2239");
  fill(r, "w", "thelittlegym.com/AshevilleNC");
  append(r, "d", "The Little Gym describes Parent Survival Nights as drop-off evenings for potty-independent "
    + "children ages 3 to 12 (this row said 3 to 5). Book ahead; no 2026 dates turned up.");
  webVerified(r);
  append(r, "src", `phone, address and age range from The Little Gym's own pages via ${WEB}`);
});
wordOfMouth("we-belong-sensory-friendly-programming", "The same address (1 Edwin Pl, the Unitarian Universalist "
  + "Church of Asheville) also hosts a We Belong Caregiver Support Group for families of neurodivergent youth.",
  "caregiver group from the UU Asheville calendar");
wordOfMouth("little-land-stewards");
patch("operation-fan-heat-relief", (r) => {
  fill(r, "ph", "828-251-6622 (Land of Sky Area Agency on Aging) / 919-855-3400 (NCDHHS)");
  fill(r, "w", "landofsky.org");
  append(r, "d", "For people 60 and older and adults with disabilities, May 1 to October 31, through the local Area "
    + "Agency on Aging.");
  append(r, "src", `dates, eligibility and NCDHHS line from NCDHHS releases, Land of Sky phone from an older NCDHHS notice, via ${WEB}`);
});
patch("operation-fan-heat-relief-2", (r) => {
  fill(r, "ph", "828-251-6622 (Land of Sky Area Agency on Aging) / 919-855-3400 (NCDHHS)");
  fill(r, "w", "landofsky.org");
  append(r, "d", "Also for adults with disabilities.");
  append(r, "src", `eligibility and NCDHHS line from NCDHHS releases, Land of Sky phone from an older NCDHHS notice, via ${WEB}`);
});
patch("wnc-repair-cafe", (r) => {
  fill(r, "em", "WNCRepairCafe@gmail.com");
  fill(r, "w", "wncrepaircafe.blogspot.com");
  append(r, "d", "Free, volunteer-run repair events at Buncombe library branches, the Asheville Tool Library, the "
    + "Weaverville Community Center and elsewhere. No registration, but email ahead about the item. Dates are on "
    + "the calendar on its events page.");
  webVerified(r);
  append(r, "src", `email, venues and calendar from the Repair Cafe's own site via ${WEB}`);
});
patch("wnc-farmers-market", (r) => {
  fill(r, "ph", "828-253-1691");
  fill(r, "w", "ncagr.gov/markets/facilities/markets/asheville/");
  append(r, "d", "Retail shops 8am-5pm; closed New Year's Day, Easter, Thanksgiving and Christmas.");
  webVerified(r);
  append(r, "src", `phone from the market's listing and the NC Department of Agriculture page, closing days from a market listing, via ${WEB}`);
});
patch("south-french-broad-free-fridge", (r) => {
  expect(r, "n", "South French Broad Free Fridge");
  r.n = "South French Free Fridge";
  fill(r, "em", "SouthFrenchFreeFridge@gmail.com");
  append(r, "d", "One of Asheville's first community fridges, started in July 2022. Volunteers coordinate by email; "
    + "food empties within a day, so check it often.");
  append(r, "src", `name, start date and email from Mountain Xpress via ${WEB}; current status not confirmed`);
});

/* ------------------------------------------------ health and mental health */

patch("national-deaf-therapy-deaf-counseling-center", (r) => {
  fill(r, "w", "deafcounseling.com");
  append(r, "d", "Deaf Counseling Center is a national telehealth practice of licensed Deaf therapists (individual, "
    + "couples and family therapy, plus an ASL support line), and NCDHHS lists it among national resources. Confirm "
    + "the therapist is licensed in North Carolina.");
  append(r, "src", `practice details from deaf library directories and NCDHHS's Deaf mental health page via ${WEB}`);
});
patch("out-of-the-woods-therapy", (r) => {
  fill(r, "ph", "828-333-4907 / 828-677-3005");
  fill(r, "w", "outofthewoodstherapy.com");
  fill(r, "a", "19 Zillicoa St, Suite 3, Asheville 28801 (Homewood building, Montford)");
  append(r, "d", "The two phone numbers come from different listings (the practice's registry entry and one "
    + "therapist's profile).");
  append(r, "src", `website and address from the practice's own site, phones from the NPI registry and Psychology Today, via ${WEB}`);
});
patch("robin-tallent-aprn-pmhnp", (r) => {
  fill(r, "ph", "828-830-1834");
  append(r, "d", "Her Psychology Today profile lists a Weaverville office (28787), says she takes insurance, and "
    + "gives $150 for a standard visit and $250 for a first visit.");
  append(r, "src", `phone and fees from her Psychology Today profile via ${WEB}`);
});
patch("brandy-colvin-pmhnp", (r) => {
  fill(r, "ph", "828-383-0258");
  fill(r, "a", "Forsyth Family Counseling, 40 N French Broad Ave, Asheville 28801");
  append(r, "d", "Her Psychology Today profile lists Forsyth Family Counseling on N French Broad Ave (this row said "
    + "S French Broad) and offers in-person and online visits.");
  append(r, "src", `phone and practice from her verified Psychology Today profile via ${WEB}`);
});
patch("daymark-recovery-services", (r) => {
  fill(r, "ph", "866-275-9552 (Daymark 24-hour crisis line)");
  fill(r, "a", "277 Biltmore Ave, Asheville 28801 (Caiyalynn Burrell Child Crisis Center)");
  append(r, "d", "Daymark's Buncombe facility-based crisis unit is the Caiyalynn Burrell Child Crisis Center, 24/7 "
    + "crisis care for ages 6 to 17 (see that row). No Daymark adult facility-based crisis center turned up in "
    + "Buncombe.");
  append(r, "src", `24-hour line and FBC Buncombe address from Daymark's annual reports, ages from a facility listing, via ${WEB}`);
});
patch("porchlight-project", (r) => {
  fill(r, "ph", "828-254-0516 (Helpmate 24/7 hotline)");
  append(r, "d", "In Buncombe, the PorchLight Project from Helpmate and Our VOICE is a network of businesses showing "
    + "its logo, where someone in danger can ask to use a phone in a private space and wait safely for help.");
  append(r, "src", `how it works from WLOS, Mountain Xpress and 828newsNOW via ${WEB}; it has no phone line of its own, so the Helpmate hotline is given`);
});
patch("nami-western-nc", (r) => {
  expect(r, "n", "NAMI Western NC: Education, support groups, and advocacy");
  r.n = "NAMI Western Carolina: Education, support groups, and advocacy";
  fill(r, "ph", "828-505-7353");
  fill(r, "em", "info@namiwnc.org");
  fill(r, "a", "356 Biltmore Ave, Suite 207, Asheville");
  append(r, "d", "Over 20 free support groups a month for people living with mental illness and for families, "
    + "including Family-to-Family classes, across Buncombe, Madison, Mitchell and Yancey. National NAMI HelpLine: "
    + "800-950-6264, or text NAMI to 62640.");
  append(r, "src", `phone, email, office and groups from a NAMI directory listing and Mountain Xpress via ${WEB}`);
});
patch("youth-villages", (r) => {
  fill(r, "ph", "828-250-3700");
  fill(r, "a", "10 Crispin Ct, Suite D-203, Asheville 28803");
  webVerified(r);
  append(r, "src", `Asheville office and phone from Youth Villages' own North Carolina page via ${WEB}`);
});
patch("seek-healing", (r) => {
  fill(r, "ph", "828-547-4547 (Listening Line, call or text)");
  fill(r, "a", "50 S French Broad Ave, Suite 138, Asheville");
  append(r, "d", "The Listening Line is non-crisis emotional support from trained volunteers and peer support "
    + "specialists. Group Connection Practice meets in Asheville, in Waynesville and on Zoom.");
  append(r, "src", `Listening Line from GuideStar, address from directories, groups from its own pages, via ${WEB}`);
});
patch("ecac", (r) => {
  fill(r, "ph", "1-800-962-6817 (Parent Info Line) / 704-892-1321");
  fill(r, "a", "907 Barra Row, Davidson (statewide office)");
  webVerified(r);
  append(r, "src", `phones and address from the federal Parent Center Hub directory via ${WEB}`);
});
patch("hark", (r) => {
  append(r, "d", "Requests come through a Buncombe HHS worker or a Buncombe County Schools staff member, who fills in "
    + "HARK's request form, so families start with their caseworker or school. It serves children in court-ordered "
    + "custody, youth aging out of foster care, and children without stable housing.");
  append(r, "src", `who it serves and how to ask, from HARK's own site via ${WEB}; no phone found`);
});
patch("beloved-asheville", (r) => {
  fill(r, "ph", "828-412-2054");
  append(r, "d", "Its site says it is best reached by phone, email or appointment. After Helene it gave temporary "
    + "housing such as RVs and tiny homes; this check did not show it running a shelter, so ask what it offers now. "
    + "Donation center at 32 Old Charlotte Hwy, Tuesday to Saturday.");
  append(r, "src", `phone from Cause IQ, contact advice from its own FAQ, housing from Mountain Xpress, via ${WEB}`);
});
patch("haywood-street-congregation-downtown-welcome", (r) => {
  fill(r, "ph", "828-575-2477");
  fill(r, "h", "Welcome Table lunch Wednesdays about 10:30am-1pm (confirm Sunday meals)");
  append(r, "src", `phone and Wednesday hours from UMC.org, MANNA's food finder and a Buncombe County sheet via ${WEB}`);
});
wordOfMouth("rsa-asheville", "The website listed here did not turn up in the search either, so confirm it and the "
  + "email.");

/* ----------------------------------------------- language, learning, care */

patch("alas-asheville-latin-americans-achieving-suc", (r) => {
  fill(r, "ph", "828-406-1766");
  append(r, "src", `phone from Cause IQ via ${WEB}`);
});
patch("literacy-together", (r) => {
  fill(r, "ph", "828-254-3442");
  append(r, "src", `phone from Idealist and a regional directory via ${WEB}`);
});
patch("dolly-parton-s-imagination-library", (r) => {
  fill(r, "ph", "828-254-3442 (Literacy Together)");
  append(r, "src", `Literacy Together's phone from Idealist and a regional directory via ${WEB}`);
});
for (const id of ["read-to-succeed-asheville-buncombe-r2s", "read-to-succeed-asheville-buncombe-r2s-2"]) {
  patch(id, (r) => {
    fill(r, "ph", "828-747-2277");
    fill(r, "a", "16A Stewart St, Asheville");
    append(r, "d", "Trained volunteers tutor K-3 readers one to one in Asheville City and Buncombe County schools.");
    append(r, "src", `phone and office from volunteer listings, tutoring model from a Buncombe County grant report, via ${WEB}`);
  });
}
patch("monarch", (r) => {
  fill(r, "ph", "704-986-1500 (main line; ask for the Asheville office)");
  append(r, "src", `main line from Monarch's own locations page via ${WEB}; no Asheville number confirmed`);
});
patch("easterseals-port-health", (r) => {
  expect(r, "w", "easterseals.com");
  r.w = "porthealth.org";
  fill(r, "ph", "800-662-7119");
  append(r, "d", "It has an Asheville location, but no direct number for it turned up; start with the main line.");
  append(r, "src", `main line and website from several Easterseals PORT Health listings via ${WEB}`);
});
patch("rise-autism-therapy", (r) => {
  fill(r, "ph", "828-989-1924");
  append(r, "d", "The federal provider registry lists this phone and an office at 17 Fortune St, Black Mountain.");
  append(r, "src", `phone from the NPI registry via ${WEB}`);
});
patch("bluebell-aba-asheville", (r) => {
  fill(r, "ph", "704-610-7500");
  append(r, "d", "A January 2026 press release gives this number (a Charlotte-area line, perhaps central) and "
    + "announced its autism assessment and diagnosis service.");
  append(r, "src", `phone and assessment launch from a January 2026 press release via ${WEB}`);
});
for (const r of res.file.resources.filter((x) => x.id.startsWith("carolina-pediatric-therapy"))) {
  patch(r.id, (row) => {
    fill(row, "ph", "828-670-8056 (main line)");
    append(row, "src", `main line from the NPI registry and business directories via ${WEB}`);
  });
}

res.file.meta.sources.push("Gap fill by web search, 8 Nov 2026: phones, websites, addresses and hours "
  + "(see scripts/apply-gap-fill-2026-11-08.mjs)");
save(res);
console.log(`patched ${n} rows; ${verified} newly verified`);

/* ------------------------------------------------------------ changelog */

const cl = load("changelog.json");
const group = (id) => cl.file.groups.find((g) => g.id === id);
group("open-questions").entries.unshift(clean({
  date: "OPEN",
  what: "Is Field & Kitchen in Hendersonville still open?",
  detail: "Its operator, Caja, posted an undated survey saying it is closing this location \"this fall\" to "
    + "consolidate at the farm. Confirm with Field & Kitchen or Caja, then mark the row closed or clear its note.",
  source: "Gap fill, web search 8 Nov 2026",
}));
group("added").entries.unshift(clean({
  date: "Nov 8 2026",
  what: "Gap fill: phones, websites and addresses for about 70 rows",
  detail: "Contact details filled for rows that had none, among them Burton Street Community Center, Just "
    + "Economics, Mountain BizWorks, BCS Language Services, CMARC's Buncombe referral line, the Lavender Fund, Youth "
    + "Villages, ECAC, NAMI Western Carolina, the WNC Farmers Market, Read to Succeed, Literacy Together and all six "
    + "Carolina Pediatric Therapy rows. Corrections: the Estes Resource Center is the Estes Elementary family "
    + "resource center on Overlook Rd, Brandy Colvin's office is on N French Broad, and USCRI and Hispanic "
    + "Federation have no Asheville office. Nine local resources that exist by word of mouth, with no online "
    + "listing, are now marked that way.",
  source: "scripts/apply-gap-fill-2026-11-08.mjs",
}));
save(cl);
console.log("changelog updated");
