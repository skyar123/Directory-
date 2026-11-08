/* Applies what the 7 Nov 2026 Drive pass found to data/resources.json and
   data/events.json. Read from the owner's Drive under the merge prompt's rules
   (metadata first, only family-resource files, no client details, nothing
   from a weekend guide without a second source); only generic program facts
   are kept here, each with the document it came from in src.
     node scripts/apply-drive-merge-2026-11-07.mjs [--write]
   A row's own value is never overwritten: text is appended, a blank address,
   phone or hours is filled, and a disagreement goes in note. */
import { readFileSync, writeFileSync } from "node:fs";
const DATA = {
 "enrich": [
  {
   "id": "housing-authority-of-the-city-of-ashevil*",
   "src": "Drive: HACA Housing Application & Family Stabilization Guide (30 Aug 2026)",
   "add": "Apply online through the RENTCafe applicant portal (haca.org, Apply for Housing; register without a code). No internet or need an accommodation: the Admissions Office at 165 S French Broad Ave takes walk-ins Tuesdays 9am-5pm, appointments Mon, Wed and Thu. Expect a wait of up to about three years; keep the address and phone current in the portal, because a missed waitlist purge letter removes the family. Local preferences include homelessness and fleeing domestic violence. The guide says a 15-hour-a-week work or school rule applies from 2026-27 for adults who are not 62+, disabled, or the main caregiver of a child under 6; confirm with HACA. Once housed, the Family Self-Sufficiency (FSS) program puts rent increases from new earnings into an escrow savings account."
  },
  {
   "id": "rha-child-first",
   "src": "Drive: Child First Program Flyer, Parent & Family Overview (30 Aug 2026)",
   "add": "The flyer says families can call or text 828-273-1377 and covers Buncombe, Madison, Haywood, Henderson and Polk counties. Medicaid covers the service.",
   "note": "The program flyer gives childfirstnc@rhanet.org as its email; the referral address in this row is childandfamilyreferrals@rhanet.org. Ask which to use."
  },
  {
   "id": "best-bites-dental",
   "src": "Drive: Medicaid Dental Providers Guide, Buncombe County (30 Aug 2026)",
   "add": "Getting in, per the guide: email the practice's new-patient questionnaire with the child's insurance; a coordinator decides who joins the waiting list, mostly children with no current dentist. Openings are offered by phone with two or three days' notice or the same day, and a family that misses or declines three offers comes off the list."
  },
  {
   "id": "wnc-minnie-jones-health-center",
   "src": "Drive: Medicaid Dental Providers Guide, Buncombe County (30 Aug 2026)",
   "add": "Dental, per the guide: the routine adult dental waitlist is closed to new patients except established WNCCHS medical patients, Ryan White program patients, and pregnant or postpartum patients, so pregnancy Medicaid is the window to get dental work done. Children's dental stays open. No emergency dental walk-ins; call for urgent triage."
  },
  {
   "id": "angel-s-watch",
   "src": "Drive: Angel's Watch Respite Care Guide, Asheville & WNC (30 Aug 2026)",
   "add": "Free to families. Children keep going to their own school, and parents keep as much contact as they want. Also for housing loss and leaving domestic violence. A child's special needs do not rule them out if they are managed. Referral is a four-page intake form, usually faxed; the case manager visits within 72 hours of placement and weekly after."
  },
  {
   "id": "eliada-homes",
   "src": "Drive: Angel's Watch Respite Care Guide, Asheville & WNC (30 Aug 2026), citing eliada.org and Vaya Health",
   "add": "Also, per the guide: short-term emergency respite (up to 14 days) with Vaya Health for ages 6 to 17 with Medicaid and a mental health or mild intellectual/developmental disability diagnosis; therapeutic and family foster care for children in DSS custody, birth to 21; psychiatric residential treatment; Eliada Academy day treatment on campus; and ESTA job training for youth aging out of foster care."
  },
  {
   "id": "my-village-asheville-voluntary-child-hosting",
   "src": "Drive: My Village Respite Care Guide, Asheville & WNC (30 Aug 2026)",
   "note": "The Drive respite guide (Aug 2026) says My Village Asheville used to be called Alongside Families. The Public Edition (Nov 2026) lists Alongside Families (alongsidefamilies.org) separately, as home visiting for immigrant and refugee families. Check which is current before referring."
  },
  {
   "id": "alongside-families",
   "src": "Drive: My Village Respite Care Guide, Asheville & WNC (30 Aug 2026)",
   "note": "Sources disagree: the Drive respite guide (Aug 2026) gives Alongside Families as the former name of My Village Asheville, the church-based child-hosting ministry, while the Public Edition (Nov 2026) describes it as home visiting for immigrant and refugee families. Check alongsidefamilies.org before referring."
  },
  {
   "id": "child-care-subsidy-program",
   "src": "Drive: Free Childcare Leicester NC (14 Aug 2026)",
   "add": "Per the Drive childcare guide: a decision is due within 30 days of a signed application; eligibility lasts 12 months; report a new job, address or household change within 5 working days; families with CPS, child welfare or foster care involvement pay no parent fee; and when income rises past the limit there is a 12-month phase-out instead of a cliff. A voucher can be used at any 4- or 5-star licensed program. Get on the list even while waiting, because some charities ask for proof of a pending application. Some centers charge the gap between the state rate and their price, so ask before enrolling. Monthly income limits for families with a child under 6 (Aug 2026 guide): 2 people $3,525, 3 $4,442, 4 $5,358, 5 $6,275.",
   "note": "Sources disagree on who qualifies: this row says parents working or in school full time, while the Drive childcare guide (Aug 2026) says a parent looking for work, in job training, or with a child who has CPS involvement or developmental needs can qualify too. Ask DSS, and ask how long job-search care lasts."
  },
  {
   "id": "goodwill-industries",
   "src": "Drive: Phlebotomy Training & Workforce Stipends Guide, Buncombe County (30 Aug 2026); Drive: Goodwill Career Center Family Handout (29 Sep 2026)",
   "a": "1616 Patton Ave, Asheville, NC 28806",
   "add": "Goodwill Career Center, 1616 Patton Ave (also an A-B Tech campus): free and open to anyone, walk in or call, no appointment, referral or experience needed; a Career Navigator makes a plan with you. Free resume help, coaching, interview practice, computers and Wi-Fi, job fairs, and virtual classes and job fairs from home. A-B Tech classes in the building need only a high school diploma: Nurse Assistant I (first step to CNA), Pharmacy Assistant, Medical Office and Billing/Coding (work-from-home friendly), Intro to Health Care Careers; A-B Tech classes at Goodwill: 828-398-7520. The Goodwill Outreach Scholarship Fund has paid tuition, books, uniforms, background checks and even child care during training; the Reset program adds support for ages 18 to 24.",
   "note": "Hours differ: this row lists career coaching Mon-Fri 9am-4pm (A-B Tech listing); the Goodwill handout (Sep 2026) gives Mon-Thu 8am-5pm and Fri 8am-noon. Call to confirm."
  },
  {
   "id": "ncworks-career-center",
   "src": "Drive: Phlebotomy Training & Workforce Stipends Guide, Buncombe County (30 Aug 2026)",
   "add": "WIOA training funds through NCWorks (at A-B Tech) can pay tuition, books and uniforms for short training, up to about $9,000. Categories include adult workers with low income or public assistance, dislocated workers, and displaced homemakers: a parent pushed back into work by divorce, a spouse's death or lost family income. Bring a birth certificate or passport, Social Security card, ID, proof of address, household size and highest education."
  },
  {
   "id": "buncombe-dss",
   "src": "Drive: Phlebotomy Training & Workforce Stipends Guide, Buncombe County (30 Aug 2026)",
   "add": "Work First diversion, per the guide: a one-time lump-sum payment to get a family through a crisis, such as an eviction notice or a car breakdown, that threatens a job or training, instead of ongoing cash assistance. Ongoing Work First runs up to 24 months in a row (then a three-year wait), with a 60-month lifetime limit, and asks the parent to sign a plan for work or training."
  },
  {
   "id": "ymca-of-wnc-financial-assistance",
   "src": "Drive: Free & Low-Cost Childcare in Leicester & Buncombe County (family guide, checked Aug 2026); Drive: Free Childcare Leicester NC (14 Aug 2026)",
   "add": "For child care aid, apply for the county subsidy first; the Y covers gaps after a denial or a long wait. Its rule asks for 30+ hours of work a week or full-time school, but a written explanation of extenuating circumstances (disability, crisis, caring full time for a relative's child) is reviewed case by case. With a membership, Child Watch gives up to 2 hours a day of drop-in care while the parent uses the Y, and Y-Access can bring a membership close to free. Child Watch at the downtown branch, 30 Woodfin St: 828-210-9622.",
   "ph": "828-210-9622"
  },
  {
   "id": "verner-center-for-early-learning",
   "src": "Drive: Free & Low-Cost Childcare in Leicester & Buncombe County (family guide, checked Aug 2026); Drive: Free Childcare Leicester NC (14 Aug 2026)",
   "add": "Also, per the Drive childcare guides: Verner West in Candler; enrollment@verneremail.org. Classrooms run 8:30am-3pm Mon-Fri with breakfast, lunch and a snack. Free home-based Early Head Start: a teacher visits for about 90 minutes a week all year, at home or a library or park, plus family play groups with transportation. Eligibility is about the poverty line (about $32,150 a year for four), or automatic with SNAP, TANF, SSI, foster care or housing instability; the waitlist goes by need, not first come."
  },
  {
   "id": "caring-for-children-respite-scholarship",
   "src": "Drive: Free Childcare Leicester NC (14 Aug 2026)",
   "add": "How it works, per the guide: the parent picks the respite caregiver (18 or older and not living in the home, often someone the child already knows), pays them, sends a monthly timesheet by 9am on the last Monday, and is reimbursed by direct deposit. No work requirement. Apply with a W-9."
  },
  {
   "id": "ywca-womens-empowerment",
   "src": "Drive: Free & Low-Cost Childcare in Leicester & Buncombe County (family guide, checked Aug 2026); Drive: Free Childcare Leicester NC (14 Aug 2026)",
   "add": "Empowerment Child Care, per the family guide checked Aug 2026: up to 12 free hours a week with income verification for parents in transition, in school or looking for work, at most 4 hours a day, Mon-Thu 8am-6pm; ext. 113 or ecc@ywcaofasheville.org; 185 S French Broad Ave. Pay-by-the-hour care is open to anyone, and staff help with case management and links to jobs, housing and school.",
   "note": "Details differ: the August family guide says up to 12 free hours a week at ext. 113; an earlier Drive guide said 12 to 20 hours; this row's client line is ext. 104. Ask which applies."
  },
  {
   "id": "1915-i-services-medicaid-respite-without-wai",
   "src": "Drive: Free Childcare Leicester NC (14 Aug 2026)",
   "add": "For children with severe medical needs or technology dependence, the CAP/C waiver counts only the child's income, not the parents'."
  },
  {
   "id": "caring-for-children-respite-scholarship",
   "src": "Drive: Eckerd Respite Scholarship Application (2026-2027) and Parent Information Guide",
   "add": "2026-27 application: scholarships run July 2026 to June 2027 for Buncombe and Henderson counties, for families of children with emotional, behavioral or medical needs or families facing risk factors. Send the application, a W-9 and the direct-deposit form with a voided check to the director. The money is for the caregiver to get a break: the application says it cannot pay for care during the parent's appointments, surgery or recovery, work, school or errands (that is child care), for camps or after-school programs, or for the parent's own outing costs. The whole amount goes to the respite provider.",
   "note": "Contacts differ: this row has 828-785-1590 and AmyHobson@eckerd.org; the 2026-27 application gives the director's cell as 828-777-5715, fax 828-575-2049, and ahobson@eckerd.org; the August childcare guide gives 828-450-3943 for questions. Email ahobson@eckerd.org first."
  },
  {
   "id": "youth-outright",
   "src": "Drive: LGBTQIA2+ World Wide Resources (shared list, modified 4 Nov 2026), filtered to WNC and broadly applicable crisis lines",
   "h": "Youth Center drop-in Fridays 3-6pm (per the list; confirm)",
   "add": "Drop-in hours at the Youth Center for queer and trans youth 11 to 24, Fridays 3-6pm (per a shared LGBTQIA2+ resource list, Nov 2026; confirm). Mailing address PMB 128, 30 Westgate Pkwy, Asheville."
  },
  {
   "id": "campaign-for-southern-equality",
   "src": "Drive: LGBTQIA2+ World Wide Resources (shared list, modified 4 Nov 2026), filtered to WNC and broadly applicable crisis lines",
   "add": "Its Trans Youth Emergency Project helps parents and guardians of transgender young people under 18 who have lost access to gender-affirming care find new providers and cover travel (southernequality.org/tyep)."
  },
  {
   "id": "eliada-child-development-center",
   "src": "Drive: Free & Low-Cost Childcare in Leicester & Buncombe County (family guide, checked Aug 2026)",
   "a": "2 Compton Dr, Asheville, NC 28806",
   "add": "Per the August childcare guide: 2 Compton Dr, West Asheville (about 15 to 20 minutes from Leicester), info@eliada.org; 5-star, babies through Pre-K; takes vouchers and is also a Head Start and NC Pre-K site."
  },
  {
   "id": "trailblazer-routes-free",
   "src": "Drive: Free & Low-Cost Childcare in Leicester & Buncombe County (family guide, checked Aug 2026)",
   "add": "Enka-Candler route, per the August childcare guide: Highway 19-23 from the Goodwill on Smokey Park Highway to the TA Truck Stop, Mon-Fri about 6:15am-6:10pm; flag it anywhere on the route; connects to ART's W3 at the Goodwill park-and-ride. Wheelchair accessible; children ride with a parent."
  }
 ],
 "resources": [
  {
   "n": "MountainCare adult day services",
   "sec": "RESPITE",
   "needs": [
    "IV:*",
    "IV:6a"
   ],
   "os": "Drive: My Village Respite Care Guide",
   "d": "Nonprofit, state-licensed adult day centers in Buncombe and Henderson counties for older adults with physical or memory decline, including Alzheimer's and other dementias: nurses on site for health checks and medications, a hot lunch, music, crafts and exercise. Mountain Explorers is its day program for adults with intellectual and developmental disabilities. Daytime respite for a parent who is also caring for an older relative or an adult family member with a disability. Formerly Community CarePartners.",
   "a": "First Baptist Church of Asheville campus, 5 Oak St, Asheville",
   "note": "The guide gives no phone or website, and the address is from a 2024 move. Confirm both before referring.",
   "src": "Drive: My Village Respite Care Guide, Asheville & WNC (30 Aug 2026), citing MountainCare's 2024 move notice (agingresourceswnc.com) and Mountain Aging Partners"
  },
  {
   "n": "A-B Tech Phlebotomy Certificate",
   "sec": "V",
   "needs": [
    "V:*",
    "V:4a"
   ],
   "os": "Drive: Phlebotomy Training & Workforce Stipends Guide",
   "d": "About 180 hours of class, lab and a supervised clinical rotation, preparing for national certification (NHA or ASCP). Start with the Introduction to Health Care Careers course; no healthcare experience needed. Needs: 18+, high school diploma or GED, photo ID and signed Social Security card, immunizations, a physician's form, background check and drug screen. The guide puts the total at about $655 (tuition $246, books, scrubs, onboarding $171, exam $145) before shots; STEP, NCWorks (WIOA), FAFSA (A-B Tech school code 004033) and Goodwill's Outreach Scholarship can cover it. Do not buy an onboarding package until the program gives you its site code.",
   "w": "abtech.edu/phlebotomy",
   "src": "Drive: Phlebotomy Training & Workforce Stipends Guide, Buncombe County (30 Aug 2026), citing abtech.edu/phlebotomy"
  },
  {
   "n": "STEP / More Than a Job NC (MTAJ-NC) at A-B Tech",
   "sec": "V",
   "needs": [
    "V:*",
    "V:4a",
    "V:8a"
   ],
   "os": "Drive: Phlebotomy Training & Workforce Stipends Guide",
   "t": "Free",
   "d": "Free training at A-B Tech in in-demand fields, continuing education or curriculum, for Buncombe residents under 60 who get Food and Nutrition Services (SNAP). Covers the course costs and helps with job placement after. A parent approved for SNAP qualifies.",
   "w": "abtech.edu/program-finder/continuing-ed-workforce/mtaj-nc-more-job-nc/mtaj-nc-pathways",
   "src": "Drive: Phlebotomy Training & Workforce Stipends Guide, Buncombe County (30 Aug 2026), citing A-B Tech's MTAJ-NC pages"
  },
  {
   "n": "Finish Line Grants (community college emergency grants)",
   "sec": "V",
   "needs": [
    "V:*",
    "V:4a",
    "VIII:*"
   ],
   "os": "Drive: Phlebotomy Training & Workforce Stipends Guide",
   "d": "Up to $1,000 a semester for a community college student whose unexpected hardship (housing, medical, child care, a car repair) threatens finishing. At A-B Tech: at least halfway through the program, GPA 2.0+, in good standing, 18+, able to work in the US, with a plan for full-time work. Apply through A-B Tech Student Services.",
   "w": "nccommunitycolleges.edu/students/paying-for-college/options-for-paying-for-college/finish-line-grants",
   "src": "Drive: Phlebotomy Training & Workforce Stipends Guide, Buncombe County (30 Aug 2026), citing the NC Community College System's Finish Line Grants page"
  },
  {
   "n": "Trans Lifeline",
   "sec": "CRISIS",
   "needs": [
    "X:*",
    "X:9",
    "VII:*",
    "VII:2a"
   ],
   "os": "Drive: LGBTQIA2+ World Wide Resources",
   "t": "Free, LGBTQ+ affirming",
   "ph": "877-565-8860",
   "w": "translifeline.org",
   "h": "24/7; operators guaranteed 10am-4am Eastern",
   "d": "Peer support hotline run by trans people for trans people: crisis support and connection to resources.",
   "src": "Drive: LGBTQIA2+ World Wide Resources (shared list, modified 4 Nov 2026), filtered to WNC and broadly applicable crisis lines"
  },
  {
   "n": "LGBT National Help Center",
   "sec": "CRISIS",
   "needs": [
    "X:*",
    "X:9",
    "VII:*",
    "VII:2a"
   ],
   "os": "Drive: LGBTQIA2+ World Wide Resources",
   "t": "Free, LGBTQ+ affirming",
   "ph": "888-843-4564 / youth 800-246-7743 / seniors 888-234-7243",
   "w": "glbtnationalhelpcenter.org",
   "h": "Online peer chat Mon-Fri 4pm-midnight, Sat noon-5pm (Eastern)",
   "d": "National hotline for all ages, a youth talkline, a senior hotline, and online peer-support chat.",
   "src": "Drive: LGBTQIA2+ World Wide Resources (shared list, modified 4 Nov 2026), filtered to WNC and broadly applicable crisis lines"
  },
  {
   "n": "National Runaway Safeline",
   "sec": "CRISIS",
   "needs": [
    "VII:*",
    "VII:7a",
    "VIII:*",
    "VIII:6a"
   ],
   "os": "Drive: LGBTQIA2+ World Wide Resources",
   "t": "Free",
   "ph": "800-786-2929",
   "w": "1800runaway.org",
   "d": "For young people who have run away or are thinking about it, and their families: advice, help finding shelter, transportation and counseling, and help returning home, with staff who will advocate and mediate.",
   "src": "Drive: LGBTQIA2+ World Wide Resources (shared list, modified 4 Nov 2026), filtered to WNC and broadly applicable crisis lines"
  },
  {
   "n": "Biltmore Avenue Family Dentistry",
   "sec": "VI",
   "needs": [
    "VI:*",
    "III:*",
    "III:3a"
   ],
   "os": "Drive: McDowell County Community Resource Guide 2026",
   "ph": "828-216-9531",
   "a": "1 Hospital Dr, Suite 200, Asheville, NC 28801",
   "w": "bafdentistry.com",
   "d": "Private family dental practice near Mission Hospital.",
   "note": "Do not count on it for adult Medicaid: the Drive Medicaid dental guide (Aug 2026) says it is turning away new adult Medicaid patients because of space and staffing, and offering existing patients more out-of-pocket work. Call before sending anyone; for adults try AMH Dental's first-Monday booking or MAHEC's first-Friday line instead.",
   "src": "Drive: McDowell County Community Resource Guide 2026 (shared, modified 5 Oct 2026) for contact details; Drive: Medicaid Dental Providers Guide, Buncombe County (30 Aug 2026) for its Medicaid status"
  },
  {
   "n": "Irene Wortham Early Learning Center",
   "sec": "I",
   "needs": [
    "I:*",
    "I:7a",
    "IX:*"
   ],
   "os": "Drive: Free & Low-Cost Childcare in Leicester & Buncombe County",
   "ph": "828-274-7518",
   "a": "916 W Chapel Rd, Asheville",
   "d": "5-star inclusive early learning center where children with and without disabilities learn together: small classes, low ratios, therapists on site, ages 6 weeks through Pre-K. Takes child care vouchers. A good fit for a child with developmental needs.",
   "src": "Drive: Free & Low-Cost Childcare in Leicester & Buncombe County (family guide, checked Aug 2026)"
  }
 ],
 "events": [
  {
   "date": "2026-07-01",
   "end": "2027-06-30",
   "kind": "signup",
   "what": "Eckerd respite scholarship: 2026-27 applications open",
   "where": "Buncombe and Henderson counties",
   "detail": "Monthly reimbursement for a respite caregiver the parent picks, for families of children with emotional, behavioral or medical needs or facing risk factors. Apply to the program director with a W-9 and direct-deposit form.",
   "note": "The application prints no deadline; it covers July 2026 to June 2027.",
   "ph": "828-777-5715",
   "w": "eckerd.org",
   "rid": "caring-for-children-respite-scholarship",
   "src": "Drive: Eckerd Respite Scholarship Application (2026-2027) and Parent Information Guide (30 Aug 2026)"
  },
  {
   "date": "2026-11-07",
   "end": "2026-11-08",
   "time": "10am-5pm",
   "kind": "event",
   "what": "Weaverville Art Safari studio tour (fall)",
   "where": "Studios across Weaverville and north Buncombe; map at weavervilleartsafari.com",
   "detail": "Self-guided tour of about 85 artists in 36 working studios: painters, potters, glass, sculpture.",
   "tags": [
    "Free admission"
   ],
   "w": "weavervilleartsafari.com",
   "note": "The Drive weekend guide gave 11am; the organizer's listings say 10am.",
   "src": "Drive: WNC Weekend Family Events Explorer (5 Nov 2026), checked by web search 7 Nov 2026 against the Laurel of Asheville, Asheville.com and Arts AVL listings"
  },
  {
   "date": "2026-11-07",
   "time": "9am-2pm",
   "kind": "event",
   "what": "SONshine Crafters craft show",
   "where": "Skyland First Baptist Church, 2115 Hendersonville Rd, Arden (Skyland)",
   "detail": "Holiday and fall craft show: handmade items, decor, baked goods, hot dogs and hamburgers for sale.",
   "tags": [
    "Free admission"
   ],
   "w": "skylandbaptist.org/SONShineCrafters",
   "note": "The Drive weekend guide gave a wrong address (1050 Old Hendersonville Rd). The church lists 2115 Hendersonville Rd; its 2025 flyer used the Family Life Center at 2119.",
   "src": "Drive: WNC Weekend Family Events Explorer (5 Nov 2026), checked by web search 7 Nov 2026 against the church's SONshine Crafters page and Explore Asheville's weekend listings"
  },
  {
   "date": "2026-11-07",
   "time": "10am-3pm",
   "kind": "event",
   "what": "LoCol Market (first Saturday)",
   "where": "The Local Collective, 52 S Main St, Weaverville",
   "detail": "Monthly market of local makers, artists and vintage sellers, with live music.",
   "tags": [
    "Free admission"
   ],
   "w": "thelocalc.com",
   "note": "The Drive weekend guide put it in Black Mountain; the organizer and Mountain Xpress list Weaverville. It runs the first Saturday of each month.",
   "src": "Drive: WNC Weekend Family Events Explorer (5 Nov 2026), checked by web search 7 Nov 2026 against The Local Collective's site, Mountain Xpress and Explore Asheville"
  },
  {
   "date": "2026-11-08",
   "time": "2:30-5pm",
   "kind": "event",
   "what": "Montford Plein Air painting festival: wet paint sale",
   "where": "Behind the Asheville Chamber Visitor Center, 36 Montford Ave, Asheville",
   "detail": "Free outdoor show and sale of paintings made over the festival weekend, with live music and a food truck.",
   "tags": [
    "Free admission"
   ],
   "w": "montfordarts.com",
   "note": "Weather can move it to a rain date; check the festival site. The Drive weekend guide gave a different venue and website.",
   "src": "Drive: WNC Weekend Family Events Explorer (5 Nov 2026), checked by web search 7 Nov 2026 against Asheville.com's festival notice and the festival FAQ (montfordarts.com)"
  }
 ]
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
