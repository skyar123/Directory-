/*
 * Changelog entry for the finished web check of every listing, 23 Nov 2026.
 * Run once. The listing changes themselves were applied by
 * scripts/review/apply.mjs from scripts/review/findings-2026-11.json; this
 * only tells staff what changed and where to read the rest.
 */
import { readFileSync, writeFileSync } from "node:fs";

const clPath = new URL("../data/changelog.json", import.meta.url);
const cl = JSON.parse(readFileSync(clPath, "utf8"));
const entry = {
  date: "Nov 23 2026",
  what: "Every listing checked against the web",
  detail: "Every listing with a phone, address, hours or website that had not been checked this month was web-checked (323 in all). "
    + "88 matched what is online. 148 partly matched, and each now has a note saying what differs or could not be confirmed, "
    + "so look for that note before giving a number out. 19 were corrected, including: Trans Lifeline is no longer 24/7 "
    + "(Mon-Fri 1-9pm Eastern); the Jewish Family Services row carried Catholic Charities' phone; Open Path has no phone line "
    + "and costs $65 to join; Legal Aid's Senior Law Project has its own helpline, 1-877-579-7562; the Family Resource Center "
    + "at Emma is at 37 Brickyard Rd; and Campfire Community School, the dads' group and other rows with passed dates were "
    + "updated. 21 could not be found online and say so. WNCCHS is not taking new routine dental patients (urgent slots only). "
    + "The full log is docs/review-2026-11.md.",
  source: "scripts/review/findings-2026-11.json, scripts/review/apply.mjs, docs/review-2026-11.md",
};
if (/[–—]/.test(JSON.stringify(entry))) throw new Error("dash in changelog entry");
const added = cl.groups.find((g) => g.id === "added");
if (added.entries.some((e) => e.what === entry.what)) throw new Error("entry already added");
added.entries.unshift(entry);
writeFileSync(clPath, JSON.stringify(cl, null, 1) + "\n");
console.log("changelog entry added");
