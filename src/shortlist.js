/*
 * Ask AI's search-first step. Reading the whole directory is most of what
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
 * The call-first lines and the crisis lines are on every shortlist. Rows
 * the team does not refer to first (the Salvation Army) rank lower, so they
 * come after other options instead of near the top.
 *
 * When the text names no need and matches little:
 *  - a short message with no match at all ("hi", "ok thanks") gets only the
 *    call-first and crisis lines, and Gemini asks what would help, instead
 *    of reading the whole directory (about 38,000 tokens at 745 resources);
 *  - a few rare-word matches ("crib") go with those lines;
 *  - only a long text with no match at all still reads everything.
 * Nothing here calls out: it runs in the function, on the deployed data.
 */

import { NOT_FIRST } from "./ai.js";

export const SHORTLIST = 120; // resources Gemini reads at most
export const SHORTLIST_MIN = 30; // fewer matches than this, with no need named, is "little to go on"
export const VAGUE_WORDS = 8; // a text with this many words or fewer and no match is treated as vague
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
/* the words of a search worth matching, as stems: filler words ("for",
   "kids", "help") dropped, so "free events for kids" looks for "free" and
   "event". The Events tab uses this with norm. */
export const queryStems = (text) => stems(text);

/* Everyday words for SNIFF questions, so "behind on rent" reaches the
   housing programs even where their write-up never says "behind". Each
   regex runs on the normalized text. */
/* a search about fathers, not one that mentions a dad in passing */
const FATHERS = /^\s*(fathers?|dads?|daddy)(\s+(groups?|programs?|support|class\w*))?\s*$|\b(fatherhood|father engagement|(dads?|fathers?) groups?|for (dads|fathers)|single (dads?|fathers?))\b/;
export const NEED_WORDS = [
  [/\b(rent|evict\w*|landlords?|housing|apartments?|deposits?|section 8|homeless\w*|couch surf\w*|motel|place to live)\b/, ["VIII:6a", "VIII:7a"]],
  [/\bshelters?\b/, ["VIII:7a", "VIII:8a"]],
  [/\b(electric\w*|power bill|utilit\w*|heat|heating|gas bill|water bill|lights? (cut|off|shut)|propane|firewood|duke energy)\b/, ["VIII:14a"]],
  [/\b((?<!\b(?:pet|dog|cat) )food(?! stamps?| benefits)|grocer\w*|hungry|pantr\w*|meals?|fridges?|lunch|dinner|breakfast|produce|vegetables?|veggies?|fruits?|(farmers?|share|mobile|food|produce) markets?|thanksgiving|turkeys?)\b/, ["VIII:5a"]],
  [/\b(snap|food stamps?|ebt|food benefits)\b/, ["VIII:3a"]],
  [/\b(wic|formula|breast ?feed\w*|lactation|baby food)\b/, ["VIII:4a", "III:4a"]],
  [/\b(diapers?|wipes|pull ?ups)\b/, ["VIII:4a", "VIII:11a"]],
  [/\b(clothes|clothing|coats?|jackets?|shoes|boots|uniforms?)\b/, ["VIII:12a"]],
  [/\b(car seats?|cribs?|strollers?|pack n play|high chairs?|baby gear|bassinets?)\b/, ["VIII:11a"]],
  [/\b(furniture|beds?|mattress\w*|appliances?|household|dishes)\b/, ["VIII:13a"]],
  [/\b(toys?|books?|christmas|holiday gifts?|presents|santa)\b/, ["VIII:10a", "X:12"]],
  [/\b(cars?(?! seats?)|rides?|transport\w*|bus|gas money|gas card|car repairs?)\b/, ["VIII:17a"]],
  [/\b(cash|tanf|work first|money|bills?|taxes|tax return|benefits)\b/, ["VIII:1a", "X:4"]],
  [/\b(ssi|disabilit\w*)\b/, ["VIII:2a", "X:7"]],
  [/\b(child ?care|day ?care|preschool|pre k|head start|babysit\w*)\b/, ["I:7a", "VIII:9a"]],
  [/\b(immigra\w*|undocumented|citizenship|green card|daca|asylum|refugees?|newcomers?|visas?)\b/, ["VIII:15a", "V:6a", "X:10"]],
  [/\b(lawyers?|legal|custody|court|divorce|child support|attorneys?)\b/, ["VIII:16a", "X:3"]],
  [/\b(interpret\w*|translat\w*)\b/, ["VIII:18a", "ESPANOL:interprete-disponible-"]],
  [/\b(pregnan\w*|prenatal|newborns?|postpartum|birth(?! certificates?)|doulas?|midwi\w*|infants?|nursing)\b/, ["X:2", "VI:3a"]],
  [/\bsafe sleep\b/, ["VIII:11a"]],
  [FATHERS, ["IV:4a", "II:5a"]],
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
  /* the same needs in everyday Spanish (accents are already gone after norm) */
  [/\b(comidas?|despensas?|alimentos?|hambre|almuerzos?|cenas?|desayunos?|mercadito|mercados?|verduras|frutas)\b/, ["VIII:5a"]],
  [/\b(cupones de alimentos|estampillas)\b/, ["VIII:3a"]],
  [/\b(renta|alquiler|desalojo\w*|vivienda|apartamentos?|sin hogar)\b/, ["VIII:6a", "VIII:7a"]],
  [/\b(refugios?|albergues?)\b/, ["VIII:7a", "VIII:8a"]],
  [/\b(luz|electricidad|calefaccion|recibo de luz|lena)\b/, ["VIII:14a"]],
  [/\b(panales|toallitas)\b/, ["VIII:4a", "VIII:11a"]],
  [/\b(leche de formula|lactancia|amamantar)\b/, ["VIII:4a", "III:4a"]],
  [/\b(ropa|abrigos?|chaquetas?|zapatos|botas)\b/, ["VIII:12a"]],
  [/\b(asientos? de carro|cunas?|carriolas?|cochecitos?)\b/, ["VIII:11a"]],
  [/\b(muebles|camas?|colchon\w*)\b/, ["VIII:13a"]],
  [/\b(juguetes|navidad|regalos)\b/, ["VIII:10a", "X:12"]],
  [/\b(transporte|autobus|carro|viaje a la cita)\b/, ["VIII:17a"]],
  [/\b(guarderia|cuidado de ninos|preescolar|kinder)\b/, ["I:7a", "VIII:9a"]],
  [/\b(inmigracion|inmigrantes?|indocumentad\w*|ciudadania|asilo|papeles)\b/, ["VIII:15a", "V:6a", "X:10"]],
  [/\b(abogad\w*|custodia|corte|divorcio)\b/, ["VIII:16a", "X:3"]],
  [/\b(embarazad\w*|embarazo|parto|recien nacid\w*|bebes?)\b/, ["X:2", "VI:3a"]],
  [/\b(consejeri\w*|terapia|salud mental|ansiedad|depresion|estres)\b/, ["VII:2a", "VII:1a", "II:7a"]],
  [/\b(dentista|dientes|dental)\b/, ["III:3a"]],
  [/\b(medicos?|clinicas?|pediatra|enferm\w*|salud)\b/, ["III:1a", "VI:1a"]],
  [/\b(seguro medico|aseguranza)\b/, ["III:5a", "VI:4a"]],
  [/\b(trabajos?|empleos?)\b/, ["V:8a", "V:4a"]],
  [/\b(clases? de ingles|aprender ingles)\b/, ["V:2a"]],
];

/* phrases whose first word, alone, would point at another need */
const PHRASE_HEADS = [
  [/\bfood (stamps?|benefits)\b/, "food"],
  [/\b(pet|dog|cat) food\b/, "food"],
  [/\bcar seats?\b/, "car"],
  [/\bhigh chairs?\b/, "high"],
  [/\bchild support\b/, "support"],
  [/\bbirth certificates?\b/, "birth"],
  [/\bsafe sleep\b/, "safe"],
];

/* Everyday words for things no SNIFF question covers, and the words the
   directory itself uses for them, so "tampons" finds the period pantries
   and "roof" the home repair programs. The added words count like typed
   ones. "Dad" and "mom" are filler in most searches ("food for my kids'
   dad"), so they count only in a search about fathers or mothers. */
const SAME_AS = [
  [/\b(produce|vegetables?|veggies?|fruits?|farmers? markets?|fresh food|verduras|frutas)\b/, "produce vegetable fruit market farm"],
  [/\b(tampons?|pads|menstrua\w*|period products?|feminine (hygiene|products?))\b/, "menstrual period tampon hygiene toiletries dignity"],
  [/\b(hygiene|toiletries|toothpaste|toothbrush\w*|soap|shampoo|deodorant|toilet paper|personal care)\b/, "hygiene toiletries soap toothbrush shower laundry"],
  [/\b(pets?|dogs?|cats?|pupp(y|ies)|kittens?|veterinar\w*|spay\w*|neuter\w*)\b/, "pet animal veterinary dog cat"],
  [/\b(glasses|eyeglasses|vision|eye exams?|eye doctors?|optometr\w*)\b/, "eyeglasses glasses vision eye"],
  [/\bbirth certificates?\b/, "register deeds certificate"],
  [/\b(roofs?|mold|mould|leaks?|leaking|plumbing|home repairs?|house repairs?|weatheriz\w*)\b/, "home repair roof weatherization"],
  [/\b(thanksgiving|turkeys?)\b/, "thanksgiving turkey holiday"],
  [/\bsafe sleep\b/, "crib bassinet"],
  [/\b(snap|food stamps?|ebt|food benefits|cupones de alimentos|estampillas)\b/, "snap ebt"],
];
SAME_AS.push([FATHERS, "father dad daddy fatherhood"]);
SAME_AS.push([/^\s*(mothers?|moms?|mommy)(\s+(groups?|programs?|support))?\s*$|\b((moms?|mothers?) groups?|single (moms?|mothers?))\b/, "mom mother mommy"]);

/* text written in Spanish, or asking for Spanish: Spanish-capable programs
   move up inside each need */
const SPANISH_TEXT = /\b(spanish|espanol|latin[oax]s?|hispanic|necesito|necesitamos|ayuda|gratis|donde|para mi|mis hijos|familia|comida|renta|por favor)\b/;

/* Programs outside Buncombe rank a little lower when the text names no
   place, so a family in Asheville sees what is close first; naming a town
   ("food in Waynesville") lifts that town's programs as before. Road names
   that carry a town ("Hendersonville Rd") do not count. */
const ROAD = "(?!\\s*(rd|road|hwy|highway|st|street|ave|avenue|blvd|dr|drive|pike|ln|lane)\\b)";
const OUTSIDE = new RegExp("\\b(hendersonville|waynesville|canton|clyde|maggie valley|marion|old fort|burnsville|spruce pine|"
  + "bakersville|sylva|cullowhee|bryson city|franklin|brevard|forest city|rutherfordton|mooresboro|boone|newland|"
  + "banner elk|creston|marshall|mars hill|hot springs|saluda|flat rock|edneyville|mills river|etowah|cashiers|murphy|"
  + "cherokee|whittier|charlotte)\\b" + ROAD + "|\\b(haywood|henderson|madison|mcdowell|mitchell|rutherford|jackson|swain|"
  + "yancey|macon|avery|ashe|watauga|transylvania|polk) county\\b");
const OUTSIDE_WEIGHT = 0.75;
/* outside Buncombe, by its name or address (for the Area filter) */
export const isOutside = (r) => OUTSIDE.test(norm(`${r.name} ${r.address}`));

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
  /* A row filed under many needs (a diaper bank filed under domestic
     violence because Helpmate hands out its diapers) counts a little less
     for each, so rows that are about the need come first. Most rows carry
     one to four needs and count in full. */
  const focus = resources.map((r) => {
    const n = r.needs.filter((k) => !k.endsWith(":*")).length;
    return n <= 4 ? 1 : Math.sqrt(4 / n);
  });
  const spanish = resources.map((r) => /^[🟢🟡🟠]/u.test(r.spanish || ""));
  const notFirst = resources.map((r) => NOT_FIRST.test(r.detail || ""));
  /* a program the directory keeps only to say it closed ("CLOSED May 2022") */
  const closed = resources.map((r) => /\bclosed\b/i.test(r.name || ""));
  const outside = resources.map((r) => OUTSIDE.test(norm(`${r.name} ${r.address}`)));
  /* the same program filed under several SNIFF sections has the same name;
     the shortlist keeps the best-placed one so copies do not take its places */
  const idOf = new Map(resources.map((r, i) => [r.id, i]));
  const nameKey = resources.map((r) => norm(String(r.name || "").replace(/\(.*?\)/g, "")));

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
  /* every resource's score for a text, and what the text raised */
  function scoreText(text) {
    const flat = " " + norm(text) + " ";
    const places = PLACES.filter((p) => flat.includes(" " + p + " "));
    const placeWords = new Set(places.flatMap((p) => p.split(" ").map(stem)));
    /* a word that is part of a phrase meaning something else ("food" in
       "food stamps", "car" in "car seat") does not count on its own */
    const phraseWords = new Set(PHRASE_HEADS.filter(([re]) => re.test(flat)).map(([, w]) => stem(w)));
    /* the directory's own words for what the text asks about (not run
       through the filler list: "dad" counts here) */
    const same = SAME_AS.filter(([re]) => re.test(flat)).flatMap(([, w]) => w.split(" ").map(stem));
    const q = [...new Set(stems(text).concat(same))].filter((t) => !placeWords.has(t) && !phraseWords.has(t)).slice(0, 400);
    const typed = new Set(stems(text));

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
      /* an added word counts a little less than a typed one */
      const idf = Math.log((N + 1) / hits.size) * (typed.has(t) ? 1 : 0.6);
      for (const [i, weight] of hits) score[i] += idf * weight;
    }
    const wantsSpanish = SPANISH_TEXT.test(flat);
    const urgent = URGENT_KEYS.filter((k) => spotted.has(k));
    for (let i = 0; i < N; i++) {
      let k = 0;
      for (const key of spotted) if (keysOf[i].has(key)) k++;
      score[i] += 10 * Math.min(k, 2) * focus[i];
      score[i] += Math.max(0, ...urgent.map((key) => (keysOf[i].has(key) ? URGENT[key] : 0))) * focus[i];
    }
    /* Spanish and a named town reorder what the text matched; they bring in
       rows of their own only when nothing else matched ("en espanol",
       "Swannanoa"), or "comida gratis" would list every Spanish program */
    const matched = score.some((x) => x > 0);
    for (let i = 0; i < N; i++) {
      if (matched && !score[i]) continue;
      if (wantsSpanish && spanish[i]) score[i] += 5;
      if (places.some((p) => where[i].includes(" " + p + " "))) score[i] += 4;
    }
    for (let i = 0; i < N; i++) {
      if (!score[i]) continue;
      if (!places.length && outside[i]) score[i] *= OUTSIDE_WEIGHT;
      /* still listed, so it can be found by name, but after the others */
      if (notFirst[i]) score[i] *= 0.4;
      if (closed[i]) score[i] *= 0.1;
    }
    return { score, spotted, q, places };
  }

  function search(text) {
    const { score, spotted, q } = scoreText(text);
    const ranked = [...score.keys()].filter((i) => score[i] > 0).sort((a, b) => score[b] - score[a] || a - b);
    /* little to go on: no SNIFF need and hardly a word in common */
    if (!spotted.size && ranked.length < SHORTLIST_MIN) {
      const pick = (idx) => idx.map((i) => resources[i]);
      if (!ranked.length && q.length <= VAGUE_WORDS) return { resources: pick(always), shortlisted: true, vague: true, needs: [] };
      if (ranked.length) return { resources: pick(ranked.concat(always.filter((i) => !ranked.includes(i)))), shortlisted: true, needs: [] };
      return { resources, shortlisted: false, needs: [] };
    }
    /* each need's best first, a turn each, for up to three quarters of the
       list; then the best of what is left, whatever it matched. A copy of a
       program already chosen (same name) is skipped. */
    const chosen = new Set();
    const names = new Set();
    const take = (i) => {
      if (chosen.has(i) || names.has(nameKey[i])) return;
      chosen.add(i);
      names.add(nameKey[i]);
    };
    const perNeed = [...spotted].map((k) => ranked.filter((i) => keysOf[i].has(k))).filter((l) => l.length);
    const fair = Math.floor(SHORTLIST * 0.75);
    for (let turn = 0; chosen.size < fair && perNeed.some((l) => l.length > turn); turn++) {
      for (const l of perNeed) if (turn < l.length && chosen.size < fair) take(l[turn]);
    }
    for (const i of ranked) { if (chosen.size >= SHORTLIST) break; take(i); }
    const top = [...chosen].sort((a, b) => score[b] - score[a] || a - b);
    const list = top.concat(always.filter((i) => !chosen.has(i)));
    return { resources: list.map((i) => resources[i]), shortlisted: true, needs: [...spotted] };
  }

  /* for the app's own search box: every resource that matches, best first,
     as a Map of id to score, with no cap and no always-on lines */
  search.rank = (text) => {
    const { score, places } = scoreText(text);
    const out = new Map();
    for (let i = 0; i < N; i++) if (score[i] > 0) out.set(resources[i].id, score[i]);
    /* how much each row's word-for-word score is weighted: the same
       outside-Buncombe, not-first and closed rules the engine used */
    out.weight = (id) => {
      const i = idOf.get(id);
      if (i === undefined) return 1;
      return (!places.length && outside[i] ? OUTSIDE_WEIGHT : 1) * (notFirst[i] ? 0.4 : 1) * (closed[i] ? 0.1 : 1);
    };
    return out;
  };
  return search;
}
