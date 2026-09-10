"""
The workbook marks a row with a target glyph to mean "start here" and a warning
glyph to mean "read the note first". Those are status, not part of the
organisation's name, and rendering them raw in a heading looks like a mistake.
Promote them to fields the UI can present properly.

    python3 scripts/normalise-names.py
"""
import json, re

p = "data/resources.json"
d = json.load(open(p))
start = warn = 0

for r in d["resources"]:
    n = r["n"]
    if n.lstrip().startswith("\U0001F3AF"):          # target
        r["start"] = True
        start += 1
    if re.match(r"^\s*⚠", n):                    # warning sign
        r["readFirst"] = True
        warn += 1
    cleaned = re.sub(r"^[\U0001F3AF⚠️✅⚪\U0001F7E0\U0001F7E1\s]+", "", n).strip()
    if cleaned and cleaned != n:
        r["n"] = cleaned

json.dump(d, open(p, "w"), indent=1, ensure_ascii=False)
open(p, "a").write("\n")
print(f"start-here flagged: {start}, read-first flagged: {warn}")
