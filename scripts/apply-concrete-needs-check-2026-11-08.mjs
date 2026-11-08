/*
 * Concrete Needs and national hotlines check, 2026-11-08.
 *
 * Web search over the most-used food, baby gear, transportation, utility and
 * shelter rows, plus two national hotlines from the Public Edition. Found:
 *  - ABBA's House was described as safe housing for domestic violence
 *    survivors. Asheville's Abba's House is a recovery residence for pregnant
 *    and parenting mothers, run by Western Carolina Rescue Ministries. Sending
 *    a survivor there by mistake could put her at risk, so the row says so now.
 *  - The Salvation Army's 65-bed Center of Hope shelter is paused from
 *    1 Nov 2026 to 30 Apr 2027 for lack of funding.
 *  - The NC Diaper Bank formula row carried a Houston phone number and a
 *    walk-in description that match some other organisation.
 *  - Modivcare labelled WellCare's ride line as MTM; NC Medicaid lists it as
 *    One Call. 12 Baskets showed its Tech Help time as its lunch hours.
 *  - Hours were cut off mid-word on ART, Mountain Mobility and BEAR Closets.
 *  - Mountain Mobility and Modivcare were tagged "Toys or books" (VIII:10a).
 *
 * Same rules as the earlier passes: a row gets lv 2026-11-08 and vb
 * "SB (web search)" only when an official or the organisation's own source
 * confirmed its main contact; nothing is filled from guesswork. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DAY = "2026-11-08";
const WEB = "web search, 8 Nov 2026";
const EN = String.fromCharCode(0x2013);
const DASH = new RegExp("[" + EN + String.fromCharCode(0x2014) + "]");
const RSQUO = String.fromCharCode(0x2019);

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

const res = load("resources.json");
const byId = new Map(res.file.resources.map((r) => [r.id, r]));
const expect = (r, key, value) => {
  if (r[key] !== value) throw new Error(`${r.id}.${key} is ${JSON.stringify(r[key])}, expected ${JSON.stringify(value)}`);
};
/* replace one passage of existing text, failing loudly if it is not there */
const swap = (r, key, from, to) => {
  if (!r[key].includes(from)) throw new Error(`${r.id}.${key} does not contain ${JSON.stringify(from)}`);
  r[key] = r[key].replace(from, clean(to));
};
const append = (r, key, text) => {
  clean(text);
  const cur = (r[key] || "").trim();
  if (!cur) r[key] = text;
  else if (key === "src") r[key] = `${cur}; ${text}`;
  else r[key] = `${cur}${/[.!?)]$/.test(cur) ? "" : "."} ${text}`;
};
const dropNeed = (r, key) => {
  if (!r.needs.includes(key)) throw new Error(`${r.id} has no need ${key}`);
  r.needs = r.needs.filter((k) => k !== key);
};
const webVerified = (r) => { r.lv = DAY; r.vb = "SB (web search)"; };
let n = 0;
const patch = (id, fn) => {
  const r = byId.get(id);
  if (!r) throw new Error(`no resource with id ${id}`);
  fn(r);
  clean(r);
  n++;
};

/* --------------------------------------------------------- safety fixes */

patch("abbas-house", (r) => {
  expect(r, "n", `ABBA${RSQUO}s House: Safe housing for survivors`);
  r.n = "Abba's House (Western Carolina Rescue Ministries): recovery housing for pregnant and parenting women";
  r.d = "Long-term, non-detox residential recovery program for women who are pregnant or parenting, run by Western "
    + "Carolina Rescue Ministries. Listings describe 12 to 18 months for opioid or other substance use recovery, with "
    + "14 rooms for mothers and babies, at no cost (one listing says 6 months plus an optional 6 in transitional "
    + "housing). It is not a domestic violence shelter: for safety from abuse, call Helpmate's 24/7 hotline, "
    + "828-254-0516. The phone is Western Carolina Rescue Ministries' number from its ECFA listing; 828-254-0471 is "
    + "also in circulation for the agency. The abbas-house.com link this row carried was removed because no source "
    + "tied it to the Asheville program. Abba House programs in Georgia do serve abuse survivors, which may be where "
    + "the earlier description came from.";
  r.ph = "828-254-1529";
  r.w = "";
  r.t = "Free";
  r.needs = ["VII:*", "VII:6a", "VIII:*", "VIII:6a", "X:*", "X:2"];
  r.note = "Corrected 8 Nov 2026: this is a recovery program for mothers, not domestic violence safe housing. For "
    + "abuse, refer to Helpmate (828-254-0516).";
  r.readFirst = true;
  append(r, "src", `program described by Mountain Xpress, WLOS and rehabs.org, phone from ECFA, via ${WEB}; domestic `
    + `violence description, link and DV need tags removed`);
});

patch("salvation-army-shelter", (r) => {
  expect(r, "n", "Salvation Army shelter");
  r.n = "Salvation Army shelter (65-bed program paused Nov 1, 2026 to Apr 30, 2027)";
  r.note = "The Center of Hope's 65-bed residential shelter is paused from November 1, 2026 through April 30, 2027 "
    + "for lack of funding. It still runs Code Purple emergency shelter on cold nights, and the food pantry and other "
    + "Haywood Street services continue. Call before sending anyone.";
  r.readFirst = true;
  append(r, "d", "The pause was first set for October 1 and moved to November 1. The Salvation Army put the "
    + "shelter's running cost at about $90,000 a month and is raising money to restart it next spring.");
  webVerified(r);
  append(r, "src", `phone from the Salvation Army's Asheville page; pause dates and Code Purple role from WLOS, `
    + `Mountain Xpress and BPR, via ${WEB}`);
});
patch("salvation-army-rent-assistance", (r) => {
  r.a = "204 Haywood St";
  append(r, "d", "Emergency rent and utility help as funding allows; call to ask how to apply. The residential "
    + "shelter at the same address is paused until spring 2027.");
  webVerified(r);
  append(r, "src", `address, phone and services from the Salvation Army's Asheville page and a local assistance `
    + `guide via ${WEB}`);
});
patch("salvation-army-asheville", (r) => {
  swap(r, "d", `Tuesday${EN}Thursday`, "Tuesday to Thursday");
  append(r, "d", "The food pantry keeps running while the residential shelter is paused (Nov 2026 to Apr 2027).");
  append(r, "src", `pantry continuing, per WLOS and Mountain Xpress via ${WEB}`);
});

patch("nc-diaper-bank-formula-program", (r) => {
  expect(r, "ph", "713-528-6044");
  r.n = "Diaper Bank of North Carolina (formula through partner agencies)";
  r.ph = "";
  r.w = "ncdiaperbank.org";
  r.t = "";
  r.d = "The Diaper Bank of North Carolina, based in Hillsborough, gives diapers, wipes and other supplies through "
    + "partner agencies rather than to walk-ins. After Hurricane Helene its Formula Project with NCDHHS and Feeding "
    + "the Carolinas has supported up to 2,000 babies through MANNA FoodBank in Asheville, so ask MANNA's food "
    + "helpline (828-290-9749) about formula. This row used to give 713-528-6044 and describe walk-in preemie formula "
    + "with a doctor's note; 713 is a Houston area code, and that description could not be matched to this "
    + "organization.";
  append(r, "src", `headquarters, partner model and Formula Project from Mountain Xpress, Buncombe County and `
    + `GuideStar via ${WEB}; Houston number and walk-in claim removed`);
});

/* ------------------------------------------------------- transportation */

patch("art-asheville-rides-transit", (r) => {
  expect(r, "h", "Mon-Sat 5:30am-10:30pm, Sun 8:30am-6:30");
  r.h = "Mon-Sat 5:30am-10:30pm; Sun and holidays 8am-6pm (check the route schedule)";
  swap(r, "d", "Sun 8:30am-6:30pm", "Sun and holidays 8am-6pm (per a city listing; this row said 8:30am-6:30pm before)");
  append(r, "d", "Press 1 on the customer service line to hear when the bus will arrive. 18 routes leave the ART "
    + "Station.");
  webVerified(r);
  append(r, "src", `phone, station, 18 routes and $1 fare from the city's transit page (updated 6 Oct 2026), hours `
    + `from a city listing not clearly dated 2026, via ${WEB}`);
});
patch("mountain-mobility", (r) => {
  expect(r, "h", "Mon-Sat 5:30am-7:30pm, Medicaid transpo");
  r.h = "Rides Mon-Sat 5:30am-7:30pm; eligibility line (Option 5) Mon-Fri 8am-5pm";
  dropNeed(r, "VIII:10a");
  webVerified(r);
  append(r, "src", `phone, Option 5 hours and services from Buncombe County's transportation pages via ${WEB}; `
    + `"Toys or books" need tag removed`);
});
patch("trailblazer-routes-free", (r) => {
  expect(r, "n", "Trailblazer routes (FREE)");
  r.n = "Trailblazer routes (Mountain Mobility)";
  r.w = "buncombenc.gov/615/Trailblazer-Routes";
  r.h = "Enka-Candler Mon-Fri about 6:15am-6:10pm; call 828-250-6750 for the other routes";
  r.t = "";
  append(r, "d", "Fare: the routes used to be free, but the last county notice found only promised that through "
    + "June 30, 2020, so confirm the current fare before telling a family.");
  webVerified(r);
  append(r, "src", `routes, quarter-mile deviation rule and fare history from Buncombe County's Trailblazer and `
    + `transportation pages via ${WEB}; "Free" tag removed until confirmed`);
});
patch("modivcare-medicaid-non-emergency-medical-tra", (r) => {
  expect(r, "ph", "1-888-621-2084 / 855-397-3602");
  r.w = "vayahealth.com/benefits-services/transportation-assistance/";
  r.h = "Booking Mon-Sat 7am-6pm; urgent rides 24/7";
  r.d = "Free rides to Medicaid-covered appointments. Book at least 2 days ahead and no more than 30. The number "
    + "depends on the health plan: Vaya Total Care 1-888-621-2084 (Where's My Ride 1-855-397-3614); Healthy Blue "
    + "855-397-3602 (TTY 711); Carolina Complete Health 855-397-3601; AmeriHealth Caritas 833-498-2262; "
    + "UnitedHealthcare 800-349-1855. WellCare uses a different company, One Call, at 877-598-7602 (this row used to "
    + "label that number MTM). Mileage reimbursement is an option. Vaya Total Care members: up to 12 non-medical "
    + "round trips a year.";
  dropNeed(r, "VIII:10a");
  webVerified(r);
  append(r, "src", `plan numbers, hours and booking window from Vaya, Healthy Blue, the other plans' pages and NC `
    + `Medicaid's list via ${WEB}; WellCare's broker corrected to One Call; "Toys or books" need tag removed`);
});

/* ------------------------------------------------------- food and gear */

for (const id of ["manna-food-helpline", "manna-food-helpline-2"]) {
  patch(id, (r) => {
    expect(r, "h", "Mon-Fri 9am-4pm");
    webVerified(r);
    append(r, "src", `helpline number and Mon-Fri 9am-4pm hours from MANNA's Where to Get Help page via ${WEB}; `
      + `MANNA's pages label 828-367-9456 differently (call and text, or text only)`);
  });
}
patch("12-baskets-cafe", (r) => {
  expect(r, "h", "Tuesdays 10:30am-12:30pm");
  r.h = "Lunch and free store Mon, Tue, Thu, Fri 11am-1pm (coffee from 10am)";
  append(r, "d", "Open to everyone. The hours field used to show the Tech Help Tuesdays time.");
  append(r, "src", `lunch days and hours from Mountain Xpress and the Biltmore Beacon via ${WEB}`);
});
patch("food-connection", (r) => {
  r.a = "Rotating sites in Candler, Fairview, Leicester, Swannanoa and Weaverville";
  r.h = "Tue Fairview, Wed Leicester, Thu Candler, Fri Weaverville, Sat Swannanoa (times at food-connection.org)";
  append(r, "d", "Meals go out from \"Beyond the Bus Line\" sites. WLOS has listed Fairview Food Lion on Tuesdays at "
    + "3pm, Bell United Methodist in Leicester on Wednesdays at 5pm, and 105 Whitson in Swannanoa on Saturdays from "
    + "11am; those reports are older, so check the website first.");
  append(r, "src", `site days from Buncombe County's food resources listing, times from WLOS, via ${WEB}`);
});
patch("bear-closets", (r) => {
  expect(r, "h", "Mondays 5-7pm, evening hours for worki");
  r.h = "Varies by site (details below): Weaverville UMC Mondays; St. Paul's UMC 2nd and 4th Wed 4-6pm; Abernethy "
    + "UMC 1st and 3rd Wed 10am-2pm";
  r.a = "Several United Methodist churches (listed below)";
  append(r, "d", "A Givens Communities list from August 2026 confirms St. Paul's hours and adds East Asheville UMC, "
    + "48 Browndale Rd (828-299-9742, by appointment). An undated WLOS notice gives Weaverville's appointment line as "
    + "828-645-6721 ext. 106. BEAR stands for Baby Equipment and Resources.");
  append(r, "src", `St. Paul's hours and East Asheville site from a Givens Communities list (Aug 2026), Weaverville `
    + `line from WLOS, via ${WEB}`);
});

/* ----------------------------------------------- utilities and shelter */

for (const id of ["crisis-intervention-program-cip", "crisis-intervention-program-cip-2"]) {
  patch(id, (r) => {
    r.ph = "828-250-6330 / 828-250-5500";
    r.w = "buncombenc.gov/395/Crisis-Intervention-Program";
    r.a = "40 Coxe Ave, Asheville (or apply at epass.nc.gov)";
    r.h = "Mon-Fri 8am-5pm";
    append(r, "d", "For households below 150% of the poverty level in a heating or cooling emergency. Covers "
      + "electric bills, deposits, fuel oil, kerosene, natural gas, propane, wood, coal, heaters, furnace repairs and "
      + "fans; not rent, mortgage or water. Apply by phone at 828-250-6330, online at epass.nc.gov, or in person at "
      + "40 Coxe Ave. 828-250-5500 is the county's Economic Services line.");
    webVerified(r);
    append(r, "src", `eligibility, coverage, phones and how to apply from Buncombe County's Crisis Intervention `
      + `Program and Help in an Emergency pages via ${WEB}`);
  });
}
patch("liheap", (r) => {
  expect(r, "h", "");
  r.h = "2026-27 (per a grants blog; confirm with DSS): Dec 1-31 for 60+ or disabled; others Jan 4 to Mar 31, 2027";
  append(r, "d", "2026-27 dates from a grants-tracking blog, not yet confirmed by NCDHHS or the county: December 1 to "
    + "31, 2026 for households with someone 60 or older, or a disabled person receiving services from the Division "
    + "of Aging and Adult Services; everyone else from January 4, 2027 (January 1 is a holiday) to March 31, 2027, or "
    + "until funds run out. Counties set their own intake, so confirm with Buncombe DSS.");
  append(r, "src", `2026-27 windows from a grants-tracking blog (unconfirmed), phone line from Buncombe County's `
    + `Help in an Emergency page, via ${WEB}`);
});
patch("duke-energy", (r) => {
  expect(r, "w", "");
  r.w = "duke-energy.com";
  append(r, "d", "Not confirmed for 2026-27: the only NC winter moratorium notice found was a 2021 COVID-era one, so "
    + "ask Duke what disconnection protection applies before promising it, and the Share the Light phone above could "
    + "not be confirmed. Duke's Payment Assistance Finder on duke-energy.com lists local agencies, and its Share the "
    + "Light page points to the county agency that takes applications.");
  append(r, "src", `assistance routes from Duke Energy releases via ${WEB}; moratorium and Share the Light phone not `
    + `confirmed`);
});
patch("code-purple", (r) => {
  r.h = "Cold nights only (2025-26 rule: 32°F or below, or 33-40°F with precipitation); entry 6-8pm";
  r.d = "Extra emergency shelter on cold nights, roughly Nov 1 to Apr 30. In the 2025-26 season it opened at 32°F or "
    + "below, or 33 to 40°F with precipitation. Sites that season: Safe Shelter, 91 New Leicester Hwy (men, 40 "
    + "beds); Safe Shelter, 27 Balm Grove Ave (women, 10); ABCCM Transformation Village, 30 Olin Haven Way (women, and "
    + "women with children, 35); Salvation Army, 204 Haywood St (men); Homeward Bound/AHOPE, 19 N Ann St (couples and "
    + "people with pets). Entry 6-8pm; no ID or sobriety needed. On Code Purple nights ART buses are free to every "
    + "site from 5:20pm and back downtown the next morning: tell the driver you need a Code Purple ride. The 2026-27 "
    + "site list had not been published as of 8 Nov 2026.";
  append(r, "src", `2025-26 rules, sites and transit from Buncombe County, the City of Asheville and WLOS via ${WEB}`);
});
patch("safe-shelter-2", (r) => {
  expect(r, "h", "Mon-Fri 1-2pm");
  r.h = "Walk-in Mon-Fri 11am-2pm, or referral through the website";
  r.w = "safeshelterasheville.org";
  swap(r, "d", "By referral; walk-in resource help Mon-Fri 1-2pm.",
    "Walk in Mon-Fri 11am-2pm, or send a referral through the website.");
  swap(r, "d", "Also runs the county's safe parking program for families living in vehicles: a legal, safe overnight spot.",
    "An older source said it also runs a safe parking program for families living in vehicles; that could not be "
    + "confirmed in November 2026, so check before telling a family.");
  append(r, "d", "About 20 beds at the West Asheville Community Hub, with families with minor children first. It was "
    + "the Code Purple site for women in 2025-26.");
  webVerified(r);
  append(r, "src", `beds, hours and referral route from Safe Shelter's own site and WLOS via ${WEB}; safe parking `
    + `claim not confirmed`);
});

/* -------------------------------------------------- national hotlines */

patch("love-is-respect", (r) => {
  expect(r, "ph", "1-866-331-9474 / text LOVEIS to 22522");
  webVerified(r);
  append(r, "src", `numbers and 24/7 hours confirmed on loveisrespect.org and an HHS hotline list via ${WEB}`);
});
patch("the-trevor-project", (r) => {
  expect(r, "ph", "1-866-488-7386 / text START to 678-678");
  append(r, "d", "For LGBTQ+ young people under 25.");
  webVerified(r);
  append(r, "src", `numbers, 24/7 hours and age range consistent across an HHS hotline list and school and `
    + `university hotline pages via ${WEB}`);
});

res.file.meta.sources.push("Crisis and Concrete Needs checks by web search, 8 Nov 2026 (see "
  + "scripts/apply-crisis-check-2026-11-08.mjs and scripts/apply-concrete-needs-check-2026-11-08.mjs)");
save(res);
console.log(`patched ${n} rows`);

/* ------------------------------------------------------------ changelog */

const cl = load("changelog.json");
const group = (id) => cl.file.groups.find((g) => g.id === id);
group("watch").entries.unshift(...[
  {
    date: "Nov 1 2026",
    what: "Salvation Army Center of Hope pauses its 65-bed shelter until April 30, 2027",
    detail: "For lack of funding, after it used its final installment of federal money (American Rescue Plan Act and "
      + "HUD). It still runs Code Purple emergency shelter on cold nights, and the food pantry and other Haywood "
      + "Street services continue. BPR reported that if the shelter closes for good, the region's shortage of "
      + "shelter beds would grow from about 90 to 155. Call 828-253-4723 before sending anyone.",
    source: "WLOS, Mountain Xpress and BPR (Aug 2026) via web search, 8 Nov 2026",
  },
  {
    date: "Dec 1 2026",
    what: "LIHEAP heating help opens: December for 60+ and disabled, January 4 for everyone",
    detail: "Households with someone 60 or older, or a disabled person receiving adult services, apply December 1 to "
      + "31, 2026. Everyone else applies January 4 to March 31, 2027, or until funds run out. Apply at epass.nc.gov, "
      + "40 Coxe Ave, or by phone at 828-250-6330. These dates come from a grants-tracking blog, so confirm them with "
      + "Buncombe DSS.",
    source: "Grants-tracking blog and Buncombe County pages via web search, 8 Nov 2026",
  },
].map(clean));
group("open-questions").entries.unshift(clean({
  date: "OPEN",
  what: "Concrete Needs details to confirm before relying on them",
  detail: "Whether the Trailblazer routes are still free; what winter disconnection protection Duke gives in 2026-27 "
    + "and whether 1-800-452-2777 reaches Share the Light; the 2026-27 Code Purple sites; BEAR Closet hours at "
    + "Weaverville and Abernethy; whether Safe Shelter runs a safe parking program; and which of 828-254-1529 or "
    + "828-254-0471 reaches Western Carolina Rescue Ministries.",
  source: "Concrete Needs check, web search 8 Nov 2026",
}));
group("added").entries.unshift(clean({
  date: "Nov 8 2026",
  what: "Concrete Needs check: a dangerous mix-up fixed, the Salvation Army shelter pause flagged",
  detail: "ABBA's House was described as domestic violence safe housing; it is a recovery residence for mothers, so "
    + "the row now says so and points survivors to Helpmate. The Salvation Army's 65-bed shelter is paused until "
    + "April 30, 2027. The NC Diaper Bank row's Houston number and walk-in description were removed. Modivcare now "
    + "lists each plan's ride line, with WellCare's corrected to One Call, and it and Mountain Mobility lost a stray "
    + "\"Toys or books\" tag. 12 Baskets, ART, Mountain Mobility, BEAR Closets and Safe Shelter had wrong or cut-off "
    + "hours. Code Purple now lists last season's sites and rules. Confirmed against official or the organizations' "
    + "own sources: ART, Mountain Mobility, Trailblazer, Modivcare, both MANNA helpline rows, both CIP rows, the "
    + "Salvation Army shelter and rent help, Safe Shelter, love is respect and the Trevor Project.",
  source: "scripts/apply-concrete-needs-check-2026-11-08.mjs",
}));
save(cl);
console.log("changelog updated");
