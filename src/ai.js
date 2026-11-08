import { norm } from "./urgent.js";

/*
 * Ask AI. The browser sends the question to this site's function
 * (askServer); the function builds a prompt from the directory, asks Gemini
 * (askGemini) and turns the reply back into resources and events from the
 * directory (parseAnswer). Every pick has to be a ref the prompt listed, so
 * the model can rank and explain but never invent a resource, a phone number
 * or an event.
 */

/* The Gemini key lives on the server (netlify/functions/ask-ai.mjs reads it
   from Netlify's environment); the browser only ever calls ASK_PATH. Browsers
   that saved a key under the old per-browser setup have it removed. */
export const ASK_PATH = "/api/ask-ai";
export const CODE_STORE = "wnc:ask-code";
export const LEGACY_KEY_STORE = "wnc:gemini-key";

/* Flash-Lite is Google's fastest model. Flash, on a prompt this size, ran
   past the function's 30 seconds in the first live tests, so Flash-Lite goes
   first and Flash is the fallback when Flash-Lite is overloaded, out of its
   free quota (each model has its own) or missing. Google repoints both
   aliases at its current models, which the free tier covers, so a retired
   version does not break the search. */
export const MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest"];
export const endpoint = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const clip = (s, n) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
const addDays = (iso, n) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

/* The calendar holds a year of listings, which would double the request and
   the wait. What a family can act on is the next three weeks of it, so the
   prompt carries the team's own picks and at most this many listings. */
export const EVENT_DAYS = 21;
export const EVENT_MAX = 150;

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const weekdayOf = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
};
const longDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-US",
  { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/* A question about when ("open Saturday?", "food tonight") gets each
   resource's hours, and, when it is about food, the Food by day schedule for
   the days it means: the ones it names, the weekend, tomorrow, or else
   today. Other questions leave both out, which keeps them short. */
const WHEN = /\b(today|tonight|tomorrow|now|open|opens|closed|close|hours|weekend|this week|morning|afternoon|evening|late|sunday|monday|tuesday|wednesday|thursday|friday|saturday|hoy|manana|esta noche|fin de semana|abierto|horario)\b/;
const FOODISH = /\b(food|pantr\w*|meals?|grocer\w*|hungry|lunch|dinner|breakfast|eat|comida|despensa)\b/;
export function whenAsked(text, today) {
  const flat = norm(text);
  if (!WHEN.test(flat)) return { hours: false, foodDays: [] };
  const days = WEEKDAYS.filter((d) => flat.includes(d.toLowerCase()));
  if (/\b(weekend|fin de semana)\b/.test(flat)) days.push("Saturday", "Sunday");
  if (/\b(tomorrow|manana)\b/.test(flat)) days.push(weekdayOf(addDays(today, 1)));
  if (!days.length || /\b(today|tonight|now|hoy|esta noche)\b/.test(flat)) days.push(weekdayOf(today));
  return { hours: true, foodDays: FOODISH.test(flat) ? WEEKDAYS.filter((d) => days.includes(d)) : [] };
}


/* one line per resource and event, with refs (R12, E3) the reply has to
   use. resources is the search's shortlist (src/shortlist.js) or, when the
   search found too little to go on, the whole directory. withHours and food
   come from whenAsked: hours on each resource line, and the Food by day
   schedule ({day, sites}) for the days asked about. */
export function buildPrompt({ resources, needs, events, today, shortlisted = false, withHours = false, food = [] }) {
  const horizon = addDays(today, EVENT_DAYS);
  const upcoming = events
    .filter((e) => (e.end || e.date) >= today && (!e.status || e.date <= horizon))
    .sort((a, b) => (a.status ? 1 : 0) - (b.status ? 1 : 0) || a.date.localeCompare(b.date))
    .slice(0, EVENT_MAX);
  const rows = resources.map((r, i) => {
    const flags = [
      /\bfree\b/i.test(r.tags) && "free",
      /^[🟢🟡]/u.test(r.spanish) && "spanish",
      /^🟠/u.test(r.spanish) && "interpreter",
    ].filter(Boolean).join(",");
    const keys = r.needs.filter((k) => !k.endsWith(":*")).join(" ");
    return `R${i}|${clip(r.name, 90)}|${r.sec}|${keys}|${flags}|${clip(r.detail, 110)}`
      + (withHours ? `|${clip(r.hours, 70) || "not listed"}` : "");
  });
  const cols = "ref|name|section|SNIFF keys|flags|detail" + (withHours ? "|hours" : "");
  const foodLines = food.flatMap((d) => d.sites.map((x) =>
    `F|${d.day}|${clip(x.place, 60)}|${clip(x.when, 90)}|${clip(x.goodToKnow, 40)}`));
  const ev = upcoming.map((e, i) =>
    `E${i}|${e.date}${e.end ? " to " + e.end : ""}${e.time ? " " + clip(e.time, 20) : ""}|${clip(e.what, 80)}|${clip(e.where, 60)}|${(e.ages || []).join("/")}|${clip(e.org, 40)}`);
  const system = [
    "You help Family Resource Partners (FRPs) in Buncombe County and Western North Carolina find resources for families with young children. FRPs often read what you write to the family or pass it on to them.",
    /* the voice: the user asked for it to be very family friendly, warm,
       kind and above all trying to help */
    "Be warm, kind and on the family's side, and above all try to help. Write the way a caring neighbor who knows every program in town would talk: plain everyday words, respectful and hopeful, never judging, blaming or lecturing. When the text shows something the family is already doing well, say so. Use person-first words, and no jargon or labels such as 'at-risk' or 'non-compliant'.",
    "Always leave the family with something to try. When nothing fits a need exactly, offer the closest options and a good first call, and say what to ask for.",
    "If the text suggests a child or adult may be unsafe, in danger or thinking about ending their life, put the crisis and safety options first, gently.",
    "Recommend ONLY items from the lists below, by their ref (R... or E...). Never invent a resource, phone number, price or event, and never promise eligibility, openings or costs the list does not state; suggest a call to check instead.",
    "The text may be a question, a family's situation, or a pasted SNIFF needs assessment. Work out which SNIFF needs it raises, then pick the best matches for each.",
    "If the text contains names or other identifying details, do not repeat them. Placeholders such as [name], [phone], [date] or [address] stand for details taken out for privacy; never ask for names, contact details, dates of birth or addresses.",
    "Write the summary, each why and each question in the language the text is written in.",
    "Reply with JSON only, in this shape:",
    '{"summary": "one or two warm sentences on what the family is looking for",',
    ' "needs": [{"key": "SNIFF key", "why": "short reason from the text"}],',
    ' "picks": [{"ref": "R12", "need": "SNIFF key", "why": "one kind, plain sentence on how it can help"}],',
    ' "events": [{"ref": "E3", "why": "one friendly sentence"}],',
    ' "ask": ["a gentle question that would help find a better fit"]}',
    "Give up to 10 picks, best first, with two or three choices for a need when the list has them, at most 3 events and at most 3 questions. Keep each why to one short sentence. Prefer free, nearby and Spanish-capable options when the text points that way.",
    ...(withHours ? ["Hours are as the directory lists them and can change, so suggest a call first. Use them when the text asks what is open, and say when a place's hours are not listed."] : []),
    "",
    "SNIFF questions (key|label):",
    ...needs.map((n) => `${n.key}|${n.label}`),
    "",
    shortlisted
      ? `Resources: the directory's closest matches to this text, found by search, plus the call-first and crisis lines (${cols}):`
      : `Resources (${cols}):`,
    ...rows,
    "",
    `Today is ${longDate(today)}, in Asheville.`,
    ...(foodLines.length ? [
      "Food by day, the directory's weekly pantry and free-meal schedule, for the days asked about (F|weekday|place|when and where|good to know). These have no refs: mention a time from here in a why or the summary when it helps, and pick the matching resource ref when there is one.",
      ...foodLines,
      "",
    ] : []),
    `Upcoming events, the team's picks and the next ${EVENT_DAYS} days of the family calendar (ref|date|what|where|ages|organizer):`,
    ...ev,
  ].join("\n");
  return { system, resourceIds: resources.map((r) => r.id), eventIds: upcoming.map((e) => e.id) };
}

/* The family message's reasons, in Spanish (or English). Only the reasons
   go to Gemini; names, phone numbers, hours and addresses stay as the
   directory has them, so a translation cannot change a number. */
export function translatePrompt(to) {
  const lang = to === "es" ? "Spanish" : "English";
  return [
    `Translate each line into warm, plain ${lang}, the way someone helping a family would write to them in a text message.`,
    "Keep program names, phone numbers, times, dates, addresses and websites exactly as written.",
    'Reply with JSON only: {"texts": ["...", "..."]}, one line for each line given, in the same order.',
  ].join("\n");
}
export function parseTranslation(raw, n) {
  let j;
  try { j = JSON.parse(raw); } catch (e) {
    const m = String(raw).match(/\{[\s\S]*\}/);
    try { j = m && JSON.parse(m[0]); } catch (e2) { j = null; }
  }
  const texts = j && Array.isArray(j.texts) ? j.texts.map((t) => clip(t, 400)) : null;
  if (!texts || texts.length !== n || texts.some((t) => !t)) throw new AiError("parse", String(raw).slice(0, 200));
  return texts;
}

/* the browser's side of a translation */
export async function askTranslate({ texts, to, code, signal, fetchImpl = fetch }) {
  const j = await post({ body: { translate: texts, to }, code, signal, fetchImpl });
  if (!Array.isArray(j.texts)) throw new AiError("parse");
  return j.texts;
}

/* Thumbs up or down on an answer (netlify/functions/ask-feedback.mjs).
   What is sent says nothing about the family: the rating, one of these
   reasons for a thumbs down, and the SNIFF needs, resources and events the
   answer named. */
export const FEEDBACK_PATH = "/api/ask-feedback";
export const REASONS = {
  missing: "Missing something that would help",
  area: "Not near the family",
  closed: "Closed, full or not taking people",
  few: "Too few choices",
  tone: "The wording was off",
  other: "Something else",
};
export async function sendFeedback({ rating, reason, needs, picks, events, fetchImpl = fetch }) {
  const res = await fetchImpl(FEEDBACK_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating, ...(reason && { reason }), needs, picks, events }),
  });
  if (!res.ok) throw new AiError(res.status === 429 ? "limit" : "error", String(res.status));
  return true;
}

/* things that usually mean a client detail slipped in; a nudge, not a block */
export function looksIdentifying(text) {
  const found = [];
  if (/\(?\b\d{3}\)?[-.\s]\s*\d{3}[-.\s]\d{4}\b/.test(text)) found.push("a phone number");
  if (/[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(text)) found.push("an email address");
  if (/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\bDOB\b|date of birth/i.test(text)) found.push("a date of birth");
  if (/\b(name|client|child|mother|father|parent|caregiver|guardian)\s*:/i.test(text)) found.push("a name field");
  return found;
}

export class AiError extends Error {
  constructor(kind, detail = "") { super(kind); this.kind = kind; this.detail = detail; }
}

/* what each failure means for the person holding the phone */
export function explain(err) {
  switch (err.kind) {
    case "setup": return "Ask AI is not switched on for this copy of the app yet. Someone with Netlify access adds the Gemini key once (see the README); the regular search works meanwhile.";
    case "key": return "Google turned down this site's Gemini key. Someone with Netlify access needs to check GEMINI_API_KEY.";
    case "quota": return "Gemini's free limit is used up for now. Wait a minute and try again; the daily limit resets overnight.";
    case "limit": return "Too many questions in a short time. Wait a minute and try again.";
    case "busy": return "Gemini is busy right now. Try again in a moment.";
    case "timeout": return "Gemini took too long to answer. Try again, or shorten the text.";
    case "long": return "That is longer than Ask AI takes (30,000 characters). Trim it and try again.";
    case "denied": return "This page is not allowed to use Ask AI. Open the directory from its own address.";
    case "offline": return "Could not reach Ask AI. Check the connection; the regular search still works without one.";
    case "blocked": return "Gemini would not answer that one. Try rewording it.";
    case "parse": return "Gemini's answer could not be read. Try again.";
    default: return "Something went wrong with Ask AI. Try again.";
  }
}

/* one request to this site's function, its errors turned into kinds */
async function post({ body, code, signal, fetchImpl }) {
  let res;
  try {
    res = await fetchImpl(ASK_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(code && { "x-ask-code": code }) },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new AiError("offline", String(e));
  }
  let j = null;
  try { j = await res.json(); } catch (e) { /* a platform page, not the function's JSON */ }
  if (res.ok && j && !j.error) return j;
  if (j && typeof j.error === "string") throw new AiError(j.error);
  if (res.status === 429) throw new AiError("limit");
  if (res.status === 404) throw new AiError("setup", "no function at " + ASK_PATH);
  /* Netlify's own timeout page, should the function ever run past its limit */
  if (res.status === 504) throw new AiError("timeout");
  if (res.status >= 500) throw new AiError("busy");
  throw new AiError("error", String(res.status));
}

/* The browser's side: send the question to this site's function, get back
   the picks already mapped onto the directory. */
export async function askServer({ text, code, signal, fetchImpl = fetch }) {
  const j = await post({ body: { text }, code, signal, fetchImpl });
  if (!Array.isArray(j.picks)) throw new AiError("parse");
  return j;
}

const kindFor = (status, body) => {
  if (status === 400 && /api key/i.test(body)) return "key";
  if (status === 401 || status === 403) return "key";
  if (status === 429) return "quota";
  if (status === 404) return "model";
  if (status >= 500) return "busy";
  return "error";
};

/* Thinking is most of the wait on a prompt this size, and matching a list
   against a need does not take much. Gemini 3 models take a thinking level
   (minimal is the least); 2.5 models refuse a level with a 400 and turn
   thinking off with a budget of 0. Each model is asked these in turn until
   one is accepted, and a memo (the function keeps one while it stays warm)
   remembers which, so the refusal costs a round trip once, not every time. */
export const THINKING = [{ thinkingLevel: "minimal" }, { thinkingBudget: 0 }, null];

/* An answer is well under a thousand tokens. The cap stops a reply that
   loops from eating the time limit. No temperature is set: Gemini 3 models
   are tuned for their default and can loop below it. */
export const MAX_OUTPUT = 3000;

const thinkingName = (t) => (t ? Object.entries(t)[0].join("=") : "default");
const usageOf = (u) => u && {
  in: u.promptTokenCount || 0, out: u.candidatesTokenCount || 0,
  think: u.thoughtsTokenCount || 0, cached: u.cachedContentTokenCount || 0,
};
/* Gemini's own error, for the log: its status and message, never the request */
const errorOf = (body) => {
  try { const e = JSON.parse(body).error; return clip(`${e.status || ""} ${e.message || ""}`, 160); } catch (x) { return clip(body, 80); }
};

/* One question to Gemini. Tries the next model when one is missing, busy or
   out of quota. trace gets one line per attempt (model, status, time,
   tokens) for the function log; it never sees the question or the answer. */
export async function askGemini({
  key, system, text, signal, models = MODELS, fetchImpl = fetch, memo = new Map(), trace = () => {},
}) {
  let last;
  for (const model of models) {
    for (let t = memo.get(model) || 0; t < THINKING.length; t++) {
      const thinking = THINKING[t];
      const t0 = Date.now();
      const note = (o) => trace({ model, thinking: thinkingName(thinking), ms: Date.now() - t0, ...o });
      let res;
      try {
        res = await fetchImpl(endpoint(model), {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text }] }],
            generationConfig: {
              responseMimeType: "application/json", maxOutputTokens: MAX_OUTPUT,
              ...(thinking && { thinkingConfig: thinking }),
            },
          }),
          signal,
        });
      } catch (e) {
        if (e.name === "AbortError" || e.name === "TimeoutError") { note({ status: "deadline" }); throw e; }
        note({ status: "offline" });
        throw new AiError("offline", String(e));
      }
      if (res.ok) {
        memo.set(model, t);
        const j = await res.json();
        const c = j.candidates && j.candidates[0];
        note({ status: res.status, finish: (c && c.finishReason) || "", usage: usageOf(j.usageMetadata) });
        const out = ((c && c.content && c.content.parts) || []).filter((p) => !p.thought).map((p) => p.text || "").join("");
        if (!out) throw new AiError("blocked", (c && c.finishReason) || (j.promptFeedback && j.promptFeedback.blockReason) || "");
        return out;
      }
      const body = await res.text();
      last = new AiError(kindFor(res.status, body), body.slice(0, 300));
      note({ status: res.status, error: errorOf(body) });
      /* a 400 that is not about the key is most likely the thinking
         setting this model does not take: ask it the next way */
      if (!(thinking && res.status === 400 && last.kind !== "key")) break;
    }
    if (!["model", "busy", "quota"].includes(last.kind)) break;
  }
  throw last;
}

/* the reply, mapped back onto the directory; anything not in it is dropped */
export function parseAnswer(raw, { resourceIds, eventIds }) {
  let j;
  try { j = JSON.parse(raw); } catch (e) {
    const m = String(raw).match(/\{[\s\S]*\}/);
    try { j = m && JSON.parse(m[0]); } catch (e2) { j = null; }
  }
  if (!j || typeof j !== "object") throw new AiError("parse", String(raw).slice(0, 200));
  let dropped = 0;
  const resolve = (ref, prefix, ids) => {
    const m = /^([RE])(\d+)$/.exec(String(ref || "").trim());
    const id = m && m[1] === prefix ? ids[Number(m[2])] : undefined;
    if (!id) dropped++;
    return id;
  };
  const uniq = (list) => {
    const seen = new Set();
    return list.filter((x) => x.id && !seen.has(x.id) && seen.add(x.id));
  };
  const arr = (x) => (Array.isArray(x) ? x : []);
  const picks = uniq(arr(j.picks).map((p) => ({ id: resolve(p.ref, "R", resourceIds), need: clip(p.need, 40), why: clip(p.why, 300) })));
  const events = uniq(arr(j.events).map((p) => ({ id: resolve(p.ref, "E", eventIds), why: clip(p.why, 300) })));
  return {
    summary: clip(j.summary, 600),
    needs: arr(j.needs).map((n) => ({ key: clip(n.key, 40), why: clip(n.why, 200) })).filter((n) => n.key),
    picks: picks.slice(0, 15),
    events: events.slice(0, 6),
    ask: arr(j.ask).map((q) => clip(q, 200)).filter(Boolean).slice(0, 5),
    dropped,
  };
}
