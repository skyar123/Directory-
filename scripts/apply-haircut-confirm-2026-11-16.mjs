/* Skylar confirmed the Restoration House haircut clinic is at 81 Academy St (Bryson City), 16 Nov 2026. Run once. */
import { readFileSync, writeFileSync } from "node:fs";
const path = new URL("../data/events.json", import.meta.url);
const f = JSON.parse(readFileSync(path, "utf8"));
const e = f.events.find((x) => x.id === "restoration-house-haircuts-2026-11-17");
if (!e) throw new Error("missing");
e.where = "Restoration House WNC, 81 Academy St, Bryson City";
e.note = "The flyer gives no time; call or stop by to ask.";
e.src += "; address confirmed by Skylar Belt, 16 Nov 2026";
writeFileSync(path, JSON.stringify(f, null, 1) + "\n");
console.log("done");
