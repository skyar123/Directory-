/*
 * Applies the corrections found by reading Skylar's inbox on 2026-08-28.
 * Each patch names the message it came from, so the diff carries its own
 * provenance the same way every other row in data/ does.
 *
 * Run once. Kept in the repo as the record of where these edits came from.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "Email from the organisation, read 2026-08-28";
const path = new URL("../data/point-people.json", import.meta.url);
const file = JSON.parse(readFileSync(path, "utf8"));

const patch = (name, fn) => {
  const p = file.people.find((x) => x.n === name);
  if (!p) throw new Error(`no point person named ${name}`);
  fn(p);
  p.lv = "2026-08-28";
  p.vb = "SB";
  console.log("patched:", name);
};

/* Erica sends from a named address; the directory only had the general inbox,
   which is exactly the "named person beats a general line" problem this list
   exists to solve. Seen on threads dated 2026-08-17 and 2026-08-25. */
patch("Erica Burgess", (p) => {
  p.em = "erica.burgess@ffa-nc.org";
  p.notes = "Go to her first. Texts back fast - five substantive replies in one thread. "
    + "Vouches for Amy Hobson at Eckerd. She emails from erica.burgess@ffa-nc.org directly; "
    + "info@ffa-nc.org is the general inbox. Newsletter and updates come from Gaile Osborne, "
    + "gaile.osborne@ffa-nc.org. Conference registrations also come from Courtney Thompson, "
    + "courtney.thompson@ffa-nc.org.";
  p.src = `${p.src}; direct email ${SRC}`;
});

/* Jasper's own signature gives a fuller name and title, and the 2026-08-12
   notice replaces the support-group schedule the directory still lists. The
   impersonation warning matters before you send a family anywhere. */
patch("Jasper", (p) => {
  p.n = "Jasper Joy (they/he)";
  p.role = "Director of Support Programming; also clothing closet and food distribution";
  p.notes = "jasper@tranzmission.org, @tranzmission_. Trans and nonbinary community org. "
    + "SCHEDULE CHANGED: as of 2 Sept 2026 the groups run on a reduced placeholder schedule "
    + "while Tranzmission is in financial trouble. Transformers meets virtually every Wednesday "
    + "6:30pm and in person the 4th Saturday of the month at 2:30pm. The nonbinary/transfemme "
    + "groups and Trans Table Tops are NOT on the modified schedule, so confirm before "
    + "referring. Tranzmission groups are always free: Jasper warns that another group has been "
    + "confused with theirs and that Tranzmission never asks for a 'suggested donation'. "
    + "Also runs the Talya Mazuz Memorial Food Pantry; pantry news comes from "
    + "willa@tranzmission.org and Wednesday pantry hours were reinstated in Aug 2026.";
  p.src = `${p.src}; schedule and title from Tranzmission notice 2026-08-12, ${SRC}`;
});

writeFileSync(path, JSON.stringify(file, null, 1) + "\n");

/* and record the system-level change where the app already looks for it */
const clPath = new URL("../data/changelog.json", import.meta.url);
const cl = JSON.parse(readFileSync(clPath, "utf8"));
const watch = cl.groups.find((g) => g.id === "watch");
watch.entries.unshift(
  {
    date: "Sep 2 2026",
    what: "Tranzmission support groups drop to a reduced placeholder schedule",
    detail: "Tranzmission is in financial difficulty and running a stewardship campaign. From "
      + "2 September only Transformers runs: virtually every Wednesday 6:30pm, in person the 4th "
      + "Saturday at 2:30pm. The nonbinary/transfemme groups and Trans Table Tops are not on the "
      + "modified schedule. Confirm before referring a family. Tranzmission groups are free and "
      + "never ask for a suggested donation; another group has been mistaken for theirs.",
    source: "Tranzmission notice from Jasper Joy, 12 Aug 2026",
  },
  {
    date: "Aug 2026",
    what: "Talya Mazuz pantry Wednesday hours reinstated",
    detail: "Tranzmission's pantry restored Wednesday hours in August 2026 after a pause. "
      + "Pantry updates come from willa@tranzmission.org.",
    source: "Tranzmission members pantry update, 6 Aug 2026",
  }
);
writeFileSync(clPath, JSON.stringify(cl, null, 1) + "\n");
console.log("changelog: 2 watch entries added");
