/*
 * Nationwide Emergency Alert System test, 2026-11-17.
 *
 * Source: FCC Public Notice DA 26-989, released 16 Sep 2026 ("Public Safety
 * and Homeland Security Bureau announces nationwide test of the Emergency
 * Alert System (EAS) on November 17, 2026"), page 1 of 4, shared by Skylar
 * Belt 17 Nov 2026. Only what page 1 says is used: the time, the backup date,
 * the English and Spanish message, and that EAS reaches radio, TV, cable and
 * satellite. It does not say whether phones get it, so the entry does not
 * either. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";

const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const load = (f) => {
  const path = new URL(`../data/${f}`, import.meta.url);
  return { path, file: JSON.parse(readFileSync(path, "utf8")) };
};
const save = ({ path, file }) => writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
const clean = (v) => { if (DASH.test(JSON.stringify(v))) throw new Error("dash in text"); return v; };
const SRC = "FCC Public Notice DA 26-989, released 16 Sep 2026 (page 1), shared by Skylar Belt 17 Nov 2026";

const ev = load("events.json");
const e = {
  id: "eas-nationwide-test-2026-11-17", date: "2026-11-17", time: "2:20pm",
  kind: "event",
  what: "Nationwide emergency alert test on TV and radio, 2:20pm (only a test)",
  detail: "FEMA and the FCC test the Emergency Alert System at 2:20pm Eastern on radio, TV, cable and satellite, in "
    + "English and Spanish. The message says: \"This is a nationwide test of the Emergency Alert System, issued by the "
    + "Federal Emergency Management Agency, covering the United States from 2:20 to 2:50 hours ET. This is only a test. "
    + "No action is required by the public.\" If it has to be moved, it will run on December 3, 2026.",
  note: "A heads-up can help families for whom a sudden alarm brings back Helene or another emergency.",
  where: "Nationwide (radio, TV, cable and satellite)", ph: "", w: "fcc.gov", tags: ["Free"],
  src: SRC,
};
if (ev.file.events.some((x) => x.id === e.id)) throw new Error("exists");
ev.file.events.push(clean(e));
save(ev);

const cl = load("changelog.json");
cl.file.groups.find((g) => g.id === "added").entries.unshift(clean({
  date: "Nov 17 2026",
  what: "Nationwide emergency alert test today at 2:20pm",
  detail: "Events has the FCC's nationwide Emergency Alert System test on radio and TV, 2:20pm Eastern on November 17 "
    + "(backup date December 3), with the exact English message, so staff can warn families that it is only a test.",
  source: "scripts/apply-eas-test-2026-11-17.mjs",
}));
save(cl);
console.log("added the EAS test event");
