"""
Recovers resources that live only on the workbook's section tabs.

The app was built from the ALL RESOURCES tab, which the workbook calls the
master. It is not complete: the twelve section tabs and CRISIS NOW carry rows
that never made it across, including 988 and RHA Mobile Crisis.

The catch is that the same organisation appears on several tabs, worded to suit
the question it sits under -- the workbook's own SYNC CHECK counts 236
organisations on two or more tabs. Matching by name alone therefore invents
duplicates, so a row is matched on its phone, email or website too. When it
matches something already here, the row contributes its SNIFF question to that
resource instead of becoming a second copy of it.

    python3 scripts/import-section-tabs.py <v19.xlsx>
"""
import json, re, sys, unicodedata
import openpyxl

XLSX = sys.argv[1]
H = ["status", "name", "point", "resp", "spanish", "phone", "email", "web",
     "detail", "where", "notes", "lv", "vb"]
TABS = {
    "I. Child Development & Early Ed": "I", "II. Child Behavior & Emotions": "II",
    "III. Child Health": "III", "IV. Caregiver Support": "IV",
    "V. Adult Education & Work": "V", "VI. Family Health": "VI",
    "VII. Adult Mental Health": "VII", "VIII. Concrete Needs": "VIII",
    "IX. Autism & Neurodivergence": "IX", "X. OTHER": "X",
    "RESPITE": "RESPITE", "ESPANOL": "ESPANOL",
}
STATUS = ("⚪", "✅", "🟡", "🔵", "⚠")

def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", str(s).lower()).strip()

def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s.lower())).strip("-")[:60]

def clean_date(v):
    v = v.replace("✅", "").strip()
    return "" if "NEVER VERIFIED" in v.upper() else v

def digits(p):
    """first phone number in a field, as bare digits, 10 max"""
    d = re.sub(r"\D", "", re.split(r"[/,;]", str(p))[0])
    return d[-10:] if len(d) >= 10 else ""

def site(w):
    w = re.sub(r"^https?://", "", str(w).strip().lower()).rstrip("/")
    return re.sub(r"^www\.", "", w).split("/")[0]

data = json.load(open("data/resources.json"))
res = data["resources"]
ids = {r["id"] for r in res}

# an organisation is the same organisation if it answers on the same line
by_name, by_phone, by_email, by_web = {}, {}, {}, {}
for r in res:
    by_name.setdefault(norm(r["n"]), r)
    if digits(r["ph"]): by_phone.setdefault(digits(r["ph"]), r)
    if r["em"]: by_email.setdefault(r["em"].strip().lower(), r)
    if site(r["w"]): by_web.setdefault(site(r["w"]), r)

def find(name, phone, email, web):
    return (by_name.get(norm(name))
            or (by_phone.get(digits(phone)) if digits(phone) else None)
            or (by_email.get(email.strip().lower()) if email else None)
            or (by_web.get(site(web)) if site(web) else None))

def register(r):
    res.append(r)
    ids.add(r["id"])
    by_name.setdefault(norm(r["n"]), r)
    if digits(r["ph"]): by_phone.setdefault(digits(r["ph"]), r)
    if r["em"]: by_email.setdefault(r["em"].strip().lower(), r)
    if site(r["w"]): by_web.setdefault(site(r["w"]), r)

def new_id(name):
    rid = slug(name) or "row"
    while rid in ids:
        rid += "-2"
    return rid

needs = json.load(open("data/sniff.json"))["needs"]
codes = {}
for n in needs:
    codes.setdefault(n["section"], {})[n["code"]] = n["key"]

wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
added, enriched = [], 0

for tab, sec in TABS.items():
    need = ""
    for row in wb[tab].iter_rows(min_row=5, values_only=True):
        c = [("" if x is None else str(x).strip()) for x in row]
        d = dict(zip(H, (c + [""] * 13)[:13]))

        if d["status"] and not d["name"] and not d["status"].startswith(STATUS):
            m = re.match(r"^(?:[IVX]+\.)?\s*(\d+[a-z]?)[.\s]", d["status"])
            need = codes.get(sec, {}).get(m.group(1), "") if m else ""
            continue
        if not d["name"] or not d["status"].startswith(STATUS):
            continue
        if not (d["phone"] or d["email"] or d["web"]):
            continue  # a signpost row with nothing to call

        name = re.sub(r"^[🎯✅⚠️⚪🟠🟡\s]+", "", d["name"]).strip()
        phone = re.sub(r"^tel:\+?1?", "", d["phone"]).strip()
        if re.fullmatch(r"\d{10}", phone):
            phone = f"{phone[:3]}-{phone[3:6]}-{phone[6:]}"
        email = re.sub(r"^mailto:", "", d["email"]).strip()

        hit = find(name, phone, email, d["web"])
        if hit:
            # same organisation, different question: keep the entry, take the link
            for k in (f"{sec}:*", need):
                if k and k not in hit["needs"]:
                    hit["needs"].append(k)
                    enriched += 1
            continue

        r = {
            "id": new_id(name), "n": name, "pp": d["point"], "sp": d["spanish"], "spd": "",
            "ph": phone, "em": email, "w": d["web"], "d": d["detail"],
            "a": d["where"], "h": "", "os": tab, "t": "",
            "lv": clean_date(d["lv"]), "vb": d["vb"], "sec": sec,
            "needs": [f"{sec}:*"] + ([need] if need else []),
            "src": f"WNC_Family_Resources_SNIFF_v19_Aug2026.xlsx, {tab} tab",
            "note": d["notes"], "new": True,
        }
        register(r)
        added.append(r)

# CRISIS NOW
for row in wb["CRISIS NOW"].iter_rows(min_row=4, values_only=True):
    c = [("" if x is None else str(x).strip()) for x in row]
    number, who, when, what, lv, vb = (c + [""] * 6)[:6]
    if not number or number == "CALL / TEXT" or not who:
        continue
    if find(who, number, "", ""):
        continue
    r = {
        "id": new_id(who), "n": who, "pp": "", "sp": "", "spd": "",
        "ph": number, "em": "", "w": "", "d": what, "a": "", "h": when,
        "os": "CRISIS NOW", "t": "Crisis, 24/7", "lv": clean_date(lv), "vb": vb,
        "sec": "CRISIS", "needs": ["CRISIS:*"],
        "src": "WNC_Family_Resources_SNIFF_v19_Aug2026.xlsx, CRISIS NOW tab",
        "note": "", "new": True,
    }
    register(r)
    added.append(r)

data["meta"]["count"] = len(res)
json.dump(data, open("data/resources.json", "w"), indent=1, ensure_ascii=False)
open("data/resources.json", "a").write("\n")

print(f"new resources: {len(added)}")
print(f"existing resources given a question or hours they were missing: {enriched}")
for a in added:
    print(f"  [{a['sec']:7}] {a['n'][:56]:56} {a['ph'][:16]}")
