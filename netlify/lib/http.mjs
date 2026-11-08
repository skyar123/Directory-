/* What both Ask AI functions (netlify/functions/ask-ai.mjs and
   ask-feedback.mjs) check and answer with. */

export const env = (k) => (globalThis.Netlify ? globalThis.Netlify.env.get(k) : process.env[k]);
export const reply = (status, body) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

/* The app calls these from its own pages. A page on another site that tries
   to use them from a visitor's browser sends that site's Origin and is
   turned away. (A script outside a browser can fake headers; the rate limits
   and the directory-only prompt are what keep that cheap.) */
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
