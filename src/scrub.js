/*
 * Takes client details out of a question before it goes to Google. The Ask
 * AI panel already warns when text looks identifying; this is the second
 * layer, on the server, so a detail that slips past the warning still never
 * leaves this site. Each detail becomes a placeholder Gemini is told about,
 * like [name] or [phone], and the panel says what was taken out.
 *
 * It cannot find a name in the middle of a sentence ("Maria needs
 * diapers"), so the panel's "no client details" note still matters.
 */

const MONTHS = "jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|june?|july?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?";
const RELATIONS = "child|kid|baby|infant|toddler|son|daughter|mother|mom|mum|father|dad|parent|caregiver|guardian|"
  + "grandmother|grandma|grandfather|grandpa|aunt|uncle|sibling|brother|sister|partner|spouse|husband|wife|"
  + "client|participant|youth|teen|student|patient|madre|padre|hijo|hija|mama|papa|nombre";
/* "mother" matches "mother", "Mother" and "MOTHER", and nothing else: the
   name after it has to be capitalized, so the label cannot be matched
   case-blind in the same pattern */
const anyCase = (words) => words.split("|")
  .map((w) => `[${w[0].toUpperCase()}${w[0]}]${w.slice(1)}|${w.toUpperCase()}`).join("|");
const DATE = `\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4}|(?:19|20)\\d{2}-\\d{2}-\\d{2}|(?:${MONTHS})\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+(?:19|20)\\d{2}`;
/* capitalized words after "Mom:" that describe rather than name */
const NOT_NAMES = new Set(("spanish english bilingual single pregnant yes no none unknown not n/a na tbd new "
  + "needs wants has had is was lives works speaks age aged agrees declined unsure").split(" "));

/* [what it is, the pattern, what replaces it] in the order they run; a
   replacement can be a function of the match */
const RULES = [
  ["a name", /\b((?:(?:first|last|full|middle|maiden|preferred|child'?s?|mom'?s?|mother'?s?|dad'?s?|father'?s?|parent'?s?|caregiver'?s?|baby'?s?|client'?s?)\s+)?(?:name|nombre))\s*[:=-]\s*[^\n,;|.!?]+/gi,
    (m, label) => `${label}: [name]`],
  ["a name", new RegExp(`\\b(${anyCase(RELATIONS)})\\s*:\\s*([A-Z][\\p{L}'’-]+(?:\\s+[A-Z][\\p{L}'’-]+){0,2})(?=\\s*(?:[,;()|.\\n]|$|\\d|-|aged?\\b|is\\b))`, "gmu"),
    (m, label, who) => (NOT_NAMES.has(who.split(/\s+/)[0].toLowerCase()) ? m : `${label}: [name]`)],
  ["a date of birth", new RegExp(`\\b(DOB|D\\.O\\.B\\.?|date of birth|birth ?date|born on|born|fecha de nacimiento)\\s*[:=-]?\\s*(?:${DATE}|[^\\n,;|]{0,30}?\\b(?:19|20)\\d{2}\\b)`, "gi"),
    (m, label) => `${label} [date]`],
  ["an email address", /[^\s@<>()]+@[^\s@<>()]+\.[a-z]{2,}/gi, "[email]"],
  ["an ID number", /\b\d{3}-\d{2}-\d{4}\b/g, "[id]"],
  ["a phone number", /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]*\d{3}[\s.-]\d{4}\b/g, "[phone]"],
  ["a date", new RegExp(`\\b(?:${DATE})\\b`, "gi"), "[date]"],
  ["an address", /\b\d{1,6}\s+(?:[A-Z0-9][\w.'’-]*\s+){0,4}?(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Blvd|Boulevard|Way|Ct|Court|Hwy|Highway|Pl|Place|Cir|Circle|Pkwy|Parkway|Trl|Trail|Ter|Terrace|Loop|Pike)\b\.?(?:,?\s*(?:Apt|Apartment|Unit|Lot|Ste|Suite|#)\s*[\w-]+)?/g,
    "[address]"],
  ["an ID number", /\b[A-Z]{0,3}\d{7,}[A-Z]?\b/g, "[number]"],
];

/* the text with its details replaced, and what kinds were taken out */
export function scrub(text) {
  let out = String(text || "");
  const removed = [];
  for (const [kind, re, to] of RULES) {
    out = out.replace(re, (...m) => {
      const next = typeof to === "function" ? to(...m) : to;
      if (next !== m[0] && !removed.includes(kind)) removed.push(kind);
      return next;
    });
  }
  return { text: out, removed };
}
