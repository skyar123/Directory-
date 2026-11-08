/*
 * Thumbs up or down on an Ask AI answer. It is saved without the question
 * or a word of the answer: only the day, the rating, for a thumbs down one
 * reason from a fixed list, and which SNIFF needs, resources and events the
 * answer named. That is enough to see which answers help and to tune the
 * search, and nothing in it is about a family.
 *
 * POST /api/ask-feedback saves one rating, from the app's own pages only.
 * GET /api/ask-feedback adds them up (with ?code= when ASK_AI_CODE is set).
 * They live in this site's Netlify Blobs store "ask-feedback".
 */
import { getStore } from "@netlify/blobs";
import resourcesFile from "../../data/resources.json";
import sniffFile from "../../data/sniff.json";
import eventsFile from "../../data/events.json";
import calendarFile from "../../data/calendar.json";
import { REASONS } from "../../src/ai.js";
import { env, reply, sameSite, localToday } from "../lib/http.mjs";

const NAMES = new Map(resourcesFile.resources.map((r) => [r.id, r.n]));
const EVENT_IDS = new Set(eventsFile.events.concat(calendarFile.events).map((e) => e.id));
const LABELS = new Map(sniffFile.needs.map((n) => [n.key, n.label]));
export const MAX_SUMMED = 2000;

/* only ids this directory has, at most n of them */
const known = (list, has, n) => [...new Set(Array.isArray(list) ? list : [])]
  .filter((x) => typeof x === "string" && has(x)).slice(0, n);

export function record(body, day) {
  if (!body || (body.rating !== "up" && body.rating !== "down")) return null;
  const reason = body.rating === "down" && Object.hasOwn(REASONS, body.reason) ? body.reason : "";
  return {
    day, rating: body.rating, ...(reason && { reason }),
    needs: known(body.needs, (k) => LABELS.has(k), 12),
    picks: known(body.picks, (id) => NAMES.has(id), 15),
    events: known(body.events, (id) => EVENT_IDS.has(id), 6),
  };
}

export function summarize(records) {
  const sum = { total: records.length, helpful: 0, notHelpful: 0, since: "", reasons: {}, needs: {}, inHelpful: {}, inNotHelpful: {} };
  const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
  for (const r of records) {
    const up = r.rating === "up";
    if (up) sum.helpful++; else sum.notHelpful++;
    if (r.reason) bump(sum.reasons, r.reason);
    if (!sum.since || r.day < sum.since) sum.since = r.day;
    for (const k of r.needs || []) {
      sum.needs[k] = sum.needs[k] || { key: k, label: LABELS.get(k) || k, helpful: 0, notHelpful: 0 };
      sum.needs[k][up ? "helpful" : "notHelpful"]++;
    }
    for (const id of r.picks || []) bump(up ? sum.inHelpful : sum.inNotHelpful, id);
  }
  const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 15)
    .map(([id, n]) => ({ id, name: NAMES.get(id) || id, n }));
  return {
    ...sum,
    reasons: Object.fromEntries(Object.entries(sum.reasons).map(([k, n]) => [REASONS[k] || k, n])),
    needs: Object.values(sum.needs).sort((a, b) => b.helpful + b.notHelpful - a.helpful - a.notHelpful).slice(0, 25),
    inHelpful: top(sum.inHelpful),
    inNotHelpful: top(sum.inNotHelpful),
  };
}

export async function handle(req, { store = getStore("ask-feedback"), log = console } = {}) {
  if (req.method === "GET") {
    const code = env("ASK_AI_CODE");
    if (code && new URL(req.url).searchParams.get("code") !== code) return reply(401, { error: "code" });
    const { blobs } = await store.list();
    const keys = blobs.map((b) => b.key).sort().reverse().slice(0, MAX_SUMMED);
    const records = (await Promise.all(keys.map((k) => store.get(k, { type: "json" })))).filter(Boolean);
    return reply(200, summarize(records));
  }
  if (req.method !== "POST") return reply(405, { error: "method" });
  if (!sameSite(req)) return reply(403, { error: "denied" });
  let body;
  try { body = await req.json(); } catch (e) { return reply(400, { error: "bad" }); }
  const rec = record(body, localToday());
  if (!rec) return reply(400, { error: "bad" });
  await store.setJSON(`${rec.day}/${crypto.randomUUID()}`, rec);
  log.log(`ask-feedback ${rec.rating}${rec.reason ? " " + rec.reason : ""}: ${rec.needs.length} needs, ${rec.picks.length} picks`);
  return reply(200, { ok: true });
}

export default (req) => handle(req);

export const config = {
  path: "/api/ask-feedback",
  method: ["GET", "POST"],
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 20 },
};
