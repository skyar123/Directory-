# Exports each data sheet of the Buncombe County Family Resource Directory,
# Public Edition workbook (7 Nov 2026) to JSON: one array of row objects per
# sheet, header row detected in the first eight rows (row 4 in that workbook).
#   python3 scripts/export-public-edition.py <workbook.xlsx> <out.json>
# The importers that read the JSON are scripts/import-public-edition-*.cjs.
import sys, json, openpyxl, datetime
src, out = sys.argv[1], sys.argv[2]
wb = openpyxl.load_workbook(src, data_only=True)
def cell(v):
    if isinstance(v, (datetime.date, datetime.datetime)): return v.isoformat()[:10] if isinstance(v, datetime.datetime) and v.time() == datetime.time() or isinstance(v, datetime.date) and not isinstance(v, datetime.datetime) else v.isoformat()
    if isinstance(v, datetime.time): return v.strftime("%H:%M")
    return v
summary = {}
for ws in wb.worksheets:
    rows = list(ws.iter_rows(values_only=True))
    hdr_i = next((i for i, r in enumerate(rows[:8]) if sum(c is not None for c in r) >= 3 and i >= 2), None)
    if hdr_i is None: continue
    hdr = [str(c).strip() if c is not None else f"col{j}" for j, c in enumerate(rows[hdr_i])]
    recs = []
    for r in rows[hdr_i + 1:]:
        if not any(c is not None and str(c).strip() for c in r): continue
        recs.append({hdr[j]: cell(c) for j, c in enumerate(r) if j < len(hdr) and c is not None})
    summary[ws.title] = recs
json.dump(summary, open(out, "w"), indent=1, ensure_ascii=False, default=str)
for k, v in summary.items(): print(f"{len(v):5}  {k}")
