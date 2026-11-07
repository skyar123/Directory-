/*
 * Ask AI. Builds a prompt from this directory, sends it with the user's own
 * free Gemini key straight from the browser, and turns the reply back into
 * resources and events from the directory. Every pick has to be a ref the
 * prompt listed, so the model can rank and explain but never invent a
 * resource, a phone number or an event.
 */

/* the key lives only in this browser; nothing in the repo or the build has it */
export const KEY_STORE = "wnc:gemini-key";

/* Google repoints this alias at its current Flash model, which the free tier
   covers, so a retired model version does not break the search. The lite
   alias is the fallback when the first is overloaded or missing. */
export const MODELS = ["gemini-flash-latest", "gemini-flash-lite-latest"];
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

/* A mix-up Muse ran into: AI Studio shows a service account email
   (...@...iam.gserviceaccount.com) next to the key, and it is not the key.
   Keys start "AQ." (the newer form) or "AIza". */
export function keyProblem(k) {
  if (/@|gserviceaccount\.com/i.test(k)) {
    return "That is a service account email, not an API key. In AI Studio, open the key and copy the key itself. It starts with AQ. or AIza.";
  }
  if (/\s/.test(k)) return "A key has no spaces in it. Copy it again from AI Studio.";
  return "";
}

/* one line per resource and event, short enough that the whole directory
   fits in one request, with refs (R12, E3) the reply has to use */
export function buildPrompt({ resources, needs, events, today }) {
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
    return `R${i}|${clip(r.name, 90)}|${r.sec}|${keys}|${flags}|${clip(r.detail, 110)}`;
  });
  const ev = upcoming.map((e, i) =>
    `E${i}|${e.date}${e.end ? " to " + e.end : ""}${e.time ? " " + clip(e.time, 20) : ""}|${clip(e.what, 80)}|${clip(e.where, 60)}|${(e.ages || []).join("/")}|${clip(e.org, 40)}`);
  const system = [
    "You help Family Resource Partners in Buncombe County and Western North Carolina find resources for families with young children.",
    "Recommend ONLY items from the lists below, by their ref (R... or E...). Never invent a resource, phone number or event.",
    "The user may type a question, describe a family's situation, or paste a SNIFF needs assessment. Work out which SNIFF needs it raises, then pick the best matches for each.",
    "If the text contains names or other identifying details, do not repeat them.",
    "Reply with JSON only, in this shape:",
    '{"summary": "one or two sentences on what the family needs",',
    ' "needs": [{"key": "SNIFF key", "why": "short reason from the text"}],',
    ' "picks": [{"ref": "R12", "need": "SNIFF key", "why": "one sentence on why it fits"}],',
    ' "events": [{"ref": "E3", "why": "one sentence"}],',
    ' "ask": ["a question that would help narrow this down"]}',
    "Give at most 12 picks, best first, and at most 4 events. Prefer free, nearby and Spanish-capable options when the text points that way.",
    "",
    "SNIFF questions (key|label):",
    ...needs.map((n) => `${n.key}|${n.label}`),
    "",
    "Resources (ref|name|section|SNIFF keys|flags|detail):",
    ...rows,
    "",
    `Upcoming events, the team's picks and the next ${EVENT_DAYS} days of the family calendar (ref|date|what|where|ages|organizer):`,
    ...ev,
  ].join("\n");
  return { system, resourceIds: resources.map((r) => r.id), eventIds: upcoming.map((e) => e.id) };
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
    case "key": return "Gemini did not accept that key. Check it at aistudio.google.com/apikey, then paste it again.";
    case "quota": return "Gemini's free limit is used up for now. Wait a minute and try again; the daily limit resets overnight.";
    case "busy": return "Gemini is busy right now. Try again in a moment.";
    case "offline": return "Could not reach Gemini. Check the connection; the regular search still works without one.";
    case "blocked": return "Gemini would not answer that one. Try rewording it.";
    case "parse": return "Gemini's answer could not be read. Try again.";
    default: return "Something went wrong asking Gemini. Try again.";
  }
}

const kindFor = (status, body) => {
  if (status === 400 && /api key/i.test(body)) return "key";
  if (status === 401 || status === 403) return "key";
  if (status === 429) return "quota";
  if (status === 404) return "model";
  if (status >= 500) return "busy";
  return "error";
};

/* Flash models think before they answer, and on a prompt this size that
   is most of the wait. Matching a list against a need does not take much,
   so the request asks for a low thinking level. */
export const THINKING = { thinkingLevel: "low" };

/* one call to Gemini; tries the fallback model when the first is missing or busy */
export async function askGemini({ key, system, text, signal, fetchImpl = fetch }) {
  let last;
  for (const model of MODELS) {
    /* a model that does not take a thinking level refuses the request with
       a 400, so ask that model again without one before moving on */
    for (const thinking of [THINKING, null]) {
      let res;
      try {
        res = await fetchImpl(endpoint(model), {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text }] }],
            generationConfig: {
              responseMimeType: "application/json", temperature: 0.2,
              ...(thinking && { thinkingConfig: thinking }),
            },
          }),
          signal,
        });
      } catch (e) {
        if (e.name === "AbortError") throw e;
        throw new AiError("offline", String(e));
      }
      if (res.ok) {
        const j = await res.json();
        const c = j.candidates && j.candidates[0];
        const out = ((c && c.content && c.content.parts) || []).filter((p) => !p.thought).map((p) => p.text || "").join("");
        if (!out) throw new AiError("blocked", (c && c.finishReason) || (j.promptFeedback && j.promptFeedback.blockReason) || "");
        return out;
      }
      const body = await res.text();
      last = new AiError(kindFor(res.status, body), body.slice(0, 300));
      if (!(thinking && res.status === 400 && last.kind !== "key")) break;
    }
    if (last.kind !== "model" && last.kind !== "busy") break;
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
