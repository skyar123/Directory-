/*
 * What can be told about a program from its own fields, for the filters on
 * Find and the "Open today" badge: open today (from the hours text), free,
 * no ID, walk-in, delivery, Spanish, ages 0-5, evenings or weekends, and
 * whether it is in Buncombe. Nothing here is new data: a row whose hours
 * say nothing about days is simply not "open today".
 */
import { isOutside } from "./shortlist.js";

const DAYS = [
  ["sun", /^sun(day)?s?$/], ["mon", /^mon(day)?s?$/], ["tue", /^tue(s|sday)?s?$/], ["wed", /^wed(s|nesday)?s?$/],
  ["thu", /^thu(r|rs|rsday)?s?$/], ["fri", /^fri(day)?s?$/], ["sat", /^sat(urday)?s?$/],
];
const dayOf = (w) => { const i = DAYS.findIndex(([, re]) => re.test(w)); return i; };
const DAY_WORD = "(sun(?:day)?s?|mon(?:day)?s?|tue(?:s|sday)?s?|wed(?:s|nesday)?s?|thu(?:r|rs|rsday)?s?|fri(?:day)?s?|sat(?:urday)?s?)";
const MONTH = "(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?\\s+\\d";
const ORD = { "1st": 1, first: 1, "2nd": 2, second: 2, "3rd": 3, third: 3, "4th": 4, fourth: 4, "5th": 5, fifth: 5, last: -1 };

/* which week of the month a date is (1-5), and whether it is the last */
const weekOf = (d) => Math.ceil(d.getDate() / 7);
const isLast = (d) => d.getDate() + 7 > new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

/* true when the hours text says the program runs on this date's weekday */
export function openOn(hours, name, date) {
  const today = date.getDay();
  if (DAYS[today][1].test(String(name || "").trim().toLowerCase())) return true;
  const h = String(hours || "").toLowerCase();
  if (!h) return false;
  if (/\b(24\/7|24 hours|daily|every day|7 days|seven days|around the clock)\b/.test(h)) return true;
  if (/\bweekdays?\b/.test(h) && today >= 1 && today <= 5) return true;
  /* ranges: "Mon-Fri", "Tue to Thu", "Monday through Friday" */
  const range = new RegExp(`\\b${DAY_WORD}\\s*(?:-|to|through|thru)\\s*${DAY_WORD}\\b`, "g");
  for (const m of h.matchAll(range)) {
    const a = dayOf(m[1]), b = dayOf(m[2]);
    if (a < 0 || b < 0) continue;
    for (let i = a, n = 0; n < 7; i = (i + 1) % 7, n++) { if (i === today) return true; if (i === b) break; }
  }
  /* single days and lists: "Tue and Thu", "Mon/Wed", "2nd and 4th Tuesdays";
     a dated one-off ("Fri Dec 11") is not a weekly day */
  const one = new RegExp(`((?:(?:1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth|last)(?:,\\s*|\\s+and\\s+|\\s*&\\s*|\\s+))*)\\b${DAY_WORD}\\b(?!\\s*(?:-|to|through|thru)\\s*${DAY_WORD})(?!\\s+${MONTH})`, "g");
  for (const m of h.matchAll(one)) {
    if (dayOf(m[2]) !== today) continue;
    const ords = (m[1].match(/1st|2nd|3rd|4th|5th|first|second|third|fourth|fifth|last/g) || []).map((o) => ORD[o]);
    if (!ords.length) return true;
    if (ords.some((o) => (o === -1 ? isLast(date) : o === weekOf(date)))) return true;
  }
  return false;
}

const has = (re, ...xs) => re.test(xs.join(" "));

/* the filter facts for one program */
export function factsOf(r, date) {
  const tags = r.tags || "";
  const all = `${r.name} ${tags} ${r.detail} ${r.hours}`;
  return {
    today: !/\bclosed\b/i.test(r.name) && openOn(r.hours, r.name, date),
    evening: has(/evening \/ weekend/i, tags),
    free: has(/\bfree\b/i, r.name, tags),
    noid: has(/\bno[- ]id\b|without (an )?id|no questions asked|no intake/i, all),
    walkin: has(/walk-?in/i, tags, r.hours, r.detail),
    spanish: /^[🟢🟡🟠]/u.test(r.spanish || ""),
    kids: has(/kids \/ 0-5/i, tags),
    delivery: has(/mobile \/ delivery|home delivery|delivered to|delivers\b|mobile (market|unit|pantry)/i, all),
    buncombe: !isOutside(r),
  };
}

/* the filters, in the order the panel shows them: [key, label, group] */
export const FACETS = [
  ["today", "Open today", "When"],
  ["evening", "Evenings or weekends", "When"],
  ["free", "Free", "Cost and paperwork"],
  ["noid", "No ID needed", "Cost and paperwork"],
  ["walkin", "Walk-in", "Cost and paperwork"],
  ["spanish", "Spanish spoken", "Who and how"],
  ["kids", "Ages 0-5", "Who and how"],
  ["delivery", "Delivery or mobile", "Who and how"],
  ["buncombe", "In Buncombe only", "Area"],
];
export const FACET_LABEL = Object.fromEntries(FACETS.map(([k, l]) => [k, l]));
