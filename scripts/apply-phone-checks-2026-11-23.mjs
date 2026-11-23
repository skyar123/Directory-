/*
 * Phone checks on the home screen's go-to programs, 23 Nov 2026. Buncombe DSS's
 * 828-250-5500 is the main line in the NC DHHS county directory. Code Purple's
 * recorded message, 828-398-6011, is confirmed by the City of Asheville for an
 * earlier season; no 2026-27 announcement was found. Run once.
 */
import { readFileSync, writeFileSync } from "node:fs";
const path = new URL("../data/resources.json", import.meta.url);
const file = JSON.parse(readFileSync(path, "utf8"));
const get = (id) => file.resources.find((x) => x.id === id);
const dss = get("buncombe-dss");
if (!dss.ph.startsWith("828-250-5500")) throw new Error("DSS phone changed");
dss.src = `${dss.src.trim()}; 828-250-5500 confirmed as the main line by the NC DHHS county directory, via web search 23 Nov 2026`;
const cp = get("code-purple");
if (!cp.ph.startsWith("828-398-6011")) throw new Error("Code Purple phone changed");
cp.note = `${(cp.note || "").trim()} The City of Asheville gave 828-398-6011 as the recorded message for an earlier season; no 2026-27 announcement was found on 23 Nov 2026, so if it does not answer, call 211.`.trim();
cp.src = `${cp.src.trim()}; recorded-message number checked against City of Asheville posts, via web search 23 Nov 2026`;
writeFileSync(path, JSON.stringify(file, null, 1) + "\n");
console.log("phone checks noted");
