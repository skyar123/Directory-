/*
 * Words that can mean someone is in danger right now. Two places use them:
 * the Ask AI panel, which shows the crisis lines itself, the moment a
 * question is sent and whatever Gemini says, and the search in
 * src/shortlist.js, which moves crisis and safety help to the top of what
 * Gemini reads. They run on norm()'d text: lower case, no accents, every
 * run of punctuation a single space, so "can't" is "can t".
 */

export const norm = (s) => String(s || "").toLowerCase().normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/* thinking about suicide or self-harm, in the words people use for it, in
   English and Spanish */
export const SELF_HARM = new RegExp("\\b(" + [
  "suicid\\w*", "(can ?t|can ?not) (keep going|go on|do this anymore|take (it|this) anymore)",
  "give up on (life|everything)", "end (it all|my life|her life|his life|their life)",
  "kill (myself|herself|himself|themselves)", "hurt(ing)? (myself|herself|himself|themselves)",
  "self harm\\w*", "wants? to die", "not want to (live|be here)", "overdos\\w*",
  "no quiero vivir", "quiero morir\\w*", "matarme", "quitarme la vida", "hacerme dano",
].join("|") + ")\\b");

/* not safe at home, or with a partner; "substance abuse" is not this */
export const UNSAFE = new RegExp("\\b(" + [
  "domestic violence", "(?<!substance |drug |alcohol )abus\\w*", "unsafe", "not safe",
  "do(es)?n ?t feel safe", "violen\\w*", "stalk\\w*", "afraid of (him|her|them)", "scared of (him|her|them)",
  "hits? (her|him|me|them)", "threaten\\w*", "rape", "raped", "sexual(ly)? (assault\\w*|abus\\w*)",
  "molest\\w*", "trafficking",
  "no (me siento|se siente|estoy|esta) (segur[oa]|a salvo)", "(me|le) pega", "amenaz\\w*",
].join("|") + ")\\b");

export const CRISIS = /\b(crisis|emergency|emergencia|988|911)\b/;

/* "self", "unsafe", "crisis" or "" for nothing urgent */
export function urgentKind(text) {
  const flat = norm(text);
  if (SELF_HARM.test(flat)) return "self";
  if (UNSAFE.test(flat)) return "unsafe";
  if (CRISIS.test(flat)) return "crisis";
  return "";
}

/* The lines the panel shows, by directory id, in the order that fits what
   was said. Numbers and hours come from the directory rows themselves. */
export const CRISIS_LINES = {
  self: ["988-suicide-crisis-lifeline", "crisis-text-line", "rha-mobile-crisis-response-comes-to-you-11-c", "helpmate-domestic-violence-hotline"],
  unsafe: ["helpmate-domestic-violence-hotline", "our-voice-sexual-violence-hotline", "988-suicide-crisis-lifeline", "crisis-text-line"],
  crisis: ["988-suicide-crisis-lifeline", "rha-mobile-crisis-response-comes-to-you-11-c", "crisis-text-line", "helpmate-domestic-violence-hotline"],
};
