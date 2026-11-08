/*
 * Ask AI's server side. The Gemini key is the GEMINI_API_KEY environment
 * variable on Netlify (see the README for how it is set), never in a browser
 * or in this repo, so Ask AI works in any browser with no setup.
 *
 * The browser sends only the question. Client details are taken out of it
 * here (src/scrub.js) before anything goes to Google, and the prompt is
 * built here from the directory as deployed, so this endpoint answers
 * questions about this directory and nothing else, which makes the key close
 * to useless to anyone who finds the URL. On top of that: requests must come
 * from the app's own pages, Netlify rate-limits by IP, and ASK_AI_CODE
 * (optional) adds a shared team code.
 *
 * It answers two kinds of request: {text}, a question, and
 * {translate: [...], to: "es"}, the reasons in a message for a family.
 */
import resourcesFile from "../../data/resources.json";
import sniffFile from "../../data/sniff.json";
import eventsFile from "../../data/events.json";
import calendarFile from "../../data/calendar.json";
import foodFile from "../../data/food-by-day.json";
import {
  buildPrompt, askGemini, parseAnswer, whenAsked, translatePrompt, parseTranslation,
} from "../../src/ai.js";
import { buildIndex } from "../../src/shortlist.js";
import { scrub } from "../../src/scrub.js";
import { env, reply, sameSite, localToday } from "../lib/http.mjs";

export { sameSite, localToday };

export const MAX_TEXT = 30000;
export const MAX_LINES = 20; // reasons in one translation
export const MAX_LINE = 400;

/* the same field names src/data.js gives the app, only the ones the prompt
   and the search use */
const RESOURCES = resourcesFile.resources.map((r) => ({
  id: r.id, name: r.n, sec: r.sec, needs: r.needs || [],
  spanish: r.sp || "", tags: r.t || "", detail: r.d || "",
  address: r.a || "", origSection: r.os || "", hours: r.h || "",
}));
/* the directory, indexed once when the function starts; each question then
   only looks things up in it */
const SEARCH = buildIndex(RESOURCES, sniffFile.needs);
const EVENTS = eventsFile.events.concat(calendarFile.events.map((e) => ({ ...e, tags: e.tags || [] })));

const isTimeout = (e) => e && (e.name === "TimeoutError" || e.name === "AbortError");

/* a deadline as an abort signal, on an ordinary timer that is cleared once
   Gemini answers (AbortSignal.timeout's timer does not hold the process) */
const deadline = (ms) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new DOMException("Gemini took too long", "TimeoutError")), ms);
  return { signal: ctrl.signal, done: () => clearTimeout(timer) };
};

/* Netlify ends this site's functions at 30 seconds (the request logs show
   the cutoff at 30, whatever the docs say) and answers with its own error
   page. Everything here, the fallback model included, gets 24 seconds, so the
   person always hears from this code: an answer, or a plain "took too long". */
export const BUDGET_MS = 24000;

/* which thinking setting each model took, kept while the function is warm */
const THINKING_MEMO = new Map();

export async function handle(req, { budgetMs = BUDGET_MS, fetchImpl = fetch, memo = THINKING_MEMO, log = console } = {}) {
  if (req.method !== "POST") return reply(405, { error: "method" });
  if (!sameSite(req)) return reply(403, { error: "denied" });
  const code = env("ASK_AI_CODE");
  if (code && req.headers.get("x-ask-code") !== code) return reply(401, { error: "code" });
  const key = env("GEMINI_API_KEY");
  if (!key) return reply(503, { error: "setup" });

  let body;
  try { body = await req.json(); } catch (e) { return reply(400, { error: "bad" }); }
  const translating = !!body && Array.isArray(body.translate);
  let text = "", lines = [];
  if (translating) {
    lines = body.translate.map((t) => String(t || "").trim());
    if (!lines.length || lines.length > MAX_LINES || lines.some((l) => !l || l.length > MAX_LINE)) return reply(400, { error: "bad" });
    if (body.to !== "es" && body.to !== "en") return reply(400, { error: "bad" });
  } else {
    text = String((body && body.text) || "").trim();
    if (!text) return reply(400, { error: "empty" });
    if (text.length > MAX_TEXT) return reply(413, { error: "long" });
  }

  const limit = deadline(budgetMs);
  const t0 = Date.now();
  /* the log says which model answered, how fast and with how many tokens;
     never what was asked or answered: that is a family's situation */
  const trace = (t) => log.log("ask-ai gemini " + JSON.stringify(t));
  const ask = (system, userText) => askGemini({ key, system, text: userText, signal: limit.signal, fetchImpl, memo, trace });
  try {
    if (translating) {
      const clean = lines.map((l) => scrub(l).text);
      const texts = parseTranslation(await ask(translatePrompt(body.to), JSON.stringify(clean)), clean.length);
      log.log(`ask-ai translated ${clean.length} lines in ${Date.now() - t0}ms`);
      return reply(200, { texts });
    }
    /* client details out first; then search, so Gemini reads the closest
       matches, not all 622 */
    const clean = scrub(text);
    const today = localToday();
    const found = SEARCH(clean.text);
    const when = whenAsked(clean.text, today);
    const prompt = buildPrompt({
      resources: found.resources, needs: sniffFile.needs, events: EVENTS, today, shortlisted: found.shortlisted,
      withHours: when.hours, food: foodFile.days.filter((d) => when.foodDays.includes(d.day)),
    });
    const answer = parseAnswer(await ask(prompt.system, clean.text), prompt);
    log.log(`ask-ai ok in ${Date.now() - t0}ms: read ${found.resources.length} of ${RESOURCES.length} resources (${prompt.system.length} characters)`
      + `${when.hours ? ", with hours" : ""}${when.foodDays.length ? `, food for ${when.foodDays.length} days` : ""}`
      + `${clean.removed.length ? `; took out ${clean.removed.length} kinds of detail` : ""}; ${answer.picks.length} picks, ${answer.events.length} events, ${answer.dropped} dropped`);
    return reply(200, { ...answer, removed: clean.removed });
  } catch (e) {
    const kind = isTimeout(e) ? "timeout" : e.kind || "error";
    /* an unexpected error is logged by its name only: its message could quote Gemini's reply */
    log.error(`ask-ai failed after ${Date.now() - t0}ms: ${kind}`, e.kind ? "" : e.name || "");
    return reply(kind === "quota" ? 429 : kind === "timeout" ? 504 : 502, { error: kind });
  } finally {
    limit.done();
  }
}

export default (req) => handle(req);

export const config = {
  path: "/api/ask-ai",
  method: "POST",
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 10 },
};
