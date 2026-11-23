/*
 * Source conflicts settled by web search, 23 Nov 2026 (the review Skylar
 * asked for). Each note below replaces or extends a "sources disagree" note
 * with what the search found; nothing is changed that the search did not
 * settle (Verner's website, UNETE's address, Eblen's address, Bounty & Soul's
 * Fairview venue and the Steady Collective schedule stay flagged). Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const clean = (s) => { if (DASH.test(s)) throw new Error(`dash: ${s.slice(0, 60)}`); return s; };
const path = new URL("../data/resources.json", import.meta.url);
const file = JSON.parse(readFileSync(path, "utf8"));
const get = (id) => { const r = file.resources.find((x) => x.id === id); if (!r) throw new Error(`no row ${id}`); return r; };
const SRC = "conflict checked by web search, 23 Nov 2026 (scripts/apply-conflicts-2026-11-23.mjs)";
const set = (id, must, note, src) => {
  const r = get(id);
  if (!r.note.includes(must)) throw new Error(`${id} note changed`);
  r.note = clean(note);
  r.src = `${r.src.trim()}; ${clean(src)}; ${SRC}`;
};

const MJ = "257 Biltmore Ave is the address in the CDC's and Feed America's listings and the county's own directory; the 154 and 356 Biltmore Ave addresses in some lists look like errors.";
set("wnc-minnie-jones-health-center", "154 and 257", MJ, "CDC GetTested and Feed America listings");
const mj2 = get("wnc-community-health-services-minnie-jones-h");
if (!mj2.note.includes("154 and 257")) throw new Error("Minnie Jones 2 note changed");
mj2.note = MJ;
mj2.src = `${mj2.src.trim()}; CDC GetTested and Feed America listings; ${SRC}`;

set("legal-aid-of-north-carolina", "Morganton office",
  "The Asheville office (20 Artful Way, Suite 210) is home to Legal Aid's statewide Senior Law Project for people 60 and older (877-579-7562), per Legal Aid's own office list. Other cases start with the helpline, 1-866-219-5262; the Public Edition names the Morganton office (211 E Union St, 828-437-8280 or 800-849-5195) as the one that serves Buncombe.",
  "Legal Aid of NC office list (legalaidnc.org/offices)");

const ab = get("abccm-crisis-ministries");
if (!ab.note.includes("1845 Brevard Rd")) throw new Error("ABCCM note changed");
ab.note = clean(`${ab.note} Checked 23 Nov 2026: ABCCM's own Crisis Ministry page gives the South site (10 Buck Shoals Rd, Arden) as 828-684-3872, not 828-259-5302, and Hominy Valley as 828-259-5301; one map listing marks the North site (403 Weaverville Rd) closed; no source was found for 1845 Brevard Rd. Call 828-259-5300 to ask which sites are open before sending anyone.`);
ab.src = `${ab.src.trim()}; ABCCM Crisis Ministry page; ${SRC}`;

set("dolly-parton-s-imagination-library", "sign-up page",
  "Both are right: Buncombe Partnership for Children and Literacy Together brought the program to Buncombe together, and BPFC reported 4,341 children enrolled in 2026. Families can sign up through either (lit-together.org or buncombepfc.org/dpil) or at imaginationlibrary.com.",
  "Spectrum News (Aug 2026) and earlier coverage of the BPFC and Literacy Together partnership");

set("alongside-families", "former name of My Village",
  "Sources disagree, and a web search found only a Charlotte nonprofit by this name (founded 2017) that works to keep children out of unnecessary foster care, with nothing tying it to Asheville. The Drive respite guide calls it the former name of My Village Asheville; the Public Edition describes home visiting for immigrant and refugee families. Check alongsidefamilies.org before referring.",
  "web search for Alongside Families");

writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
console.log("conflict notes updated on 6 rows");
