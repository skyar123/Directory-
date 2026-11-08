/*
 * Ask AI's search-first step. Reading all 622 resources is most of what
 * Gemini is asked to do for each question, and most of them have nothing to
 * do with a given family. So the function indexes the directory once, when
 * it starts, and each question sends Gemini only the closest matches. A
 * resource comes up for:
 *  - words it shares with the question: a hit in the name counts most, then
 *    the tags, then the detail and address, and a rare word counts for more
 *    than a common one;
 *  - the SNIFF questions the text raises, in their own wording or in the
 *    everyday words NEED_WORDS lists for them;
 *  - Spanish, when the text asks for it: a lift inside each need, not a
 *    need of its own, or the hundred Spanish-capable programs would crowd
 *    out the housing help a Spanish-speaking family asked for.
 * Each need the text raises gets its fair share of the list, so a family
 * with five needs is not read only for the one with the most programs.
 * The call-first lines and the crisis lines are on every shortlist. When
 * the search finds too little to go on, Gemini reads everything, as before. Nothing here calls out: it runs in the function, on the deployed
 * data.
 */

export const SHORTLIST = 120; // resources Gemini reads at most
export const SHORTLIST_MIN = 30; // fewer matches than this and it reads all of them
/* on every shortlist whatever was asked, so there is always a good first
   call to offer, and a crisis line when a family may not be safe */
export const ALWAYS_KEYS = ["X:1", "CRISIS:*"];

import { norm, SELF_HARM, UNSAFE, CRISIS } from "./urgent.js";

export { norm };

const SUFFIXES = ["ies", "ing", "ed", "es", "s", "y"];
/* a crude stem, the same on both sides, so "diapers" finds "diaper" and
   "clothes" finds "clothing" */
export function stem(w) {
  for (const x of SUFFIXES) if (w.endsWith(x) && w.length - x.length >= 4) return w.slice(0, -x.length);
  return w;
}

/* words that say nothing about which resource fits */
const STOP = new Set(`a an and any are as at be been but by can could did do does doing for from get gets got had has
have her hers him his how i im in into is it its just like looking me my need needed needing needs of off on or our
out she so some than that the their them then there they this those to too up us very was we were what when where
which who whom why will with would you your yours about also want wants wanted help helps helping please thanks
family families mom moms mother mothers dad dads father fathers parent parents child children kid kids son sons
daughter daughters caregiver caregivers person people someone year years old month months week weeks day days
today tomorrow now currently right away asap still really lot lots much many one two three four five six seven
eight nine ten thing things stuff kind sort maybe said says say tell told know knows going went come came make
made take took give gave keep try trying able unable doesn don didn isn wasn won wouldn couldn shouldn aren
cannot`.split(/\s+/));

/* words in the SNIFF labels that are on too many of them to point at one */
const LABEL_STOP = new Set(`program programs service services support treatment evaluation assessment class
classes medical specialist someone else other outside provider regular community centre center group home based
feel better added plan already pays more section like help understand problem child children family families
black keep keeping going says source site staff ask call free listed most first start before label route
everyday life moving places time limited watch deadlines year after new own getting finding`
  .split(/\s+/).map((w) => stem(w)));

/* Towns say where a family is, not what it needs, so they count only
   against where a program is: "Black Mountain" finds programs there, not
   "Black families" or an arts center with the town in its name. */
export const PLACES = ["black mountain", "swannanoa", "candler", "leicester", "weaverville", "woodfin", "fairview",
  "arden", "fletcher", "enka", "west asheville", "east asheville", "north asheville", "south asheville", "montford",
  "oakley", "haw creek", "barnardsville", "alexander", "marshall", "mars hill", "hot springs", "hendersonville",
  "waynesville", "canton", "clyde", "brevard", "marion", "old fort", "burnsville", "spruce pine", "sylva",
  "mills river", "etowah"];

/* when these come up, the safety options go to the top of the list, the
   crisis lines (988 and the like) highest */
export const URGENT = { "CRISIS:*": 16, "VII:7a": 10, "VIII:8a": 10 };
export const URGENT_KEYS = Object.keys(URGENT);

const words = (text) => norm(text).split(" ").filter((w) => w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w));
const stems = (text) => [...new Set(words(text).map(stem))];

/* Everyday words for SNIFF questions, so "behind on rent" reaches the
   housing programs even where their write-up never says "behind". Each
   regex runs on the normalized text. */
export const NEED_WORDS = [
  [/\b(rent|evict\w*|landlords?|housing|apartments?|deposits?|section 8|homeless\w*|couch surf\w*|motel|place to live)\b/, ["VIII:6a", "VIII:7a"]],
  [/\bshelters?\b/, ["VIII:7a", "VIII:8a"]],
  [/\b(electric\w*|power bill|utilit\w*|heat|heating|gas bill|water bill|lights? (cut|off|shut)|propane|firewood|duke energy)\b/, ["VIII:14a"]],
  [/\b(food|grocer\w*|hungry|pantr\w*|meals?|snap|food stamps?|ebt)\b/, ["VIII:5a", "VIII:3a"]],
  [/\b(wic|formula|breast ?feed\w*|lactation|baby food)\b/, ["VIII:4a", "III:4a"]],
  [/\b(diapers?|wipes|pull ?ups)\b/, ["VIII:4a", "VIII:11a"]],
  [/\b(clothes|clothing|coats?|jackets?|shoes|boots|uniforms?)\b/, ["VIII:12a"]],
  [/\b(car seats?|cribs?|strollers?|pack n play|high chairs?|baby gear|bassinets?)\b/, ["VIII:11a"]],
  [/\b(furniture|beds?|mattress\w*|appliances?|household|dishes)\b/, ["VIII:13a"]],
  [/\b(toys?|books?|christmas|holiday gifts?|presents|santa)\b/, ["VIII:10a", "X:12"]],
  [/\b(cars?|rides?|transport\w*|bus|gas money|gas card|car repairs?)\b/, ["VIII:17a"]],
  [/\b(cash|tanf|work first|money|bills?|taxes|tax return|benefits)\b/, ["VIII:1a", "X:4"]],
  [/\b(ssi|disabilit\w*)\b/, ["VIII:2a", "X:7"]],
  [/\b(child ?care|day ?care|preschool|pre k|head start|babysit\w*)\b/, ["I:7a", "VIII:9a"]],
  [/\b(immigra\w*|undocumented|citizenship|green card|daca|asylum|refugees?|newcomers?|visas?)\b/, ["VIII:15a", "V:6a", "X:10"]],
  [/\b(lawyers?|legal|custody|court|divorce|child support|attorneys?)\b/, ["VIII:16a", "X:3"]],
  [/\b(interpret\w*|translat\w*)\b/, ["VIII:18a", "ESPANOL:interprete-disponible-"]],
  [/\b(pregnan\w*|prenatal|newborns?|postpartum|birth|doulas?|midwi\w*|infants?|nursing)\b/, ["X:2", "VI:3a"]],
  [UNSAFE, ["VII:7a", "VIII:8a"]],
  [/\b(therap\w*|counsel\w*|mental health|depress\w*|anxi\w*|stress\w*|trauma\w*|grief|grieving)\b/, ["VII:2a", "VII:1a", "II:7a", "II:6a"]],
  [/\b(substance|addict\w*|recovery|sober\w*|opioids?|alcohol\w*|drinking|drugs?|narcan|meth)\b/, ["VII:6a"]],
  [/\b(behavio\w*|tantrums?|aggressi\w*|biting|hitting|melt ?downs?)\b/, ["II:1a", "II:2a", "II:6a"]],
  [/\b(parenting|parent groups?|parent class\w*|co ?parent\w*)\b/, ["IV:4a", "II:5a", "IV:3a"]],
  [/\b(respite|a break|overnight care)\b/, ["IV:6a", "IX:8a", "RESPITE:*"]],
  [/\b(autis\w*|asd|sensory)\b/, ["IX:1a", "IX:2a", "IX:5a", "IX:7a"]],
  [/\b(speech|talking|delays?|delayed|early intervention|cdsa|milestones?|developmental|occupational therapy)\b/, ["I:1a", "I:2a", "IX:4a"]],
  [/\b(dentists?|dental|teeth|tooth)\b/, ["III:3a"]],
  [/\b(doctors?|pediatrician|clinic|sick|medical|health care|well child)\b/, ["III:1a", "VI:1a"]],
  [/\b(insurance|medicaid|health choice|uninsured)\b/, ["III:5a", "VI:4a"]],
  [/\b(ged|high school|diploma)\b/, ["V:1a"]],
  [/\b(esl|english class\w*|learn english)\b/, ["V:2a"]],
  [/\b(jobs?|work|employ\w*|resume|hiring)\b/, ["V:8a", "V:4a"]],
  [/\b(phones?|internet|wifi|wi fi|laptops?|computers?|tablets?)\b/, ["X:5", "V:3a"]],
  [/\b(deaf|hard of hearing|asl|sign language)\b/, ["X:6", "IX:10a"]],
  [/\b(black famil\w*|african american)\b/, ["X:8"]],
  [/\b(lgbt\w*|queer|transgender|trans|gay|lesbian|nonbinary)\b/, ["X:9"]],
  [/\b(play ?groups?|playdates?|story ?times?|things to do|outings?|museums?|parks?|activities|weekend)\b/, ["I:8a", "X:11", "I:11a"]],
  [/\b(camps?|summer|after ?school)\b/, ["I:10a", "I:11a"]],
  [/\b(foster\w*|kinship|grandparents?|grandmother|grandma|grandfather|grandpa|adopt\w*|relative caregivers?)\b/, ["IV:5a", "RESPITE:*"]],
  [/\b(where to start|don ?t know where|211|referrals?)\b/, ["X:1", "IV:1a"]],
  [SELF_HARM, ["CRISIS:*", "VII:1a", "VII:2a"]],
  [CRISIS, ["CRISIS:*"]],
];

/* SNIFF keys typed out, as in a pasted SNIFF: "VIII:12a" */
const KEY_RE = /\b(I|II|III|IV|V|VI|VII|VIII|IX|X):(\d+a?)\b/g;

/* the first index entry at or after w, in a sorted list */
const lowerBound = (list, w) => {
  let lo = 0, hi = list.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (list[mid] < w) lo = mid + 1; else hi = mid; }
  return lo;
};
/* every indexed word a query stem stands for: itself and a plural for a
   short stem; for a long one, every word it begins ("therap" finds
   "therapist") and every word of five letters or more that begins it
   ("service" finds "servic", the stem of "services") */
const expand = (vocab, t) => {
  if (t.length < 5) return [t, t + "s"].filter((w) => vocab.has(w));
  const out = [];
  for (let i = lowerBound(vocab.sorted, t); i < vocab.sorted.length && vocab.sorted[i].startsWith(t); i++) out.push(vocab.sorted[i]);
  for (let L = 5; L < t.length; L++) if (vocab.has(t.slice(0, L))) out.push(t.slice(0, L));
  return out;
};
const makeVocab = (map) => Object.assign(map, { sorted: [...map.keys()].sort() });

/* resources: the shape the function gives buildPrompt, plus address and
   origSection; needs: sniff.json's list */
export function buildIndex(resources, needs) {
  /* word -> Map(resource index -> weight of the fields it is in) */
  const FIELDS = [["name", 3], ["tags", 2], ["detail", 1], ["origSection", 1], ["address", 1]];
  const posting = new Map();
  resources.forEach((r, i) => {
    const w = new Map();
    for (const [f, weight] of FIELDS) for (const s of stems(r[f])) w.set(s, (w.get(s) || 0) + weight);
    for (const [s, weight] of w) {
      if (!posting.has(s)) posting.set(s, new Map());
      posting.get(s).set(i, weight);
    }
  });
  const vocab = makeVocab(posting);
  const keysOf = resources.map((r) => new Set(r.needs));
  const spanish = resources.map((r) => /^[🟢🟡🟠]/u.test(r.spanish || ""));

  /* A SNIFF question is raised by a distinctive word of its label (one on
     only one or two labels), or by all of its label's words together, which
     is how "Medical specialist for my child" is told apart. */
  const known = new Set(needs.map((n) => n.key));
  const asked = needs.filter((n) => /^(I|II|III|IV|V|VI|VII|VIII|IX|X):/.test(n.key) && !/medicaid plan/i.test(n.label));
  const labels = asked.map((n) => ({ key: n.key, terms: stems(n.label).filter((t) => !LABEL_STOP.has(t)) }));
  const phrases = asked.map((n) => ({ key: n.key, terms: stems(n.label) })).filter((l) => l.terms.length);
  const ldf = new Map();
  for (const l of labels) for (const t of l.terms) ldf.set(t, (ldf.get(t) || 0) + 1);
  const labelWords = makeVocab(new Map());
  for (const l of labels) for (const t of l.terms) if (ldf.get(t) <= 2) {
    if (!labelWords.has(t)) labelWords.set(t, []);
    labelWords.get(t).push(l.key);
  }
  labelWords.sorted = [...labelWords.keys()].sort();

  const N = resources.length;
  const always = resources.map((r, i) => i).filter((i) => ALWAYS_KEYS.some((k) => keysOf[i].has(k)));
  const where = resources.map((r) => " " + norm(r.address + " " + r.detail) + " ");
  return function search(text) {
    const flat = " " + norm(text) + " ";
    const places = PLACES.filter((p) => flat.includes(" " + p + " "));
    const placeWords = new Set(places.flatMap((p) => p.split(" ").map(stem)));
    const q = stems(text).filter((t) => !placeWords.has(t)).slice(0, 400);

    /* the SNIFF questions the text raises */
    const spotted = new Set();
    for (const m of String(text).matchAll(KEY_RE)) if (known.has(`${m[1]}:${m[2]}`)) spotted.add(`${m[1]}:${m[2]}`);
    for (const [re, keys] of NEED_WORDS) if (re.test(flat)) keys.forEach((k) => spotted.add(k));
    for (const t of q) for (const w of expand(labelWords, t)) labelWords.get(w).forEach((k) => spotted.add(k));
    const qVocab = makeVocab(new Map(q.map((t) => [t, true])));
    for (const l of phrases) if (l.terms.every((t) => expand(qVocab, t).length)) spotted.add(l.key);

    const score = new Float64Array(N);
    for (const t of q) {
      const hits = new Map();
      for (const w of expand(vocab, t)) for (const [i, weight] of posting.get(w)) hits.set(i, Math.max(hits.get(i) || 0, weight));
      /* a word in four resources in ten tells nothing apart */
      if (!hits.size || hits.size > N * 0.4) continue;
      const idf = Math.log((N + 1) / hits.size);
      for (const [i, weight] of hits) score[i] += idf * weight;
    }
    const wantsSpanish = /\b(spanish|espanol|latin[oax]s?|hispanic)\b/.test(flat);
    const urgent = URGENT_KEYS.filter((k) => spotted.has(k));
    for (let i = 0; i < N; i++) {
      let k = 0;
      for (const key of spotted) if (keysOf[i].has(key)) k++;
      score[i] += 6 * Math.min(k, 2);
      score[i] += Math.max(0, ...urgent.map((key) => (keysOf[i].has(key) ? URGENT[key] : 0)));
      if (wantsSpanish && spanish[i]) score[i] += 5;
      if (places.some((p) => where[i].includes(" " + p + " "))) score[i] += 4;
    }

    const ranked = [...score.keys()].filter((i) => score[i] > 0).sort((a, b) => score[b] - score[a] || a - b);
    /* nothing understood: no SNIFF need and hardly a word in common */
    if (!spotted.size && ranked.length < SHORTLIST_MIN) return { resources, shortlisted: false, needs: [] };
    /* each need's best first, a turn each, for up to three quarters of the
       list; then the best of what is left, whatever it matched */
    const chosen = new Set();
    const perNeed = [...spotted].map((k) => ranked.filter((i) => keysOf[i].has(k))).filter((l) => l.length);
    const fair = Math.floor(SHORTLIST * 0.75);
    for (let turn = 0; chosen.size < fair && perNeed.some((l) => l.length > turn); turn++) {
      for (const l of perNeed) if (turn < l.length && chosen.size < fair) chosen.add(l[turn]);
    }
    for (const i of ranked) { if (chosen.size >= SHORTLIST) break; chosen.add(i); }
    const top = [...chosen].sort((a, b) => score[b] - score[a] || a - b);
    const list = top.concat(always.filter((i) => !chosen.has(i)));
    return { resources: list.map((i) => resources[i]), shortlisted: true, needs: [...spotted] };
  };
}
