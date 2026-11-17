/*
 * Backup routes, 2026-11-17: a new optional field, `alt`, shown on a card as
 * "If this doesn't work". It names the next place to try when a route is full,
 * closed, or not a fit.
 *
 * Most routes follow the "backup" field of the OK Computer Buncombe Family
 * Navigator build Skylar shared on 17 Nov 2026; the phone numbers are this
 * directory's own. The Salvation Army and holiday routes follow Skylar's
 * referral stance (13 to 16 Nov 2026): other options come first.
 * Every route is written so it can go to a family as it stands. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const path = new URL("../data/resources.json", import.meta.url);
const file = JSON.parse(readFileSync(path, "utf8"));
const OKC = "backup route adapted from the OK Computer navigator build (shared 17 Nov 2026), phones from this directory";
const SB = "backup route from Skylar Belt's referral stance, Nov 2026";

const ROUTES = {
  "abccm-crisis-ministries": ["For food: MANNA's food helpline, 828-290-9749. For a money crisis: Buncombe DSS emergency assistance (828-250-6330) or Eblen Charities (828-255-3066).", OKC],
  "art-asheville-rides-transit": ["Mountain Mobility, 828-250-6750 (option 5 to ask about eligibility).", OKC],
  "mountain-mobility": ["ART buses, 828-253-5691. Ask a current case manager about other transport help.", OKC],
  "working-wheels": ["ART or Mountain Mobility while a case manager looks for an eligible partner route. Working Wheels cannot connect families to a partner.", OKC],
  "babies-need-bottoms": ["Ask any agency the family already uses whether it hands out diapers, or call 211.", OKC],
  "bounty-soul": ["MANNA's food helpline, 828-290-9749, finds the nearest pantry or market.", OKC],
  "manna-food-helpline": ["Outside helpline hours, call or text 211 (or 1-888-892-1162).", OKC],
  "manna-food-helpline-2": ["Outside helpline hours, call or text 211 (or 1-888-892-1162).", OKC],
  "buncombe-dss-emergency-assistance": ["If there is an eviction or court date, also call Pisgah Legal Services, 828-253-0406. ABCCM Crisis Ministry (828-259-5300) and Eblen Charities (828-255-3066) are other routes.", OKC],
  "crisis-intervention-program-cip": ["Eblen Charities (828-255-3066) or ABCCM Crisis Ministry (828-259-5300); 211 knows other utility help.", OKC],
  "crisis-intervention-program-cip-2": ["Eblen Charities (828-255-3066) or ABCCM Crisis Ministry (828-259-5300); 211 knows other utility help.", OKC],
  "eblen-charities": ["ABCCM Crisis Ministry (828-259-5300) or Buncombe DSS emergency assistance (828-250-6330).", OKC],
  "child-care-subsidy-program": ["Mountain Child Care Connections, 877-752-5955, helps find care; also ask about Head Start and NC Pre-K. Apply for the subsidy even if there is a waiting list.", OKC],
  "mountain-child-care-connections": ["For help paying: the Child Care Subsidy Program, 828-250-5500. For ages 3 to 5: the shared Head Start and NC Pre-K application.", OKC],
  "verner-center-for-early-learning": ["Mountain Child Care Connections, 877-752-5955, or Buncombe Pre-K for older children.", OKC],
  "cdsa": ["For children 3 and older, the school system's Exceptional Children program.", OKC],
  "kaleidoscope-play-learn": ["Library story times (see the library rows) are free and many need no sign-up.", OKC],
  "code-purple": ["Call 211, or Homeward Bound's AHOPE Day Center, 828-252-8883.", OKC],
  "ahope-day-center-homeward-bound": ["Call 211 for other shelter routes; on Code Purple nights, use the Code Purple sites.", OKC],
  "helpmate": ["In danger now: 911. Sexual violence or trafficking: Our VOICE, 828-255-7576.", OKC],
  "our-voice": ["In danger now: 911. Partner violence, shelter and safety planning: Helpmate, 828-254-0516.", OKC],
  "nc-211": ["In danger now: 911. Suicide or mental health crisis: call or text 988.", OKC],
  "988-suicide-crisis-lifeline": ["In danger now: 911. Mobile crisis can come to the family: RHA, 1-888-573-1006.", OKC],
  "pisgah-legal-services": ["Never ignore eviction or court papers. While waiting for a callback, call 211 for urgent needs.", OKC],
  "harm-reduction-wncap-the-steady-collective-h": ["Buncombe County's syringe services at 40 Coxe Ave.", OKC],
  "wncap": ["The Steady Collective's outreach sites (see the harm reduction row).", OKC],
  "salvation-army-asheville": ["Other free food: MANNA's food helpline (828-290-9749), Bounty & Soul markets, or Food Connection meals.", SB],
  "salvation-army-rent-assistance": ["Other help with rent or bills: Buncombe DSS emergency assistance (828-250-6330), Eblen Charities (828-255-3066) or ABCCM Crisis Ministry (828-259-5300).", SB],
  "salvation-army-shelter": ["Call 211, AHOPE (828-252-8883), or Code Purple on cold nights.", SB],
  "eblen-saint-nicholas-project-christmas": ["ABCCM Christmas Angel, a WNC Toys for Tots partner program, or the Asheville Dream Center toy giveaway on December 12.", SB],
  "abccm-christmas-angel": ["Eblen's Saint Nicholas Project (sign-up open now) or a WNC Toys for Tots partner program.", SB],
};

let n = 0;
for (const [id, [text, src]] of Object.entries(ROUTES)) {
  const r = file.resources.find((x) => x.id === id);
  if (!r) throw new Error(`no resource ${id}`);
  if (r.alt) throw new Error(`${id} already has a backup`);
  if (DASH.test(text)) throw new Error(`dash in ${id}`);
  r.alt = text;
  r.src = `${r.src.trim()}; ${src}`;
  n++;
}
file.meta.sources.push("Backup routes, 17 Nov 2026 (see scripts/apply-backup-routes-2026-11-17.mjs)");
file.meta.note = (file.meta.note || "") + " `alt` is an optional backup route, shown as \"If this doesn't work\".";
writeFileSync(path, JSON.stringify(file, null, 1) + "\n");

/* changelog */
const clPath = new URL("../data/changelog.json", import.meta.url);
const cl = JSON.parse(readFileSync(clPath, "utf8"));
const entry = {
  date: "Nov 17 2026",
  what: "Visit plan, need-first Find tab, and backup routes",
  detail: "Find now opens on the crisis lines and a list of needs, each going straight to its list. "
    + `${n} rows gained an "If this doesn't work" backup route, shown on the card and in anything copied for a family. `
    + "A new Visit plan tab gathers resources and dates for one family, with questions to ask before going, "
    + "to copy or print; it stays in this browser and takes no names.",
  source: "scripts/apply-backup-routes-2026-11-17.mjs",
};
if (DASH.test(JSON.stringify(entry))) throw new Error("dash in changelog entry");
cl.groups.find((g) => g.id === "added").entries.unshift(entry);
writeFileSync(clPath, JSON.stringify(cl, null, 1) + "\n");
console.log(`added ${n} backup routes`);
