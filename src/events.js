/*
 * Dates for the Events tab. An event happens on a calendar day in Asheville,
 * not at an instant, so everything here runs in the browser's local time.
 * TODAY in data.js is a UTC date, which rolls over at 7 or 8pm Eastern and
 * would call tomorrow's event "Today" all evening.
 */

/* "2026-11-12" as local midnight. new Date("2026-11-12") is UTC midnight,
   which is the evening before anywhere west of Greenwich */
export const day = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const localToday = () => {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()]
    .map((n) => String(n).padStart(2, "0")).join("-");
};

const daysBetween = (from, to) => Math.round((day(to) - day(from)) / 86400000);

export const longDate = (iso) =>
  day(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

/* how soon, for the badge: a window already open, today, tomorrow, or a
   count of days for the next two weeks */
export function soon(e, today) {
  if ((e.end || e.date) < today) return "";
  if (e.date < today) return e.kind === "signup" ? "Open now" : "On now";
  const n = daysBetween(today, e.date);
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  return n < 14 ? "In " + n + " days" : "";
}

/* upcoming entries grouped by month, soonest first, with a window that is
   already open counted from today; past entries newest first */
export function arrange(events, today) {
  const from = (e) => (e.date < today ? today : e.date);
  const upcoming = events.filter((e) => (e.end || e.date) >= today)
    .sort((a, b) => from(a).localeCompare(from(b)) || a.date.localeCompare(b.date));
  const past = events.filter((e) => (e.end || e.date) < today)
    .sort((a, b) => (b.end || b.date).localeCompare(a.end || a.date));
  const months = [];
  for (const e of upcoming) {
    const key = from(e).slice(0, 7);
    if (months[months.length - 1]?.key !== key) {
      months.push({
        key, items: [],
        label: day(key + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
    }
    months[months.length - 1].items.push(e);
  }
  return { months, past };
}
