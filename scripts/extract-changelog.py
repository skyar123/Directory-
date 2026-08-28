"""
Pulls the WHAT CHANGED and SYNC CHECK tabs out of the v19 workbook into
data/changelog.json. This content existed only in the spreadsheet -- the app
build dropped it, which meant closed services stayed referrable.
"""
import json, sys, openpyxl

xlsx = sys.argv[1]
wb = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)

SLUG = {
    "DEAD ENDS - DO NOT REFER": "dead-ends",
    "WATCH THESE - SYSTEM CHANGES IN FLIGHT": "watch",
    "ADDED THIS ROUND": "added",
    "STILL OPEN": "open-questions",
}

groups, cur = [], None
for r in wb["WHAT CHANGED"].iter_rows(min_row=5, values_only=True):
    c = [("" if x is None else str(x).strip()) for x in r]
    if c[0] and not c[1] and not c[2]:
        cur = {"id": SLUG.get(c[0], c[0].lower().replace(" ", "-")), "label": c[0], "entries": []}
        groups.append(cur)
    elif (c[0] or c[1]) and cur is not None:
        cur["entries"].append({"date": c[0], "what": c[1], "detail": c[2], "source": c[3]})

conflicts, seen_header = [], False
for r in wb["SYNC CHECK"].iter_rows(min_row=4, values_only=True):
    c = [("" if x is None else str(x).strip()) for x in r]
    if c[0] == "RESOURCE" and c[1] == "FIELD":
        seen_header = True
        continue
    if seen_header and c[0] and c[1]:
        conflicts.append({"resource": c[0], "field": c[1], "tab": c[3],
                          "sectionTabSays": c[4], "masterSays": c[5]})

out = {
    "meta": {
        "file": "changelog.json",
        "note": "Dead ends, changes in flight, and the questions still open. "
                "Check dead-ends before referring anyone.",
        "src": "WNC_Family_Resources_SNIFF_v19_Aug2026.xlsx, WHAT CHANGED + SYNC CHECK tabs",
    },
    "groups": groups,
    "conflicts": conflicts,
}
json.dump(out, open("data/changelog.json", "w"), indent=1, ensure_ascii=False)
print("data/changelog.json", {g["id"]: len(g["entries"]) for g in groups}, "conflicts:", len(conflicts))
