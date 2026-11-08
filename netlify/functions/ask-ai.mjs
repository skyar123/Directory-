/*
 * Ask AI's server side. The Gemini key is the GEMINI_API_KEY environment
 * variable on Netlify (see the README for how it is set), never in a browser
 * or in this repo, so Ask AI works in any browser with no setup.
 *
 * The browser sends only the question. The prompt is built here from the
 * directory as deployed, so this endpoint answers questions about this
 * directory and nothing else, which makes the key close to useless to anyone
 * who finds the URL. On top of that: requests must come from the app's own
 * pages, Netlify rate-limits by IP, and ASK_AI_CODE (optional) adds a shared
 * team code.
 */
import resourcesFile from "../../data/resources.json";
import sniffFile from "../../data/sniff.json";
import eventsFile from "../../data/events.json";
import calendarFile from "../../data/calendar.json";
import { buildPrompt, askGemini, parseAnswer } from "../../src/ai.js";

export const MAX_TEXT = 30000;

/* the same field names src/data.js gives the app, only the ones the prompt uses */
const RESOURCES = resourcesFile.resources.map((r) => ({
  id: r.id, name: r.n, sec: r.sec, needs: r.needs || [],
  spanish: r.sp || "", tags: r.t || "", detail: r.d || "",
}));
const EVENTS = eventsFile.events.concat(calendarFile.events.map((e) => ({ ...e, tags: e.tags || [] })));

const env = (k) => (globalThis.Netlify ? globalThis.Netlify.env.get(k) : process.env[k]);
const reply = (status, body) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

/* The app calls this from its own pages. A page on another site that tries
   to use it from a visitor's browser sends that site's Origin and is turned
   away. (A script outside a browser can fake headers; the rate limit and the
   directory-only prompt are what keep that cheap.) */
export function sameSite(req) {
  const host = new URL(req.url).host;
  const hostOf = (u) => { try { return new URL(u).host; } catch (e) { return ""; } };
  const origin = req.headers.get("origin");
  if (origin) return hostOf(origin) === host;
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin";
  const referer = req.headers.get("referer");
  return !!referer && hostOf(referer) === host;
}

/* the calendar's days are Asheville's days */
export const localToday = (now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);

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
  const text = String((body && body.text) || "").trim();
  if (!text) return reply(400, { error: "empty" });
  if (text.length > MAX_TEXT) return reply(413, { error: "long" });

  const prompt = buildPrompt({ resources: RESOURCES, needs: sniffFile.needs, events: EVENTS, today: localToday() });
  const limit = deadline(budgetMs);
  const t0 = Date.now();
  /* the log says which model answered, how fast and with how many tokens;
     never what was asked or answered: that is a family's situation */
  const trace = (t) => log.log("ask-ai gemini " + JSON.stringify(t));
  try {
    const raw = await askGemini({ key, system: prompt.system, text, signal: limit.signal, fetchImpl, memo, trace });
    const answer = parseAnswer(raw, prompt);
    log.log(`ask-ai ok in ${Date.now() - t0}ms: ${answer.picks.length} picks, ${answer.events.length} events, ${answer.dropped} dropped`);
    return reply(200, answer);
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
