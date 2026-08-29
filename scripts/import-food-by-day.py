"""
Builds data/food-by-day.json from the workbook's Food - By Day tab.

This is a weekly schedule, not a list of organisations: one site appears once
for every day it serves, and the rows carry no phone or website. Folding it
into resources.json produced near-duplicates of pantries already in the
directory under fuller names ("12 Baskets" against "12 Baskets Cafe"), so it
stays in the shape the workbook gives it and gets its own view. "Where can this
family eat today" is a different question from "who is in the directory".

    python3 scripts/import-food-by-day.py <v19.xlsx>
"""
import json, sys, openpyxl

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
wb = openpyxl.load_workbook(sys.argv[1], read_only=True, data_only=True)

days = {d: [] for d in DAYS}
for row in wb["Food - By Day"].iter_rows(min_row=5, values_only=True):
    c = [("" if x is None else str(x).strip()) for x in row]
    day, place, when, good, lv, vb = (c + [""] * 6)[:6]
    if not place or place == "PANTRY / MEAL SITE" or day not in DAYS:
        continue
    verified = lv.replace("✅", "").strip()
    days[day].append({
        "place": place, "when": when, "goodToKnow": good,
        "lv": "" if "NEVER VERIFIED" in verified.upper() else verified, "vb": vb,
    })

out = {
    "meta": {
        "file": "food-by-day.json",
        "note": "Weekly pantry and free-meal schedule. A site appears on every day it "
                "serves. Most rows are unverified: call before sending a family.",
        "src": "WNC_Family_Resources_SNIFF_v19_Aug2026.xlsx, Food - By Day tab",
    },
    "days": [{"day": d, "sites": days[d]} for d in DAYS if days[d]],
}
json.dump(out, open("data/food-by-day.json", "w"), indent=1, ensure_ascii=False)
open("data/food-by-day.json", "a").write("\n")
print("data/food-by-day.json", {d["day"]: len(d["sites"]) for d in out["days"]})
