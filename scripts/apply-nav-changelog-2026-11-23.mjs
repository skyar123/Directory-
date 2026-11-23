/* What changed: the navigation redesign of 23 Nov 2026. Run once. */
import { readFileSync, writeFileSync } from "node:fs";
const path = new URL("../data/changelog.json", import.meta.url);
const cl = JSON.parse(readFileSync(path, "utf8"));
const entry = {
  date: "Nov 23 2026",
  what: "Easier to get around: four places, filters, grouped results, a page for each program",
  detail: "The app now has four places, the same on a phone and a computer: Find, Today (food open today and the "
    + "week's events), Plan and More (SNIFF questions, the assessment, point people and upkeep). Find has a Filters "
    + "button (open today, evenings or weekends, free, no ID, walk-in, Spanish, ages 0-5, delivery, Buncombe only, "
    + "SNIFF section, needs work), each with how many it leaves, and quick Open today, Free and Spanish buttons. A broad "
    + "search is grouped by need with the best few first and See all. Cards show the name, one line about the program "
    + "and the phone; tap for the rest. Each program has its own page and link, programs can be saved, and Find lists "
    + "saved and recently opened ones. The address bar follows you, so Back steps back through searches and a search "
    + "or a program can be shared with a teammate.",
  source: "src/App.jsx, src/facets.js, src/components/FilterSheet.jsx, TodayView.jsx, MoreView.jsx",
};
if (/[–—]/.test(JSON.stringify(entry))) throw new Error("dash");
cl.groups.find((g) => g.id === "added").entries.unshift(entry);
writeFileSync(path, JSON.stringify(cl, null, 1) + "\n");
