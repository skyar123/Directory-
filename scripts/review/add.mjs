/* append web-check findings: node scripts/review/add.mjs '<json array>' */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const f = new URL("./findings-2026-11.json", import.meta.url);
const cur = existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : [];
const add = JSON.parse(process.argv[2]);
for (const x of add) { const i = cur.findIndex((y) => y.id === x.id); if (i >= 0) cur[i] = x; else cur.push(x); }
writeFileSync(f, JSON.stringify(cur, null, 1) + "\n");
console.log("findings:", cur.length);
